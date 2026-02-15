// app/api/admin/studios/[studioId]/classes/[classId]/discount-codes/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";
import { assertStudioAdmin } from "@/lib/server/studios";

// GET /api/admin/studios/[studioId]/classes/[classId]/discount-codes
// Get all discount codes for a class
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

        const { data: discountCodes, error } = await supabaseAdmin
            .from("class_discount_codes")
            .select("*")
            .eq("class_id", params.classId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching discount codes", error);
            return NextResponse.json(
                { error: "Failed to load discount codes" },
                { status: 500 }
            );
        }

        // Transform data for frontend
        const transformedCodes =
            discountCodes?.map((code: any) => ({
                id: code.id,
                code: code.code,
                type: code.type,
                value: code.value,
                description: code.description || "",
                expiryDate: code.expiry_date || null,
                usageLimit: code.usage_limit || 0,
                usageCount: code.usage_count || 0,
                isActive: code.is_active
            })) || [];

        return NextResponse.json({ discountCodes: transformedCodes });
    } catch (error: any) {
        console.error(
            "Error in GET /api/admin/studios/[studioId]/classes/[classId]/discount-codes",
            error
        );
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

// POST /api/admin/studios/[studioId]/classes/[classId]/discount-codes
// Add discount code
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
        const { code, type, value, description, expiryDate, usageLimit, isActive } = body;

        if (!code || !type || value === undefined) {
            return NextResponse.json(
                { error: "code, type, and value are required" },
                { status: 400 }
            );
        }

        if (type === "percentage" && (value < 0 || value > 100)) {
            return NextResponse.json(
                { error: "Percentage value must be between 0 and 100" },
                { status: 400 }
            );
        }

        if (type === "fixed" && value < 0) {
            return NextResponse.json(
                { error: "Fixed value must be greater than or equal to 0" },
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

        // Check if code already exists for this class
        const { data: existingCode, error: checkError } = await supabaseAdmin
            .from("class_discount_codes")
            .select("id")
            .eq("class_id", params.classId)
            .eq("code", code.toUpperCase())
            .maybeSingle();

        if (checkError) {
            console.error("Error checking existing code", checkError);
            return NextResponse.json(
                { error: "Failed to check existing code" },
                { status: 500 }
            );
        }

        if (existingCode) {
            return NextResponse.json(
                { error: "Discount code already exists for this class" },
                { status: 400 }
            );
        }

        // Create discount code
        const { data: discountCode, error: insertError } = await supabaseAdmin
            .from("class_discount_codes")
            .insert({
                class_id: params.classId,
                code: code.toUpperCase(),
                type,
                value,
                description: description || null,
                expiry_date: expiryDate || null,
                usage_limit: usageLimit || 0,
                usage_count: 0,
                is_active: isActive !== undefined ? isActive : true
            })
            .select("*")
            .single();

        if (insertError) {
            console.error("Error creating discount code", insertError);
            return NextResponse.json(
                { error: "Failed to create discount code" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                discountCode: {
                    id: discountCode.id,
                    code: discountCode.code,
                    type: discountCode.type,
                    value: discountCode.value,
                    description: discountCode.description || "",
                    expiryDate: discountCode.expiry_date || null,
                    usageLimit: discountCode.usage_limit || 0,
                    usageCount: discountCode.usage_count || 0,
                    isActive: discountCode.is_active
                }
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error(
            "Error in POST /api/admin/studios/[studioId]/classes/[classId]/discount-codes",
            error
        );
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

