import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from './AppText';
import { Colors, Radius, Spacing } from '../../constants';

type BadgeVariant = 'terracotta' | 'sage' | 'powderBlue' | 'butter' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const BG_MAP: Record<BadgeVariant, string> = {
  terracotta: Colors.terracotta,
  sage: Colors.sage,
  powderBlue: Colors.powderBlue,
  butter: Colors.butter,
  neutral: Colors.white,
};

/**
 * Badge — Small pill for status / campaign type labels.
 */
const Badge: React.FC<BadgeProps> = ({ label, variant = 'neutral' }) => (
  <View style={[styles.pill, { backgroundColor: BG_MAP[variant] }]}>
    <AppText size="xs" weight="semiBold" color="textPrimary">
      {label.toUpperCase()}
    </AppText>
  </View>
);

const styles = StyleSheet.create({
  pill: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.border,
  },
});

export default Badge;
