// app/api/studios/[studioId]/locations/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";

const INVITER_ROLES = ["owner", "admin", "manager"];

function getBearerToken(req: Request): string | null {
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    if (!authHeader) return null;
    const [scheme, value] = authHeader.split(" ");
    if (!scheme || scheme.toLowerCase() !== "bearer" || !value) return null;
    return value;
}

export async function GET(req: Request, { params }: { params: { studioId: string } }) {
    const token = getBearerToken(req);
    const studioId = params.studioId;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1) Validate the user via the JWT (same as members API)
    const {
        data: { user },
        error: userError
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
        console.error("Error verifying token", userError);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Confirm this user is a member of the studio with allowed role
    const { data: membershipRow, error: membershipError } = await supabaseAdmin
        .from("studio_memberships")
        .select("role")
        .eq("studio_id", studioId)
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

    if (membershipError || !membershipRow) {
        return NextResponse.json(
            { error: "Not authorized to view locations for this studio" },
            { status: 403 }
        );
    }

    if (!INVITER_ROLES.includes(membershipRow.role)) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // 3) Fetch all locations for that studio
    const { data, error } = await supabaseAdmin
        .from("studio_locations")
        .select("*")
        .eq("studio_id", studioId)
        .order("name", { ascending: true });

    if (error) {
        console.error("Error fetching studio locations", error);
        return NextResponse.json({ error: "Failed to load locations" }, { status: 500 });
    }

    return NextResponse.json({ locations: data ?? [] });
}
