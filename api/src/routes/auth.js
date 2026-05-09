import { z } from 'zod';

const signupBody = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1).max(80).optional(),
  lang: z.enum(['vi', 'en']).default('vi'),
});

const loginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export default async function authRoutes(fastify) {
  // POST /auth/signup
  fastify.post('/signup', async (request, reply) => {
    const body = signupBody.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });
    const { email, password, displayName, lang } = body.data;

    const { data, error } = await fastify.supabase.auth.signUp({ email, password });
    if (error) return reply.status(400).send({ error: error.message });

    // Create profile row immediately after signup
    await fastify.supabase.from('profiles').insert({
      id: data.user.id,
      display_name: displayName ?? email.split('@')[0],
      lang,
    });

    return reply.status(201).send({ user: { id: data.user.id, email: data.user.email } });
  });

  // POST /auth/login
  fastify.post('/login', async (request, reply) => {
    const body = loginBody.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });
    const { email, password } = body.data;

    const { data, error } = await fastify.supabase.auth.signInWithPassword({ email, password });
    if (error) return reply.status(401).send({ error: 'Invalid credentials' });

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      user: { id: data.user.id, email: data.user.email },
    };
  });

  // POST /auth/refresh
  fastify.post('/refresh', async (request, reply) => {
    const { refresh_token } = request.body ?? {};
    if (!refresh_token) return reply.status(400).send({ error: 'refresh_token required' });

    const { data, error } = await fastify.supabase.auth.refreshSession({ refresh_token });
    if (error) return reply.status(401).send({ error: 'Invalid or expired refresh token' });

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
    };
  });
}
