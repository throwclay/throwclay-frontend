// app/api/admin/studios/[studioId]/class-templates/[templateId]/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";
import { assertStudioAdmin } from "@/lib/server/studios";

// GET /api/admin/studios/[studioId]/class-templates/[templateId]
// Get a single template
export async function GET(
    req: Request,
    { params }: { params: { studioId: string; templateId: string } }
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

        // Fetch template
        const { data: template, error: templateError } = await supabaseAdmin
            .from("class_templates")
            .select(
                `
                *,
                created_by:created_by (
                    id,
                    name
                )
            `
            )
            .eq("id", params.templateId)
            .eq("studio_id", params.studioId)
            .single();

        if (templateError || !template) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        // Fetch pricing tiers and discount codes
        const [tiersResult, codesResult] = await Promise.all([
            supabaseAdmin
                .from("template_pricing_tiers")
                .select("*")
                .eq("template_id", params.templateId),
            supabaseAdmin
                .from("template_discount_codes")
                .select("*")
                .eq("template_id", params.templateId)
        ]);

        const createdBy = Array.isArray(template.created_by)
            ? template.created_by[0]
            : template.created_by;

        return NextResponse.json({
            template: {
                id: template.id,
                name: template.name,
                description: template.description || "",
                category: template.category || "",
                level: template.level || "",
                duration: template.duration || "",
                capacity: template.capacity || 0,
                materials: template.materials || "",
                prerequisites: template.prerequisites || "",
                whatYouLearn: template.what_you_learn || [],
                pricingTiers:
                    tiersResult.data?.map((tier: any) => ({
                        name: tier.name,
                        price: tier.price_cents / 100,
                        description: tier.description || "",
                        isDefault: tier.is_default
                    })) || [],
                discountCodes:
                    codesResult.data?.map((code: any) => ({
                        code: code.code,
                        type: code.type,
                        value: code.value,
                        description: code.description || ""
                    })) || [],
                images: template.images || [],
                thumbnail: template.thumbnail_url || "",
                createdBy: createdBy?.name || "",
                createdDate: template.created_at,
                lastModified: template.last_modified || template.updated_at,
                version: template.version || "1.0",
                isPublic: template.is_public,
                usageCount: template.usage_count || 0
            }
        });
    } catch (error: any) {
        console.error(
            "Error in GET /api/admin/studios/[studioId]/class-templates/[templateId]",
            error
        );
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

// PATCH /api/admin/studios/[studioId]/class-templates/[templateId]
// Update template
export async function PATCH(
    req: Request,
    { params }: { params: { studioId: string; templateId: string } }
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

        // Build update object
        const updateData: any = {};
        if (body.name !== undefined) updateData.name = body.name;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.category !== undefined) updateData.category = body.category;
        if (body.level !== undefined) updateData.level = body.level;
        if (body.duration !== undefined) updateData.duration = body.duration;
        if (body.capacity !== undefined) updateData.capacity = parseInt(body.capacity);
        if (body.materials !== undefined) updateData.materials = body.materials;
        if (body.prerequisites !== undefined) updateData.prerequisites = body.prerequisites;
        if (body.whatYouLearn !== undefined) updateData.what_you_learn = body.whatYouLearn;
        if (body.images !== undefined) updateData.images = body.images;
        if (body.thumbnail !== undefined) updateData.thumbnail_url = body.thumbnail;
        if (body.isPublic !== undefined) updateData.is_public = body.isPublic;
        if (body.version !== undefined) updateData.version = body.version;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 });
        }

        const { data: updatedTemplate, error: updateError } = await supabaseAdmin
            .from("class_templates")
            .update(updateData)
            .eq("id", params.templateId)
            .eq("studio_id", params.studioId)
            .select("*")
            .single();

        if (updateError || !updatedTemplate) {
            console.error("Error updating template", updateError);
            return NextResponse.json(
                { error: "Failed to update template" },
                { status: 500 }
            );
        }

        return NextResponse.json({ template: updatedTemplate });
    } catch (error: any) {
        console.error(
            "Error in PATCH /api/admin/studios/[studioId]/class-templates/[templateId]",
            error
        );
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

// DELETE /api/admin/studios/[studioId]/class-templates/[templateId]
// Delete template
export async function DELETE(
    req: Request,
    { params }: { params: { studioId: string; templateId: string } }
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

        // Check if template has been used
        const { data: templateData, error: templateError } = await supabaseAdmin
            .from("class_templates")
            .select("usage_count")
            .eq("id", params.templateId)
            .eq("studio_id", params.studioId)
            .single();

        if (templateError || !templateData) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        // Delete template (cascade will handle related records)
        const { error: deleteError } = await supabaseAdmin
            .from("class_templates")
            .delete()
            .eq("id", params.templateId)
            .eq("studio_id", params.studioId);

        if (deleteError) {
            console.error("Error deleting template", deleteError);
            return NextResponse.json(
                { error: "Failed to delete template" },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: "Template deleted successfully" });
    } catch (error: any) {
        console.error(
            "Error in DELETE /api/admin/studios/[studioId]/class-templates/[templateId]",
            error
        );
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

