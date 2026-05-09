import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { nutritionApi, type Dish } from '@/lib/api';
import { useStore } from '@/store/useStore';

const C = Colors.dark;

const CATS = [
  { id: 'all',        vi: 'Tất cả',   en: 'All' },
  { id: 'soup',       vi: 'Phở/Canh', en: 'Soups' },
  { id: 'rice',       vi: 'Cơm',      en: 'Rice' },
  { id: 'noodle',     vi: 'Bún/Mì',   en: 'Noodles' },
  { id: 'grilled',    vi: 'Nướng',    en: 'Grilled' },
  { id: 'street',     vi: 'Đường phố',en: 'Street' },
  { id: 'seafood',    vi: 'Hải sản',  en: 'Seafood' },
  { id: 'appetizer',  vi: 'Khai vị',  en: 'Starters' },
  { id: 'vegetarian', vi: 'Chay',     en: 'Veg' },
  { id: 'drink',      vi: 'Thức uống',en: 'Drinks' },
  { id: 'dessert',    vi: 'Tráng miệng',en:'Dessert' },
];

function warnColor(type: Dish['warn_type']) {
  return { good: C.green, sugar: C.red, sodium: C.accent2, neutral: C.text3 }[type];
}

function DishCard({ dish, lang }: { dish: Dish; lang: 'vi' | 'en' }) {
  const [open, setOpen] = useState(false);
  const name = lang === 'en' ? dish.name_en : dish.name_vi;
  const region = lang === 'en' ? dish.region_en : dish.region_vi;

  return (
    <TouchableOpacity style={dc.card} onPress={() => setOpen((o) => !o)} activeOpacity={0.8}>
      <View style={dc.row}>
        <Text style={dc.emoji}>{dish.emoji}</Text>
        <View style={dc.info}>
          <Text style={dc.name}>{name}</Text>
          <Text style={dc.region}>{region}</Text>
        </View>
        <View style={dc.right}>
          <Text style={dc.kcal}>{dish.kcal}</Text>
          <Text style={dc.kcalUnit}>kcal</Text>
        </View>
        <View style={[dc.scoreDot, { backgroundColor: warnColor(dish.warn_type) }]} />
      </View>

      {open && (
        <View style={dc.expand}>
          <View style={dc.macroRow}>
            <Text style={dc.macroItem}><Text style={{ color: C.accent }}>P</Text> {dish.protein_g}g</Text>
            <Text style={dc.macroItem}><Text style={{ color: C.accent2 }}>C</Text> {dish.carbs_g}g</Text>
            <Text style={dc.macroItem}><Text style={{ color: C.green }}>F</Text> {dish.fat_g}g</Text>
            <Text style={dc.macroItem}>Score <Text style={{ color: warnColor(dish.warn_type) }}>{dish.health_score}</Text></Text>
          </View>
          <Text style={[dc.warn, { color: warnColor(dish.warn_type) }]}>
            {lang === 'en' ? dish.warn_en : dish.warn_vi}
          </Text>
          <Text style={dc.ingredients}>
            {(lang === 'en' ? dish.ingredients_en : dish.ingredients_vi)?.join(' · ')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const dc = StyleSheet.create({
  card: { backgroundColor: C.bg2, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.cardBorder },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  emoji: { fontSize: 24 },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '500', color: C.text },
  region: { fontSize: 11, color: C.text3, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  kcal: { fontSize: 18, fontWeight: '700', color: C.text },
  kcalUnit: { fontSize: 10, color: C.text3 },
  scoreDot: { width: 8, height: 8, borderRadius: 4 },
  expand: { marginTop: 12, gap: 8, borderTopWidth: 1, borderTopColor: C.cardBorder, paddingTop: 12 },
  macroRow: { flexDirection: 'row', gap: 14 },
  macroItem: { fontSize: 13, color: C.text },
  warn: { fontSize: 12, fontStyle: 'italic' },
  ingredients: { fontSize: 11, color: C.text3 },
});

export default function ExploreScreen() {
  const lang = useStore((s) => s.lang);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);

  async function search() {
    setLoading(true);
    try {
      const res = await nutritionApi.search({ q: q || undefined, cat: cat === 'all' ? undefined : cat });
      setDishes(res.dishes);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { search(); }, [cat]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🗂️ Khám phá</Text>
        <TextInput
          style={styles.search}
          value={q}
          onChangeText={setQ}
          onSubmitEditing={search}
          placeholder="Tìm món ăn..."
          placeholderTextColor={C.text3}
          returnKeyType="search"
        />
      </View>

      {/* Category pills */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATS}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.pills}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.pill, cat === item.id && styles.pillActive]}
            onPress={() => setCat(item.id)}
          >
            <Text style={[styles.pillText, cat === item.id && styles.pillTextActive]}>
              {lang === 'en' ? item.en : item.vi}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator color={C.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={dishes}
          keyExtractor={(d) => String(d.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <DishCard dish={item} lang={lang} />}
          ListEmptyComponent={<Text style={styles.empty}>Không tìm thấy món nào.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: C.text, marginBottom: 12 },
  search: {
    backgroundColor: C.bg3,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: C.text,
    fontSize: 15,
  },
  pills: { paddingHorizontal: 20, paddingBottom: 12, gap: 8 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: C.bg3,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  pillActive: { backgroundColor: 'rgba(255,106,40,0.15)', borderColor: C.accent },
  pillText: { color: C.text2, fontSize: 13 },
  pillTextActive: { color: C.accent, fontWeight: '600' },
  list: { paddingHorizontal: 20, paddingBottom: 32 },
  empty: { color: C.text3, textAlign: 'center', marginTop: 40 },
});
