/**
 * AdMob Service (Web / Fallback)
 * react-native-google-mobile-ads cannot be imported on web because it uses native code.
 * This file acts as the safe dummy implementation for web browser testing.
 * Native devices will automatically load admob.service.native.ts instead.
 */

export const AD_UNITS = {
  BANNER: '',
  INTERSTITIAL: '',
  REWARDED: '',
};

export const showInterstitialAd = async (): Promise<void> => {
  console.log('[AdMob Web] Interstitial ad skipped on web.');
};

export const showRewardedAd = async (coinsReward: number): Promise<number> => {
  console.log('[AdMob Web] Rewarded ad skipped on web. Granting free test coins!');
  return coinsReward; // Grant the reward automatically for web UI testing
};
