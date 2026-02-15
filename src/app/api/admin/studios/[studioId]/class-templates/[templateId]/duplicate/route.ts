// app/api/admin/studios/[studioId]/class-templates/[templateId]/duplicate/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";
import { assertStudioAdmin } from "@/lib/server/studios";

// POST /api/admin/studios/[studioId]/class-templates/[templateId]/duplicate
// Duplicate a template
export async function POST(
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
        const newName = body.name; // Optional new name

        // Fetch original template
        const { data: originalTemplate, error: fetchError } = await supabaseAdmin
            .from("class_templates")
            .select("*")
            .eq("id", params.templateId)
            .eq("studio_id", params.studioId)
            .single();

        if (fetchError || !originalTemplate) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        // Create new template based on original
        const { data: newTemplate, error: createError } = await supabaseAdmin
            .from("class_templates")
            .insert({
                studio_id: originalTemplate.studio_id,
                name: newName || `${originalTemplate.name} (Copy)`,
                description: originalTemplate.description,
                category: originalTemplate.category,
                level: originalTemplate.level,
                duration: originalTemplate.duration,
                capacity: originalTemplate.capacity,
                materials: originalTemplate.materials,
                prerequisites: originalTemplate.prerequisites,
                what_you_learn: originalTemplate.what_you_learn || [],
                images: originalTemplate.images || [],
                thumbnail_url: originalTemplate.thumbnail_url,
                is_public: false, // Duplicated templates are private by default
                base_template_id: originalTemplate.id, // Link to original
                version: "1.0",
                usage_count: 0,
                created_by: user.id
            })
            .select("*")
            .single();

        if (createError || !newTemplate) {
            console.error("Error creating duplicated template", createError);
            return NextResponse.json(
                { error: "Failed to duplicate template" },
                { status: 500 }
            );
        }

        // Duplicate pricing tiers
        const { data: originalTiers, error: tiersError } = await supabaseAdmin
            .from("template_pricing_tiers")
            .select("*")
            .eq("template_id", params.templateId);

        if (!tiersError && originalTiers && originalTiers.length > 0) {
            const newTiers = originalTiers.map((tier) => ({
                template_id: newTemplate.id,
                name: tier.name,
                price_cents: tier.price_cents,
                description: tier.description,
                is_default: tier.is_default
            }));

            await supabaseAdmin.from("template_pricing_tiers").insert(newTiers);
        }

        // Duplicate discount codes
        const { data: originalCodes, error: codesError } = await supabaseAdmin
            .from("template_discount_codes")
            .select("*")
            .eq("template_id", params.templateId);

        if (!codesError && originalCodes && originalCodes.length > 0) {
            const newCodes = originalCodes.map((code) => ({
                template_id: newTemplate.id,
                code: code.code,
                type: code.type,
                value: code.value,
                description: code.description,
                expiry_date: code.expiry_date,
                usage_limit: code.usage_limit
            }));

            await supabaseAdmin.from("template_discount_codes").insert(newCodes);
        }

        return NextResponse.json({ template: newTemplate }, { status: 201 });
    } catch (error: any) {
        console.error(
            "Error in POST /api/admin/studios/[studioId]/class-templates/[templateId]/duplicate",
            error
        );
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

