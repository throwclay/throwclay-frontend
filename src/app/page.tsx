"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PotteryJournal } from "@/components/PotteryJournal";
import { WhiteboardEditor } from "@/components/WhiteboardEditor";
import { StudioDashboard } from "@/components/StudioDashboard";
import { ArtistProfile } from "@/components/ArtistProfile";
import { ArtistClasses } from "@/components/ArtistClasses";
import { CommerceMarketplace } from "@/components/CommerceMarketplace";
import { Settings } from "@/components/Settings";
import { ClassesManagement } from "@/components/ClassesManagement";
import { EventsManagement } from "@/components/EventsManagement";
import { MessagingCenter } from "@/components/MessagingCenter";
import { MemberManagement } from "@/components/MemberManagement";
import { StaffManagement } from "@/components/StaffManagement";
import { KilnManagement } from "@/components/KilnManagement";
import { BlogManagement } from "@/components/BlogManagement";
import { GlazeManagement } from "@/components/GlazeManagement";
import { LoginForm } from "@/components/LoginForm";
import { Navigation } from "@/components/Navigation";
import { LandingPage } from "@/components/LandingPage";
import { PublicStudiosDirectory } from "@/components/PublicStudiosDirectory";
import { PublicCeramicsMarketplace } from "@/components/PublicCeramicsMarketplace";
import { InvitesPanel } from "@/components/InvitesPanel";
import type {
  User as UserType,
  Studio,
  PotteryEntry,
  StudioLocation,
} from "@/types";
import { getSubscriptionLimits } from "@/utils/subscriptions";
import { useAppContext } from "./context/AppContext";

import { supabase } from "@/lib/apis/supabaseClient";

