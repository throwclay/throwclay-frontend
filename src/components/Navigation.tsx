import { useState } from "react";
import {
  User,
  Building2,
  ShoppingBag,
  BarChart3,
  GraduationCap,
  Calendar,
  MessageCircle,
  Settings as SettingsIcon,
  MapPin,
  Globe,
  Users,
  UserCog,
  Menu,
  X,
  ChevronDown,
  Brush,
  Grid3X3,
  MoreHorizontal,
  Check,
  Flame,
  Bell,
  FileText,
  Beaker,
  BookOpen,
  Mail,
  Package,
  Rss,
} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";

import { useAppContext } from "@/app/context/AppContext";
import { StudioRole, NotificationItem } from "@/types";

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
}

// Custom 3x3 grid component
const AppGridIcon = ({ className }: { className?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Row 1 */}
    <rect x="1" y="1" width="3" height="3" rx="0.5" fill="currentColor" />
    <rect x="6.5" y="1" width="3" height="3" rx="0.5" fill="currentColor" />
    <rect x="12" y="1" width="3" height="3" rx="0.5" fill="currentColor" />

    {/* Row 2 */}
    <rect x="1" y="6.5" width="3" height="3" rx="0.5" fill="currentColor" />
    <rect x="6.5" y="6.5" width="3" height="3" rx="0.5" fill="currentColor" />
    <rect x="12" y="6.5" width="3" height="3" rx="0.5" fill="currentColor" />

    {/* Row 3 */}
    <rect x="1" y="12" width="3" height="3" rx="0.5" fill="currentColor" />
    <rect x="6.5" y="12" width="3" height="3" rx="0.5" fill="currentColor" />
    <rect x="12" y="12" width="3" height="3" rx="0.5" fill="currentColor" />
  </svg>
);

