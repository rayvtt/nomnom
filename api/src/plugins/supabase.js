import fp from '../plugins/fastify-plugin.js';
import { createClient } from '@supabase/supabase-js';

async function supabasePlugin(fastify) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
  fastify.decorate('supabase', supabase);
}

// fp() ensures the decorator is available across all plugins/routes
export default fp(supabasePlugin, { name: 'supabase' });
