import { useEffect, useState } from "react";
import { useAppContext } from "@/app/context/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

import type { StudioInvite } from "@/types";

export function InvitesPanel() {
  const {
    authToken,
    currentUser,
    setCurrentUser,
    currentStudio,
    setCurrentStudio,
    refreshInvites,
  } = useAppContext();

  const [invites, setInvites] = useState<StudioInvite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvites = async () => {
    if (!authToken) {
      setError("You must be logged in to view invites.");
      setInvites([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch("/api/invites", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
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
  };

  // 🔁 Load invites on mount
  useEffect(() => {
    fetchInvites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  const handleAccept = async (inviteId: string) => {
    if (!authToken) {
      toast.error("You must be logged in to accept invites.");
      return;
    }
    if (!currentUser) {
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
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ inviteId }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("Accept invite error", body);
        toast.error(body.error || "Failed to accept invite");
        return;
      }

      toast.success("Invite accepted!");

      // 1) Remove accepted invite from local panel state
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));

      // 2) Re-sync user-level pending invites for the bell badge
      await refreshInvites({ status: "pending" });

      // 3) Update the user so:
      //    - My Studios appears (hasStudioMemberships = true)
      //    - Studio mode becomes available if role is owner/admin
      setCurrentUser((prev) => {
        if (!prev) return prev;
        const updated: any = { ...prev };

        // This is what Navigation checks via hasAnyStudioMemberships()
        updated.hasStudioMemberships = true;

        const isStudioRole = ["owner", "admin"].includes(invite.role);

        if (isStudioRole) {
          // Grant studio mode
          const currentModes = updated.availableModes ?? ["artist"];
          if (!currentModes.includes("studio")) {
            updated.availableModes = ["artist", "studio"];
          }

          // We *don't* have to auto-switch them to studio mode;
          // they can toggle from the avatar menu.  if we want
          // to default it, we can uncomment this:
          //
          // if (updated.activeMode !== "studio") {
          //   updated.activeMode = "studio";
          // }
          //
          // For now, we keep them in artist mode so they can
          // see "My Studios" and explore first.
          if (!updated.activeMode) {
            updated.activeMode = "artist";
          }
        }

        return updated;
      });

      // 4) If they didn't have a studio yet, seed currentStudio so the
      //    "Switch to Studio mode" guard can pass for owner/admin.
      if (!currentStudio && invite.studios) {
        setCurrentStudio((prev) => {
          if (prev) return prev; // if someone else already set it, don't stomp

          return {
            id: invite.studios?.id,
            name: invite.studios?.name,
            handle: invite.studios?.handle,
            email: "",
            website: "",
            description: "",
            locations: [], // MyStudios / StudioDashboard can later hydrate this
            isActive: true,
            plan: "studio-solo", // default; backend can override when fetched
            createdAt: new Date().toISOString(),
            memberCount: 0,
            classCount: 0,
            glazes: [],
            firingSchedule: [],
            roleForCurrentUser: invite.role as any,
          };
        });
      }
    } catch (err) {
      console.error("Error accepting invite", err);
      toast.error("Something went wrong accepting the invite");
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">Invites</h1>
        <p className="text-muted-foreground">Please log in to view invites.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center text-muted-foreground">
        Loading invites…
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">Invites</h1>
        <p className="text-sm text-red-500 mb-4">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchInvites}>
          Retry
        </Button>
      </div>
    );
  }

  if (invites.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">Invites</h1>
        <p className="text-muted-foreground">
          You don’t have any pending studio invites.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Studio Invites</h1>
          <p className="text-sm text-muted-foreground">
            These studios have invited you to join.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchInvites}>
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        {invites.map((invite) => (
          <Card key={invite.id} className="p-4">
            <div className="flex w-full items-center justify-between gap-4">
              {/* Left side: studio + role/handle/invited */}
              <div className="min-w-0">
                <p className="font-medium truncate">
                  {invite.studios?.name ?? "A studio"} invited you
                </p>
                <p className="text-sm text-muted-foreground">
                  Role: <span className="capitalize">{invite.role}</span>
                  {invite.studios?.handle && (
                    <>
                      {" "}
                      • Handle: <span>@{invite.studios.handle}</span>
                    </>
                  )}
                </p>
                {invite.invited_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Invited{" "}
                    {new Date(invite.invited_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>

              {/* Right side: status + button */}
              <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-3 flex-shrink-0">
                <Badge variant="secondary" className="capitalize">
                  {invite.status}
                </Badge>
                <Button
                  size="sm"
                  onClick={() => {
                    handleAccept(invite.id);
                  }}
                >
                  Accept
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
