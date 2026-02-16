import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { getBearerToken } from "@/lib/server/auth";
import { assertStudioMember } from "@/lib/server/studios";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ studioId: string }> }
) {
    const token = getBearerToken(req);
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studioId } = await params;
    try {
        await assertStudioMember(user.id, studioId);
    } catch {
        return NextResponse.json({ error: "Not authorized for this studio" }, { status: 403 });
    }

    const { data: participantRows, error: partError } = await supabaseAdmin
        .from("studio_conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);

    if (partError || !participantRows?.length) {
        return NextResponse.json({ totalUnread: 0 });
    }

    const conversationIds = participantRows.map((p) => p.conversation_id);

    const { data: messagesFromOthers } = await supabaseAdmin
        .from("studio_messages")
        .select("id")
        .in("conversation_id", conversationIds)
        .neq("sender_id", user.id);

    const messageIds = (messagesFromOthers ?? []).map((m) => m.id);
    if (messageIds.length === 0) {
        return NextResponse.json({ totalUnread: 0 });
    }

    const { data: receipts } = await supabaseAdmin
        .from("studio_message_read_receipts")
        .select("message_id")
        .eq("user_id", user.id)
        .in("message_id", messageIds);

    const readSet = new Set((receipts ?? []).map((r) => r.message_id));
    const totalUnread = messageIds.filter((id) => !readSet.has(id)).length;

    return NextResponse.json({ totalUnread });
}
