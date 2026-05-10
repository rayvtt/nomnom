import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Switch, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useStore } from '@/store/useStore';
import { setupApi, type SetupConfig } from '@/lib/api';

const C = Colors.dark;

const GOALS = [
  { id: 'maintain', vi: 'Duy trì', label: '⚖️' },
  { id: 'lose',     vi: 'Giảm cân', label: '🔥' },
  { id: 'gain',     vi: 'Tăng cơ',  label: '💪' },
] as const;

function formatVnd(vnd: number) {
  return new Intl.NumberFormat('vi-VN').format(vnd) + '₫';
}

export default function OrderScreen() {
  const setupConfig = useStore((s) => s.setupConfig);
  const setSetupConfig = useStore((s) => s.setSetupConfig);
  const [saving, setSaving] = useState(false);
  const [local, setLocal] = useState<SetupConfig | null>(null);

  useFocusEffect(useCallback(() => {
    setupApi.get().then((c) => {
      setSetupConfig(c);
      setLocal(c);
    });
  }, []));

  if (!local) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={C.accent} size="large" />
      </View>
    );
  }

  function update(patch: Partial<SetupConfig>) {
    setLocal((prev) => prev ? { ...prev, ...patch } : prev);
  }

  async function save() {
    if (!local) return;
    setSaving(true);
    try {
      const updated = await setupApi.update(local);
      setSetupConfig(updated);
      setLocal(updated);
      Alert.alert('Đã lưu', local.active ? 'Smart Order đã được kích hoạt! 🎉' : 'Cài đặt đã lưu.');
    } catch (e: any) {
      Alert.alert('Lỗi', e.message);
    } finally {
      setSaving(false);
    }
  }

  const monthlyBudget = local.meals_per_day * 30 * local.budget_vnd;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>⚙️ Smart Order</Text>
      <Text style={styles.sub}>Cài đặt một lần — NomNom lo cả tháng.</Text>

      {/* Meal times */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Giờ ăn</Text>
        {local.meal_times.map((m, i) => (
          <View key={m.slot} style={styles.mealRow}>
            <Text style={styles.mealIcon}>{m.icon}</Text>
            <Text style={styles.mealSlot}>{m.slot}</Text>
            <Text style={styles.mealTime}>{m.time}</Text>
          </View>
        ))}
        <Text style={styles.hint}>Sẽ nhận thông báo 30 phút trước mỗi bữa.</Text>
      </View>

      {/* Meals per day */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Số bữa / ngày</Text>
        <View style={styles.segRow}>
          {[2, 3, 4, 5].map((n) => (
            <TouchableOpacity
              key={n}
              style={[styles.segBtn, local.meals_per_day === n && styles.segBtnActive]}
              onPress={() => update({ meals_per_day: n })}
            >
              <Text style={[styles.segText, local.meals_per_day === n && styles.segTextActive]}>
                {n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Budget */}
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <Text style={styles.cardTitle}>Ngân sách / bữa</Text>
          <Text style={styles.valueAccent}>{formatVnd(local.budget_vnd)}</Text>
        </View>
        <Text style={styles.hint}>≈ {formatVnd(monthlyBudget)} / tháng ({local.meals_per_day} bữa × 30 ngày)</Text>

        <View style={styles.sliderRow}>
          {[40000, 60000, 85000, 120000, 200000].map((v) => (
            <TouchableOpacity
              key={v}
              style={[styles.budgetBtn, local.budget_vnd === v && styles.budgetBtnActive]}
              onPress={() => update({ budget_vnd: v })}
            >
              <Text style={[styles.budgetText, local.budget_vnd === v && styles.budgetTextActive]}>
                {(v / 1000)}k
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Delivery time */}
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <Text style={styles.cardTitle}>Thời gian giao tối đa</Text>
          <Text style={styles.valueAccent}>{local.delivery_max_min}'</Text>
        </View>
        <Text style={styles.hint}>≈ {(local.delivery_max_min * 0.12).toFixed(1)} km bán kính</Text>

        <View style={styles.sliderRow}>
          {[15, 20, 25, 30, 40].map((v) => (
            <TouchableOpacity
              key={v}
              style={[styles.budgetBtn, local.delivery_max_min === v && styles.budgetBtnActive]}
              onPress={() => update({ delivery_max_min: v })}
            >
              <Text style={[styles.budgetText, local.delivery_max_min === v && styles.budgetTextActive]}>
                {v}'
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Goal */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mục tiêu</Text>
        <View style={styles.segRow}>
          {GOALS.map((g) => (
            <TouchableOpacity
              key={g.id}
              style={[styles.goalBtn, local.goal === g.id && styles.goalBtnActive]}
              onPress={() => update({ goal: g.id })}
            >
              <Text style={styles.goalIcon}>{g.label}</Text>
              <Text style={[styles.goalText, local.goal === g.id && styles.goalTextActive]}>
                {g.vi}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Notification channels */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Nhận thông báo qua</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>📱 Điện thoại</Text>
          <Switch
            value={local.notify_phone}
            onValueChange={(v) => update({ notify_phone: v })}
            trackColor={{ true: C.green, false: C.bg3 }}
            thumbColor="#fff"
          />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>💻 Máy tính</Text>
          <Switch
            value={local.notify_desktop}
            onValueChange={(v) => update({ notify_desktop: v })}
            trackColor={{ true: C.green, false: C.bg3 }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Activate */}
      <TouchableOpacity
        style={[styles.activateBtn, local.active && styles.activateBtnOn]}
        onPress={() => { update({ active: !local.active }); }}
      >
        <Text style={styles.activateText}>
          {local.active ? '✓ Đang hoạt động — chạm để tắt' : 'Kích hoạt Smart Order →'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveBtnText}>Lưu cài đặt</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 48, gap: 12 },
  loading: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: C.text },
  sub: { fontSize: 14, color: C.text2, marginBottom: 8 },
  card: {
    backgroundColor: C.bg2,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    gap: 8,
  },
  cardTitle: { fontSize: 13, fontWeight: '600', color: C.text2, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  valueAccent: { fontSize: 18, fontWeight: '700', color: C.accent },
  hint: { fontSize: 12, color: C.text3 },
  mealRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  mealIcon: { fontSize: 18 },
  mealSlot: { flex: 1, color: C.text, fontSize: 14, textTransform: 'capitalize' },
  mealTime: { color: C.accent2, fontSize: 15, fontWeight: '600' },
  segRow: { flexDirection: 'row', gap: 8 },
  segBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 8,
    backgroundColor: C.bg3, borderWidth: 1, borderColor: C.cardBorder,
    alignItems: 'center',
  },
  segBtnActive: { backgroundColor: 'rgba(255,106,40,0.15)', borderColor: C.accent },
  segText: { color: C.text2, fontSize: 15, fontWeight: '500' },
  segTextActive: { color: C.accent, fontWeight: '700' },
  sliderRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  budgetBtn: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    backgroundColor: C.bg3, borderWidth: 1, borderColor: C.cardBorder,
  },
  budgetBtnActive: { backgroundColor: 'rgba(255,106,40,0.15)', borderColor: C.accent },
  budgetText: { color: C.text2, fontSize: 13 },
  budgetTextActive: { color: C.accent, fontWeight: '700' },
  goalBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    backgroundColor: C.bg3, borderWidth: 1, borderColor: C.cardBorder,
    alignItems: 'center', gap: 4,
  },
  goalBtnActive: { backgroundColor: 'rgba(52,211,153,0.12)', borderColor: C.green },
  goalIcon: { fontSize: 20 },
  goalText: { color: C.text2, fontSize: 12 },
  goalTextActive: { color: C.green, fontWeight: '600' },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 4,
  },
  toggleLabel: { color: C.text, fontSize: 15 },
  activateBtn: {
    backgroundColor: C.bg3,
    borderWidth: 1.5,
    borderColor: C.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  activateBtnOn: { backgroundColor: 'rgba(52,211,153,0.15)', borderColor: C.green },
  activateText: { color: C.text, fontSize: 16, fontWeight: '600' },
  saveBtn: {
    backgroundColor: C.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
