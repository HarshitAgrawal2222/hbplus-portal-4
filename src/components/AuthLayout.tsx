import React from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { ALLOWED_DOMAIN } from '../constants/config';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

export function Banner({ kind, text }: { kind: 'error' | 'success'; text: string }) {
  const err = kind === 'error';
  return (
    <View accessibilityRole="alert" style={[b.box, { backgroundColor: err ? colors.dangerSoft : colors.successSoft, borderColor: err ? '#FECACA' : '#A7F3D0' }]}>
      <Text style={[b.text, { color: err ? colors.danger : colors.success }]}>{text}</Text>
    </View>
  );
}

const features = [
  ['Secure access', 'Organization accounts only, verified.'],
  ['One portal', 'Web, Android and iOS from one app.'],
  ['Role-based', 'Admin and user permissions.'],
];

export default function AuthLayout({ title, subtitle, children, footer }: {
  title: string; subtitle: string; children: React.ReactNode; footer?: React.ReactNode;
}) {
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  return (
    <View style={[s.root, wide && { flexDirection: 'row' }]}>
      {wide && (
        <View style={s.brandPane}>
          <View style={s.logo}><Text style={s.logoText}>HB+</Text></View>
          <Text style={s.headline}>Your team’s workspace, in one place.</Text>
          <Text style={s.lead}>Sign in with your organization account to continue.</Text>
          <View style={{ marginTop: 40, gap: 20 }}>
            {features.map(([t, d]) => (
              <View key={t} style={s.feature}>
                <View style={s.dot} />
                <View><Text style={s.fTitle}>{t}</Text><Text style={s.fDesc}>{d}</Text></View>
              </View>
            ))}
          </View>
        </View>
      )}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.formPane} keyboardShouldPersistTaps="handled">
        <View style={s.form}>
          {!wide && <View style={[s.logo, { backgroundColor: colors.primary, marginBottom: 24 }]}><Text style={s.logoText}>HB+</Text></View>}
          <Text style={s.title} accessibilityRole="header">{title}</Text>
          <Text style={s.subtitle}>{subtitle}</Text>
          {children}
          <View style={s.chip}><Text style={s.chipText}>Only @{ALLOWED_DOMAIN} accounts are allowed</Text></View>
          {footer && <Text style={s.footer}>{footer}</Text>}
        </View>
      </ScrollView>
    </View>
  );
}

const b = StyleSheet.create({
  box: { borderRadius: radius.md, padding: 14, marginBottom: 16, borderWidth: 1 },
  text: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
});
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  brandPane: { flex: 1, backgroundColor: colors.primaryDark, padding: 64, justifyContent: 'center' },
  logo: { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  logoText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  headline: { color: '#fff', fontSize: 38, fontWeight: '800', lineHeight: 46, maxWidth: 440 },
  lead: { color: '#C7D2FE', fontSize: 17, marginTop: 16, maxWidth: 420, lineHeight: 26 },
  feature: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#A5B4FC', marginTop: 7 },
  fTitle: { color: '#fff', fontWeight: '700', fontSize: 16 },
  fDesc: { color: '#C7D2FE', fontSize: 14, marginTop: 2 },
  formPane: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.surface },
  form: { width: '100%', maxWidth: 400 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 15, color: colors.textMuted, marginTop: 8, marginBottom: 28, lineHeight: 22 },
  chip: { alignSelf: 'center', marginTop: 24, backgroundColor: colors.primarySoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  chipText: { color: colors.primaryDark, fontSize: 12, fontWeight: '600' },
  footer: { marginTop: 20, textAlign: 'center', color: colors.textMuted, fontSize: 14 },
});
