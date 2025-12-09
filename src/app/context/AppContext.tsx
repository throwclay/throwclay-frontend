"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type {
    AppContextType,
    User,
    Studio,
    PotteryEntry,
    StudioInvite,
    StudioMembership
} from "@/types";

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentStudio, setCurrentStudio] = useState<Studio | null>(null);

    const [currentMembership, setCurrentMembership] = useState<StudioMembership | null>(null);

    const [studioMemberships, setStudioMemberships] = useState<StudioMembership[]>([]);

    const [currentThrow, setCurrentThrow] = useState<PotteryEntry | null>(null);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [pendingInvites, setPendingInvites] = useState<StudioInvite[]>([]);

    /**
     * User-level invite fetcher
     * - hits /api/invites (optionally filtered by ?status=)
     * - stores result in pendingInvites for nav + InvitesPanel
     * - can accept a fresh tokenOverride (so login can avoid stale closure)
     */
    const refreshInvites = useCallback(
        async (opts?: { status?: string; tokenOverride?: string }) => {
            const token = opts?.tokenOverride ?? authToken;

            if (!token) {
                setPendingInvites([]);
                return [];
            }

            const status = opts?.status;
            const query = status ? `?status=${encodeURIComponent(status)}` : "";
            const url = `/api/invites${query}`;

            try {
                const res = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    console.error("refreshInvites: non-OK response", res.status, body);
                    setPendingInvites([]);
                    return [];
                }

                const body = await res.json();
                const invites: StudioInvite[] = body.invites || [];
                setPendingInvites(invites);
                return invites;
            } catch (err) {
                console.error("refreshInvites error", err);
                setPendingInvites([]);
                return [];
            }
        },
        [authToken]
    );

    const value: AppContextType = {
        currentUser,
        setCurrentUser,
        currentStudio,
        setCurrentStudio,
        currentMembership,
        setCurrentMembership,
        studioMemberships,
        setStudioMemberships,
        currentThrow,
        setCurrentThrow,
        authToken,
        setAuthToken,
        pendingInvites,
        setPendingInvites,
        refreshInvites
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useAppContext must be used within an AppProvider");
    return ctx;
}
