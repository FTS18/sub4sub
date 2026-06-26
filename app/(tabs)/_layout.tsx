import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderWidth } from '../../src/constants';
import AppText from '../../src/components/ui/AppText';
import { Ionicons } from '@expo/vector-icons';

const TabIcon = ({
  icon,
  label,
  focused,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  focused: boolean;
}) => (
  <View style={[styles.iconWrap, focused && styles.iconActive]}>
    <Ionicons name={icon} size={20} color={focused ? Colors.white : 'rgba(255,255,255,0.6)'} />
    {focused && (
      <AppText size="xs" weight="semiBold" onDark>
        {label}
      </AppText>
    )}
  </View>
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="earn"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={focused ? "play-circle" : "play-circle-outline"} label="Earn" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="campaigns"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={focused ? "megaphone" : "megaphone-outline"} label="Campaigns" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={focused ? "stats-chart" : "stats-chart-outline"} label="Stats" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={focused ? "person" : "person-outline"} label="Profile" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.charcoal,
    borderTopWidth: BorderWidth.thin,
    borderTopColor: Colors.charcoal,
    height: 70,
    paddingBottom: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 999,
    gap: 2,
  },
  iconActive: {
    backgroundColor: 'rgba(245, 239, 226, 0.15)',
  },
});
