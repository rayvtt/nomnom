-- Seed: Vietnamese Nutrition Database  (58 dishes)
-- avg_price_vnd is estimated market price in Ho Chi Minh City (2025)

INSERT INTO nutrition_db
  (slug, emoji, name_vi, name_en, category, region_vi, region_en,
   kcal, protein_g, carbs_g, fat_g, good_carbs_g, bad_carbs_g,
   health_score, warn_vi, warn_en, warn_type,
   ingredients_vi, ingredients_en, avg_price_vnd)
VALUES

-- ═══════════════════════════════════════════
-- SOUPS (12)
-- ═══════════════════════════════════════════
('pho-bo-tai-chin','🍜','Phở bò tái chín','Beef pho (rare & well-done)','soup','Hà Nội','Hanoi',
  480,32,52,12,42,10,72,
  'Nước dùng nhiều natri','High-sodium broth','sodium',
  ARRAY['Bánh phở','Bò tái','Hành','Rau quế','Nước dùng xương'],
  ARRAY['Rice noodles','Rare beef','Onion','Thai basil','Bone broth'],60000),

('pho-ga','🍜','Phở gà','Chicken pho','soup','Hà Nội','Hanoi',
  380,28,48,6,40,8,80,
  'Nhẹ hơn phở bò, ít béo','Lighter than beef pho, low fat','good',
  ARRAY['Bánh phở','Gà ta','Hành lá','Rau mùi','Nước dùng gà'],
  ARRAY['Rice noodles','Free-range chicken','Scallion','Cilantro','Chicken broth'],55000),

('bun-bo-hue','🍲','Bún bò Huế','Hue beef noodle soup','soup','Huế','Hue',
  520,30,48,16,36,12,68,
  'Nhiều mắm ruốc = natri','Lots of shrimp paste = sodium','sodium',
  ARRAY['Bún','Bò bắp','Giò heo','Sả','Mắm ruốc'],
  ARRAY['Vermicelli','Beef shank','Pork knuckle','Lemongrass','Shrimp paste'],70000),

('canh-chua-ca-loc','🥒','Canh chua cá lóc','Sour fish soup','soup','Miền Tây','Mekong Delta',
  180,22,12,4,10,2,90,
  'Ít calo, nhiều protein','Low calorie, high protein','good',
  ARRAY['Cá lóc','Cà chua','Dứa','Me','Rau ngò om'],
  ARRAY['Snakehead fish','Tomato','Pineapple','Tamarind','Rice paddy herb'],65000),

('bun-rieu-cua','🍲','Bún riêu cua','Crab noodle soup','soup','Hà Nội','Hanoi',
  420,24,44,14,34,10,70,
  'Riêu cua + cà chua = natri vừa','Crab paste + tomato = moderate sodium','sodium',
  ARRAY['Bún','Riêu cua','Đậu phụ','Cà chua','Rau sống'],
  ARRAY['Vermicelli','Crab paste','Tofu','Tomato','Fresh greens'],55000),

('hu-tieu-nam-vang','🍜','Hủ tiếu Nam Vang','Phnom Penh noodle soup','soup','Sài Gòn','Saigon',
  450,26,50,14,38,12,66,
  'Nước dùng heo nhiều mỡ','Pork broth high in fat','sodium',
  ARRAY['Hủ tiếu','Thịt heo','Tôm','Gan','Giá đỗ'],
  ARRAY['Rice noodles','Pork','Shrimp','Liver','Bean sprouts'],50000),

('mi-quang','🍲','Mì Quảng','Quang noodles','soup','Đà Nẵng','Da Nang',
  460,28,52,12,40,12,72,
  'Bún + đậu phộng = carb + chất béo tốt','Noodles + peanuts = carbs + healthy fats','good',
  ARRAY['Mì Quảng','Tôm','Thịt heo','Đậu phộng','Rau sống'],
  ARRAY['Quang noodles','Shrimp','Pork','Peanuts','Fresh herbs'],55000),

