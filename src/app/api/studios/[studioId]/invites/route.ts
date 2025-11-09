// app/api/studios/[studioId]/invites/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
// import type { Database } from "@/types/supabase"; // TODO: create later

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const INVITER_ROLES = ["owner", "admin", "manager"];

// ✅ Create invite
export async function POST(
  req: Request,
  { params }: { params: { studioId: string } }
) {
  const studioId = params.studioId;

  // read auth user from cookies
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  if (!locationId) {
    return NextResponse.json(
      { error: "locationId is required" },
      { status: 400 }
    );
  }

  if (!membershipType) {
    return NextResponse.json(
      { error: "membershipType is required" },
      { status: 400 }
    );
  }

  // ✅ check inviter's membership/role (locked down via service role)
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

  const { data: invite, error: inviteError } = await supabaseAdmin
    .from("studio_invites")
    .insert({
      studio_id: studioId,
      email,
      role,
      token: inviteToken,
      status: "pending",
      invited_by: user.id,
      location_id: locationId,
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

// ✅ List invites
export async function GET(
  req: Request,
  { params }: { params: { studioId: string } }
) {
  const studioId = params.studioId;

  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // only owner / co-admin / manager can see invites
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
      { error: "You do not have permission to view invites for this studio" },
      { status: 403 }
    );
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? "pending";

  const { data: invites, error: invitesError } = await supabaseAdmin
    .from("studio_invites")
    .select(
      `
      id,
      studio_id,
      email,
      role,
      status,
      invited_at,
      location_id,
      membership_type
    `
    )
    .eq("studio_id", studioId)
    .eq("status", status)
    .order("invited_at", { ascending: false });

  if (invitesError) {
    console.error("Error fetching invites", invitesError);
    return NextResponse.json(
      { error: "Failed to fetch invites" },
      { status: 500 }
    );
  }

  return NextResponse.json({ invites: invites ?? [] });
}
