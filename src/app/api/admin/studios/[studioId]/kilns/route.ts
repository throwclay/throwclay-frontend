// app/api/admin/studios/[studioId]/kilns/route.ts
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
    type,
    manufacturer,
    model,
    serialNumber,
    locationId,
    capacity,
    maxTemp,
    shelfCount,
    status,
    notes,
  } = body ?? {};

  if (!name || !type || !studioId) {
    return NextResponse.json(
      { error: "Missing required fields (name, type, studioId)" },
      { status: 400 }
    );
  }

  try {
    await assertStudioAdmin(user.id, studioId);

    const { data, error } = await supabaseAdmin
      .from("kilns")
      .insert({
        studio_id: studioId,
        location_id: locationId || null,
        name,
        type,
        manufacturer: manufacturer || null,
        model: model || null,
        serial_number: serialNumber || null,
        capacity: capacity ?? null,
        max_temp: maxTemp ?? null,
        shelf_count: shelfCount ?? null,
        status: status || "available",
        notes: notes || null,
      })
      .select("*")
      .single();

    if (error || !data) {
      console.error("POST /api/admin/studios/[studioId]/kilns insert error", error);
      return NextResponse.json(
        { error: "Failed to create kiln" },
        { status: 500 }
      );
    }

    return NextResponse.json({ kiln: data }, { status: 201 });
  } catch (err: any) {
    if (
      err?.message?.includes("Not authorized") ||
      err?.message?.includes("Insufficient")
    ) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }

    console.error("POST /api/admin/studios/[studioId]/kilns", err);
    return NextResponse.json(
      { error: "Failed to create kiln" },
      { status: 500 }
    );
  }
}


