"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/apis/supabaseClient";
import type {
    AppContextType,
    User,
    Studio,
    PotteryEntry,
    StudioInvite,
    StudioMembership,
    StudioLocation
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
    const [isInitializing, setIsInitializing] = useState(true);

    /**
     * Helper function to fetch locations for a studio
     */
    const fetchLocationsForStudio = useCallback(
        async (studioId: string, token: string): Promise<StudioLocation[]> => {
            try {
                const res = await fetch(`/api/studios/${studioId}/locations`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    console.error("Error fetching studio locations", body);
                    return [];
                }

                const body = await res.json();
                const data = (body.locations || []) as StudioLocation[];
                return data;
            } catch (err) {
                console.error("Error fetching studio locations", err);
                return [];
            }
        },
        []
    );

    /**
     * Restore user session from Supabase session
     * This is called on app mount and when auth state changes
     */
    const restoreSession = useCallback(
        async (session: any) => {
            if (!session || !session.user) {
                // No session, clear everything
                setCurrentUser(null);
                setCurrentStudio(null);
                setCurrentMembership(null);
                setStudioMemberships([]);
                setAuthToken(null);
                setPendingInvites([]);
                setIsInitializing(false);
                return;
            }

            const user = session.user;
            const accessToken = session.access_token;

            // Set token first
            setAuthToken(accessToken);

            try {
                // Parallel fetch: profile, active subscription, memberships
                const [
                    { data: profileRow, error: profileError },
                    { data: profileSub, error: subError },
                    { data: memberships, error: membershipError }
                ] = await Promise.all([
                    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
                    supabase
                        .from("subscriptions")
                        .select("*")
                        .eq("owner_type", "profile")
                        .eq("owner_id", user.id)
                        .eq("status", "active")
                        .maybeSingle(),
                    supabase
                        .from("studio_memberships")
                        .select(
                            `
                id,
                user_id,
                studio_id,
                role,
                status,
                location_id,
                membership_type,
                created_at,
                studios:studio_id (
                  id,
                  name,
                  handle,
                  email,
                  description,
                  is_active,
                  plan,
                  created_at
                ),
                studio_locations:location_id (
                  id,
                  name
                )
              `
                        )
                        .eq("user_id", user.id)
                        .eq("status", "active")
                ]);

                if (profileError) {
                    console.error("restoreSession: error fetching profile", profileError);
                }
                if (membershipError) {
                    console.error("restoreSession: error fetching memberships", membershipError);
                }
                if (subError) {
                    console.error("restoreSession: error fetching subscription", subError);
                }

                const email = user.email ?? "";
                const phone = (user as any).phone ?? null;
                const fallbackName = email?.split("@")[0] ?? "Unnamed";

                const name =
                    (profileRow as any)?.name ??
                    (user.user_metadata as any)?.full_name ??
                    fallbackName;

                const handle =
                    (profileRow as any)?.handle ??
                    fallbackName.toLowerCase().replace(/[^a-z0-9_]+/g, "_");

                const artistPlan = (profileRow as any)?.artist_plan ?? "artist-free";

                // Build front-end User object
                const appUser: User = {
                    id: user.id,
                    name,
                    handle,
                    email,
                    phone,
                    type: "artist",
                    subscription: profileSub?.plan_code ?? null,
                    artistPlan,
                    subscriptionLimits: undefined,
                    usageStats: undefined,
                    profile: {
                        bio: (profileRow as any)?.bio ?? "",
                        socialMedia: (profileRow as any)?.social_media ?? {},
                        branding: {
                            primaryColor:
                                (profileRow as any)?.branding?.primaryColor ?? "#030213",
                            secondaryColor: (profileRow as any)?.branding?.secondaryColor,
                            logoUrl: (profileRow as any)?.branding?.logoUrl
                        }
                    },
                    createdAt:
                        (profileRow as any)?.created_at ?? new Date().toISOString(),
                    lastLogin:
                        (profileRow as any)?.last_login ?? user.last_sign_in_at ?? undefined,
                    isActive: (profileRow as any)?.is_active ?? true
                };

                // Normalize memberships
                const normalizedMemberships: StudioMembership[] = (memberships ?? []).map(
                    (m: any): StudioMembership => ({
                        id: m.id,
                        userId: m.user_id,
                        studioId: m.studio_id,
                        role: m.role,
                        status: m.status,
                        locationId: m.location_id,
                        locationName: m.studio_locations?.name ?? null,
                        membershipType: m.membership_type,
                        startDate: m.created_at,
                        lastActivity: profileRow?.last_login ?? null,
                        createdAt: m.created_at,
                        shelfNumber: null,
                        monthlyRate: null,
                        passionProjectsUpgrade: null,
                        studioName: m.studios?.name,
                        studioHandle: m.studios?.handle
                    })
                );

                setStudioMemberships(normalizedMemberships);

                let studioForState: Studio | null = null;
                let membershipForState: StudioMembership | null = null;

                if (normalizedMemberships.length > 0) {
                    // Pick the first active membership as the "current" one
                    const membership = normalizedMemberships[0];
                    const raw = (memberships ?? [])[0] as any;
                    const s = raw?.studios;

                    if (s) {
                        const studioLocations = await fetchLocationsForStudio(
                            s.id,
                            accessToken
                        );

                        studioForState = {
                            id: s.id,
                            name: s.name,
                            handle: s.handle,
                            email: s.email ?? "",
                            website: (s as any).website ?? "",
                            description: s.description ?? "",
                            locations: studioLocations,
                            isActive: s.is_active ?? true,
                            plan: (s.plan as Studio["plan"]) ?? "studio-free",
                            createdAt: s.created_at,
                            memberCount: 0,
                            classCount: 0,
                            glazes: [],
                            firingSchedule: [],
                            roleForCurrentUser: membership.role as any
                        };

                        membershipForState = membership;
                    }
                }

                // Derive modes
                const hasStudioRole = (memberships ?? []).some((m: any) =>
                    ["owner", "admin"].includes(m.role)
                );

                appUser.availableModes = hasStudioRole ? ["artist", "studio"] : ["artist"];
                appUser.activeMode = hasStudioRole ? "studio" : "artist";
                (appUser as any).hasStudioMemberships = (memberships ?? []).length > 0;

                // Update context
                setCurrentStudio(studioForState);
                setCurrentUser(appUser);
                setCurrentMembership(membershipForState);

                // Fetch user-level invites
                const status = "pending";
                const query = status ? `?status=${encodeURIComponent(status)}` : "";
                const url = `/api/invites${query}`;

                try {
                    const res = await fetch(url, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    });

                    if (res.ok) {
                        const body = await res.json();
                        const invites: StudioInvite[] = body.invites || [];
                        setPendingInvites(invites);
                    }
                } catch (err) {
                    console.error("Error fetching invites during session restore", err);
                }
            } catch (err) {
                console.error("Error restoring session", err);
            } finally {
                setIsInitializing(false);
            }
        },
        [fetchLocationsForStudio]
    );

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

    // Restore session on mount and listen for auth state changes
    useEffect(() => {
        // Check for existing session on mount
        const initializeSession = async () => {
            const {
                data: { session }
            } = await supabase.auth.getSession();
            if (session) {
                await restoreSession(session);
            } else {
                setIsInitializing(false);
            }
        };

        initializeSession();

        // Listen for auth state changes (login, logout, token refresh)
        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            await restoreSession(session);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [restoreSession]);

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
        refreshInvites,
        isInitializing
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useAppContext must be used within an AppProvider");
    return ctx;
}
