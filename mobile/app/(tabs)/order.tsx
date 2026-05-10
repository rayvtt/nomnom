import { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Switch, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useStore, selectTdee, selectTodayTotals } from '@/store/useStore';
import { setupApi, nutritionApi, logsApi, type SetupConfig, type Dish } from '@/lib/api';

const C = Colors.dark;

const GOALS = [
  { id: 'maintain', vi: 'Duy trì', label: '⚖️' },
  { id: 'lose',     vi: 'Giảm cân', label: '🔥' },
  { id: 'gain',     vi: 'Tăng cơ',  label: '💪' },
] as const;

function formatVnd(vnd: number) {
  return new Intl.NumberFormat('vi-VN').format(vnd) + '₫';
}

function macroTargets(kcal: number) {
  return {
    kcal,
    protein_g: Math.round((kcal * 0.30) / 4),
    carbs_g:   Math.round((kcal * 0.40) / 4),
    fat_g:     Math.round((kcal * 0.30) / 9),
  };
}

// Returns { slot, time, icon, minutesUntil } for the next upcoming meal, or null if all passed
function nextMeal(mealTimes: SetupConfig['meal_times']): { slot: string; time: string; icon: string; minutesUntil: number } | null {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  let best: { slot: string; time: string; icon: string; minutesUntil: number } | null = null;
  for (const m of mealTimes) {
    const [hStr, mStr] = m.time.split(':');
    const mealMin = parseInt(hStr, 10) * 60 + parseInt(mStr, 10);
    const diff = mealMin - nowMin;
    if (diff > 0 && (best === null || diff < best.minutesUntil)) {
      best = { slot: m.slot, time: m.time, icon: m.icon, minutesUntil: diff };
    }
  }
  return best;
}

