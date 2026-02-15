"use client";

import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { MudlyLogo } from "@/components/MudlyLogo";

/**
 * Dedicated Mudly AI page. The actual chat widget is rendered as a global overlay
 * (bottom right) when logged in via DefaultLayout. This page provides a short
 * landing message; use the Mudly button in the corner to chat.
 */
export default function MudlyAIPage() {
    return (
        <DefaultLayout>
            <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
                <MudlyLogo size={80} className="mb-6" />
                <h1 className="text-2xl font-semibold mb-2">Mudly AI</h1>
                <p className="text-muted-foreground max-w-md">
                    Your pottery assistant is available in the bottom right corner of every page. Click the Mudly
                    button to start a conversation.
                </p>
            </div>
        </DefaultLayout>
    );
}
