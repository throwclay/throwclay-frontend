// app/api/admin/studios/[studioId]/classes/[classId]/waitlist/[waitlistId]/promote/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";
import { assertStudioAdmin } from "@/lib/server/studios";

// POST /api/admin/studios/[studioId]/classes/[classId]/waitlist/[waitlistId]/promote
// Promote waitlist entry to enrollment
export async function POST(
    req: Request,
    {
        params
    }: {
        params: { studioId: string; classId: string; waitlistId: string };
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

        const body = await req.json().catch(() => ({}));
        const { pricingTierId, discountCode, emergencyContact } = body;

        // Verify class belongs to studio and check capacity
        const { data: classData, error: classError } = await supabaseAdmin
            .from("studio_classes")
            .select("id, capacity, enrolled_count")
            .eq("id", params.classId)
            .eq("studio_id", params.studioId)
            .single();

        if (classError || !classData) {
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
        }

        // Check capacity
        if (classData.enrolled_count >= classData.capacity) {
            return NextResponse.json(
                { error: "Class is at full capacity" },
                { status: 400 }
            );
        }

        // Get waitlist entry
        const { data: waitlistEntry, error: waitlistError } = await supabaseAdmin
            .from("class_waitlist")
            .select("student_id")
            .eq("id", params.waitlistId)
            .eq("class_id", params.classId)
            .single();

        if (waitlistError || !waitlistEntry) {
            return NextResponse.json({ error: "Waitlist entry not found" }, { status: 404 });
        }

        const studentId = waitlistEntry.student_id;

        // Check if already enrolled
        const { data: existingEnrollment, error: enrollmentCheckError } = await supabaseAdmin
            .from("class_enrollments")
            .select("id")
            .eq("class_id", params.classId)
            .eq("student_id", studentId)
            .maybeSingle();

        if (enrollmentCheckError) {
            console.error("Error checking enrollment", enrollmentCheckError);
            return NextResponse.json(
                { error: "Failed to check enrollment status" },
                { status: 500 }
            );
        }

        if (existingEnrollment) {
            // Remove from waitlist if already enrolled
            await supabaseAdmin
                .from("class_waitlist")
                .delete()
                .eq("id", params.waitlistId);
            return NextResponse.json(
                { error: "Student is already enrolled in this class" },
                { status: 400 }
            );
        }

        // Find discount code if provided
        let discountCodeId = null;
        if (discountCode) {
            const { data: discountCodeData, error: discountError } = await supabaseAdmin
                .from("class_discount_codes")
                .select("id, type, value, expiry_date, usage_limit, usage_count, is_active")
                .eq("class_id", params.classId)
                .eq("code", discountCode.toUpperCase())
                .single();

            if (!discountError && discountCodeData) {
                // Validate discount code
                if (!discountCodeData.is_active) {
                    return NextResponse.json(
                        { error: "Discount code is not active" },
                        { status: 400 }
                    );
                }

                if (
                    discountCodeData.expiry_date &&
                    new Date(discountCodeData.expiry_date) < new Date()
                ) {
                    return NextResponse.json(
                        { error: "Discount code has expired" },
                        { status: 400 }
                    );
                }

                if (
                    discountCodeData.usage_limit > 0 &&
                    discountCodeData.usage_count >= discountCodeData.usage_limit
                ) {
                    return NextResponse.json(
                        { error: "Discount code usage limit reached" },
                        { status: 400 }
                    );
                }

                discountCodeId = discountCodeData.id;
            }
        }

        // Get pricing tier to calculate amount
        let amountPaidCents = 0;
        if (pricingTierId) {
            const { data: pricingTier, error: tierError } = await supabaseAdmin
                .from("class_pricing_tiers")
                .select("price_cents")
                .eq("id", pricingTierId)
                .single();

            if (!tierError && pricingTier) {
                amountPaidCents = pricingTier.price_cents;

                // Apply discount if applicable
                if (discountCodeId) {
                    const { data: discountData } = await supabaseAdmin
                        .from("class_discount_codes")
                        .select("type, value")
                        .eq("id", discountCodeId)
                        .single();

                    if (discountData) {
                        if (discountData.type === "percentage") {
                            amountPaidCents = Math.round(
                                amountPaidCents * (1 - discountData.value / 100)
                            );
                        } else if (discountData.type === "fixed") {
                            amountPaidCents = Math.max(0, amountPaidCents - discountData.value);
                        }
                    }
                }
            }
        }

        // Create enrollment
        const { data: enrollment, error: enrollmentError } = await supabaseAdmin
            .from("class_enrollments")
            .insert({
                class_id: params.classId,
                student_id: studentId,
                pricing_tier_id: pricingTierId || null,
                discount_code_id: discountCodeId,
                emergency_contact: emergencyContact || null,
                amount_paid_cents: amountPaidCents,
                status: "active",
                payment_status: "pending"
            })
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

        if (enrollmentError) {
            console.error("Error creating enrollment", enrollmentError);
            return NextResponse.json(
                { error: "Failed to enroll student" },
                { status: 500 }
            );
        }

        // Update discount code usage count if used
        if (discountCodeId) {
            const { data: discountData } = await supabaseAdmin
                .from("class_discount_codes")
                .select("usage_count")
                .eq("id", discountCodeId)
                .single();

            if (discountData) {
                await supabaseAdmin
                    .from("class_discount_codes")
                    .update({ usage_count: (discountData.usage_count || 0) + 1 })
                    .eq("id", discountCodeId);
            }
        }

        // Remove from waitlist
        await supabaseAdmin.from("class_waitlist").delete().eq("id", params.waitlistId);

        return NextResponse.json({ enrollment }, { status: 201 });
    } catch (error: any) {
        console.error(
            "Error in POST /api/admin/studios/[studioId]/classes/[classId]/waitlist/[waitlistId]/promote",
            error
        );
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