('chao-long','🥣','Cháo lòng','Offal rice porridge','soup','Toàn quốc','Nationwide',
  350,20,42,10,30,12,58,
  'Cháo trắng = carb tinh, nội tạng = cholesterol','White porridge = refined carb, offal = cholesterol','sugar',
  ARRAY['Gạo','Lòng heo','Huyết','Hành phi','Quẩy'],
  ARRAY['Rice','Pork offal','Blood pudding','Fried shallots','Fried dough'],40000),

('bun-mam','🍜','Bún mắm','Fermented fish noodle soup','soup','Miền Tây','Mekong Delta',
  480,26,46,18,34,12,62,
  'Mắm = natri cực cao','Fermented fish = very high sodium','sodium',
  ARRAY['Bún','Mắm cá linh','Cà tím','Tôm','Thịt heo'],
  ARRAY['Vermicelli','Fermented fish paste','Eggplant','Shrimp','Pork'],55000),

('lau-thai-hai-san','🍲','Lẩu thái hải sản','Thai-style seafood hotpot','soup','Toàn quốc','Nationwide',
  380,34,18,16,14,4,82,
  'Protein cao, ít carb — tốt cho keto','High protein, low carb — keto-friendly','good',
  ARRAY['Tôm','Mực','Cá','Nấm','Rau muống'],
  ARRAY['Shrimp','Squid','Fish','Mushrooms','Morning glory'],200000),

('sup-cua','🥣','Súp cua','Crab soup','soup','Sài Gòn','Saigon',
  220,14,24,8,12,12,55,
  'Bột bắp = carb tinh, trứng cút = protein tốt','Cornstarch = refined carb, quail egg = good protein','sugar',
  ARRAY['Cua','Trứng cút','Bột bắp','Nấm','Ngò'],
  ARRAY['Crab','Quail eggs','Cornstarch','Mushrooms','Cilantro'],45000),

('bun-thang','🍜','Bún thang','Hanoi mixed noodle soup','soup','Hà Nội','Hanoi',
  390,26,42,10,34,8,76,
  'Nước dùng trong, ít dầu mỡ','Clear broth, low in oil','good',
  ARRAY['Bún','Giò lụa','Trứng','Gà xé','Mắm tôm'],
  ARRAY['Vermicelli','Pork sausage','Egg','Shredded chicken','Shrimp paste'],60000),

-- ═══════════════════════════════════════════
-- RICE DISHES (8)
-- ═══════════════════════════════════════════
('com-tam-suon-bi-cha','🍚','Cơm tấm sườn bì chả','Broken rice with pork','rice','Sài Gòn','Saigon',
  650,35,68,22,30,38,45,
  'Đường ẩn từ nước mắm + cơm','Hidden sugar from fish sauce + rice','sugar',
  ARRAY['Gạo tấm','Sườn nướng','Bì','Chả','Mỡ hành'],
  ARRAY['Broken rice','Grilled pork','Pork skin','Meatloaf','Scallion oil'],45000),

('cari-ga','🍛','Cari gà','Vietnamese chicken curry','rice','Miền Nam','Southern VN',
  420,28,32,20,24,8,74,
  'Nước cốt dừa nhiều chất béo','Coconut milk high in fat','sodium',
  ARRAY['Gà','Khoai lang','Cà rốt','Nước cốt dừa','Sả'],
  ARRAY['Chicken','Sweet potato','Carrot','Coconut milk','Lemongrass'],65000),

('com-ga-hoi-an','🍚','Cơm gà Hội An','Hoi An chicken rice','rice','Hội An','Hoi An',
  520,30,60,14,35,25,60,
  'Cơm nhuộm nghệ = ít chất xơ','Turmeric rice = low fiber','sugar',
  ARRAY['Cơm nghệ','Gà xé','Hành phi','Rau răm','Nước mắm'],
  ARRAY['Turmeric rice','Shredded chicken','Fried shallots','Vietnamese coriander','Fish sauce'],55000),

