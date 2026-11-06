import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { ALLOWED_DOMAIN } from '../constants/config';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

export default function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const { signInEmail, signUpEmail, forgotPassword, busy } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const signup = mode === 'signup';

  const submit = async () => {
    if (signup) {
      if (await signUpEmail(name, email, password)) router.replace('/');
    } else {
      await signInEmail(email, password);
    }
  };

  return (
    <View style={{ gap: spacing.md }}>
      {signup && (
        <Field label="Full name" value={name} onChangeText={setName} autoComplete="name" textContentType="name" />
      )}
      <Field label="Official email" value={email} onChangeText={setEmail} placeholder={`name@${ALLOWED_DOMAIN}`}
        keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" />
      <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry={!show}
        autoCapitalize="none" autoComplete={signup ? 'new-password' : 'current-password'}
        textContentType={signup ? 'newPassword' : 'password'} onSubmitEditing={submit}
        right={<Pressable onPress={() => setShow((s) => !s)} accessibilityLabel="Toggle password visibility"><Text style={styles.toggle}>{show ? 'Hide' : 'Show'}</Text></Pressable>} />
      {signup && <Text style={styles.help}>At least 8 characters. Only @{ALLOWED_DOMAIN} emails can register.</Text>}
      <Pressable onPress={submit} disabled={busy} accessibilityRole="button" style={({ pressed }) => [styles.primary, (pressed || busy) && { opacity: 0.8 }]}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>{signup ? 'Create account' : 'Log in'}</Text>}
      </Pressable>
      {!signup && (
        <Pressable onPress={() => forgotPassword(email)} disabled={busy} accessibilityRole="button">
          <Text style={styles.link}>Forgot password?</Text>
        </Pressable>
      )}
    </View>
  );
}

function Field({ label, right, ...props }: any) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput {...props} style={styles.input} placeholderTextColor="#94A3B8" accessibilityLabel={label} />
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.text, fontWeight: '600', marginBottom: 6, fontSize: 14 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: '#fff', paddingHorizontal: 14 },
  input: { flex: 1, height: 48, fontSize: 16, color: colors.text, outlineStyle: 'none' } as any,
  toggle: { color: colors.primary, fontWeight: '600' },
  help: { color: colors.textMuted, fontSize: 13 },
  primary: { height: 52, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { color: colors.primary, fontWeight: '600', textAlign: 'center' },
});
