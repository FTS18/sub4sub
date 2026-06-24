export type CampaignType = 'views' | 'likes' | 'subscribers';

export type CampaignStatus = 'active' | 'paused' | 'completed';

export interface Campaign {
  id: string;
  ownerId: string;
  videoId: string;        // YouTube video ID
  videoTitle: string;
  thumbnailUrl: string;
  type: CampaignType;
  targetCount: number;
  currentCount: number;
  watchDurationSeconds: number;
  coinCostPerAction: number;
  totalCoinsSpent: number;
  status: CampaignStatus;
  createdAt: number;
}

export interface CampaignFormValues {
  videoUrl: string;
  type: CampaignType;
  targetCount: number;
  watchDurationSeconds: number;
}
