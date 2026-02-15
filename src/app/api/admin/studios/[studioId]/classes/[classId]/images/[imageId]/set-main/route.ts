// app/api/admin/studios/[studioId]/classes/[classId]/images/[imageId]/set-main/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";
import { assertStudioAdmin } from "@/lib/server/studios";

// PATCH /api/admin/studios/[studioId]/classes/[classId]/images/[imageId]/set-main
// Set image as main/thumbnail
export async function PATCH(
    req: Request,
    {
        params
    }: {
        params: { studioId: string; classId: string; imageId: string };
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

        // Verify image belongs to class
        const { data: imageData, error: imageError } = await supabaseAdmin
            .from("class_images")
            .select("url")
            .eq("id", params.imageId)
            .eq("class_id", params.classId)
            .single();

        if (imageError || !imageData) {
            return NextResponse.json({ error: "Image not found" }, { status: 404 });
        }

        // Unset all other main images
        await supabaseAdmin
            .from("class_images")
            .update({ is_main: false })
            .eq("class_id", params.classId)
            .neq("id", params.imageId);

        // Set this image as main
        const { data: updatedImage, error: updateError } = await supabaseAdmin
            .from("class_images")
            .update({ is_main: true })
            .eq("id", params.imageId)
            .eq("class_id", params.classId)
            .select("*")
            .single();

        if (updateError || !updatedImage) {
            console.error("Error setting main image", updateError);
            return NextResponse.json(
                { error: "Failed to set main image" },
                { status: 500 }
            );
        }

        // Update class thumbnail
        await supabaseAdmin
            .from("studio_classes")
            .update({ thumbnail_url: imageData.url })
            .eq("id", params.classId);

        return NextResponse.json({
            image: {
                id: updatedImage.id,
                url: updatedImage.url,
                alt: updatedImage.alt_text || "",
                isMain: updatedImage.is_main,
                uploadDate: updatedImage.upload_date
            }
        });
    } catch (error: any) {
        console.error(
            "Error in PATCH /api/admin/studios/[studioId]/classes/[classId]/images/[imageId]/set-main",
            error
        );
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