('com-chien-duong-chau','🍚','Cơm chiên Dương Châu','Yang Chow fried rice','rice','Toàn quốc','Nationwide',
  580,20,62,24,22,40,38,
  'Chiên dầu + cơm trắng = calo rỗng','Fried in oil + white rice = empty calories','sugar',
  ARRAY['Cơm nguội','Trứng','Lạp xưởng','Tôm','Đậu Hà Lan'],
  ARRAY['Day-old rice','Egg','Chinese sausage','Shrimp','Peas'],50000),

('ca-kho-to','🐟','Cá kho tộ','Caramelized clay pot fish','rice','Miền Tây','Mekong Delta',
  380,32,18,16,4,14,60,
  'Kho nước màu = đường caramel','Caramel braising = caramelized sugar','sugar',
  ARRAY['Cá basa','Nước màu','Nước mắm','Tiêu','Hành'],
  ARRAY['Pangasius','Caramel sauce','Fish sauce','Pepper','Shallots'],55000),

('thit-kho-hot-vit','🥩','Thịt kho hột vịt','Braised pork with duck eggs','rice','Miền Nam','Southern VN',
  520,30,22,32,4,18,48,
  'Nước dừa + nước màu = đường ẩn, nhiều mỡ','Coconut juice + caramel = hidden sugar, high fat','sugar',
  ARRAY['Thịt ba chỉ','Hột vịt','Nước dừa','Nước mắm','Nước màu'],
  ARRAY['Pork belly','Duck eggs','Coconut juice','Fish sauce','Caramel sauce'],65000),

('com-suon-nuong','🍚','Cơm sườn nướng','Grilled pork chop rice','rice','Toàn quốc','Nationwide',
  600,32,64,20,28,36,48,
  'Sườn ướp đường + cơm trắng','Sugar-marinated pork + white rice','sugar',
  ARRAY['Cơm trắng','Sườn nướng','Dưa leo','Đồ chua','Nước mắm'],
  ARRAY['White rice','Grilled pork chop','Cucumber','Pickled veggies','Fish sauce'],50000),

('com-chay-thap-cam','🌿','Cơm chay thập cẩm','Mixed vegetarian rice','vegetarian','Toàn quốc','Nationwide',
  380,14,52,10,40,12,82,
  'Nhiều rau + đậu hũ = protein thực vật tốt','High veg + tofu = good plant protein','good',
  ARRAY['Cơm trắng','Đậu hũ','Nấm','Rau cải','Tương'],
  ARRAY['White rice','Tofu','Mushrooms','Bok choy','Soy sauce'],40000),

-- ═══════════════════════════════════════════
-- STREET FOOD (10)
-- ═══════════════════════════════════════════
('banh-mi-thit','🥖','Bánh mì thịt','Vietnamese baguette','street','Sài Gòn','Saigon',
  520,22,58,18,20,38,52,
  'Bánh mì trắng = carb tinh','White baguette = refined carb','sugar',
  ARRAY['Bánh mì','Chả lụa','Pa-tê','Đồ chua','Dưa leo'],
  ARRAY['Baguette','Pork sausage','Pâté','Pickled veggies','Cucumber'],30000),

('banh-xeo','🥟','Bánh xèo','Sizzling crepe','street','Miền Nam','Southern VN',
  450,16,42,24,20,22,55,
  'Chiên giòn = nhiều dầu, bột gạo = carb tinh','Deep-fried = high oil, rice flour = refined carb','sugar',
  ARRAY['Bột gạo','Tôm','Thịt heo','Giá đỗ','Rau sống'],
  ARRAY['Rice flour','Shrimp','Pork','Bean sprouts','Fresh herbs'],60000),

('banh-cuon','🫔','Bánh cuốn','Steamed rice rolls','street','Hà Nội','Hanoi',
  280,14,38,6,30,8,78,
  'Hấp = ít dầu, protein từ thịt','Steamed = low oil, good protein from meat','good',
  ARRAY['Bột gạo','Thịt heo','Mộc nhĩ','Hành phi','Nước mắm'],
  ARRAY['Rice flour','Pork','Wood ear mushroom','Fried shallots','Fish sauce'],35000),

