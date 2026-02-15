// app/api/admin/studios/[studioId]/classes/[classId]/discount-codes/[codeId]/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";
import { assertStudioAdmin } from "@/lib/server/studios";

// PATCH /api/admin/studios/[studioId]/classes/[classId]/discount-codes/[codeId]
// Update discount code
export async function PATCH(
    req: Request,
    {
        params
    }: {
        params: { studioId: string; classId: string; codeId: string };
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

        // Verify code belongs to class
        const { data: codeData, error: codeError } = await supabaseAdmin
            .from("class_discount_codes")
            .select("id")
            .eq("id", params.codeId)
            .eq("class_id", params.classId)
            .single();

        if (codeError || !codeData) {
            return NextResponse.json({ error: "Discount code not found" }, { status: 404 });
        }

        const body = await req.json().catch(() => ({}));
        const { code, type, value, description, expiryDate, usageLimit, isActive } = body;

        // Build update object
        const updateData: any = {};
        if (code !== undefined) {
            // Check if new code already exists (if different from current)
            if (code.toUpperCase() !== codeData.code) {
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
            }
            updateData.code = code.toUpperCase();
        }
        if (type !== undefined) updateData.type = type;
        if (value !== undefined) {
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
            updateData.value = value;
        }
        if (description !== undefined) updateData.description = description;
        if (expiryDate !== undefined) updateData.expiry_date = expiryDate || null;
        if (usageLimit !== undefined) updateData.usage_limit = usageLimit;
        if (isActive !== undefined) updateData.is_active = isActive;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 });
        }

        const { data: updatedCode, error: updateError } = await supabaseAdmin
            .from("class_discount_codes")
            .update(updateData)
            .eq("id", params.codeId)
            .eq("class_id", params.classId)
            .select("*")
            .single();

        if (updateError || !updatedCode) {
            console.error("Error updating discount code", updateError);
            return NextResponse.json(
                { error: "Failed to update discount code" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            discountCode: {
                id: updatedCode.id,
                code: updatedCode.code,
                type: updatedCode.type,
                value: updatedCode.value,
                description: updatedCode.description || "",
                expiryDate: updatedCode.expiry_date || null,
                usageLimit: updatedCode.usage_limit || 0,
                usageCount: updatedCode.usage_count || 0,
                isActive: updatedCode.is_active
            }
        });
    } catch (error: any) {
        console.error(
            "Error in PATCH /api/admin/studios/[studioId]/classes/[classId]/discount-codes/[codeId]",
            error
        );
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

// DELETE /api/admin/studios/[studioId]/classes/[classId]/discount-codes/[codeId]
// Delete discount code
export async function DELETE(
    req: Request,
    {
        params
    }: {
        params: { studioId: string; classId: string; codeId: string };
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

        // Check if code has been used
        const { data: codeData, error: codeCheckError } = await supabaseAdmin
            .from("class_discount_codes")
            .select("usage_count")
            .eq("id", params.codeId)
            .eq("class_id", params.classId)
            .single();

        if (codeCheckError || !codeData) {
            return NextResponse.json({ error: "Discount code not found" }, { status: 404 });
        }

        if (codeData.usage_count > 0) {
            return NextResponse.json(
                {
                    error:
                        "Cannot delete discount code that has been used. Set it to inactive instead."
                },
                { status: 400 }
            );
        }

        // Delete code
        const { error: deleteError } = await supabaseAdmin
            .from("class_discount_codes")
            .delete()
            .eq("id", params.codeId)
            .eq("class_id", params.classId);

        if (deleteError) {
            console.error("Error deleting discount code", deleteError);
            return NextResponse.json(
                { error: "Failed to delete discount code" },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: "Discount code deleted successfully" });
    } catch (error: any) {
        console.error(
            "Error in DELETE /api/admin/studios/[studioId]/classes/[classId]/discount-codes/[codeId]",
            error
        );
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

