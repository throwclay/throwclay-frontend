import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";

export async function GET(req: Request) {
  // 1) Extract Bearer token
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

  // 2) Verify token with admin client
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

  if (!user.email) {
    return NextResponse.json({ error: "User has no email" }, { status: 400 });
  }

  // 3) Fetch invites for this user’s email
  const { data: invites, error } = await supabaseAdmin
    .from("studio_invites")
    .select(
      `
      id,
      studio_id,
      email,
      role,
      status,
      invited_at,
      studios:studio_id (
        id,
        name,
        handle,
        plan
      )
    `
    )
    .eq("email", user.email)
    .eq("status", "pending")
    .order("invited_at", { ascending: false });

  if (error) {
    console.error("Error fetching invites:", error);
    return NextResponse.json(
      { error: "Error fetching invites" },
      { status: 500 }
    );
  }

  return NextResponse.json({ invites: invites ?? [] });
}
