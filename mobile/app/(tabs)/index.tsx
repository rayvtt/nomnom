import { useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useStore, selectTdee, selectTodayTotals } from '@/store/useStore';
import { logsApi, profileApi } from '@/lib/api';

const C = Colors.dark;

function macroTargets(kcal: number) {
  return {
    kcal,
    protein_g: Math.round((kcal * 0.30) / 4),
    carbs_g:   Math.round((kcal * 0.40) / 4),
    fat_g:     Math.round((kcal * 0.30) / 9),
  };
}

function pct(value: number, max: number) {
  return Math.min(1, value / Math.max(max, 1));
}

type MacroBarProps = { label: string; current: number; max: number; color: string; unit?: string };
function MacroBar({ label, current, max, color, unit = 'g' }: MacroBarProps) {
  const fill = pct(current, max);
  return (
    <View style={bar.row}>
      <Text style={bar.label}>{label}</Text>
      <View style={bar.track}>
        <View style={[bar.fill, { width: `${Math.round(fill * 100)}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={bar.value}>
        {current}
        <Text style={bar.max}>/{max}{unit}</Text>
      </Text>
    </View>
  );
}

const bar = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  label: { width: 70, color: C.text2, fontSize: 12 },
  track: { flex: 1, height: 6, backgroundColor: C.bg3, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  value: { width: 64, color: C.text, fontSize: 12, textAlign: 'right' },
  max: { color: C.text3 },
});

export default function TodayScreen() {
  const profile = useStore((s) => s.profile);
  const todayLogs = useStore((s) => s.todayLogs);
  const userId = useStore((s) => s.userId);
  const setProfile = useStore((s) => s.setProfile);
  const setTodayLogs = useStore((s) => s.setTodayLogs);
  const tdee = useStore(selectTdee);
  const totals = useStore(selectTodayTotals);
  const targets = macroTargets(tdee);

  async function refresh() {
    // Don't fetch if not logged in yet
    if (!userId) return;
    try {
      const [p, logs] = await Promise.all([profileApi.get(), logsApi.getDay()]);
      setProfile(p);
      setTodayLogs(logs);
    } catch {
      // silently ignore — user may still be logging in
    }
  }

  useFocusEffect(useCallback(() => { refresh(); }, [userId]));

  const kcalPct = pct(totals.kcal, targets.kcal);
  const kcalColor = kcalPct > 1 ? C.red : kcalPct > 0.8 ? C.accent2 : C.green;
  const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} tintColor={C.accent} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Xin chào{profile?.display_name ? `, ${profile.display_name}` : ''} 👋</Text>
        <Text style={styles.date}>{today}</Text>
      </View>

      <View style={styles.kcalCard}>
        <View style={styles.kcalMain}>
          <Text style={[styles.kcalNum, { color: kcalColor }]}>{totals.kcal}</Text>
          <Text style={styles.kcalLabel}>/ {targets.kcal} kcal</Text>
        </View>
        <Text style={styles.kcalSub}>
          {targets.kcal - totals.kcal > 0
            ? `Còn ${targets.kcal - totals.kcal} kcal`
            : `Vượt ${totals.kcal - targets.kcal} kcal`}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dinh dưỡng hôm nay</Text>
        <MacroBar label="Protein"  current={Math.round(totals.protein_g)} max={targets.protein_g} color={C.accent} />
        <MacroBar label="Carbs"    current={Math.round(totals.carbs_g)}   max={targets.carbs_g}   color={C.accent2} />
        <MacroBar label="Chất béo" current={Math.round(totals.fat_g)}     max={targets.fat_g}     color={C.green} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Bữa ăn hôm nay</Text>
        {!userId && (
          <Text style={styles.empty}>Đang tải...</Text>
        )}
        {userId && todayLogs?.meals.length === 0 && (
          <Text style={styles.empty}>Chưa có bữa nào. Thêm bữa ăn đầu tiên!</Text>
        )}
        {todayLogs?.meals.map((meal) => (
          <View key={meal.id} style={styles.mealRow}>
            <View style={styles.mealInfo}>
              <Text style={styles.mealName}>{meal.dish_name}</Text>
              <Text style={styles.mealSlot}>{meal.meal_slot}</Text>
            </View>
            <View style={styles.mealMacros}>
              <Text style={styles.mealKcal}>{meal.kcal} kcal</Text>
              <Text style={styles.mealDetail}>
                P {meal.protein_g}g · C {meal.carbs_g}g · F {meal.fat_g}g
              </Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.logBtn}>
        <Text style={styles.logBtnText}>+ Thêm bữa ăn</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 32, gap: 16 },
  header: { marginBottom: 8 },
  greeting: { fontSize: 22, fontWeight: '700', color: C.text },
  date: { fontSize: 13, color: C.text2, marginTop: 4 },
  kcalCard: {
    backgroundColor: C.bg2, borderRadius: 16, padding: 20,
    alignItems: 'center', borderWidth: 1, borderColor: C.cardBorder,
  },
  kcalMain: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  kcalNum: { fontSize: 52, fontWeight: '700' },
  kcalLabel: { fontSize: 16, color: C.text2 },
  kcalSub: { fontSize: 13, color: C.text2, marginTop: 4 },
  card: {
    backgroundColor: C.bg2, borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: C.cardBorder, gap: 4,
  },
  cardTitle: { fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 12 },
  empty: { color: C.text3, fontSize: 13, textAlign: 'center', paddingVertical: 8 },
  mealRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.cardBorder,
  },
  mealInfo: { flex: 1 },
  mealName: { fontSize: 14, color: C.text, fontWeight: '500' },
  mealSlot: { fontSize: 12, color: C.text3, marginTop: 2, textTransform: 'capitalize' },
  mealMacros: { alignItems: 'flex-end' },
  mealKcal: { fontSize: 14, color: C.accent, fontWeight: '600' },
  mealDetail: { fontSize: 11, color: C.text3, marginTop: 2 },
  logBtn: {
    backgroundColor: C.accent, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 4,
  },
  logBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
