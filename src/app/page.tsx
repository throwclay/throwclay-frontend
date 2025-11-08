"use client";

import { useState, createContext, useContext } from "react";
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
import type { User, Studio, PotteryEntry, StudioLocation } from "@/types";
import { getSubscriptionLimits } from "@/utils/subscriptions";

import { supabase } from "@/lib/apis/supabaseClient";

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  currentStudio: Studio | null;
  setCurrentStudio: (studio: Studio | null) => void;
  currentThrow?: PotteryEntry | null;
  setCurrentThrow?: (throwEntry: PotteryEntry | null) => void;
  updateThrow?: (throwEntry: PotteryEntry) => void;
  navigateToPage?: (page: string) => void;
}

// const AppContext = createContext<AppContextType | undefined>(undefined);

// export function useAppContext() {
//   const context = useContext(AppContext);
//   if (context === undefined) {
//     throw new Error("useAppContext must be used within an AppProvider");
//   }
//   return context;
// }

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentStudio, setCurrentStudio] = useState<Studio | null>(null);
  const [currentPage, setCurrentPage] = useState("landing");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentThrow, setCurrentThrow] = useState<PotteryEntry | null>(null);

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

  const handleLogin = async (userData: {
    email: string;
    userType: "artist" | "studio";
  }) => {
    // 1) Get the authenticated user from Supabase
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("handleLogin: no Supabase user", userError);
      // You might want a toast or UI error here instead
      return;
    }

    // 2) Fetch their profile row from public.profiles
    const { data: profileRow, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("handleLogin: error fetching profile", profileError);
      // still continue with reasonable fallbacks
    }

    // 3) Derive basic fields with fallbacks
    const email = user.email ?? userData.email;
    const fallbackName = email?.split("@")[0] ?? "Unnamed";
    const name =
      (profileRow as any)?.name ??
      user.user_metadata?.full_name ??
      fallbackName;
    const handle =
      (profileRow as any)?.handle ??
      fallbackName.toLowerCase().replace(/[^a-z0-9_]+/g, "_");
    const type =
      ((profileRow as any)?.type as "artist" | "studio" | null) ??
      userData.userType;

    // 4) Build your front-end User object
    const appUser: User = {
      id: user.id,
      name,
      handle,
      email,
      type,
      // You can wire these later when you add subscriptions/usage
      subscription: undefined,
      subscriptionLimits: undefined,
      usageStats: undefined,
      // Simple default profile object – same shape your ArtistProfile expects
      profile: {
        bio: "",
        socialMedia: {},
        branding: {
          primaryColor: "#030213",
        },
      },
      createdAt: (profileRow as any)?.created_at ?? new Date().toISOString(), // fallback
      lastLogin: (profileRow as any)?.last_login ?? undefined,
      isActive: (profileRow as any)?.is_active ?? true,
    };

    // 5) Store in state
    setCurrentUser(appUser);
    // For now, we don't have real studios yet, so:
    setCurrentStudio(null);

    setIsLoggedIn(true);
    setCurrentPage(type === "studio" ? "dashboard" : "profile");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentStudio(null);
    setCurrentThrow(null);
    setIsLoggedIn(false);
    setCurrentPage("landing");
  };

  const contextValue: AppContextType = {
    currentUser,
    setCurrentUser,
    currentStudio,
    setCurrentStudio,
    currentThrow,
    setCurrentThrow,
    updateThrow,
    navigateToPage,
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
        return currentUser.type === "studio" ? (
          <StudioDashboard />
        ) : (
          <DashboardMockup />
        );
      case "profile":
        return (
          <ArtistProfile
            currentUser={currentUser}
            onProfileUpdated={(updated) => setCurrentUser(updated)}
          />
        );

      case "classes":
        return currentUser.type === "studio" ? (
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
      default:
        return (
          <div className="p-8">
            <h1>Page not found</h1>
          </div>
        );
    }
  };

  return (
    // <AppContext.Provider value={contextValue}>
    <div className="min-h-screen bg-background">
      {isLoggedIn && currentUser && (
        <Navigation
          currentUser={currentUser}
          currentStudio={currentStudio}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onLogout={handleLogout}
        />
      )}
      <main>{renderPage()}</main>
    </div>
    // </AppContext.Provider>
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
