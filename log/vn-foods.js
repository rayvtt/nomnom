// NomNom Log — shared nutrition reference data.
// Imported by the app (log/index.html) for the offline parser and by the
// Cloudflare Pages Function (functions/api/parse.js) to ground the AI.
//
// All values are per ONE serving as described in `serving`. They are
// estimates for typical Vietnamese street-vendor / home portions and should
// be refined as the NomNom cuisine database (the moat) matures.

// Order matters: FOODS[].n arrays are positional in this order.
export const NUTRIENTS = [
  { key: 'kcal',        unit: 'kcal', group: 'macro',   vi: 'Năng lượng', en: 'Energy' },
  { key: 'protein_g',   unit: 'g',    group: 'macro',   vi: 'Đạm',        en: 'Protein' },
  { key: 'carbs_g',     unit: 'g',    group: 'macro',   vi: 'Tinh bột',   en: 'Carbs' },
  { key: 'fat_g',       unit: 'g',    group: 'macro',   vi: 'Chất béo',   en: 'Fat' },
  { key: 'fiber_g',     unit: 'g',    group: 'macro',   vi: 'Chất xơ',    en: 'Fiber' },
  { key: 'sugar_g',     unit: 'g',    group: 'macro',   vi: 'Đường',      en: 'Sugar', limit: true },
  { key: 'sodium_mg',   unit: 'mg',   group: 'mineral', vi: 'Natri',      en: 'Sodium', limit: true },
  { key: 'potassium_mg',unit: 'mg',   group: 'mineral', vi: 'Kali',       en: 'Potassium' },
  { key: 'calcium_mg',  unit: 'mg',   group: 'mineral', vi: 'Canxi',      en: 'Calcium' },
  { key: 'iron_mg',     unit: 'mg',   group: 'mineral', vi: 'Sắt',        en: 'Iron' },
  { key: 'magnesium_mg',unit: 'mg',   group: 'mineral', vi: 'Magie',      en: 'Magnesium' },
  { key: 'zinc_mg',     unit: 'mg',   group: 'mineral', vi: 'Kẽm',        en: 'Zinc' },
  { key: 'vit_a_mcg',   unit: 'µg',   group: 'vitamin', vi: 'Vitamin A',  en: 'Vitamin A' },
  { key: 'vit_c_mg',    unit: 'mg',   group: 'vitamin', vi: 'Vitamin C',  en: 'Vitamin C' },
  { key: 'vit_d_mcg',   unit: 'µg',   group: 'vitamin', vi: 'Vitamin D',  en: 'Vitamin D' },
  { key: 'vit_e_mg',    unit: 'mg',   group: 'vitamin', vi: 'Vitamin E',  en: 'Vitamin E' },
  { key: 'vit_b12_mcg', unit: 'µg',   group: 'vitamin', vi: 'Vitamin B12',en: 'Vitamin B12' },
  { key: 'folate_mcg',  unit: 'µg',   group: 'vitamin', vi: 'Folate',     en: 'Folate' },
  { key: 'water_ml',    unit: 'ml',   group: 'water',   vi: 'Nước',       en: 'Water' },
];
export const NUTRIENT_KEYS = NUTRIENTS.map(n => n.key);

// Adult daily values (FDA DV, with sex-specific RDAs where they differ).
// `sugar_g` and `sodium_mg` are upper limits, not goals.
export const DAILY_VALUES = {
  female: { kcal: 1900, protein_g: 50, carbs_g: 260, fat_g: 65, fiber_g: 25, sugar_g: 50, sodium_mg: 2300, potassium_mg: 2600, calcium_mg: 1000, iron_mg: 18, magnesium_mg: 320, zinc_mg: 8,  vit_a_mcg: 700, vit_c_mg: 75, vit_d_mcg: 15, vit_e_mg: 15, vit_b12_mcg: 2.4, folate_mcg: 400, water_ml: 2200 },
  male:   { kcal: 2400, protein_g: 60, carbs_g: 320, fat_g: 80, fiber_g: 34, sugar_g: 50, sodium_mg: 2300, potassium_mg: 3400, calcium_mg: 1000, iron_mg: 8,  magnesium_mg: 420, zinc_mg: 11, vit_a_mcg: 900, vit_c_mg: 90, vit_d_mcg: 15, vit_e_mg: 15, vit_b12_mcg: 2.4, folate_mcg: 400, water_ml: 3000 },
};

