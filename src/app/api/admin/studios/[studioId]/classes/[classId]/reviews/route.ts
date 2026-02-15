// app/api/admin/studios/[studioId]/classes/[classId]/reviews/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";
import { assertStudioAdmin } from "@/lib/server/studios";

// GET /api/admin/studios/[studioId]/classes/[classId]/reviews
// Get reviews for a class
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

        const { data: reviews, error } = await supabaseAdmin
            .from("class_reviews")
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
            .eq("class_id", params.classId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching reviews", error);
            return NextResponse.json({ error: "Failed to load reviews" }, { status: 500 });
        }

        // Transform data for frontend
        const transformedReviews =
            reviews?.map((review: any) => {
                const student = Array.isArray(review.student) ? review.student[0] : review.student;
                return {
                    id: review.id,
                    studentId: review.student_id,
                    studentName: student?.name || "",
                    studentEmail: student?.email || "",
                    rating: review.rating,
                    comment: review.comment || "",
                    isPublic: review.is_public,
                    date: review.created_at
                };
            }) || [];

        return NextResponse.json({ reviews: transformedReviews });
    } catch (error: any) {
        console.error(
            "Error in GET /api/admin/studios/[studioId]/classes/[classId]/reviews",
            error
        );
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

