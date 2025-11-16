// app/api/studios/[studioId]/applications/[applicationId]/decision/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";

const INVITER_ROLES = ["owner", "admin"];

export async function POST(
  req: Request,
  { params }: { params: { studioId: string; applicationId: string } }
) {
  const { studioId, applicationId } = params;
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

  // Check they are owner/admin of this studio
  const { data: membership, error: membershipError } = await supabaseAdmin
    .from("studio_memberships")
    .select("role")
    .eq("studio_id", studioId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (membershipError || !membership) {
    return NextResponse.json(
      { error: "Not authorized to manage applications for this studio" },
      { status: 403 }
    );
  }

  if (!INVITER_ROLES.includes(membership.role as string)) {
    return NextResponse.json(
      { error: "Insufficient permissions" },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const decision = body?.decision as "approve" | "reject" | undefined;
  const decisionReason = body?.reason as string | undefined;

  if (!decision || !["approve", "reject"].includes(decision)) {
    return NextResponse.json(
      { error: "decision must be 'approve' or 'reject'" },
      { status: 400 }
    );
  }

  // Load application
  const { data: application, error: appError } = await supabaseAdmin
    .from("studio_membership_applications")
    .select("*")
    .eq("id", applicationId)
    .eq("studio_id", studioId)
    .single();

  if (appError || !application) {
    console.error("Application lookup error", appError);
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 }
    );
  }

  if (application.status !== "pending") {
    return NextResponse.json(
      { error: "Only pending applications can be decided" },
      { status: 400 }
    );
  }

  // If approving, create/activate member
  // updated to handle invites per location
  if (decision === "approve") {
    const { error: membershipUpsertError } = await supabaseAdmin
      .from("studio_memberships")
      .upsert(
        {
          studio_id: studioId,
          user_id: application.profile_id,
          role: "member",
          status: "active",
          location_id: application.location_id ?? null,
          membership_type: application.requested_membership_type ?? null,
        } as any,
        {
          onConflict: "studio_id,user_id,location_id",
        }
      );

    if (membershipUpsertError) {
      console.error("Membership upsert error", membershipUpsertError);
      return NextResponse.json(
        { error: "Failed to create membership" },
        { status: 500 }
      );
    }
  }

  const newStatus = decision === "approve" ? "approved" : "rejected";

  const { error: updateError } = await supabaseAdmin
    .from("studio_membership_applications")
    .update({
      status: newStatus,
      decided_at: new Date().toISOString(),
      decided_by: user.id,
      decision_reason: decisionReason ?? null,
    })
    .eq("id", applicationId);

  if (updateError) {
    console.error("Application update error", updateError);
    return NextResponse.json(
      { error: "Failed to update application status" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, status: newStatus });
}
