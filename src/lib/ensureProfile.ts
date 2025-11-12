// lib/ensureProfile.ts
import { supabase } from "./apis/supabaseClient";

export async function ensureProfile() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) throw error ?? new Error("No user");

  const email = user.email ?? null;

  // 1) Check if a profile already exists
  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) {
    console.error("ensureProfile: error checking profile", selectError);
    return;
  }

  // Derive a simple default handle/name from email if needed
  const baseHandle = email?.split("@")[0] || "user";
  const defaultName = user.user_metadata?.full_name || baseHandle;

  if (!existing) {
    // 2) Insert a new profile
    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      email,
      name: defaultName,
      handle: baseHandle, // we can later let them change this, and/or enforce uniqueness more strictly
      type: "artist",
      artist_plan: "artist-free", // 👈 safe default
      is_active: true,
    });

    if (insertError) {
      console.error("ensureProfile: error creating profile", insertError);
      return;
    }

    return;
  }
}
