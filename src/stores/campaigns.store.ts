import { create } from 'zustand';
import { Campaign } from '../types';

interface CampaignsState {
  campaigns: Campaign[];
  isLoading: boolean;
  setCampaigns: (campaigns: Campaign[]) => void;
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, patch: Partial<Campaign>) => void;
  setLoading: (loading: boolean) => void;
}

/**
 * Campaigns store — manages campaign list state.
 */
export const useCampaignsStore = create<CampaignsState>((set) => ({
  campaigns: [],
  isLoading: false,

  setCampaigns: (campaigns) => set({ campaigns }),

  addCampaign: (campaign) =>
    set((state) => ({ campaigns: [campaign, ...state.campaigns] })),

  updateCampaign: (id, patch) =>
    set((state) => ({
      campaigns: state.campaigns.map((c) =>
        c.id === id ? { ...c, ...patch } : c
      ),
    })),

  setLoading: (isLoading) => set({ isLoading }),
}));

export const selectCampaigns = (s: CampaignsState) => s.campaigns;
export const selectActiveCampaigns = (s: CampaignsState) =>
  s.campaigns.filter((c) => c.status === 'active');
