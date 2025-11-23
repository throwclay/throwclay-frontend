// app/api/studios/[studioId]/applications/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";

const INVITER_ROLES = ["owner", "admin"];

// Artist applies to join studio
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

    // adding this to prevent duplicate pending via DB unique index;
    const { data: existingPending } = await supabaseAdmin
        .from("studio_membership_applications")
        .select("id")
        .eq("studio_id", studioId)
        .eq("profile_id", user.id)
        .eq("status", "pending")
        .maybeSingle();

    if (existingPending) {
        return NextResponse.json(
            { error: "You already have a pending application for this studio" },
            { status: 400 }
        );
    }

    const { data: application, error: insertError } = await supabaseAdmin
        .from("studio_membership_applications")
        .insert({
            studio_id: studioId,
            profile_id: user.id,
            status: "pending",
            location_id: locationId ?? null,
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

// Studio owner/admin lists applications (e.g., pending)
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
    const { data: membership, error: membershipError } = await supabaseAdmin
        .from("studio_memberships")
        .select("role")
        .eq("studio_id", studioId)
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

    if (membershipError || !membership) {
        return NextResponse.json(
            { error: "Not authorized to view applications for this studio" },
            { status: 403 }
        );
    }

    if (!INVITER_ROLES.includes(membership.role as string)) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
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
