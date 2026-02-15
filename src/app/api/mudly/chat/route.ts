import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getBearerToken } from "@/lib/server/auth";
import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import {
    buildMudlyContext,
    mudlyContextToSystemPrompt,
    type MudlyContextPayload
} from "../context";
import { assertStudioAdmin } from "@/lib/server/studios";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const MUDLY_MODEL = "gpt-4o-mini";

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
    {
        type: "function",
        function: {
            name: "list_studio_classes",
            description: "List classes for the current studio. Use when the user asks about classes, schedule, or enrollment."
        }
    },
    {
        type: "function",
        function: {
            name: "list_studio_members",
            description: "List members of the current studio. Use when the user asks who the members are."
        }
    },
    {
        type: "function",
        function: {
            name: "list_pending_invites",
            description: "List pending invites sent by the studio. Use when the user asks about pending invites."
        }
    },
    {
        type: "function",
        function: {
            name: "list_kilns",
            description: "List kilns for the current studio. Use when the user asks about kilns."
        }
    },
    {
        type: "function",
        function: {
            name: "list_kiln_firings",
            description: "List upcoming or recent kiln firings. Use when the user asks about kiln schedule or firings."
        }
    },
    {
        type: "function",
        function: {
            name: "create_class",
            description: "Create a new class for the studio. Call when the user wants to create or add a class.",
            parameters: {
                type: "object",
                properties: {
                    name: { type: "string", description: "Class name" },
                    description: { type: "string", description: "Optional description" },
                    locationId: { type: "string", description: "Location ID (required)" },
                    instructorId: { type: "string", description: "Instructor user ID" },
                    level: { type: "string", enum: ["beginner", "intermediate", "advanced", "all-levels", "kids"], description: "Skill level" },
                    capacity: { type: "number", description: "Max capacity" },
                    startDate: { type: "string", description: "Start date YYYY-MM-DD" },
                    endDate: { type: "string", description: "End date YYYY-MM-DD" },
                    schedule: { type: "string", description: "e.g. Mondays 6-8pm" }
                },
                required: ["name", "locationId", "instructorId", "level", "capacity", "startDate", "endDate"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "create_kiln_firing",
            description: "Schedule a new kiln firing. Call when the user wants to schedule or create a kiln firing.",
            parameters: {
                type: "object",
                properties: {
                    kilnId: { type: "string", description: "Kiln ID" },
                    name: { type: "string", description: "Optional name for the firing" },
                    date: { type: "string", description: "Date YYYY-MM-DD" },
                    startTime: { type: "string", description: "Start time e.g. 09:00" },
                    firingType: { type: "string", description: "e.g. bisque, glaze" },
                    atmosphere: { type: "string", description: "e.g. oxidation" }
                },
                required: ["kilnId"]
            }
        }
    }
];

async function executeTool(
    name: string,
    args: Record<string, unknown>,
    ctx: MudlyContextPayload,
    userId: string
): Promise<string> {
    if (ctx.activeMode !== "studio" || !ctx.studioId) {
        return "Not in studio mode or no studio selected.";
    }
    try {
        await assertStudioAdmin(userId, ctx.studioId);
    } catch {
        return "You don't have permission to perform this action.";
    }

    switch (name) {
        case "list_studio_classes":
            return JSON.stringify(ctx.classesSummary, null, 2);

        case "list_studio_members":
            return JSON.stringify(ctx.members, null, 2);

        case "list_pending_invites":
            return JSON.stringify(ctx.pendingInvites, null, 2);

        case "list_kilns":
            return JSON.stringify(ctx.kilns, null, 2);

        case "list_kiln_firings":
            return JSON.stringify(ctx.kilnFirings, null, 2);

        case "create_class": {
            const {
                name: className,
                description,
                locationId,
                instructorId,
                level,
                capacity,
                startDate,
                endDate,
                schedule
            } = args as Record<string, string | number>;
            if (!className || !locationId || !instructorId || !level || capacity == null || !startDate || !endDate) {
                return JSON.stringify({ error: "Missing required fields for creating a class." });
            }
            const { data, error } = await supabaseAdmin
                .from("studio_classes")
                .insert({
                    studio_id: ctx.studioId,
                    location_id: locationId,
                    name: String(className),
                    description: description ?? null,
                    instructor_id: instructorId,
                    level: String(level),
                    capacity: Number(capacity),
                    start_date: String(startDate),
                    end_date: String(endDate),
                    schedule: schedule ?? null,
                    status: "draft",
                    created_by: userId
                })
                .select("id, name, status, start_date, end_date")
                .single();
            if (error) return JSON.stringify({ error: error.message });
            return JSON.stringify({ success: true, class: data });
        }

        case "create_kiln_firing": {
            const { kilnId, name: firingName, date, startTime, firingType, atmosphere } = args as Record<string, string>;
            if (!kilnId) return JSON.stringify({ error: "kilnId is required." });
            let scheduledStart: string | null = null;
            if (date && startTime) {
                const d = new Date(`${date}T${startTime}`);
                if (!isNaN(d.getTime())) scheduledStart = d.toISOString();
            }
            const { data, error } = await supabaseAdmin
                .from("kiln_firings")
                .insert({
                    studio_id: ctx.studioId,
                    kiln_id: kilnId,
                    name: firingName ?? null,
                    scheduled_start: scheduledStart,
                    firing_type: firingType ?? null,
                    atmosphere: atmosphere ?? null,
                    status: "scheduled",
                    created_by: userId
                })
                .select("id, name, status, scheduled_start")
                .single();
            if (error) return JSON.stringify({ error: error.message });
            return JSON.stringify({ success: true, firing: data });
        }

        default:
            return `Unknown tool: ${name}`;
    }
}

export async function POST(req: Request) {
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

    if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    let body: { messages: Array<{ role: string; content: string }>; context?: Record<string, unknown> };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { messages: rawMessages, context: clientContext } = body;
    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
        return NextResponse.json({ error: "messages array required" }, { status: 400 });
    }

    const activeMode = (clientContext?.activeMode as "artist" | "studio") ?? "artist";
    const studioId = (clientContext?.studioId as string) ?? null;
    const userName = (clientContext?.userName as string) ?? user.user_metadata?.full_name ?? user.email ?? "User";
    const userEmail = user.email ?? "";

    const mudlyContext = await buildMudlyContext(
        user.id,
        userEmail,
        userName,
        activeMode,
        studioId
    );
    const systemPrompt = mudlyContextToSystemPrompt(mudlyContext);

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        ...rawMessages.map((m: { role: string; content: string }) => ({
            role: m.role as "user" | "assistant" | "system",
            content: m.content
        }))
    ];

    let currentMessages = [...messages];
    let maxToolRounds = 5;
    let lastContent: string | null = null;

    while (maxToolRounds-- > 0) {
        const completion = await openai.chat.completions.create({
            model: MUDLY_MODEL,
            messages: currentMessages,
            tools,
            tool_choice: "auto"
        });

        const choice = completion.choices[0];
        if (!choice?.message) {
            return NextResponse.json({ error: "No completion" }, { status: 500 });
        }

        const msg = choice.message;
        lastContent = msg.content ?? null;

        if (!msg.tool_calls?.length) {
            break;
        }

        currentMessages = [...currentMessages, msg];

        for (const tc of msg.tool_calls) {
            const name = tc.function?.name;
            let args: Record<string, unknown> = {};
            try {
                if (tc.function?.arguments) args = JSON.parse(tc.function.arguments);
            } catch {
                // ignore
            }
            const result = await executeTool(name ?? "", args, mudlyContext, user.id);
            currentMessages.push({
                role: "tool",
                tool_call_id: tc.id!,
                content: result
            });
        }
    }

    return NextResponse.json({
        content: lastContent ?? "I couldn't generate a response. Try rephrasing.",
        role: "assistant"
    });
}
