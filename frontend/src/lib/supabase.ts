import { createClient } from '@supabase/supabase-js';

const configuredSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const configuredSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const supabaseUrl = configuredSupabaseUrl ?? 'http://127.0.0.1:54321';
const supabaseAnonKey = configuredSupabaseAnonKey ?? 'missing-anon-key';

export const isDemoMode = !configuredSupabaseUrl || !configuredSupabaseAnonKey;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
);
