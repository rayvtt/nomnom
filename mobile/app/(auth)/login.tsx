import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/colors';
import { useStore } from '@/store/useStore';
import { setGuestFlag } from '@/lib/guest';

const C = Colors.dark;

export default function LoginScreen() {
  const setGuest = useStore((s) => s.setGuest);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function continueAsGuest() {
    await setGuestFlag(true);
    setGuest(true);
    // _layout.tsx redirects to (tabs) once guest flips
  }

  async function handleLogin() {
    if (!email || !password) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert('Đăng nhập thất bại', error.message);
    // On success, _layout.tsx auth listener redirects to (tabs)
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        {/* Logo */}
        <Text style={styles.logo}>🍜 NomNom</Text>
        <Text style={styles.tagline}>Chuyên gia dinh dưỡng cho tất cả.</Text>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor={C.text3}
          />

          <Text style={styles.label}>Mật khẩu</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={C.text3}
          />

          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>
        </View>

        <Link href="/(auth)/signup" asChild>
          <TouchableOpacity>
            <Text style={styles.switch}>
              Chưa có tài khoản? <Text style={{ color: C.accent }}>Đăng ký</Text>
            </Text>
          </TouchableOpacity>
        </Link>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>hoặc</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.guestBtn} onPress={continueAsGuest} activeOpacity={0.8}>
          <Text style={styles.guestBtnText}>Xem thử không cần tài khoản →</Text>
        </TouchableOpacity>
        <Text style={styles.guestHint}>Dữ liệu lưu trên máy này. Đăng nhập sau để đồng bộ.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  logo: { fontSize: 32, color: C.text, fontWeight: '700', marginBottom: 6 },
  tagline: { fontSize: 14, color: C.text2, marginBottom: 40 },
  form: { gap: 8 },
  label: { fontSize: 13, color: C.text2, marginBottom: 2 },
  input: {
    backgroundColor: C.bg3,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: C.text,
    fontSize: 15,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: C.accent,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  switch: { color: C.text2, textAlign: 'center', marginTop: 24, fontSize: 14 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 28, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.cardBorder },
  dividerText: { color: C.text3, fontSize: 12 },
  guestBtn: {
    borderWidth: 1.5,
    borderColor: C.cardBorder,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  guestBtnText: { color: C.text, fontSize: 15, fontWeight: '600' },
  guestHint: { color: C.text3, fontSize: 12, textAlign: 'center', marginTop: 10 },
});
