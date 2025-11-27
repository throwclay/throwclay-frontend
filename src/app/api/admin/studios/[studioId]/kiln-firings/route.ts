// app/api/admin/studios/[studioId]/kiln-firings/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";
import { assertStudioAdmin } from "@/lib/server/studios";

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
    atmosphere,
    targetCone,
    notes,
  } = body ?? {};

  if (!kilnId || !date || !startTime) {
    return NextResponse.json(
      { error: "Missing required fields (kilnId, date, startTime)" },
      { status: 400 }
    );
  }

  let scheduledStart: string | null = null;
  try {
    if (date && startTime) {
      const dt = new Date(`${date}T${startTime}`);
      if (!isNaN(dt.getTime())) {
        scheduledStart = dt.toISOString();
      }
    }
  } catch {
    // ignore, will stay null
  }

  try {
    await assertStudioAdmin(user.id, studioId);

    const { data, error } = await supabaseAdmin
      .from("kiln_firings")
      .insert({
        studio_id: studioId,
        kiln_id: kilnId,
        template_id: null,
        name: name || null,
        scheduled_start: scheduledStart,
        atmosphere: atmosphere || null,
        target_cone: targetCone || null,
        notes: notes || null,
        status: "scheduled",
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


