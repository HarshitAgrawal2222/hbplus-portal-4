import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius } from '../theme/spacing';

export default function GoogleSignInButton({ onPress, loading }: { onPress: () => void; loading?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel="Sign in with Google"
      style={({ pressed }) => [styles.btn, pressed && styles.active, loading && { opacity: 0.7 }]}
    >
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <View style={styles.row}>
          <View style={styles.g}><Text style={styles.gText}>G</Text></View>
          <Text style={styles.label}>Sign in with Google</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { height: 52, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  active: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  row: { flexDirection: 'row', alignItems: 'center' },
  g: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#4285F4', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  gText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  label: { color: colors.text, fontSize: 16, fontWeight: '600' },
});
