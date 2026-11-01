import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** null when the app is built without a backend: solo mode only. */
export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null;
export const hasBackend = supabase !== null;

export function requireSupabase(): SupabaseClient {
  if (!supabase) throw new Error('Classroom features need VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  return supabase;
}
