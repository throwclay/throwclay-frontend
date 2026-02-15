// src/lib/apis/supabase.ts
import { createClient } from "@supabase/supabase-js";

// Use placeholders when env vars are missing (e.g. during Vercel build without env configured)
// so the module loads without throwing. Runtime will have real values when set in Vercel.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
