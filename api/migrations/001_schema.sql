-- NomNom database schema
-- Run in Supabase SQL editor (or via psql)
-- Supabase already provides auth.users — we extend it with profiles

-- ─────────────────────────────────────────────
-- 1. PROFILES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name     TEXT,
  lang             TEXT NOT NULL DEFAULT 'vi' CHECK (lang IN ('vi', 'en')),
  weight_kg        NUMERIC(5,2),
  height_cm        NUMERIC(5,2),
  age              INTEGER CHECK (age BETWEEN 10 AND 120),
  activity_level   TEXT NOT NULL DEFAULT 'moderate'
                     CHECK (activity_level IN ('sedentary','light','moderate','active','very_active')),
  goal             TEXT NOT NULL DEFAULT 'maintain'
                     CHECK (goal IN ('maintain','lose','gain')),
  tdee             INTEGER,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup via trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─────────────────────────────────────────────
-- 2. SMART ORDER SETUP CONFIG
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS setup_config (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  -- meal_times: [{slot:"breakfast",time:"07:30",icon:"🌅"},...]
  meal_times       JSONB NOT NULL DEFAULT '[
    {"slot":"breakfast","time":"07:30","icon":"🌅"},
    {"slot":"lunch","time":"12:30","icon":"☀️"},
    {"slot":"dinner","time":"19:00","icon":"🌙"}
  ]',
  meals_per_day    INTEGER NOT NULL DEFAULT 3 CHECK (meals_per_day BETWEEN 1 AND 6),
  budget_vnd       INTEGER NOT NULL DEFAULT 85000 CHECK (budget_vnd >= 10000),
  delivery_max_min INTEGER NOT NULL DEFAULT 25 CHECK (delivery_max_min BETWEEN 10 AND 60),
  goal             TEXT NOT NULL DEFAULT 'maintain'
                     CHECK (goal IN ('maintain','lose','gain')),
  notify_phone     BOOLEAN NOT NULL DEFAULT true,
  notify_desktop   BOOLEAN NOT NULL DEFAULT true,
  active           BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- 3. VIETNAMESE NUTRITION DATABASE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nutrition_db (
  id               SERIAL PRIMARY KEY,
  slug             TEXT UNIQUE NOT NULL,
  emoji            TEXT,
  name_vi          TEXT NOT NULL,
  name_en          TEXT NOT NULL,
  category         TEXT NOT NULL
                     CHECK (category IN ('soup','rice','noodle','grilled','street','seafood','appetizer','vegetarian','drink','dessert')),
  region_vi        TEXT,
  region_en        TEXT,
  kcal             INTEGER NOT NULL CHECK (kcal >= 0),
  protein_g        NUMERIC(5,1) NOT NULL DEFAULT 0,
  carbs_g          NUMERIC(5,1) NOT NULL DEFAULT 0,
  fat_g            NUMERIC(5,1) NOT NULL DEFAULT 0,
  good_carbs_g     NUMERIC(5,1) NOT NULL DEFAULT 0,
  bad_carbs_g      NUMERIC(5,1) NOT NULL DEFAULT 0,
  health_score     INTEGER NOT NULL DEFAULT 50 CHECK (health_score BETWEEN 0 AND 100),
  warn_vi          TEXT,
  warn_en          TEXT,
  warn_type        TEXT NOT NULL DEFAULT 'neutral'
                     CHECK (warn_type IN ('good','sugar','sodium','neutral')),
  ingredients_vi   TEXT[],
  ingredients_en   TEXT[],
  avg_price_vnd    INTEGER NOT NULL DEFAULT 50000 CHECK (avg_price_vnd >= 0),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigram index for fuzzy name search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_nutrition_name_vi ON nutrition_db USING GIN (name_vi gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_nutrition_name_en ON nutrition_db USING GIN (name_en gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_nutrition_category  ON nutrition_db (category);
CREATE INDEX IF NOT EXISTS idx_nutrition_score     ON nutrition_db (health_score DESC);

-- ─────────────────────────────────────────────
-- 4. DAILY MEAL LOGS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logged_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  meal_slot  TEXT NOT NULL CHECK (meal_slot IN ('breakfast','lunch','dinner','snack')),
  dish_id    INTEGER REFERENCES nutrition_db(id),
  dish_name  TEXT NOT NULL,
  kcal       INTEGER NOT NULL CHECK (kcal >= 0),
  protein_g  NUMERIC(5,1) NOT NULL DEFAULT 0,
  carbs_g    NUMERIC(5,1) NOT NULL DEFAULT 0,
  fat_g      NUMERIC(5,1) NOT NULL DEFAULT 0,
  source     TEXT NOT NULL DEFAULT 'manual'
               CHECK (source IN ('manual','smart_order','voice'))
);

CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date
  ON daily_logs (user_id, logged_at DESC);

-- ─────────────────────────────────────────────
-- 5. SMART ORDER QUEUE  (pending push approvals)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS smart_order_queue (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_for   TIMESTAMPTZ NOT NULL,
  meal_slot       TEXT NOT NULL,
  -- options: [{dish_id,dish_name,restaurant,price_vnd,delivery_min,match_score}]
  options         JSONB NOT NULL DEFAULT '[]',
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','expired','skipped')),
  approved_option INTEGER CHECK (approved_option IN (0,1,2)),
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_soq_user_status
  ON smart_order_queue (user_id, status, scheduled_for);

-- ─────────────────────────────────────────────
-- 6. ORDER HISTORY
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  queue_id        UUID REFERENCES smart_order_queue(id),
  dish_id         INTEGER REFERENCES nutrition_db(id),
  dish_name       TEXT NOT NULL,
  restaurant_name TEXT,
  platform        TEXT CHECK (platform IN ('grabfood','shopeefood','manual','deeplink')),
  price_vnd       INTEGER,
  delivery_min    INTEGER,
  kcal            INTEGER,
  protein_g       NUMERIC(5,1),
  carbs_g         NUMERIC(5,1),
  fat_g           NUMERIC(5,1),
  macro_logged    BOOLEAN NOT NULL DEFAULT false,
  ordered_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_history_user
  ON order_history (user_id, ordered_at DESC);

-- ─────────────────────────────────────────────
-- RLS: lock all tables to authenticated users
-- ─────────────────────────────────────────────
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE setup_config    ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_order_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_history   ENABLE ROW LEVEL SECURITY;

-- nutrition_db is public read
ALTER TABLE nutrition_db    ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nutrition public read" ON nutrition_db FOR SELECT USING (true);

-- Users only see their own rows
CREATE POLICY "own profile"     ON profiles        USING (id = auth.uid());
CREATE POLICY "own setup"       ON setup_config    USING (user_id = auth.uid());
CREATE POLICY "own logs"        ON daily_logs      USING (user_id = auth.uid());
CREATE POLICY "own queue"       ON smart_order_queue USING (user_id = auth.uid());
CREATE POLICY "own orders"      ON order_history   USING (user_id = auth.uid());
