import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import {
  useFonts,
  BricolageGrotesque_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import { Colors } from '../src/constants';
import { useAuthStore } from '../src/stores/auth.store';
import { subscribeToAuthChanges } from '../src/services/firebase/auth.service';

/**
 * useAuthGuard — Listens to Firebase auth state.
 * Redirects to /login if unauthenticated and on a protected route.
 * Redirects to /(tabs)/earn if authenticated and on the login route.
 */
const useAuthGuard = () => {
  const router = useRouter();
  const segments = useSegments();
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToAuthChanges((user) => {
      setUser(user);

      const inTabsGroup = segments[0] === '(tabs)';
      const onLogin = segments[0] === 'login';

      if (!user && inTabsGroup) {
        router.replace('/login');
      } else if (user && onLogin) {
        router.replace('/(tabs)/earn');
      }
    });

    return () => unsubscribe();
  }, []);
};

export default function RootLayout() {
  const isLoading = useAuthStore((s) => s.isLoading);

  const [fontsLoaded] = useFonts({
    BricolageGrotesque_400Regular,
    BricolageGrotesque_500Medium,
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
  });

  useAuthGuard();

  if (!fontsLoaded || isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.canvas,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={Colors.charcoal} size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor={Colors.canvas} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
