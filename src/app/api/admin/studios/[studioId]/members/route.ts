// app/api/admin/studios/[studioId]/members/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";
import { assertStudioAdmin } from "@/lib/server/studios";

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
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await assertStudioAdmin(user.id, params.studioId);

    const { data: members, error: membersError } = await supabaseAdmin
      .from("studio_memberships")
      .select("id, user_id, role, status, created_at")
      .eq("studio_id", params.studioId);

    if (membersError) {
      throw membersError;
    }

    return NextResponse.json({ members: members ?? [] });
  } catch (err: any) {
    if (
      err.message?.includes("Not authorized") ||
      err.message?.includes("Insufficient")
    ) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error("GET /api/admin/studios/[studioId]/members", err);
    return NextResponse.json(
      { error: "Failed to load members" },
      { status: 500 }
    );
  }
}
