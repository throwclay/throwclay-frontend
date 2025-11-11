// lib/ensureProfile.ts
import { supabase } from "./apis/supabaseClient";

export async function ensureProfile() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) throw error ?? new Error("No user");

  const email = user.email ?? null;
  const name =
    (user.user_metadata as any)?.name ??
    (user.user_metadata as any)?.full_name ??
    email?.split("@")[0] ??
    null;

  const { error: upsertError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email,
      name,
      type: "artist", // 👈 keep everyone as "artist" now
      artist_plan: "artist-free", // 👈 safe default
      is_active: true,
    },
    { onConflict: "id" }
  );

  if (upsertError) throw upsertError;
}
