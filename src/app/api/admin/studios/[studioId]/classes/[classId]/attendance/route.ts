// app/api/admin/studios/[studioId]/classes/[classId]/attendance/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";
import { assertStudioAdmin } from "@/lib/server/studios";

// GET /api/admin/studios/[studioId]/classes/[classId]/attendance
// Get attendance records for a class
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

        const { searchParams } = new URL(req.url);
        const date = searchParams.get("date");
        const studentId = searchParams.get("studentId");

        // Build query
        let query = supabaseAdmin
            .from("class_attendance")
            .select(
                `
                *,
                student:student_id (
                    id,
                    name,
                    email
                ),
                recorded_by:recorded_by (
                    id,
                    name
                )
            `
            )
            .eq("class_id", params.classId)
            .order("session_date", { ascending: false })
            .order("created_at", { ascending: false });

        // Apply filters
        if (date) {
            query = query.eq("session_date", date);
        }

        if (studentId) {
            query = query.eq("student_id", studentId);
        }

        const { data: attendance, error } = await query.limit(500); // Limit to prevent huge responses

        if (error) {
            console.error("Error fetching attendance", error);
            return NextResponse.json({ error: "Failed to load attendance" }, { status: 500 });
        }

        // Transform data for frontend
        const transformedAttendance =
            attendance?.map((record: any) => {
                const student = Array.isArray(record.student) ? record.student[0] : record.student;
                const recordedBy = Array.isArray(record.recorded_by)
                    ? record.recorded_by[0]
                    : record.recorded_by;

                return {
                    id: record.id,
                    studentId: record.student_id,
                    studentName: student?.name || "",
                    date: record.session_date,
                    status: record.status,
                    notes: record.notes || "",
                    recordedBy: recordedBy?.name || null
                };
            }) || [];

        return NextResponse.json({ attendance: transformedAttendance });
    } catch (error: any) {
        console.error(
            "Error in GET /api/admin/studios/[studioId]/classes/[classId]/attendance",
            error
        );
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

// POST /api/admin/studios/[studioId]/classes/[classId]/attendance
// Record attendance for a session
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
        const { sessionDate, attendance: attendanceRecords } = body;

        if (!sessionDate) {
            return NextResponse.json({ error: "sessionDate is required" }, { status: 400 });
        }

        if (!attendanceRecords || !Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
            return NextResponse.json(
                { error: "attendance array is required and must not be empty" },
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

        // Prepare attendance records for insertion
        const recordsToInsert = attendanceRecords.map((record: any) => ({
            class_id: params.classId,
            student_id: record.studentId,
            session_date: sessionDate,
            status: record.status,
            notes: record.notes || null,
            recorded_by: user.id
        }));

        // Use upsert to handle duplicates (will update if exists)
        const { data: insertedRecords, error: insertError } = await supabaseAdmin
            .from("class_attendance")
            .upsert(recordsToInsert, {
                onConflict: "class_id,student_id,session_date",
                ignoreDuplicates: false
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
            );

        if (insertError) {
            console.error("Error recording attendance", insertError);
            return NextResponse.json(
                { error: "Failed to record attendance" },
                { status: 500 }
            );
        }

        return NextResponse.json({ attendance: insertedRecords }, { status: 201 });
    } catch (error: any) {
        console.error(
            "Error in POST /api/admin/studios/[studioId]/classes/[classId]/attendance",
            error
        );
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

