import { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useStore } from '@/store/useStore';
import { profileApi, type Profile } from '@/lib/api';
import { supabase } from '@/lib/supabase';

const C = Colors.dark;

const ACTIVITY = [
  { id: 'sedentary',   vi: 'Ít vận động',             en: 'Sedentary',      multiplier: 1.2,   icon: '🛋️' },
  { id: 'light',       vi: 'Nhẹ (1–3 ngày/tuần)',     en: 'Light',          multiplier: 1.375, icon: '🚶' },
  { id: 'moderate',    vi: 'Vừa (3–5 ngày)',           en: 'Moderate',       multiplier: 1.55,  icon: '🏃' },
  { id: 'active',      vi: 'Nhiều (6–7 ngày)',         en: 'Active',         multiplier: 1.725, icon: '💪' },
  { id: 'very_active', vi: 'Rất nhiều / lao động nặng', en: 'Very active',  multiplier: 1.9,   icon: '🏋️' },
] as const;

const GOALS = [
  { id: 'maintain', vi: 'Duy trì', en: 'Maintain', icon: '⚖️', color: C.accent2 },
  { id: 'lose',     vi: 'Giảm cân', en: 'Lose',    icon: '🔥', color: C.red },
  { id: 'gain',     vi: 'Tăng cơ',  en: 'Gain',    icon: '💪', color: C.green },
] as const;

