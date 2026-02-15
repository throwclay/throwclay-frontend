// app/api/admin/studios/[studioId]/classes/[classId]/images/[imageId]/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";
import { assertStudioAdmin } from "@/lib/server/studios";

// DELETE /api/admin/studios/[studioId]/classes/[classId]/images/[imageId]
// Delete image
export async function DELETE(
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

        // Get image to check if it's main
        const { data: imageData, error: imageError } = await supabaseAdmin
            .from("class_images")
            .select("url, is_main")
            .eq("id", params.imageId)
            .eq("class_id", params.classId)
            .single();

        if (imageError || !imageData) {
            return NextResponse.json({ error: "Image not found" }, { status: 404 });
        }

        // Delete image
        const { error: deleteError } = await supabaseAdmin
            .from("class_images")
            .delete()
            .eq("id", params.imageId)
            .eq("class_id", params.classId);

        if (deleteError) {
            console.error("Error deleting image", deleteError);
            return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
        }

        // If this was the main image, update class thumbnail to null or next image
        if (imageData.is_main) {
            const { data: nextImage } = await supabaseAdmin
                .from("class_images")
                .select("url")
                .eq("class_id", params.classId)
                .order("created_at", { ascending: true })
                .limit(1)
                .maybeSingle();

            await supabaseAdmin
                .from("studio_classes")
                .update({ thumbnail_url: nextImage?.url || null })
                .eq("id", params.classId);
        }

        return NextResponse.json({ message: "Image deleted successfully" });
    } catch (error: any) {
        console.error(
            "Error in DELETE /api/admin/studios/[studioId]/classes/[classId]/images/[imageId]",
            error
        );
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

