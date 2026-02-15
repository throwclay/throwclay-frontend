// app/api/admin/studios/[studioId]/class-templates/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";
import { assertStudioAdmin } from "@/lib/server/studios";

// GET /api/admin/studios/[studioId]/class-templates
// List all templates for a studio
export async function GET(req: Request, { params }: { params: { studioId: string } }) {
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

        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");
        const search = searchParams.get("search");

        // Build query
        let query = supabaseAdmin
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
            .eq("studio_id", params.studioId)
            .order("created_at", { ascending: false });

        // Apply filters
        if (category && category !== "all") {
            query = query.eq("category", category);
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }

        const { data: templates, error } = await query;

        if (error) {
            console.error("Error fetching templates", error);
            return NextResponse.json({ error: "Failed to load templates" }, { status: 500 });
        }

        // Fetch pricing tiers and discount codes for each template
        const templatesWithDetails = await Promise.all(
            (templates || []).map(async (template: any) => {
                const [tiersResult, codesResult] = await Promise.all([
                    supabaseAdmin
                        .from("template_pricing_tiers")
                        .select("*")
                        .eq("template_id", template.id),
                    supabaseAdmin
                        .from("template_discount_codes")
                        .select("*")
                        .eq("template_id", template.id)
                ]);

                const createdBy = Array.isArray(template.created_by)
                    ? template.created_by[0]
                    : template.created_by;

                return {
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
                    usageCount: template.usage_count || 0,
                    tags: [] // Could add tags field to schema if needed
                };
            })
        );

        return NextResponse.json({ templates: templatesWithDetails });
    } catch (error: any) {
        console.error("Error in GET /api/admin/studios/[studioId]/class-templates", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

// POST /api/admin/studios/[studioId]/class-templates
// Create a new template
export async function POST(req: Request, { params }: { params: { studioId: string } }) {
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

        const {
            name,
            description,
            category,
            level,
            duration,
            capacity,
            materials,
            prerequisites,
            whatYouLearn,
            pricingTiers,
            discountCodes,
            images,
            thumbnail,
            isPublic,
            baseTemplateId
        } = body;

        if (!name) {
            return NextResponse.json({ error: "name is required" }, { status: 400 });
        }

        // Create template
        const { data: newTemplate, error: templateError } = await supabaseAdmin
            .from("class_templates")
            .insert({
                studio_id: params.studioId,
                name,
                description: description || null,
                category: category || null,
                level: level || null,
                duration: duration || null,
                capacity: capacity ? parseInt(capacity) : null,
                materials: materials || null,
                prerequisites: prerequisites || null,
                what_you_learn: whatYouLearn || [],
                images: images || [],
                thumbnail_url: thumbnail || null,
                is_public: isPublic || false,
                base_template_id: baseTemplateId || null,
                created_by: user.id
            })
            .select("*")
            .single();

        if (templateError || !newTemplate) {
            console.error("Error creating template", templateError);
            return NextResponse.json(
                { error: "Failed to create template" },
                { status: 500 }
            );
        }

        // Create pricing tiers if provided
        if (pricingTiers && Array.isArray(pricingTiers) && pricingTiers.length > 0) {
            const tiersToInsert = pricingTiers.map((tier: any) => ({
                template_id: newTemplate.id,
                name: tier.name,
                price_cents: Math.round((tier.priceCents || tier.price || 0) * 100),
                description: tier.description || null,
                is_default: tier.isDefault || false
            }));

            await supabaseAdmin.from("template_pricing_tiers").insert(tiersToInsert);
        }

        // Create discount codes if provided
        if (discountCodes && Array.isArray(discountCodes) && discountCodes.length > 0) {
            const codesToInsert = discountCodes.map((code: any) => ({
                template_id: newTemplate.id,
                code: code.code.toUpperCase(),
                type: code.type,
                value: code.value,
                description: code.description || null,
                expiry_date: code.expiryDate || null,
                usage_limit: code.usageLimit || 0
            }));

            await supabaseAdmin.from("template_discount_codes").insert(codesToInsert);
        }

        return NextResponse.json({ template: newTemplate }, { status: 201 });
    } catch (error: any) {
        console.error("Error in POST /api/admin/studios/[studioId]/class-templates", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

