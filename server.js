require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase client — credentials live in Railway env vars, never in code
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.use(cors());
app.use(express.json());

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Waitlist ─────────────────────────────────────────────────────────────────
// POST /api/waitlist  { email: string }
app.post('/api/waitlist', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });

  const { error } = await supabase
    .from('waitlist')
    .insert({ email, created_at: new Date().toISOString() });

  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'already on waitlist' });
    console.error('waitlist insert error:', error);
    return res.status(500).json({ error: 'server error' });
  }

  res.status(201).json({ message: 'added to waitlist' });
});

// ─── Users / profiles ────────────────────────────────────────────────────────
// GET  /api/profile/:userId
app.get('/api/profile/:userId', async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.params.userId)
    .single();

  if (error) return res.status(404).json({ error: 'profile not found' });
  res.json(data);
});

// PUT  /api/profile/:userId  { weight, height, age, gender, activity_level }
app.put('/api/profile/:userId', async (req, res) => {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: req.params.userId, ...req.body, updated_at: new Date().toISOString() });

  if (error) return res.status(500).json({ error: 'server error' });
  res.json({ message: 'profile updated' });
});

// ─── Meal logs ────────────────────────────────────────────────────────────────
// GET  /api/meals/:userId?date=YYYY-MM-DD
app.get('/api/meals/:userId', async (req, res) => {
  const { date } = req.query;
  let query = supabase.from('meal_logs').select('*').eq('user_id', req.params.userId);
  if (date) query = query.eq('date', date);

  const { data, error } = await query.order('logged_at', { ascending: false });
  if (error) return res.status(500).json({ error: 'server error' });
  res.json(data);
});

// POST /api/meals  { user_id, dish_name, kcal, protein, carbs, fat, date }
app.post('/api/meals', async (req, res) => {
  const { error } = await supabase
    .from('meal_logs')
    .insert({ ...req.body, logged_at: new Date().toISOString() });

  if (error) return res.status(500).json({ error: 'server error' });
  res.status(201).json({ message: 'meal logged' });
});

// ─── Recipe database ──────────────────────────────────────────────────────────
// GET /api/recipes?category=soup&q=pho
app.get('/api/recipes', async (req, res) => {
  const { category, q } = req.query;
  let query = supabase.from('recipes').select('*');
  if (category) query = query.eq('category', category);
  if (q) query = query.ilike('name_en', `%${q}%`);

  const { data, error } = await query.limit(100);
  if (error) return res.status(500).json({ error: 'server error' });
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`NomNom server running on port ${PORT}`);
});
