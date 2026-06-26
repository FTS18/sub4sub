import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, SafeAreaView } from 'react-native';
import AppText from './AppText';
import { Colors, Spacing, Radius } from '../../constants';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

const BG: Record<ToastType, string> = {
  success: Colors.sage,
  error: Colors.terracotta,
  info: Colors.powderBlue,
};

const EMOJI: Record<ToastType, string> = {
  success: 'V',
  error: 'X',
  info: 'i',
};

/**
 * Toast — bottom notification overlay.
 * Animates in and out automatically.
 */
const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  visible,
  onHide,
  duration = 2500,
}) => {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, { toValue: 100, duration: 250, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        ]).start(() => onHide());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: BG[type], transform: [{ translateY }], opacity },
      ]}
    >
      <View style={styles.indicator}>
        <AppText size="sm" weight="bold">{EMOJI[type]}</AppText>
      </View>
      <AppText size="sm" weight="semiBold" style={{ flex: 1 }}>
        {message}
      </AppText>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 90,
    left: Spacing.base,
    right: Spacing.base,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    zIndex: 999,
  },
  indicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(26,26,26,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Toast;
