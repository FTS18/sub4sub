/**
 * AdMob Service — wraps react-native-google-mobile-ads.
 * Uses TEST ad unit IDs in development.
 * IMPORTANT:  Replace TEST IDs with your real AdMob unit IDs before publishing.
 *
 * Note: AdMob requires a Development Build (EAS Build) to function.
 * In Expo Go, all ad calls are no-ops that log a warning instead of crashing.
 */

// Test IDs (Google's official test ad units)
const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';
const TEST_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712';
const TEST_REWARDED_ID = 'ca-app-pub-3940256099942544/5224354917';

// Replace with your actual IDs in production
export const AD_UNITS = {
  BANNER: __DEV__ ? TEST_BANNER_ID : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  INTERSTITIAL: __DEV__ ? TEST_INTERSTITIAL_ID : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  REWARDED: __DEV__ ? TEST_REWARDED_ID : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
};

let InterstitialAd: any = null;
let RewardedAd: any = null;
let AdEventType: any = null;
let RewardedAdEventType: any = null;
let isAdMobAvailable = false;

// Lazy-load AdMob — won't crash in Expo Go
try {
  const admob = require('react-native-google-mobile-ads');
  InterstitialAd = admob.InterstitialAd;
  RewardedAd = admob.RewardedAd;
  AdEventType = admob.AdEventType;
  RewardedAdEventType = admob.RewardedAdEventType;
  isAdMobAvailable = true;
} catch {
  console.warn('[AdMob] react-native-google-mobile-ads not available. Using no-op fallback.');
}

/**
 * Shows an interstitial ad. Resolves when ad closes or is unavailable.
 */
export const showInterstitialAd = (): Promise<void> => {
  return new Promise((resolve) => {
    if (!isAdMobAvailable || !InterstitialAd) {
      console.warn('[AdMob] Interstitial ad not available (Expo Go or not configured).');
      resolve();
      return;
    }

    const ad = InterstitialAd.createForAdRequest(AD_UNITS.INTERSTITIAL, {
      requestNonPersonalizedAdsOnly: false,
    });

    const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      unsubscribeClosed();
      resolve();
    });

    const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, () => {
      unsubscribeError();
      resolve();
    });

    ad.addAdEventListener(AdEventType.LOADED, () => {
      ad.show();
    });

    ad.load();
  });
};

/**
 * Shows a rewarded ad. Resolves with earned coins (0 if skipped/unavailable).
 */
export const showRewardedAd = (coinsReward: number): Promise<number> => {
  return new Promise((resolve) => {
    if (!isAdMobAvailable || !RewardedAd) {
      console.warn('[AdMob] Rewarded ad not available (Expo Go or not configured).');
      resolve(0);
      return;
    }

    const ad = RewardedAd.createForAdRequest(AD_UNITS.REWARDED, {
      requestNonPersonalizedAdsOnly: false,
    });

    let rewarded = false;

    ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      rewarded = true;
    });

    ad.addAdEventListener(AdEventType.CLOSED, () => {
      resolve(rewarded ? coinsReward : 0);
    });

    ad.addAdEventListener(AdEventType.ERROR, () => {
      resolve(0);
    });

    ad.addAdEventListener(AdEventType.LOADED, () => {
      ad.show();
    });

    ad.load();
  });
};