// n = [kcal, protein, carbs, fat, fiber, sugar, sodium, potassium, calcium,
//      iron, magnesium, zinc, vitA, vitC, vitD, vitE, B12, folate, water]
export const FOODS = [
  // --- Noodle soups ---
  { id: 'pho-bo', kind: 'food', vi: 'Phở bò', en: 'Beef phở', serving: { vi: '1 tô (~600g)', en: '1 bowl (~600 g)' },
    alias: ['pho bo', 'pho tai', 'pho chin', 'beef pho', 'pho'], n: [480,32,52,12,2,4,1900,700,60,4.5,60,7,30,8,0,0.6,2.5,60,450] },
  { id: 'pho-ga', kind: 'food', vi: 'Phở gà', en: 'Chicken phở', serving: { vi: '1 tô (~600g)', en: '1 bowl (~600 g)' },
    alias: ['pho ga', 'chicken pho'], n: [400,28,50,8,2,3,1700,550,50,2.2,50,2.5,40,6,0.1,0.5,0.4,50,450] },
  { id: 'bun-bo-hue', kind: 'food', vi: 'Bún bò Huế', en: 'Huế spicy beef noodle soup', serving: { vi: '1 tô (~650g)', en: '1 bowl (~650 g)' },
    alias: ['bun bo hue', 'bun bo', 'bunbo', 'bun bo hue soup', 'hue beef noodle'], n: [560,32,58,20,3,5,2300,700,90,4.8,65,6.5,60,10,0.2,1.2,2.8,55,480] },
  { id: 'bun-rieu', kind: 'food', vi: 'Bún riêu cua', en: 'Crab noodle soup', serving: { vi: '1 tô (~600g)', en: '1 bowl (~600 g)' },
    alias: ['bun rieu', 'bun rieu cua', 'crab noodle'], n: [450,24,58,13,3,5,1900,600,180,4.5,60,3,90,20,0.5,1.5,2.0,60,450] },
  { id: 'hu-tieu', kind: 'food', vi: 'Hủ tiếu Nam Vang', en: 'Phnom Penh noodle soup', serving: { vi: '1 tô (~600g)', en: '1 bowl (~600 g)' },
    alias: ['hu tieu', 'hu tieu nam vang', 'hu tiu'], n: [480,28,58,13,2,4,1900,550,80,2.5,50,3,40,6,0.3,0.8,1.5,40,450] },
  { id: 'mi-quang', kind: 'food', vi: 'Mì Quảng', en: 'Quảng-style turmeric noodles', serving: { vi: '1 tô (~450g)', en: '1 bowl (~450 g)' },
    alias: ['mi quang'], n: [550,30,60,20,3,4,1500,600,80,3.5,60,3.5,90,10,0.4,1.5,1.2,50,250] },
  { id: 'cao-lau', kind: 'food', vi: 'Cao lầu', en: 'Hội An cao lầu noodles', serving: { vi: '1 tô (~400g)', en: '1 bowl (~400 g)' },
    alias: ['cao lau'], n: [520,28,62,17,2,5,1300,500,50,3,45,3.5,60,8,0.2,1,1,40,200] },
  { id: 'chao-ga', kind: 'food', vi: 'Cháo gà', en: 'Chicken rice porridge', serving: { vi: '1 tô (~500g)', en: '1 bowl (~500 g)' },
    alias: ['chao ga', 'chao', 'congee', 'rice porridge'], n: [300,18,40,6,1,1,1100,350,40,1.2,30,1.5,20,2,0.1,0.3,0.3,15,500] },
  { id: 'lau-thai', kind: 'food', vi: 'Lẩu Thái (1 phần)', en: 'Thai hotpot (1 person)', serving: { vi: '1 phần/người', en: '1 person portion' },
    alias: ['lau thai', 'lau', 'hotpot', 'hot pot'], n: [600,40,40,28,3,8,2800,900,150,4,70,4,120,30,2,2,3,60,500] },
  // --- Dry noodles & rice ---
  { id: 'bun-cha', kind: 'food', vi: 'Bún chả Hà Nội', en: 'Hanoi grilled pork with noodles', serving: { vi: '1 phần (~450g)', en: '1 serving (~450 g)' },
    alias: ['bun cha'], n: [620,30,70,24,3,14,1600,650,70,3.0,55,4,120,25,0.3,1.5,0.9,70,250] },
  { id: 'bun-thit-nuong', kind: 'food', vi: 'Bún thịt nướng', en: 'Grilled pork vermicelli bowl', serving: { vi: '1 tô (~400g)', en: '1 bowl (~400 g)' },
    alias: ['bun thit nuong', 'bun nuong', 'vermicelli bowl', 'grilled pork vermicelli'], n: [590,26,72,22,3,16,1100,600,60,2.5,55,3.5,150,20,0.2,1.8,0.7,60,200] },
  { id: 'com-tam', kind: 'food', vi: 'Cơm tấm sườn bì chả', en: 'Broken rice with pork chop', serving: { vi: '1 dĩa (~450g)', en: '1 plate (~450 g)' },
    alias: ['com tam', 'com suon', 'broken rice'], n: [720,38,80,27,2,10,1500,650,80,3,60,4.5,90,8,0.8,1.5,1.2,40,180] },
  { id: 'com-ga', kind: 'food', vi: 'Cơm gà', en: 'Chicken rice', serving: { vi: '1 dĩa (~400g)', en: '1 plate (~400 g)' },
    alias: ['com ga', 'chicken rice'], n: [600,35,72,17,2,3,1200,500,40,2,50,2.5,50,5,0.2,1,0.4,30,150] },
  { id: 'com-trang', kind: 'food', vi: 'Cơm trắng', en: 'Steamed white rice', serving: { vi: '1 chén (~150g)', en: '1 small bowl (~150 g)' },
    alias: ['com trang', 'chen com', 'white rice', 'steamed rice', 'rice'], n: [200,4,45,0.4,0.6,0,2,40,4,0.3,18,0.7,0,0,0,0,0,4,100] },
  { id: 'xoi', kind: 'food', vi: 'Xôi gà', en: 'Sticky rice with chicken', serving: { vi: '1 gói (~300g)', en: '1 pack (~300 g)' },
    alias: ['xoi ga', 'xoi', 'sticky rice'], n: [500,20,75,13,2,2,700,250,20,1.5,30,2,30,1,0.1,0.8,0.3,15,100] },
  // --- Bánh / street food ---
  { id: 'banh-mi', kind: 'food', vi: 'Bánh mì thịt', en: 'Bánh mì sandwich', serving: { vi: '1 ổ', en: '1 sandwich' },
    alias: ['banh mi thit', 'banh mi pate', 'banh mi', 'vietnamese sandwich'], n: [520,22,58,22,3,7,1300,350,90,3.5,40,2.5,120,8,0.3,2,0.9,90,80] },
  { id: 'banh-mi-op-la', kind: 'food', vi: 'Bánh mì ốp la', en: 'Bánh mì with fried eggs', serving: { vi: '1 phần', en: '1 serving' },
    alias: ['banh mi op la', 'op la', 'banh mi trung', 'egg banh mi'], n: [450,18,52,19,2,5,900,250,90,3.2,30,1.8,160,4,1.1,1.6,0.8,90,60] },
  { id: 'banh-xeo', kind: 'food', vi: 'Bánh xèo', en: 'Sizzling crêpe', serving: { vi: '1 cái + rau', en: '1 crêpe + greens' },
    alias: ['banh xeo', 'sizzling crepe', 'vietnamese crepe'], n: [500,15,48,28,3,4,800,450,50,2.2,40,1.5,180,25,0.3,3,0.4,60,150] },
  { id: 'banh-cuon', kind: 'food', vi: 'Bánh cuốn', en: 'Steamed rice rolls', serving: { vi: '1 dĩa (~300g)', en: '1 plate (~300 g)' },
    alias: ['banh cuon', 'rice rolls'], n: [400,15,58,11,1,3,1100,250,30,1.5,25,1.5,30,4,0.2,0.8,0.4,20,200] },
  { id: 'banh-bao', kind: 'food', vi: 'Bánh bao', en: 'Steamed bun', serving: { vi: '1 cái', en: '1 bun' },
    alias: ['banh bao', 'steamed bun', 'bao'], n: [320,12,45,10,2,6,600,200,40,2,20,1,20,1,0.2,0.5,0.4,40,60] },
  { id: 'goi-cuon', kind: 'food', vi: 'Gỏi cuốn', en: 'Fresh spring rolls', serving: { vi: '2 cuốn + nước chấm', en: '2 rolls + dipping sauce' },
    alias: ['goi cuon', 'fresh spring roll', 'summer roll', 'fresh roll'], n: [200,12,30,3,2,3,500,250,40,1,20,1,80,8,0.1,0.4,0.4,20,100] },
  { id: 'cha-gio', kind: 'food', vi: 'Chả giò', en: 'Fried spring rolls', serving: { vi: '4 cuốn', en: '4 rolls' },
    alias: ['cha gio', 'nem ran', 'fried spring roll', 'egg roll', 'spring roll'], n: [360,12,28,22,2,2,600,250,30,1.5,25,1.2,60,4,0.2,2.5,0.4,20,40] },
  { id: 'banh-trang-tron', kind: 'food', vi: 'Bánh tráng trộn', en: 'Rice paper salad', serving: { vi: '1 bịch', en: '1 bag' },
    alias: ['banh trang tron', 'banh trang'], n: [350,10,45,14,2,8,1200,200,40,1.5,20,1,80,10,0.4,1.5,0.3,20,40] },
  // --- Home dishes ---
  { id: 'bo-kho', kind: 'food', vi: 'Bò kho + bánh mì', en: 'Beef stew with bread', serving: { vi: '1 phần', en: '1 serving' },
    alias: ['bo kho', 'beef stew'], n: [650,35,55,30,3,6,1600,800,60,5,55,7,500,12,0.2,1.5,3,40,300] },
  { id: 'canh-chua', kind: 'food', vi: 'Canh chua cá', en: 'Sweet & sour fish soup', serving: { vi: '1 tô (~400g)', en: '1 bowl (~400 g)' },
    alias: ['canh chua', 'sour soup'], n: [180,18,12,6,2,6,1100,700,60,1.2,40,0.8,90,30,1.5,1,1.5,30,400] },
  { id: 'ca-kho', kind: 'food', vi: 'Cá kho tộ', en: 'Caramelized braised fish', serving: { vi: '1 phần (~150g cá)', en: '1 portion (~150 g fish)' },
    alias: ['ca kho', 'ca kho to', 'braised fish'], n: [300,26,10,17,0,8,1400,500,40,1,40,0.8,40,1,4,1.2,2,10,80] },
  { id: 'thit-kho', kind: 'food', vi: 'Thịt kho trứng', en: 'Braised pork & eggs', serving: { vi: '1 phần', en: '1 portion' },
    alias: ['thit kho', 'thit kho trung', 'braised pork'], n: [450,26,8,34,0,7,1300,400,40,2,25,3,120,0,1.2,1,1,25,80] },
  { id: 'rau-muong', kind: 'food', vi: 'Rau muống xào tỏi', en: 'Garlic morning glory', serving: { vi: '1 dĩa', en: '1 plate' },
    alias: ['rau muong', 'morning glory', 'water spinach'], n: [120,4,8,8,3,1,700,550,100,2.5,70,0.3,350,50,0,1.5,0,90,150] },
  { id: 'trung-luoc', kind: 'food', vi: 'Trứng luộc', en: 'Boiled egg', serving: { vi: '1 quả', en: '1 egg' },
    alias: ['trung luoc', 'trung', 'boiled egg', 'egg', 'eggs'], n: [78,6.3,0.6,5.3,0,0.6,62,63,25,0.6,5,0.5,75,0,1.1,0.5,0.45,22,38] },
  { id: 'chuoi', kind: 'food', vi: 'Chuối', en: 'Banana', serving: { vi: '1 quả', en: '1 banana' },
    alias: ['chuoi', 'banana', 'bananas'], n: [105,1.3,27,0.4,3.1,14,1,422,6,0.3,32,0.2,4,10,0,0.1,0,24,89] },
  { id: 'sua-chua', kind: 'food', vi: 'Sữa chua', en: 'Yogurt', serving: { vi: '1 hũ (100g)', en: '1 cup (100 g)' },
    alias: ['sua chua', 'yogurt', 'yoghurt'], n: [100,3.5,15,3,0,14,50,150,120,0,12,0.5,30,0.5,0.1,0.1,0.3,10,80] },
  // --- Desserts & drinks ---
  { id: 'che-ba-mau', kind: 'food', vi: 'Chè ba màu', en: 'Three-color dessert', serving: { vi: '1 ly', en: '1 cup' },
    alias: ['che ba mau', 'che', 'three color dessert'], n: [350,6,64,8,4,40,60,300,40,1.5,40,0.8,10,2,0,0.3,0,40,150] },
  { id: 'ca-phe-sua-da', kind: 'drink', vi: 'Cà phê sữa đá', en: 'Iced coffee with condensed milk', serving: { vi: '1 ly', en: '1 glass' },
    alias: ['ca phe sua da', 'ca phe sua', 'cafe sua da', 'cafe sua', 'bac xiu', 'iced milk coffee', 'vietnamese coffee'], n: [150,3,24,4,0,23,40,200,100,0.1,15,0.1,20,0,0,0.1,0.2,0,200] },
  { id: 'ca-phe-den', kind: 'drink', vi: 'Cà phê đen đá', en: 'Iced black coffee', serving: { vi: '1 ly', en: '1 glass' },
    alias: ['ca phe den', 'cafe den', 'black coffee', 'coffee', 'ca phe', 'cafe'], n: [5,0.3,0,0,0,0,5,120,5,0,8,0,0,0,0,0,0,2,200] },
  { id: 'tra-sua', kind: 'drink', vi: 'Trà sữa trân châu', en: 'Bubble milk tea', serving: { vi: '1 ly (500ml)', en: '1 cup (500 ml)' },
    alias: ['tra sua', 'tra sua tran chau', 'milk tea', 'bubble tea', 'boba'], n: [380,3,70,10,0,45,80,150,90,0.4,15,0.3,20,0,0.5,0.2,0.2,2,350] },
  { id: 'sinh-to-bo', kind: 'drink', vi: 'Sinh tố bơ', en: 'Avocado smoothie', serving: { vi: '1 ly', en: '1 glass' },
    alias: ['sinh to bo', 'avocado smoothie', 'sinh to'], n: [380,5,45,22,7,35,80,700,140,0.6,45,0.8,30,12,0.8,2.5,0.4,90,250] },
  { id: 'nuoc-mia', kind: 'drink', vi: 'Nước mía', en: 'Sugarcane juice', serving: { vi: '1 ly (300ml)', en: '1 glass (300 ml)' },
    alias: ['nuoc mia', 'sugarcane juice', 'sugar cane'], n: [180,0,45,0,0,43,30,200,30,0.5,20,0.1,0,2,0,0,0,0,260] },
  { id: 'sua-tuoi', kind: 'drink', vi: 'Sữa tươi', en: 'Milk', serving: { vi: '1 hộp (180ml)', en: '1 carton (180 ml)' },
    alias: ['sua tuoi', 'sua', 'milk'], n: [120,5.6,8.5,6.5,0,8.5,80,270,215,0,20,0.7,80,0,1.8,0.1,0.8,9,160] },
  { id: 'bia', kind: 'drink', vi: 'Bia', en: 'Beer', serving: { vi: '1 lon (330ml)', en: '1 can (330 ml)' },
    alias: ['bia', 'beer'], n: [145,1.5,12,0,0,0,15,90,15,0.1,20,0,0,0,0,0,0.1,20,300] },
  { id: 'tra-da', kind: 'drink', vi: 'Trà đá', en: 'Iced tea', serving: { vi: '1 ly', en: '1 glass' },
    alias: ['tra da', 'iced tea', 'tea', 'tra'], n: [2,0,0.5,0,0,0,5,80,0,0,5,0,0,0,0,0,0,10,300] },
  { id: 'nuoc', kind: 'drink', vi: 'Nước lọc', en: 'Water', serving: { vi: '1 ly (250ml)', en: '1 glass (250 ml)' },
    alias: ['nuoc loc', 'ly nuoc', 'coc nuoc', 'nuoc', 'water'], n: [0,0,0,0,0,0,5,0,10,0,3,0,0,0,0,0,0,0,250] },
];