const LANGS = [
  { id: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { id: 'en', label: 'English',    flag: '🇺🇸' },
] as const;

function calcTdee(w: number, h: number, a: number, actId: string) {
  const bmr = 10 * w + 6.25 * h - 5 * a + 5;
  const mult = ACTIVITY.find((x) => x.id === actId)?.multiplier ?? 1.55;
  return Math.round(bmr * mult);
}

export default function ProfileScreen() {
  const profile    = useStore((s) => s.profile);
  const setProfile = useStore((s) => s.setProfile);
  const setLang    = useStore((s) => s.setLang);

  const [weight,   setWeight]   = useState('');
  const [height,   setHeight]   = useState('');
  const [age,      setAge]      = useState('');
  const [activity, setActivity] = useState<Profile['activity_level']>('moderate');
  const [goal,     setGoal]     = useState<Profile['goal']>('maintain');
  const [lang,     setLocalLang]= useState<'vi' | 'en'>('vi');
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);

  useFocusEffect(useCallback(() => {
    profileApi.get().then((p) => {
      setProfile(p);
      setWeight(p.weight_kg?.toString() ?? '');
      setHeight(p.height_cm?.toString() ?? '');
      setAge(p.age?.toString() ?? '');
      setActivity(p.activity_level ?? 'moderate');
      setGoal(p.goal ?? 'maintain');
      setLocalLang(p.lang ?? 'vi');
    }).catch(() => {});
  }, []));

  const w = Number(weight), h = Number(height), a = Number(age);
  const tdeePreview = w && h && a ? calcTdee(w, h, a, activity) : null;
  const bmi = w && h ? (w / ((h / 100) ** 2)) : null;

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const updated = await profileApi.update({
        weightKg:      weight ? w : undefined,
        heightCm:      height ? h : undefined,
        age:           age    ? a : undefined,
        activityLevel: activity,   // ← camelCase — matches backend schema
        goal,
        lang,
      } as any);
      setProfile(updated);
      setLang(lang);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      Alert.alert('Lỗi lưu', e.message ?? 'Thử lại sau.');
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ── Header ── */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Hồ sơ</Text>
          {profile?.display_name && (
            <Text style={styles.displayName}>{profile.display_name}</Text>
          )}
        </View>
        {saved && (
          <View style={styles.savedBadge}>
            <Text style={styles.savedText}>✓ Đã lưu</Text>
          </View>
        )}
      </View>

      {/* ── Body stats ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Thể trạng</Text>
        <View style={styles.row3}>
          <StatInput label="Cân nặng" unit="kg" value={weight} onChange={setWeight} placeholder="70" />
          <StatInput label="Chiều cao" unit="cm" value={height} onChange={setHeight} placeholder="170" />
          <StatInput label="Tuổi" unit="t" value={age} onChange={setAge} placeholder="25" keyboard="number-pad" />
        </View>

        {/* BMI + TDEE preview */}
        {tdeePreview && (
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Text style={styles.statNum}>{tdeePreview.toLocaleString()}</Text>
              <Text style={styles.statLabel}>kcal / ngày</Text>
            </View>
            {bmi && (
              <View style={[styles.statPill, { borderColor: bmiColor(bmi) + '66' }]}>
                <Text style={[styles.statNum, { color: bmiColor(bmi) }]}>{bmi.toFixed(1)}</Text>
                <Text style={styles.statLabel}>BMI · {bmiLabel(bmi)}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* ── Activity level ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mức độ hoạt động</Text>
        {ACTIVITY.map((ac) => (
          <TouchableOpacity
            key={ac.id}
            style={[styles.optionRow, activity === ac.id && styles.optionRowActive]}
            onPress={() => setActivity(ac.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.optionIcon}>{ac.icon}</Text>
            <Text style={[styles.optionText, activity === ac.id && styles.optionTextActive]}>
              {ac.vi}
            </Text>
            {activity === ac.id && <Text style={styles.checkMark}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Goal ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mục tiêu</Text>
        <View style={styles.segRow}>
          {GOALS.map((g) => (
            <TouchableOpacity
              key={g.id}
              style={[styles.goalBtn, goal === g.id && { borderColor: g.color, backgroundColor: g.color + '18' }]}
              onPress={() => setGoal(g.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.goalIcon}>{g.icon}</Text>
              <Text style={[styles.goalText, goal === g.id && { color: g.color, fontWeight: '700' }]}>
                {g.vi}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Language ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ngôn ngữ</Text>
        <View style={styles.segRow}>
          {LANGS.map((l) => (
            <TouchableOpacity
              key={l.id}
              style={[styles.langBtn, lang === l.id && styles.langBtnActive]}
              onPress={() => setLocalLang(l.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.flagText}>{l.flag}</Text>
              <Text style={[styles.langText, lang === l.id && styles.langTextActive]}>{l.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Save ── */}
      <TouchableOpacity style={[styles.saveBtn, saved && styles.saveBtnDone]} onPress={save} disabled={saving} activeOpacity={0.85}>
        {saving
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.saveBtnText}>{saved ? '✓ Đã lưu' : 'Lưu thay đổi'}</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.7}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatInput({
  label, unit, value, onChange, placeholder, keyboard = 'decimal-pad',
}: {
  label: string; unit: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  keyboard?: 'decimal-pad' | 'number-pad';
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboard}
          placeholder={placeholder}
          placeholderTextColor={C.text3}
        />
        <Text style={styles.inputUnit}>{unit}</Text>
      </View>
    </View>
  );
}

function bmiColor(bmi: number) {
  if (bmi < 18.5) return C.blue;
  if (bmi < 25)   return C.green;
  if (bmi < 30)   return C.accent2;
  return C.red;
}

function bmiLabel(bmi: number) {
  if (bmi < 18.5) return 'Gầy';
  if (bmi < 25)   return 'Bình thường';
  if (bmi < 30)   return 'Thừa cân';
  return 'Béo phì';
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 48, gap: 12 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  title: { fontSize: 26, fontWeight: '800', color: C.text },
  displayName: { fontSize: 15, color: C.text2, marginTop: 3 },
  savedBadge: { backgroundColor: 'rgba(52,211,153,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: C.green + '44' },
  savedText: { color: C.green, fontSize: 13, fontWeight: '600' },

  card: { backgroundColor: C.bg2, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.cardBorder, gap: 10 },
  cardTitle: { fontSize: 12, fontWeight: '600', color: C.text2, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },

  row3: { flexDirection: 'row', gap: 10 },
  inputGroup: { flex: 1 },
  inputLabel: { fontSize: 11, color: C.text3, marginBottom: 5 },
  inputWrap: { position: 'relative' },
  input: {
    backgroundColor: C.bg3, borderWidth: 1, borderColor: C.cardBorder,
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10,
    color: C.text, fontSize: 16, fontWeight: '600', textAlign: 'center',
  },
  inputUnit: { position: 'absolute', bottom: 6, right: 6, fontSize: 10, color: C.text3 },

  statsRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  statPill: {
    flex: 1, backgroundColor: C.bg3, borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: C.accent + '44',
  },
  statNum: { fontSize: 20, fontWeight: '800', color: C.accent },
  statLabel: { fontSize: 11, color: C.text3, marginTop: 2 },

  optionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, paddingHorizontal: 8, borderRadius: 10,
  },
  optionRowActive: { backgroundColor: 'rgba(255,106,40,0.08)' },
  optionIcon: { fontSize: 18, width: 26 },
  optionText: { flex: 1, color: C.text2, fontSize: 14 },
  optionTextActive: { color: C.accent },
  checkMark: { color: C.accent, fontSize: 14, fontWeight: '700' },

  segRow: { flexDirection: 'row', gap: 8 },
  goalBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: C.bg3, borderWidth: 1.5, borderColor: C.cardBorder,
    alignItems: 'center', gap: 5,
  },
  goalIcon: { fontSize: 20 },
  goalText: { color: C.text2, fontSize: 12 },

  langBtn: {
    flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6,
    paddingVertical: 11, borderRadius: 10,
    backgroundColor: C.bg3, borderWidth: 1, borderColor: C.cardBorder,
  },
  langBtnActive: { backgroundColor: 'rgba(255,106,40,0.1)', borderColor: C.accent },
  flagText: { fontSize: 18 },
  langText: { color: C.text2, fontSize: 13 },
  langTextActive: { color: C.accent, fontWeight: '600' },

  saveBtn: { backgroundColor: C.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  saveBtnDone: { backgroundColor: C.green },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  logoutBtn: { paddingVertical: 14, alignItems: 'center' },
  logoutText: { color: C.text3, fontSize: 14 },
});
