import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://eigfrepmbfgioyxejfqt.supabase.co";

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_4lWtFcnC0O3zpoDM6Ncr5Q_ALbTLyaH";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseClient = supabase;
