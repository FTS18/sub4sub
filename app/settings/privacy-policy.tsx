import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { AppText } from '../../src/components/ui';
import { Colors, Spacing } from '../../src/constants';

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppText size="lg" weight="bold" style={styles.heading}>1. Information We Collect</AppText>
      <AppText size="sm" color="textSecondary" style={styles.text}>
        We collect information you provide directly to us, such as when you create or modify your account, use our services, or communicate with us.
      </AppText>

      <AppText size="lg" weight="bold" style={styles.heading}>2. How We Use Information</AppText>
      <AppText size="sm" color="textSecondary" style={styles.text}>
        We use the information we collect to provide, maintain, and improve our services, as well as to personalize your experience.
      </AppText>

      <AppText size="lg" weight="bold" style={styles.heading}>3. Sharing of Information</AppText>
      <AppText size="sm" color="textSecondary" style={styles.text}>
        We do not share your personal information with third parties except as described in this privacy policy or with your consent.
      </AppText>

      <AppText size="lg" weight="bold" style={styles.heading}>4. Data Security</AppText>
      <AppText size="sm" color="textSecondary" style={styles.text}>
        We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access.
      </AppText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    backgroundColor: Colors.canvas,
    flexGrow: 1,
  },
  heading: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  text: {
    lineHeight: 22,
  },
});
