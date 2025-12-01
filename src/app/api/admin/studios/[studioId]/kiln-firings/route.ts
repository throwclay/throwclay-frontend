// app/api/admin/studios/[studioId]/kiln-firings/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";
import { assertStudioAdmin } from "@/lib/server/studios";

export async function GET(
  req: Request,
  { params }: { params: { studioId: string } }
) {
  const token = getBearerToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const studioId = params.studioId;

  try {
    await assertStudioAdmin(user.id, studioId);

    const { data, error } = await supabaseAdmin
      .from("kiln_firings")
      .select(`
        *,
        kilns:kiln_id (
          id,
          name,
          type,
          capacity,
          location:location_id (
            id,
            name
          )
        ),
        templates:template_id (
          id,
          name,
          base_type,
          temperature_curve
        ),
        creator:created_by (
          id,
          name,
          email
        ),
        operator:operator_id (
          id,
          name,
          email
        )
      `)
      .eq("studio_id", studioId)
      .order("scheduled_start", { ascending: true });

    if (error) {
      console.error(
        "GET /api/admin/studios/[studioId]/kiln-firings fetch error",
        error
      );
      return NextResponse.json(
        { error: "Failed to load kiln firings" },
        { status: 500 }
      );
    }

    return NextResponse.json({ firings: data ?? [] });
  } catch (err: any) {
    if (
      err?.message?.includes("Not authorized") ||
      err?.message?.includes("Insufficient")
    ) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }

    console.error("GET /api/admin/studios/[studioId]/kiln-firings", err);
    return NextResponse.json(
      { error: "Failed to load kiln firings" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { studioId: string } }
) {
  const token = getBearerToken(req);

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const studioId = params.studioId;
  const body = await req.json().catch(() => ({}));

  const {
    name,
    kilnId,
    date,
    startTime,
    firingType,
    atmosphere,
    targetCone,
    targetTemperature,
    operatorId,
    notes,
    rackNumbers, // Array of rack numbers selected
    status, // Allow setting status directly for quick-start
  } = body ?? {};

  if (!kilnId) {
    return NextResponse.json(
      { error: "Missing required field: kilnId" },
      { status: 400 }
    );
  }

  // For quick-start, date and startTime are optional (will use current time)
  const isQuickStart = status === "loading" || status === "firing";

  let scheduledStart: string | null = null;
  let actualStart: string | null = null;
  
  try {
    if (date && startTime) {
      const dt = new Date(`${date}T${startTime}`);
      if (!isNaN(dt.getTime())) {
        scheduledStart = dt.toISOString();
      }
    } else if (isQuickStart) {
      // For quick-start, use current time
      scheduledStart = new Date().toISOString();
      actualStart = new Date().toISOString();
    }
  } catch {
    // ignore, will stay null
  }

  try {
    await assertStudioAdmin(user.id, studioId);

    const firingStatus = status || "scheduled";
    
    // Calculate booked slots from rack numbers or default to 0
    // If rackNumbers is provided, use its length as booked slots
    // Otherwise, booked_slots will be null and can be updated later when items are loaded
    const bookedSlots = Array.isArray(rackNumbers) ? rackNumbers.length : null;
    
    // Format rack numbers into notes if provided
    let formattedNotes = notes || null;
    if (Array.isArray(rackNumbers) && rackNumbers.length > 0) {
      const rackInfo = `Racks: ${rackNumbers.join(', ')}`;
      formattedNotes = formattedNotes 
        ? `${formattedNotes}\n${rackInfo}` 
        : rackInfo;
    }
    
    const { data, error } = await supabaseAdmin
      .from("kiln_firings")
      .insert({
        studio_id: studioId,
        kiln_id: kilnId,
        template_id: null,
        name: name || null,
        scheduled_start: scheduledStart,
        actual_start: actualStart,
        firing_type: firingType || null,
        atmosphere: atmosphere || null,
        target_cone: targetCone || null,
        target_temperature: targetTemperature ? parseFloat(targetTemperature) : null,
        notes: formattedNotes,
        operator_id: operatorId || null,
        booked_slots: bookedSlots,
        status: firingStatus,
        created_by: user.id,
      })
      .select("*")
      .single();

    if (error || !data) {
      console.error(
        "POST /api/admin/studios/[studioId]/kiln-firings insert error",
        error
      );
      return NextResponse.json(
        { error: "Failed to create kiln firing" },
        { status: 500 }
      );
    }

    // If starting immediately, update kiln status
    if (firingStatus === "loading" || firingStatus === "firing") {
      await supabaseAdmin
        .from("kilns")
        .update({ status: "in-use", updated_at: new Date().toISOString() })
        .eq("id", kilnId)
        .eq("studio_id", studioId);
    }

    return NextResponse.json({ firing: data }, { status: 201 });
  } catch (err: any) {
    if (
      err?.message?.includes("Not authorized") ||
      err?.message?.includes("Insufficient")
    ) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }

    console.error("POST /api/admin/studios/[studioId]/kiln-firings", err);
    return NextResponse.json(
      { error: "Failed to create kiln firing" },
      { status: 500 }
    );
  }
}


