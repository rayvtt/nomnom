import { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useStore, selectTdee, selectTodayTotals } from '@/store/useStore';
import { logsApi, profileApi } from '@/lib/api';
import { LogMealModal } from '@/components/LogMealModal';

const C = Colors.dark;

// ── Helpers ──────────────────────────────────────────────────────────────────

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

function qualityScore(totals: { protein_g: number; carbs_g: number; fat_g: number }, targets: ReturnType<typeof macroTargets>): number {
  if (targets.kcal === 0) return 0;
  const pp = pct(totals.protein_g, targets.protein_g);
  const cp = pct(totals.carbs_g,   targets.carbs_g);
  const fp = pct(totals.fat_g,     targets.fat_g);
  // Score penalizes both under and over
  const score = (
    (1 - Math.abs(pp - 0.8)) * 40 +
    (1 - Math.abs(cp - 0.8)) * 35 +
    (1 - Math.abs(fp - 0.8)) * 25
  );
  return Math.max(0, Math.min(100, Math.round(score)));
}

function kcalStatusColor(pct: number) {
  if (pct > 1.05) return C.red;
  if (pct > 0.9)  return C.accent2;
  if (pct > 0.5)  return C.green;
  return C.blue;
}

// ── Calorie Ring Card ─────────────────────────────────────────────────────────

function KcalRing({ current, target }: { current: number; target: number }) {
  const ratio = pct(current, target);
  const color = kcalStatusColor(ratio);
  const remaining = target - current;
  const label = remaining > 0 ? `còn ${remaining} kcal` : `vượt ${-remaining} kcal`;

  return (
    <View style={ring.card}>
      {/* Outer ring */}
      <View style={[ring.outerRing, { borderColor: color + '33' }]}>
        <View style={[ring.innerRing, { borderColor: color }]}>
          <Text style={[ring.num, { color }]}>{current.toLocaleString()}</Text>
          <Text style={ring.unit}>kcal</Text>
        </View>
      </View>
      {/* Caption row */}
      <View style={ring.infoCol}>
        <Text style={ring.target}>/ {target.toLocaleString()} kcal mục tiêu</Text>
        <View style={[ring.statusPill, { backgroundColor: color + '18' }]}>
          <Text style={[ring.statusText, { color }]}>{label}</Text>
        </View>
        {/* Mini progress track */}
        <View style={ring.track}>
          <View style={[ring.trackFill, { width: `${Math.round(Math.min(ratio, 1) * 100)}%` as any, backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
}

const ring = StyleSheet.create({
  card: {
    backgroundColor: C.bg2, borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 20,
    borderWidth: 1, borderColor: C.cardBorder,
  },
  outerRing: {
    width: 110, height: 110, borderRadius: 55,
    borderWidth: 6, justifyContent: 'center', alignItems: 'center',
  },
  innerRing: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 3, justifyContent: 'center', alignItems: 'center',
    backgroundColor: C.bg3,
  },
  num: { fontSize: 22, fontWeight: '800' },
  unit: { fontSize: 11, color: C.text3, marginTop: 1 },
  infoCol: { flex: 1, gap: 8 },
  target: { fontSize: 13, color: C.text2 },
  statusPill: { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 13, fontWeight: '600' },
  track: { height: 4, backgroundColor: C.bg3, borderRadius: 2, overflow: 'hidden' },
  trackFill: { height: '100%', borderRadius: 2 },
});

// ── Macro Bars ────────────────────────────────────────────────────────────────

function MacroRow({ totals, targets }: {
  totals: { protein_g: number; carbs_g: number; fat_g: number };
  targets: ReturnType<typeof macroTargets>;
}) {
  const macros = [
    { label: 'Protein', cur: Math.round(totals.protein_g), max: targets.protein_g, color: C.accent,  emoji: '🥩' },
    { label: 'Carbs',   cur: Math.round(totals.carbs_g),   max: targets.carbs_g,   color: C.accent2, emoji: '🌾' },
    { label: 'Fat',     cur: Math.round(totals.fat_g),     max: targets.fat_g,     color: C.green,   emoji: '🥑' },
  ];
  return (
    <View style={macro.row}>
      {macros.map((m) => {
        const fill = pct(m.cur, m.max);
        return (
          <View key={m.label} style={macro.pill}>
            <Text style={macro.emoji}>{m.emoji}</Text>
            <Text style={[macro.value, { color: fill > 1 ? C.red : m.color }]}>{m.cur}g</Text>
            <View style={macro.track}>
              <View style={[macro.fill, {
                width: `${Math.round(Math.min(fill, 1) * 100)}%` as any,
                backgroundColor: fill > 1 ? C.red : m.color,
              }]} />
            </View>
            <Text style={macro.max}>/{m.max}g</Text>
          </View>
        );
      })}
    </View>
  );
}

const macro = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  pill: {
    flex: 1, backgroundColor: C.bg2, borderRadius: 14,
    padding: 12, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: C.cardBorder,
  },
  emoji: { fontSize: 18 },
  value: { fontSize: 16, fontWeight: '800' },
  track: { width: '100%', height: 4, backgroundColor: C.bg3, borderRadius: 2, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 2 },
  max: { fontSize: 10, color: C.text3 },
});

// ── Quality Score ─────────────────────────────────────────────────────────────

function QualityBadge({ score }: { score: number }) {
  const color = score >= 70 ? C.green : score >= 50 ? C.accent2 : C.red;
  const label = score >= 70 ? 'Tốt' : score >= 50 ? 'Khá' : 'Cần cải thiện';
  return (
    <View style={[qs.wrap, { borderColor: color + '44' }]}>
      <View style={[qs.score, { borderColor: color }]}>
        <Text style={[qs.num, { color }]}>{score}</Text>
        <Text style={qs.over}>/100</Text>
      </View>
      <View>
        <Text style={qs.title}>Chỉ số dinh dưỡng</Text>
        <Text style={[qs.label, { color }]}>● {label}</Text>
      </View>
    </View>
  );
}

const qs = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.bg2, borderRadius: 14, padding: 14,
    borderWidth: 1,
  },
  score: { width: 56, height: 56, borderRadius: 28, borderWidth: 3, justifyContent: 'center', alignItems: 'center' },
  num: { fontSize: 20, fontWeight: '800' },
  over: { fontSize: 9, color: C.text3 },
  title: { fontSize: 13, color: C.text, fontWeight: '600' },
  label: { fontSize: 12, marginTop: 2, fontWeight: '600' },
});

