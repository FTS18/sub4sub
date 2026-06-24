export interface EarnTransaction {
  id: string;
  userId: string;
  campaignId: string;
  coinsEarned: number;
  earnedAt: number;
}

export interface CoinPackage {
  id: string;
  label: string;
  coins: number;
  priceUsd: number;
  accentColor: string;
}

export const COIN_PACKAGES: CoinPackage[] = [
  { id: 'starter', label: 'Starter', coins: 2000, priceUsd: 0.99, accentColor: '#A8C5E7' },
  { id: 'pro', label: 'Pro', coins: 6000, priceUsd: 2.49, accentColor: '#A3D1C6' },
  { id: 'elite', label: 'Elite', coins: 15000, priceUsd: 4.99, accentColor: '#F7DC6F' },
];

// Economy constants — single source of truth
export const ECONOMY = {
  COINS_PER_VIEW: 50,
  COINS_PER_AD_WATCH: 300,
  DAILY_CHECKIN_BONUS: 100,
  COST_PER_VIEW: 100,
  COST_PER_LIKE: 75,
  COST_PER_SUBSCRIBER: 200,
  APP_TAX_PERCENT: 0.1, // 10% platform fee
} as const;
