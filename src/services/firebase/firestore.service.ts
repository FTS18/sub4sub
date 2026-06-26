import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  increment,
  runTransaction,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { AppUser, Campaign, CampaignFormValues, ECONOMY } from '../../types';

// ─── User Operations ─────────────────────────────────────────────────────────

export const upsertUser = async (user: AppUser): Promise<void> => {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { ...user, createdAt: Date.now() });
  }
};

export const fetchUser = async (uid: string): Promise<AppUser | null> => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as AppUser) : null;
};

export const addCoins = async (uid: string, amount: number): Promise<void> => {
  await updateDoc(doc(db, 'users', uid), { coins: increment(amount) });
};

export const deductCoins = async (uid: string, amount: number): Promise<void> => {
  await updateDoc(doc(db, 'users', uid), { coins: increment(-amount) });
};

// ─── Daily Check-In ──────────────────────────────────────────────────────────

/**
 * Attempts to award the daily check-in bonus.
 * Returns { awarded: true, newStreak } if successful, { awarded: false } if already claimed.
 */
export const claimDailyCheckIn = async (
  uid: string
): Promise<{ awarded: boolean; newStreak: number; coinsAwarded: number }> => {
  const ref = doc(db, 'checkins', uid);
  const snap = await getDoc(ref);
  const now = Date.now();
  const todayStart = new Date().setHours(0, 0, 0, 0);

  if (snap.exists()) {
    const { lastClaimedAt, streak } = snap.data() as {
      lastClaimedAt: number;
      streak: number;
    };

    // Already claimed today
    if (lastClaimedAt >= todayStart) {
      return { awarded: false, newStreak: streak, coinsAwarded: 0 };
    }

    // Check if streak continues (claimed yesterday)
    const yesterdayStart = todayStart - 86400000;
    const isConsecutive = lastClaimedAt >= yesterdayStart;
    const newStreak = isConsecutive ? streak + 1 : 1;

    await updateDoc(ref, { lastClaimedAt: now, streak: newStreak });
    await addCoins(uid, ECONOMY.DAILY_CHECKIN_BONUS);
    return { awarded: true, newStreak, coinsAwarded: ECONOMY.DAILY_CHECKIN_BONUS };
  }

  // First ever check-in
  await setDoc(ref, { lastClaimedAt: now, streak: 1, uid });
  await addCoins(uid, ECONOMY.DAILY_CHECKIN_BONUS);
  return { awarded: true, newStreak: 1, coinsAwarded: ECONOMY.DAILY_CHECKIN_BONUS };
};

export const fetchCheckInData = async (
  uid: string
): Promise<{ streak: number; lastClaimedAt: number; claimedToday: boolean }> => {
  const snap = await getDoc(doc(db, 'checkins', uid));
  if (!snap.exists()) return { streak: 0, lastClaimedAt: 0, claimedToday: false };

  const data = snap.data() as { streak: number; lastClaimedAt: number };
  const todayStart = new Date().setHours(0, 0, 0, 0);
  return {
    ...data,
    claimedToday: data.lastClaimedAt >= todayStart,
  };
};

// ─── Campaign Operations ──────────────────────────────────────────────────────

const COST_MAP: Record<string, number> = {
  views: ECONOMY.COST_PER_VIEW,
  likes: ECONOMY.COST_PER_LIKE,
  subscribers: ECONOMY.COST_PER_SUBSCRIBER,
};

/**
 * Creates campaign AND deducts coins atomically in a transaction.
 * Throws if user has insufficient coins.
 */
export const createCampaign = async (
  ownerId: string,
  values: CampaignFormValues,
  videoTitle: string,
  thumbnailUrl: string
): Promise<string> => {
  const costPerAction = COST_MAP[values.type];
  const totalCost = Math.floor(
    costPerAction * values.targetCount * (1 + ECONOMY.APP_TAX_PERCENT)
  );
  const videoId = extractYouTubeId(values.videoUrl);

  let campaignId = '';

  await runTransaction(db, async (tx) => {
    const userRef = doc(db, 'users', ownerId);
    const userSnap = await tx.get(userRef);

    if (!userSnap.exists()) throw new Error('User not found');

    const user = userSnap.data() as AppUser;
    if (user.coins < totalCost) {
      throw new Error(`Insufficient coins. Need ${totalCost}, have ${user.coins}.`);
    }

    const campaignRef = doc(collection(db, 'campaigns'));
    campaignId = campaignRef.id;

    tx.set(campaignRef, {
      ownerId,
      videoId,
      videoTitle,
      thumbnailUrl,
      type: values.type,
      targetCount: values.targetCount,
      currentCount: 0,
      watchDurationSeconds: values.watchDurationSeconds,
      coinCostPerAction: costPerAction,
      totalCoinsSpent: totalCost,
      status: 'active',
      createdAt: Date.now(),
    });

    tx.update(userRef, { coins: increment(-totalCost) });
  });

  return campaignId;
};

/**
 * Records that user watched a campaign video and awards coins.
 * Atomically: increments campaign currentCount + adds coins to watcher.
 * Completes campaign if targetCount reached.
 */
export const recordEarnedView = async (
  watcherUid: string,
  campaignId: string
): Promise<void> => {
  await runTransaction(db, async (tx) => {
    const campaignRef = doc(db, 'campaigns', campaignId);
    const campaignSnap = await tx.get(campaignRef);

    if (!campaignSnap.exists()) throw new Error('Campaign not found');

    const campaign = campaignSnap.data() as Campaign;
    const newCount = campaign.currentCount + 1;
    const isComplete = newCount >= campaign.targetCount;

    tx.update(campaignRef, {
      currentCount: newCount,
      status: isComplete ? 'completed' : 'active',
    });

    const watcherRef = doc(db, 'users', watcherUid);
    tx.update(watcherRef, { coins: increment(ECONOMY.COINS_PER_VIEW) });
  });
};

export const updateCampaignStatus = async (
  campaignId: string,
  status: 'active' | 'paused'
): Promise<void> => {
  await updateDoc(doc(db, 'campaigns', campaignId), { status });
};

export const fetchActiveCampaignsForEarn = async (
  excludeOwnerId: string
): Promise<Campaign[]> => {
  const q = query(
    collection(db, 'campaigns'),
    where('status', '==', 'active'),
    where('ownerId', '!=', excludeOwnerId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Campaign));
};

export const fetchUserCampaigns = async (ownerId: string): Promise<Campaign[]> => {
  const q = query(collection(db, 'campaigns'), where('ownerId', '==', ownerId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Campaign));
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const extractYouTubeId = (url: string): string => {
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : '';
};
