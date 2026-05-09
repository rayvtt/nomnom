import { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useStore } from '@/store/useStore';
import { profileApi, type Profile } from '@/lib/api';
import { supabase } from '@/lib/supabase';

const C = Colors.dark;

const ACTIVITY = [
  { id: 'sedentary',  vi: 'Ít vận động',   multiplier: 1.2 },
  { id: 'light',      vi: 'Nhẹ (1-3 ngày/tuần)', multiplier: 1.375 },
  { id: 'moderate',   vi: 'Vừa (3-5 ngày)', multiplier: 1.55 },
  { id: 'active',     vi: 'Nhiều (6-7 ngày)', multiplier: 1.725 },
  { id: 'very_active',vi: 'Rất nhiều / lao động nặng', multiplier: 1.9 },
] as const;

const GOALS = [
  { id: 'maintain', vi: 'Duy trì cân nặng' },
  { id: 'lose',     vi: 'Giảm cân' },
  { id: 'gain',     vi: 'Tăng cân / cơ' },
] as const;

const LANGS = [
  { id: 'vi', label: 'Tiếng Việt' },
  { id: 'en', label: 'English' },
] as const;

export default function ProfileScreen() {
  const profile = useStore((s) => s.profile);
  const setProfile = useStore((s) => s.setProfile);
  const storeLang = useStore((s) => s.lang);
  const setLang = useStore((s) => s.setLang);

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [activity, setActivity] = useState<Profile['activity_level']>('moderate');
  const [goal, setGoal] = useState<Profile['goal']>('maintain');
  const [lang, setLocalLang] = useState<'vi' | 'en'>('vi');
  const [saving, setSaving] = useState(false);

  useFocusEffect(useCallback(() => {
    profileApi.get().then((p) => {
      setProfile(p);
      setWeight(p.weight_kg?.toString() ?? '');
      setHeight(p.height_cm?.toString() ?? '');
      setAge(p.age?.toString() ?? '');
      setActivity(p.activity_level);
      setGoal(p.goal);
      setLocalLang(p.lang);
    });
  }, []));

  async function save() {
    setSaving(true);
    try {
      const updated = await profileApi.update({
        weightKg: weight ? Number(weight) : undefined,
        heightCm: height ? Number(height) : undefined,
        age: age ? Number(age) : undefined,
        activity_level: activity,
        goal,
        lang,
      } as any);
      setProfile(updated);
      setLang(lang);
      Alert.alert('Đã lưu', 'Hồ sơ của bạn đã được cập nhật.');
    } catch (e: any) {
      Alert.alert('Lỗi', e.message);
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    // _layout.tsx auth listener handles redirect
  }

  const tdeePreview = (() => {
    const w = Number(weight);
    const h = Number(height);
    const a = Number(age);
    if (!w || !h || !a) return null;
    const bmr = 10 * w + 6.25 * h - 5 * a + 5;
    const m = ACTIVITY.find((x) => x.id === activity)?.multiplier ?? 1.55;
    return Math.round(bmr * m);
  })();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Hồ sơ</Text>
        {profile?.display_name && <Text style={styles.name}>{profile.display_name}</Text>}
      </View>

      {/* Body data */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Thể trạng</Text>
        <View style={styles.row3}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cân nặng (kg)</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholder="70"
              placeholderTextColor={C.text3}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Chiều cao (cm)</Text>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              keyboardType="decimal-pad"
              placeholder="170"
              placeholderTextColor={C.text3}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tuổi</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              placeholder="25"
              placeholderTextColor={C.text3}
            />
          </View>
        </View>
        {tdeePreview && (
          <View style={styles.tdeeBox}>
            <Text style={styles.tdeeLabel}>TDEE ước tính</Text>
            <Text style={styles.tdeeValue}>{tdeePreview} kcal/ngày</Text>
          </View>
        )}
      </View>

      {/* Activity level */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mức độ hoạt động</Text>
        {ACTIVITY.map((a) => (
          <TouchableOpacity
            key={a.id}
            style={[styles.optionRow, activity === a.id && styles.optionRowActive]}
            onPress={() => setActivity(a.id)}
          >
            <View style={[styles.radio, activity === a.id && styles.radioActive]} />
            <Text style={[styles.optionText, activity === a.id && styles.optionTextActive]}>
              {a.vi}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Goal */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mục tiêu</Text>
        <View style={styles.segRow}>
          {GOALS.map((g) => (
            <TouchableOpacity
              key={g.id}
              style={[styles.segBtn, goal === g.id && styles.segBtnActive]}
              onPress={() => setGoal(g.id)}
            >
              <Text style={[styles.segText, goal === g.id && styles.segTextActive]}>{g.vi}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Language */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ngôn ngữ</Text>
        <View style={styles.segRow}>
          {LANGS.map((l) => (
            <TouchableOpacity
              key={l.id}
              style={[styles.segBtn, lang === l.id && styles.segBtnActive]}
              onPress={() => setLocalLang(l.id)}
            >
              <Text style={[styles.segText, lang === l.id && styles.segTextActive]}>{l.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Lưu thay đổi</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 48, gap: 12 },
  header: { marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', color: C.text },
  name: { fontSize: 16, color: C.text2, marginTop: 4 },
  card: { backgroundColor: C.bg2, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.cardBorder, gap: 10 },
  cardTitle: { fontSize: 13, fontWeight: '600', color: C.text2, textTransform: 'uppercase', letterSpacing: 0.5 },
  row3: { flexDirection: 'row', gap: 10 },
  inputGroup: { flex: 1 },
  label: { fontSize: 11, color: C.text3, marginBottom: 4 },
  input: {
    backgroundColor: C.bg3,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: C.text,
    fontSize: 14,
    textAlign: 'center',
  },
  tdeeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(52,211,153,0.1)',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  tdeeLabel: { color: C.green, fontSize: 13 },
  tdeeValue: { color: C.green, fontSize: 13, fontWeight: '700' },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  optionRowActive: { backgroundColor: 'rgba(255,106,40,0.08)' },
  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: C.text3 },
  radioActive: { borderColor: C.accent, backgroundColor: C.accent },
  optionText: { color: C.text2, fontSize: 14 },
  optionTextActive: { color: C.accent },
  segRow: { flexDirection: 'row', gap: 8 },
  segBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 8,
    backgroundColor: C.bg3, borderWidth: 1, borderColor: C.cardBorder, alignItems: 'center',
  },
  segBtnActive: { backgroundColor: 'rgba(255,106,40,0.15)', borderColor: C.accent },
  segText: { color: C.text2, fontSize: 13 },
  segTextActive: { color: C.accent, fontWeight: '700' },
  saveBtn: { backgroundColor: C.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  logoutBtn: { paddingVertical: 14, alignItems: 'center' },
  logoutText: { color: C.text3, fontSize: 14 },
});
