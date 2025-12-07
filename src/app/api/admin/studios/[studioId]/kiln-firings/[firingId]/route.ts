// app/api/admin/studios/[studioId]/kiln-firings/[firingId]/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";
import { assertStudioAdmin } from "@/lib/server/studios";

export async function GET(
  req: Request,
  { params }: { params: { studioId: string; firingId: string } }
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

  const { studioId, firingId } = params;

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
          capacity
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
      .eq("id", firingId)
      .eq("studio_id", studioId)
      .single();

    if (error || !data) {
      console.error(
        "GET /api/admin/studios/[studioId]/kiln-firings/[firingId] fetch error",
        error
      );
      return NextResponse.json(
        { error: "Firing not found" },
        { status: 404 }
      );
    }

    // Transform to camelCase
    const transformedFiring = {
      id: data.id,
      studioId: data.studio_id,
      kilnId: data.kiln_id,
      templateId: data.template_id,
      name: data.name,
      scheduledStart: data.scheduled_start,
      actualStart: data.actual_start,
      actualEnd: data.actual_end,
      atmosphere: data.atmosphere,
      targetCone: data.target_cone,
      targetTemperature: data.target_temperature,
      actualTemperature: data.actual_temperature,
      notes: data.notes,
      completionNotes: data.completion_notes,
      operatorId: data.operator_id,
      status: data.status,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      kiln: data.kilns,
      template: data.templates,
      creator: data.creator,
      operator: data.operator,
    };

    return NextResponse.json({ firing: transformedFiring });
  } catch (err: any) {
    if (
      err?.message?.includes("Not authorized") ||
      err?.message?.includes("Insufficient")
    ) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }

    console.error("GET /api/admin/studios/[studioId]/kiln-firings/[firingId]", err);
    return NextResponse.json(
      { error: "Failed to load firing" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { studioId: string; firingId: string } }
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

  const { studioId, firingId } = params;
  const body = await req.json().catch(() => ({}));

  const {
    status,
    actualStart,
    actualEnd,
    actualTemperature,
    completionNotes,
    notes,
    operatorId,
    scheduledStart,
    date,
    startTime,
    name,
    targetCone,
    atmosphere,
    firingType,
    bookedSlots,
    rackNumbers,
  } = body ?? {};

  try {
    await assertStudioAdmin(user.id, studioId);

    // First verify the firing exists and belongs to this studio
    const { data: existingFiring, error: fetchError } = await supabaseAdmin
      .from("kiln_firings")
      .select("id, studio_id, kiln_id, status, actual_start, actual_end")
      .eq("id", firingId)
      .eq("studio_id", studioId)
      .single();

    if (fetchError || !existingFiring) {
      return NextResponse.json(
        { error: "Firing not found" },
        { status: 404 }
      );
    }

    // Prepare the update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (status !== undefined) {
      updateData.status = status;
    }
    if (actualStart !== undefined) {
      updateData.actual_start = actualStart ? new Date(actualStart).toISOString() : null;
    }
    if (actualEnd !== undefined) {
      updateData.actual_end = actualEnd ? new Date(actualEnd).toISOString() : null;
    }
    if (actualTemperature !== undefined) {
      updateData.actual_temperature = actualTemperature ?? null;
    }
    if (completionNotes !== undefined) {
      updateData.completion_notes = completionNotes || null;
    }
    if (notes !== undefined) {
      updateData.notes = notes || null;
    }
    if (operatorId !== undefined) {
      updateData.operator_id = operatorId || null;
    }
    if (name !== undefined) {
      updateData.name = name || null;
    }
    if (targetCone !== undefined) {
      updateData.target_cone = targetCone || null;
    }
    if (atmosphere !== undefined) {
      updateData.atmosphere = atmosphere || null;
    }
    if (firingType !== undefined) {
      updateData.firing_type = firingType || null;
    }
    if (bookedSlots !== undefined) {
      updateData.booked_slots = bookedSlots ?? 0;
    } else if (rackNumbers !== undefined && Array.isArray(rackNumbers)) {
      // If rackNumbers is provided, calculate booked_slots from it
      updateData.booked_slots = rackNumbers.length;
    }
    if (scheduledStart !== undefined) {
      updateData.scheduled_start = scheduledStart ? new Date(scheduledStart).toISOString() : null;
    } else if (date && startTime) {
      // Combine date and startTime if provided
      try {
        const dt = new Date(`${date}T${startTime}`);
        if (!isNaN(dt.getTime())) {
          updateData.scheduled_start = dt.toISOString();
        }
      } catch {
        // ignore, will not update scheduled_start
      }
    }

    // If starting a firing (status = "loading" or "firing"), set actual_start if not already set
    if ((status === "loading" || status === "firing") && !existingFiring.actual_start) {
      updateData.actual_start = new Date().toISOString();
    }

    // If completing a firing, set actual_end if not already set
    if (status === "completed" && !existingFiring.actual_end) {
      updateData.actual_end = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from("kiln_firings")
      .update(updateData)
      .eq("id", firingId)
      .eq("studio_id", studioId)
      .select("*")
      .single();

    if (error || !data) {
      console.error("PUT /api/admin/studios/[studioId]/kiln-firings/[firingId] update error", error);
      return NextResponse.json(
        { error: "Failed to update firing" },
        { status: 500 }
      );
    }

    // Update kiln status if starting/completing firing
    if (status === "loading" || status === "firing" || status === "cooling") {
      // Set kiln status to "in-use" (keep in-use during loading, firing, and cooling)
      await supabaseAdmin
        .from("kilns")
        .update({ status: "in-use", updated_at: new Date().toISOString() })
        .eq("id", existingFiring.kiln_id)
        .eq("studio_id", studioId);
    } else if (status === "completed" || status === "cancelled") {
      // Set kiln status back to "available" and increment total_firings if completed
      const updateKilnData: any = {
        status: "available",
        updated_at: new Date().toISOString(),
      };
      
      if (status === "completed") {
        // Increment total_firings
        const { data: kilnData } = await supabaseAdmin
          .from("kilns")
          .select("total_firings, last_fired")
          .eq("id", existingFiring.kiln_id)
          .single();
        
        updateKilnData.total_firings = (kilnData?.total_firings ?? 0) + 1;
        updateKilnData.last_fired = new Date().toISOString();
      }

      await supabaseAdmin
        .from("kilns")
        .update(updateKilnData)
        .eq("id", existingFiring.kiln_id)
        .eq("studio_id", studioId);
    }

    // Transform the response to match frontend expectations (camelCase)
    const transformedFiring = {
      id: data.id,
      studioId: data.studio_id,
      kilnId: data.kiln_id,
      templateId: data.template_id,
      name: data.name,
      scheduledStart: data.scheduled_start,
      actualStart: data.actual_start,
      actualEnd: data.actual_end,
      atmosphere: data.atmosphere,
      targetCone: data.target_cone,
      targetTemperature: data.target_temperature,
      actualTemperature: data.actual_temperature,
      notes: data.notes,
      completionNotes: data.completion_notes,
      operatorId: data.operator_id,
      status: data.status,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json({ firing: transformedFiring });
  } catch (err: any) {
    if (
      err?.message?.includes("Not authorized") ||
      err?.message?.includes("Insufficient")
    ) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }

    console.error("PUT /api/admin/studios/[studioId]/kiln-firings/[firingId]", err);
    return NextResponse.json(
      { error: "Failed to update firing" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { studioId: string; firingId: string } }
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

  const { studioId, firingId } = params;

  try {
    await assertStudioAdmin(user.id, studioId);

    // Verify the firing exists and belongs to this studio
    const { data: existingFiring, error: fetchError } = await supabaseAdmin
      .from("kiln_firings")
      .select("id, studio_id, kiln_id, status")
      .eq("id", firingId)
      .eq("studio_id", studioId)
      .single();

    if (fetchError || !existingFiring) {
      return NextResponse.json(
        { error: "Firing not found" },
        { status: 404 }
      );
    }

    // Only allow deleting scheduled or cancelled firings
    if (existingFiring.status !== 'scheduled' && existingFiring.status !== 'cancelled') {
      return NextResponse.json(
        { error: "Only scheduled or cancelled firings can be deleted" },
        { status: 400 }
      );
    }

    // Delete the firing (CASCADE will handle related records like kiln_assignments)
    const { error } = await supabaseAdmin
      .from("kiln_firings")
      .delete()
      .eq("id", firingId)
      .eq("studio_id", studioId);

    if (error) {
      console.error("DELETE /api/admin/studios/[studioId]/kiln-firings/[firingId] delete error", error);
      return NextResponse.json(
        { error: "Failed to delete firing" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (
      err?.message?.includes("Not authorized") ||
      err?.message?.includes("Insufficient")
    ) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }

    console.error("DELETE /api/admin/studios/[studioId]/kiln-firings/[firingId]", err);
    return NextResponse.json(
      { error: "Failed to delete firing" },
      { status: 500 }
    );
  }
}

