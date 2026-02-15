// app/api/admin/studios/[studioId]/classes/[classId]/waitlist/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";
import { assertStudioAdmin } from "@/lib/server/studios";

// GET /api/admin/studios/[studioId]/classes/[classId]/waitlist
// Get waitlist for a class
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

        const { data: waitlist, error } = await supabaseAdmin
            .from("class_waitlist")
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
            .order("position", { ascending: true });

        if (error) {
            console.error("Error fetching waitlist", error);
            return NextResponse.json({ error: "Failed to load waitlist" }, { status: 500 });
        }

        // Transform data for frontend
        const transformedWaitlist =
            waitlist?.map((entry: any) => {
                const student = Array.isArray(entry.student) ? entry.student[0] : entry.student;
                return {
                    id: entry.id,
                    studentId: entry.student_id,
                    studentName: student?.name || "",
                    studentEmail: student?.email || "",
                    waitlistedDate: entry.waitlisted_date,
                    position: entry.position,
                    notifications: entry.notifications_enabled
                };
            }) || [];

        return NextResponse.json({ waitlist: transformedWaitlist });
    } catch (error: any) {
        console.error(
            "Error in GET /api/admin/studios/[studioId]/classes/[classId]/waitlist",
            error
        );
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

// POST /api/admin/studios/[studioId]/classes/[classId]/waitlist
// Add student to waitlist
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
        const { studentId, notificationsEnabled } = body;

        if (!studentId) {
            return NextResponse.json({ error: "studentId is required" }, { status: 400 });
        }

        // Verify class belongs to studio
        const { data: classData, error: classError } = await supabaseAdmin
            .from("studio_classes")
            .select("id, capacity, enrolled_count")
            .eq("id", params.classId)
            .eq("studio_id", params.studioId)
            .single();

        if (classError || !classData) {
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
        }

        // Check if already enrolled
        const { data: existingEnrollment, error: enrollmentCheckError } = await supabaseAdmin
            .from("class_enrollments")
            .select("id")
            .eq("class_id", params.classId)
            .eq("student_id", studentId)
            .maybeSingle();

        if (enrollmentCheckError) {
            console.error("Error checking enrollment", enrollmentCheckError);
            return NextResponse.json(
                { error: "Failed to check enrollment status" },
                { status: 500 }
            );
        }

        if (existingEnrollment) {
            return NextResponse.json(
                { error: "Student is already enrolled in this class" },
                { status: 400 }
            );
        }

        // Check if already on waitlist
        const { data: existingWaitlist, error: waitlistCheckError } = await supabaseAdmin
            .from("class_waitlist")
            .select("id")
            .eq("class_id", params.classId)
            .eq("student_id", studentId)
            .maybeSingle();

        if (waitlistCheckError) {
            console.error("Error checking waitlist", waitlistCheckError);
            return NextResponse.json(
                { error: "Failed to check waitlist status" },
                { status: 500 }
            );
        }

        if (existingWaitlist) {
            return NextResponse.json(
                { error: "Student is already on the waitlist" },
                { status: 400 }
            );
        }

        // Get current max position
        const { data: maxPositionData, error: maxPositionError } = await supabaseAdmin
            .from("class_waitlist")
            .select("position")
            .eq("class_id", params.classId)
            .order("position", { ascending: false })
            .limit(1)
            .maybeSingle();

        const nextPosition = maxPositionData ? maxPositionData.position + 1 : 1;

        // Add to waitlist
        const { data: waitlistEntry, error: waitlistError } = await supabaseAdmin
            .from("class_waitlist")
            .insert({
                class_id: params.classId,
                student_id: studentId,
                position: nextPosition,
                notifications_enabled: notificationsEnabled !== undefined ? notificationsEnabled : true
            })
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

        if (waitlistError) {
            console.error("Error adding to waitlist", waitlistError);
            return NextResponse.json({ error: "Failed to add to waitlist" }, { status: 500 });
        }

        return NextResponse.json({ waitlistEntry }, { status: 201 });
    } catch (error: any) {
        console.error(
            "Error in POST /api/admin/studios/[studioId]/classes/[classId]/waitlist",
            error
        );
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

