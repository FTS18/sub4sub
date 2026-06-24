import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from './AppText';
import Card from './Card';
import { Spacing } from '../../constants';

interface CoinDisplayProps {
  amount: number;
  label?: string;
}

/**
 * CoinDisplay — Shows the user's coin balance prominently.
 * Used in the Dashboard and Earn screen header.
 */
const CoinDisplay: React.FC<CoinDisplayProps> = ({
  amount,
  label = 'Your Balance',
}) => (
  <Card accent="terracotta" style={styles.container}>
    <AppText size="sm" weight="medium" onDark>
      {label}
    </AppText>
    <View style={styles.row}>
      <AppText size="xs" weight="bold" onDark style={styles.symbol}>
        ©
      </AppText>
      <AppText size="3xl" weight="extraBold" onDark>
        {amount.toLocaleString()}
      </AppText>
    </View>
    <AppText size="xs" weight="regular" onDark style={styles.sub}>
      coins available
    </AppText>
  </Card>
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  symbol: {
    marginBottom: 6,
  },
  sub: {
    opacity: 0.75,
    marginTop: 2,
  },
});

export default CoinDisplay;
