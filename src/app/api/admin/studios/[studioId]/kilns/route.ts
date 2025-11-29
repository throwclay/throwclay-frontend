// app/api/admin/studios/[studioId]/kilns/route.ts
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
      .from("kilns")
      .select("*")
      .eq("studio_id", studioId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(
        "GET /api/admin/studios/[studioId]/kilns fetch error",
        error
      );
      return NextResponse.json(
        { error: "Failed to load kilns" },
        { status: 500 }
      );
    }

    // Transform the data to match frontend expectations (camelCase)
    const transformedKilns = (data ?? []).map((kiln: any) => ({
      id: kiln.id,
      name: kiln.name,
      type: kiln.type,
      manufacturer: kiln.manufacturer,
      model: kiln.model,
      serialNumber: kiln.serial_number,
      locationId: kiln.location_id,
      capacity: kiln.capacity,
      maxTemp: kiln.max_temp,
      shelfCount: kiln.shelf_count,
      shelfConfiguration: kiln.shelf_configuration || [],
      specifications: kiln.specs || {},
      installDate: kiln.install_date ? new Date(kiln.install_date).toISOString() : undefined,
      warrantyExpiry: kiln.warranty_expiry ? new Date(kiln.warranty_expiry).toISOString() : undefined,
      maintenanceSchedule: kiln.maintenance_schedule || undefined,
      status: kiln.status,
      isActive: kiln.is_active ?? true,
      lastFired: kiln.last_fired,
      totalFirings: kiln.total_firings ?? 0,
      notes: kiln.notes,
      createdAt: kiln.created_at,
      updatedAt: kiln.updated_at,
    }));

    return NextResponse.json({ kilns: transformedKilns });
  } catch (err: any) {
    if (
      err?.message?.includes("Not authorized") ||
      err?.message?.includes("Insufficient")
    ) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }

    console.error("GET /api/admin/studios/[studioId]/kilns", err);
    return NextResponse.json(
      { error: "Failed to load kilns" },
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
    type,
    manufacturer,
    model,
    serialNumber,
    locationId,
    capacity,
    maxTemp,
    shelfCount,
    shelfConfiguration,
    specifications,
    installDate,
    warrantyExpiry,
    maintenanceSchedule,
    status,
    isActive,
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

    // Prepare the insert data with all new fields
    // Note: Supabase jsonb columns accept objects directly, not JSON strings
    const insertData: any = {
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
      shelf_configuration: shelfConfiguration && Array.isArray(shelfConfiguration) && shelfConfiguration.length > 0 
        ? shelfConfiguration 
        : null,
      specs: specifications && Object.keys(specifications).length > 0 
        ? specifications 
        : null,
      install_date: installDate 
        ? new Date(installDate).toISOString().split('T')[0] 
        : null,
      warranty_expiry: warrantyExpiry 
        ? new Date(warrantyExpiry).toISOString().split('T')[0] 
        : null,
      maintenance_schedule: maintenanceSchedule && Object.keys(maintenanceSchedule).length > 0
        ? maintenanceSchedule
        : null,
      status: status || "available",
      is_active: isActive !== undefined ? isActive : true,
      notes: notes || null,
    };

    const { data, error } = await supabaseAdmin
      .from("kilns")
      .insert(insertData)
      .select("*")
      .single();

    if (error || !data) {
      console.error("POST /api/admin/studios/[studioId]/kilns insert error", error);
      return NextResponse.json(
        { error: "Failed to create kiln" },
        { status: 500 }
      );
    }

    // Transform the response to match frontend expectations (camelCase)
    const transformedKiln = {
      id: data.id,
      name: data.name,
      type: data.type,
      manufacturer: data.manufacturer,
      model: data.model,
      serialNumber: data.serial_number,
      locationId: data.location_id,
      capacity: data.capacity,
      maxTemp: data.max_temp,
      shelfCount: data.shelf_count,
      shelfConfiguration: data.shelf_configuration || [],
      specifications: data.specs || {},
      installDate: data.install_date ? new Date(data.install_date).toISOString() : undefined,
      warrantyExpiry: data.warranty_expiry ? new Date(data.warranty_expiry).toISOString() : undefined,
      maintenanceSchedule: data.maintenance_schedule || undefined,
      status: data.status,
      isActive: data.is_active ?? true,
      lastFired: data.last_fired,
      totalFirings: data.total_firings ?? 0,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json({ kiln: transformedKiln }, { status: 201 });
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


