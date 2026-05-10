import { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Switch, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useStore, selectTdee, selectTodayTotals } from '@/store/useStore';
import { setupApi, nutritionApi, logsApi, type SetupConfig, type Dish } from '@/lib/api';

const C = Colors.dark;

// ── Helpers ──────────────────────────────────────────────────────────────────

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

function nowMinutes() {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
}

function parseTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function fmtCountdown(min: number) {
  if (min < 60) return `${min}p`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}g${m}p` : `${h}g`;
}

function computeMatchScore(dish: Dish, gapP: number, gapC: number, gapF: number): number {
  const total = gapP + gapC + gapF;
  if (total === 0) return Math.round(dish.health_score);
  const wP = gapP / total, wC = gapC / total, wF = gapF / total;
  const dP = Math.abs(dish.protein_g - gapP) / Math.max(gapP, 1);
  const dC = Math.abs(dish.carbs_g   - gapC) / Math.max(gapC, 1);
  const dF = Math.abs(dish.fat_g     - gapF) / Math.max(gapF, 1);
  return Math.max(0, Math.min(100, Math.round((1 - (wP * dP + wC * dC + wF * dF)) * 100)));
}

function matchColor(score: number) {
  if (score >= 70) return C.green;
  if (score >= 45) return C.accent2;
  return C.red;
}

const GOALS_META = [
  { id: 'maintain', vi: 'Duy trì', en: 'Maintain', icon: '⚖️' },
  { id: 'lose',     vi: 'Giảm cân', en: 'Lose',    icon: '🔥' },
  { id: 'gain',     vi: 'Tăng cơ',  en: 'Gain',    icon: '💪' },
] as const;

// ── Meal Timeline ─────────────────────────────────────────────────────────────

function MealTimeline({ meals }: { meals: SetupConfig['meal_times'] }) {
  const now = nowMinutes();
  const nextIdx = meals.findIndex((m) => parseTime(m.time) > now);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tl.wrap} contentContainerStyle={tl.row}>
      {meals.map((m, i) => {
        const mMin = parseTime(m.time);
        const isPast = mMin <= now;
        const isNext = i === nextIdx;
        const diff = mMin - now;

        return (
          <View key={m.slot} style={[tl.slot, isNext && tl.slotNext, isPast && tl.slotPast]}>
            <Text style={tl.icon}>{m.icon}</Text>
            <Text style={[tl.name, isPast && tl.dimText, isNext && tl.nextText]}>{m.slot}</Text>
            <Text style={[tl.time, isPast && tl.dimText, isNext && { color: C.accent2 }]}>{m.time}</Text>
            {isNext && diff > 0 && (
              <View style={tl.badge}>
                <Text style={tl.badgeText}>{fmtCountdown(diff)}</Text>
              </View>
            )}
            {isPast && <Text style={tl.doneCheck}>✓</Text>}
          </View>
        );
      })}
    </ScrollView>
  );
}

const tl = StyleSheet.create({
  wrap: { marginHorizontal: -20 },
  row: { paddingHorizontal: 20, gap: 10, paddingBottom: 4 },
  slot: {
    alignItems: 'center', width: 76, paddingVertical: 12, paddingHorizontal: 8,
    backgroundColor: C.bg2, borderRadius: 14, borderWidth: 1, borderColor: C.cardBorder, gap: 4,
  },
  slotNext: { borderColor: C.accent2, backgroundColor: 'rgba(255,159,28,0.08)' },
  slotPast: { opacity: 0.45 },
  icon: { fontSize: 20 },
  name: { fontSize: 11, color: C.text2, textTransform: 'capitalize', textAlign: 'center' },
  nextText: { color: C.text, fontWeight: '600' },
  dimText: { color: C.text3 },
  time: { fontSize: 13, fontWeight: '700', color: C.text },
  badge: { backgroundColor: C.accent2, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1 },
  badgeText: { color: '#000', fontSize: 10, fontWeight: '700' },
  doneCheck: { fontSize: 11, color: C.green, fontWeight: '700' },
});

// ── Macro Gap Bar ─────────────────────────────────────────────────────────────

function MacroGaps({
  targets, totals,
}: {
  targets: ReturnType<typeof macroTargets>;
  totals: { kcal: number; protein_g: number; carbs_g: number; fat_g: number };
}) {
  const rows = [
    { label: 'Protein', cur: totals.protein_g, max: targets.protein_g, color: C.accent,  unit: 'g' },
    { label: 'Carbs',   cur: totals.carbs_g,   max: targets.carbs_g,   color: C.accent2, unit: 'g' },
    { label: 'Fat',     cur: totals.fat_g,      max: targets.fat_g,     color: C.green,   unit: 'g' },
  ];
  return (
    <View style={gap.wrap}>
      {rows.map((r) => {
        const pct = Math.min(1, r.cur / Math.max(r.max, 1));
        const remaining = Math.max(0, r.max - r.cur);
        return (
          <View key={r.label} style={gap.row}>
            <Text style={gap.label}>{r.label}</Text>
            <View style={gap.track}>
              <View style={[gap.fill, { width: `${Math.round(pct * 100)}%` as any, backgroundColor: r.color }]} />
            </View>
            <Text style={[gap.remaining, { color: remaining > 0 ? r.color : C.green }]}>
              {remaining > 0 ? `−${remaining}${r.unit}` : '✓'}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const gap = StyleSheet.create({
  wrap: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { width: 52, fontSize: 12, color: C.text2 },
  track: { flex: 1, height: 5, backgroundColor: C.bg3, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  remaining: { width: 44, fontSize: 12, fontWeight: '600', textAlign: 'right' },
});

// ── Dish Recommendation Card ──────────────────────────────────────────────────

function DishCard({
  dish, matchScore, overBudget, isActive, onOrder,
}: {
  dish: Dish;
  matchScore: number;
  overBudget: boolean;
  isActive: boolean;
  onOrder: (dish: Dish) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [ordering, setOrdering] = useState(false);

  async function handleOrder() {
    setOrdering(true);
    try { await onOrder(dish); setExpanded(false); }
    finally { setOrdering(false); }
  }

  return (
    <TouchableOpacity
      style={[dc.card, expanded && dc.cardOpen]}
      onPress={() => setExpanded((o) => !o)}
      activeOpacity={0.85}
    >
      <View style={dc.row}>
        <View style={[dc.matchRing, { borderColor: matchColor(matchScore) }]}>
          <Text style={[dc.matchNum, { color: matchColor(matchScore) }]}>{matchScore}</Text>
          <Text style={dc.matchPct}>%</Text>
        </View>

        <View style={dc.mid}>
          <Text style={dc.name}>{dish.emoji} {dish.name_vi}</Text>
          <Text style={dc.region}>{dish.region_vi}</Text>
          <View style={dc.tagRow}>
            <Text style={dc.tag}>{dish.kcal} kcal</Text>
            <Text style={[dc.tag, { color: C.accent }]}>P{dish.protein_g}g</Text>
            <Text style={[dc.tag, { color: C.accent2 }]}>C{dish.carbs_g}g</Text>
            <Text style={[dc.tag, { color: C.green }]}>F{dish.fat_g}g</Text>
          </View>
        </View>

        <View style={dc.right}>
          <Text style={[dc.price, overBudget && dc.priceOver]}>
            {formatVnd(dish.avg_price_vnd)}
          </Text>
          {overBudget && <Text style={dc.overTag}>quá NS</Text>}
          <Text style={[dc.scoreTag, { color: dish.health_score >= 70 ? C.green : C.accent2 }]}>
            ★ {dish.health_score}
          </Text>
        </View>
      </View>

      {expanded && (
        <View style={dc.expand}>
          <Text style={dc.ingredients}>
            {dish.ingredients_vi?.slice(0, 6).join(' · ')}
            {(dish.ingredients_vi?.length ?? 0) > 6 ? ' …' : ''}
          </Text>
          <Text style={[dc.warn, { color: dish.warn_type === 'good' ? C.green : dish.warn_type === 'neutral' ? C.text3 : C.red }]}>
            {dish.warn_vi}
          </Text>

          {isActive ? (
            <TouchableOpacity style={dc.orderBtn} onPress={handleOrder} disabled={ordering}>
              {ordering
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={dc.orderBtnText}>Đặt ngay →</Text>}
            </TouchableOpacity>
          ) : (
            <View style={dc.lockedRow}>
              <Text style={dc.lockedText}>🔒 Kích hoạt Smart Order để đặt hàng</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const dc = StyleSheet.create({
  card: {
    backgroundColor: C.bg2, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: C.cardBorder,
  },
  cardOpen: { borderColor: C.accent },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  matchRing: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
  },
  matchNum: { fontSize: 14, fontWeight: '800' },
  matchPct: { fontSize: 9, color: C.text3, marginTop: 4 },
  mid: { flex: 1, gap: 3 },
  name: { fontSize: 14, fontWeight: '600', color: C.text },
  region: { fontSize: 11, color: C.text3 },
  tagRow: { flexDirection: 'row', gap: 6, marginTop: 2 },
  tag: { fontSize: 11, color: C.text2 },
  right: { alignItems: 'flex-end', gap: 4 },
  price: { fontSize: 13, fontWeight: '600', color: C.text },
  priceOver: { color: C.red },
  overTag: { fontSize: 10, color: C.red, backgroundColor: 'rgba(239,68,68,0.12)', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 },
  scoreTag: { fontSize: 12, fontWeight: '600' },
  expand: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.cardBorder, gap: 8 },
  ingredients: { fontSize: 12, color: C.text3 },
  warn: { fontSize: 12, fontStyle: 'italic' },
  orderBtn: { backgroundColor: C.accent, borderRadius: 10, paddingVertical: 11, alignItems: 'center', marginTop: 4 },
  orderBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  lockedRow: { backgroundColor: C.bg3, borderRadius: 10, padding: 10, alignItems: 'center' },
  lockedText: { color: C.text3, fontSize: 13 },
});

// ── Settings panel ────────────────────────────────────────────────────────────

function SettingsPanel({
  local, update,
}: {
  local: SetupConfig;
  update: (p: Partial<SetupConfig>) => void;
}) {
  const monthlyBudget = local.meals_per_day * 30 * local.budget_vnd;

  return (
    <View style={{ gap: 10 }}>
      {/* Meal times */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Giờ ăn hôm nay</Text>
        {local.meal_times.map((m) => (
          <View key={m.slot} style={s.mealRow}>
            <Text style={{ fontSize: 16 }}>{m.icon}</Text>
            <Text style={s.mealSlot}>{m.slot}</Text>
            <Text style={s.mealTime}>{m.time}</Text>
          </View>
        ))}
        <Text style={s.hint}>Thông báo sẽ gửi 30 phút trước mỗi bữa.</Text>
      </View>

      {/* Meals per day */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Số bữa / ngày</Text>
        <View style={s.segRow}>
          {[2, 3, 4, 5].map((n) => (
            <TouchableOpacity key={n}
              style={[s.segBtn, local.meals_per_day === n && s.segBtnActive]}
              onPress={() => update({ meals_per_day: n })}>
              <Text style={[s.segText, local.meals_per_day === n && s.segTextActive]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Budget */}
      <View style={s.card}>
        <View style={s.cardRow}>
          <Text style={s.cardTitle}>Ngân sách / bữa</Text>
          <Text style={s.valueAccent}>{formatVnd(local.budget_vnd)}</Text>
        </View>
        <Text style={s.hint}>≈ {formatVnd(monthlyBudget)} / tháng</Text>
        <View style={s.chipRow}>
          {[40000, 60000, 85000, 120000, 200000].map((v) => (
            <TouchableOpacity key={v}
              style={[s.chip, local.budget_vnd === v && s.chipActive]}
              onPress={() => update({ budget_vnd: v })}>
              <Text style={[s.chipText, local.budget_vnd === v && s.chipTextActive]}>{v / 1000}k</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Delivery time */}
      <View style={s.card}>
        <View style={s.cardRow}>
          <Text style={s.cardTitle}>Giao hàng tối đa</Text>
          <Text style={s.valueAccent}>{local.delivery_max_min} phút</Text>
        </View>
        <View style={s.chipRow}>
          {[15, 20, 25, 30, 40].map((v) => (
            <TouchableOpacity key={v}
              style={[s.chip, local.delivery_max_min === v && s.chipActive]}
              onPress={() => update({ delivery_max_min: v })}>
              <Text style={[s.chipText, local.delivery_max_min === v && s.chipTextActive]}>{v}'</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Goal */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Mục tiêu</Text>
        <View style={s.segRow}>
          {GOALS_META.map((g) => (
            <TouchableOpacity key={g.id}
              style={[s.goalBtn, local.goal === g.id && s.goalBtnActive]}
              onPress={() => update({ goal: g.id })}>
              <Text style={{ fontSize: 18 }}>{g.icon}</Text>
              <Text style={[s.goalText, local.goal === g.id && s.goalTextActive]}>{g.vi}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Notifications */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Thông báo qua</Text>
        <View style={s.toggleRow}>
          <Text style={s.toggleLabel}>📱 Điện thoại</Text>
          <Switch value={local.notify_phone}
            onValueChange={(v) => update({ notify_phone: v })}
            trackColor={{ true: C.green, false: C.bg3 }} thumbColor="#fff" />
        </View>
        <View style={s.toggleRow}>
          <Text style={s.toggleLabel}>💻 Máy tính</Text>
          <Switch value={local.notify_desktop}
            onValueChange={(v) => update({ notify_desktop: v })}
            trackColor={{ true: C.green, false: C.bg3 }} thumbColor="#fff" />
        </View>
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function OrderScreen() {
  const setSetupConfig = useStore((st) => st.setSetupConfig);
  const setTodayLogs   = useStore((st) => st.setTodayLogs);
  const tdee           = useStore(selectTdee);
  const totals         = useStore(selectTodayTotals);

  const [config, setConfig]         = useState<SetupConfig | null>(null);
  const [local, setLocal]           = useState<SetupConfig | null>(null);
  const [recs, setRecs]             = useState<Dish[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [saving, setSaving]         = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const targets = macroTargets(tdee);
  const gapP = Math.max(0, targets.protein_g - totals.protein_g);
  const gapC = Math.max(0, targets.carbs_g   - totals.carbs_g);
  const gapF = Math.max(0, targets.fat_g     - totals.fat_g);
  const gapK = Math.max(0, targets.kcal      - totals.kcal);
  const allMet = gapK === 0 && gapP === 0;

  async function loadConfig() {
    const c = await setupApi.get();
    setConfig(c);
    setSetupConfig(c);
    setLocal(c);
    return c;
  }

  async function loadRecs(c?: SetupConfig) {
    const cfg = c ?? config;
    setLoadingRecs(true);
    try {
      const dishes = await nutritionApi.match({
        kcal:    gapK    || targets.kcal,
        protein: gapP    || targets.protein_g,
        budgetVnd: cfg?.budget_vnd,
      });
      setRecs(dishes.slice(0, 3));
    } catch {
      setRecs([]);
    } finally {
      setLoadingRecs(false);
    }
  }

  async function doRefresh() {
    setRefreshing(true);
    try {
      const [c, logs] = await Promise.all([loadConfig(), logsApi.getDay()]);
      setTodayLogs(logs);
      await loadRecs(c);
    } catch { /* ignore */ }
    setRefreshing(false);
  }

  useFocusEffect(useCallback(() => {
    loadConfig().then(loadRecs);
    timerRef.current = setInterval(() => setLocal((l) => l ? { ...l } : l), 60_000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []));

  // Reload recs when macro totals change (meal logged on Home tab)
  useEffect(() => {
    if (config) loadRecs();
  }, [totals.kcal]);

  function update(patch: Partial<SetupConfig>) {
    setLocal((prev) => prev ? { ...prev, ...patch } : prev);
  }

  async function toggleActivate() {
    if (!local) return;
    const next = { ...local, active: !local.active };
    setLocal(next);
    setSaving(true);
    try {
      const updated = await setupApi.update(next);
      setConfig(updated);
      setSetupConfig(updated);
      setLocal(updated);
      if (updated.active) {
        Alert.alert('Smart Order kích hoạt! 🎉', 'NomNom sẽ gợi ý bữa ăn theo mục tiêu của bạn.');
        setSettingsOpen(false);
      }
    } catch (e: any) {
      Alert.alert('Lỗi', e.message);
      setLocal((p) => p ? { ...p, active: !next.active } : p);
    } finally {
      setSaving(false);
    }
  }

  async function saveSettings() {
    if (!local) return;
    setSaving(true);
    try {
      const updated = await setupApi.update(local);
      setConfig(updated);
      setSetupConfig(updated);
      setLocal(updated);
      await loadRecs(updated);
      Alert.alert('Đã lưu', 'Cài đặt Smart Order đã được cập nhật.');
    } catch (e: any) {
      Alert.alert('Lỗi', e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleOrder(dish: Dish) {
    if (!local) return;
    const now = nowMinutes();
    const nextSlot = local.meal_times.find((m) => parseTime(m.time) > now);
    const slotRaw  = (nextSlot?.slot ?? 'lunch').toLowerCase();
    const mealSlot = (['breakfast', 'lunch', 'dinner', 'snack'].includes(slotRaw)
      ? slotRaw : 'lunch') as 'breakfast' | 'lunch' | 'dinner' | 'snack';

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
    Alert.alert('Đã đặt! 🎉', `${dish.emoji} ${dish.name_vi} đã thêm vào nhật ký hôm nay.`);

    // Refresh logs so Home tab and gaps update
    const logs = await logsApi.getDay();
    setTodayLogs(logs);
  }

  if (!local) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={C.accent} size="large" />
        <Text style={styles.loadingText}>Đang tải Smart Order…</Text>
      </View>
    );
  }

  const isActive = local.active;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={doRefresh} tintColor={C.accent} />}
    >
      {/* ── Header ── */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Smart Order</Text>
          <Text style={styles.sub}>Gợi ý bữa ăn theo mục tiêu của bạn</Text>
        </View>
        <TouchableOpacity
          style={[styles.statusPill, isActive ? styles.pillActive : styles.pillInactive]}
          onPress={toggleActivate}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color={isActive ? C.green : C.text3} size="small" />
            : <Text style={[styles.pillText, isActive ? styles.pillTextActive : styles.pillTextInactive]}>
                {isActive ? '● Bật' : '○ Tắt'}
              </Text>}
        </TouchableOpacity>
      </View>

      {/* ── Meal timeline ── */}
      {local.meal_times.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Bữa ăn hôm nay</Text>
          <MealTimeline meals={local.meal_times} />
        </View>
      )}

      {/* ── Macro progress ── */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Còn thiếu hôm nay</Text>
          <Text style={styles.kcalRemain}>
            {allMet ? '✓ Đủ rồi!' : `${gapK} kcal còn lại`}
          </Text>
        </View>
        {allMet
          ? <Text style={styles.allMetText}>Bạn đã đạt mục tiêu macro hôm nay 🥗</Text>
          : <MacroGaps targets={targets} totals={totals} />}
      </View>

      {/* ── Recommendations ── */}
      <View style={styles.section}>
        <View style={styles.recHeader}>
          <Text style={styles.sectionLabel}>Gợi ý cho bữa tiếp theo</Text>
          <TouchableOpacity onPress={() => loadRecs()}>
            <Text style={styles.refreshBtn}>↻ Làm mới</Text>
          </TouchableOpacity>
        </View>

        {loadingRecs ? (
          <View style={styles.recsLoading}>
            <ActivityIndicator color={C.accent} />
            <Text style={styles.recsLoadingText}>Đang tính toán…</Text>
          </View>
        ) : recs.length === 0 ? (
          <View style={styles.emptyRecs}>
            <Text style={styles.emptyRecsText}>Không tìm thấy món phù hợp với ngân sách này.</Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {recs.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
                matchScore={computeMatchScore(dish, gapP, gapC, gapF)}
                overBudget={dish.avg_price_vnd > local.budget_vnd}
                isActive={isActive}
                onOrder={handleOrder}
              />
            ))}
          </View>
        )}

        {!isActive && (
          <TouchableOpacity style={styles.activateCTA} onPress={toggleActivate} disabled={saving}>
            <Text style={styles.activateCTAText}>
              {saving ? 'Đang kích hoạt…' : '⚡ Kích hoạt Smart Order để đặt hàng'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Settings collapsible ── */}
      <TouchableOpacity style={styles.settingsToggle} onPress={() => setSettingsOpen((o) => !o)}>
        <Text style={styles.settingsToggleText}>⚙️ Cài đặt Smart Order</Text>
        <Text style={styles.chevron}>{settingsOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {settingsOpen && (
        <>
          <SettingsPanel local={local} update={update} />
          <TouchableOpacity style={styles.saveBtn} onPress={saveSettings} disabled={saving}>
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.saveBtnText}>Lưu cài đặt</Text>}
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  card: { backgroundColor: C.bg2, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.cardBorder, gap: 8 },
  cardTitle: { fontSize: 12, fontWeight: '600', color: C.text2, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  valueAccent: { fontSize: 17, fontWeight: '700', color: C.accent },
  hint: { fontSize: 12, color: C.text3 },
  mealRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 3 },
  mealSlot: { flex: 1, color: C.text, fontSize: 14, textTransform: 'capitalize' },
  mealTime: { color: C.accent2, fontSize: 14, fontWeight: '600' },
  segRow: { flexDirection: 'row', gap: 8 },
  segBtn: { flex: 1, paddingVertical: 9, borderRadius: 8, backgroundColor: C.bg3, borderWidth: 1, borderColor: C.cardBorder, alignItems: 'center' },
  segBtnActive: { backgroundColor: 'rgba(255,106,40,0.15)', borderColor: C.accent },
  segText: { color: C.text2, fontSize: 14, fontWeight: '500' },
  segTextActive: { color: C.accent, fontWeight: '700' },
  chipRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: C.bg3, borderWidth: 1, borderColor: C.cardBorder },
  chipActive: { backgroundColor: 'rgba(255,106,40,0.15)', borderColor: C.accent },
  chipText: { color: C.text2, fontSize: 13 },
  chipTextActive: { color: C.accent, fontWeight: '700' },
  goalBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: C.bg3, borderWidth: 1, borderColor: C.cardBorder, alignItems: 'center', gap: 4 },
  goalBtnActive: { backgroundColor: 'rgba(52,211,153,0.12)', borderColor: C.green },
  goalText: { color: C.text2, fontSize: 12 },
  goalTextActive: { color: C.green, fontWeight: '600' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  toggleLabel: { color: C.text, fontSize: 14 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 48, gap: 16 },
  loading: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: C.text2, fontSize: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 26, fontWeight: '800', color: C.text },
  sub: { fontSize: 13, color: C.text2, marginTop: 2 },
  statusPill: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1.5, minWidth: 72, alignItems: 'center',
  },
  pillActive: { borderColor: C.green, backgroundColor: 'rgba(52,211,153,0.1)' },
  pillInactive: { borderColor: C.text3, backgroundColor: C.bg3 },
  pillText: { fontSize: 13, fontWeight: '700' },
  pillTextActive: { color: C.green },
  pillTextInactive: { color: C.text3 },
  section: { gap: 10 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: C.text2, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { backgroundColor: C.bg2, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.cardBorder, gap: 10 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 12, fontWeight: '600', color: C.text2, textTransform: 'uppercase', letterSpacing: 0.5 },
  kcalRemain: { fontSize: 13, fontWeight: '600', color: C.accent2 },
  allMetText: { color: C.green, fontSize: 14 },
  recHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  refreshBtn: { fontSize: 13, color: C.accent, fontWeight: '600' },
  recsLoading: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 24, justifyContent: 'center' },
  recsLoadingText: { color: C.text2, fontSize: 14 },
  emptyRecs: { backgroundColor: C.bg2, borderRadius: 12, padding: 20, alignItems: 'center' },
  emptyRecsText: { color: C.text3, fontSize: 14, textAlign: 'center' },
  activateCTA: {
    backgroundColor: C.accent, borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', marginTop: 4,
  },
  activateCTAText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  settingsToggle: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: C.bg2, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: C.cardBorder,
  },
  settingsToggleText: { color: C.text, fontSize: 14, fontWeight: '500' },
  chevron: { color: C.text3, fontSize: 12 },
  saveBtn: { backgroundColor: C.accent, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
