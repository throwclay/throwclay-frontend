// app/api/admin/studios/[studioId]/classes/[classId]/reviews/[reviewId]/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";
import { assertStudioAdmin } from "@/lib/server/studios";

// PATCH /api/admin/studios/[studioId]/classes/[classId]/reviews/[reviewId]
// Update review visibility
export async function PATCH(
    req: Request,
    {
        params
    }: {
        params: { studioId: string; classId: string; reviewId: string };
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

        const body = await req.json().catch(() => ({}));
        const { isPublic } = body;

        if (isPublic === undefined) {
            return NextResponse.json({ error: "isPublic is required" }, { status: 400 });
        }

        const { data: review, error: updateError } = await supabaseAdmin
            .from("class_reviews")
            .update({ is_public: isPublic })
            .eq("id", params.reviewId)
            .eq("class_id", params.classId)
            .select(
                `
                *,
                student:student_id (
                    id,
                    name,
                    email
                )
            `
            )
            .single();

        if (updateError || !review) {
            console.error("Error updating review", updateError);
            return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
        }

        const student = Array.isArray(review.student) ? review.student[0] : review.student;

        return NextResponse.json({
            review: {
                id: review.id,
                studentId: review.student_id,
                studentName: student?.name || "",
                studentEmail: student?.email || "",
                rating: review.rating,
                comment: review.comment || "",
                isPublic: review.is_public,
                date: review.created_at
            }
        });
    } catch (error: any) {
        console.error(
            "Error in PATCH /api/admin/studios/[studioId]/classes/[classId]/reviews/[reviewId]",
            error
        );
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

// DELETE /api/admin/studios/[studioId]/classes/[classId]/reviews/[reviewId]
// Delete review
export async function DELETE(
    req: Request,
    {
        params
    }: {
        params: { studioId: string; classId: string; reviewId: string };
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

        // Delete review
        const { error: deleteError } = await supabaseAdmin
            .from("class_reviews")
            .delete()
            .eq("id", params.reviewId)
            .eq("class_id", params.classId);

        if (deleteError) {
            console.error("Error deleting review", deleteError);
            return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
        }

        return NextResponse.json({ message: "Review deleted successfully" });
    } catch (error: any) {
        console.error(
            "Error in DELETE /api/admin/studios/[studioId]/classes/[classId]/reviews/[reviewId]",
            error
        );
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