('bo-la-lot','🍢','Bò lá lốt','Beef in betel leaf','grilled','Miền Nam','Southern VN',
  320,24,8,22,6,2,72,
  'Protein tốt, ít carb, béo vừa','Good protein, low carb, moderate fat','good',
  ARRAY['Bò xay','Lá lốt','Sả','Mỡ chài','Đậu phộng'],
  ARRAY['Ground beef','Betel leaf','Lemongrass','Caul fat','Peanuts'],70000),

('banh-khot','🥘','Bánh khọt','Mini savory pancakes','street','Vũng Tàu','Vung Tau',
  350,14,36,16,18,18,58,
  'Chiên dầu + bột gạo = carb tinh','Pan-fried + rice flour = refined carb','sugar',
  ARRAY['Bột gạo','Nước cốt dừa','Tôm','Hành lá','Rau sống'],
  ARRAY['Rice flour','Coconut milk','Shrimp','Scallion','Fresh herbs'],50000),

('nem-lui','🍡','Nem lụi','Grilled pork skewers','grilled','Huế','Hue',
  340,22,28,14,18,10,68,
  'Ướp mắm đường, ăn kèm bánh tráng','Fish sauce + sugar marinade, served with rice paper','sodium',
  ARRAY['Thịt heo','Mỡ','Sả','Bánh tráng','Rau sống'],
  ARRAY['Pork','Fat','Lemongrass','Rice paper','Fresh herbs'],55000),

('bo-bia','🌯','Bò bía','Popiah rolls','street','Sài Gòn','Saigon',
  180,8,22,6,14,8,72,
  'Nhẹ bụng, ít calo','Light, low calorie','good',
  ARRAY['Bánh tráng','Lạp xưởng','Trứng','Jicama','Rau thơm'],
  ARRAY['Rice paper','Chinese sausage','Egg','Jicama','Fresh herbs'],25000),

('banh-trang-nuong','🥞','Bánh tráng nướng','Vietnamese pizza','street','Đà Lạt','Da Lat',
  380,16,40,16,14,26,42,
  'Sốt mayo + trứng cút + tương ớt = nhiều phụ gia','Mayo + quail egg + chili sauce = lots of additives','sugar',
  ARRAY['Bánh tráng','Trứng cút','Bò khô','Hành phi','Sốt tương'],
  ARRAY['Rice paper','Quail eggs','Beef jerky','Fried shallots','Soy sauce'],20000),

('cha-gio-ram','🥠','Chả giò (ram)','Fried spring rolls','street','Miền Nam','Southern VN',
  360,14,32,20,12,20,45,
  'Chiên ngập dầu = béo, vỏ bánh tráng = carb tinh','Deep-fried = fatty, rice paper wrapper = refined carb','sugar',
  ARRAY['Bánh tráng','Thịt heo','Miến','Mộc nhĩ','Cà rốt'],
  ARRAY['Rice paper','Pork','Glass noodles','Wood ear mushroom','Carrot'],35000),

('banh-gio','🧆','Bánh giò','Pyramid rice dumpling','street','Hà Nội','Hanoi',
  320,12,44,10,28,16,58,
  'Bột gạo hấp = carb mịn, ít rau','Steamed rice flour = fine carb, low vegetables','sugar',
  ARRAY['Bột gạo','Thịt heo','Mộc nhĩ','Hành','Lá chuối'],
  ARRAY['Rice flour','Pork','Wood ear mushroom','Shallots','Banana leaf'],15000),

-- ═══════════════════════════════════════════
-- GRILLED (3 additional beyond bo-la-lot / nem-lui above)
-- ═══════════════════════════════════════════
('ga-nuong-mat-ong','🍗','Gà nướng mật ong','Honey grilled chicken','grilled','Toàn quốc','Nationwide',
  420,36,16,22,4,12,65,
  'Mật ong = đường, da gà = mỡ','Honey = sugar, chicken skin = fat','sugar',
  ARRAY['Gà','Mật ong','Tỏi','Sả','Ớt'],
  ARRAY['Chicken','Honey','Garlic','Lemongrass','Chili'],120000),

