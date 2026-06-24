import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing, BorderWidth } from '../../constants';

type AccentColor = 'terracotta' | 'sage' | 'powderBlue' | 'butter' | 'white' | 'canvas';

interface CardProps {
  children: React.ReactNode;
  accent?: AccentColor;
  bordered?: boolean;
  style?: ViewStyle;
  padding?: keyof typeof Spacing;
}

/**
 * Card — The core layout primitive for the Bento Grid system.
 * Flat, heavily rounded, optional neo-brutalist border.
 */
const Card: React.FC<CardProps> = ({
  children,
  accent = 'white',
  bordered = false,
  style,
  padding = 'base',
}) => {
  const backgroundColor = accent === 'white' ? Colors.white : Colors[accent];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor, padding: Spacing[padding] },
        bordered && styles.bordered,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
  },
  bordered: {
    borderWidth: BorderWidth.thin,
    borderColor: Colors.border,
  },
});

export default Card;
