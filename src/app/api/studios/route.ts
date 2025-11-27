import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";

// POST /api/studios
// Creates a studio, a default location, and an owner membership for the
// currently authenticated user (the one whose token is provided).
export async function POST(req: Request) {
  const token = getBearerToken(req);

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    console.error("POST /api/studios getUser error", authError);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  const {
    studioName,
    studioHandle,
    city,
    state,
    selectedPlan,
    locationName,
    locationAddress,
    locationZip,
    locationPhone,
  } = body ?? {};

  if (
    !studioName ||
    !studioHandle ||
    !city ||
    !state ||
    !locationName ||
    !locationAddress ||
    !locationZip ||
    !locationPhone
  ) {
    return NextResponse.json(
      {
        error:
          "Missing required fields (studioName, studioHandle, city, state, locationName, locationAddress, locationZip, locationPhone)",
      },
      { status: 400 }
    );
  }

  // Map SignupFlow's selectedPlan to backend studio plan codes
  // and derive sensible max_members / max_locations defaults.
  // Adjust these as needed to match your actual pricing.
  let plan: string = "studio-solo";
  let maxMembers: number | null = 25;
  let maxLocations: number | null = 1;

  switch (selectedPlan) {
    case "professional":
      plan = "studio-pro";
      maxMembers = 100;
      maxLocations = 3;
      break;
    case "enterprise":
      plan = "studio-unlimited";
      maxMembers = null; // null = treated as "unlimited" in your UI
      maxLocations = null;
      break;
    case "starter":
    default:
      plan = "studio-solo";
      maxMembers = 25;
      maxLocations = 1;
      break;
  }

  try {
    // 1) Create studio
    const { data: studio, error: studioError } = await supabaseAdmin
      .from("studios")
      .insert({
        name: studioName,
        handle: studioHandle,
        email: user.email ?? null,
        description: null,
        is_active: true,
        plan,
        max_members: maxMembers,
        max_locations: maxLocations,
        website: null,
      })
      .select("*")
      .single();

    if (studioError || !studio) {
      console.error("POST /api/studios insert studio error", studioError);
      return NextResponse.json(
        { error: "Failed to create studio" },
        { status: 500 }
      );
    }

    // 2) Create default location for this studio
    const { data: location, error: locationError } = await supabaseAdmin
      .from("studio_locations")
      .insert({
        studio_id: studio.id,
        name: locationName,
        address: locationAddress,
        city,
        state,
        zip_code: locationZip,
        phone: locationPhone,
        email: user.email ?? null,
        is_active: true,
      })
      .select("*")
      .single();

    if (locationError || !location) {
      console.error(
        "POST /api/studios insert location error",
        locationError
      );
      return NextResponse.json(
        { error: "Failed to create studio location" },
        { status: 500 }
      );
    }

    // 3) Create owner membership for the user
    const { data: membership, error: membershipError } = await supabaseAdmin
      .from("studio_memberships")
      .insert({
        studio_id: studio.id,
        user_id: user.id,
        role: "owner",
        status: "active",
        location_id: location.id,
        // NOTE: membership_type must match an existing studio_membership_plans.plan_code.
        // Adjust this default to whatever makes sense in your seed data.
        membership_type: "unlimited",
      })
      .select("*")
      .single();

    if (membershipError || !membership) {
      console.error(
        "POST /api/studios insert membership error",
        membershipError
      );
      return NextResponse.json(
        { error: "Failed to create studio membership" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        studio,
        location,
        membership,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/studios unexpected error", err);
    return NextResponse.json(
      { error: "Failed to create studio" },
      { status: 500 }
    );
  }
}


