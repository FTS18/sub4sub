/**
 * Design Token: Color Palette
 * Neo-Brutalism (Soft Variant) — Sub4Sub App
 */
export const Colors = {
  // Base
  canvas: '#F5EFE2',
  white: '#FFFFFF',
  charcoal: '#1A1A1A',

  // Accent Blocks
  terracotta: '#E97451',
  sage: '#A3D1C6',
  powderBlue: '#A8C5E7',
  butter: '#F7DC6F',

  // Semantic
  border: '#1A1A1A',
  muted: '#6B6560',
  error: '#D94F3D',
  success: '#4CAF7D',

  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6560',
  textOnDark: '#F5EFE2',
} as const;

export type ColorKey = keyof typeof Colors;
