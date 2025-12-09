import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";

const INVITER_ROLES = ["owner", "admin", "manager"];

export async function GET(req: Request, { params }: { params: { studioId: string } }) {
    const token = getBearerToken(req);
    const studioId = params.studioId;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
        data: { user },
        error: userError
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
        console.error("Error verifying token", userError);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1) Confirm this user is an admin/owner of this studio
    const { data: membershipRows, error: membershipError } = await supabaseAdmin
        .from("studio_memberships")
        .select("role")
        .eq("studio_id", studioId)
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

    if (membershipError || !membershipRows) {
        return NextResponse.json(
            { error: "Not authorized to view members for this studio" },
            { status: 403 }
        );
    }

    if (!INVITER_ROLES.includes(membershipRows.role)) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // 2) Fetch all memberships for that studio (service role bypasses RLS)
    const { data, error } = await supabaseAdmin
        .from("studio_memberships")
        .select(
            `
      id,
      user_id,
      studio_id,
      role,
      status,
      location_id,
      membership_type,
      created_at,
      profiles:user_id (
        id,
        name,
        handle,
        email,
        is_active,
        phone,
        last_login
      )
    `
        )
        .eq("studio_id", studioId)
        .eq("role", "member"); // restricitng to members only for now (no staff)

    if (error) {
        console.error("Error fetching members", error);
        return NextResponse.json({ error: "Failed to load members" }, { status: 500 });
    }

    return NextResponse.json({ members: data ?? [] });
}
