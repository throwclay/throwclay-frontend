// app/api/admin/studios/[studioId]/classes/[classId]/enrollments/[enrollmentId]/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";
import { assertStudioAdmin } from "@/lib/server/studios";

// PATCH /api/admin/studios/[studioId]/classes/[classId]/enrollments/[enrollmentId]
// Update enrollment (status, payment status, etc.)
export async function PATCH(
    req: Request,
    {
        params
    }: {
        params: { studioId: string; classId: string; enrollmentId: string };
    }
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

        // Verify class belongs to studio
        const { data: classData, error: classError } = await supabaseAdmin
            .from("studio_classes")
            .select("id")
            .eq("id", params.classId)
            .eq("studio_id", params.studioId)
            .single();

        if (classError || !classData) {
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
        }

        const body = await req.json().catch(() => ({}));

        // Build update object
        const updateData: any = {};
        if (body.status !== undefined) updateData.status = body.status;
        if (body.paymentStatus !== undefined) updateData.payment_status = body.paymentStatus;
        if (body.amountPaid !== undefined)
            updateData.amount_paid_cents = Math.round(body.amountPaid * 100);
        if (body.emergencyContact !== undefined)
            updateData.emergency_contact = body.emergencyContact;
        if (body.pricingTierId !== undefined) updateData.pricing_tier_id = body.pricingTierId;
        if (body.discountCodeId !== undefined) updateData.discount_code_id = body.discountCodeId;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 });
        }

        const { data: enrollment, error } = await supabaseAdmin
            .from("class_enrollments")
            .update(updateData)
            .eq("id", params.enrollmentId)
            .eq("class_id", params.classId)
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
                    price_cents,
                    description
                ),
                discount_code:discount_code_id (
                    id,
                    code,
                    type,
                    value,
                    description
                )
            `
            )
            .single();

        if (error || !enrollment) {
            console.error("Error updating enrollment", error);
            return NextResponse.json({ error: "Failed to update enrollment" }, { status: 500 });
        }

        return NextResponse.json({ enrollment });
    } catch (error: any) {
        console.error(
            "Error in PATCH /api/admin/studios/[studioId]/classes/[classId]/enrollments/[enrollmentId]",
            error
        );
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

// DELETE /api/admin/studios/[studioId]/classes/[classId]/enrollments/[enrollmentId]
// Remove student from class
export async function DELETE(
    req: Request,
    {
        params
    }: {
        params: { studioId: string; classId: string; enrollmentId: string };
    }
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

        // Verify class belongs to studio
        const { data: classData, error: classError } = await supabaseAdmin
            .from("studio_classes")
            .select("id")
            .eq("id", params.classId)
            .eq("studio_id", params.studioId)
            .single();

        if (classError || !classData) {
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
        }

        // Get enrollment to check discount code usage
        const { data: enrollment, error: fetchError } = await supabaseAdmin
            .from("class_enrollments")
            .select("discount_code_id")
            .eq("id", params.enrollmentId)
            .eq("class_id", params.classId)
            .single();

        if (fetchError || !enrollment) {
            return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
        }

        // Delete enrollment
        const { error: deleteError } = await supabaseAdmin
            .from("class_enrollments")
            .delete()
            .eq("id", params.enrollmentId)
            .eq("class_id", params.classId);

        if (deleteError) {
            console.error("Error deleting enrollment", deleteError);
            return NextResponse.json({ error: "Failed to remove enrollment" }, { status: 500 });
        }

        // Decrement discount code usage if applicable
        if (enrollment.discount_code_id) {
            const { data: discountData } = await supabaseAdmin
                .from("class_discount_codes")
                .select("usage_count")
                .eq("id", enrollment.discount_code_id)
                .single();

            if (discountData && discountData.usage_count > 0) {
                await supabaseAdmin
                    .from("class_discount_codes")
                    .update({ usage_count: discountData.usage_count - 1 })
                    .eq("id", enrollment.discount_code_id);
            }
        }

        return NextResponse.json({ message: "Enrollment removed successfully" });
    } catch (error: any) {
        console.error(
            "Error in DELETE /api/admin/studios/[studioId]/classes/[classId]/enrollments/[enrollmentId]",
            error
        );
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

