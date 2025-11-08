// app/api/studios/[studioId]/invites/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { randomBytes } from "crypto";

export async function POST(
  req: Request,
  { params }: { params: { studioId: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, role } = await req.json();
  if (!email || !role) {
    return NextResponse.json(
      { error: "email and role are required" },
      { status: 400 }
    );
  }

  const token = randomBytes(32).toString("hex");

  // RLS will ensure user is owner/co-admin
  const { data, error } = await supabase
    .from("studio_invites")
    .insert({
      studio_id: params.studioId,
      email,
      role,
      token,
      invited_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Invite error", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // TODO: send invite email with link that includes `token`
  // e.g. `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${token}`

  return NextResponse.json({ invite: data });
}