function fmtCountdown(min: number) {
  if (min < 60) return `${min} phút`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}g ${m}p` : `${h} giờ`;
}

// ── Smart Order live preview ─────────────────────────────────────────────────

type SmartPanelProps = {
  config: SetupConfig;
  onOrderDone: () => void;
};

function SmartOrderPanel({ config, onOrderDone }: SmartPanelProps) {
  const todayTotals = useStore(selectTodayTotals);
  const tdee = useStore(selectTdee);
  const targets = macroTargets(tdee);

  const [next, setNext] = useState(() => nextMeal(config.meal_times));
  const [recs, setRecs] = useState<Dish[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [ordering, setOrdering] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const gapProtein = Math.max(0, targets.protein_g - todayTotals.protein_g);
  const gapCarbs   = Math.max(0, targets.carbs_g   - todayTotals.carbs_g);
  const gapFat     = Math.max(0, targets.fat_g     - todayTotals.fat_g);
  const gapKcal    = Math.max(0, targets.kcal      - todayTotals.kcal);

  // Countdown ticker
  useEffect(() => {
    timerRef.current = setInterval(() => setNext(nextMeal(config.meal_times)), 60_000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [config.meal_times]);

  // Load recommendations
  useEffect(() => {
    setLoadingRecs(true);
    nutritionApi.match({
      kcal: gapKcal || targets.kcal,
      protein: gapProtein || targets.protein_g,
      budgetVnd: config.budget_vnd,
    }).then((dishes) => {
      setRecs(dishes.slice(0, 3));
    }).catch(() => {
      setRecs([]);
    }).finally(() => setLoadingRecs(false));
  }, [todayTotals.kcal, config.budget_vnd]);

  async function confirmOrder(dish: Dish) {
    if (!next) return;
    setOrdering(true);
    try {
      const slot = next.slot.toLowerCase();
      const mealSlot = (['breakfast', 'lunch', 'dinner', 'snack'].includes(slot)
        ? slot : 'lunch') as 'breakfast' | 'lunch' | 'dinner' | 'snack';

      await logsApi.log({
        mealSlot,
        dishId: dish.id,
        dishName: dish.name_vi,
        kcal: dish.kcal,
        proteinG: dish.protein_g,
        carbsG: dish.carbs_g,
        fatG: dish.fat_g,
        source: 'smart_order',
      });
      Alert.alert('Đã đặt hàng! 🎉', `${dish.emoji} ${dish.name_vi} đã được thêm vào nhật ký hôm nay.`);
      setSelected(null);
      onOrderDone();
    } catch (e: any) {
      Alert.alert('Lỗi', e.message);
    } finally {
      setOrdering(false);
    }
  }

  const allEaten = gapKcal === 0 && gapProtein === 0;

  return (
    <View style={so.container}>
      {/* Header row */}
      <View style={so.header}>
        <View style={so.statusDot} />
        <Text style={so.headerText}>Smart Order đang hoạt động</Text>
      </View>

      {/* Next meal countdown */}
      {next ? (
        <View style={so.countdownCard}>
          <Text style={so.mealIcon}>{next.icon}</Text>
          <View style={so.countdownInfo}>
            <Text style={so.mealSlot}>{next.slot}</Text>
            <Text style={so.mealTime}>{next.time}</Text>
          </View>
          <View style={so.countdownBadge}>
            <Text style={so.countdownLabel}>còn</Text>
            <Text style={so.countdownValue}>{fmtCountdown(next.minutesUntil)}</Text>
          </View>
        </View>
      ) : (
        <View style={so.countdownCard}>
          <Text style={so.mealIcon}>🌙</Text>
          <Text style={so.allDone}>Tất cả các bữa hôm nay đã qua. Ngủ ngon!</Text>
        </View>
      )}

      {/* Macro gaps */}
      {!allEaten && (
        <View style={so.gapsRow}>
          <GapPill label="Protein" value={gapProtein} unit="g" color={C.accent} />
          <GapPill label="Carbs"   value={gapCarbs}   unit="g" color={C.accent2} />
          <GapPill label="Fat"     value={gapFat}     unit="g" color={C.green} />
          <GapPill label="Kcal"    value={gapKcal}    unit="" color={C.text2} />
        </View>
      )}

      {allEaten && (
        <View style={so.doneBox}>
          <Text style={so.doneText}>Bạn đã đạt mục tiêu hôm nay! 🥗</Text>
        </View>
      )}

      {/* Dish recommendations */}
      {!allEaten && (
        <View style={so.recsSection}>
          <Text style={so.recsTitle}>Gợi ý cho bữa tiếp theo</Text>
          {loadingRecs ? (
            <ActivityIndicator color={C.accent} style={{ marginVertical: 16 }} />
          ) : recs.length === 0 ? (
            <Text style={so.noRecs}>Không tìm thấy món phù hợp.</Text>
          ) : (
            recs.map((dish, i) => {
              const overBudget = dish.avg_price_vnd > config.budget_vnd;
              const isSelected = selected === i;
              const matchScore = computeMatchScore(dish, gapProtein, gapCarbs, gapFat);
              return (
                <TouchableOpacity
                  key={dish.id}
                  style={[so.dishCard, isSelected && so.dishCardSelected, overBudget && so.dishCardDim]}
                  onPress={() => setSelected(isSelected ? null : i)}
                  activeOpacity={0.8}
                >
                  <View style={so.dishRow}>
                    <Text style={so.dishEmoji}>{dish.emoji}</Text>
                    <View style={so.dishInfo}>
                      <Text style={[so.dishName, overBudget && so.dimText]}>{dish.name_vi}</Text>
                      <Text style={so.dishMeta}>
                        {dish.kcal} kcal · P{dish.protein_g}g C{dish.carbs_g}g F{dish.fat_g}g
                      </Text>
                    </View>
                    <View style={so.dishRight}>
                      <View style={[so.matchBadge, { backgroundColor: matchColor(matchScore) + '22' }]}>
                        <Text style={[so.matchText, { color: matchColor(matchScore) }]}>{matchScore}%</Text>
                      </View>
                      <Text style={[so.priceText, overBudget && so.overBudget]}>
                        {formatVnd(dish.avg_price_vnd)}
                        {overBudget && ' ⚠'}
                      </Text>
                    </View>
                  </View>

                  {isSelected && (
                    <View style={so.actions}>
                      <TouchableOpacity
                        style={so.orderBtn}
                        onPress={() => confirmOrder(dish)}
                        disabled={ordering}
                      >
                        {ordering ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Text style={so.orderBtnText}>Đặt ngay →</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity style={so.skipBtn} onPress={() => setSelected(null)}>
                        <Text style={so.skipBtnText}>Bỏ qua</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      )}
    </View>
  );
}

function GapPill({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <View style={[so.gapPill, { borderColor: color + '44' }]}>
      <Text style={[so.gapValue, { color }]}>{value}{unit}</Text>
      <Text style={so.gapLabel}>{label}</Text>
    </View>
  );
}

function computeMatchScore(dish: Dish, gapP: number, gapC: number, gapF: number): number {
  const total = gapP + gapC + gapF;
  if (total === 0) return Math.round(dish.health_score);
  const wP = gapP / total;
  const wC = gapC / total;
  const wF = gapF / total;
  const diffP = Math.abs(dish.protein_g - gapP) / Math.max(gapP, 1);
  const diffC = Math.abs(dish.carbs_g   - gapC) / Math.max(gapC, 1);
  const diffF = Math.abs(dish.fat_g     - gapF) / Math.max(gapF, 1);
  const raw = 1 - (wP * diffP + wC * diffC + wF * diffF);
  return Math.max(0, Math.min(100, Math.round(raw * 100)));
}

function matchColor(score: number) {
  if (score >= 70) return C.green;
  if (score >= 45) return C.accent2;
  return C.red;
}

// ── Main screen ──────────────────────────────────────────────────────────────

export default function OrderScreen() {
  const setupConfig = useStore((s) => s.setupConfig);
  const setSetupConfig = useStore((s) => s.setSetupConfig);
  const setTodayLogs = useStore((s) => s.setTodayLogs);
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

  async function refreshLogs() {
    try {
      const logs = await logsApi.getDay();
      setTodayLogs(logs);
    } catch { /* ignore */ }
  }

  const monthlyBudget = local.meals_per_day * 30 * local.budget_vnd;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        {local.active ? '✅ Smart Order' : '⚙️ Smart Order'}
      </Text>
      <Text style={styles.sub}>
        {local.active ? 'Đang theo dõi và gợi ý bữa ăn cho bạn.' : 'Cài đặt một lần — NomNom lo cả tháng.'}
      </Text>

      {/* Live preview — only shown when active */}
      {local.active && (
        <SmartOrderPanel config={local} onOrderDone={refreshLogs} />
      )}

      {/* Divider when active */}
      {local.active && (
        <View style={styles.divider}>
          <Text style={styles.dividerText}>Cài đặt</Text>
        </View>
      )}

      {/* Meal times */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Giờ ăn</Text>
        {local.meal_times.map((m) => (
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
                {v / 1000}k
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

      {/* Activate toggle */}
      <TouchableOpacity
        style={[styles.activateBtn, local.active && styles.activateBtnOn]}
        onPress={() => update({ active: !local.active })}
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

// ── Styles ───────────────────────────────────────────────────────────────────

const so = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(52,211,153,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.green + '33',
    padding: 16,
    gap: 12,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.green },
  headerText: { fontSize: 13, fontWeight: '600', color: C.green, textTransform: 'uppercase', letterSpacing: 0.5 },
  countdownCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.bg2,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  mealIcon: { fontSize: 24 },
  countdownInfo: { flex: 1 },
  mealSlot: { fontSize: 15, fontWeight: '600', color: C.text, textTransform: 'capitalize' },
  mealTime: { fontSize: 13, color: C.text2, marginTop: 2 },
  countdownBadge: { alignItems: 'flex-end' },
  countdownLabel: { fontSize: 10, color: C.text3, textTransform: 'uppercase' },
  countdownValue: { fontSize: 18, fontWeight: '700', color: C.accent2 },
  allDone: { flex: 1, color: C.text2, fontSize: 14 },
  gapsRow: { flexDirection: 'row', gap: 8 },
  gapPill: {
    flex: 1, alignItems: 'center', paddingVertical: 8, paddingHorizontal: 4,
    backgroundColor: C.bg2, borderRadius: 10, borderWidth: 1,
  },
  gapValue: { fontSize: 15, fontWeight: '700' },
  gapLabel: { fontSize: 10, color: C.text3, marginTop: 2 },
  doneBox: {
    backgroundColor: 'rgba(52,211,153,0.1)',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  doneText: { color: C.green, fontSize: 14, fontWeight: '500' },
  recsSection: { gap: 8 },
  recsTitle: { fontSize: 12, fontWeight: '600', color: C.text2, textTransform: 'uppercase', letterSpacing: 0.5 },
  noRecs: { color: C.text3, fontSize: 13, textAlign: 'center', paddingVertical: 12 },
  dishCard: {
    backgroundColor: C.bg2,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: C.cardBorder,
    gap: 10,
  },
  dishCardSelected: { borderColor: C.accent, backgroundColor: 'rgba(255,106,40,0.06)' },
  dishCardDim: { opacity: 0.6 },
  dishRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dishEmoji: { fontSize: 22 },
  dishInfo: { flex: 1 },
  dishName: { fontSize: 14, fontWeight: '500', color: C.text },
  dimText: { color: C.text3 },
  dishMeta: { fontSize: 11, color: C.text3, marginTop: 2 },
  dishRight: { alignItems: 'flex-end', gap: 4 },
  matchBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  matchText: { fontSize: 12, fontWeight: '700' },
  priceText: { fontSize: 12, color: C.text2 },
  overBudget: { color: C.red },
  actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  orderBtn: {
    flex: 1, backgroundColor: C.accent, borderRadius: 8,
    paddingVertical: 10, alignItems: 'center',
  },
  orderBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  skipBtn: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8,
    backgroundColor: C.bg3, borderWidth: 1, borderColor: C.cardBorder,
    alignItems: 'center',
  },
  skipBtnText: { color: C.text2, fontSize: 14 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 48, gap: 12 },
  loading: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: C.text },
  sub: { fontSize: 14, color: C.text2, marginBottom: 4 },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.text3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
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
