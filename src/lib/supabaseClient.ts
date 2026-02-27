/**
 * Supabase client singleton.
 *
 * Reads connection details from environment variables.
 * For local development, copy .env.example to .env and fill in your values.
 *
 * Required env vars:
 *   VITE_SUPABASE_URL      — your Supabase project URL
 *   VITE_SUPABASE_ANON_KEY — your Supabase anonymous (public) API key
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
