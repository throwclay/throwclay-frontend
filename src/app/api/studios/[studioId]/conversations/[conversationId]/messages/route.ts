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

export async function GET(
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
    } catch (e: any) {
        return NextResponse.json(
            { error: e?.message === "Not a participant" ? "Not in this conversation" : "Not authorized for this studio" },
            { status: 403 }
        );
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
    const before = searchParams.get("before"); // cursor: message id or created_at

    let query = supabaseAdmin
        .from("studio_messages")
        .select("id, conversation_id, sender_id, content, type, created_at, updated_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(limit + 1);

    if (before) {
        const isUuid = /^[0-9a-f-]{36}$/i.test(before);
        if (isUuid) {
            const { data: msg } = await supabaseAdmin
                .from("studio_messages")
                .select("created_at")
                .eq("id", before)
                .eq("conversation_id", conversationId)
                .maybeSingle();
            if (msg) query = query.lt("created_at", msg.created_at);
        } else {
            query = query.lt("created_at", before);
        }
    }

    const { data: rows, error } = await query;

    if (error) {
        console.error("messages list", error);
        return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
    }

    const hasMore = (rows?.length ?? 0) > limit;
    const messages = (hasMore ? rows!.slice(0, limit) : rows ?? []).reverse();

    // Attach sender profile (name, handle) for each message
    const senderIds = [...new Set(messages.map((m) => m.sender_id))];
    const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id, name, handle")
        .in("id", senderIds);

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    const withSenders = messages.map((m) => ({
        id: m.id,
        conversationId: m.conversation_id,
        senderId: m.sender_id,
        senderName: profileMap.get(m.sender_id)?.name ?? "",
        senderHandle: profileMap.get(m.sender_id)?.handle ?? "",
        content: m.content,
        type: m.type,
        createdAt: m.created_at,
        updatedAt: m.updated_at
    }));

    return NextResponse.json({
        messages: withSenders,
        hasMore
    });
}

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
    } catch (e: any) {
        return NextResponse.json(
            { error: e?.message === "Not a participant" ? "Not in this conversation" : "Not authorized for this studio" },
            { status: 403 }
        );
    }

    const body = await req.json().catch(() => ({}));
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!content) {
        return NextResponse.json({ error: "Message content required" }, { status: 400 });
    }

    const { data: message, error: insertError } = await supabaseAdmin
        .from("studio_messages")
        .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            content,
            type: "text"
        })
        .select("id, conversation_id, sender_id, content, type, created_at, updated_at")
        .single();

    if (insertError) {
        console.error("send message", insertError);
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }

    const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("name, handle")
        .eq("id", user.id)
        .maybeSingle();

    return NextResponse.json({
        message: {
            id: message.id,
            conversationId: message.conversation_id,
            senderId: message.sender_id,
            senderName: profile?.name ?? "",
            senderHandle: profile?.handle ?? "",
            content: message.content,
            type: message.type,
            createdAt: message.created_at,
            updatedAt: message.updated_at
        }
    });
}
