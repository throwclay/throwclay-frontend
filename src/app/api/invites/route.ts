// app/api/invites/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";

function getBearerToken(req: Request): string | null {
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    if (!authHeader) return null;
    const [scheme, value] = authHeader.split(" ");
    if (!scheme || scheme.toLowerCase() !== "bearer" || !value) return null;
    return value;
}

// GET – list invites for the *current user* (by email)
export async function GET(req: Request) {
    const token = getBearerToken(req);

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
        data: { user },
        error: userError
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
        console.error("GET /api/invites: no Supabase user", userError);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.email) {
        console.error("GET /api/invites: user has no email");
        return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from("studio_invites")
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
        membership_type,
        studios:studio_id (
          id,
          name,
          handle
        )
      `
        )
        .eq("status", "pending")
        .eq("email", user.email)
        .order("invited_at", { ascending: false });

    if (error) {
        console.error("GET /api/invites: error fetching invites", error);
        return NextResponse.json({ error: "Failed to fetch invites" }, { status: 500 });
    }

    return NextResponse.json({
        invites: data ?? []
    });
}
