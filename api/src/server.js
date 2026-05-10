import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import supabasePlugin from './plugins/supabase.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import nutritionRoutes from './routes/nutrition.js';

const server = Fastify({ logger: true });

// CORS — Expo Go uses random dev URLs, mobile apps don't send Origin at all.
// In production we allow any origin since auth is via JWT, not cookies.
await server.register(cors, {
  origin: true,
  credentials: true,
});

await server.register(jwt, {
  secret: process.env.SUPABASE_JWT_SECRET,
});

await server.register(supabasePlugin);

server.addHook('onRequest', async (request, reply) => {
  // Public routes skip auth
  const publicPaths = ['/health', '/auth/login', '/auth/signup'];
  if (publicPaths.includes(request.url)) return;
  // Nutrition DB is public read — no login required to search dishes
  if (request.url.startsWith('/nutrition')) return;
  try {
    await request.jwtVerify();
  } catch {
    reply.status(401).send({ error: 'Unauthorized' });
  }
});

await server.register(authRoutes, { prefix: '/auth' });
await server.register(profileRoutes, { prefix: '/profile' });
await server.register(nutritionRoutes, { prefix: '/nutrition' });

server.get('/health', async () => ({ status: 'ok', ts: new Date().toISOString() }));

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '0.0.0.0';

try {
  await server.listen({ port, host });
} catch (err) {
  server.log.error(err);
  process.exit(1);
}
