"use client";

import { useAppContext } from "@/app/context/AppContext";
import { MudlyChatWidget } from "./MudlyChatWidget";

/**
 * Renders the Mudly AI chat widget as a fixed overlay on the bottom right
 * when the user is logged in. Same placement regardless of mode (artist vs studio).
 * Future: Mudly will be agentic AI with context based on mode.
 */
export function MudlyOverlay() {
    const { currentUser, isInitializing } = useAppContext();

    if (isInitializing || !currentUser) {
        return null;
    }

    return <MudlyChatWidget position="bottom-right" />;
}
