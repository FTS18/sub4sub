import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { AppText } from '../../src/components/ui';
import { Colors, Spacing } from '../../src/constants';

export default function TermsOfServiceScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppText size="lg" weight="bold" style={styles.heading}>1. Acceptance of Terms</AppText>
      <AppText size="sm" color="textSecondary" style={styles.text}>
        By accessing and using our application, you accept and agree to be bound by the terms and provision of this agreement.
      </AppText>

      <AppText size="lg" weight="bold" style={styles.heading}>2. Use License</AppText>
      <AppText size="sm" color="textSecondary" style={styles.text}>
        Permission is granted to temporarily download one copy of the materials on our application for personal, non-commercial transitory viewing only.
      </AppText>

      <AppText size="lg" weight="bold" style={styles.heading}>3. Disclaimer</AppText>
      <AppText size="sm" color="textSecondary" style={styles.text}>
        The materials on our application are provided on an 'as is' basis. We make no warranties, expressed or implied.
      </AppText>

      <AppText size="lg" weight="bold" style={styles.heading}>4. Limitations</AppText>
      <AppText size="sm" color="textSecondary" style={styles.text}>
        In no event shall we or our suppliers be liable for any damages arising out of the use or inability to use the materials on our application.
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
