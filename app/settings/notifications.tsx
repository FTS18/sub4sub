import React, { useState } from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { AppText, Card } from '../../src/components/ui';
import { Colors, Spacing } from '../../src/constants';

export default function NotificationsScreen() {
  const [campaignAlerts, setCampaignAlerts] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [dailyReminders, setDailyReminders] = useState(true);

  return (
    <View style={styles.container}>
      <Card accent="white" bordered style={styles.card}>
        <View style={styles.row}>
          <View style={styles.textContainer}>
            <AppText size="base" weight="semiBold">Campaign Alerts</AppText>
            <AppText size="xs" color="textSecondary">Get notified when your campaigns complete.</AppText>
          </View>
          <Switch value={campaignAlerts} onValueChange={setCampaignAlerts} trackColor={{ true: Colors.sage }} />
        </View>
        <View style={styles.divider} />
        
        <View style={styles.row}>
          <View style={styles.textContainer}>
            <AppText size="base" weight="semiBold">Daily Reminders</AppText>
            <AppText size="xs" color="textSecondary">Don't forget your daily login streak.</AppText>
          </View>
          <Switch value={dailyReminders} onValueChange={setDailyReminders} trackColor={{ true: Colors.sage }} />
        </View>
        <View style={styles.divider} />

        <View style={styles.row}>
          <View style={styles.textContainer}>
            <AppText size="base" weight="semiBold">Promotional Offers</AppText>
            <AppText size="xs" color="textSecondary">Special discounts on VIP and Coin packages.</AppText>
          </View>
          <Switch value={promotions} onValueChange={setPromotions} trackColor={{ true: Colors.sage }} />
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas,
    padding: Spacing.xl,
  },
  card: {
    gap: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
});
