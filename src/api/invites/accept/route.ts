// app/api/invites/accept/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await req.json();
  if (!token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  // Use admin client to bypass RLS for invite lookup
  const { data: invite, error: inviteError } = await supabaseAdmin
    .from("studio_invites")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .single();

  if (inviteError || !invite) {
    return NextResponse.json(
      { error: "Invalid or expired invite" },
      { status: 400 }
    );
  }

  // Optional: enforce email match
  if (
    invite.email &&
    invite.email.toLowerCase() !== user.email?.toLowerCase()
  ) {
    return NextResponse.json(
      { error: "This invite was sent to a different email address" },
      { status: 403 }
    );
  }

  // Upsert membership & mark invite accepted in a pseudo-transaction
  const studioId = invite.studio_id;
  const role = invite.role as string;

  // 1) Insert membership if not exists
  const { error: membershipError } = await supabaseAdmin
    .from("studio_memberships")
    .upsert(
      {
        studio_id: studioId,
        user_id: user.id,
        role,
      },
      {
        onConflict: "studio_id,user_id",
      }
    );

  if (membershipError) {
    console.error("Membership upsert error", membershipError);
    return NextResponse.json(
      { error: "Failed to create membership" },
      { status: 500 }
    );
  }

  // 2) Mark invite as accepted
  const { error: updateError } = await supabaseAdmin
    .from("studio_invites")
    .update({
      status: "accepted",
      accepted_by: user.id,
      accepted_at: new Date().toISOString(),
    })
    .eq("id", invite.id);

  if (updateError) {
    console.error("Invite update error", updateError);
    return NextResponse.json(
      { error: "Membership created, but failed to update invite" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    studioId,
    role,
  });
}
