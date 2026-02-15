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

    // List conversations where current user is a participant, with last message and participant count
    const { data: participantRows, error: partError } = await supabaseAdmin
        .from("studio_conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);

    if (partError || !participantRows?.length) {
        return NextResponse.json({ conversations: [] });
    }

    const conversationIds = participantRows.map((p) => p.conversation_id);

    const { data: conversations, error: convError } = await supabaseAdmin
        .from("studio_conversations")
        .select("id, studio_id, type, name, description, is_private, created_at, updated_at")
        .in("id", conversationIds)
        .eq("studio_id", studioId)
        .order("updated_at", { ascending: false });

    if (convError) {
        console.error("conversations list", convError);
        return NextResponse.json({ error: "Failed to load conversations" }, { status: 500 });
    }

    // Last message per conversation and participant profiles for display name (DM)
    const withMeta = await Promise.all(
        (conversations ?? []).map(async (c) => {
            const [lastMsgRes, participantsRes] = await Promise.all([
                supabaseAdmin
                    .from("studio_messages")
                    .select("id, sender_id, content, created_at")
                    .eq("conversation_id", c.id)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle(),
                supabaseAdmin
                    .from("studio_conversation_participants")
                    .select("user_id")
                    .eq("conversation_id", c.id)
            ]);

            const lastMsg = lastMsgRes.data;
            const participants = participantsRes.data ?? [];
            let displayName = c.name ?? "Group chat";
            if (c.type === "direct" && participants.length >= 1) {
                const otherIds = participants.map((p) => p.user_id).filter((id) => id !== user.id);
                if (otherIds.length === 1) {
                    const { data: profile } = await supabaseAdmin
                        .from("profiles")
                        .select("name, handle")
                        .eq("id", otherIds[0])
                        .maybeSingle();
                    displayName = profile?.name ?? profile?.handle ?? "Unknown";
                }
            }

            return {
                id: c.id,
                studioId: c.studio_id,
                type: c.type,
                name: c.name,
                displayName,
                description: c.description,
                isPrivate: c.is_private,
                createdAt: c.created_at,
                updatedAt: c.updated_at,
                memberCount: participants.length,
                lastMessage: lastMsg
                    ? {
                        id: lastMsg.id,
                        senderId: lastMsg.sender_id,
                        content: lastMsg.content,
                        createdAt: lastMsg.created_at
                    }
                    : null
            };
        })
    );

    return NextResponse.json({ conversations: withMeta });
}

export async function POST(
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

    const body = await req.json().catch(() => ({}));
    const { type, participantIds, name, description } = body as {
        type?: "direct" | "group";
        participantIds?: string[];
        name?: string;
        description?: string;
    };

    if (!type || !Array.isArray(participantIds)) {
        return NextResponse.json(
            { error: "Missing type or participantIds" },
            { status: 400 }
        );
    }

    if (type === "direct") {
        if (participantIds.length !== 1) {
            return NextResponse.json(
                { error: "Direct conversation must have exactly one other participant" },
                { status: 400 }
            );
        }
        const otherId = participantIds[0];
        if (otherId === user.id) {
            return NextResponse.json({ error: "Cannot start DM with yourself" }, { status: 400 });
        }
        // Check if DM already exists between these two in this studio
        const { data: existingConvs } = await supabaseAdmin
            .from("studio_conversations")
            .select("id")
            .eq("studio_id", studioId)
            .eq("type", "direct");

        if (existingConvs?.length) {
            for (const conv of existingConvs) {
                const { data: parts } = await supabaseAdmin
                    .from("studio_conversation_participants")
                    .select("user_id")
                    .eq("conversation_id", conv.id);
                const userIds = (parts ?? []).map((p) => p.user_id).sort();
                const pair = [user.id, otherId].sort();
                if (userIds.length === 2 && userIds[0] === pair[0] && userIds[1] === pair[1]) {
                    return NextResponse.json({ conversation: { id: conv.id, type: "direct", existing: true } });
                }
            }
        }

        const { data: otherMember } = await supabaseAdmin
            .from("studio_memberships")
            .select("user_id")
            .eq("studio_id", studioId)
            .eq("user_id", otherId)
            .eq("status", "active")
            .maybeSingle();
        if (!otherMember) {
            return NextResponse.json({ error: "Other user is not a member of this studio" }, { status: 400 });
        }
    }

    if (type === "group") {
        if (participantIds.length < 1 || !name?.trim()) {
            return NextResponse.json(
                { error: "Group conversation requires name and at least one other participant" },
                { status: 400 }
            );
        }
        // Ensure all participantIds are active members
        for (const pid of participantIds) {
            const { data: m } = await supabaseAdmin
                .from("studio_memberships")
                .select("user_id")
                .eq("studio_id", studioId)
                .eq("user_id", pid)
                .eq("status", "active")
                .maybeSingle();
            if (!m) {
                return NextResponse.json({ error: "All participants must be active studio members" }, { status: 400 });
            }
        }
    }

    const { data: newConv, error: insertConvError } = await supabaseAdmin
        .from("studio_conversations")
        .insert({
            studio_id: studioId,
            type,
            name: type === "group" ? name : null,
            description: description ?? null,
            is_private: false
        })
        .select("id, studio_id, type, name, description, is_private, created_at, updated_at")
        .single();

    if (insertConvError) {
        console.error("create conversation", insertConvError);
        return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
    }

    const allUserIds = type === "direct" ? [user.id, participantIds[0]] : [user.id, ...participantIds];
    const uniq = [...new Set(allUserIds)];
    await supabaseAdmin.from("studio_conversation_participants").insert(
        uniq.map((uid, i) => ({
            conversation_id: newConv.id,
            user_id: uid,
            role: i === 0 ? "admin" : "member"
        }))
    );

    return NextResponse.json({
        conversation: {
            id: newConv.id,
            studioId: newConv.studio_id,
            type: newConv.type,
            name: newConv.name,
            description: newConv.description,
            isPrivate: newConv.is_private,
            createdAt: newConv.created_at,
            updatedAt: newConv.updated_at
        }
    });
}
