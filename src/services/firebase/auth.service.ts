import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from './config';
import { upsertUser, fetchUser } from './firestore.service';
import { AppUser } from '../../types';

/**
 * Auth service — Single Responsibility: Firebase auth operations.
 * All auth side-effects (Firestore upsert, store updates) happen here.
 */

export const signInWithGoogle = async (idToken: string): Promise<AppUser> => {
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  return handleAuthResult(result.user);
};

export const signInWithGoogleWeb = async (): Promise<AppUser> => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return handleAuthResult(result.user);
};

const handleAuthResult = async (firebaseUser: User): Promise<AppUser> => {
  const appUser: AppUser = {
    uid: firebaseUser.uid,
    displayName: firebaseUser.displayName,
    email: firebaseUser.email,
    photoURL: firebaseUser.photoURL,
    coins: 500, // welcome bonus
    isVip: false,
    createdAt: Date.now(),
  };

  await upsertUser(appUser);
  const freshUser = await fetchUser(firebaseUser.uid);
  return freshUser ?? appUser;
};

export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

export const subscribeToAuthChanges = (
  onUser: (user: AppUser | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      onUser(null);
      return;
    }
    const appUser = await fetchUser(firebaseUser.uid);
    onUser(appUser);
  });
};
