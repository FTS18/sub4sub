import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/stores/auth.store';

/**
 * Root index — redirects to tabs if authenticated, login if not.
 * This is the entry point Expo Router hits when the app opens.
 */
export default function Index() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  // While Firebase is checking auth state, show nothing (root layout shows spinner)
  if (isLoading) return null;

  return user ? (
    <Redirect href="/(tabs)/earn" />
  ) : (
    <Redirect href="/login" />
  );
}
