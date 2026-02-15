/**
 * Server-side: build Mudly context (members, invites, classes, kilns) for the current user.
 * Used to build the system prompt and for tool execution.
 */

import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import { assertStudioAdmin } from "@/lib/server/studios";

export type MudlyContextMode = "artist" | "studio";

export interface MudlyContextPayload {
    userId: string;
    userName: string;
    userEmail: string;
    activeMode: MudlyContextMode;
    studioId: string | null;
    studioName: string | null;
    studioRole: string | null;
    /** Studio: members (id, userId, name, role). Only when studio admin. */
    members: Array<{ id: string; userId: string; name: string; role: string }>;
    /** Studio: pending invites. Only when studio admin. */
    pendingInvites: Array<{ id: string; email: string; role: string; studioName: string }>;
    /** User's own pending invites (artist or studio). */
    myPendingInvites: Array<{ id: string; studioName: string; role: string }>;
    /** Studio: classes summary. Only when studio admin. */
    classesSummary: Array<{
        id: string;
        name: string;
        level: string;
        status: string;
        startDate: string;
        enrolledCount: number;
        capacity: number;
        locationName?: string;
    }>;
    /** Studio: kilns. Only when studio admin. */
    kilns: Array<{ id: string; name: string; type: string; status: string; locationName?: string }>;
    /** Studio: upcoming kiln firings. Only when studio admin. */
    kilnFirings: Array<{
        id: string;
        name: string | null;
        kilnName: string;
        status: string;
        scheduledStart: string | null;
    }>;
    /** Studio: locations for create_class. */
    locations: Array<{ id: string; name: string }>;
}

export async function buildMudlyContext(
    userId: string,
    userEmail: string,
    userName: string,
    activeMode: MudlyContextMode,
    studioId: string | null
): Promise<MudlyContextPayload> {
    const payload: MudlyContextPayload = {
        userId,
        userName,
        userEmail,
        activeMode,
        studioId,
        studioName: null,
        studioRole: null,
        members: [],
        pendingInvites: [],
        myPendingInvites: [],
        classesSummary: [],
        kilns: [],
        kilnFirings: [],
        locations: []
    };

    // User's own pending invites (any mode)
    const { data: myInvites } = await supabaseAdmin
        .from("studio_invites")
        .select("id, studios:studio_id(name), role")
        .eq("status", "pending")
        .eq("email", userEmail)
        .order("invited_at", { ascending: false });
    payload.myPendingInvites = (myInvites ?? []).map((row: any) => ({
        id: row.id,
        studioName: row.studios?.name ?? "A studio",
        role: row.role ?? "member"
    }));

    if (activeMode !== "studio" || !studioId) {
        return payload;
    }

    try {
        await assertStudioAdmin(userId, studioId);
    } catch {
        return payload;
    }

    const { data: studioRow } = await supabaseAdmin
        .from("studios")
        .select("name")
        .eq("id", studioId)
        .single();
    payload.studioName = studioRow?.name ?? null;
    const { data: membership } = await supabaseAdmin
        .from("studio_memberships")
        .select("role")
        .eq("studio_id", studioId)
        .eq("user_id", userId)
        .eq("status", "active")
        .single();
    payload.studioRole = (membership as any)?.role ?? null;

    // Locations
    const { data: locs } = await supabaseAdmin
        .from("studio_locations")
        .select("id, name")
        .eq("studio_id", studioId);
    payload.locations = (locs ?? []).map((l: any) => ({ id: l.id, name: l.name }));

    // Members (with profile names and user_id for instructor selection)
    const { data: membersRows } = await supabaseAdmin
        .from("studio_memberships")
        .select("id, user_id, role, profiles:user_id(name)")
        .eq("studio_id", studioId)
        .eq("status", "active");
    payload.members = (membersRows ?? []).map((m: any) => ({
        id: m.id,
        userId: m.user_id,
        name: m.profiles?.name ?? "Unknown",
        role: m.role ?? "member"
    }));

    // Pending invites (studio sent)
    const { data: invRows } = await supabaseAdmin
        .from("studio_invites")
        .select("id, email, role, studios:studio_id(name)")
        .eq("studio_id", studioId)
        .eq("status", "pending");
    payload.pendingInvites = (invRows ?? []).map((i: any) => ({
        id: i.id,
        email: i.email,
        role: i.role ?? "member",
        studioName: i.studios?.name ?? payload.studioName ?? ""
    }));

    // Classes (first location or all) – summary
    const locationId = payload.locations[0]?.id;
    if (locationId) {
        const { data: classes } = await supabaseAdmin
            .from("studio_classes")
            .select("id, name, level, status, start_date, enrolled_count, capacity, studio_locations:location_id(name)")
            .eq("studio_id", studioId)
            .eq("location_id", locationId)
            .order("start_date", { ascending: false })
            .limit(30);
        payload.classesSummary = (classes ?? []).map((c: any) => ({
            id: c.id,
            name: c.name,
            level: c.level ?? "",
            status: c.status ?? "draft",
            startDate: c.start_date ?? "",
            enrolledCount: c.enrolled_count ?? 0,
            capacity: c.capacity ?? 0,
            locationName: c.studio_locations?.name
        }));
    }

    // Kilns
    const { data: kilnRows } = await supabaseAdmin
        .from("kilns")
        .select("id, name, type, status, studio_locations:location_id(name)")
        .eq("studio_id", studioId)
        .eq("is_active", true);
    payload.kilns = (kilnRows ?? []).map((k: any) => ({
        id: k.id,
        name: k.name,
        type: k.type ?? "",
        status: k.status ?? "available",
        locationName: k.studio_locations?.name
    }));

    // Upcoming kiln firings
    const { data: firings } = await supabaseAdmin
        .from("kiln_firings")
        .select("id, name, scheduled_start, status, kilns:kiln_id(name)")
        .eq("studio_id", studioId)
        .gte("scheduled_start", new Date().toISOString())
        .order("scheduled_start", { ascending: true })
        .limit(20);
    payload.kilnFirings = (firings ?? []).map((f: any) => ({
        id: f.id,
        name: f.name,
        kilnName: f.kilns?.name ?? "Unknown kiln",
        status: f.status ?? "scheduled",
        scheduledStart: f.scheduled_start
    }));

    return payload;
}

