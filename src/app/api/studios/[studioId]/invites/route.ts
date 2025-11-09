// app/api/studios/[studioId]/invites/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const INVITER_ROLES = ["owner", "admin", "manager"];

export async function POST(
  req: Request,
  { params }: { params: { studioId: string } }
) {
  const studioId = params.studioId;

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

  // 🔑 parse body
  const body = await req.json().catch(() => null);
  const email = body?.email as string | undefined;
  const role = body?.role as string | undefined;
  const locationId = body?.locationId as string | undefined;
  const membershipType = body?.membershipType as string | undefined;

  if (!email || !role) {
    return NextResponse.json(
      { error: "email and role are required" },
      { status: 400 }
    );
  }

  if (!INVITER_ROLES.includes(role) && role !== "member") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // require membership
  if (!membershipType) {
    return NextResponse.json(
      { error: "membershipType is required" },
      { status: 400 }
    );
  }

  // require studio location
  if (!locationId) {
    return NextResponse.json(
      { error: "locationId is required" },
      { status: 400 }
    );
  }

  // ✅ check inviter’s membership & role
  const { data: membership, error: membershipError } = await supabaseAdmin
    .from("studio_memberships")
    .select("role")
    .eq("studio_id", studioId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError) {
    console.error("Error checking membership", membershipError);
    return NextResponse.json(
      { error: "Error checking membership" },
      { status: 500 }
    );
  }

  if (
    !membership ||
    !INVITER_ROLES.includes((membership.role as string) ?? "")
  ) {
    return NextResponse.json(
      { error: "You do not have permission to invite members to this studio" },
      { status: 403 }
    );
  }

  const inviteToken = crypto.randomUUID();

  // ✅ insert invite with location + membership type
  const { data: invite, error: inviteError } = await supabaseAdmin
    .from("studio_invites")
    .insert({
      studio_id: studioId,
      email,
      role,
      token: inviteToken,
      status: "pending",
      invited_by: user.id,
      location_id: locationId || null,
      membership_type: membershipType,
    })
    .select(
      `
      id,
      studio_id,
      email,
      role,
      status,
      invited_at,
      token,
      location_id,
      membership_type
    `
    )
    .single();

  if (inviteError || !invite) {
    console.error("Error creating invite", inviteError);
    return NextResponse.json(
      { error: "Failed to create invite" },
      { status: 500 }
    );
  }

  return NextResponse.json({ invite });
}
