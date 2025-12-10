import { useEffect, useState, useCallback } from "react";
import { useAppContext } from "@/app/context/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

import type { StudioInvite, User } from "@/types";

export default function InvitesPanel() {
    const context = useAppContext();
    const [invites, setInvites] = useState<StudioInvite[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInvites = useCallback(async () => {
        if (!context.authToken) {
            setError("You must be logged in to view invites.");
            setInvites([]);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const res = await fetch("/api/invites", {
                headers: {
                    Authorization: `Bearer ${context.authToken}`
                }
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                setError(body.error || "Failed to load invites");
                setInvites([]);
                return;
            }

            const body = await res.json();
            setInvites((body.invites || []) as StudioInvite[]);
        } catch (err) {
            console.error("Error fetching invites", err);
            setError("Failed to load invites");
            setInvites([]);
        } finally {
            setIsLoading(false);
        }
    }, [context.authToken]);

    useEffect(() => {
        fetchInvites();
    }, [fetchInvites]);

    const handleAccept = async (inviteId: string) => {
        if (!context.authToken) {
            toast.error("You must be logged in to accept invites.");
            return;
        }
        if (!context.currentUser) {
            toast.error("No current user in context.");
            return;
        }

        const invite = invites.find((i) => i.id === inviteId);
        if (!invite) {
            toast.error("Invite not found in local state.");
            return;
        }

        try {
            const res = await fetch("/api/invites/accept", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${context.authToken}`
                },
                body: JSON.stringify({ inviteId })
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                console.error("Accept invite error", body);
                toast.error(body.error || "Failed to accept invite");
                return;
            }

            toast.success("Invite accepted!");

            // 1) Remove accepted invite from panel state
            setInvites((prev) => prev.filter((i) => i.id !== inviteId));

            // 2) Refresh bell badge count
            await context.refreshInvites({ status: "pending" });

            // 3) Update current user modes / flags
            context.setCurrentUser((prev) => {
                if (!prev) return prev;
                const updated: any = { ...prev };

                updated.hasStudioMemberships = true;

                const isStudioRole = ["owner", "admin"].includes(invite.role);

                if (isStudioRole) {
                    const currentModes = updated.availableModes ?? ["artist"];
                    if (!currentModes.includes("studio")) {
                        updated.availableModes = ["artist", "studio"];
                    }

                    // Keep them in artist mode by default, but ensure something is set
                    if (!updated.activeMode) {
                        updated.activeMode = "artist";
                    }
                }

                return updated;
            });

            // 4) Seed context.currentStudio if they don't have one yet
            if (!context.currentStudio && invite.studios) {
                context.setCurrentStudio((prev) => {
                    if (prev) return prev;

                    return {
                        id: invite.studios?.id,
                        name: invite.studios?.name,
                        handle: invite.studios?.handle,
                        email: "",
                        website: "",
                        description: "",
                        locations: [],
                        isActive: true,
                        plan: "studio-solo",
                        createdAt: new Date().toISOString(),
                        memberCount: 0,
                        classCount: 0,
                        glazes: [],
                        firingSchedule: [],
                        roleForCurrentUser: invite.role as any
                    };
                });
            }
        } catch (err) {
            console.error("Error accepting invite", err);
            toast.error("Something went wrong accepting the invite");
        }
    };

    // --- Render helpers -------------------------------------------------------

    const renderHeader = () => (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-2xl font-semibold">Studio Invites</h1>
                <p className="text-sm text-muted-foreground">
                    These studios have invited you to join.
                </p>
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={fetchInvites}
            >
                Refresh
            </Button>
        </div>
    );

    if (!context.currentUser) {
        return (
            <div className="max-w-4xl mx-auto p-8 text-center">
                <h1 className="text-2xl font-semibold mb-2">Studio Invites</h1>
                <p className="text-muted-foreground">Please log in to view invites.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-4">
            {renderHeader()}

            {isLoading && (
                <Card className="p-6 text-center text-muted-foreground">Loading invites…</Card>
            )}

            {!isLoading && error && (
                <Card className="p-6 text-center">
                    <CardTitle className="text-lg mb-2">Unable to load invites</CardTitle>
                    <CardDescription className="text-sm text-red-500 mb-4">{error}</CardDescription>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchInvites}
                    >
                        Retry
                    </Button>
                </Card>
            )}

            {!isLoading && !error && invites.length === 0 && (
                <Card className="p-6 text-center">
                    <CardTitle className="text-lg mb-2">No pending invites</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                        When studios invite you to join, you&apos;ll see them here.
                    </CardDescription>
                </Card>
            )}

            {!isLoading && !error && invites.length > 0 && (
                <div className="space-y-3">
                    {invites.map((invite) => (
                        <Card key={invite.id}>
                            <CardHeader className="flex flex-row items-start justify-between gap-4">
                                <div className="min-w-0 space-y-1">
                                    <CardTitle className="text-base font-semibold truncate">
                                        {invite.studios?.name ?? "A studio"} invited you
                                    </CardTitle>
                                    <CardDescription className="text-sm">
                                        Role:{" "}
                                        <span className="capitalize font-medium">
                                            {invite.role}
                                        </span>
                                        {invite.studios?.handle && (
                                            <>
                                                {" "}
                                                • <span>@{invite.studios.handle}</span>
                                            </>
                                        )}
                                    </CardDescription>
                                    {invite.invited_at && (
                                        <p className="text-xs text-muted-foreground">
                                            Invited{" "}
                                            {new Date(invite.invited_at).toLocaleDateString(
                                                undefined,
                                                {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric"
                                                }
                                            )}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-3 flex-shrink-0">
                                    <Badge
                                        variant="secondary"
                                        className="capitalize"
                                    >
                                        {invite.status}
                                    </Badge>
                                    <Button
                                        size="sm"
                                        onClick={() => handleAccept(invite.id)}
                                    >
                                        Accept
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0 pb-4 text-xs text-muted-foreground">
                                {/* extra metadata can live here later if needed */}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
