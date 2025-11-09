// app/api/invites/accept/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";

export async function POST(req: Request) {
  // 1) Get and validate Bearer token (same pattern as GET /api/invites)
  const authHeader =
    req.headers.get("authorization") || req.headers.get("Authorization");

  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header" },
      { status: 401 }
    );
  }

  const token = authHeader.slice("bearer ".length).trim();
  if (!token) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { data: userResult, error: userError } =
    await supabaseAdmin.auth.getUser(token);

  if (userError || !userResult?.user) {
    console.error("Error verifying access token:", userError);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }

  const user = userResult.user;
  if (!user.email) {
    return NextResponse.json({ error: "User has no email" }, { status: 400 });
  }

  // 2) Parse body: expect inviteId (not token) for in-app acceptance
  const body = await req.json().catch(() => null);
  const inviteId = body?.inviteId as string | undefined;

  if (!inviteId) {
    return NextResponse.json(
      { error: "inviteId is required" },
      { status: 400 }
    );
  }

  // 3) Look up the invite using admin client (bypass RLS)
  const { data: invite, error: inviteError } = await supabaseAdmin
    .from("studio_invites")
    .select("*")
    .eq("id", inviteId)
    .eq("status", "pending")
    .single();

  if (inviteError || !invite) {
    console.error("Invite lookup error", inviteError);
    return NextResponse.json(
      { error: "Invalid or expired invite" },
      { status: 400 }
    );
  }

  // 4) Enforce email match (safety: invite must match this user)
  if (invite.email && invite.email.toLowerCase() !== user.email.toLowerCase()) {
    return NextResponse.json(
      { error: "This invite was sent to a different email address" },
      { status: 403 }
    );
  }

  const studioId = invite.studio_id;
  const role = invite.role as string;

  // 5) get profile id for accepted_by (profiles.id)
  let profileId: string | null = null;
  const { data: profileRow, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("id", invite.accepted_by ?? "") // try existing
    .maybeSingle();

  if (!profileRow) {
    // Try to find profile by auth user id if your profiles table has user_id
    const { data: profileByUser, error: profileByUserError } =
      await supabaseAdmin
        .from("profiles")
        .select("id")
        // adjust this if your profiles table uses a different column
        .eq("id", user.id)
        .maybeSingle();

    if (!profileByUserError && profileByUser) {
      profileId = profileByUser.id;
    }
  } else {
    profileId = profileRow.id;
  }

  // 6) Upsert membership (studio_id, user_id must be unique)
  const { error: membershipError } = await supabaseAdmin
    .from("studio_memberships")
    .upsert(
      {
        studio_id: studioId,
        user_id: user.id,
        role,
        status: "active",
      } as any,
      {
        onConflict: "studio_id,user_id",
      }
    );

  if (membershipError) {
    console.error("Membership upsert error", membershipError);
    return NextResponse.json(
      { error: "Failed to create membership" },
      { status: 500 }
    );
  }

  // 7) Mark invite as accepted
  const { error: updateError } = await supabaseAdmin
    .from("studio_invites")
    .update({
      status: "accepted",
      accepted_by: profileId, // can be null; FK allows NULL
      accepted_at: new Date().toISOString(),
    })
    .eq("id", invite.id);

  if (updateError) {
    console.error("Invite update error", updateError);
    return NextResponse.json(
      { error: "Membership created, but failed to update invite" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    studioId,
    role,
  });
}
