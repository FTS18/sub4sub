import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from './AppText';
import PrimaryButton from './PrimaryButton';
import { Colors, Spacing, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * EmptyState — shown when a list has no data.
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}) => (
  <View style={styles.container}>
    {icon && (
      <View style={styles.emojiBox}>
        <Ionicons name={icon} size={32} color={Colors.charcoal} />
      </View>
    )}
    <AppText size="lg" weight="extraBold" style={styles.title}>
      {title}
    </AppText>
    <AppText size="sm" color="textSecondary" style={styles.subtitle}>
      {subtitle}
    </AppText>
    {actionLabel && onAction && (
      <PrimaryButton
        label={actionLabel}
        onPress={onAction}
        style={styles.action}
      />
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  emojiBox: {
    width: 80,
    height: 80,
    borderRadius: Radius['2xl'],
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center', lineHeight: 20 },
  action: { marginTop: Spacing.sm },
});

export default EmptyState;
