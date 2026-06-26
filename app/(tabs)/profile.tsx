import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppText, Card, PrimaryButton, Badge, Toast } from '../../src/components/ui';
import { Colors, Spacing, Radius, BorderWidth } from '../../src/constants';
import { COIN_PACKAGES } from '../../src/types';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/auth.store';
import { signOut } from '../../src/services/firebase/auth.service';
import { useToast } from '../../src/hooks/useToast';
import { purchasePackage, fetchOfferings } from '../../src/services/revenuecat.service';
import * as StoreReview from 'expo-store-review';
import * as MailComposer from 'expo-mail-composer';
import Purchases from 'react-native-purchases';

const SETTINGS_ROWS: Array<{ label: string; icon: keyof typeof Ionicons.glyphMap; route?: string; action?: string }> = [
  { label: 'Notification Preferences', icon: 'notifications-outline', route: '/settings/notifications' },
  { label: 'Privacy Policy', icon: 'lock-closed-outline', route: '/settings/privacy-policy' },
  { label: 'Terms of Service', icon: 'document-text-outline', route: '/settings/terms-of-service' },
  { label: 'Rate the App', icon: 'star-outline', action: 'rate' },
  { label: 'Report a Bug', icon: 'bug-outline', action: 'bug' },
];

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const clearUser = useAuthStore((s) => s.clearUser);
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);
  const { toast, showToast, hideToast } = useToast();

  React.useEffect(() => {
    const loadOfferings = async () => {
      const pkgs = await fetchOfferings();
      if (pkgs) setPackages(pkgs);
    };
    loadOfferings();
  }, []);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsSigningOut(true);
            try {
              await signOut();
              clearUser();
              router.replace('/login');
            } catch {
              showToast('Failed to sign out. Try again.', 'error');
              setIsSigningOut(false);
            }
          },
        },
      ]
    );
  };

  const handleSettingPress = async (row: typeof SETTINGS_ROWS[0]) => {
    if (row.route) {
      router.push(row.route as any);
    } else if (row.action === 'rate') {
      if (await StoreReview.hasAction()) {
        StoreReview.requestReview();
      } else {
        showToast('Store review not available.', 'info');
      }
    } else if (row.action === 'bug') {
      MailComposer.composeAsync({
        recipients: ['support@sub4sub.com'],
        subject: 'Bug Report: Sub4Sub App',
      }).catch(() => showToast('Could not open email client.', 'error'));
    }
  };

  const handlePurchase = async (pkg: any) => {
    showToast('Processing purchase...', 'info');
    const success = await purchasePackage(pkg);
    if (success) {
      showToast('Purchase successful!', 'success');
      // In a real app, update coins locally here.
    } else {
      showToast('Purchase failed or was cancelled.', 'error');
    }
  };

  const displayName = user?.displayName ?? 'User';
  const email = user?.email ?? '';
  const photoURL = user?.photoURL;
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppText size="xl" weight="extraBold" style={styles.title}>Profile</AppText>

        {/* Avatar + Info Card */}
        <Card accent="white" bordered style={styles.avatarCard}>
          <View style={styles.avatarRow}>
            {photoURL ? (
              <Image
                source={{ uri: photoURL }}
                style={styles.avatarImage}
                defaultSource={require('../../assets/icon.png')}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <AppText size="2xl" weight="extraBold" onDark>{initials}</AppText>
              </View>
            )}
            <View style={{ flex: 1, gap: Spacing.xs }}>
              <AppText size="lg" weight="extraBold" numberOfLines={1}>{displayName}</AppText>
              <AppText size="sm" color="textSecondary" numberOfLines={1}>{email}</AppText>
              <Badge label={user?.isVip ? 'VIP Member' : 'Free'} variant={user?.isVip ? 'sage' : 'neutral'} />
            </View>
          </View>
          <View style={styles.coinRow}>
            <AppText size="sm" color="textSecondary">Current Balance</AppText>
            <AppText size="lg" weight="extraBold">
              © {(user?.coins ?? 0).toLocaleString()} coins
            </AppText>
          </View>
        </Card>

        {/* VIP Upgrade Card */}
        {!user?.isVip && (
          <Card accent="sage" bordered style={styles.vipCard}>
            <View style={styles.vipRow}>
              <View style={{ flex: 1 }}>
                <AppText size="base" weight="extraBold">Go VIP</AppText>
                <AppText size="xs" style={{ marginTop: 2 }}>
                  2× coins · No ads · Auto-play overnight
                </AppText>
              </View>
              <TouchableOpacity
                style={styles.vipBtn}
                onPress={() => {
                  const vipPkg = packages.find(p => p.identifier === 'vip_monthly');
                  if (vipPkg) handlePurchase(vipPkg);
                  else showToast('VIP package not found in store.', 'error');
                }}
              >
                <AppText size="sm" weight="bold" onDark>₹399/mo</AppText>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Coin Packages */}
        <AppText size="base" weight="bold" style={styles.sectionLabel}>Buy Coins</AppText>
        {COIN_PACKAGES.map((pkg) => (
          <Card
            key={pkg.id}
            bordered
            style={[styles.packageCard, { backgroundColor: pkg.accentColor }]}
          >
            <View style={styles.packageRow}>
              <View>
                <AppText size="sm" weight="bold">{pkg.label} Pack</AppText>
                <AppText size="xl" weight="extraBold">
                  © {pkg.coins.toLocaleString()}
                </AppText>
                <AppText size="xs" color="textSecondary">coins</AppText>
              </View>
              <TouchableOpacity
                style={styles.buyBtn}
                onPress={() => {
                  const rcPkg = packages.find(p => p.identifier === pkg.id);
                  if (rcPkg) handlePurchase(rcPkg);
                  else handlePurchase(pkg); // fallback logic
                }}
              >
                <AppText size="sm" weight="bold" onDark>₹{Math.floor(pkg.priceUsd * 80)}</AppText>
              </TouchableOpacity>
            </View>
          </Card>
        ))}

        {/* Settings */}
        <AppText size="base" weight="bold" style={styles.sectionLabel}>Settings</AppText>
        <Card accent="white" bordered>
          {SETTINGS_ROWS.map((row, i) => (
            <TouchableOpacity
              key={row.label}
              style={[styles.settingsRow, i < SETTINGS_ROWS.length - 1 && styles.settingsDivider]}
              activeOpacity={0.7}
              onPress={() => handleSettingPress(row)}
            >
              <Ionicons name={row.icon} size={20} color={Colors.charcoal} />
              <AppText size="sm" weight="medium" style={{ flex: 1 }}>{row.label}</AppText>
              <AppText size="base" color="textSecondary">›</AppText>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Sign Out */}
        <PrimaryButton
          label={isSigningOut ? 'Signing Out...' : 'Sign Out'}
          onPress={handleSignOut}
          variant="ghost"
          fullWidth
          loading={isSigningOut}
          style={{ marginTop: Spacing.sm }}
        />

        <AppText size="xs" color="textSecondary" style={styles.version}>
          Sub4Sub v1.0.0
        </AppText>
      </ScrollView>

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.canvas },
  content: { padding: Spacing.base, gap: Spacing.md, paddingBottom: Spacing['3xl'] },
  title: { paddingVertical: Spacing.sm },
  avatarCard: { gap: Spacing.base },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: Colors.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  coinRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: BorderWidth.thin, borderTopColor: Colors.canvas, paddingTop: Spacing.md },
  vipCard: {},
  vipRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.md },
  vipBtn: { backgroundColor: Colors.charcoal, borderRadius: Radius.full, paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm },
  sectionLabel: { marginTop: Spacing.sm },
  packageCard: { gap: Spacing.sm },
  packageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  buyBtn: { backgroundColor: Colors.charcoal, borderRadius: Radius.full, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  settingsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
  settingsDivider: { borderBottomWidth: BorderWidth.thin, borderBottomColor: Colors.canvas },
  version: { textAlign: 'center', opacity: 0.5, marginTop: Spacing.sm },
});
