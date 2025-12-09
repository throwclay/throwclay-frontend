// app/api/studios/[studioId]/applications/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";

const INVITER_ROLES = ["owner", "admin"]; // for GET (reviewing apps)
const STAFF_ROLES = ["owner", "admin", "manager", "instructor", "employee"];
const MEMBER_ROLE = "member";

// -----------------------------------------------------------------------------
// POST – Artist applies to join a studio/location
// -----------------------------------------------------------------------------
export async function POST(req: Request, { params }: { params: { studioId: string } }) {
    const studioId = params.studioId;
    const token = getBearerToken(req);

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
        data: { user },
        error: userError
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
        console.error("Error verifying token", userError);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    const {
        experience,
        interests,
        goals,
        referralSource,
        emergencyContact,
        customFields,
        locationId,
        requestedMembershipType
    } = body ?? {};

    // Basic validation
    if (!studioId) {
        return NextResponse.json({ error: "studioId is required" }, { status: 400 });
    }

    if (!locationId) {
        return NextResponse.json({ error: "locationId is required" }, { status: 400 });
    }

    // 1) Check if user already has any memberships with this studio
    const { data: existingMemberships, error: existingMembershipError } = await supabaseAdmin
        .from("studio_memberships")
        .select("role, status, location_id")
        .eq("studio_id", studioId)
        .eq("user_id", user.id);

    if (existingMembershipError) {
        console.error("Membership lookup error", existingMembershipError);
        return NextResponse.json({ error: "Failed to check existing membership" }, { status: 500 });
    }

    const memberships = existingMemberships ?? [];

    // 1a) If they are already staff for this studio, block applications
    const hasStaffMembership = memberships.some((m) =>
        STAFF_ROLES.includes((m.role as string) ?? "")
    );

    if (hasStaffMembership) {
        return NextResponse.json(
            {
                error: "You already have staff access to this studio and do not need to apply as a member."
            },
            { status: 400 }
        );
    }

    // 1b) If they are already an active member at this specific location, block
    const hasActiveMemberAtLocation = memberships.some(
        (m) =>
            (m.role as string) === MEMBER_ROLE &&
            (m.status as string) === "active" &&
            m.location_id === locationId
    );

    if (hasActiveMemberAtLocation) {
        return NextResponse.json(
            {
                error: "You are already an active member at this location and do not need to apply again."
            },
            { status: 400 }
        );
    }

    // 2) Prevent duplicate pending applications for the *same studio + location*
    const { data: existingPending, error: pendingError } = await supabaseAdmin
        .from("studio_membership_applications")
        .select("id")
        .eq("studio_id", studioId)
        .eq("profile_id", user.id)
        .eq("location_id", locationId)
        .eq("status", "pending")
        .maybeSingle();

    if (pendingError) {
        console.error("Pending application lookup error", pendingError);
        return NextResponse.json(
            { error: "Failed to check existing applications" },
            { status: 500 }
        );
    }

    if (existingPending) {
        return NextResponse.json(
            {
                error: "You already have a pending application for this studio location."
            },
            { status: 400 }
        );
    }

    // 3) Insert application
    const { data: application, error: insertError } = await supabaseAdmin
        .from("studio_membership_applications")
        .insert({
            studio_id: studioId,
            profile_id: user.id,
            status: "pending",
            location_id: locationId,
            requested_membership_type: requestedMembershipType ?? null,
            experience: experience ?? null,
            interests: Array.isArray(interests) ? interests : null,
            goals: goals ?? null,
            referral_source: referralSource ?? null,
            emergency_contact: emergencyContact ?? null,
            custom_fields: customFields ?? null
        })
        .select("*")
        .single();

    if (insertError || !application) {
        console.error("Error creating application", insertError);
        return NextResponse.json({ error: "Failed to create application" }, { status: 500 });
    }

    return NextResponse.json({ application });
}

// -----------------------------------------------------------------------------
// GET – Studio owner/admin lists applications (e.g., pending)
// -----------------------------------------------------------------------------
export async function GET(req: Request, { params }: { params: { studioId: string } }) {
    const studioId = params.studioId;
    const token = getBearerToken(req);

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
        data: { user },
        error: userError
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
        console.error("Error verifying token", userError);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check they are owner/admin for this studio
    const { data: memberships, error: membershipError } = await supabaseAdmin
        .from("studio_memberships")
        .select("role")
        .eq("studio_id", studioId)
        .eq("user_id", user.id)
        .eq("status", "active");

    if (membershipError) {
        console.error("Membership lookup error", membershipError);
        return NextResponse.json(
            { error: "Not authorized to view applications for this studio" },
            { status: 403 }
        );
    }

    const hasInvitePermission = (memberships ?? []).some((m) =>
        INVITER_ROLES.includes((m.role as string) ?? "")
    );

    if (!hasInvitePermission) {
        return NextResponse.json(
            {
                error: "You do not have permission to view membership applications for this studio"
            },
            { status: 403 }
        );
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status") ?? "pending";

    const { data: applications, error: appsError } = await supabaseAdmin
        .from("studio_membership_applications")
        .select(
            `
      id,
      studio_id,
      profile_id,
      status,
      location_id,
      requested_membership_type,
      experience,
      interests,
      goals,
      referral_source,
      emergency_contact,
      custom_fields,
      submitted_at,
      decided_at,
      decided_by,
      decision_reason,
      profiles:profile_id (
        id,
        name,
        email,
        handle,
        phone
      )
    `
        )
        .eq("studio_id", studioId)
        .eq("status", status as any)
        .order("submitted_at", { ascending: false });

    if (appsError) {
        console.error("Error fetching applications", appsError);
        return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
    }

    return NextResponse.json({ applications: applications ?? [] });
}
