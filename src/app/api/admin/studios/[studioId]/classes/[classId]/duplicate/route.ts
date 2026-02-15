// app/api/admin/studios/[studioId]/classes/[classId]/duplicate/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";
import { assertStudioAdmin } from "@/lib/server/studios";

// POST /api/admin/studios/[studioId]/classes/[classId]/duplicate
// Duplicate a class with all its related data
export async function POST(
    req: Request,
    { params }: { params: { studioId: string; classId: string } }
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

    try {
        await assertStudioAdmin(user.id, params.studioId);

        const body = await req.json().catch(() => ({}));
        const newName = body.name; // Optional new name

        // Fetch original class
        const { data: originalClass, error: fetchError } = await supabaseAdmin
            .from("studio_classes")
            .select("*")
            .eq("id", params.classId)
            .eq("studio_id", params.studioId)
            .single();

        if (fetchError || !originalClass) {
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
        }

        // Create new class based on original
        const { data: newClass, error: createError } = await supabaseAdmin
            .from("studio_classes")
            .insert({
                studio_id: originalClass.studio_id,
                location_id: originalClass.location_id,
                template_id: originalClass.template_id,
                name: newName || `${originalClass.name} (Copy)`,
                description: originalClass.description,
                instructor_id: originalClass.instructor_id,
                level: originalClass.level,
                capacity: originalClass.capacity,
                start_date: originalClass.start_date,
                end_date: originalClass.end_date,
                schedule: originalClass.schedule,
                location: originalClass.location,
                materials: originalClass.materials,
                prerequisites: originalClass.prerequisites,
                status: "draft", // Always start duplicated classes as draft
                thumbnail_url: originalClass.thumbnail_url,
                total_sessions: originalClass.total_sessions,
                sessions_completed: 0,
                revenue_cents: 0,
                enrolled_count: 0,
                waitlist_count: 0,
                created_by: user.id
            })
            .select("*")
            .single();

        if (createError || !newClass) {
            console.error("Error creating duplicated class", createError);
            return NextResponse.json({ error: "Failed to duplicate class" }, { status: 500 });
        }

        // Duplicate pricing tiers
        const { data: originalTiers, error: tiersError } = await supabaseAdmin
            .from("class_pricing_tiers")
            .select("*")
            .eq("class_id", params.classId);

        if (!tiersError && originalTiers && originalTiers.length > 0) {
            const newTiers = originalTiers.map((tier) => ({
                class_id: newClass.id,
                name: tier.name,
                price_cents: tier.price_cents,
                description: tier.description,
                is_default: tier.is_default,
                is_active: tier.is_active,
                enrollment_count: 0
            }));

            await supabaseAdmin.from("class_pricing_tiers").insert(newTiers);
        }

        // Duplicate discount codes
        const { data: originalCodes, error: codesError } = await supabaseAdmin
            .from("class_discount_codes")
            .select("*")
            .eq("class_id", params.classId);

        if (!codesError && originalCodes && originalCodes.length > 0) {
            const newCodes = originalCodes.map((code) => ({
                class_id: newClass.id,
                code: code.code,
                type: code.type,
                value: code.value,
                description: code.description,
                expiry_date: code.expiry_date,
                usage_limit: code.usage_limit,
                usage_count: 0,
                is_active: code.is_active
            }));

            await supabaseAdmin.from("class_discount_codes").insert(newCodes);
        }

        // Duplicate images
        const { data: originalImages, error: imagesError } = await supabaseAdmin
            .from("class_images")
            .select("*")
            .eq("class_id", params.classId);

        if (!imagesError && originalImages && originalImages.length > 0) {
            const newImages = originalImages.map((img) => ({
                class_id: newClass.id,
                url: img.url,
                alt_text: img.alt_text,
                is_main: img.is_main,
                upload_date: img.upload_date
            }));

            await supabaseAdmin.from("class_images").insert(newImages);
        }

        // Fetch complete new class with relations
        const { data: completeClass, error: fetchCompleteError } = await supabaseAdmin
            .from("studio_classes")
            .select(
                `
                *,
                instructor:instructor_id (
                    id,
                    name,
                    email
                ),
                template:template_id (
                    id,
                    name
                )
            `
            )
            .eq("id", newClass.id)
            .single();

        if (fetchCompleteError) {
            console.error("Error fetching complete class", fetchCompleteError);
            return NextResponse.json({ class: newClass });
        }

        return NextResponse.json({ class: completeClass }, { status: 201 });
    } catch (error: any) {
        console.error(
            "Error in POST /api/admin/studios/[studioId]/classes/[classId]/duplicate",
            error
        );
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

