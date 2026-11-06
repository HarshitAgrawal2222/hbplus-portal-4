import { Platform } from 'react-native';
import {
  createUserWithEmailAndPassword, GoogleAuthProvider, sendEmailVerification, sendPasswordResetEmail,
  signInWithCredential, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile, User,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { ALLOWED_DOMAIN, MESSAGES } from '../constants/config';
import { AuthFlowError } from '../types/auth';
import { isAllowedEmail } from '../utils/domainValidator';

/** Throws AuthFlowError (after signing out) if the user is not an authorized org member. */
export async function assertAuthorized(user: User): Promise<void> {
  if (!user.email || !user.emailVerified) {
    await signOut(auth);
    throw new AuthFlowError('unverified-email', MESSAGES.unverifiedEmail);
  }
  if (!isAllowedEmail(user.email)) {
    await signOut(auth);
    throw new AuthFlowError('unauthorized-domain', MESSAGES.unauthorizedDomain);
  }
}

let signingUp = false;
/** True while sign-up is in progress, so the auth listener doesn't sign out the not-yet-verified new user mid-flow. */
export const isSigningUp = () => signingUp;

function mapError(e: any): AuthFlowError {
  if (e instanceof AuthFlowError) return e;
  const code = String(e?.code ?? '');
  if (code === 'auth/email-already-in-use') return new AuthFlowError('generic', MESSAGES.emailInUse);
  if (code === 'auth/weak-password') return new AuthFlowError('generic', MESSAGES.weakPassword);
  if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-email'].includes(code))
    return new AuthFlowError('generic', MESSAGES.invalidCredentials);
  if (code === 'auth/too-many-requests') return new AuthFlowError('generic', MESSAGES.tooMany);
  if (['auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'SIGN_IN_CANCELLED', '12501', '-5'].includes(code))
    return new AuthFlowError('cancelled', MESSAGES.cancelled);
  if (code === 'auth/network-request-failed' || code === 'NETWORK_ERROR')
    return new AuthFlowError('network', MESSAGES.network);
  // Rejections from the server-side blocking function
  if (code.includes('blocking-function') || /hbplus|domain|restricted/i.test(e?.message ?? ''))
    return new AuthFlowError('unauthorized-domain', MESSAGES.unauthorizedDomain);
  return new AuthFlowError('generic', MESSAGES.generic);
}

async function signInWeb(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ hd: ALLOWED_DOMAIN, prompt: 'select_account' }); // UI hint only
  return (await signInWithPopup(auth, provider)).user;
}

async function signInNative(): Promise<User> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { GoogleSignin, isSuccessResponse } = require('@react-native-google-signin/google-signin');
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    hostedDomain: ALLOWED_DOMAIN, // UI hint only
  });
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const res = await GoogleSignin.signIn();
  if (!isSuccessResponse(res)) throw { code: 'SIGN_IN_CANCELLED' };
  const idToken = res.data.idToken;
  if (!idToken) throw new Error('No ID token');
  return (await signInWithCredential(auth, GoogleAuthProvider.credential(idToken))).user;
}

export async function signInWithGoogle(): Promise<User> {
  try {
    const user = Platform.OS === 'web' ? await signInWeb() : await signInNative();
    await assertAuthorized(user);
    return user;
  } catch (e) {
    throw mapError(e);
  }
}

export async function logout(): Promise<void> {
  await signOut(auth);
  if (Platform.OS !== 'web') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      await require('@react-native-google-signin/google-signin').GoogleSignin.signOut();
    } catch { /* not signed in natively */ }
  }
}

/** Create account: domain is checked BEFORE the account is created; verification email is sent; user must verify, then log in. */
export async function signUpWithEmail(name: string, email: string, password: string): Promise<void> {
  signingUp = true;
  try {
    if (name.trim().length < 2) throw new AuthFlowError('generic', MESSAGES.nameRequired);
    if (!isAllowedEmail(email)) throw new AuthFlowError('unauthorized-domain', MESSAGES.unauthorizedDomain);
    if (password.length < 8) throw new AuthFlowError('generic', MESSAGES.weakPassword);
    const cred = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    await updateProfile(cred.user, { displayName: name.trim() });
    await sendEmailVerification(cred.user);
    await signOut(auth);
  } catch (e) {
    throw mapError(e);
  } finally {
    signingUp = false;
  }
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  try {
    if (!isAllowedEmail(email)) throw new AuthFlowError('unauthorized-domain', MESSAGES.unauthorizedDomain);
    const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    if (!cred.user.emailVerified) await sendEmailVerification(cred.user).catch(() => {});
    await assertAuthorized(cred.user);
    return cred.user;
  } catch (e) {
    throw mapError(e);
  }
}

export async function resetPassword(email: string): Promise<void> {
  if (!isAllowedEmail(email)) throw new AuthFlowError('unauthorized-domain', MESSAGES.unauthorizedDomain);
  try { await sendPasswordResetEmail(auth, email.trim().toLowerCase()); } catch (e) { throw mapError(e); }
}
