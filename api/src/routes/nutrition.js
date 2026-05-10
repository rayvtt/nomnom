import { z } from 'zod';

const CATEGORIES = ['soup', 'rice', 'noodle', 'grilled', 'street', 'seafood', 'appetizer', 'vegetarian', 'drink', 'dessert'];

export default async function nutritionRoutes(fastify) {
  // GET /nutrition/search?q=pho&cat=soup&limit=20&offset=0
  fastify.get('/search', async (request, reply) => {
    const params = z.object({
      q: z.string().max(100).optional(),
      cat: z.enum([...CATEGORIES, 'all']).optional(),
      limit: z.coerce.number().int().min(1).max(100).default(20),
      offset: z.coerce.number().int().min(0).default(0),
      minScore: z.coerce.number().int().min(0).max(100).optional(),
      maxKcal: z.coerce.number().int().optional(),
      sortBy: z.enum(['health_score', 'kcal', 'protein_g', 'name_vi']).default('health_score'),
      order: z.enum(['asc', 'desc']).default('desc'),
    }).safeParse(request.query);

    if (!params.success) return reply.status(400).send({ error: params.error.flatten() });
    const { q, cat, limit, offset, minScore, maxKcal, sortBy, order } = params.data;

    let query = fastify.supabase.from('nutrition_db').select('*', { count: 'exact' });

    if (q) {
      // Trigram search across both language names
      query = query.or(`name_vi.ilike.%${q}%,name_en.ilike.%${q}%`);
    }
    if (cat && cat !== 'all') query = query.eq('category', cat);
    if (minScore !== undefined) query = query.gte('health_score', minScore);
    if (maxKcal !== undefined) query = query.lte('kcal', maxKcal);

    query = query.order(sortBy, { ascending: order === 'asc' }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) return reply.status(500).send({ error: error.message });

    return { total: count, limit, offset, dishes: data ?? [] };
  });

  // GET /nutrition/:id
  fastify.get('/:id', async (request, reply) => {
    const id = Number(request.params.id);
    if (!Number.isInteger(id) || id < 1) return reply.status(400).send({ error: 'Invalid id' });

    const { data, error } = await fastify.supabase
      .from('nutrition_db')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return reply.status(404).send({ error: 'Dish not found' });
    return data;
  });

  // GET /nutrition/match?kcal=450&protein=30&budget=85000&delivery=25
  // Returns top 3 dishes matching a macro gap + budget constraint (used by Smart Order)
  fastify.get('/match', async (request, reply) => {
    const params = z.object({
      kcal: z.coerce.number().int().min(50).max(1500),
      protein: z.coerce.number().min(0),
      budgetVnd: z.coerce.number().int().min(10000).max(500000).optional(),
      exclude: z.string().optional(), // comma-separated dish IDs eaten today
    }).safeParse(request.query);

    if (!params.success) return reply.status(400).send({ error: params.error.flatten() });
    const { kcal, protein, budgetVnd, exclude } = params.data;

    const excludeIds = exclude ? exclude.split(',').map(Number).filter(Boolean) : [];

    // Window ±25% around target kcal and protein
    let query = fastify.supabase
      .from('nutrition_db')
      .select('*')
      .gte('kcal', Math.round(kcal * 0.75))
      .lte('kcal', Math.round(kcal * 1.25))
      .gte('protein_g', protein * 0.75)
      .not('category', 'in', `(drink,dessert)`);

    if (budgetVnd) query = query.lte('avg_price_vnd', budgetVnd);
    if (excludeIds.length) query = query.not('id', 'in', `(${excludeIds.join(',')})`);

    query = query.order('health_score', { ascending: false }).limit(10);

    const { data, error } = await query;
    if (error) return reply.status(500).send({ error: error.message });

    // Score by macro proximity
    const scored = (data ?? []).map(dish => {
      const kcalDiff = Math.abs(dish.kcal - kcal) / kcal;
      const proteinDiff = Math.abs(dish.protein_g - protein) / Math.max(protein, 1);
      const matchScore = Math.round((1 - (kcalDiff + proteinDiff) / 2) * 100);
      return { ...dish, match_score: matchScore };
    });

    scored.sort((a, b) => b.match_score - a.match_score);
    return scored.slice(0, 3);
  });
}
