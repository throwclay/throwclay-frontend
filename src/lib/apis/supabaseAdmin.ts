// lib/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";

// Use placeholders when env vars are missing (e.g. during Vercel build) so the module loads without throwing.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key";

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    // auth: { persistSession: false },
});
