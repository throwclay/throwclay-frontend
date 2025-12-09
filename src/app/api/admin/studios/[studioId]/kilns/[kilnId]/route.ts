// app/api/admin/studios/[studioId]/kilns/[kilnId]/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";
import { assertStudioAdmin } from "@/lib/server/studios";

export async function GET(
    req: Request,
    { params }: { params: { studioId: string; kilnId: string } }
) {
    const token = getBearerToken(req);
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
        data: { user },
        error: authError
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studioId, kilnId } = params;

    try {
        await assertStudioAdmin(user.id, studioId);

        const { data, error } = await supabaseAdmin
            .from("kilns")
            .select("*")
            .eq("id", kilnId)
            .eq("studio_id", studioId)
            .single();

        if (error || !data) {
            console.error("GET /api/admin/studios/[studioId]/kilns/[kilnId] fetch error", error);
            return NextResponse.json({ error: "Kiln not found" }, { status: 404 });
        }

        // Transform the data to match frontend expectations (camelCase)
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
            warrantyExpiry: data.warranty_expiry
                ? new Date(data.warranty_expiry).toISOString()
                : undefined,
            maintenanceSchedule: data.maintenance_schedule || undefined,
            status: data.status,
            isActive: data.is_active ?? true,
            lastFired: data.last_fired,
            totalFirings: data.total_firings ?? 0,
            notes: data.notes,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };

        return NextResponse.json({ kiln: transformedKiln });
    } catch (err: any) {
        if (err?.message?.includes("Not authorized") || err?.message?.includes("Insufficient")) {
            return NextResponse.json({ error: err.message }, { status: 403 });
        }

        console.error("GET /api/admin/studios/[studioId]/kilns/[kilnId]", err);
        return NextResponse.json({ error: "Failed to load kiln" }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: { studioId: string; kilnId: string } }
) {
    const token = getBearerToken(req);

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
        data: { user },
        error: authError
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studioId, kilnId } = params;
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
        notes
    } = body ?? {};

    if (!name || !type) {
        return NextResponse.json(
            { error: "Missing required fields (name, type)" },
            { status: 400 }
        );
    }

    try {
        await assertStudioAdmin(user.id, studioId);

        // First verify the kiln exists and belongs to this studio
        const { data: existingKiln, error: fetchError } = await supabaseAdmin
            .from("kilns")
            .select("id, studio_id")
            .eq("id", kilnId)
            .eq("studio_id", studioId)
            .single();

        if (fetchError || !existingKiln) {
            return NextResponse.json({ error: "Kiln not found" }, { status: 404 });
        }

        // Prepare the update data with all fields
        // Note: Supabase jsonb columns accept objects directly, not JSON strings
        const updateData: any = {
            name,
            type,
            manufacturer: manufacturer || null,
            model: model || null,
            serial_number: serialNumber || null,
            location_id: locationId || null,
            capacity: capacity ?? null,
            max_temp: maxTemp ?? null,
            shelf_count: shelfCount ?? null,
            shelf_configuration:
                shelfConfiguration &&
                Array.isArray(shelfConfiguration) &&
                shelfConfiguration.length > 0
                    ? shelfConfiguration
                    : null,
            specs: specifications && Object.keys(specifications).length > 0 ? specifications : null,
            install_date: installDate ? new Date(installDate).toISOString().split("T")[0] : null,
            warranty_expiry: warrantyExpiry
                ? new Date(warrantyExpiry).toISOString().split("T")[0]
                : null,
            maintenance_schedule:
                maintenanceSchedule && Object.keys(maintenanceSchedule).length > 0
                    ? maintenanceSchedule
                    : null,
            status: status || "available",
            is_active: isActive !== undefined ? isActive : true,
            notes: notes || null,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabaseAdmin
            .from("kilns")
            .update(updateData)
            .eq("id", kilnId)
            .eq("studio_id", studioId)
            .select("*")
            .single();

        if (error || !data) {
            console.error("PUT /api/admin/studios/[studioId]/kilns/[kilnId] update error", error);
            return NextResponse.json({ error: "Failed to update kiln" }, { status: 500 });
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
            warrantyExpiry: data.warranty_expiry
                ? new Date(data.warranty_expiry).toISOString()
                : undefined,
            maintenanceSchedule: data.maintenance_schedule || undefined,
            status: data.status,
            isActive: data.is_active ?? true,
            lastFired: data.last_fired,
            totalFirings: data.total_firings ?? 0,
            notes: data.notes,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };

        return NextResponse.json({ kiln: transformedKiln });
    } catch (err: any) {
        if (err?.message?.includes("Not authorized") || err?.message?.includes("Insufficient")) {
            return NextResponse.json({ error: err.message }, { status: 403 });
        }

        console.error("PUT /api/admin/studios/[studioId]/kilns/[kilnId]", err);
        return NextResponse.json({ error: "Failed to update kiln" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { studioId: string; kilnId: string } }
) {
    const token = getBearerToken(req);

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
        data: { user },
        error: authError
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studioId, kilnId } = params;

    try {
        await assertStudioAdmin(user.id, studioId);

        // Verify the kiln exists and belongs to this studio
        const { data: existingKiln, error: fetchError } = await supabaseAdmin
            .from("kilns")
            .select("id, studio_id")
            .eq("id", kilnId)
            .eq("studio_id", studioId)
            .single();

        if (fetchError || !existingKiln) {
            return NextResponse.json({ error: "Kiln not found" }, { status: 404 });
        }

        const { error } = await supabaseAdmin
            .from("kilns")
            .delete()
            .eq("id", kilnId)
            .eq("studio_id", studioId);

        if (error) {
            console.error(
                "DELETE /api/admin/studios/[studioId]/kilns/[kilnId] delete error",
                error
            );
            return NextResponse.json({ error: "Failed to delete kiln" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        if (err?.message?.includes("Not authorized") || err?.message?.includes("Insufficient")) {
            return NextResponse.json({ error: err.message }, { status: 403 });
        }

        console.error("DELETE /api/admin/studios/[studioId]/kilns/[kilnId]", err);
        return NextResponse.json({ error: "Failed to delete kiln" }, { status: 500 });
    }
}
