import { useEffect, useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, ActivityIndicator, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { nutritionApi, logsApi, type Dish, type LogEntry } from '@/lib/api';

const C = Colors.dark;

type Slot = LogEntry['meal_slot'];
const SLOTS: { id: Slot; vi: string; en: string; emoji: string }[] = [
  { id: 'breakfast', vi: 'Sáng',  en: 'Breakfast', emoji: '🌅' },
  { id: 'lunch',     vi: 'Trưa',  en: 'Lunch',     emoji: '☀️' },
  { id: 'dinner',    vi: 'Tối',   en: 'Dinner',    emoji: '🌙' },
  { id: 'snack',     vi: 'Vặt',   en: 'Snack',     emoji: '🍿' },
];

function defaultSlot(): Slot {
  const h = new Date().getHours();
  if (h < 10) return 'breakfast';
  if (h < 14) return 'lunch';
  if (h < 18) return 'snack';
  return 'dinner';
}

type Props = {
  visible: boolean;
  onClose: () => void;
  onLogged: () => void;
  lang: 'vi' | 'en';
};

export function LogMealModal({ visible, onClose, onLogged, lang }: Props) {
  const [slot, setSlot] = useState<Slot>(defaultSlot());
  const [q, setQ] = useState('');
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);
  const [logging, setLogging] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setSlot(defaultSlot());
    setQ('');
    setError(null);
    runSearch('');
  }, [visible]);

  async function runSearch(query: string) {
    setLoading(true);
    try {
      const res = await nutritionApi.search({ q: query || undefined, limit: 30 });
      setDishes(res.dishes);
    } catch (e: any) {
      setError(lang === 'en' ? 'Could not load dishes' : 'Không tải được món ăn');
    } finally {
      setLoading(false);
    }
  }

  async function handleLog(dish: Dish) {
    setLogging(dish.id);
    setError(null);
    try {
      await logsApi.log({
        mealSlot: slot,
        dishId: dish.id,
        dishName: lang === 'en' ? dish.name_en : dish.name_vi,
        kcal: dish.kcal,
        proteinG: dish.protein_g,
        carbsG: dish.carbs_g,
        fatG: dish.fat_g,
        source: 'manual',
      });
      onLogged();
      onClose();
    } catch (e: any) {
      setError(lang === 'en' ? 'Log failed — try again' : 'Lỗi — thử lại');
    } finally {
      setLogging(null);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>
            {lang === 'en' ? 'Log a meal' : 'Thêm bữa ăn'}
          </Text>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={C.text2} />
          </TouchableOpacity>
        </View>

        <View style={styles.slotRow}>
          {SLOTS.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.slotChip, slot === s.id && styles.slotChipActive]}
              onPress={() => setSlot(s.id)}
            >
              <Text style={styles.slotEmoji}>{s.emoji}</Text>
              <Text style={[styles.slotText, slot === s.id && styles.slotTextActive]}>
                {lang === 'en' ? s.en : s.vi}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.search}
          value={q}
          onChangeText={setQ}
          onSubmitEditing={() => runSearch(q)}
          placeholder={lang === 'en' ? 'Search dish...' : 'Tìm món...'}
          placeholderTextColor={C.text3}
          returnKeyType="search"
          autoCapitalize="none"
        />

        {error && <Text style={styles.error}>{error}</Text>}

        {loading ? (
          <ActivityIndicator color={C.accent} style={{ marginTop: 24 }} />
        ) : (
          <FlatList
            data={dishes}
            keyExtractor={(d) => String(d.id)}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isLogging = logging === item.id;
              return (
                <TouchableOpacity
                  style={styles.dishRow}
                  onPress={() => handleLog(item)}
                  disabled={logging !== null}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dishEmoji}>{item.emoji}</Text>
                  <View style={styles.dishInfo}>
                    <Text style={styles.dishName} numberOfLines={1}>
                      {lang === 'en' ? item.name_en : item.name_vi}
                    </Text>
                    <Text style={styles.dishMacros}>
                      {item.kcal} kcal · P {item.protein_g}g · C {item.carbs_g}g · F {item.fat_g}g
                    </Text>
                  </View>
                  {isLogging ? (
                    <ActivityIndicator color={C.accent} size="small" />
                  ) : (
                    <Ionicons name="add-circle" size={26} color={C.accent} />
                  )}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.empty}>
                {lang === 'en' ? 'No dishes found.' : 'Không tìm thấy món nào.'}
              </Text>
            }
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: C.bg2,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 18, paddingTop: 8, paddingBottom: 24,
    maxHeight: '88%', minHeight: '70%',
    borderTopWidth: 1, borderColor: C.cardBorder,
  },
  handle: {
    alignSelf: 'center', width: 44, height: 4, borderRadius: 2,
    backgroundColor: C.text3, opacity: 0.4, marginBottom: 12,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  title: { fontSize: 18, fontWeight: '700', color: C.text },
  slotRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  slotChip: {
    flex: 1, flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 6,
    paddingVertical: 10, borderRadius: 10,
    backgroundColor: C.bg3, borderWidth: 1, borderColor: C.cardBorder,
  },
  slotChipActive: {
    backgroundColor: 'rgba(255,106,40,0.15)',
    borderColor: C.accent,
  },
  slotEmoji: { fontSize: 14 },
  slotText: { fontSize: 13, color: C.text2 },
  slotTextActive: { color: C.accent, fontWeight: '600' },
  search: {
    backgroundColor: C.bg3, borderWidth: 1, borderColor: C.cardBorder,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    color: C.text, fontSize: 15, marginBottom: 8,
  },
  error: { color: C.red, fontSize: 12, marginTop: 4, marginBottom: 4 },
  list: { paddingTop: 6, paddingBottom: 8 },
  dishRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: C.cardBorder,
  },
  dishEmoji: { fontSize: 24 },
  dishInfo: { flex: 1 },
  dishName: { fontSize: 14, color: C.text, fontWeight: '500' },
  dishMacros: { fontSize: 11, color: C.text3, marginTop: 2 },
  empty: { color: C.text3, textAlign: 'center', marginTop: 32 },
});