('tom-nuong-muoi-ot','🦐','Tôm nướng muối ớt','Salt & chili grilled shrimp','grilled','Miền Nam','Southern VN',
  220,28,4,10,3,1,92,
  'Protein cao, gần 0 carb — rất tốt','High protein, near-zero carb — excellent','good',
  ARRAY['Tôm sú','Muối','Ớt','Chanh','Rau răm'],
  ARRAY['Tiger shrimp','Salt','Chili','Lime','Vietnamese coriander'],150000),

('bo-nuong-la-lot','🥩','Bò nướng lá lốt','Grilled beef betel leaf','grilled','Sài Gòn','Saigon',
  340,26,6,24,4,2,74,
  'Nhiều protein, ít carb','High protein, low carb','good',
  ARRAY['Bò xay','Lá lốt','Hành tím','Sả','Mỡ chài'],
  ARRAY['Ground beef','Betel leaf','Shallots','Lemongrass','Caul fat'],90000),

-- ═══════════════════════════════════════════
-- NOODLE DISHES  (5)
-- ═══════════════════════════════════════════
('bun-cha-ha-noi','🥢','Bún chả Hà Nội','Grilled pork noodles','noodle','Hà Nội','Hanoi',
  450,26,42,16,30,12,68,
  'Nước chấm pha đường','Dipping sauce has sugar','sugar',
  ARRAY['Bún','Thịt nướng','Chả viên','Rau sống','Nước chấm'],
  ARRAY['Vermicelli','Grilled pork','Pork patties','Fresh herbs','Dipping sauce'],60000),

('bun-thit-nuong','🍖','Bún thịt nướng','Grilled pork vermicelli','noodle','Miền Nam','Southern VN',
  480,28,48,16,34,14,66,
  'Thịt ướp đường + nước mắm','Sugar + fish sauce marinated meat','sugar',
  ARRAY['Bún','Thịt nướng','Chả giò','Đậu phộng','Rau sống'],
  ARRAY['Vermicelli','Grilled pork','Spring rolls','Peanuts','Fresh herbs'],55000),

('pho-xao-bo','🥡','Phở xào bò','Stir-fried pho with beef','noodle','Hà Nội','Hanoi',
  520,26,58,18,30,28,52,
  'Xào dầu + bánh phở = carb + dầu','Stir-fried noodles = carb + oil','sugar',
  ARRAY['Bánh phở','Bò','Giá đỗ','Hành','Xì dầu'],
  ARRAY['Rice noodles','Beef','Bean sprouts','Scallion','Soy sauce'],65000),

('mi-xao-hai-san','🍝','Mì xào hải sản','Stir-fried seafood noodles','noodle','Toàn quốc','Nationwide',
  480,24,52,18,22,30,50,
  'Mì trứng = carb tinh, xào dầu','Egg noodles = refined carb, stir-fried','sugar',
  ARRAY['Mì trứng','Tôm','Mực','Cải ngọt','Tỏi'],
  ARRAY['Egg noodles','Shrimp','Squid','Choy sum','Garlic'],75000),

('bun-bo-nam-bo','🥗','Bún bò Nam Bộ','Southern beef noodle salad','noodle','Hà Nội','Hanoi',
  420,28,40,14,30,10,76,
  'Bún + rau + bò = cân bằng tốt','Noodles + greens + beef = well-balanced','good',
  ARRAY['Bún','Bò xào','Đậu phộng','Rau sống','Nước mắm chua ngọt'],
  ARRAY['Vermicelli','Stir-fried beef','Peanuts','Fresh herbs','Sweet fish sauce'],55000),

