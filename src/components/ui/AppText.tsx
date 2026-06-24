import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { Colors, FontFamily, FontSize } from '../../constants';

type Weight = 'regular' | 'medium' | 'semiBold' | 'bold' | 'extraBold';
type Size = keyof typeof FontSize;
type Color = keyof typeof Colors;

interface AppTextProps {
  children: React.ReactNode;
  size?: Size;
  weight?: Weight;
  color?: Color;
  style?: TextStyle;
  numberOfLines?: number;
  onDark?: boolean;
}

/**
 * AppText — Single Responsibility: Typography primitive.
 * Always uses Bricolage Grotesque. Never use RN's default <Text> directly.
 */
const AppText: React.FC<AppTextProps> = ({
  children,
  size = 'base',
  weight = 'regular',
  color = 'textPrimary',
  style,
  numberOfLines,
  onDark = false,
}) => {
  const resolvedColor = onDark ? Colors.textOnDark : Colors[color];

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        styles.base,
        {
          fontSize: FontSize[size],
          fontFamily: FontFamily[weight],
          color: resolvedColor,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default AppText;
