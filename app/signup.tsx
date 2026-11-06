import React from 'react';
import { Link, Redirect } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import AuthForm from '../src/components/AuthForm';
import AuthLayout, { Banner } from '../src/components/AuthLayout';
import GoogleSignInButton from '../src/components/GoogleSignInButton';
import LoadingScreen from '../src/components/LoadingScreen';
import { useAuth } from '../src/contexts/AuthContext';
import { colors } from '../src/theme/colors';

export default function SignupScreen() {
  const { status, error, signIn, busy, clearError } = useAuth();
  if (status === 'initializing') return <LoadingScreen label="Starting up…" />;
  if (status === 'authenticated') return <Redirect href="/dashboard" />;

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Register with your official email. We’ll send a verification link."
      footer={<>Already have an account? <Link href="/" style={styles.link}>Log in</Link></>}
    >
      {error && <Banner kind="error" text={error} />}
      <AuthForm mode="signup" />
      <View style={styles.divider}><View style={styles.line} /><Text style={styles.or}>or</Text><View style={styles.line} /></View>
      <GoogleSignInButton loading={busy} onPress={() => { clearError(); signIn(); }} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { color: colors.textMuted, fontSize: 13 },
  link: { color: colors.primary, fontWeight: '700' },
});