-- ═══════════════════════════════════════════
-- APPETIZERS (5)
-- ═══════════════════════════════════════════
('goi-cuon-tom','🥗','Gỏi cuốn tôm','Shrimp spring rolls','appetizer','Miền Nam','Southern VN',
  120,8,14,3,11,3,92,
  'Carb tốt, nhiều rau','Good carbs, high vegetables','good',
  ARRAY['Bánh tráng','Tôm','Bún','Rau sống','Nước chấm'],
  ARRAY['Rice paper','Shrimp','Vermicelli','Fresh herbs','Dipping sauce'],35000),

('goi-ngo-sen-tom-thit','🥒','Gỏi ngó sen tôm thịt','Lotus stem salad','appetizer','Miền Nam','Southern VN',
  160,14,12,6,10,2,90,
  'Rau + tôm + ngó sen = rất lành mạnh','Greens + shrimp + lotus stem = very healthy','good',
  ARRAY['Ngó sen','Tôm','Thịt heo','Rau răm','Đậu phộng'],
  ARRAY['Lotus stem','Shrimp','Pork','Vietnamese coriander','Peanuts'],55000),

('goi-ga-bap-cai','🥬','Gỏi gà bắp cải','Chicken cabbage salad','appetizer','Toàn quốc','Nationwide',
  180,20,10,6,8,2,88,
  'Ít calo, protein tốt, nhiều chất xơ','Low cal, good protein, high fiber','good',
  ARRAY['Gà xé','Bắp cải','Rau răm','Hành phi','Chanh'],
  ARRAY['Shredded chicken','Cabbage','Vietnamese coriander','Fried shallots','Lime'],45000),

('muc-chien-gion','🦑','Mực chiên giòn','Crispy fried squid','appetizer','Toàn quốc','Nationwide',
  340,22,24,18,6,18,45,
  'Chiên = dầu, bột chiên = carb tinh','Fried = oil, batter = refined carb','sugar',
  ARRAY['Mực','Bột chiên','Muối tiêu','Chanh','Ớt'],
  ARRAY['Squid','Frying batter','Salt & pepper','Lime','Chili'],80000),

('trung-vit-lon','🥚','Trứng vịt lộn','Fertilized duck egg (balut)','appetizer','Toàn quốc','Nationwide',
  180,14,2,12,2,0,70,
  'Protein + béo tự nhiên, cholesterol cao','Natural protein + fat, high cholesterol','sodium',
  ARRAY['Trứng vịt lộn','Rau răm','Muối tiêu','Chanh','Gừng'],
  ARRAY['Fertilized duck egg','Vietnamese coriander','Salt & pepper','Lime','Ginger'],7000),

-- ═══════════════════════════════════════════
-- SEAFOOD (4)
-- ═══════════════════════════════════════════
('cua-rang-me','🦀','Cua rang me','Tamarind crab','seafood','Sài Gòn','Saigon',
  380,28,22,18,8,14,62,
  'Sốt me có đường, nhưng cua = protein tốt','Tamarind sauce has sugar, but crab = good protein','sugar',
  ARRAY['Cua','Me','Tỏi','Đường','Hành'],
  ARRAY['Crab','Tamarind','Garlic','Sugar','Scallion'],300000),

('ngheu-hap-sa','🐚','Nghêu hấp sả','Lemongrass steamed clams','seafood','Miền Nam','Southern VN',
  140,18,6,4,5,1,94,
  'Ít calo nhất, protein cao — siêu lành mạnh','Lowest calorie, high protein — super healthy','good',
  ARRAY['Nghêu','Sả','Lá chanh','Ớt','Gừng'],
  ARRAY['Clams','Lemongrass','Kaffir lime leaves','Chili','Ginger'],80000),

('ca-chien-xu','🐟','Cá chiên xù','Deep-fried crispy fish','seafood','Toàn quốc','Nationwide',
  440,30,28,22,8,20,48,
  'Chiên ngập dầu, bột = carb tinh','Deep-fried, batter = refined carb','sugar',
  ARRAY['Cá diêu hồng','Bột chiên','Nước mắm','Tỏi','Ớt'],
  ARRAY['Red tilapia','Frying batter','Fish sauce','Garlic','Chili'],120000),

