// app/api/admin/studios/[studioId]/classes/[classId]/images/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";
import { assertStudioAdmin } from "@/lib/server/studios";

// GET /api/admin/studios/[studioId]/classes/[classId]/images
// Get all images for a class
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

        const { data: images, error } = await supabaseAdmin
            .from("class_images")
            .select("*")
            .eq("class_id", params.classId)
            .order("is_main", { ascending: false })
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Error fetching images", error);
            return NextResponse.json({ error: "Failed to load images" }, { status: 500 });
        }

        // Transform data for frontend
        const transformedImages =
            images?.map((img: any) => ({
                id: img.id,
                url: img.url,
                alt: img.alt_text || "",
                isMain: img.is_main,
                uploadDate: img.upload_date
            })) || [];

        return NextResponse.json({ images: transformedImages });
    } catch (error: any) {
        console.error(
            "Error in GET /api/admin/studios/[studioId]/classes/[classId]/images",
            error
        );
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

// POST /api/admin/studios/[studioId]/classes/[classId]/images
// Upload images (expects array of image URLs - actual file upload would be handled separately)
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
        const { images, setMain } = body;

        if (!images || !Array.isArray(images) || images.length === 0) {
            return NextResponse.json(
                { error: "images array is required and must not be empty" },
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

        // If setting a main image, unset current main
        if (setMain) {
            await supabaseAdmin
                .from("class_images")
                .update({ is_main: false })
                .eq("class_id", params.classId);
        }

        // Insert images
        const imagesToInsert = images.map((img: string | { url: string; alt?: string }, index: number) => {
            const url = typeof img === "string" ? img : img.url;
            const alt = typeof img === "string" ? `Class image ${index + 1}` : img.alt || `Class image ${index + 1}`;
            return {
                class_id: params.classId,
                url,
                alt_text: alt,
                is_main: setMain && index === 0,
                upload_date: new Date().toISOString().split("T")[0]
            };
        });

        const { data: insertedImages, error: insertError } = await supabaseAdmin
            .from("class_images")
            .insert(imagesToInsert)
            .select("*");

        if (insertError) {
            console.error("Error uploading images", insertError);
            return NextResponse.json({ error: "Failed to upload images" }, { status: 500 });
        }

        // Update class thumbnail if main image was set
        if (setMain && insertedImages && insertedImages.length > 0) {
            await supabaseAdmin
                .from("studio_classes")
                .update({ thumbnail_url: insertedImages[0].url })
                .eq("id", params.classId);
        }

        return NextResponse.json(
            {
                images: insertedImages?.map((img: any) => ({
                    id: img.id,
                    url: img.url,
                    alt: img.alt_text || "",
                    isMain: img.is_main,
                    uploadDate: img.upload_date
                })) || []
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error(
            "Error in POST /api/admin/studios/[studioId]/classes/[classId]/images",
            error
        );
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

