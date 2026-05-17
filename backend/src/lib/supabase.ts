import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && serviceRoleKey);
}

export const supabaseAdmin = createClient(supabaseUrl ?? 'http://127.0.0.1:54321', serviceRoleKey ?? 'missing', {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
