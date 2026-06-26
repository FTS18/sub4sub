import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  AppState,
  TouchableOpacity,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import {
  AppText,
  Card,
  PrimaryButton,
  CoinDisplay,
  Badge,
  Skeleton,
  Toast,
} from '../../src/components/ui';
import { Colors, Spacing, Radius, BorderWidth } from '../../src/constants';
import { ECONOMY, Campaign } from '../../src/types';
import { useAuthStore } from '../../src/stores/auth.store';
import {
  fetchActiveCampaignsForEarn,
  recordEarnedView,
  addCoins,
} from '../../src/services/firebase/firestore.service';
import { showRewardedAd } from '../../src/services/admob.service';
import { useToast } from '../../src/hooks/useToast';

export default function EarnScreen() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [isAdLoading, setIsAdLoading] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playerRef = useRef<any>(null);

  const { toast, showToast, hideToast } = useToast();

  const currentCampaign = campaigns[currentIndex] ?? null;

  // Load campaigns
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const data = await fetchActiveCampaignsForEarn(user.uid);
        setCampaigns(data);
        if (data.length > 0) setTimeLeft(data[0].watchDurationSeconds);
      } catch {
        showToast('Failed to load videos. Please retry.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (isTimerRunning || claimed) return;
    setIsTimerRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [isTimerRunning, claimed, clearTimer]);

  const pauseTimer = useCallback(() => {
    setIsTimerRunning(false);
    clearTimer();
  }, [clearTimer]);

  // Anti-cheat: pause timer when app goes to background
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        pauseTimer();
        playerRef.current?.pauseVideo?.();
      }
    });
    return () => {
      sub.remove();
      clearTimer();
    };
  }, [pauseTimer, clearTimer]);

  // Sync timer with YouTube player state
  const onPlayerStateChange = useCallback(
    (state: string) => {
      if (state === 'playing') startTimer();
      else pauseTimer();
    },
    [startTimer, pauseTimer]
  );

  const handleClaim = useCallback(async () => {
    if (timeLeft > 0 || claimed || !user || !currentCampaign) return;
    try {
      await recordEarnedView(user.uid, currentCampaign.id);
      setClaimed(true);
      // Update local coin count for instant UI feedback
      setUser({ ...user, coins: user.coins + ECONOMY.COINS_PER_VIEW });
      showToast(`+${ECONOMY.COINS_PER_VIEW} coins earned!`, 'success');
    } catch (e: any) {
      showToast(e.message ?? 'Failed to claim. Try again.', 'error');
    }
  }, [timeLeft, claimed, user, currentCampaign, setUser]);

  const handleNext = useCallback(() => {
    const next = currentIndex + 1;
    if (next >= campaigns.length) {
      showToast('No more videos right now. Come back later!', 'info');
      return;
    }
    setCurrentIndex(next);
    setTimeLeft(campaigns[next].watchDurationSeconds);
    setClaimed(false);
    setIsTimerRunning(false);
    clearTimer();
  }, [currentIndex, campaigns, clearTimer]);

  const handleWatchAd = useCallback(async () => {
    setIsAdLoading(true);
    try {
      const earned = await showRewardedAd(ECONOMY.COINS_PER_AD_WATCH);
      if (earned > 0 && user) {
        await addCoins(user.uid, earned);
        setUser({ ...user, coins: user.coins + earned });
        showToast(`+${earned} bonus coins for watching an ad!`, 'success');
      } else {
        showToast('Ad skipped — no coins awarded.', 'info');
      }
    } catch {
      showToast('Failed to load ad. Try again.', 'error');
    } finally {
      setIsAdLoading(false);
    }
  }, [user, setUser]);

  const progress = currentCampaign
    ? 1 - timeLeft / currentCampaign.watchDurationSeconds
    : 0;
  const canClaim = timeLeft === 0 && !claimed;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <AppText size="xl" weight="extraBold">Earn Coins</AppText>
          <View style={styles.coinPill}>
            <AppText size="sm" weight="bold">
              © {(user?.coins ?? 0).toLocaleString()}
            </AppText>
          </View>
        </View>

        {/* Video Player */}
        <Card accent="white" bordered style={styles.playerCard}>
          {isLoading ? (
            <>
              <Skeleton height={190} borderRadius={Radius.lg} />
              <Skeleton width="60%" height={16} style={{ marginTop: Spacing.sm }} />
              <Skeleton width="40%" height={12} />
            </>
          ) : !currentCampaign ? (
            <View style={styles.noCampaigns}>
              <AppText size="sm" weight="medium" color="textSecondary">
                No more videos right now.{'\n'}Come back later!
              </AppText>
            </View>
          ) : (
            <>
              <YoutubePlayer
                ref={playerRef}
                height={190}
                videoId={currentCampaign.videoId}
                onChangeState={onPlayerStateChange}
                webViewStyle={{ borderRadius: Radius.lg }}
              />
              <View style={styles.videoMeta}>
                <Badge label={currentCampaign.type} variant="powderBlue" />
                <AppText
                  size="sm"
                  weight="semiBold"
                  numberOfLines={2}
                  style={{ marginTop: Spacing.sm }}
                >
                  {currentCampaign.videoTitle}
                </AppText>
                <AppText size="xs" color="textSecondary">
                  Watch for {currentCampaign.watchDurationSeconds} seconds to earn coins
                </AppText>
              </View>
            </>
          )}
        </Card>

        {/* Timer Card */}
        {currentCampaign && (
          <Card accent="terracotta" style={styles.timerCard}>
            <View style={styles.timerRow}>
              <View>
                <AppText size="xs" weight="medium" onDark style={{ opacity: 0.8 }}>
                  Time Remaining
                </AppText>
                <AppText size="3xl" weight="extraBold" onDark>
                  {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:
                  {String(timeLeft % 60).padStart(2, '0')}
                </AppText>
              </View>
              <View style={styles.rewardBox}>
                <AppText size="xs" weight="medium" onDark style={{ opacity: 0.8 }}>
                  Coins Reward
                </AppText>
                <AppText size="xl" weight="extraBold" onDark>
                  +{ECONOMY.COINS_PER_VIEW}
                </AppText>
              </View>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <AppText size="xs" onDark style={{ opacity: 0.65, marginTop: 2 }}>
              {isTimerRunning
                ? 'Timer is running — keep watching'
                : timeLeft === 0
                ? 'Claim your reward!'
                : 'Play video to start timer'}
            </AppText>
          </Card>
        )}

        {/* Claim / Next Controls */}
        {currentCampaign && (
          <View style={styles.controls}>
            {!claimed ? (
              <PrimaryButton
                label={canClaim ? `Claim Reward (+${ECONOMY.COINS_PER_VIEW} Coins)` : 'Watch to Earn'}
                onPress={handleClaim}
                disabled={!canClaim}
                fullWidth
              />
            ) : (
              <PrimaryButton
                label="Watch Next Video"
                onPress={handleNext}
                variant="secondary"
                fullWidth
              />
            )}
          </View>
        )}

        {/* Bonus Ad Card */}
        <Card accent="butter" bordered style={styles.bonusCard}>
          <View style={styles.bonusRow}>
            <View>
              <AppText size="sm" weight="extraBold">Watch an Ad</AppText>
              <AppText size="xs" color="textSecondary" style={{ marginTop: 2 }}>
                Earn a quick {ECONOMY.COINS_PER_AD_WATCH} coins
              </AppText>
            </View>
            <TouchableOpacity
              style={[styles.adBtn, isAdLoading && { opacity: 0.5 }]}
              onPress={handleWatchAd}
              disabled={isAdLoading}
            >
              <AppText size="sm" weight="bold" onDark>
                {isAdLoading ? '...' : `+${ECONOMY.COINS_PER_AD_WATCH}`}
              </AppText>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.canvas },
  scroll: { flex: 1 },
  content: { padding: Spacing.base, gap: Spacing.md, paddingBottom: Spacing['3xl'] },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  coinPill: {
    borderRadius: Radius.full,
    borderWidth: BorderWidth.thin,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  playerCard: { gap: Spacing.md },
  videoMeta: { gap: 4 },
  noCampaigns: {
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  timerCard: { paddingVertical: Spacing.lg, gap: Spacing.md },
  timerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rewardBox: {
    backgroundColor: 'rgba(26,26,26,0.12)',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  progressTrack: {
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(26,26,26,0.2)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.charcoal,
    borderRadius: Radius.full,
  },
  controls: { gap: Spacing.md },
  bonusCard: {},
  bonusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  adBtn: {
    backgroundColor: Colors.charcoal,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
});
