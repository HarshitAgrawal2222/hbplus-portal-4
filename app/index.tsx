import React from 'react';
import { Link, Redirect } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AuthForm from '../src/components/AuthForm';
import AuthLayout, { Banner } from '../src/components/AuthLayout';
import GoogleSignInButton from '../src/components/GoogleSignInButton';
import LoadingScreen from '../src/components/LoadingScreen';
import { ENABLE_TEST_MODE } from '../src/constants/config';
import { useAuth } from '../src/contexts/AuthContext';
import { colors } from '../src/theme/colors';

export default function LoginScreen() {
  const { status, signIn, busy, error, info, clearError, enterTestMode } = useAuth();
  if (status === 'initializing') return <LoadingScreen label="Starting up…" />;
  if (status === 'authenticated') return <Redirect href="/dashboard" />;

  return (
    <AuthLayout
      title="Welcome to HB Plus"
      subtitle="Sign in using your official organization account."
      footer={<>New to HB Plus? <Link href="/signup" style={styles.link}>Create account</Link></>}
    >
      {error && <Banner kind="error" text={error} />}
      {info && <Banner kind="success" text={info} />}
      <GoogleSignInButton loading={busy} onPress={() => { clearError(); signIn(); }} />
      <View style={styles.divider}><View style={styles.line} /><Text style={styles.or}>or</Text><View style={styles.line} /></View>
      <AuthForm mode="login" />
      {ENABLE_TEST_MODE && (
        <View style={styles.test}>
          <Text style={styles.testLabel}>Test mode:</Text>
          <Pressable onPress={() => enterTestMode('user')} accessibilityRole="button"><Text style={styles.link}>User</Text></Pressable>
          <Text style={styles.testLabel}>·</Text>
          <Pressable onPress={() => enterTestMode('admin')} accessibilityRole="button"><Text style={styles.link}>Admin</Text></Pressable>
        </View>
      )}
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { color: colors.textMuted, fontSize: 13 },
  link: { color: colors.primary, fontWeight: '700' },
  test: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 20 },
  testLabel: { color: colors.textMuted, fontSize: 13 },
});
