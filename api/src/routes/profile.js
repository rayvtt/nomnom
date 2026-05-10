import { z } from 'zod';

const profileUpdate = z.object({
  displayName: z.string().min(1).max(80).optional(),
  lang: z.enum(['vi', 'en']).optional(),
  weightKg: z.number().min(20).max(300).optional(),
  heightCm: z.number().min(50).max(250).optional(),
  age: z.number().int().min(10).max(120).optional(),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).optional(),
  goal: z.enum(['maintain', 'lose', 'gain']).optional(),
});

const setupUpdate = z.object({
  mealTimes: z.array(z.object({
    slot: z.string(),
    time: z.string().regex(/^\d{2}:\d{2}$/),
    icon: z.string().optional(),
  })).min(1).max(6).optional(),
  mealsPerDay: z.number().int().min(1).max(6).optional(),
  budgetVnd: z.number().int().min(20000).max(500000).optional(),
  deliveryMaxMin: z.number().int().min(10).max(60).optional(),
  goal: z.enum(['maintain', 'lose', 'gain']).optional(),
  notifyPhone: z.boolean().optional(),
  notifyDesktop: z.boolean().optional(),
  active: z.boolean().optional(),
});

function userId(request) {
  // Supabase JWT sub claim is the user UUID
  return request.user.sub;
}

export default async function profileRoutes(fastify) {
  // GET /profile
  fastify.get('/', async (request, reply) => {
    const { data, error } = await fastify.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId(request))
      .single();

    if (error) return reply.status(404).send({ error: 'Profile not found' });
    return data;
  });

  // PATCH /profile
  fastify.patch('/', async (request, reply) => {
    const body = profileUpdate.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

    const updates = {};
    if (body.data.displayName !== undefined) updates.display_name = body.data.displayName;
    if (body.data.lang !== undefined) updates.lang = body.data.lang;
    if (body.data.weightKg !== undefined) updates.weight_kg = body.data.weightKg;
    if (body.data.heightCm !== undefined) updates.height_cm = body.data.heightCm;
    if (body.data.age !== undefined) updates.age = body.data.age;
    if (body.data.activityLevel !== undefined) updates.activity_level = body.data.activityLevel;
    if (body.data.goal !== undefined) updates.goal = body.data.goal;
    updates.updated_at = new Date().toISOString();

    // Calculate TDEE if we have full body data
    const { data: profile } = await fastify.supabase
      .from('profiles')
      .select('weight_kg,height_cm,age,activity_level')
      .eq('id', userId(request))
      .single();

    const w = updates.weight_kg ?? profile?.weight_kg;
    const h = updates.height_cm ?? profile?.height_cm;
    const a = updates.age ?? profile?.age;
    const lvl = updates.activity_level ?? profile?.activity_level ?? 'moderate';

    if (w && h && a) {
      // Mifflin-St Jeor (assuming male for now; add sex field later)
      const bmr = 10 * w + 6.25 * h - 5 * a + 5;
      const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
      updates.tdee = Math.round(bmr * (multipliers[lvl] ?? 1.55));
    }

    const { data, error } = await fastify.supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId(request))
      .select()
      .single();

    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });

  // GET /profile/setup
  fastify.get('/setup', async (request, reply) => {
    const { data, error } = await fastify.supabase
      .from('setup_config')
      .select('*')
      .eq('user_id', userId(request))
      .single();

    if (error?.code === 'PGRST116') {
      // No row yet — return defaults
      return {
        meal_times: [
          { slot: 'breakfast', time: '07:30', icon: '🌅' },
          { slot: 'lunch', time: '12:30', icon: '☀️' },
          { slot: 'dinner', time: '19:00', icon: '🌙' },
        ],
        meals_per_day: 3,
        budget_vnd: 85000,
        delivery_max_min: 25,
        goal: 'maintain',
        notify_phone: true,
        notify_desktop: true,
        active: false,
      };
    }
    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });

  // PUT /profile/setup  (upsert the whole config)
  fastify.put('/setup', async (request, reply) => {
    const body = setupUpdate.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

    const upsert = {
      user_id: userId(request),
      updated_at: new Date().toISOString(),
    };
    if (body.data.mealTimes !== undefined) upsert.meal_times = body.data.mealTimes;
    if (body.data.mealsPerDay !== undefined) upsert.meals_per_day = body.data.mealsPerDay;
    if (body.data.budgetVnd !== undefined) upsert.budget_vnd = body.data.budgetVnd;
    if (body.data.deliveryMaxMin !== undefined) upsert.delivery_max_min = body.data.deliveryMaxMin;
    if (body.data.goal !== undefined) upsert.goal = body.data.goal;
    if (body.data.notifyPhone !== undefined) upsert.notify_phone = body.data.notifyPhone;
    if (body.data.notifyDesktop !== undefined) upsert.notify_desktop = body.data.notifyDesktop;
    if (body.data.active !== undefined) upsert.active = body.data.active;

    const { data, error } = await fastify.supabase
      .from('setup_config')
      .upsert(upsert, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });

  // GET /profile/logs?date=2026-05-09
  fastify.get('/logs', async (request, reply) => {
    const date = request.query.date ?? new Date().toISOString().slice(0, 10);
    const from = `${date}T00:00:00.000Z`;
    const to = `${date}T23:59:59.999Z`;

    const { data, error } = await fastify.supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId(request))
      .gte('logged_at', from)
      .lte('logged_at', to)
      .order('logged_at', { ascending: true });

    if (error) return reply.status(500).send({ error: error.message });

    const totals = (data ?? []).reduce(
      (acc, row) => ({
        kcal: acc.kcal + row.kcal,
        protein_g: acc.protein_g + Number(row.protein_g),
        carbs_g: acc.carbs_g + Number(row.carbs_g),
        fat_g: acc.fat_g + Number(row.fat_g),
      }),
      { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
    );

    return { date, meals: data ?? [], totals };
  });

  // POST /profile/logs  — log a meal
  fastify.post('/logs', async (request, reply) => {
    const logBody = z.object({
      mealSlot: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
      dishId: z.number().int().positive().optional(),
      dishName: z.string().min(1),
      kcal: z.number().int().min(0),
      proteinG: z.number().min(0),
      carbsG: z.number().min(0),
      fatG: z.number().min(0),
      source: z.enum(['manual', 'smart_order', 'voice']).default('manual'),
    });

    const body = logBody.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });
    const d = body.data;

    const { data, error } = await fastify.supabase
      .from('daily_logs')
      .insert({
        user_id: userId(request),
        meal_slot: d.mealSlot,
        dish_id: d.dishId ?? null,
        dish_name: d.dishName,
        kcal: d.kcal,
        protein_g: d.proteinG,
        carbs_g: d.carbsG,
        fat_g: d.fatG,
        source: d.source,
      })
      .select()
      .single();

    if (error) return reply.status(500).send({ error: error.message });
    return reply.status(201).send(data);
  });

  // DELETE /profile/logs/:id  — remove a meal log
  fastify.delete('/logs/:id', async (request, reply) => {
    const { id } = request.params;
    const { error } = await fastify.supabase
      .from('daily_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', userId(request));

    if (error) return reply.status(500).send({ error: error.message });
    return reply.status(204).send();
  });
}
