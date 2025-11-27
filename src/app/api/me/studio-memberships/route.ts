// app/api/me/studio-memberships/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";
import { getMembershipsForUser } from "@/lib/server/studios";

export async function GET(req: Request) {
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
    const memberships = await getMembershipsForUser(user.id);
    return NextResponse.json({ memberships });
  } catch (err) {
    console.error("GET /api/me/studio-memberships", err);
    return NextResponse.json(
      { error: "Failed to load studio memberships" },
      { status: 500 }
    );
  }
}
