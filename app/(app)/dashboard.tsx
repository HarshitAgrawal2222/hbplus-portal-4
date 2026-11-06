import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserProfileCard from '../../src/components/UserProfileCard';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors } from '../../src/theme/colors';
import { radius, spacing } from '../../src/theme/spacing';

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileValue}>{value}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { profile, signOut, busy } = useAuth();
  if (!profile) return null;
  const first = profile.displayName.split(' ')[0] || 'there';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logo}><Text style={styles.logoText}>HB+</Text></View>
          <Text style={styles.brand}>HB Plus</Text>
        </View>
        <Pressable onPress={signOut} disabled={busy} accessibilityRole="button" accessibilityLabel="Log out" style={({ pressed }) => [styles.logout, pressed && { opacity: 0.7 }]}>
          <Text style={styles.logoutText}>{busy ? 'Signing out…' : 'Log out'}</Text>
        </Pressable>
      </View>
      {profile.isTest && (
        <View style={styles.banner} accessibilityRole="alert"><Text style={styles.bannerText}>Test mode · sample data · no real session</Text></View>
      )}
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.inner}>
          <Text style={styles.welcome} accessibilityRole="header">Welcome back, {first}</Text>
          <Text style={styles.sub}>Here’s your account overview.</Text>
          <View style={styles.tiles}>
            <Tile label="Role" value={profile.role === 'admin' ? 'Admin' : 'User'} />
            <Tile label="Status" value="Verified" />
            <Tile label="Last login" value={profile.lastLoginAt ? profile.lastLoginAt.toLocaleDateString() : '—'} />
          </View>
          <UserProfileCard profile={profile} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: 14, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 34, height: 34, borderRadius: 9, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  brand: { fontSize: 17, fontWeight: '700', color: colors.text },
  logout: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  logoutText: { color: colors.text, fontWeight: '600', fontSize: 14 },
  banner: { backgroundColor: '#FEF3C7', paddingVertical: 8, alignItems: 'center' },
  bannerText: { color: '#92400E', fontWeight: '600', fontSize: 13 },
  body: { padding: spacing.lg, alignItems: 'center' },
  inner: { width: '100%', maxWidth: 720 },
  welcome: { fontSize: 28, fontWeight: '800', color: colors.text },
  sub: { color: colors.textMuted, marginTop: 4, marginBottom: spacing.lg, fontSize: 16 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: spacing.lg },
  tile: { flexGrow: 1, flexBasis: 150, backgroundColor: colors.surface, borderRadius: radius.md, padding: 16, borderWidth: 1, borderColor: colors.border },
  tileLabel: { color: colors.textMuted, fontSize: 13 },
  tileValue: { color: colors.text, fontSize: 20, fontWeight: '700', marginTop: 4 },
});
