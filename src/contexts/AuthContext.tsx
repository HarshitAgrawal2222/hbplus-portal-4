import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { ENABLE_TEST_MODE, MESSAGES } from '../constants/config';
import {
  assertAuthorized, isSigningUp, logout as doLogout, resetPassword, signInWithEmail, signInWithGoogle, signUpWithEmail,
} from '../services/authService';
import { upsertUserProfile } from '../services/userService';
import { AuthFlowError, AuthStatus, Role, UserProfile } from '../types/auth';

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  profile: UserProfile | null;
  error: string | null;
  busy: boolean;
  info: string | null;
  enterTestMode: (role?: Role) => void;
  signIn: () => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<boolean>;
  signUpEmail: (name: string, email: string, password: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('initializing');
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const testRef = useRef(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (testRef.current) return; // test session is local-only; ignore Firebase events
      if (!u) {
        setUser(null); setProfile(null); setStatus('unauthenticated');
        return;
      }
      if (isSigningUp()) return;
      try {
        await assertAuthorized(u); // re-validates restored sessions too
        const p = await upsertUserProfile(u);
        setUser(u); setProfile(p); setStatus('authenticated');
      } catch (e) {
        setUser(null); setProfile(null); setStatus('unauthenticated');
        setError(e instanceof AuthFlowError ? e.message : MESSAGES.generic);
        await doLogout().catch(() => {});
      }
    });
  }, []);

  const signIn = useCallback(async () => {
    setError(null); setBusy(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e instanceof AuthFlowError ? e.message : MESSAGES.generic);
    } finally {
      setBusy(false);
    }
  }, []);

  const run = useCallback(async (fn: () => Promise<void>): Promise<boolean> => {
    setError(null); setInfo(null); setBusy(true);
    try { await fn(); return true; }
    catch (e) { setError(e instanceof AuthFlowError ? e.message : MESSAGES.generic); return false; }
    finally { setBusy(false); }
  }, []);

  const signInEmail = useCallback((email: string, password: string) => run(async () => { await signInWithEmail(email, password); }), [run]);
  const signUpEmail = useCallback(
    (name: string, email: string, password: string) =>
      run(async () => {
        await signUpWithEmail(name, email, password);
        setInfo(`Account created. We sent a verification link to ${email.trim().toLowerCase()}. Verify your email, then log in.`);
      }),
    [run],
  );
  const forgotPassword = useCallback(
    async (email: string) => {
      await run(async () => { await resetPassword(email); setInfo('If that account exists, a password reset link has been sent.'); });
    },
    [run],
  );

  const enterTestMode = useCallback((role: Role = 'user') => {
    if (!ENABLE_TEST_MODE) return; // hard guard even if called directly
    testRef.current = true;
    setError(null); setInfo(null); setUser(null);
    setProfile({
      uid: 'test-user', displayName: role === 'admin' ? 'Test Admin' : 'Test User',
      email: `test.${role}@${process.env.EXPO_PUBLIC_ALLOWED_DOMAIN ?? 'hbplus.fit'}`,
      photoURL: null, role, createdAt: new Date(), lastLoginAt: new Date(), isTest: true,
    });
    setStatus('authenticated');
  }, []);

  const signOut = useCallback(async () => {
    if (testRef.current) {
      testRef.current = false;
      setProfile(null); setUser(null); setStatus('unauthenticated');
      return;
    }
    setBusy(true);
    try { await doLogout(); } finally { setBusy(false); setProfile(null); setUser(null); }
  }, []);

  const value = useMemo(
    () => ({ status, user, profile, error, info, busy, signIn, enterTestMode, signInEmail, signUpEmail, forgotPassword, signOut, clearError: () => { setError(null); setInfo(null); } }),
    [status, user, profile, error, info, busy, signIn, enterTestMode, signInEmail, signUpEmail, forgotPassword, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