// ── Main screen ───────────────────────────────────────────────────────────────

const SLOT_ICONS: Record<string, string> = {
  breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍿',
};
const SLOT_VI: Record<string, string> = {
  breakfast: 'Sáng', lunch: 'Trưa', dinner: 'Tối', snack: 'Ăn vặt',
};

export default function TodayScreen() {
  const profile      = useStore((s) => s.profile);
  const todayLogs    = useStore((s) => s.todayLogs);
  const userId       = useStore((s) => s.userId);
  const lang         = useStore((s) => s.lang);
  const setProfile   = useStore((s) => s.setProfile);
  const setTodayLogs = useStore((s) => s.setTodayLogs);
  const tdee         = useStore(selectTdee);
  const totals       = useStore(selectTodayTotals);
  const targets      = macroTargets(tdee);

  const [logOpen,    setLogOpen]    = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function refresh() {
    if (!userId) return;
    try {
      const [p, logs] = await Promise.all([profileApi.get(), logsApi.getDay()]);
      setProfile(p);
      setTodayLogs(logs);
    } catch {}
  }

  async function doRefresh() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  useFocusEffect(useCallback(() => { refresh(); }, [userId]));

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
  const score = qualityScore(totals, targets);
  const meals = todayLogs?.meals ?? [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={doRefresh} tintColor={C.accent} />
      }
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {profile?.display_name ? `Xin chào, ${profile.display_name} 👋` : 'NomNom 👋'}
        </Text>
        <Text style={styles.date}>{today}</Text>
      </View>

      {/* ── Calorie ring ── */}
      <KcalRing current={totals.kcal} target={targets.kcal} />

      {/* ── Macro pills ── */}
      <MacroRow totals={totals} targets={targets} />

      {/* ── Quality score ── */}
      {totals.kcal > 0 && <QualityBadge score={score} />}

      {/* ── Meal log ── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Bữa ăn hôm nay</Text>
          {meals.length > 0 && (
            <Text style={styles.mealCount}>{meals.length} bữa</Text>
          )}
        </View>

        {!userId && (
          <Text style={styles.empty}>Đang tải…</Text>
        )}
        {userId && meals.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyText}>Chưa có bữa nào.</Text>
            <Text style={styles.emptyHint}>Nhấn "+ Thêm bữa ăn" để bắt đầu.</Text>
          </View>
        )}

        {meals.map((meal, i) => (
          <View
            key={meal.id}
            style={[styles.mealRow, i === meals.length - 1 && { borderBottomWidth: 0 }]}
          >
            <Text style={styles.mealSlotIcon}>
              {SLOT_ICONS[meal.meal_slot] ?? '🍴'}
            </Text>
            <View style={styles.mealInfo}>
              <Text style={styles.mealName} numberOfLines={1}>{meal.dish_name}</Text>
              <Text style={styles.mealSlotLabel}>
                {SLOT_VI[meal.meal_slot] ?? meal.meal_slot}
                {meal.source === 'smart_order' && ' · Smart Order'}
              </Text>
            </View>
            <View style={styles.mealRight}>
              <Text style={styles.mealKcal}>{meal.kcal} kcal</Text>
              <Text style={styles.mealMacros}>
                P{meal.protein_g}·C{meal.carbs_g}·F{meal.fat_g}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.delBtn}
              hitSlop={10}
              onPress={async () => {
                try { await logsApi.remove(meal.id); await refresh(); } catch {}
              }}
            >
              <Ionicons name="close-circle" size={20} color={C.text3} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* ── Log button ── */}
      <TouchableOpacity style={styles.logBtn} onPress={() => setLogOpen(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={22} color="#fff" />
        <Text style={styles.logBtnText}>Thêm bữa ăn</Text>
      </TouchableOpacity>

      <LogMealModal
        visible={logOpen}
        onClose={() => setLogOpen(false)}
        onLogged={refresh}
        lang={lang}
      />
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 40, gap: 12 },

  header: { marginBottom: 4 },
  greeting: { fontSize: 22, fontWeight: '800', color: C.text },
  date: { fontSize: 13, color: C.text2, marginTop: 4 },

  card: { backgroundColor: C.bg2, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: C.cardBorder },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: C.text },
  mealCount: { fontSize: 12, color: C.text3, backgroundColor: C.bg3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },

  empty: { color: C.text3, fontSize: 13, textAlign: 'center', paddingVertical: 8 },
  emptyState: { alignItems: 'center', paddingVertical: 24, gap: 6 },
  emptyIcon: { fontSize: 32 },
  emptyText: { fontSize: 15, color: C.text2, fontWeight: '500' },
  emptyHint: { fontSize: 12, color: C.text3 },

  mealRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: C.cardBorder,
  },
  mealSlotIcon: { fontSize: 20 },
  mealInfo: { flex: 1 },
  mealName: { fontSize: 14, color: C.text, fontWeight: '500' },
  mealSlotLabel: { fontSize: 11, color: C.text3, marginTop: 2 },
  mealRight: { alignItems: 'flex-end' },
  mealKcal: { fontSize: 14, color: C.accent, fontWeight: '700' },
  mealMacros: { fontSize: 10, color: C.text3, marginTop: 2 },
  delBtn: { padding: 4 },

  logBtn: {
    backgroundColor: C.accent, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 8,
  },
  logBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