export function mudlyContextToSystemPrompt(payload: MudlyContextPayload): string {
    const lines: string[] = [
        "You are Mudly, a friendly and knowledgeable AI assistant for Throw Clay, a pottery studio and ceramic artist platform.",
        "You help users with studio management, classes, kilns, members, invites, and finding studios or classes as an artist.",
        "Be concise and helpful. When the user is in studio mode and you have context (members, classes, kilns, invites), use it to answer accurately.",
        "When you suggest creating a class or scheduling a kiln firing, use the provided tools so the user can do it in one step.",
        "",
        "## Current user",
        `- Name: ${payload.userName}`,
        `- Mode: ${payload.activeMode}`,
        `- Email: ${payload.userEmail}`,
        ""
    ];

    if (payload.activeMode === "studio" && payload.studioId) {
        lines.push("## Studio context (you have admin access)");
        lines.push(`- Studio: ${payload.studioName ?? payload.studioId}`);
        lines.push(`- User's role: ${payload.studioRole ?? "unknown"}`);
        lines.push(`- Locations: ${payload.locations.map((l) => `${l.name} (id: ${l.id})`).join(", ")}`);
        lines.push("");
        lines.push("### Members (use userId as instructorId when creating classes)");
        if (payload.members.length) {
            payload.members.forEach((m) => lines.push(`- ${m.name} (${m.role}) userId: ${m.userId}`));
        } else {
            lines.push("- No members listed.");
        }
        lines.push("");
        lines.push("### Pending invites (sent by this studio)");
        if (payload.pendingInvites.length) {
            payload.pendingInvites.forEach((i) => lines.push(`- ${i.email} as ${i.role}`));
        } else {
            lines.push("- No pending invites.");
        }
        lines.push("");
        lines.push("### Classes (recent)");
        if (payload.classesSummary.length) {
            payload.classesSummary.slice(0, 15).forEach((c) => {
                lines.push(`- ${c.name} | ${c.level} | ${c.status} | starts ${c.startDate} | ${c.enrolledCount}/${c.capacity}`);
            });
        } else {
            lines.push("- No classes found for the first location.");
        }
        lines.push("");
        lines.push("### Kilns");
        if (payload.kilns.length) {
            payload.kilns.forEach((k) => lines.push(`- ${k.name} (${k.type}, ${k.status})`));
        } else {
            lines.push("- No kilns.");
        }
        lines.push("");
        lines.push("### Upcoming kiln firings");
        if (payload.kilnFirings.length) {
            payload.kilnFirings.forEach((f) => lines.push(`- ${f.kilnName}: ${f.name ?? "Firing"} | ${f.status} | ${f.scheduledStart ?? ""}`));
        } else {
            lines.push("- No upcoming firings.");
        }
        lines.push("");
    }

    if (payload.myPendingInvites.length) {
        lines.push("## Invites sent to this user");
        payload.myPendingInvites.forEach((i) => lines.push(`- ${i.studioName} invited you as ${i.role}`));
        lines.push("");
    }

    lines.push("Use the tools when the user asks to list or create classes, kiln firings, or similar. For artist mode, you can describe how to find studios and classes on the platform.");
    return lines.join("\n");
}
