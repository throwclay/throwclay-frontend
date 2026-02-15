// app/api/admin/studios/[studioId]/classes/[classId]/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";
import { assertStudioAdmin } from "@/lib/server/studios";

// GET /api/admin/studios/[studioId]/classes/[classId]
// Get a single class with all related data
export async function GET(
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

        // Fetch class with relations (must belong to studio)
        const { data: classData, error: classError } = await supabaseAdmin
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
                ),
                location:location_id (
                    id,
                    name
                )
            `
            )
            .eq("id", params.classId)
            .eq("studio_id", params.studioId)
            .single();

        if (classError || !classData) {
            console.error("Error fetching class", classError);
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
        }

        // Fetch enrollments
        const { data: enrollmentsRaw, error: enrollmentsError } = await supabaseAdmin
            .from("class_enrollments")
            .select(
                `
                *,
                student:student_id (
                    id,
                    name,
                    email,
                    phone
                ),
                pricing_tier:pricing_tier_id (
                    id,
                    name,
                    price_cents
                ),
                discount_code:discount_code_id (
                    id,
                    code,
                    type,
                    value
                )
            `
            )
            .eq("class_id", params.classId)
            .order("enrolled_date", { ascending: false });

        // Transform enrollments for frontend
        const enrollments = enrollmentsRaw?.map((enrollment: any) => ({
            id: enrollment.id,
            classId: enrollment.class_id,
            studentId: enrollment.student_id,
            studentName: enrollment.student?.name || "",
            studentEmail: enrollment.student?.email || "",
            enrolledDate: enrollment.enrolled_date,
            status: enrollment.status,
            paymentStatus: enrollment.payment_status,
            phone: enrollment.student?.phone || enrollment.phone || "",
            emergencyContact: enrollment.emergency_contact || "",
            pricingTierId: enrollment.pricing_tier_id || null,
            pricingTier: enrollment.pricing_tier
                ? {
                      id: enrollment.pricing_tier.id,
                      name: enrollment.pricing_tier.name,
                      price: enrollment.pricing_tier.price_cents / 100
                  }
                : null,
            discountCodeId: enrollment.discount_code_id || null,
            discountApplied: enrollment.discount_code
                ? {
                      id: enrollment.discount_code.id,
                      code: enrollment.discount_code.code,
                      type: enrollment.discount_code.type,
                      value: enrollment.discount_code.value
                  }
                : null,
            amountPaid: enrollment.amount_paid_cents ? enrollment.amount_paid_cents / 100 : 0
        })) || [];

        // Fetch waitlist
        const { data: waitlistRaw, error: waitlistError } = await supabaseAdmin
            .from("class_waitlist")
            .select(
                `
                *,
                student:student_id (
                    id,
                    name,
                    email
                )
            `
            )
            .eq("class_id", params.classId)
            .order("position", { ascending: true });

        // Transform waitlist for frontend
        const waitlist = waitlistRaw?.map((entry: any) => ({
            id: entry.id,
            classId: entry.class_id,
            studentId: entry.student_id,
            studentName: entry.student?.name || "",
            studentEmail: entry.student?.email || "",
            waitlistedDate: entry.waitlisted_date,
            position: entry.position,
            notificationsEnabled: entry.notifications_enabled || false,
            createdAt: entry.created_at,
            updatedAt: entry.updated_at
        })) || [];

        // Fetch pricing tiers
        const { data: pricingTiers, error: pricingTiersError } = await supabaseAdmin
            .from("class_pricing_tiers")
            .select("*")
            .eq("class_id", params.classId)
            .order("is_default", { ascending: false });

        // Fetch discount codes
        const { data: discountCodes, error: discountCodesError } = await supabaseAdmin
            .from("class_discount_codes")
            .select("*")
            .eq("class_id", params.classId)
            .order("created_at", { ascending: false });

        // Fetch images
        const { data: images, error: imagesError } = await supabaseAdmin
            .from("class_images")
            .select("*")
            .eq("class_id", params.classId)
            .order("is_main", { ascending: false })
            .order("created_at", { ascending: true });

        // Fetch reviews
        const { data: reviews, error: reviewsError } = await supabaseAdmin
            .from("class_reviews")
            .select(
                `
                *,
                student:student_id (
                    id,
                    name,
                    email
                )
            `
            )
            .eq("class_id", params.classId)
            .order("created_at", { ascending: false });

        // Fetch attendance summary
        const { data: attendanceRaw, error: attendanceError } = await supabaseAdmin
            .from("class_attendance")
            .select(
                `
                *,
                student:student_id (
                    id,
                    name
                ),
                recorded_by:recorded_by (
                    id,
                    name
                )
            `
            )
            .eq("class_id", params.classId)
            .order("session_date", { ascending: false })
            .limit(100); // Limit to recent attendance

        // Transform attendance for frontend
        const attendance = attendanceRaw?.map((record: any) => ({
            id: record.id,
            classId: record.class_id,
            studentId: record.student_id,
            studentName: record.student?.name || "",
            sessionDate: record.session_date,
            status: record.status,
            notes: record.notes || null,
            recordedBy: record.recorded_by?.id || null,
            createdAt: record.created_at,
            updatedAt: record.updated_at
        })) || [];

        if (enrollmentsError) console.error("Error fetching enrollments", enrollmentsError);
        if (waitlistError) console.error("Error fetching waitlist", waitlistError);
        if (pricingTiersError) console.error("Error fetching pricing tiers", pricingTiersError);
        if (discountCodesError) console.error("Error fetching discount codes", discountCodesError);
        if (imagesError) console.error("Error fetching images", imagesError);
        if (reviewsError) console.error("Error fetching reviews", reviewsError);
        if (attendanceError) console.error("Error fetching attendance", attendanceError);

        return NextResponse.json({
            class: classData,
            enrollments: enrollments || [],
            waitlist: waitlist || [],
            pricingTiers: pricingTiers || [],
            discountCodes: discountCodes || [],
            images: images || [],
            reviews: reviews || [],
            attendance: attendance || []
        });
    } catch (error: any) {
        console.error("Error in GET /api/admin/studios/[studioId]/classes/[classId]", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

// PATCH /api/admin/studios/[studioId]/classes/[classId]
// Update a class
export async function PATCH(
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

        // Build update object (only include fields that are provided)
        const updateData: any = {};

        if (body.name !== undefined) updateData.name = body.name;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.instructorId !== undefined) updateData.instructor_id = body.instructorId;
        if (body.level !== undefined) updateData.level = body.level;
        if (body.capacity !== undefined) updateData.capacity = parseInt(body.capacity);
        if (body.startDate !== undefined) updateData.start_date = body.startDate;
        if (body.endDate !== undefined) updateData.end_date = body.endDate;
        if (body.schedule !== undefined) updateData.schedule = body.schedule;
        if (body.location !== undefined) updateData.location = body.location;
        if (body.locationId !== undefined) {
            // Validate that new location belongs to studio
            const { data: locationData, error: locationError } = await supabaseAdmin
                .from("studio_locations")
                .select("id")
                .eq("id", body.locationId)
                .eq("studio_id", params.studioId)
                .single();

            if (locationError || !locationData) {
                return NextResponse.json(
                    { error: "Location not found or does not belong to this studio" },
                    { status: 400 }
                );
            }
            updateData.location_id = body.locationId;
        }
        if (body.materials !== undefined) updateData.materials = body.materials;
        if (body.prerequisites !== undefined) updateData.prerequisites = body.prerequisites;
        if (body.status !== undefined) updateData.status = body.status;
        if (body.thumbnail !== undefined) updateData.thumbnail_url = body.thumbnail;
        if (body.totalSessions !== undefined)
            updateData.total_sessions = parseInt(body.totalSessions);
        if (body.sessionsCompleted !== undefined)
            updateData.sessions_completed = parseInt(body.sessionsCompleted);

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 });
        }

        const { data: updatedClass, error: updateError } = await supabaseAdmin
            .from("studio_classes")
            .update(updateData)
            .eq("id", params.classId)
            .eq("studio_id", params.studioId)
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
            .single();

        if (updateError || !updatedClass) {
            console.error("Error updating class", updateError);
            return NextResponse.json({ error: "Failed to update class" }, { status: 500 });
        }

        return NextResponse.json({ class: updatedClass });
    } catch (error: any) {
        console.error("Error in PATCH /api/admin/studios/[studioId]/classes/[classId]", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

// DELETE /api/admin/studios/[studioId]/classes/[classId]
// Delete a class (soft delete by setting status to 'cancelled')
export async function DELETE(
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

        // Check if class exists and belongs to studio
        const { data: classData, error: checkError } = await supabaseAdmin
            .from("studio_classes")
            .select("id, status")
            .eq("id", params.classId)
            .eq("studio_id", params.studioId)
            .single();

        if (checkError || !classData) {
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
        }

        // Soft delete by setting status to cancelled
        // If you want hard delete, use: .delete() instead
        const { error: deleteError } = await supabaseAdmin
            .from("studio_classes")
            .update({ status: "cancelled" })
            .eq("id", params.classId)
            .eq("studio_id", params.studioId);

        if (deleteError) {
            console.error("Error deleting class", deleteError);
            return NextResponse.json({ error: "Failed to delete class" }, { status: 500 });
        }

        return NextResponse.json({ message: "Class deleted successfully" });
    } catch (error: any) {
        console.error("Error in DELETE /api/admin/studios/[studioId]/classes/[classId]", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

