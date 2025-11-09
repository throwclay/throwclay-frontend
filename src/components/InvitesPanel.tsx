import { supabase } from "@/lib/apis/supabaseClient";

interface InvitesPanelProps {
  invites: any[];
  onInvitesChange: (invites: any[]) => void;
}

export function InvitesPanel({ invites, onInvitesChange }: InvitesPanelProps) {
  const handleAccept = async (inviteId: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      console.error("No session, cannot accept invite");
      return;
    }

    const res = await fetch("/api/invites/accept", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ inviteId }),
    });

    if (!res.ok) {
      // toast error
      return;
    }

    // Remove accepted invite from list
    onInvitesChange(invites.filter((i) => i.id !== inviteId));

    // Optionally: refetch memberships or reload page to show new studio
  };

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
      <h1 className="text-2xl font-semibold mb-4">Studio Invites</h1>
      {invites.map((invite) => (
        <div
          key={invite.id}
          className="flex items-center justify-between border rounded-lg p-4"
        >
          <div>
            <p className="font-medium">
              {invite.studios?.name ?? "A studio"} invited you
            </p>
            <p className="text-sm text-muted-foreground">
              Role: {invite.role} • Handle: @{invite.studios?.handle}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              className="btn btn-primary"
              onClick={() => handleAccept(invite.id)}
            >
              Accept
            </button>
            {/* Later: Decline button that marks invite as revoked/declined */}
          </div>
        </div>
      ))}
    </div>
  );
}
