import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/colors';

const C = Colors.dark;

const GOALS = [
  { id: 'maintain', vi: 'Duy trì cân nặng', en: 'Maintain weight' },
  { id: 'lose',     vi: 'Giảm cân',         en: 'Lose weight' },
  { id: 'gain',     vi: 'Tăng cân / cơ',    en: 'Gain weight / muscle' },
] as const;

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [goal, setGoal] = useState<'maintain' | 'lose' | 'gain'>('maintain');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!email || !password || !name) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ các trường.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Mật khẩu yếu', 'Mật khẩu phải ít nhất 8 ký tự.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name, goal } },
    });
    setLoading(false);
    if (error) {
      Alert.alert('Đăng ký thất bại', error.message);
    } else {
      Alert.alert(
        'Kiểm tra email',
        'Chúng tôi đã gửi link xác nhận. Vui lòng kiểm tra hòm thư.',
      );
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>🍜 NomNom</Text>
        <Text style={styles.tagline}>Tạo tài khoản để bắt đầu.</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Tên hiển thị</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nguyễn Văn A"
            placeholderTextColor={C.text3}
          />

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
            placeholder="Ít nhất 8 ký tự"
            placeholderTextColor={C.text3}
          />

          <Text style={[styles.label, { marginTop: 8 }]}>Mục tiêu</Text>
          <View style={styles.goals}>
            {GOALS.map((g) => (
              <TouchableOpacity
                key={g.id}
                style={[styles.goalBtn, goal === g.id && styles.goalBtnActive]}
                onPress={() => setGoal(g.id)}
              >
                <Text style={[styles.goalText, goal === g.id && styles.goalTextActive]}>
                  {g.vi}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleSignup} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Đăng ký</Text>
            )}
          </TouchableOpacity>
        </View>

        <Link href="/(auth)/login" asChild>
          <TouchableOpacity>
            <Text style={styles.switch}>
              Đã có tài khoản? <Text style={{ color: C.accent }}>Đăng nhập</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  inner: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 40 },
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
  goals: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  goalBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.cardBorder,
    backgroundColor: C.bg3,
  },
  goalBtnActive: { borderColor: C.green, backgroundColor: 'rgba(52,211,153,0.12)' },
  goalText: { color: C.text2, fontSize: 13 },
  goalTextActive: { color: C.green },
  btn: {
    backgroundColor: C.accent,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  switch: { color: C.text2, textAlign: 'center', marginTop: 24, fontSize: 14 },
});
