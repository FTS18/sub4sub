import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import {
  AppText,
  Card,
  PrimaryButton,
  Badge,
  Skeleton,
  EmptyState,
  Toast,
} from '../../src/components/ui';
import { Colors, Spacing, Radius, BorderWidth } from '../../src/constants';
import { Campaign, CampaignType, ECONOMY } from '../../src/types';
import { useAuthStore } from '../../src/stores/auth.store';
import {
  fetchUserCampaigns,
  createCampaign,
  updateCampaignStatus,
  extractYouTubeId,
} from '../../src/services/firebase/firestore.service';
import { useToast } from '../../src/hooks/useToast';

const BADGE_VARIANT: Record<CampaignType, 'powderBlue' | 'sage' | 'butter'> = {
  views: 'powderBlue',
  likes: 'butter',
  subscribers: 'sage',
};

const STATUS_COLOR: Record<string, string> = {
  active: Colors.sage,
  paused: Colors.butter,
  completed: Colors.charcoal,
};

const COST_MAP: Record<CampaignType, number> = {
  views: ECONOMY.COST_PER_VIEW,
  likes: ECONOMY.COST_PER_LIKE,
  subscribers: ECONOMY.COST_PER_SUBSCRIBER,
};

interface CampaignCardProps {
  campaign: Campaign;
  onToggle: (id: string, newStatus: 'active' | 'paused') => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onToggle }) => {
  const progress = campaign.currentCount / campaign.targetCount;
  const isPaused = campaign.status === 'paused';
  const isCompleted = campaign.status === 'completed';

  return (
    <Card accent="white" bordered style={styles.campaignCard}>
      <View style={styles.cardHeader}>
        <Badge label={campaign.type} variant={BADGE_VARIANT[campaign.type]} />
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[campaign.status] }]} />
          <AppText size="xs" weight="medium" color="textSecondary">
            {campaign.status}
          </AppText>
        </View>
      </View>

      <AppText size="md" weight="semiBold" numberOfLines={2} style={{ marginTop: Spacing.sm }}>
        {campaign.videoTitle}
      </AppText>

      <View style={styles.progressSection}>
        <View style={styles.progressMeta}>
          <AppText size="xs" color="textSecondary">Progress</AppText>
          <AppText size="xs" weight="semiBold">
            {campaign.currentCount}/{campaign.targetCount}
          </AppText>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.min(progress * 100, 100)}%` }]} />
        </View>
      </View>

      <View style={styles.cardFooter}>
        <AppText size="xs" color="textSecondary">
          {campaign.coinCostPerAction} coins/{campaign.type.slice(0, -1)}
        </AppText>
        {!isCompleted && (
          <TouchableOpacity
            style={[styles.toggleBtn, isPaused && styles.toggleBtnActive]}
            onPress={() => onToggle(campaign.id, isPaused ? 'active' : 'paused')}
          >
            <AppText size="xs" weight="semiBold" color={isPaused ? 'textOnDark' : 'textPrimary'}>
              {isPaused ? 'Resume' : 'Pause'}
            </AppText>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
};

export default function CampaignsScreen() {
  const user = useAuthStore((s) => s.user);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedType, setSelectedType] = useState<CampaignType>('views');
  const [targetCount, setTargetCount] = useState('50');
  const [isCreating, setIsCreating] = useState(false);

  const { toast, showToast, hideToast } = useToast();

  const loadCampaigns = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchUserCampaigns(user.uid);
      setCampaigns(data.sort((a, b) => b.createdAt - a.createdAt));
    } catch {
      showToast('Failed to load campaigns.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  const handleCreate = useCallback(async () => {
    if (!user || !videoUrl.trim()) {
      showToast('Please enter a valid YouTube URL.', 'error');
      return;
    }

    const count = parseInt(targetCount, 10);
    if (isNaN(count) || count < 10) {
      showToast('Minimum 10 target count required.', 'error');
      return;
    }

    const totalCost = Math.floor(COST_MAP[selectedType] * count * (1 + ECONOMY.APP_TAX_PERCENT));
    if (user.coins < totalCost) {
      showToast(`Not enough coins. Need ${totalCost}, have ${user.coins}.`, 'error');
      return;
    }

    setIsCreating(true);
    try {
      const videoId = extractYouTubeId(videoUrl);
      if (!videoId) throw new Error('Invalid YouTube URL. Could not extract video ID.');

      await createCampaign(
        user.uid,
        { videoUrl, type: selectedType, targetCount: count, watchDurationSeconds: 60 },
        `Campaign for video ${videoId}`,
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      );

      showToast('Campaign created!', 'success');
      setShowModal(false);
      setVideoUrl('');
      setTargetCount('50');
      await loadCampaigns();
    } catch (e: any) {
      showToast(e.message ?? 'Failed to create campaign.', 'error');
    } finally {
      setIsCreating(false);
    }
  }, [user, videoUrl, selectedType, targetCount, loadCampaigns]);

  const handleToggle = useCallback(async (id: string, newStatus: 'active' | 'paused') => {
    try {
      await updateCampaignStatus(id, newStatus);
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
      showToast(`Campaign ${newStatus === 'active' ? 'resumed' : 'paused'}.`, 'info');
    } catch {
      showToast('Failed to update campaign.', 'error');
    }
  }, []);

  const active = campaigns.filter((c) => c.status === 'active');
  const paused = campaigns.filter((c) => c.status === 'paused');
  const completed = campaigns.filter((c) => c.status === 'completed');

  const totalCostPreview = Math.floor(
    COST_MAP[selectedType] * (parseInt(targetCount, 10) || 0) * (1 + ECONOMY.APP_TAX_PERCENT)
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <AppText size="xl" weight="extraBold">Campaigns</AppText>
          <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
            <AppText size="xl" weight="bold" onDark>+</AppText>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <Card accent="sage" style={styles.statCard}>
            <AppText size="xs" weight="medium">Active</AppText>
            {isLoading ? <Skeleton height={32} /> : <AppText size="2xl" weight="extraBold">{active.length}</AppText>}
          </Card>
          <Card accent="butter" style={styles.statCard}>
            <AppText size="xs" weight="medium">Paused</AppText>
            {isLoading ? <Skeleton height={32} /> : <AppText size="2xl" weight="extraBold">{paused.length}</AppText>}
          </Card>
          <Card accent="powderBlue" style={styles.statCard}>
            <AppText size="xs" weight="medium">Done</AppText>
            {isLoading ? <Skeleton height={32} /> : <AppText size="2xl" weight="extraBold">{completed.length}</AppText>}
          </Card>
        </View>

        {isLoading ? (
          <>
            <Skeleton height={120} borderRadius={Radius.xl} />
            <Skeleton height={120} borderRadius={Radius.xl} />
          </>
        ) : campaigns.length === 0 ? (
          <EmptyState
            icon="megaphone-outline"
            title="No Campaigns Yet"
            subtitle="Create your first campaign to start getting real views on your channel."
            actionLabel="Create Campaign"
            onAction={() => setShowModal(true)}
          />
        ) : (
          <>
            {active.length > 0 && (
              <>
                <AppText size="base" weight="bold" style={styles.sectionLabel}>Active</AppText>
                {active.map((c) => <CampaignCard key={c.id} campaign={c} onToggle={handleToggle} />)}
              </>
            )}
            {paused.length > 0 && (
              <>
                <AppText size="base" weight="bold" style={styles.sectionLabel}>Paused</AppText>
                {paused.map((c) => <CampaignCard key={c.id} campaign={c} onToggle={handleToggle} />)}
              </>
            )}
            {completed.length > 0 && (
              <>
                <AppText size="base" weight="bold" style={styles.sectionLabel}>Completed</AppText>
                {completed.map((c) => <CampaignCard key={c.id} campaign={c} onToggle={handleToggle} />)}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Create Campaign Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <AppText size="lg" weight="extraBold">New Campaign</AppText>
            <AppText size="sm" color="textSecondary" style={{ marginTop: 4 }}>
              Cost: ~{isNaN(totalCostPreview) ? 0 : totalCostPreview} coins (incl. 10% fee)
            </AppText>

            <TextInput
              style={styles.input}
              placeholder="YouTube URL (e.g. youtube.com/watch?v=...)"
              placeholderTextColor={Colors.muted}
              value={videoUrl}
              onChangeText={setVideoUrl}
              autoCapitalize="none"
              keyboardType="url"
            />

            <AppText size="sm" weight="semiBold" style={{ marginTop: Spacing.base }}>
              Campaign Type
            </AppText>
            <View style={styles.typeRow}>
              {(['views', 'likes', 'subscribers'] as CampaignType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, selectedType === t && styles.typeBtnActive]}
                  onPress={() => setSelectedType(t)}
                >
                  <AppText size="xs" weight="semiBold" color={selectedType === t ? 'textOnDark' : 'textPrimary'}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </AppText>
                  <AppText size="xs" color={selectedType === t ? 'textOnDark' : 'textSecondary'}>
                    {COST_MAP[t]}©/ea
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>

            <AppText size="sm" weight="semiBold" style={{ marginTop: Spacing.base }}>
              Target Count
            </AppText>
            <TextInput
              style={styles.input}
              placeholder="e.g. 50"
              placeholderTextColor={Colors.muted}
              value={targetCount}
              onChangeText={setTargetCount}
              keyboardType="numeric"
            />

            <View style={styles.modalActions}>
              <PrimaryButton label="Cancel" onPress={() => setShowModal(false)} variant="ghost" style={{ flex: 1 }} />
              <PrimaryButton label="Create" onPress={handleCreate} loading={isCreating} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.canvas },
  scroll: { flex: 1 },
  content: { padding: Spacing.base, gap: Spacing.md, paddingBottom: Spacing['3xl'] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm },
  fab: { width: 44, height: 44, borderRadius: Radius.full, backgroundColor: Colors.charcoal, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: { flex: 1, gap: 4 },
  sectionLabel: { marginTop: Spacing.sm },
  campaignCard: { gap: Spacing.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  progressSection: { gap: 4 },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  track: { height: 6, borderRadius: Radius.full, backgroundColor: Colors.canvas, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: Colors.charcoal, borderRadius: Radius.full },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.xs },
  toggleBtn: { borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, backgroundColor: Colors.canvas },
  toggleBtnActive: { backgroundColor: Colors.charcoal },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(26,26,26,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: Colors.canvas, borderTopLeftRadius: Radius['2xl'], borderTopRightRadius: Radius['2xl'], padding: Spacing.xl, paddingBottom: Spacing['3xl'], gap: Spacing.sm, borderWidth: BorderWidth.thin, borderColor: Colors.border },
  input: { borderWidth: BorderWidth.thin, borderColor: Colors.border, borderRadius: Radius.lg, padding: Spacing.md, backgroundColor: Colors.white, fontFamily: 'BricolageGrotesque_400Regular', fontSize: 14, color: Colors.charcoal, marginTop: Spacing.sm },
  typeRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  typeBtn: { flex: 1, borderRadius: Radius.lg, borderWidth: BorderWidth.thin, borderColor: Colors.border, padding: Spacing.sm, alignItems: 'center', backgroundColor: Colors.white, gap: 2 },
  typeBtnActive: { backgroundColor: Colors.charcoal },
  modalActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
});