('tom-rang-thit-ba-chi','🦐','Tôm rang thịt ba chỉ','Shrimp with pork belly','seafood','Hà Nội','Hanoi',
  360,24,14,22,4,10,58,
  'Ba chỉ = mỡ, kho nước mắm đường','Pork belly = fat, braised in fish sauce + sugar','sugar',
  ARRAY['Tôm','Thịt ba chỉ','Nước mắm','Đường','Tiêu'],
  ARRAY['Shrimp','Pork belly','Fish sauce','Sugar','Pepper'],90000),

-- ═══════════════════════════════════════════
-- VEGETARIAN (3)
-- ═══════════════════════════════════════════
('rau-muong-xao-toi','🥬','Rau muống xào tỏi','Stir-fried morning glory','vegetarian','Toàn quốc','Nationwide',
  80,4,8,4,7,1,95,
  'Siêu ít calo, nhiều chất xơ — tốt nhất','Ultra low calorie, high fiber — the best','good',
  ARRAY['Rau muống','Tỏi','Dầu ăn','Muối','Nước mắm'],
  ARRAY['Morning glory','Garlic','Cooking oil','Salt','Fish sauce'],30000),

('dau-hu-sot-ca-chua','🍆','Đậu hũ sốt cà chua','Tofu in tomato sauce','vegetarian','Toàn quốc','Nationwide',
  220,16,14,10,12,2,86,
  'Protein thực vật tốt, ít đường','Good plant protein, low sugar','good',
  ARRAY['Đậu hũ','Cà chua','Hành lá','Dầu ăn','Nước tương'],
  ARRAY['Tofu','Tomato','Scallion','Cooking oil','Soy sauce'],35000),

('nam-xao-thap-cam','🍄','Nấm xào thập cẩm','Mixed mushroom stir-fry','vegetarian','Toàn quốc','Nationwide',
  150,8,12,8,10,2,88,
  'Ít calo, giàu khoáng chất','Low calorie, rich in minerals','good',
  ARRAY['Nấm đùi gà','Nấm kim châm','Đậu Hà Lan','Tỏi','Dầu hào'],
  ARRAY['King oyster mushroom','Enoki','Snow peas','Garlic','Oyster sauce'],55000),

-- ═══════════════════════════════════════════
-- DRINKS (6)
-- ═══════════════════════════════════════════
('ca-phe-sua-da','🥤','Cà phê sữa đá','Vietnamese iced coffee','drink','Toàn quốc','Nationwide',
  140,3,22,5,0,22,25,
  '100% đường từ sữa đặc','100% sugar from condensed milk','sugar',
  ARRAY['Cà phê phin','Sữa đặc','Đá'],
  ARRAY['Drip coffee','Condensed milk','Ice'],20000),

('ca-phe-den-da','☕','Cà phê đen đá','Black iced coffee','drink','Toàn quốc','Nationwide',
  15,1,2,0,0,2,95,
  'Gần 0 calo — lựa chọn tốt nhất','Near-zero calories — best choice','good',
  ARRAY['Cà phê phin','Đá'],
  ARRAY['Drip coffee','Ice'],15000),

('tra-sua-tran-chau','🧋','Trà sữa trân châu','Boba milk tea','drink','Toàn quốc','Nationwide',
  420,4,68,14,4,64,12,
  'Trân châu + syrup = bom đường','Boba + syrup = sugar bomb','sugar',
  ARRAY['Trà đen','Sữa','Trân châu','Syrup','Đá'],
  ARRAY['Black tea','Milk','Tapioca pearls','Syrup','Ice'],35000),

('sinh-to-bo','🥝','Sinh tố bơ','Avocado smoothie','drink','Toàn quốc','Nationwide',
  320,6,38,16,10,28,40,
  'Sữa đặc + đường = 70% carb xấu','Condensed milk + sugar = 70% bad carbs','sugar',
  ARRAY['Bơ','Sữa đặc','Đá','Đường'],
  ARRAY['Avocado','Condensed milk','Ice','Sugar'],40000),