export default function Home() {
  const {
    currentUser,
    setCurrentUser,
    currentStudio,
    setCurrentStudio,
    setCurrentThrow,
    authToken,
    setAuthToken,
    pendingInvites,
    setPendingInvites,
  } = useAppContext();

  const [currentPage, setCurrentPage] = useState("landing");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Locations
  const [locations, setLocations] = useState<StudioLocation[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [locationsError, setLocationsError] = useState<string | null>(null);

  // Mock studios data
  const mockStudios: Studio[] = [
    {
      id: "studio_1",
      name: "Clay & Fire Studio",
      handle: "clayandfire",
      email: "hello@clayandfire.com",
      website: "https://clayandfire.com",
      description:
        "A community pottery studio offering classes for all skill levels in the heart of Portland.",
      locations: [
        {
          id: "loc_1",
          name: "Main Studio",
          address: "123 Pottery Lane",
          city: "Portland",
          state: "OR",
          zipCode: "97205",
          phone: "(503) 555-0123",
          email: "main@clayandfire.com",
          manager: "Sarah Martinez",
          capacity: 24,
          amenities: [
            "Wheels",
            "Kilns",
            "Glazing Station",
            "Hand-building Area",
          ],
          isActive: true,
        },
        {
          id: "loc_2",
          name: "Eastside Location",
          address: "456 Arts District Blvd",
          city: "Portland",
          state: "OR",
          zipCode: "97214",
          phone: "(503) 555-0124",
          email: "eastside@clayandfire.com",
          manager: "Mike Chen",
          capacity: 16,
          amenities: ["Wheels", "Raku Kiln", "Outdoor Firing Area"],
          isActive: true,
        },
      ],
      isActive: true,
      plan: "studio-pro",
      createdAt: "2018-06-15T00:00:00Z",
      memberCount: 142,
      classCount: 28,
      glazes: [
        "Clear",
        "Celadon",
        "Iron Red",
        "Copper Green",
        "Matte White",
        "Cobalt Blue",
      ],
      firingSchedule: [
        {
          id: "firing_1",
          type: "Bisque",
          date: "2025-01-20T09:00:00Z",
          temperature: "1000°C",
          capacity: 30,
          bookedSlots: 15,
        },
        {
          id: "firing_2",
          type: "Glaze",
          date: "2025-01-25T09:00:00Z",
          temperature: "1240°C",
          capacity: 25,
          bookedSlots: 20,
        },
      ],
    },
  ];

  const updateThrow = (throwEntry: PotteryEntry) => {
    // In a real app, this would update the backend
    console.log("Updating throw:", throwEntry);
  };

  const navigateToPage = (page: string) => {
    setCurrentPage(page);
  };

  const fetchInvites = async () => {
    if (!authToken) {
      setPendingInvites([]);
      return;
    }

    try {
      const res = await fetch("/api/invites", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("fetchInvites: non-OK response", res.status, body);
        setPendingInvites([]);
        return;
      }

      const data = await res.json();
      setPendingInvites(data.invites ?? []);
    } catch (err) {
      console.error("fetchInvites error", err);
      setPendingInvites([]);
    }
  };

  const fetchLocationsForStudio = async (
    studioId: string,
    token: string
  ): Promise<StudioLocation[]> => {
    console.log(`Fetching Locations | Studio ID: ${studioId}`);

    try {
      const res = await fetch(`/api/studios/${studioId}/locations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("Error fetching studio locations", body);
        return [];
      }

      const body = await res.json();
      const data = (body.locations || []) as StudioLocation[];

      console.log(`Studio Locations: ${data.length}`);
      return data;
    } catch (err) {
      console.error("Error fetching studio locations", err);
      return [];
    }
  };

  const handleLogin = async (userData: {
    email: string;
    phone?: string;
    session: any;
  }) => {
    const { session } = userData;

    if (!session || !session.user) {
      console.error("handleLogin: missing session or user");
      return;
    }

    const user = session.user;

    // 1) Store access token in AppContext for API routes
    setAuthToken(session.access_token);

    // 2) Parallel fetch: profile, active subscription, memberships
    const [
      { data: profileRow, error: profileError },
      { data: profileSub, error: subError },
      { data: memberships, error: membershipError },
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
        studio_id,
        role,
        status,
        studios:studio_id (
          id,
          name,
          handle,
          email,
          description,
          is_active,
          plan,
          created_at
        )
      `
        )
        .eq("user_id", user.id)
        .eq("status", "active"),
    ]);

    console.log(`Prof name: ${profileRow?.name}`);

    if (profileError) {
      console.error("handleLogin: error fetching profile", profileError);
    }
    if (membershipError) {
      console.error("handleLogin: error fetching memberships", membershipError);
    }
    if (subError) {
      console.error("handleLogin: error fetching subscription", subError);
    }

    const email = user.email ?? userData.email;
    const phone = (user as any).phone ?? userData.phone;
    const fallbackName = email?.split("@")[0] ?? "Unnamed";

    const name =
      (profileRow as any)?.name ??
      (user.user_metadata as any)?.full_name ??
      fallbackName;

    const handle =
      (profileRow as any)?.handle ??
      fallbackName.toLowerCase().replace(/[^a-z0-9_]+/g, "_");

    const artistPlan = (profileRow as any)?.artist_plan ?? "artist-free";

    // 3) Build front-end User object
    const appUser: UserType = {
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
          logoUrl: (profileRow as any)?.branding?.logoUrl,
        },
      },
      createdAt: (profileRow as any)?.created_at ?? new Date().toISOString(),
      lastLogin:
        (profileRow as any)?.last_login ?? user.last_sign_in_at ?? undefined,
      isActive: (profileRow as any)?.is_active ?? true,
    };

    console.log(`User ${appUser.name} last logged in ${appUser.lastLogin}`);
    // 4) Build studio (if any memberships)
    let studioForState: Studio | null = null;

    if (memberships && memberships.length > 0) {
      const membership = memberships[0] as any;
      const s = membership.studios;

      if (s) {
        // If you want to keep fetching locations here:
        const studioLocations = await fetchLocationsForStudio(
          s.id,
          session.access_token
        );

        studioForState = {
          id: s.id,
          name: s.name,
          handle: s.handle,
          email: s.email ?? "",
          website: (s as any).website ?? "",
          description: s.description ?? "",
          locations: studioLocations, // or studioLocations if you keep that helper
          isActive: s.is_active ?? true,
          plan: (s.plan as Studio["plan"]) ?? "studio-free",
          createdAt: s.created_at,
          memberCount: 0,
          classCount: 0,
          glazes: [],
          firingSchedule: [],
        };
      }
    }

    // 5) Derive modes
    const hasStudioRole = (memberships ?? []).some((m: any) =>
      ["owner", "admin", "manager", "instructor"].includes(m.role)
    );

    appUser.availableModes = hasStudioRole ? ["artist", "studio"] : ["artist"];
    appUser.activeMode = hasStudioRole ? "studio" : "artist";

    // 6) Push into context + app state
    setCurrentStudio(studioForState);
    setCurrentUser(appUser);
    setIsLoggedIn(true);
    setCurrentPage(appUser.activeMode === "studio" ? "dashboard" : "profile");

    // 7) Optional: fetch invites for nav badge
    // fetchInvites();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentStudio(null);
    setCurrentThrow(null);
    setIsLoggedIn(false);
    setCurrentPage("landing");
  };

  const renderPage = () => {
    if (!isLoggedIn) {
      switch (currentPage) {
        case "login":
          return (
            <LoginForm
              onLogin={handleLogin}
              onBack={() => setCurrentPage("landing")}
            />
          );
        case "studios":
          return <PublicStudiosDirectory onNavigate={setCurrentPage} />;
        case "ceramics":
          return <PublicCeramicsMarketplace onNavigate={setCurrentPage} />;
        default:
          return <LandingPage onNavigate={setCurrentPage} />;
      }
    }

    if (!currentUser)
      return (
        <LoginForm
          onLogin={handleLogin}
          onBack={() => setCurrentPage("landing")}
        />
      );

    switch (currentPage) {
      case "dashboard":
        return currentUser.activeMode === "studio" && currentStudio ? (
          <StudioDashboard />
        ) : (
          <DashboardMockup />
        );
      case "profile":
        return (
          <ArtistProfile
            onProfileUpdated={(updated) => setCurrentUser(updated)}
          />
        );

      case "classes":
        return currentUser.activeMode === "studio" && currentStudio ? (
          <ClassesManagement />
        ) : (
          <ArtistClasses />
        );
      case "journal":
        return <PotteryJournal />;
      case "blog":
        return <BlogManagement />;
      case "whiteboard":
        return <WhiteboardEditor />;
      case "marketplace":
        return <CommerceMarketplace />;
      case "settings":
        return <Settings />;
      case "events":
        return <EventsManagement />;
      case "messages":
        return <MessagingCenter />;
      case "members":
        return <MemberManagement />;
      case "staff":
        return <StaffManagement />;
      case "kilns":
        return <KilnManagement />;
      case "glazes":
        return <GlazeManagement />;
      case "studios":
        return <PublicStudiosDirectory onNavigate={setCurrentPage} />;
      case "ceramics":
        return <PublicCeramicsMarketplace onNavigate={setCurrentPage} />;
      case "invites":
        return <InvitesPanel />;

      default:
        return (
          <div className="p-8">
            <h1>Page not found</h1>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {isLoggedIn && currentUser && (
        <Navigation
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onLogout={handleLogout}
        />
      )}
      <main>{renderPage()}</main>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Artist Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Recent Projects</h3>
            <p className="text-muted-foreground">
              View and manage your pottery projects
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Upcoming Classes</h3>
            <p className="text-muted-foreground">
              Your scheduled pottery classes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Community</h3>
            <p className="text-muted-foreground">
              Connect with other ceramic artists
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Export the AppContext and useAppContext for use in other components
// export { AppContext };
