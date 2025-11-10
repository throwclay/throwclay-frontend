import { useState, useEffect } from "react";
import { useAppContext } from "@/app/context/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function InvitesPanel() {
  const {
    authToken,
    currentUser,
    currentStudio,
    pendingInvites,
    setPendingInvites,
  } = useAppContext();

  const [isLoadingInvites, setIsLoadingInvites] = useState(false);
  const [invitesError, setInvitesError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const fetchInvites = async () => {
    if (!authToken) {
      setInvitesError("You must be logged in to view invites.");
      setPendingInvites([]);
      return;
    }

    try {
      setIsLoadingInvites(true);
      setInvitesError(null);

      const res = await fetch("/api/invites", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setInvitesError(body.error || "Failed to load invites");
        setPendingInvites([]);
        return;
      }

      const body = await res.json();
      setPendingInvites(body.invites || []);
    } catch (err) {
      console.error("Error fetching invites", err);
      setInvitesError("Failed to load invites");
      setPendingInvites([]);
    } finally {
      setIsLoadingInvites(false);
    }
  };

  const handleAccept = async (invite: any) => {
    if (!authToken) {
      toast.error("You must be logged in to accept invites.");
      return;
    }

    setAcceptingId(invite.id);
    try {
      const res = await fetch("/api/invites/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          token: invite.token,
          studioId: currentStudio?.id,
        }), // your accept route expects { token }
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("Accept invite error", body);
        toast.error(body.error || "Failed to accept invite");
        return;
      }

      toast.success("Invite accepted!");

      // Remove from shared list
      setPendingInvites((prev) => prev.filter((i) => i.id !== invite.id));
    } catch (err) {
      console.error("Error accepting invite", err);
      toast.error("Something went wrong accepting the invite");
    } finally {
      setAcceptingId(null);
    }
  };

  useEffect(() => {
    // Load invites when this panel mounts
    fetchInvites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">Invites</h1>
        <p className="text-muted-foreground">
          Please log in to view your studio invites.
        </p>
      </div>
    );
  }

  if (isLoadingInvites && pendingInvites.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">Invites</h1>
        <p className="text-muted-foreground">Loading your invites…</p>
      </div>
    );
  }

  if (invitesError && pendingInvites.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center space-y-3">
        <h1 className="text-2xl font-semibold mb-2">Invites</h1>
        <p className="text-red-500 text-sm">{invitesError}</p>
        <Button variant="outline" size="sm" onClick={fetchInvites}>
          Try again
        </Button>
      </div>
    );
  }

  if (pendingInvites.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center space-y-2">
        <h1 className="text-2xl font-semibold mb-2">Invites</h1>
        <p className="text-muted-foreground">
          You don’t have any pending studio invites.
        </p>
        <Button variant="outline" size="sm" onClick={fetchInvites}>
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold">Studio Invites</h1>
        <Button variant="outline" size="sm" onClick={fetchInvites}>
          Refresh
        </Button>
      </div>

      {pendingInvites.map((invite) => (
        <div
          key={invite.id}
          className="flex items-center justify-between border rounded-lg p-4"
        >
          <div>
            <p className="font-medium">
              {invite.studios?.name ?? "A studio"} invited you
            </p>
            <p className="text-sm text-muted-foreground">
              Role:{" "}
              <span className="capitalize">
                {invite.role.replace("-", " ")}
              </span>
              {invite.studios?.handle && (
                <>
                  {" "}
                  • Handle: <span>@{invite.studios.handle}</span>
                </>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Invited at{" "}
              {invite.invited_at
                ? new Date(invite.invited_at).toLocaleString()
                : "—"}
            </p>
            {invite.status !== "pending" && (
              <p className="text-xs mt-1">
                <Badge variant="secondary" className="capitalize">
                  {invite.status}
                </Badge>
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={() => handleAccept(invite)}
              disabled={acceptingId === invite.id}
            >
              {acceptingId === invite.id ? "Accepting…" : "Accept"}
            </Button>
            {/* Later: Decline button to mark invite as revoked/declined */}
          </div>
        </div>
      ))}
    </div>
  );
}
