// This file is used on the Web platform to avoid importing react-native-purchases
// which currently crashes the Metro web bundler due to missing internal references.

export const initializeRevenueCat = async () => {
  console.log('[RevenueCat Web] Skipped initialization on web platform.');
};

export const fetchOfferings = async () => {
  console.log('[RevenueCat Web] Mock offerings for web.');
  return null;
};

export const purchasePackage = async (pkg: any) => {
  console.log('[RevenueCat Web] Mock purchase on web for package:', pkg);
  return true; // Simulate success
};
