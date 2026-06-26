import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { AppText, Card, CoinDisplay, Skeleton, Toast } from '../../src/components/ui';
import { Colors, Spacing, Radius, BorderWidth } from '../../src/constants';
import { useAuthStore } from '../../src/stores/auth.store';
import { claimDailyCheckIn, fetchCheckInData } from '../../src/services/firebase/firestore.service';
import { useToast } from '../../src/hooks/useToast';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface CheckInData {
  streak: number;
  claimedToday: boolean;
  isLoading: boolean;
}

interface EarningStat {
  label: string;
  coins: number;
}

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [checkIn, setCheckIn] = useState<CheckInData>({
    streak: 0,
    claimedToday: false,
    isLoading: true,
  });

  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [weeklyEarnings] = useState([120, 80, 200, 160, 300, 250, 180]);

  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const data = await fetchCheckInData(user.uid);
        setCheckIn({ ...data, isLoading: false });
      } catch {
        setCheckIn((prev) => ({ ...prev, isLoading: false }));
      } finally {
        setIsStatsLoading(false);
      }
    };
    load();
  }, [user]);

  const handleCheckIn = useCallback(async () => {
    if (!user || checkIn.claimedToday || checkIn.isLoading) return;
    setCheckIn((prev) => ({ ...prev, isLoading: true }));
    try {
      const result = await claimDailyCheckIn(user.uid);
      if (result.awarded) {
        setCheckIn({ streak: result.newStreak, claimedToday: true, isLoading: false });
        setUser({ ...user, coins: user.coins + result.coinsAwarded });
        showToast(`+${result.coinsAwarded} coins! 🔥 ${result.newStreak} day streak!`, 'success');
      } else {
        setCheckIn((prev) => ({ ...prev, claimedToday: true, isLoading: false }));
        showToast('Already claimed today. Come back tomorrow!', 'info');
      }
    } catch {
      setCheckIn((prev) => ({ ...prev, isLoading: false }));
      showToast('Check-in failed. Try again.', 'error');
    }
  }, [user, checkIn, setUser]);

  const maxEarning = Math.max(...weeklyEarnings);

  const recentActivity: Array<{ label: string; coins: number; time: string; accent: string }> = [
    { label: 'Watched video', coins: +50, time: '2m ago', accent: Colors.sage },
    { label: 'Watched Ad Bonus', coins: +300, time: '15m ago', accent: Colors.butter },
    { label: 'Daily Check-in', coins: +100, time: '1h ago', accent: Colors.powderBlue },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppText size="xl" weight="extraBold" style={styles.title}>Dashboard</AppText>

        {/* Balance */}
        <CoinDisplay amount={user?.coins ?? 0} label="Total Balance" />

        {/* Bento Stats */}
        <View style={styles.bentoRow}>
          <Card accent="powderBlue" style={styles.bentoHalf}>
            <AppText size="xs" weight="medium">Earned Today</AppText>
            {isStatsLoading ? <Skeleton height={32} /> : <AppText size="2xl" weight="extraBold">+680</AppText>}
            <AppText size="xs" color="textSecondary">coins</AppText>
          </Card>
          <Card accent="sage" style={styles.bentoHalf}>
            <AppText size="xs" weight="medium">Videos Watched</AppText>
            {isStatsLoading ? <Skeleton height={32} /> : <AppText size="2xl" weight="extraBold">14</AppText>}
            <AppText size="xs" color="textSecondary">today</AppText>
          </Card>
        </View>

        {/* Daily Check-In Card */}
        <TouchableOpacity
          onPress={handleCheckIn}
          disabled={checkIn.claimedToday || checkIn.isLoading}
          activeOpacity={0.85}
        >
          <Card
            accent={checkIn.claimedToday ? 'sage' : 'butter'}
            style={styles.streakCard}
            bordered={!checkIn.claimedToday}
          >
            <View style={styles.streakRow}>
              <View>
                <AppText size="xs" weight="medium">
                  {checkIn.claimedToday ? '✅ Checked In!' : '📅 Daily Check-In'}
                </AppText>
                {checkIn.isLoading ? (
                  <Skeleton height={28} width={120} style={{ marginTop: 4 }} />
                ) : (
                  <AppText size="xl" weight="extraBold">
                    🔥 {checkIn.streak} Day Streak
                  </AppText>
                )}
              </View>
              <View style={styles.bonusBadge}>
                <AppText size="xs" weight="bold">
                  {checkIn.claimedToday ? 'Claimed!' : `+100 coins`}
                </AppText>
              </View>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Weekly Earnings Chart */}
        <Card accent="white" bordered style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <AppText size="base" weight="bold">Weekly Earnings</AppText>
            <AppText size="xs" color="textSecondary">Coins</AppText>
          </View>
          {isStatsLoading ? (
            <View style={styles.bars}>
              {DAYS.map((d) => (
                <View key={d} style={styles.barCol}>
                  <Skeleton height={Math.random() * 80 + 20} width="70%" borderRadius={Radius.sm} />
                  <AppText size="xs" color="textSecondary">{d}</AppText>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.bars}>
              {weeklyEarnings.map((val, i) => {
                const height = Math.max((val / maxEarning) * 100, 6);
                const isMax = val === maxEarning;
                return (
                  <View key={DAYS[i]} style={styles.barCol}>
                    <AppText size="xs" weight="semiBold" color="textSecondary">{val}</AppText>
                    <View
                      style={[
                        styles.bar,
                        { height, backgroundColor: isMax ? Colors.terracotta : Colors.charcoal },
                      ]}
                    />
                    <AppText size="xs" color="textSecondary">{DAYS[i]}</AppText>
                  </View>
                );
              })}
            </View>
          )}
        </Card>

        {/* Recent Activity */}
        <AppText size="base" weight="bold" style={styles.sectionLabel}>Recent Activity</AppText>
        <Card accent="white" bordered>
          {recentActivity.map((item, i) => (
            <View
              key={i}
              style={[styles.activityRow, i < recentActivity.length - 1 && styles.activityDivider]}
            >
              <View style={[styles.activityDot, { backgroundColor: item.accent }]} />
              <View style={{ flex: 1 }}>
                <AppText size="sm" weight="medium">{item.label}</AppText>
                <AppText size="xs" color="textSecondary">{item.time}</AppText>
              </View>
              <AppText
                size="sm"
                weight="bold"
                style={{ color: item.coins > 0 ? Colors.success : Colors.error }}
              >
                {item.coins > 0 ? '+' : ''}{item.coins.toLocaleString()}
              </AppText>
            </View>
          ))}
        </Card>
      </ScrollView>

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.canvas },
  content: { padding: Spacing.base, gap: Spacing.md, paddingBottom: Spacing['3xl'] },
  title: { paddingVertical: Spacing.sm },
  bentoRow: { flexDirection: 'row', gap: Spacing.md },
  bentoHalf: { flex: 1, gap: 2 },
  streakCard: {},
  streakRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bonusBadge: { borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  chartCard: { gap: Spacing.base },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 130 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  bar: { width: '70%', borderRadius: Radius.sm, minHeight: 6 },
  sectionLabel: { marginTop: Spacing.sm },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
  activityDivider: { borderBottomWidth: 1, borderBottomColor: Colors.canvas },
  activityDot: { width: 10, height: 10, borderRadius: 5 },
});
