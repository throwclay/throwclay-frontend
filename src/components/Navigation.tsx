"use client";

import {
    BarChart3,
    Beaker,
    Bell,
    BookOpen,
    Brush,
    Building2,
    Calendar,
    Check,
    ChevronDown,
    Flame,
    GraduationCap,
    Grid3X3,
    Mail,
    MapPin,
    Menu,
    MessageCircle,
    Settings as SettingsIcon,
    ShoppingBag,
    User,
    UserCog,
    Users,
    X,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { useAppContext } from "@/app/context/AppContext";
import { usePathname, useRouter } from "next/navigation";
import { AppGridIcon } from "./AppGridIcon";

export function Navigation() {
    const context = useAppContext();

    const router = useRouter();
    const pathname = usePathname();

    const pendingInvitesCount = context.pendingInvites.filter(
        (i) => i.status === "pending"
    ).length;

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [selectedLocations, setSelectedLocations] = useState<string[]>([
        context.currentStudio?.locations?.[0]?.id || "",
    ]);
    const [showStudioMenu, setShowStudioMenu] = useState(false);

    const toggleLocationSelection = (locationId: string) => {
        setSelectedLocations((prev) =>
            prev.includes(locationId)
                ? prev.filter((id) => id !== locationId)
                : [...prev, locationId]
        );
    };

    const selectAllLocations = () => {
        if (context.currentStudio?.locations) {
            setSelectedLocations(
                context.currentStudio.locations.map((loc) => loc.id)
            );
        }
    };

    const clearLocationSelection = () => {
        setSelectedLocations([]);
    };

    // Main navigation items based on user type
    const getMainNavigationItems = () => {
        if (
            context.currentUser?.activeMode === "studio" &&
            context.currentStudio
        ) {
            return [
                { id: "dashboard", label: "Dashboard", icon: BarChart3 },
                { id: "classes", label: "Classes", icon: GraduationCap },
                { id: "members", label: "Members", icon: Users },
                { id: "staff", label: "Staff", icon: UserCog },
                { id: "blog", label: "Blog", icon: BookOpen },
                { id: "messages", label: "Messages", icon: MessageCircle },
                { id: "profile", label: "Profile", icon: User },
            ];
        } else {
            return [
                { id: "dashboard", label: "Dashboard", icon: BarChart3 },
                {
                    id: "studios",
                    label: "Studios",
                    icon: Building2,
                    description: "Find pottery studios",
                },
                { id: "classes", label: "Classes", icon: GraduationCap },
                { id: "journal", label: "Journal", icon: Brush },
                { id: "blog", label: "Blog", icon: BookOpen },
                { id: "messages", label: "Messages", icon: MessageCircle },
                { id: "profile", label: "Profile", icon: User },
            ];
        }
    };

    // More dropdown items based on user type
    const getMoreItems = () => {
        const invitesItem = {
            id: "invites",
            label: "Invites",
            icon: Mail,
            description: "Studio invitations",
        };
        if (
            context.currentUser?.activeMode === "studio" &&
            context.currentStudio
        ) {
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
                // invitesItem,
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
                    id: "ceramics",
                    label: "Ceramics",
                    icon: Grid3X3,
                    description: "Browse ceramics",
                },
                invitesItem,
            ];
        }
    };

    // Mock notifications data - in real app this would come from API
    const getNotifications = () => [
        {
            id: "1",
            type: "kiln",
            title: "Firing Complete",
            message:
                "Main Electric Kiln has finished firing and is ready for unloading",
            timestamp: "2 minutes ago",
            isRead: false,
        },
        {
            id: "2",
            type: "class",
            title: "New Class Enrollment",
            message: "Sarah Wilson enrolled in Advanced Wheel Throwing",
            timestamp: "1 hour ago",
            isRead: false,
        },
        {
            id: "3",
            type: "membership",
            title: "Membership Renewal",
            message: "Mike Chen renewed their studio membership",
            timestamp: "3 hours ago",
            isRead: true,
        },
    ];

    const mainNavigationItems = getMainNavigationItems();
    const moreAppsItems = getMoreItems();
    const allNavigationItems = [...mainNavigationItems, ...moreAppsItems];
    const notifications = getNotifications();
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const handleLogout = () => {};
    const isCurrentPage = (pageId: string) => pathname.includes(pageId);

    const NavigationContent = () => (
        <div className="flex items-center space-x-2">
            {mainNavigationItems.map((item) => {
                const Icon = item.icon;

                return (
                    <Button
                        key={item.id}
                        variant={isCurrentPage(item.id) ? "default" : "ghost"}
                        size="sm"
                        onClick={() => router.push(`/${item.id}`)}
                        className={
                            isCurrentPage(item.id)
                                ? ""
                                : "text-muted-foreground hover:text-foreground"
                        }
                    >
                        <Icon className="w-4 h-4 mr-2" />
                        {item.label}
                        {item.id === "staff" &&
                            context.currentUser?.activeMode === "studio" &&
                            context.currentStudio && (
                                <Badge
                                    variant="secondary"
                                    className="ml-2 text-xs px-1.5 py-0.5"
                                >
                                    5
                                </Badge>
                            )}
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
                    <DropdownMenuContent
                        align="end"
                        className="w-64"
                    >
                        {moreAppsItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = isCurrentPage(item.id);
                            const isInvites = item.id === "invites";

                            return (
                                <DropdownMenuItem
                                    key={item.id}
                                    onClick={() => router.push(`/${item.id}`)}
                                    className={`cursor-pointer ${
                                        isActive ? "bg-accent" : ""
                                    }`}
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
                                        {isInvites &&
                                            pendingInvitesCount > 0 && (
                                                <Badge
                                                    variant="secondary"
                                                    className="ml-2 text-xs px-1.5 py-0.5"
                                                >
                                                    {pendingInvitesCount}
                                                </Badge>
                                            )}
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
                <DropdownMenuContent
                    align="end"
                    className="w-80"
                >
                    <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold">Notifications</h4>
                            {unreadCount > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="text-xs"
                                >
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
                                        !notification.isRead
                                            ? "bg-accent/30"
                                            : ""
                                    }`}
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
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs"
                            >
                                Mark all as read
                            </Button>
                        </div>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );

    return (
        <nav className="border-b bg-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* Left Section - Brand Only */}
                    <div className="flex items-center">
                        <div className="flex items-center space-x-3">
                            <div
                                className="w-8 h-8 bg-primary flex items-center justify-center"
                                style={{
                                    borderRadius:
                                        "68% 32% 62% 38% / 55% 48% 52% 45%",
                                }}
                            ></div>
                            <span className="text-xl font-bold">
                                Throw Clay
                            </span>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex">
                        <NavigationContent />
                    </div>

                    {/* Right Section - Studio Menu + User Menu */}
                    <div className="flex items-center space-x-4">
                        {/* Studio Menu for Studio Users */}
                        {context.currentUser?.activeMode === "studio" &&
                            context.currentStudio && (
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
                                                @{context.currentStudio.handle}
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
                                                    {context.currentStudio.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    @
                                                    {
                                                        context.currentStudio
                                                            .handle
                                                    }
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {context.currentStudio
                                                        .locations?.length ||
                                                        0}{" "}
                                                    location
                                                    {(context.currentStudio
                                                        .locations?.length ||
                                                        0) !== 1
                                                        ? "s"
                                                        : ""}
                                                </p>
                                            </div>
                                        </div>

                                        <DropdownMenuSeparator />

                                        {/* Location Selection */}
                                        {context.currentStudio.locations &&
                                            context.currentStudio.locations
                                                .length > 0 && (
                                                <>
                                                    <div className="p-4">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h4 className="font-medium text-sm">
                                                                Select Locations
                                                            </h4>
                                                            {context
                                                                .currentStudio
                                                                .locations
                                                                .length > 1 && (
                                                                <div className="flex space-x-2">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={
                                                                            selectAllLocations
                                                                        }
                                                                    >
                                                                        All
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={
                                                                            clearLocationSelection
                                                                        }
                                                                    >
                                                                        Clear
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="space-y-3">
                                                            {context.currentStudio.locations.map(
                                                                (location) => (
                                                                    <div
                                                                        key={
                                                                            location.id
                                                                        }
                                                                        className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent"
                                                                    >
                                                                        {context
                                                                            .currentStudio
                                                                            ?.locations
                                                                            .length >
                                                                        1 ? (
                                                                            <Checkbox
                                                                                checked={selectedLocations.includes(
                                                                                    location.id
                                                                                )}
                                                                                onCheckedChange={() =>
                                                                                    toggleLocationSelection(
                                                                                        location.id
                                                                                    )
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
                                                                                {
                                                                                    location.name
                                                                                }
                                                                            </p>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                {
                                                                                    location.city
                                                                                }

                                                                                ,{" "}
                                                                                {
                                                                                    location.state
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                        {context
                                                                            .currentStudio
                                                                            ?.locations
                                                                            ?.length >
                                                                            1 &&
                                                                            selectedLocations.includes(
                                                                                location.id
                                                                            ) && (
                                                                                <Check className="w-4 h-4 text-primary" />
                                                                            )}
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                        {selectedLocations.length >
                                                            1 && (
                                                            <div className="mt-3 p-3 bg-accent/50 rounded-md">
                                                                <p className="text-xs text-muted-foreground">
                                                                    Bulk
                                                                    operations
                                                                    will apply
                                                                    to{" "}
                                                                    {
                                                                        selectedLocations.length
                                                                    }{" "}
                                                                    selected
                                                                    locations
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <DropdownMenuSeparator />
                                                </>
                                            )}

                                        {/* Studio Actions */}
                                        <DropdownMenuItem
                                            onClick={() =>
                                                router.push("/profile")
                                            }
                                            className="cursor-pointer"
                                        >
                                            <Building2 className="mr-3 h-4 w-4" />
                                            Studio Profile
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                router.push("/settings")
                                            }
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
                                            src={
                                                context.currentUser?.profile
                                                    ?.profileImage
                                            }
                                            alt={context.currentUser?.name}
                                        />
                                        <AvatarFallback>
                                            {context.currentUser?.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-64"
                                align="end"
                                sideOffset={8}
                            >
                                <div className="flex items-center space-x-3 p-4">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage
                                            src={
                                                context.currentUser?.profile
                                                    ?.profileImage
                                            }
                                            alt={context.currentUser?.name}
                                        />
                                        <AvatarFallback>
                                            {context.currentUser?.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col space-y-1 flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate">
                                            {context.currentUser?.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            @{context.currentUser?.handle}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {context.currentUser?.email}
                                        </p>
                                        {context.currentUser?.type ===
                                            "artist" &&
                                            context.currentStudio && (
                                                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                                    <Building2 className="w-3 h-3" />
                                                    <span className="truncate">
                                                        Member of{" "}
                                                        {
                                                            context
                                                                .currentStudio
                                                                .name
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        {context.currentUser?.type ===
                                            "artist" &&
                                            context.currentUser
                                                ?.subscription && (
                                                <Badge
                                                    variant="secondary"
                                                    className="w-fit text-xs"
                                                >
                                                    {context.currentUser
                                                        ?.subscription ===
                                                    "free"
                                                        ? "Free"
                                                        : context.currentUser
                                                              ?.subscription ===
                                                          "passion"
                                                        ? "Passion"
                                                        : context.currentUser
                                                              ?.subscription ===
                                                          "small-artist"
                                                        ? "Artist"
                                                        : "Studio Pro"}
                                                </Badge>
                                            )}
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => router.push("/profile")}
                                    className="cursor-pointer"
                                >
                                    <User className="mr-3 h-4 w-4" />
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => router.push("/settings")}
                                    className="cursor-pointer"
                                >
                                    <SettingsIcon className="mr-3 h-4 w-4" />
                                    Settings
                                </DropdownMenuItem>

                                {context.currentUser?.availableModes?.includes(
                                    "studio"
                                ) && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="cursor-pointer"
                                            onClick={() => {
                                                if (!context.currentUser)
                                                    return;

                                                const nextMode =
                                                    context.currentUser
                                                        ?.activeMode ===
                                                    "studio"
                                                        ? "artist"
                                                        : "studio";

                                                context.setCurrentUser({
                                                    ...context.currentUser,
                                                    activeMode: nextMode,
                                                });
                                            }}
                                        >
                                            {context.currentUser?.activeMode ===
                                            "studio"
                                                ? "Switch to Artist mode"
                                                : "Switch to Studio mode"}
                                        </DropdownMenuItem>
                                    </>
                                )}

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                    onClick={handleLogout}
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
                            onClick={() =>
                                setIsMobileMenuOpen(!isMobileMenuOpen)
                            }
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
                                    const isActive = isCurrentPage(item.id);
                                    const isInvites = item.id === "invites";

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                router.push(`/${item.id}`);
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                isActive
                                                    ? "bg-primary text-primary-foreground"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                            }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="flex-1 text-left">
                                                {item.label}
                                            </span>
                                            {item.id === "staff" &&
                                                context.currentUser
                                                    ?.activeMode === "studio" &&
                                                context.currentStudio && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs px-1.5 py-0.5"
                                                    >
                                                        5
                                                    </Badge>
                                                )}
                                            {isInvites &&
                                                pendingInvitesCount > 0 && (
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
