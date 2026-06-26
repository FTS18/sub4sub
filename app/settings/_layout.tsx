import { Stack } from 'expo-router';
import { Colors } from '../../src/constants';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.canvas,
        },
        headerShadowVisible: false,
        headerTintColor: Colors.charcoal,
        headerTitleStyle: {
          fontFamily: 'BricolageGrotesque_700Bold',
        },
        contentStyle: {
          backgroundColor: Colors.canvas,
        },
      }}
    >
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="privacy-policy" options={{ title: 'Privacy Policy' }} />
      <Stack.Screen name="terms-of-service" options={{ title: 'Terms of Service' }} />
    </Stack>
  );
}
