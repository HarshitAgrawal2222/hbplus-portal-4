export const ALLOWED_DOMAIN = process.env.EXPO_PUBLIC_ALLOWED_DOMAIN ?? 'hbplus.fit';

/** Demo/test mode (no login). OFF unless explicitly enabled. UI-only: creates no Firebase session and touches no Firestore data. */
export const ENABLE_TEST_MODE = process.env.EXPO_PUBLIC_ENABLE_TEST_MODE === 'true';

export const MESSAGES = {
  unauthorizedDomain: 'Access restricted. Please login using your official domain email.',
  unverifiedEmail: 'Your email is not verified yet. We sent a verification link to your inbox. Verify it, then log in.',
  invalidCredentials: 'Incorrect email or password.',
  emailInUse: 'An account with this email already exists. Please log in.',
  weakPassword: 'Password must be at least 8 characters.',
  nameRequired: 'Please enter your full name.',
  tooMany: 'Too many attempts. Please wait a moment and try again.',
  cancelled: 'Sign-in was cancelled.',
  network: 'Network error. Check your connection and try again.',
  generic: 'Something went wrong while signing in. Please try again.',
} as const;
