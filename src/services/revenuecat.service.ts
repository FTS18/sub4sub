import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';

const API_KEYS = {
  apple: 'appl_YOUR_APPLE_API_KEY_HERE',
  google: 'goog_YOUR_GOOGLE_API_KEY_HERE',
};

export const initializeRevenueCat = async () => {
  if (Platform.OS === 'web') {
    console.log('[RevenueCat] Skipped initialization on web platform.');
    return;
  }
  
  try {
    if (Platform.OS === 'ios') {
      Purchases.configure({ apiKey: API_KEYS.apple });
    } else if (Platform.OS === 'android') {
      Purchases.configure({ apiKey: API_KEYS.google });
    }
  } catch (error) {
    console.error('Error initializing RevenueCat:', error);
  }
};

export const fetchOfferings = async () => {
  if (Platform.OS === 'web') return null;
  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
      return offerings.current.availablePackages;
    }
  } catch (e) {
    console.error('Error fetching offerings:', e);
  }
  return null;
};

export const purchasePackage = async (pkg: PurchasesPackage) => {
  if (Platform.OS === 'web') {
    console.log('[RevenueCat] Mock purchase on web.');
    return true; // Simulate success on web
  }
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    // You can check customerInfo to verify entitlements
    return true;
  } catch (e: any) {
    if (!e.userCancelled) {
      console.error('Purchase error:', e);
    }
    return false;
  }
};
