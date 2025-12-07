// app/api/studios/[studioId]/invites/[inviteId]/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";

const INVITER_ROLES = ["owner", "admin", "manager"];

// DELETE – cancel/revoke an invite
export async function DELETE(
  req: Request,
  { params }: { params: { studioId: string; inviteId: string } }
) {
  const { studioId, inviteId } = params;
  const token = getBearerToken(req);

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    console.error("Error verifying token", userError);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check they have permission to manage invites
  const { data: memberships, error: membershipError } = await supabaseAdmin
    .from("studio_memberships")
    .select("role")
    .eq("studio_id", studioId)
    .eq("user_id", user.id)
    .eq("status", "active");

  if (membershipError) {
    console.error("Error checking membership", membershipError);
    return NextResponse.json(
      { error: "Error checking membership" },
      { status: 500 }
    );
  }

  const hasInvitePermission = (memberships ?? []).some((m) =>
    INVITER_ROLES.includes((m.role as string) ?? "")
  );

  if (!hasInvitePermission) {
    return NextResponse.json(
      {
        error: "You do not have permission to manage invites for this studio",
      },
      { status: 403 }
    );
  }

  // Verify the invite exists and belongs to this studio
  const { data: invite, error: inviteError } = await supabaseAdmin
    .from("studio_invites")
    .select("id, studio_id, status")
    .eq("id", inviteId)
    .eq("studio_id", studioId)
    .single();

  if (inviteError || !invite) {
    console.error("Invite lookup error", inviteError);
    return NextResponse.json(
      { error: "Invite not found" },
      { status: 404 }
    );
  }

  // Only allow canceling pending invites
  if (invite.status !== "pending") {
    return NextResponse.json(
      { error: "Only pending invites can be cancelled" },
      { status: 400 }
    );
  }

  // Update invite status to revoked
  const { error: updateError } = await supabaseAdmin
    .from("studio_invites")
    .update({
      status: "revoked",
    })
    .eq("id", inviteId);

  if (updateError) {
    console.error("Error revoking invite", updateError);
    return NextResponse.json(
      { error: "Failed to cancel invite" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

