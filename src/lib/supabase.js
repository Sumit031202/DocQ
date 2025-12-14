import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase Config:', {
    url: supabaseUrl,
    keyLength: supabaseAnonKey?.length
});

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
    console.warn('Supabase is not configured. Please check .env.local');
}

export const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseConfigured = isConfigured;
