// app/api/admin/studios/[studioId]/classes/[classId]/pricing-tiers/[tierId]/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";
import { assertStudioAdmin } from "@/lib/server/studios";

// PATCH /api/admin/studios/[studioId]/classes/[classId]/pricing-tiers/[tierId]
// Update pricing tier
export async function PATCH(
    req: Request,
    {
        params
    }: {
        params: { studioId: string; classId: string; tierId: string };
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

        // Verify tier belongs to class
        const { data: tierData, error: tierError } = await supabaseAdmin
            .from("class_pricing_tiers")
            .select("id")
            .eq("id", params.tierId)
            .eq("class_id", params.classId)
            .single();

        if (tierError || !tierData) {
            return NextResponse.json({ error: "Pricing tier not found" }, { status: 404 });
        }

        const body = await req.json().catch(() => ({}));
        const { name, price, priceCents, description, isDefault, isActive } = body;

        // Build update object
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (priceCents !== undefined) {
            updateData.price_cents = priceCents;
        } else if (price !== undefined) {
            updateData.price_cents = Math.round(price * 100);
        }
        if (description !== undefined) updateData.description = description;
        if (isActive !== undefined) updateData.is_active = isActive;

        // Handle default tier logic
        if (isDefault === true) {
            // Unset other defaults
            await supabaseAdmin
                .from("class_pricing_tiers")
                .update({ is_default: false })
                .eq("class_id", params.classId)
                .neq("id", params.tierId);
            updateData.is_default = true;
        } else if (isDefault === false) {
            updateData.is_default = false;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 });
        }

        const { data: updatedTier, error: updateError } = await supabaseAdmin
            .from("class_pricing_tiers")
            .update(updateData)
            .eq("id", params.tierId)
            .eq("class_id", params.classId)
            .select("*")
            .single();

        if (updateError || !updatedTier) {
            console.error("Error updating pricing tier", updateError);
            return NextResponse.json(
                { error: "Failed to update pricing tier" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            pricingTier: {
                id: updatedTier.id,
                name: updatedTier.name,
                price: updatedTier.price_cents / 100,
                priceCents: updatedTier.price_cents,
                description: updatedTier.description || "",
                isDefault: updatedTier.is_default,
                isActive: updatedTier.is_active,
                enrollmentCount: updatedTier.enrollment_count || 0
            }
        });
    } catch (error: any) {
        console.error(
            "Error in PATCH /api/admin/studios/[studioId]/classes/[classId]/pricing-tiers/[tierId]",
            error
        );
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

// DELETE /api/admin/studios/[studioId]/classes/[classId]/pricing-tiers/[tierId]
// Delete pricing tier
export async function DELETE(
    req: Request,
    {
        params
    }: {
        params: { studioId: string; classId: string; tierId: string };
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

        // Check if tier has enrollments
        const { data: enrollments, error: enrollmentCheckError } = await supabaseAdmin
            .from("class_enrollments")
            .select("id")
            .eq("pricing_tier_id", params.tierId)
            .limit(1);

        if (enrollmentCheckError) {
            console.error("Error checking enrollments", enrollmentCheckError);
            return NextResponse.json(
                { error: "Failed to check tier usage" },
                { status: 500 }
            );
        }

        if (enrollments && enrollments.length > 0) {
            return NextResponse.json(
                {
                    error:
                        "Cannot delete pricing tier that has enrollments. Set it to inactive instead."
                },
                { status: 400 }
            );
        }

        // Delete tier
        const { error: deleteError } = await supabaseAdmin
            .from("class_pricing_tiers")
            .delete()
            .eq("id", params.tierId)
            .eq("class_id", params.classId);

        if (deleteError) {
            console.error("Error deleting pricing tier", deleteError);
            return NextResponse.json(
                { error: "Failed to delete pricing tier" },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: "Pricing tier deleted successfully" });
    } catch (error: any) {
        console.error(
            "Error in DELETE /api/admin/studios/[studioId]/classes/[classId]/pricing-tiers/[tierId]",
            error
        );
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

