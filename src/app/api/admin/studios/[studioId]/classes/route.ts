// app/api/admin/studios/[studioId]/classes/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";
import { assertStudioAdmin } from "@/lib/server/studios";

// GET /api/admin/studios/[studioId]/classes
// List all classes for a studio with optional filters
export async function GET(req: Request, { params }: { params: { studioId: string } }) {
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

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const instructorId = searchParams.get("instructorId");
        const locationId = searchParams.get("locationId");
        const search = searchParams.get("search");

        // locationId is required for listing classes
        if (!locationId) {
            return NextResponse.json(
                { error: "locationId query parameter is required" },
                { status: 400 }
            );
        }

        // Validate that location belongs to studio
        const { data: locationData, error: locationError } = await supabaseAdmin
            .from("studio_locations")
            .select("id")
            .eq("id", locationId)
            .eq("studio_id", params.studioId)
            .single();

        if (locationError || !locationData) {
            return NextResponse.json(
                { error: "Location not found or does not belong to this studio" },
                { status: 404 }
            );
        }

        // Build query
        let query = supabaseAdmin
            .from("studio_classes")
            .select(
                `
                id,
                name,
                description,
                level,
                capacity,
                enrolled_count,
                waitlist_count,
                start_date,
                end_date,
                schedule,
                location,
                status,
                thumbnail_url,
                revenue_cents,
                average_rating,
                total_reviews,
                template_id,
                instructor_id,
                location_id,
                created_at,
                updated_at,
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
            .eq("studio_id", params.studioId)
            .eq("location_id", locationId) // Always filter by location
            .order("created_at", { ascending: false });

        // Apply filters
        if (status && status !== "all") {
            query = query.eq("status", status);
        }

        if (instructorId) {
            query = query.eq("instructor_id", instructorId);
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }

        const { data: classes, error } = await query;

        if (error) {
            console.error("Error fetching classes", error);
            return NextResponse.json({ error: "Failed to load classes" }, { status: 500 });
        }

        // Calculate stats
        const stats = {
            total: classes?.length || 0,
            draft: classes?.filter((c) => c.status === "draft").length || 0,
            published: classes?.filter((c) => c.status === "published").length || 0,
            inSession: classes?.filter((c) => c.status === "in-session").length || 0,
            completed: classes?.filter((c) => c.status === "completed").length || 0,
            cancelled: classes?.filter((c) => c.status === "cancelled").length || 0,
            totalStudents:
                classes?.reduce((sum, c) => sum + (c.enrolled_count || 0), 0) || 0,
            totalWaitlist:
                classes?.reduce((sum, c) => sum + (c.waitlist_count || 0), 0) || 0,
            totalRevenue:
                classes?.reduce((sum, c) => sum + (c.revenue_cents || 0), 0) || 0
        };

        // Transform data for frontend
        const transformedClasses =
            classes?.map((cls: any) => {
                const instructor = Array.isArray(cls.instructor)
                    ? cls.instructor[0]
                    : cls.instructor;
                const template = Array.isArray(cls.template) ? cls.template[0] : cls.template;

                return {
                    id: cls.id,
                    name: cls.name,
                    instructor: instructor
                        ? {
                              id: instructor.id,
                              name: instructor.name
                          }
                        : null,
                    schedule: cls.schedule || "",
                    capacity: cls.capacity,
                    enrolled: cls.enrolled_count || 0,
                    waitlist: cls.waitlist_count || 0,
                    startDate: cls.start_date,
                    endDate: cls.end_date,
                    status: cls.status,
                    level: cls.level || "",
                    price: "$0", // Will be calculated from pricing tiers
                    thumbnail: cls.thumbnail_url || "",
                    revenue: cls.revenue_cents ? cls.revenue_cents / 100 : 0,
                    templateId: cls.template_id || null,
                    templateName: template?.name || null
                };
            }) || [];

        return NextResponse.json({
            classes: transformedClasses,
            stats
        });
    } catch (error: any) {
        console.error("Error in GET /api/admin/studios/[studioId]/classes", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

// POST /api/admin/studios/[studioId]/classes
// Create a new class
export async function POST(req: Request, { params }: { params: { studioId: string } }) {
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

        const {
            name,
            description,
            instructorId,
            level,
            capacity,
            startDate,
            endDate,
            schedule,
            location,
            locationId,
            materials,
            prerequisites,
            templateId,
            pricingTiers,
            discountCodes,
            images,
            thumbnail
        } = body;

        // Validation
        if (!name || !instructorId || !level || !capacity || !startDate || !endDate || !locationId) {
            return NextResponse.json(
                {
                    error:
                        "Missing required fields: name, instructorId, level, capacity, startDate, endDate, locationId"
                },
                { status: 400 }
            );
        }

        // Validate that location belongs to studio
        const { data: locationData, error: locationError } = await supabaseAdmin
            .from("studio_locations")
            .select("id")
            .eq("id", locationId)
            .eq("studio_id", params.studioId)
            .single();

        if (locationError || !locationData) {
            return NextResponse.json(
                { error: "Location not found or does not belong to this studio" },
                { status: 400 }
            );
        }

        // Create class
        const { data: newClass, error: classError } = await supabaseAdmin
            .from("studio_classes")
            .insert({
                studio_id: params.studioId,
                location_id: locationId, // Required
                template_id: templateId || null,
                name,
                description: description || null,
                instructor_id: instructorId,
                level,
                capacity: parseInt(capacity),
                start_date: startDate,
                end_date: endDate,
                schedule: schedule || null,
                location: location || null,
                materials: materials || null,
                prerequisites: prerequisites || null,
                status: "draft",
                thumbnail_url: thumbnail || null,
                created_by: user.id
            })
            .select(
                `
                id,
                name,
                description,
                level,
                capacity,
                enrolled_count,
                waitlist_count,
                start_date,
                end_date,
                schedule,
                location,
                status,
                thumbnail_url,
                instructor_id,
                location_id,
                template_id,
                created_at,
                updated_at,
                instructor:instructor_id (
                    id,
                    name,
                    email
                )
            `
            )
            .single();

        if (classError || !newClass) {
            console.error("Error creating class", classError);
            return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
        }

        // Create pricing tiers if provided
        if (pricingTiers && Array.isArray(pricingTiers) && pricingTiers.length > 0) {
            const tiersToInsert = pricingTiers.map((tier: any) => ({
                class_id: newClass.id,
                name: tier.name,
                price_cents: Math.round((tier.priceCents || tier.price || 0) * 100),
                description: tier.description || null,
                is_default: tier.isDefault || false,
                is_active: true
            }));

            const { error: tiersError } = await supabaseAdmin
                .from("class_pricing_tiers")
                .insert(tiersToInsert);

            if (tiersError) {
                console.error("Error creating pricing tiers", tiersError);
                // Continue even if tiers fail - class is already created
            }
        }

        // Create discount codes if provided
        if (discountCodes && Array.isArray(discountCodes) && discountCodes.length > 0) {
            const codesToInsert = discountCodes.map((code: any) => ({
                class_id: newClass.id,
                code: code.code.toUpperCase(),
                type: code.type,
                value: code.value,
                description: code.description || null,
                expiry_date: code.expiryDate || null,
                usage_limit: code.usageLimit || 0,
                is_active: true
            }));

            const { error: codesError } = await supabaseAdmin
                .from("class_discount_codes")
                .insert(codesToInsert);

            if (codesError) {
                console.error("Error creating discount codes", codesError);
                // Continue even if codes fail - class is already created
            }
        }

        // Create images if provided
        if (images && Array.isArray(images) && images.length > 0) {
            const imagesToInsert = images.map((url: string, index: number) => ({
                class_id: newClass.id,
                url,
                alt_text: `Class image ${index + 1}`,
                is_main: index === 0 && !thumbnail
            }));

            const { error: imagesError } = await supabaseAdmin
                .from("class_images")
                .insert(imagesToInsert);

            if (imagesError) {
                console.error("Error creating images", imagesError);
                // Continue even if images fail - class is already created
            }
        }

        // Fetch complete class data with relations
        const { data: completeClass, error: fetchError } = await supabaseAdmin
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

        if (fetchError) {
            console.error("Error fetching complete class", fetchError);
            // Return what we have
            return NextResponse.json({ class: newClass });
        }

        return NextResponse.json({ class: completeClass }, { status: 201 });
    } catch (error: any) {
        console.error("Error in POST /api/admin/studios/[studioId]/classes", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

