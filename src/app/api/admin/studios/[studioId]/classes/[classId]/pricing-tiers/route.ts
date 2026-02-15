// app/api/admin/studios/[studioId]/classes/[classId]/pricing-tiers/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";
import { assertStudioAdmin } from "@/lib/server/studios";

// GET /api/admin/studios/[studioId]/classes/[classId]/pricing-tiers
// Get all pricing tiers for a class
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
            .select("id")
            .eq("id", params.classId)
            .eq("studio_id", params.studioId)
            .single();

        if (classError || !classData) {
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
        }

        const { data: pricingTiers, error } = await supabaseAdmin
            .from("class_pricing_tiers")
            .select("*")
            .eq("class_id", params.classId)
            .order("is_default", { ascending: false })
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Error fetching pricing tiers", error);
            return NextResponse.json(
                { error: "Failed to load pricing tiers" },
                { status: 500 }
            );
        }

        // Transform data for frontend
        const transformedTiers =
            pricingTiers?.map((tier: any) => ({
                id: tier.id,
                name: tier.name,
                price: tier.price_cents / 100,
                priceCents: tier.price_cents,
                description: tier.description || "",
                isDefault: tier.is_default,
                isActive: tier.is_active,
                enrollmentCount: tier.enrollment_count || 0
            })) || [];

        return NextResponse.json({ pricingTiers: transformedTiers });
    } catch (error: any) {
        console.error(
            "Error in GET /api/admin/studios/[studioId]/classes/[classId]/pricing-tiers",
            error
        );
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

// POST /api/admin/studios/[studioId]/classes/[classId]/pricing-tiers
// Add pricing tier to class
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
        const { name, price, priceCents, description, isDefault, isActive } = body;

        if (!name) {
            return NextResponse.json({ error: "name is required" }, { status: 400 });
        }

        const priceInCents = priceCents || Math.round((price || 0) * 100);

        if (priceInCents <= 0) {
            return NextResponse.json(
                { error: "price must be greater than 0" },
                { status: 400 }
            );
        }

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

        // If this is set as default, unset other defaults
        if (isDefault) {
            await supabaseAdmin
                .from("class_pricing_tiers")
                .update({ is_default: false })
                .eq("class_id", params.classId);
        }

        // Create pricing tier
        const { data: pricingTier, error: insertError } = await supabaseAdmin
            .from("class_pricing_tiers")
            .insert({
                class_id: params.classId,
                name,
                price_cents: priceInCents,
                description: description || null,
                is_default: isDefault || false,
                is_active: isActive !== undefined ? isActive : true,
                enrollment_count: 0
            })
            .select("*")
            .single();

        if (insertError) {
            console.error("Error creating pricing tier", insertError);
            return NextResponse.json(
                { error: "Failed to create pricing tier" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                pricingTier: {
                    id: pricingTier.id,
                    name: pricingTier.name,
                    price: pricingTier.price_cents / 100,
                    priceCents: pricingTier.price_cents,
                    description: pricingTier.description || "",
                    isDefault: pricingTier.is_default,
                    isActive: pricingTier.is_active,
                    enrollmentCount: pricingTier.enrollment_count || 0
                }
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error(
            "Error in POST /api/admin/studios/[studioId]/classes/[classId]/pricing-tiers",
            error
        );
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

