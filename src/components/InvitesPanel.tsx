import { useEffect, useState } from "react";
import { useAppContext } from "@/app/context/AppContext";
import { supabase } from "@/lib/apis/supabaseClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface StudioSummary {
  id: string;
  name: string;
  handle: string;
}

interface StudioInvite {
  id: string;
  email: string;
  role: string;
  status: string;
  invited_at: string | null;
  location_id: string | null;
  membership_type: string | null;
  studios?: StudioSummary | null; // comes from the join in /api/invites
}

export function InvitesPanel() {
  const { authToken, currentUser } = useAppContext();

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

      // Remove accepted invite from local state
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));

      // Optionally: refetch invites or refresh memberships here
      // await fetchInvites();
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
                <Button size="sm" onClick={() => handleAccept(invite.id)}>
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
