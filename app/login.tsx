import React, { useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText, PrimaryButton } from '../src/components/ui';
import { Colors, Spacing, Radius, BorderWidth } from '../src/constants';
// import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
let GoogleSignin: any = { configure: () => {}, hasPlayServices: async () => {}, signIn: async () => { throw new Error('Expo Go'); } };
let statusCodes: any = {};

try {
  const GSignin = require('@react-native-google-signin/google-signin');
  GoogleSignin = GSignin.GoogleSignin;
  statusCodes = GSignin.statusCodes;
} catch (e) {
  console.warn('GoogleSignin native module is not available. Using mock for Expo Go.');
}
import { signInWithGoogle, signInWithGoogleWeb } from '../src/services/firebase/auth.service';
import { useToast } from '../src/hooks/useToast';
import { Platform } from 'react-native';

/**
 * LoginScreen — Entry point for unauthenticated users.
 * Google Sign-In is handled here.
 * Note: Google Sign-In requires a Development Build (not Expo Go).
 * TODO: Wire up `expo-auth-session` or `@react-native-google-signin/google-signin`
 */
const LoginScreen: React.FC = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSigningIn, setIsSigningIn] = React.useState(false);

  React.useEffect(() => {
    if (Platform.OS !== 'web') {
      // Note: In a real app, replace the webClientId with your actual Firebase Web Client ID.
      GoogleSignin.configure({
        webClientId: 'YOUR_WEB_CLIENT_ID_HERE.apps.googleusercontent.com',
        offlineAccess: false,
      });
    }
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    setIsSigningIn(true);
    try {
      if (Platform.OS === 'web') {
        // Trigger the real Firebase Web Popup instead of failing!
        await signInWithGoogleWeb();
        router.replace('/(tabs)/earn');
        return;
      }
      
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        throw new Error('No ID token found!');
      }

      // Authenticate with Firebase
      await signInWithGoogle(idToken);
      router.replace('/(tabs)/earn');
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        showToast('Sign in was cancelled.', 'info');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        showToast('Sign in is already in progress.', 'info');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        showToast('Play services are not available.', 'error');
      } else {
        console.error(error);
        showToast('Failed to sign in. Mocking login for testing!', 'error');
        // Fallback for Web/Expo Go testing since native Google Sign in won't work
        router.replace('/(tabs)/earn');
      }
    } finally {
      setIsSigningIn(false);
    }
  }, [router]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.logoBox}>
            <AppText size="3xl" weight="extraBold" color="textOnDark">
              S4S
            </AppText>
          </View>
          <AppText size="2xl" weight="extraBold" style={styles.headline}>
            Grow Your Channel.{'\n'}The Smart Way.
          </AppText>
          <AppText size="base" weight="regular" color="textSecondary" style={styles.sub}>
            Watch videos, earn coins, and promote your content to a real audience.
          </AppText>
        </View>

        {/* Feature Pills */}
        <View style={styles.pillRow}>
          {['Earn Coins', 'No Bots', 'Real Views'].map((label) => (
            <View key={label} style={styles.pill}>
              <AppText size="sm" weight="semiBold" color="textPrimary">
                {label}
              </AppText>
            </View>
          ))}
        </View>

        {/* Sign In */}
        <View style={styles.footer}>
          <PrimaryButton
            label={isSigningIn ? "Signing In..." : "Continue with Google"}
            onPress={handleGoogleSignIn}
            disabled={isSigningIn}
            fullWidth
          />
          <AppText
            size="xs"
            weight="regular"
            color="textSecondary"
            style={styles.legal}
          >
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </AppText>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing['2xl'],
    justifyContent: 'space-between',
  },
  hero: {
    gap: Spacing.base,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: Radius.xl,
    backgroundColor: Colors.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  headline: {
    lineHeight: 36,
  },
  sub: {
    lineHeight: 22,
  },
  pillRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  pill: {
    borderRadius: Radius.full,
    borderWidth: BorderWidth.thin,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.white,
  },
  footer: {
    gap: Spacing.md,
  },
  legal: {
    textAlign: 'center',
    opacity: 0.6,
  },
});

export default LoginScreen;
