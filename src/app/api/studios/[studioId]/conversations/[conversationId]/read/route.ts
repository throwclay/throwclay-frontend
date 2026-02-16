import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";
import { assertStudioMember } from "@/lib/server/studios";

async function assertParticipant(userId: string, conversationId: string) {
    const { data, error } = await supabaseAdmin
        .from("studio_conversation_participants")
        .select("user_id")
        .eq("conversation_id", conversationId)
        .eq("user_id", userId)
        .maybeSingle();
    if (error || !data) {
        throw new Error("Not a participant");
    }
}

/** Mark all messages in this conversation (from others) as read for the current user */
export async function POST(
    req: Request,
    { params }: { params: Promise<{ studioId: string; conversationId: string }> }
) {
    const token = getBearerToken(req);
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studioId, conversationId } = await params;
    try {
        await assertStudioMember(user.id, studioId);
        await assertParticipant(user.id, conversationId);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "";
        return NextResponse.json(
            { error: message === "Not a participant" ? "Not in this conversation" : "Not authorized for this studio" },
            { status: 403 }
        );
    }

    const { data: messages } = await supabaseAdmin
        .from("studio_messages")
        .select("id")
        .eq("conversation_id", conversationId)
        .neq("sender_id", user.id);

    if (!messages?.length) {
        return NextResponse.json({ marked: 0 });
    }

    const messageIds = messages.map((m) => m.id);
    const { data: existing } = await supabaseAdmin
        .from("studio_message_read_receipts")
        .select("message_id")
        .eq("user_id", user.id)
        .in("message_id", messageIds);

    const alreadyRead = new Set((existing ?? []).map((r) => r.message_id));
    const toInsert = messageIds.filter((id) => !alreadyRead.has(id)).map((message_id) => ({
        message_id,
        user_id: user.id
    }));

    if (toInsert.length === 0) {
        return NextResponse.json({ marked: 0 });
    }

    const { error: insertError } = await supabaseAdmin
        .from("studio_message_read_receipts")
        .insert(toInsert);

    if (insertError) {
        console.error("mark read", insertError);
        return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
    }

    return NextResponse.json({ marked: toInsert.length });
}
