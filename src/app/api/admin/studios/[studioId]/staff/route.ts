// app/api/admin/studios/[studioId]/staff/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";
import { assertStudioAdmin } from "@/lib/server/studios";
import type { StudioRole } from "@/types";

const STAFF_ROLES: StudioRole[] = [
  "admin",
  "manager",
  "instructor",
  "employee",
];

export async function GET(
  req: Request,
  { params }: { params: { studioId: string } }
) {
  const token = getBearerToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId");

  try {
    await assertStudioAdmin(user.id, params.studioId);

    let query = supabaseAdmin
      .from("studio_memberships")
      .select(
        `
        id,
        user_id,
        studio_id,
        role,
        status,
        created_at,
        profiles:user_id (
          name,
          email,
          handle,
          phone,
          created_at,
          is_active
        )
      `
      )
      .eq("studio_id", params.studioId)
      .eq("status", "active")
      .in("role", STAFF_ROLES);

    if (locationId) {
      query = query.eq("location_id", locationId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const staff = (data ?? []).map((row: any) => ({
      staffMembershipId: row.id,
      userId: row.user_id,
      id: row.user_id,
      name:
        row.profiles?.name ??
        row.profiles?.email?.split("@")[0] ??
        "Unnamed Staff",
      email: row.profiles?.email ?? "",
      handle: row.profiles?.handle ?? "",
      type: "artist" as const, // your User type
      phone: row.profiles?.phone ?? "",
      studioId: row.studio_id,
      role: row.role as StudioRole,
      createdAt: row.profiles?.created_at ?? row.created_at,
      isActive: row.profiles?.is_active ?? row.status === "active",

      // Fields our EmployeeManagement UI expects:
      managerProfile: undefined,
      instructorProfile: undefined,
      workLogs: [],
      scheduleEntries: [],
      timeOffRequests: [],
      unfilledResponsibilities: [],
      credentials: undefined,
    }));

    return NextResponse.json({ staff });
  } catch (err: any) {
    if (
      err.message?.includes("Not authorized") ||
      err.message?.includes("Insufficient")
    ) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error("GET /api/admin/studios/[studioId]/staff", err);
    return NextResponse.json(
      { error: "Failed to load staff" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { studioId: string } }
) {
  const token = getBearerToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    name,
    email,
    phone,
    role,
    kind, // "employee" | "instructor" (from frontend)
    notes,
  } = body ?? {};

  if (!email || !role) {
    return NextResponse.json(
      { error: "Missing required fields (email, role)" },
      { status: 400 }
    );
  }

  if (!STAFF_ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid staff role" }, { status: 400 });
  }

  try {
    await assertStudioAdmin(user.id, params.studioId);

    // For now: create a studio_invite row; when they accept, they become staff.
    const { data, error } = await supabaseAdmin
      .from("studio_invites")
      .insert({
        studio_id: params.studioId,
        email,
        role,
        status: "pending",
        invited_by: user.id,
        name,
        phone,
        // optional: tag that this came from staff screen
        // metadata: { kind, notes } as any,
      })
      .select(
        `
        id,
        studio_id,
        email,
        role,
        status,
        invited_at,
        name,
        phone
      `
      )
      .single();

    if (error) throw error;

    return NextResponse.json({ invite: data }, { status: 201 });
  } catch (err: any) {
    if (
      err.message?.includes("Not authorized") ||
      err.message?.includes("Insufficient")
    ) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error("POST /api/admin/studios/[studioId]/staff", err);
    return NextResponse.json(
      { error: "Failed to create staff invite" },
      { status: 500 }
    );
  }
}
