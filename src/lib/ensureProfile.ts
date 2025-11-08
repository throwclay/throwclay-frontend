// src/lib/ensureProfile.ts
import { supabase } from "../lib/apis/supabaseClient";

export type UserType = "artist" | "studio";

export async function ensureProfile(userType?: UserType) {
  // Get the current authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.warn("ensureProfile: no authenticated user", userError);
    return;
  }

  const userId = user.id;
  const email = user.email ?? "";

  // 1) Check if a profile already exists
  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (selectError) {
    console.error("ensureProfile: error checking profile", selectError);
    return;
  }

  // Derive a simple default handle/name from email if needed
  const baseHandle = email.split("@")[0] || "user";
  const defaultName = user.user_metadata?.full_name || baseHandle;

  if (!existing) {
    // 2) Insert a new profile
    const { error: insertError } = await supabase.from("profiles").insert({
      id: userId,
      email,
      name: defaultName,
      handle: baseHandle, // we can later let them change this, and/or enforce uniqueness more strictly
      type: userType ?? user.user_metadata?.user_type ?? "artist",
    });

    if (insertError) {
      console.error("ensureProfile: error creating profile", insertError);
      return;
    }

    return;
  }

  // 3) Optionally, update profile type if it's missing and we got one
  if (!existing.type && userType) {
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ type: userType })
      .eq("id", userId);

    if (updateError) {
      console.error("ensureProfile: error updating profile type", updateError);
      return;
    }
  }

  // Already exists and is fine
}