// Supplement presets (per serving). Used for manual cabinet entries and the
// offline parser; photo scans via AI replace these with label values.
export const SUPPLEMENTS = [
  { id: 'multi', kind: 'supplement', vi: 'Vitamin tổng hợp', en: 'Multivitamin', serving: { vi: '1 viên', en: '1 tablet' },
    alias: ['multivitamin', 'multi vitamin', 'vitamin tong hop', 'centrum', 'multi'], n: [0,0,0,0,0,0,0,80,200,18,50,11,900,90,25,15,6,400,0] },
  { id: 'vit-d-1000', kind: 'supplement', vi: 'Vitamin D3 1000 IU', en: 'Vitamin D3 1000 IU', serving: { vi: '1 viên', en: '1 softgel' },
    alias: ['vitamin d3', 'vitamin d', 'vit d', 'd3'], n: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,25,0,0,0,0] },
  { id: 'fish-oil', kind: 'supplement', vi: 'Dầu cá Omega-3', en: 'Fish oil (omega-3)', serving: { vi: '1 viên 1000mg', en: '1 softgel 1000 mg' },
    alias: ['fish oil', 'omega 3', 'omega3', 'dau ca'], n: [10,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0] },
  { id: 'magnesium', kind: 'supplement', vi: 'Magie 200mg', en: 'Magnesium 200 mg', serving: { vi: '1 viên', en: '1 capsule' },
    alias: ['magnesium', 'magie', 'magne'], n: [0,0,0,0,0,0,0,0,0,0,200,0,0,0,0,0,0,0,0] },
  { id: 'calcium-d', kind: 'supplement', vi: 'Canxi + D3', en: 'Calcium + D3', serving: { vi: '1 viên', en: '1 tablet' },
    alias: ['calcium', 'canxi'], n: [0,0,0,0,0,0,0,0,600,0,0,0,0,0,10,0,0,0,0] },
  { id: 'iron', kind: 'supplement', vi: 'Viên sắt 65mg', en: 'Iron 65 mg', serving: { vi: '1 viên', en: '1 tablet' },
    alias: ['iron', 'vien sat', 'sat', 'ferrous'], n: [0,0,0,0,0,0,0,0,0,65,0,0,0,0,0,0,0,0,0] },
  { id: 'zinc', kind: 'supplement', vi: 'Kẽm 15mg', en: 'Zinc 15 mg', serving: { vi: '1 viên', en: '1 tablet' },
    alias: ['zinc', 'kem'], n: [0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,0,0,0,0] },
  { id: 'vit-c', kind: 'supplement', vi: 'Vitamin C 1000mg', en: 'Vitamin C 1000 mg', serving: { vi: '1 viên', en: '1 tablet' },
    alias: ['vitamin c', 'vit c', 'c sui'], n: [0,0,0,0,0,0,0,0,0,0,0,0,0,1000,0,0,0,0,0] },
  { id: 'b12', kind: 'supplement', vi: 'Vitamin B12 1000µg', en: 'Vitamin B12 1000 µg', serving: { vi: '1 viên', en: '1 tablet' },
    alias: ['vitamin b12', 'b12', 'vit b12'], n: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1000,0,0] },
  { id: 'folic', kind: 'supplement', vi: 'Axit folic 400µg', en: 'Folic acid 400 µg', serving: { vi: '1 viên', en: '1 tablet' },
    alias: ['folic acid', 'folic', 'axit folic', 'folate'], n: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,680,0] },
  { id: 'protein-shake', kind: 'supplement', vi: 'Whey protein', en: 'Whey protein shake', serving: { vi: '1 muỗng (30g)', en: '1 scoop (30 g)' },
    alias: ['whey', 'protein shake', 'protein powder', 'whey protein'], n: [120,24,3,1.5,0,1,50,150,120,0.5,30,0.5,0,0,0,0,0.3,0,0] },
];

// Words that mark a medication (no nutrients; logged for adherence only).
export const MED_WORDS = [
  'thuoc', 'medication', 'medicine', 'meds', 'med', 'pill', 'pills',
  'metformin', 'paracetamol', 'panadol', 'tylenol', 'ibuprofen', 'aspirin', 'amlodipine',
  'lisinopril', 'atorvastatin', 'rosuvastatin', 'levothyroxine', 'omeprazole', 'losartan',
  'insulin', 'cetirizine', 'loratadine', 'birth control', 'thuoc tranh thai',
];

export function nutrientsFromArray(arr) {
  const out = {};
  NUTRIENT_KEYS.forEach((k, i) => { out[k] = arr[i] || 0; });
  return out;
}

// Compact text table for grounding the AI parser (kept stable so the
// system prompt stays cacheable).
export function referenceTable() {
  const head = 'name_vi | name_en | serving | ' + NUTRIENT_KEYS.join(',');
  const rows = [...FOODS, ...SUPPLEMENTS].map(f => `${f.vi} | ${f.en} | ${f.serving.en} | ${f.n.join(',')}`);
  return [head, ...rows].join('\n');
}