('nuoc-mia','🍹','Nước mía','Sugarcane juice','drink','Toàn quốc','Nationwide',
  180,0,44,0,0,44,15,
  '100% đường tự nhiên — vẫn là đường','100% natural sugar — still sugar','sugar',
  ARRAY['Mía ép','Đá','Tắc'],
  ARRAY['Sugarcane juice','Ice','Kumquat'],15000),

('nuoc-dua-tuoi','🥥','Nước dừa tươi','Fresh coconut water','drink','Miền Nam','Southern VN',
  60,1,12,1,10,2,90,
  'Electrolyte tự nhiên, ít đường','Natural electrolytes, low sugar','good',
  ARRAY['Dừa tươi'],
  ARRAY['Fresh coconut'],25000),

-- ═══════════════════════════════════════════
-- DESSERTS (6)
-- ═══════════════════════════════════════════
('che-ba-mau','🧁','Chè ba màu','Three-color dessert','dessert','Miền Nam','Southern VN',
  280,5,52,8,15,37,30,
  'Đường + sữa đặc = đường ẩn cực cao','Sugar + condensed milk = very high hidden sugars','sugar',
  ARRAY['Đậu đỏ','Đậu xanh','Rau câu','Sữa đặc','Đá'],
  ARRAY['Red beans','Mung beans','Jelly','Condensed milk','Ice'],25000),

('banh-flan','🍮','Bánh flan','Vietnamese crème caramel','dessert','Toàn quốc','Nationwide',
  240,8,32,10,4,28,28,
  'Caramel + sữa đặc = đường ẩn','Caramel + condensed milk = hidden sugar','sugar',
  ARRAY['Trứng','Sữa','Đường','Cà phê','Caramel'],
  ARRAY['Eggs','Milk','Sugar','Coffee','Caramel'],20000),

('che-dau-do','🍡','Chè đậu đỏ','Sweet red bean soup','dessert','Toàn quốc','Nationwide',
  220,8,42,2,22,20,45,
  'Đậu đỏ tốt, nhưng nấu với nhiều đường','Red beans are good, but cooked with lots of sugar','sugar',
  ARRAY['Đậu đỏ','Đường','Nước cốt dừa','Bột báng'],
  ARRAY['Red beans','Sugar','Coconut milk','Tapioca pearls'],20000),

('banh-trung-thu','🥮','Bánh trung thu','Mooncake','dessert','Toàn quốc','Nationwide',
  580,10,68,28,12,56,18,
  'Mỗi chiếc = 1/3 calo ngày, đường cực cao','Each piece = 1/3 daily calories, extreme sugar','sugar',
  ARRAY['Bột mì','Hạt sen','Trứng muối','Mỡ','Đường'],
  ARRAY['Wheat flour','Lotus seed paste','Salted egg yolk','Lard','Sugar'],80000),

('che-buoi','🫘','Chè bưởi','Pomelo sweet soup','dessert','Huế','Hue',
  200,2,40,4,12,28,35,
  'Nước đường + bột sắn = carb tinh','Sugar syrup + tapioca = refined carb','sugar',
  ARRAY['Bưởi','Đường','Bột sắn','Nước cốt dừa','Đậu xanh'],
  ARRAY['Pomelo peel','Sugar','Tapioca starch','Coconut milk','Mung beans'],25000),

('chuoi-nep-nuong','🍌','Chuối nếp nướng','Grilled sticky rice banana','dessert','Miền Tây','Mekong Delta',
  260,4,48,6,28,20,50,
  'Nếp = carb phức hợp, nhưng thêm đường','Sticky rice = complex carb, but added sugar','sugar',
  ARRAY['Chuối','Nếp','Nước cốt dừa','Đường','Mè'],
  ARRAY['Banana','Sticky rice','Coconut milk','Sugar','Sesame'],20000)

ON CONFLICT (slug) DO NOTHING;
