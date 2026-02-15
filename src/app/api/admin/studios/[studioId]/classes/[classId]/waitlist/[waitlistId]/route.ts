// app/api/admin/studios/[studioId]/classes/[classId]/waitlist/[waitlistId]/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";
import { assertStudioAdmin } from "@/lib/server/studios";

// DELETE /api/admin/studios/[studioId]/classes/[classId]/waitlist/[waitlistId]
// Remove from waitlist
export async function DELETE(
    req: Request,
    {
        params
    }: {
        params: { studioId: string; classId: string; waitlistId: string };
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

        // Delete waitlist entry
        const { error: deleteError } = await supabaseAdmin
            .from("class_waitlist")
            .delete()
            .eq("id", params.waitlistId)
            .eq("class_id", params.classId);

        if (deleteError) {
            console.error("Error deleting waitlist entry", deleteError);
            return NextResponse.json(
                { error: "Failed to remove from waitlist" },
                { status: 500 }
            );
        }

        // Waitlist positions will be automatically updated by the trigger

        return NextResponse.json({ message: "Removed from waitlist successfully" });
    } catch (error: any) {
        console.error(
            "Error in DELETE /api/admin/studios/[studioId]/classes/[classId]/waitlist/[waitlistId]",
            error
        );
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: error.message?.includes("authorized") ? 403 : 500 }
        );
    }
}

