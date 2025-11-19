"use client";

import { useState } from "react";

import { ArtistProfile } from "@/components/ArtistProfile";
import { ArtistClasses } from "@/components/ArtistClasses";
import { BlogManagement } from "@/components/BlogManagement";
import { Card, CardContent } from "@/components/ui/card";
import { ClassesManagement } from "@/components/ClassesManagement";
import { CommerceMarketplace } from "@/components/CommerceMarketplace";
import { EventsManagement } from "@/components/EventsManagement";
import { GlazeManagement } from "@/components/GlazeManagement";
import { InvitesPanel } from "@/components/InvitesPanel";
import { KilnManagement } from "@/components/KilnManagement";
import { LandingPage } from "@/components/LandingPage";
import { LoginForm } from "@/components/LoginForm";
import { MemberManagement } from "@/components/MemberManagement";
import { MessagingCenter } from "@/components/MessagingCenter";
import { MyStudios } from "@/components/MyStudios";
import { Navigation } from "@/components/Navigation";
import { PotteryJournal } from "@/components/PotteryJournal";
import { PublicStudiosDirectory } from "@/components/PublicStudiosDirectory";
import { PublicCeramicsMarketplace } from "@/components/PublicCeramicsMarketplace";
import { Settings } from "@/components/Settings";
import { StaffManagement } from "@/components/StaffManagement";
import { StudioDashboard } from "@/components/StudioDashboard";
import { WhiteboardEditor } from "@/components/WhiteboardEditor";

import type {
  User as UserType,
  Studio,
  StudioLocation,
  StudioMembership,
} from "@/types";

import { useAppContext } from "./context/AppContext";
import { supabase } from "@/lib/apis/supabaseClient";

export default function Home() {
  const context = useAppContext();

  const [currentPage, setCurrentPage] = useState("landing");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    const accessToken = session.access_token;

    // 1) Store access token in AppContext for API routes
    context.setAuthToken(accessToken);

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

    // Normalize memberships
    const normalizedMemberships: StudioMembership[] = (memberships ?? []).map(
      (m: any): StudioMembership => ({
        id: m.id,
        userId: m.user_id,
        studioId: m.studio_id,
        role: m.role, // StudioRole
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
        studioHandle: m.studios?.handle,
      })
    );

    context.setStudioMemberships(normalizedMemberships);

    let studioForState: Studio | null = null;
    let studioRoleForCurrentUser: string | null = null;
    let membershipForState: StudioMembership | null = null;

    if (normalizedMemberships.length > 0) {
      // For now: just pick the first active membership as the "current" one
      const membership = normalizedMemberships[0];
      const raw = (memberships ?? [])[0] as any; // original row to grab studios + locations
      const s = raw?.studios;

      if (s) {
        studioRoleForCurrentUser = membership.role ?? null;

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
          locations: studioLocations,
          isActive: s.is_active ?? true,
          plan: (s.plan as Studio["plan"]) ?? "studio-free",
          createdAt: s.created_at,
          memberCount: 0,
          classCount: 0,
          glazes: [],
          firingSchedule: [],
          roleForCurrentUser: studioRoleForCurrentUser as any,
        };

        membershipForState = membership;
      }
    }

    // 5) Derive modes
    const hasStudioRole = (memberships ?? []).some((m: any) =>
      ["owner", "admin"].includes(m.role)
    );

    appUser.availableModes = hasStudioRole ? ["artist", "studio"] : ["artist"];
    appUser.activeMode = hasStudioRole ? "studio" : "artist";

    // Did they have *any* studio membership (any role)?
    (appUser as any).hasStudioMemberships = (memberships ?? []).length > 0;

    // 6) Push into context + app state
    context.setCurrentStudio(studioForState);
    context.setCurrentUser(appUser);
    context.setCurrentMembership(membershipForState);
    setIsLoggedIn(true);
    setCurrentPage(appUser.activeMode === "studio" ? "dashboard" : "profile");

    // 7) Fetch user-level invites with the *fresh* token
    await context.refreshInvites({
      status: "pending",
      tokenOverride: accessToken,
    });
  };

  const handleLogout = () => {
    context.setCurrentUser(null);
    context.setCurrentStudio(null);
    context.setAuthToken(null); // clear token
    context.setPendingInvites([]); // clear invites for previous user
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
          return <PublicStudiosDirectory />;
        case "ceramics":
          return <PublicCeramicsMarketplace />;
        default:
          return <LandingPage onNavigate={setCurrentPage} />;
      }
    }

    if (!context.currentUser)
      return (
        <LoginForm
          onLogin={handleLogin}
          onBack={() => setCurrentPage("landing")}
        />
      );

    switch (currentPage) {
      case "dashboard":
        return context.currentUser.activeMode === "studio" &&
          context.currentStudio ? (
          <StudioDashboard />
        ) : (
          <DashboardMockup />
        );
      case "profile":
        return (
          <ArtistProfile
            onProfileUpdated={(updated) => context.setCurrentUser(updated)}
          />
        );

      case "classes":
        return context.currentUser.activeMode === "studio" &&
          context.currentStudio ? (
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
        return <PublicStudiosDirectory />;
      case "ceramics":
        return <PublicCeramicsMarketplace />;
      case "invites":
        return <InvitesPanel />;
      case "mystudios":
        return <MyStudios />;

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
      {isLoggedIn && context.currentUser && (
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
