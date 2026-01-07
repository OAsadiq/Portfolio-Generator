import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export interface UserPortfolioUsage {
  id: string;
  user_id: string;
  template_id: string;
  portfolio_slug: string | null;
  created_at: string;
}

export interface Portfolio {
  id: string;
  slug: string;
  user_id: string | null;
  user_name: string;
  user_email: string;
  template_id: string;
  file_path: string;
  deployed_url: string | null;
  deployed_at: string | null;
  views: number;
  created_at: string;
}