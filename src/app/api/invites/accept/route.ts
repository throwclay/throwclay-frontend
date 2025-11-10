// app/api/invites/accept/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";

function getBearerToken(req: Request): string | null {
  const authHeader =
    req.headers.get("authorization") || req.headers.get("Authorization");
  if (!authHeader) return null;
  const [scheme, value] = authHeader.split(" ");
  if (!scheme || scheme.toLowerCase() !== "bearer" || !value) return null;
  return value;
}

export async function POST(req: Request) {
  // 1) Get and validate Bearer token
  const token = getBearerToken(req);

  if (!token) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header" },
      { status: 401 }
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    console.error("Error verifying access token:", userError);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }

  if (!user.email) {
    return NextResponse.json({ error: "User has no email" }, { status: 400 });
  }

  // 2) Parse body: expect inviteId for in-app acceptance
  const body = await req.json().catch(() => null);
  const inviteId = body?.inviteId as string | undefined;

  if (!inviteId) {
    return NextResponse.json(
      { error: "inviteId is required" },
      { status: 400 }
    );
  }

  // 3) Look up the invite (admin client bypasses RLS)
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

  // 4) Enforce email match
  if (invite.email.toLowerCase() !== user.email.toLowerCase()) {
    return NextResponse.json(
      { error: "This invite was sent to a different email address" },
      { status: 403 }
    );
  }

  const studioId = invite.studio_id as string;
  const role = invite.role as string;

  // 5) Upsert membership (studio_id,user_id must be unique)
  const { error: membershipError } = await supabaseAdmin
    .from("studio_memberships")
    .upsert(
      {
        studio_id: studioId,
        user_id: user.id,
        role,
        status: "active",
        location_id: invite.location_id,
        membership_type: invite.membership_type,
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

  // 6) Mark invite as accepted
  const { error: updateError } = await supabaseAdmin
    .from("studio_invites")
    .update({
      status: "accepted",
      // assuming profiles.id === auth.users.id (your current pattern)
      accepted_by: user.id,
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
