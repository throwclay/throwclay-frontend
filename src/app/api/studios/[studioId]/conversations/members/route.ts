import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";
import { assertStudioMember } from "@/lib/server/studios";

/** List active studio members with profile (name, handle) for messaging "New Chat" picker. */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ studioId: string }> }
) {
    const token = getBearerToken(req);
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studioId } = await params;
    try {
        await assertStudioMember(user.id, studioId);
    } catch {
        return NextResponse.json({ error: "Not authorized for this studio" }, { status: 403 });
    }

    const { data: rows, error } = await supabaseAdmin
        .from("studio_memberships")
        .select(
            `
      user_id,
      role,
      profiles:user_id (
        id,
        name,
        handle,
        email
      )
    `
        )
        .eq("studio_id", studioId)
        .eq("status", "active");

    if (error) {
        console.error("conversations/members", error);
        return NextResponse.json({ error: "Failed to load members" }, { status: 500 });
    }

    const members = (rows ?? [])
        .filter((r: any) => r.profiles != null)
        .map((r: any) => ({
            id: r.profiles.id,
            name: r.profiles.name ?? "",
            handle: r.profiles.handle ?? "",
            email: r.profiles.email ?? "",
            role: r.role
        }));

    return NextResponse.json({ members });
}
