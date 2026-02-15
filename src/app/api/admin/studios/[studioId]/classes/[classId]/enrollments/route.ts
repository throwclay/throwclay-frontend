// app/api/admin/studios/[studioId]/classes/[classId]/enrollments/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";
import { assertStudioAdmin } from "@/lib/server/studios";

// GET /api/admin/studios/[studioId]/classes/[classId]/enrollments
// Get all enrollments for a class
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

        // Verify class belongs to studio
        const { data: classData, error: classError } = await supabaseAdmin
            .from("studio_classes")
            .select("id, capacity, enrolled_count")
            .eq("id", params.classId)
            .eq("studio_id", params.studioId)
            .single();

        if (classError || !classData) {
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
        }

        const { data: enrollments, error } = await supabaseAdmin
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
            .eq("class_id", params.classId)
            .order("enrolled_date", { ascending: false });

        if (error) {
            console.error("Error fetching enrollments", error);
            return NextResponse.json({ error: "Failed to load enrollments" }, { status: 500 });
        }

        // Transform data for frontend
        const transformedEnrollments =
            enrollments?.map((enrollment: any) => ({
                id: enrollment.id,
                studentId: enrollment.student_id,
                studentName: enrollment.student?.name || "",
                studentEmail: enrollment.student?.email || "",
                enrolledDate: enrollment.enrolled_date,
                status: enrollment.status,
                paymentStatus: enrollment.payment_status,
                phone: enrollment.student?.phone || "",
                emergencyContact: enrollment.emergency_contact || "",
                pricingTier: enrollment.pricing_tier
                    ? {
                          id: enrollment.pricing_tier.id,
                          name: enrollment.pricing_tier.name,
                          price: enrollment.pricing_tier.price_cents / 100
                      }
                    : null,
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

        return NextResponse.json({ enrollments: transformedEnrollments });
    } catch (error: any) {
        console.error(
            "Error in GET /api/admin/studios/[studioId]/classes/[classId]/enrollments",
            error
        );
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

// POST /api/admin/studios/[studioId]/classes/[classId]/enrollments
// Enroll a student in a class
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
        const { studentId, pricingTierId, discountCode, emergencyContact } = body;

        if (!studentId) {
            return NextResponse.json({ error: "studentId is required" }, { status: 400 });
        }

        // Verify class belongs to studio and check capacity
        const { data: classData, error: classError } = await supabaseAdmin
            .from("studio_classes")
            .select("id, capacity, enrolled_count, status")
            .eq("id", params.classId)
            .eq("studio_id", params.studioId)
            .single();

        if (classError || !classData) {
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
        }

        // Check if already enrolled
        const { data: existingEnrollment, error: checkError } = await supabaseAdmin
            .from("class_enrollments")
            .select("id")
            .eq("class_id", params.classId)
            .eq("student_id", studentId)
            .maybeSingle();

        if (checkError) {
            console.error("Error checking existing enrollment", checkError);
            return NextResponse.json(
                { error: "Failed to check existing enrollment" },
                { status: 500 }
            );
        }

        if (existingEnrollment) {
            return NextResponse.json(
                { error: "Student is already enrolled in this class" },
                { status: 400 }
            );
        }

        // Check capacity
        if (classData.enrolled_count >= classData.capacity) {
            return NextResponse.json(
                { error: "Class is at full capacity" },
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

        // Remove from waitlist if they were on it
        await supabaseAdmin.from("class_waitlist").delete().eq("class_id", params.classId).eq("student_id", studentId);

        return NextResponse.json({ enrollment }, { status: 201 });
    } catch (error: any) {
        console.error(
            "Error in POST /api/admin/studios/[studioId]/classes/[classId]/enrollments",
            error
        );
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