export function Navigation({
  currentPage,
  onPageChange,
  onLogout,
}: NavigationProps) {
  const { currentUser, setCurrentUser, currentStudio, pendingInvites } =
    useAppContext();
  const pendingInvitesCount = pendingInvites.filter(
    (i) => i.status === "pending"
  ).length;

  console.log(`Pending invites: ${pendingInvitesCount}`);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([
    currentStudio?.locations?.[0]?.id || "",
  ]);
  const [showStudioMenu, setShowStudioMenu] = useState(false);

  // If somehow rendered without a user, don't blow up
  if (!currentUser) {
    return null;
  }

  const getSelectedLocationNames = () => {
    if (!currentStudio?.locations) return "No Locations";

    if (selectedLocations.length === 1) {
      return (
        currentStudio.locations.find((loc) => loc.id === selectedLocations[0])
          ?.name || "Location"
      );
    } else if (selectedLocations.length === currentStudio.locations.length) {
      return "All Locations";
    } else {
      return `${selectedLocations.length} Locations`;
    }
  };

  const toggleLocationSelection = (locationId: string) => {
    setSelectedLocations((prev) =>
      prev.includes(locationId)
        ? prev.filter((id) => id !== locationId)
        : [...prev, locationId]
    );
  };

  const selectAllLocations = () => {
    if (currentStudio?.locations) {
      setSelectedLocations(currentStudio.locations.map((loc) => loc.id));
    }
  };

  const clearLocationSelection = () => {
    setSelectedLocations([]);
  };

  const canEnterStudioMode = (user: any, studio: any) => {
    if (!user || !studio) return false;

    // Frontend Studio uses camelCase isActive
    if (studio.isActive === false) return false;

    const role: StudioRole | undefined = (studio as any).roleForCurrentUser;
    if (!role) return false;

    return role === "owner" || role === "admin";
  };

  const hasAnyStudioMemberships = (user: any) =>
    Boolean((user as any)?.hasStudioMemberships);

  // Main navigation items based on user type
  type NavItem = { id: string; label: string; icon: any; description?: string };

  console.log(
    `User is active membership: ${hasAnyStudioMemberships(currentUser)}`
  );

  console.log(
    `User can enter studio mode: ${canEnterStudioMode(
      currentUser,
      currentStudio
    )}`
  );

  const getMainNavigationItems = (): NavItem[] => {
    const isArtistMode = currentUser.activeMode === "artist";
    const inStudioMode =
      currentUser.activeMode === "studio" &&
      !!currentStudio &&
      canEnterStudioMode(currentUser, currentStudio);

    const base: NavItem[] = [
      { id: "dashboard", label: "Dashboard", icon: BarChart3 },
      { id: "feed", label: "Feed", icon: Rss },
      { id: "classes", label: "Classes", icon: GraduationCap },
      { id: "blog", label: "Blog", icon: BookOpen },
      { id: "messages", label: "Messages", icon: MessageCircle },
      // { id: "profile", label: "Profile", icon: User },
    ];

    return [
      base[0],

      // My Studios → artist mode only
      ...(isArtistMode && hasAnyStudioMemberships(currentUser)
        ? [
            {
              id: "mystudios",
              label: "My Studios",
              icon: Building2,
              description: "Your studio resources & community",
            } as NavItem,
          ]
        : []),

      ...base.slice(1),

      // Studio mode (owner/admin) vs artist mode
      ...(inStudioMode
        ? [
            { id: "members", label: "Members", icon: Users },
            { id: "staff", label: "Staff", icon: UserCog },
          ]
        : [{ id: "journal", label: "Journal", icon: Brush }]),
    ];
  };

  // More dropdown items based on user type
  const getMoreItems = () => {
    if (currentUser.activeMode === "studio" && currentStudio) {
      return [
        {
          id: "events",
          label: "Events",
          icon: Calendar,
          description: "Manage studio events",
        },
        {
          id: "kilns",
          label: "Kilns",
          icon: Flame,
          description: "Kiln management & firing schedules",
        },
        {
          id: "glazes",
          label: "Glazes",
          icon: Beaker,
          description: "Track and test glaze recipes",
        },
        {
          id: "marketplace",
          label: "Marketplace",
          icon: ShoppingBag,
          description: "Commerce platform",
        },
        {
          id: "ceramics",
          label: "Ceramics",
          icon: Grid3X3,
          description: "Browse ceramics",
        },
        {
          id: "products",
          label: "Products",
          icon: Package,
          description: "Manage inventory & products for sale",
        },
        {
          id: "documents",
          label: "Documents",
          icon: FileText,
          description: "Policies & instructional materials",
        },
      ];
    } else {
      return [
        {
          id: "marketplace",
          label: "Marketplace",
          icon: ShoppingBag,
          description: "Sell your work",
        },
        {
          id: "studios",
          label: "Studios",
          icon: Building2,
          description: "Find pottery studios",
        },
        {
          id: "ceramics",
          label: "Ceramics",
          icon: Grid3X3,
          description: "Browse ceramics",
        },
      ];
    }
  };

  const getNotifications = (): NotificationItem[] => {
    const inviteNotifications: NotificationItem[] = pendingInvites
      .filter((i) => i.status === "pending" && i.email === currentUser.email)
      .map((invite) => ({
        id: `invite-${invite.id}`,
        type: "invite",
        title: `Studio invite: @${invite.studios?.handle}`,
        message: `You’ve been invited as ${invite.role} at ${invite.studios?.name}`,
        timestamp: new Date(invite.invited_at).toLocaleDateString(),
        isRead: false,
      }));

    const systemNotifications: NotificationItem[] = []; // TODO: Integrate notifications

    return [...inviteNotifications, ...systemNotifications];
  };

  const mainNavigationItems = getMainNavigationItems();
  const moreAppsItems = getMoreItems();
  const allNavigationItems = [...mainNavigationItems, ...moreAppsItems];
  const notifications = getNotifications();
  const baseUnread = notifications.filter(
    (n) => !n.isRead && n.type !== "invite"
  ).length;
  const unreadCount = baseUnread + pendingInvitesCount;

  const NavigationContent = () => (
    <div className="flex items-center space-x-2">
      {/* Main Navigation Items */}
      {mainNavigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;

        return (
          <Button
            key={item.id}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            onClick={() => onPageChange(item.id)}
            className={`${
              isActive ? "" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4 mr-2" />
            {item.label}
            {/* {item.id === "staff" &&
              currentUser.activeMode === "studio" &&
              currentStudio && (
                <Badge
                  variant="secondary"
                  className="ml-2 text-xs px-1.5 py-0.5"
                ></Badge>
              )} */}
          </Button>
        );
      })}

      {/* More Dropdown */}
      {moreAppsItems.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <AppGridIcon className="w-4 h-4 mr-2" />
              Apps
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {moreAppsItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`cursor-pointer ${isActive ? "bg-accent" : ""}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <Icon className="mr-3 h-4 w-4" />
                      <div>
                        <p>{item.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Notifications Bell */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="relative text-muted-foreground hover:text-foreground"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs min-w-[20px]"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Notifications</h4>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`cursor-pointer p-4 ${
                    !notification.isRead ? "bg-accent/30" : ""
                  }`}
                  // Optional: only clickable for non-invite notifications
                  onClick={() => {
                    if (notification.type !== "invite") {
                      // e.g. open Messages or whatever
                    }
                  }}
                >
                  <div className="w-full space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.timestamp}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1 ml-2" />
                      )}
                    </div>

                    {notification.type === "invite" && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPageChange("invites");
                          }}
                        >
                          Review invite
                        </Button>
                        {/* later: Accept/Decline in place, hooked to API */}
                      </div>
                    )}
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            )}
          </div>
          {notifications.length > 0 && (
            <div className="p-3 border-t">
              <Button variant="ghost" size="sm" className="w-full text-xs">
                Mark all as read
              </Button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left Section - Brand Only */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div
                className="w-8 h-8 bg-primary flex items-center justify-center"
                style={{ borderRadius: "68% 32% 62% 38% / 55% 48% 52% 45%" }}
              ></div>
              <span className="text-xl font-bold">Throw Clay</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex">
            <NavigationContent />
          </div>

          {/* Right Section - Studio Menu + User Menu */}
          <div className="flex items-center space-x-4">
            {/* Studio Menu for Studio Users (guarded) */}
            {currentUser.activeMode === "studio" &&
              currentStudio &&
              canEnterStudioMode(currentUser, currentStudio) && (
                <DropdownMenu
                  open={showStudioMenu}
                  onOpenChange={setShowStudioMenu}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-9 px-3 flex items-center space-x-2"
                    >
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        @{currentStudio.handle}
                      </span>
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-80"
                    align="end"
                    sideOffset={8}
                  >
                    {/* Studio Header */}
                    <div className="flex items-center space-x-3 p-4">
                      <Building2 className="w-8 h-8 text-muted-foreground" />
                      <div className="flex flex-col space-y-1 flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {currentStudio.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          @{currentStudio.handle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {currentStudio.locations?.length || 0} location
                          {(currentStudio.locations?.length || 0) !== 1
                            ? "s"
                            : ""}
                        </p>
                      </div>
                    </div>

                    <DropdownMenuSeparator />

                    {/* Location Selection */}
                    {currentStudio.locations &&
                      currentStudio.locations.length > 0 && (
                        <>
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-sm">
                                Select Locations
                              </h4>
                              {currentStudio.locations.length > 1 && (
                                <div className="flex space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={selectAllLocations}
                                  >
                                    All
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearLocationSelection}
                                  >
                                    Clear
                                  </Button>
                                </div>
                              )}
                            </div>
                            <div className="space-y-3">
                              {currentStudio.locations.map((location) => (
                                <div
                                  key={location.id}
                                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent"
                                >
                                  {currentStudio.locations.length > 1 ? (
                                    <Checkbox
                                      checked={selectedLocations.includes(
                                        location.id
                                      )}
                                      onCheckedChange={() =>
                                        toggleLocationSelection(location.id)
                                      }
                                    />
                                  ) : (
                                    <div className="w-4 h-4 flex items-center justify-center">
                                      <Check className="w-3 h-3 text-primary" />
                                    </div>
                                  )}
                                  <MapPin className="w-4 h-4 text-muted-foreground" />
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">
                                      {location.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {location.city}, {location.state}
                                    </p>
                                  </div>
                                  {currentStudio.locations.length > 1 &&
                                    selectedLocations.includes(location.id) && (
                                      <Check className="w-4 h-4 text-primary" />
                                    )}
                                </div>
                              ))}
                            </div>
                            {selectedLocations.length > 1 && (
                              <div className="mt-3 p-3 bg-accent/50 rounded-md">
                                <p className="text-xs text-muted-foreground">
                                  Bulk operations will apply to{" "}
                                  {selectedLocations.length} selected locations
                                </p>
                              </div>
                            )}
                          </div>
                          <DropdownMenuSeparator />
                        </>
                      )}

                    {/* Studio Actions */}
                    <DropdownMenuItem
                      onClick={() => onPageChange("profile")}
                      className="cursor-pointer"
                    >
                      <Building2 className="mr-3 h-4 w-4" />
                      Studio Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onPageChange("settings")}
                      className="cursor-pointer"
                    >
                      <SettingsIcon className="mr-3 h-4 w-4" />
                      Studio Settings
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

            {/* User Avatar Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={currentUser.profile?.profileImage}
                      alt={currentUser.name}
                    />
                    <AvatarFallback>
                      {currentUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" sideOffset={8}>
                <div className="flex items-center space-x-3 p-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={currentUser.profile?.profileImage}
                      alt={currentUser.name}
                    />
                    <AvatarFallback>
                      {currentUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      @{currentUser.handle}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {currentUser.email}
                    </p>
                    {currentUser.type === "artist" && currentStudio && (
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Building2 className="w-3 h-3" />
                        <span className="truncate">
                          Member of {currentStudio.name}
                        </span>
                      </div>
                    )}
                    {currentUser.type === "artist" &&
                      currentUser.subscription && (
                        <Badge variant="secondary" className="w-fit text-xs">
                          {currentUser.subscription === "free"
                            ? "Free"
                            : currentUser.subscription === "passion"
                            ? "Passion"
                            : currentUser.subscription === "small-artist"
                            ? "Artist"
                            : "Studio Pro"}
                        </Badge>
                      )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onPageChange("profile")}
                  className="cursor-pointer"
                >
                  <User className="mr-3 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onPageChange("settings")}
                  className="cursor-pointer"
                >
                  <SettingsIcon className="mr-3 h-4 w-4" />
                  Settings
                </DropdownMenuItem>

                {currentUser.availableModes?.includes("studio") && (
                  <>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => {
                        if (!currentUser) return;

                        // If switching *into* studio, enforce guard.
                        const goingToStudio =
                          currentUser.activeMode !== "studio";
                        if (goingToStudio) {
                          if (
                            !currentStudio ||
                            !canEnterStudioMode(currentUser, currentStudio)
                          ) {
                            // Gentle refusal: I'm routing them to dashboard for now
                            // TODO: (replace alert with toast)
                            alert(
                              "You don’t have permission to enter Studio mode. Ask an owner/admin or open My Studios."
                            );
                            onPageChange("dashboard");
                            return;
                          }
                        }
                        onPageChange("dashboard");
                        setCurrentUser({
                          ...currentUser,
                          activeMode: goingToStudio ? "studio" : "artist",
                        });
                      }}
                    >
                      {currentUser.activeMode === "studio"
                        ? "Switch to Artist mode"
                        : "Switch to Studio mode"}
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={onLogout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t">
            <div className="px-2 py-6 space-y-6">
              {/* Mobile Menu Items - All Items */}
              <div className="grid grid-cols-1 gap-2">
                {allNavigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  const isInvites = item.id === "invites";

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onPageChange(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.id === "staff" &&
                        currentUser.activeMode === "studio" &&
                        currentStudio && (
                          <Badge
                            variant="secondary"
                            className="text-xs px-1.5 py-0.5"
                          >
                            5
                          </Badge>
                        )}
                      {isInvites && pendingInvitesCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="text-xs px-1.5 py-0.5"
                        >
                          {pendingInvitesCount}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
