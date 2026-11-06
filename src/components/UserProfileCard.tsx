import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { UserProfile } from '../types/auth';
import { colors } from '../theme/colors';
import { radius, shadow, spacing } from '../theme/spacing';

export default function UserProfileCard({ profile }: { profile: UserProfile }) {
  const isAdmin = profile.role === 'admin';
  const initials = profile.displayName.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
  const rows: [string, string][] = [
    ['Full name', profile.displayName],
    ['Official email', profile.email],
    ['Authentication', 'Verified'],
    ['Last login', profile.lastLoginAt ? profile.lastLoginAt.toLocaleString() : '—'],
  ];
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        {profile.photoURL ? (
          <Image source={{ uri: profile.photoURL }} style={styles.avatar} accessibilityLabel="Profile picture" />
        ) : (
          <View style={[styles.avatar, styles.fallback]}><Text style={styles.initials}>{initials}</Text></View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{profile.displayName}</Text>
          <View style={[styles.badge, { backgroundColor: isAdmin ? colors.adminSoft : colors.primarySoft }]}>
            <Text style={[styles.badgeText, { color: isAdmin ? colors.admin : colors.primary }]}>{isAdmin ? 'Admin' : 'User'}</Text>
          </View>
        </View>
      </View>
      {rows.map(([k, v]) => (
        <View key={k} style={styles.row}>
          <Text style={styles.key}>{k}</Text>
          {k === 'Authentication'
            ? <View style={styles.ok}><Text style={styles.okText}>● {v}</Text></View>
            : <Text style={styles.val}>{v}</Text>}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadow },
  top: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, gap: spacing.md },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  fallback: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#fff', fontSize: 24, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 6 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.pill },
  badgeText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderTopWidth: 1, borderTopColor: colors.border, flexWrap: 'wrap', gap: 4 },
  key: { color: colors.textMuted, fontSize: 14 },
  val: { color: colors.text, fontSize: 15, fontWeight: '500' },
  ok: { backgroundColor: colors.successSoft, paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill },
  okText: { color: colors.success, fontWeight: '600', fontSize: 13 },
});
