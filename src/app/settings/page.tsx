"use client";
import { useState } from "react";
import {
    User,
    Building2,
    Bell,
    Shield,
    Lock,
    Eye,
    EyeOff,
    CreditCard,
    Globe,
    Users,
    Mail,
    MessageSquare,
    FileText,
    Share2,
    Check,
    Clock,
    X,
    ChevronRight,
    Crown,
    Zap,
    ExternalLink,
    Plus,
    Trash2,
    Edit2,
    AlertCircle,
    CheckCircle2,
    Palette,
    Upload,
    Image as ImageIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppContext } from "@/app/context/AppContext";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { StudioSettings } from "@/components/StudioSettings";
import { InvoicePreview } from "@/components/InvoicePreview";

import { DefaultLayout } from "@/components/layout/DefaultLayout";

interface Role {
    id: string;
    name: string;
    description: string;
    permissions: {
        dashboard: boolean;
        classes: boolean;
        events: boolean;
        calendar: boolean;
        kiln: boolean;
        glaze: boolean;
        members: boolean;
        staff: boolean;
        documents: boolean;
        marketplace: boolean;
        reports: boolean;
        settings: boolean;
    };
}

interface CustomDomain {
    id: string;
    domain: string;
    status: "pending" | "active" | "failed";
    verificationCode: string;
    addedDate: string;
}

export default function Settings() {
    const { currentUser, currentStudio } = useAppContext();
    const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
    const [showDomainDialog, setShowDomainDialog] = useState(false);
    const [showRoleDialog, setShowRoleDialog] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    // Privacy Settings State
    const [privacySettings, setPrivacySettings] = useState({
        profileVisibility: "public" as "public" | "members-only" | "private",
        showEmail: false,
        showPhone: false,
        feedVisibility: "public" as "public" | "members-only" | "private",
        allowComments: true,
        allowSharing: true,
        blogVisibility: "public" as "public" | "members-only" | "private",
        messagesFrom: "everyone" as "everyone" | "members-only" | "following" | "no-one",
        showOnlineStatus: true
    });

    // Notification Settings State
    const [notificationSettings, setNotificationSettings] = useState({
        email: {
            newFollower: true,
            newComment: true,
            newMessage: true,
            classReminder: true,
            eventReminder: true,
            kilnReady: true,
            glazeMixReady: false,
            membershipExpiring: true,
            invoices: true,
            weeklyDigest: false,
            monthlyReport: false,
            marketplaceSales: true,
            marketplaceApprovals: true
        },
        push: {
            newFollower: false,
            newComment: true,
            newMessage: true,
            classReminder: true,
            eventReminder: true,
            kilnReady: true,
            glazeMixReady: false
        },
        inApp: {
            newFollower: true,
            newComment: true,
            newMessage: true,
            classReminder: true,
            eventReminder: true,
            kilnReady: true,
            glazeMixReady: true,
            systemUpdates: true
        }
    });

    // Branding Settings State
    const [brandingSettings, setBrandingSettings] = useState({
        logo: "",
        logoFile: null as File | null,
        secondaryLogo: "",
        secondaryLogoFile: null as File | null,
        tagline: "",
        website: "",
        primaryColor: "#8B5CF6",
        secondaryColor: "#EC4899",
        accentColor: "#F59E0B",
        textColor: "#1F2937",
        backgroundColor: "#FFFFFF",
        fontFamily: "Inter",
        customColors: [] as { name: string; value: string; usage: string }[],
        // Invoice Template Settings
        invoiceHeader: "",
        invoiceFooter: "Thank you for your business!",
        invoiceTerms:
            "Payment is due within 30 days. Please make checks payable to the studio or artist listed above.",
        invoiceNotes: "",
        showLogoOnInvoice: true,
        invoiceNumberPrefix: "INV",
        showStudioInfo: true,
        showArtistInfo: true,
        invoiceLayout: "modern" as "modern" | "classic" | "minimal"
    });

    // Drag and drop states for branding
    const [isDraggingLogo, setIsDraggingLogo] = useState(false);
    const [isDraggingSecondaryLogo, setIsDraggingSecondaryLogo] = useState(false);

    // Payment Plans
    const paymentPlans = {
        studio: [
            {
                id: "studio-starter",
                name: "Starter",
                price: 9,
                memberRange: "1-10 members",
                maxMembers: 10,
                features: [
                    "Up to 10 members",
                    "Basic kiln scheduling",
                    "Class management",
                    "Public profile",
                    "Community feed access"
                ],
                current: currentStudio?.subscription === "starter"
            },
            {
                id: "studio-growing",
                name: "Growing",
                price: 19,
                memberRange: "11-25 members",
                maxMembers: 25,
                features: [
                    "Up to 25 members",
                    "Advanced kiln scheduling",
                    "Class & event management",
                    "Public profile",
                    "Community feed access",
                    "Basic analytics"
                ],
                current: currentStudio?.subscription === "growing"
            },
            {
                id: "studio-pro",
                name: "Professional",
                price: 49,
                memberRange: "26-100 members",
                maxMembers: 100,
                features: [
                    "Up to 100 members",
                    "Advanced kiln & glaze management",
                    "Staff management",
                    "Custom domain",
                    "Analytics & reports",
                    "Priority support",
                    "Marketplace commission: 10%"
                ],
                current: currentStudio?.subscription === "pro"
            },
            {
                id: "studio-enterprise",
                name: "Enterprise",
                price: 149,
                memberRange: "100+ members",
                maxMembers: 999999,
                features: [
                    "Unlimited members",
                    "Multi-location support",
                    "API access",
                    "Custom branding",
                    "Dedicated account manager",
                    "Custom integrations",
                    "Marketplace commission: 5%"
                ],
                current: currentStudio?.subscription === "enterprise"
            }
        ],
        artist: [
            {
                id: "artist-free",
                name: "Free",
                price: 0,
                features: [
                    "Basic pottery journal",
                    "Public profile",
                    "Community feed access",
                    "Join up to 3 studios",
                    "Marketplace listings: 3"
                ],
                current: currentUser?.subscription === "free"
            },
            {
                id: "artist-passion",
                name: "Passion",
                price: 9,
                features: [
                    "Unlimited journal entries",
                    "Custom domain",
                    "Priority listing in marketplace",
                    "Join unlimited studios",
                    "Marketplace listings: 25",
                    "Advanced analytics",
                    "No platform commission on independent sales"
                ],
                current: currentUser?.subscription === "passion"
            },
            {
                id: "artist-small-artist",
                name: "Small Artist",
                price: 19,
                features: [
                    "Everything in Passion",
                    "Custom storefront",
                    "Marketing tools",
                    "SEO optimization",
                    "Email marketing integration",
                    "Unlimited marketplace listings",
                    "Dedicated support"
                ],
                current: currentUser?.subscription === "small-artist"
            },
            {
                id: "artist-studio-pro",
                name: "Studio Pro",
                price: 29,
                features: [
                    "Everything in Small Artist",
                    "Team collaboration tools",
                    "Advanced inventory management",
                    "Multiple studio locations",
                    "White-label solutions",
                    "API access",
                    "Premium support"
                ],
                current: currentUser?.subscription === "studio-pro"
            }
        ]
    };

    // Mock Custom Domains
    const [customDomains, setCustomDomains] = useState<CustomDomain[]>([
        {
            id: "1",
            domain: "clayhaven.art",
            status: "active",
            verificationCode: "TXT-VERIFY-12345",
            addedDate: "2025-06-01"
        }
    ]);

    // Mock Roles
    const [roles, setRoles] = useState<Role[]>([
        {
            id: "1",
            name: "Administrator",
            description: "Full access to all studio features",
            permissions: {
                dashboard: true,
                classes: true,
                events: true,
                calendar: true,
                kiln: true,
                glaze: true,
                members: true,
                staff: true,
                documents: true,
                marketplace: true,
                reports: true,
                settings: true
            }
        },
        {
            id: "2",
            name: "Manager",
            description: "Manage classes, members, and day-to-day operations",
            permissions: {
                dashboard: true,
                classes: true,
                events: true,
                calendar: true,
                kiln: true,
                glaze: true,
                members: true,
                staff: false,
                documents: true,
                marketplace: true,
                reports: true,
                settings: false
            }
        },
        {
            id: "3",
            name: "Instructor",
            description: "Manage assigned classes and view schedules",
            permissions: {
                dashboard: true,
                classes: true,
                events: false,
                calendar: true,
                kiln: false,
                glaze: false,
                members: false,
                staff: false,
                documents: true,
                marketplace: false,
                reports: false,
                settings: false
            }
        },
        {
            id: "4",
            name: "Studio Assistant",
            description: "Basic access to kiln and glaze management",
            permissions: {
                dashboard: true,
                classes: false,
                events: false,
                calendar: true,
                kiln: true,
                glaze: true,
                members: false,
                staff: false,
                documents: true,
                marketplace: false,
                reports: false,
                settings: false
            }
        }
    ]);

    const [newDomain, setNewDomain] = useState("");
    const [newRole, setNewRole] = useState<Partial<Role>>({
        name: "",
        description: "",
        permissions: {
            dashboard: true,
            classes: false,
            events: false,
            calendar: false,
            kiln: false,
            glaze: false,
            members: false,
            staff: false,
            documents: false,
            marketplace: false,
            reports: false,
            settings: false
        }
    });

    const handleAddDomain = () => {
        if (!newDomain) return;
        const domain: CustomDomain = {
            id: Date.now().toString(),
            domain: newDomain,
            status: "pending",
            verificationCode: `TXT-VERIFY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            addedDate: new Date().toISOString()
        };
        setCustomDomains((prev) => [...prev, domain]);
        setNewDomain("");
        setShowDomainDialog(false);
    };

    const handleDeleteDomain = (domainId: string) => {
        setCustomDomains((prev) => prev.filter((d) => d.id !== domainId));
    };

    const handleSaveRole = () => {
        if (editingRole) {
            setRoles((prev) => prev.map((r) => (r.id === editingRole.id ? editingRole : r)));
        } else if (newRole.name && newRole.description) {
            const role: Role = {
                id: Date.now().toString(),
                name: newRole.name,
                description: newRole.description,
                permissions: newRole.permissions as Role["permissions"]
            };
            setRoles((prev) => [...prev, role]);
        }
        setEditingRole(null);
        setNewRole({
            name: "",
            description: "",
            permissions: {
                dashboard: true,
                classes: false,
                events: false,
                calendar: false,
                kiln: false,
                glaze: false,
                members: false,
                staff: false,
                documents: false,
                marketplace: false,
                reports: false,
                settings: false
            }
        });
        setShowRoleDialog(false);
    };

    const handleDeleteRole = (roleId: string) => {
        setRoles((prev) => prev.filter((r) => r.id !== roleId));
    };

    // Branding drag and drop handlers
    const handleLogoDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingLogo(true);
    };

    const handleLogoDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingLogo(false);
    };

    const handleLogoDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleLogoDrop = (e: React.DragEvent, type: "primary" | "secondary") => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingLogo(false);
        setIsDraggingSecondaryLogo(false);

        const files = Array.from(e.dataTransfer.files);
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type.startsWith("image/")) {
                handleLogoFileSelect(file, type);
            } else {
                alert("Please drop an image file");
            }
        }
    };

    const handleLogoFileInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: "primary" | "secondary"
    ) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleLogoFileSelect(files[0], type);
        }
    };

    const handleLogoFileSelect = (file: File, type: "primary" | "secondary") => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (type === "primary") {
                setBrandingSettings((prev) => ({
                    ...prev,
                    logo: reader.result as string,
                    logoFile: file
                }));
            } else {
                setBrandingSettings((prev) => ({
                    ...prev,
                    secondaryLogo: reader.result as string,
                    secondaryLogoFile: file
                }));
            }
        };
        reader.readAsDataURL(file);
    };

    const handleAddCustomColor = () => {
        setBrandingSettings((prev) => ({
            ...prev,
            customColors: [...prev.customColors, { name: "", value: "#000000", usage: "" }]
        }));
    };

    const handleRemoveCustomColor = (index: number) => {
        setBrandingSettings((prev) => ({
            ...prev,
            customColors: prev.customColors.filter((_, i) => i !== index)
        }));
    };

    const handleUpdateCustomColor = (
        index: number,
        field: "name" | "value" | "usage",
        value: string
    ) => {
        setBrandingSettings((prev) => ({
            ...prev,
            customColors: prev.customColors.map((color, i) =>
                i === index ? { ...color, [field]: value } : color
            )
        }));
    };

    const currentPlan =
        currentUser?.type === "studio"
            ? paymentPlans.studio.find((p) => p.current)
            : paymentPlans.artist.find((p) => p.current);

    const hasPaidSubscription =
        currentUser?.type === "studio"
            ? currentStudio?.subscription !== "free"
            : currentUser?.subscription !== "free";

    return (
        <RequireAuth>
        <DefaultLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1>Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your {currentUser.activeMode === "studio" ? "studio" : "account"}{" "}
                        settings and preferences
                    </p>
                </div>
                <Tabs
                    defaultValue={currentUser.activeMode === "studio" ? "studio" : "profile"}
                    className="space-y-6"
                >
                    <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 lg:grid-cols-8">
                        {currentUser.activeMode === "studio" && (
                            <TabsTrigger
                                value="studio"
                                className="flex items-center gap-1 sm:gap-2"
                            >
                                <Building2 className="w-4 h-4" />
                                <span className="text-xs sm:text-sm">Studio</span>
                            </TabsTrigger>
                        )}
                        <TabsTrigger
                            value="profile"
                            className="flex items-center gap-1 sm:gap-2"
                        >
                            <User className="w-4 h-4" />
                            <span className="text-xs sm:text-sm">Profile</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="privacy"
                            className="flex items-center gap-1 sm:gap-2"
                        >
                            <Eye className="w-4 h-4" />
                            <span className="text-xs sm:text-sm">Privacy</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="notifications"
                            className="flex items-center gap-1 sm:gap-2"
                        >
                            <Bell className="w-4 h-4" />
                            <span className="text-xs sm:text-sm">Notifications</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="payment"
                            className="flex items-center gap-1 sm:gap-2"
                        >
                            <CreditCard className="w-4 h-4" />
                            <span className="text-xs sm:text-sm">Payment</span>
                        </TabsTrigger>
                        {hasPaidSubscription && (
                            <TabsTrigger
                                value="domain"
                                className="flex items-center gap-1 sm:gap-2"
                            >
                                <Globe className="w-4 h-4" />
                                <span className="text-xs sm:text-sm">Domain</span>
                            </TabsTrigger>
                        )}
                        {currentUser.activeMode === "studio" && (
                            <TabsTrigger
                                value="roles"
                                className="flex items-center gap-1 sm:gap-2"
                            >
                                <Users className="w-4 h-4" />
                                <span className="text-xs sm:text-sm">Roles</span>
                            </TabsTrigger>
                        )}
                        <TabsTrigger
                            value="security"
                            className="flex items-center gap-1 sm:gap-2"
                        >
                            <Shield className="w-4 h-4" />
                            <span className="text-xs sm:text-sm">Security</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="branding"
                            className="flex items-center gap-1 sm:gap-2"
                        >
                            <Palette className="w-4 h-4" />
                            <span className="text-xs sm:text-sm">Branding</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Studio Settings Tab */}
                    {currentUser.activeMode === "studio" && (
                        <TabsContent value="studio">
                            <StudioSettings />
                        </TabsContent>
                    )}

                    {/* Profile Settings Tab */}
                    <TabsContent
                        value="profile"
                        className="space-y-6"
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>
                                    Update your personal information and profile details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Full Name</Label>
                                        <Input
                                            id="fullName"
                                            defaultValue={currentUser.name}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="handle">Handle</Label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                                                @
                                            </span>
                                            <Input
                                                id="handle"
                                                defaultValue={currentUser.handle}
                                                className="rounded-l-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        defaultValue={currentUser.email}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea
                                        id="bio"
                                        placeholder="Tell us about yourself..."
                                        rows={4}
                                        defaultValue={currentUser.profile?.bio}
                                    />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button variant="outline">Cancel</Button>
                                    <Button>Save Changes</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Privacy Settings Tab */}
                    <TabsContent
                        value="privacy"
                        className="space-y-6"
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Privacy</CardTitle>
                                <CardDescription>
                                    Control who can see your profile and contact information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="profileVisibility">
                                            Profile Visibility
                                        </Label>
                                        <Select
                                            value={privacySettings.profileVisibility}
                                            onValueChange={(value) =>
                                                setPrivacySettings((prev) => ({
                                                    ...prev,
                                                    profileVisibility: value as any
                                                }))
                                            }
                                        >
                                            <SelectTrigger className="mt-2">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="public">
                                                    <div className="flex items-center gap-2">
                                                        <Globe className="w-4 h-4" />
                                                        <div>
                                                            <div className="font-medium">
                                                                Public
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                Anyone can view your profile
                                                            </div>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="members-only">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4" />
                                                        <div>
                                                            <div className="font-medium">
                                                                Members Only
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                Only studio members can view
                                                            </div>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="private">
                                                    <div className="flex items-center gap-2">
                                                        <Lock className="w-4 h-4" />
                                                        <div>
                                                            <div className="font-medium">
                                                                Private
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                Only you can view your profile
                                                            </div>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label>Show Email Address</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Display your email on your public profile
                                            </p>
                                        </div>
                                        <Switch
                                            checked={privacySettings.showEmail}
                                            onCheckedChange={(checked) =>
                                                setPrivacySettings((prev) => ({
                                                    ...prev,
                                                    showEmail: checked
                                                }))
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label>Show Phone Number</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Display your phone number on your public profile
                                            </p>
                                        </div>
                                        <Switch
                                            checked={privacySettings.showPhone}
                                            onCheckedChange={(checked) =>
                                                setPrivacySettings((prev) => ({
                                                    ...prev,
                                                    showPhone: checked
                                                }))
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label>Show Online Status</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Let others see when you're active
                                            </p>
                                        </div>
                                        <Switch
                                            checked={privacySettings.showOnlineStatus}
                                            onCheckedChange={(checked) =>
                                                setPrivacySettings((prev) => ({
                                                    ...prev,
                                                    showOnlineStatus: checked
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Feed Privacy</CardTitle>
                                <CardDescription>
                                    Control who can see and interact with your posts
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <Label htmlFor="feedVisibility">Feed Visibility</Label>
                                    <Select
                                        value={privacySettings.feedVisibility}
                                        onValueChange={(value) =>
                                            setPrivacySettings((prev) => ({
                                                ...prev,
                                                feedVisibility: value as any
                                            }))
                                        }
                                    >
                                        <SelectTrigger className="mt-2">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="public">
                                                Public - Anyone can see
                                            </SelectItem>
                                            <SelectItem value="members-only">
                                                Members Only
                                            </SelectItem>
                                            <SelectItem value="private">
                                                Private - Only you
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>Allow Comments</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Let others comment on your posts
                                        </p>
                                    </div>
                                    <Switch
                                        checked={privacySettings.allowComments}
                                        onCheckedChange={(checked) =>
                                            setPrivacySettings((prev) => ({
                                                ...prev,
                                                allowComments: checked
                                            }))
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>Allow Sharing</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Let others share your posts
                                        </p>
                                    </div>
                                    <Switch
                                        checked={privacySettings.allowSharing}
                                        onCheckedChange={(checked) =>
                                            setPrivacySettings((prev) => ({
                                                ...prev,
                                                allowSharing: checked
                                            }))
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Blog Privacy</CardTitle>
                                <CardDescription>
                                    Control who can read your blog posts
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="blogVisibility">
                                        Default Blog Post Visibility
                                    </Label>
                                    <Select
                                        value={privacySettings.blogVisibility}
                                        onValueChange={(value) =>
                                            setPrivacySettings((prev) => ({
                                                ...prev,
                                                blogVisibility: value as any
                                            }))
                                        }
                                    >
                                        <SelectTrigger className="mt-2">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="public">
                                                Public - Anyone can read
                                            </SelectItem>
                                            <SelectItem value="members-only">
                                                Members Only
                                            </SelectItem>
                                            <SelectItem value="private">
                                                Private - Only you
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        You can override this for individual blog posts
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Messaging Privacy</CardTitle>
                                <CardDescription>Control who can send you messages</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="messagesFrom">Accept Messages From</Label>
                                    <Select
                                        value={privacySettings.messagesFrom}
                                        onValueChange={(value) =>
                                            setPrivacySettings((prev) => ({
                                                ...prev,
                                                messagesFrom: value as any
                                            }))
                                        }
                                    >
                                        <SelectTrigger className="mt-2">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="everyone">Everyone</SelectItem>
                                            <SelectItem value="members-only">
                                                Studio Members Only
                                            </SelectItem>
                                            <SelectItem value="following">
                                                People I Follow
                                            </SelectItem>
                                            <SelectItem value="no-one">No One</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end">
                            <Button>Save Privacy Settings</Button>
                        </div>
                    </TabsContent>

                    {/* Notifications Tab */}
                    <TabsContent
                        value="notifications"
                        className="space-y-6"
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Email Notifications</CardTitle>
                                <CardDescription>
                                    Choose what email notifications you'd like to receive
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>New Follower</Label>
                                        <p className="text-sm text-muted-foreground">
                                            When someone follows you
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notificationSettings.email.newFollower}
                                        onCheckedChange={(checked) =>
                                            setNotificationSettings((prev) => ({
                                                ...prev,
                                                email: { ...prev.email, newFollower: checked }
                                            }))
                                        }
                                    />
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>New Comment</Label>
                                        <p className="text-sm text-muted-foreground">
                                            When someone comments on your posts
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notificationSettings.email.newComment}
                                        onCheckedChange={(checked) =>
                                            setNotificationSettings((prev) => ({
                                                ...prev,
                                                email: { ...prev.email, newComment: checked }
                                            }))
                                        }
                                    />
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>New Message</Label>
                                        <p className="text-sm text-muted-foreground">
                                            When you receive a new direct message
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notificationSettings.email.newMessage}
                                        onCheckedChange={(checked) =>
                                            setNotificationSettings((prev) => ({
                                                ...prev,
                                                email: { ...prev.email, newMessage: checked }
                                            }))
                                        }
                                    />
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>Class Reminders</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Reminders for upcoming classes
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notificationSettings.email.classReminder}
                                        onCheckedChange={(checked) =>
                                            setNotificationSettings((prev) => ({
                                                ...prev,
                                                email: { ...prev.email, classReminder: checked }
                                            }))
                                        }
                                    />
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>Event Reminders</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Reminders for upcoming events
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notificationSettings.email.eventReminder}
                                        onCheckedChange={(checked) =>
                                            setNotificationSettings((prev) => ({
                                                ...prev,
                                                email: { ...prev.email, eventReminder: checked }
                                            }))
                                        }
                                    />
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>Kiln Ready Notifications</Label>
                                        <p className="text-sm text-muted-foreground">
                                            When your pieces are ready for pickup
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notificationSettings.email.kilnReady}
                                        onCheckedChange={(checked) =>
                                            setNotificationSettings((prev) => ({
                                                ...prev,
                                                email: { ...prev.email, kilnReady: checked }
                                            }))
                                        }
                                    />
                                </div>

                                {currentUser.activeMode === "studio" && (
                                    <>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <Label>Glaze Mix Ready</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    When glaze mixes are completed
                                                </p>
                                            </div>
                                            <Switch
                                                checked={notificationSettings.email.glazeMixReady}
                                                onCheckedChange={(checked) =>
                                                    setNotificationSettings((prev) => ({
                                                        ...prev,
                                                        email: {
                                                            ...prev.email,
                                                            glazeMixReady: checked
                                                        }
                                                    }))
                                                }
                                            />
                                        </div>
                                    </>
                                )}

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>Membership Expiring</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Reminders when your membership is about to expire
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notificationSettings.email.membershipExpiring}
                                        onCheckedChange={(checked) =>
                                            setNotificationSettings((prev) => ({
                                                ...prev,
                                                email: {
                                                    ...prev.email,
                                                    membershipExpiring: checked
                                                }
                                            }))
                                        }
                                    />
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>Invoices & Payments</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Payment confirmations and invoice notifications
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notificationSettings.email.invoices}
                                        onCheckedChange={(checked) =>
                                            setNotificationSettings((prev) => ({
                                                ...prev,
                                                email: { ...prev.email, invoices: checked }
                                            }))
                                        }
                                    />
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>Marketplace Sales</Label>
                                        <p className="text-sm text-muted-foreground">
                                            When someone purchases your items
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notificationSettings.email.marketplaceSales}
                                        onCheckedChange={(checked) =>
                                            setNotificationSettings((prev) => ({
                                                ...prev,
                                                email: { ...prev.email, marketplaceSales: checked }
                                            }))
                                        }
                                    />
                                </div>

                                {currentUser.activeMode === "studio" && (
                                    <>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <Label>Marketplace Approvals</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    When artists submit items for approval
                                                </p>
                                            </div>
                                            <Switch
                                                checked={
                                                    notificationSettings.email.marketplaceApprovals
                                                }
                                                onCheckedChange={(checked) =>
                                                    setNotificationSettings((prev) => ({
                                                        ...prev,
                                                        email: {
                                                            ...prev.email,
                                                            marketplaceApprovals: checked
                                                        }
                                                    }))
                                                }
                                            />
                                        </div>
                                    </>
                                )}

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>Weekly Digest</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Weekly summary of activity and updates
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notificationSettings.email.weeklyDigest}
                                        onCheckedChange={(checked) =>
                                            setNotificationSettings((prev) => ({
                                                ...prev,
                                                email: { ...prev.email, weeklyDigest: checked }
                                            }))
                                        }
                                    />
                                </div>

                                {currentUser.activeMode === "studio" && (
                                    <>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <Label>Monthly Report</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Monthly analytics and studio performance report
                                                </p>
                                            </div>
                                            <Switch
                                                checked={notificationSettings.email.monthlyReport}
                                                onCheckedChange={(checked) =>
                                                    setNotificationSettings((prev) => ({
                                                        ...prev,
                                                        email: {
                                                            ...prev.email,
                                                            monthlyReport: checked
                                                        }
                                                    }))
                                                }
                                            />
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Push Notifications</CardTitle>
                                <CardDescription>
                                    Receive push notifications on your devices
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>New Comment</Label>
                                        <p className="text-sm text-muted-foreground">
                                            When someone comments on your posts
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notificationSettings.push.newComment}
                                        onCheckedChange={(checked) =>
                                            setNotificationSettings((prev) => ({
                                                ...prev,
                                                push: { ...prev.push, newComment: checked }
                                            }))
                                        }
                                    />
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>New Message</Label>
                                        <p className="text-sm text-muted-foreground">
                                            When you receive a new direct message
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notificationSettings.push.newMessage}
                                        onCheckedChange={(checked) =>
                                            setNotificationSettings((prev) => ({
                                                ...prev,
                                                push: { ...prev.push, newMessage: checked }
                                            }))
                                        }
                                    />
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>Class & Event Reminders</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Reminders for upcoming classes and events
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notificationSettings.push.classReminder}
                                        onCheckedChange={(checked) =>
                                            setNotificationSettings((prev) => ({
                                                ...prev,
                                                push: { ...prev.push, classReminder: checked }
                                            }))
                                        }
                                    />
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>Kiln Ready</Label>
                                        <p className="text-sm text-muted-foreground">
                                            When your pieces are ready for pickup
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notificationSettings.push.kilnReady}
                                        onCheckedChange={(checked) =>
                                            setNotificationSettings((prev) => ({
                                                ...prev,
                                                push: { ...prev.push, kilnReady: checked }
                                            }))
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>In-App Notifications</CardTitle>
                                <CardDescription>
                                    Notifications that appear within the application
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>All Activity</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Comments, follows, messages, and interactions
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notificationSettings.inApp.newComment}
                                        onCheckedChange={(checked) =>
                                            setNotificationSettings((prev) => ({
                                                ...prev,
                                                inApp: { ...prev.inApp, newComment: checked }
                                            }))
                                        }
                                    />
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>System Updates</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Platform updates and announcements
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notificationSettings.inApp.systemUpdates}
                                        onCheckedChange={(checked) =>
                                            setNotificationSettings((prev) => ({
                                                ...prev,
                                                inApp: { ...prev.inApp, systemUpdates: checked }
                                            }))
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end">
                            <Button>Save Notification Settings</Button>
                        </div>
                    </TabsContent>

                    {/* Payment Tab */}
                    <TabsContent
                        value="payment"
                        className="space-y-6"
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Current Plan</CardTitle>
                                <CardDescription>
                                    Your current Throw Clay subscription
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {currentPlan && (
                                    <div className="flex items-center justify-between p-6 border rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                {currentPlan.name === "Free" ? (
                                                    <CreditCard className="w-6 h-6 text-primary" />
                                                ) : (
                                                    <Crown className="w-6 h-6 text-primary" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium">
                                                        {currentPlan.name}
                                                    </h3>
                                                    <Badge variant="secondary">Current Plan</Badge>
                                                </div>
                                                <p className="text-2xl font-bold mt-1">
                                                    ${currentPlan.price}
                                                    <span className="text-sm font-normal text-muted-foreground">
                                                        /month
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        {currentPlan.name !== "Free" && (
                                            <Button variant="outline">Manage Subscription</Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium">Available Plans</h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowUpgradeDialog(true)}
                                >
                                    Compare Plans
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {(currentUser.activeMode === "studio"
                                    ? paymentPlans.studio
                                    : paymentPlans.artist
                                ).map((plan) => (
                                    <Card
                                        key={plan.id}
                                        className={plan.current ? "border-primary shadow-sm" : ""}
                                    >
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle>{plan.name}</CardTitle>
                                                {plan.current && <Badge>Current</Badge>}
                                            </div>
                                            <div className="mt-4">
                                                <span className="text-3xl font-bold">
                                                    ${plan.price}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    /month
                                                </span>
                                                {currentUser.activeMode === "studio" &&
                                                    (plan as any).memberRange && (
                                                        <p className="text-sm text-muted-foreground mt-2">
                                                            {(plan as any).memberRange}
                                                        </p>
                                                    )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <ul className="space-y-2">
                                                {plan.features.map((feature, idx) => (
                                                    <li
                                                        key={idx}
                                                        className="flex items-start gap-2 text-sm"
                                                    >
                                                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            {!plan.current && (
                                                <Button
                                                    className="w-full"
                                                    onClick={() => setShowUpgradeDialog(true)}
                                                >
                                                    {plan.price > (currentPlan?.price || 0)
                                                        ? "Upgrade"
                                                        : "Downgrade"}
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {currentPlan && currentPlan.name !== "Free" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment Method</CardTitle>
                                    <CardDescription>Manage your payment methods</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                <CreditCard className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Visa •••• 4242</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Expires 12/2026
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Edit2 className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Payment Method
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {currentPlan && currentPlan.name !== "Free" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Billing Address</CardTitle>
                                    <CardDescription>
                                        Address associated with your payment method
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="billingName">Full Name</Label>
                                            <Input
                                                id="billingName"
                                                defaultValue={currentUser.name}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="billingEmail">Email</Label>
                                            <Input
                                                id="billingEmail"
                                                type="email"
                                                defaultValue={currentUser.email}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="billingAddress">Street Address</Label>
                                        <Input
                                            id="billingAddress"
                                            placeholder="123 Main Street"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="billingCity">City</Label>
                                            <Input
                                                id="billingCity"
                                                placeholder="San Francisco"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="billingState">State</Label>
                                            <Input
                                                id="billingState"
                                                placeholder="CA"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="billingZip">Zip Code</Label>
                                            <Input
                                                id="billingZip"
                                                placeholder="94102"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="billingCountry">Country</Label>
                                        <Select defaultValue="US">
                                            <SelectTrigger id="billingCountry">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="US">United States</SelectItem>
                                                <SelectItem value="CA">Canada</SelectItem>
                                                <SelectItem value="GB">United Kingdom</SelectItem>
                                                <SelectItem value="AU">Australia</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline">Cancel</Button>
                                        <Button>Save Address</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {currentPlan && currentPlan.name !== "Free" && (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle>Invoice History</CardTitle>
                                            <CardDescription>
                                                View and download your Throw Clay subscription
                                                invoices
                                            </CardDescription>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                        >
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            Download All
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {[
                                            {
                                                id: "INV-2025-11",
                                                date: "Nov 1, 2025",
                                                amount: currentPlan.price,
                                                status: "paid",
                                                period: "Nov 2025"
                                            },
                                            {
                                                id: "INV-2025-10",
                                                date: "Oct 1, 2025",
                                                amount: currentPlan.price,
                                                status: "paid",
                                                period: "Oct 2025"
                                            },
                                            {
                                                id: "INV-2025-09",
                                                date: "Sep 1, 2025",
                                                amount: currentPlan.price,
                                                status: "paid",
                                                period: "Sep 2025"
                                            },
                                            {
                                                id: "INV-2025-08",
                                                date: "Aug 1, 2025",
                                                amount: currentPlan.price,
                                                status: "paid",
                                                period: "Aug 2025"
                                            },
                                            {
                                                id: "INV-2025-07",
                                                date: "Jul 1, 2025",
                                                amount: currentPlan.price,
                                                status: "paid",
                                                period: "Jul 2025"
                                            },
                                            {
                                                id: "INV-2025-06",
                                                date: "Jun 1, 2025",
                                                amount: currentPlan.price,
                                                status: "paid",
                                                period: "Jun 2025"
                                            }
                                        ].map((invoice) => (
                                            <div
                                                key={invoice.id}
                                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                        <FileText className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-medium">
                                                                {invoice.id}
                                                            </p>
                                                            <Badge
                                                                variant="secondary"
                                                                className="bg-green-100 text-green-800 hover:bg-green-100"
                                                            >
                                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                {invoice.status
                                                                    .charAt(0)
                                                                    .toUpperCase() +
                                                                    invoice.status.slice(1)}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {invoice.date} • {invoice.period} •{" "}
                                                            {currentPlan.name} Plan
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <p className="font-semibold text-lg">
                                                        ${invoice.amount.toFixed(2)}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            View
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            <ExternalLink className="w-4 h-4 mr-2" />
                                                            Download
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Custom Domain Tab */}
                    {hasPaidSubscription && (
                        <TabsContent
                            value="domain"
                            className="space-y-6"
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>Custom Domain</CardTitle>
                                    <CardDescription>
                                        Connect your custom domain to redirect to your{" "}
                                        {currentUser.activeMode === "studio" ? "studio" : "artist"}{" "}
                                        profile
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex gap-3">
                                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div className="space-y-2 text-sm">
                                                <p className="font-medium text-blue-900">
                                                    How it works:
                                                </p>
                                                <ol className="list-decimal list-inside space-y-1 text-blue-800">
                                                    <li>Add your custom domain below</li>
                                                    <li>
                                                        Add the provided DNS records to your domain
                                                        registrar
                                                    </li>
                                                    <li>
                                                        Wait for verification (usually takes 24-48
                                                        hours)
                                                    </li>
                                                    <li>
                                                        Your domain will redirect to your Throw Clay
                                                        profile
                                                    </li>
                                                </ol>
                                            </div>
                                        </div>
                                    </div>

                                    {customDomains.length > 0 && (
                                        <div className="space-y-3">
                                            {customDomains.map((domain) => (
                                                <div
                                                    key={domain.id}
                                                    className="border rounded-lg p-4"
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <Globe className="w-5 h-5 text-muted-foreground" />
                                                            <div>
                                                                <p className="font-medium">
                                                                    {domain.domain}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Added{" "}
                                                                    {new Date(
                                                                        domain.addedDate
                                                                    ).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {domain.status === "active" && (
                                                                <Badge className="bg-green-100 text-green-800">
                                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                    Active
                                                                </Badge>
                                                            )}
                                                            {domain.status === "pending" && (
                                                                <Badge className="bg-yellow-100 text-yellow-800">
                                                                    <Clock className="w-3 h-3 mr-1" />
                                                                    Pending
                                                                </Badge>
                                                            )}
                                                            {domain.status === "failed" && (
                                                                <Badge className="bg-red-100 text-red-800">
                                                                    <X className="w-3 h-3 mr-1" />
                                                                    Failed
                                                                </Badge>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleDeleteDomain(domain.id)
                                                                }
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {domain.status === "pending" && (
                                                        <div className="bg-muted p-3 rounded text-sm space-y-2">
                                                            <p className="font-medium">
                                                                DNS Configuration Required:
                                                            </p>
                                                            <div className="space-y-1 font-mono text-xs">
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">
                                                                        Type:
                                                                    </span>
                                                                    <span>CNAME</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">
                                                                        Name:
                                                                    </span>
                                                                    <span>@</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">
                                                                        Value:
                                                                    </span>
                                                                    <span>proxy.throwclay.com</span>
                                                                </div>
                                                            </div>
                                                            <div className="pt-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="w-full"
                                                                >
                                                                    Verify DNS
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {domain.status === "active" && (
                                                        <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                                                            <p className="text-green-800">
                                                                <CheckCircle2 className="w-4 h-4 inline mr-1" />
                                                                Domain is active and redirecting to
                                                                your profile
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <Button
                                        onClick={() => setShowDomainDialog(true)}
                                        className="w-full"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Custom Domain
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Domain Limits</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Domains Used:
                                            </span>
                                            <span className="font-medium">
                                                {customDomains.length} / 5
                                            </span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className="bg-primary h-2 rounded-full transition-all"
                                                style={{
                                                    width: `${(customDomains.length / 5) * 100}%`
                                                }}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Upgrade to Enterprise for unlimited custom domains
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}

                    {/* Roles Tab (Studio Only) */}
                    {currentUser.activeMode === "studio" && (
                        <TabsContent
                            value="roles"
                            className="space-y-6"
                        >
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Staff Roles & Permissions</CardTitle>
                                            <CardDescription>
                                                Manage staff roles and their access levels. These
                                                roles will be available when adding new staff
                                                members.
                                            </CardDescription>
                                        </div>
                                        <Button
                                            onClick={() => {
                                                setEditingRole(null);
                                                setShowRoleDialog(true);
                                            }}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Role
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {roles.map((role) => (
                                        <div
                                            key={role.id}
                                            className="border rounded-lg p-4"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-medium">{role.name}</h4>
                                                        {role.name === "Administrator" && (
                                                            <Badge variant="secondary">
                                                                Default
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {role.description}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingRole(role);
                                                            setShowRoleDialog(true);
                                                        }}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    {role.name !== "Administrator" && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDeleteRole(role.id)
                                                            }
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                                {Object.entries(role.permissions).map(
                                                    ([key, value]) => (
                                                        <div
                                                            key={key}
                                                            className="flex items-center gap-2"
                                                        >
                                                            {value ? (
                                                                <Check className="w-4 h-4 text-green-600" />
                                                            ) : (
                                                                <X className="w-4 h-4 text-muted-foreground" />
                                                            )}
                                                            <span
                                                                className={
                                                                    value
                                                                        ? ""
                                                                        : "text-muted-foreground"
                                                                }
                                                            >
                                                                {key.charAt(0).toUpperCase() +
                                                                    key.slice(1)}
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Role Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                                        <p className="font-medium">Permission Levels:</p>
                                        <ul className="space-y-1 text-muted-foreground">
                                            <li className="flex items-start gap-2">
                                                <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                <span>
                                                    <strong>Dashboard:</strong> View studio overview
                                                    and analytics
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                <span>
                                                    <strong>Classes & Events:</strong> Create and
                                                    manage classes/events
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                <span>
                                                    <strong>Calendar:</strong> View and manage
                                                    studio calendar
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                <span>
                                                    <strong>Kiln & Glaze:</strong> Manage kiln
                                                    schedules and glaze inventory
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                <span>
                                                    <strong>Members & Staff:</strong> Manage member
                                                    and staff accounts
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                <span>
                                                    <strong>Settings:</strong> Full administrative
                                                    access to studio settings
                                                </span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <p className="text-sm text-yellow-800">
                                            <AlertCircle className="w-4 h-4 inline mr-1" />
                                            <strong>Note:</strong> The Administrator role cannot be
                                            deleted or have Settings access removed.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}

                    {/* Security Tab */}
                    <TabsContent
                        value="security"
                        className="space-y-6"
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Change Password</CardTitle>
                                <CardDescription>
                                    Update your password to keep your account secure
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                    />
                                </div>
                                <Button>Update Password</Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Two-Factor Authentication</CardTitle>
                                <CardDescription>
                                    Add an extra layer of security to your account
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-1">
                                        <Label>Two-Factor Authentication</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Protect your account with 2FA
                                        </p>
                                    </div>
                                    <Button variant="outline">Enable 2FA</Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Active Sessions</CardTitle>
                                <CardDescription>
                                    Manage your active sessions across devices
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Current Session</p>
                                            <p className="text-sm text-muted-foreground">
                                                Chrome on Mac • San Francisco, CA
                                            </p>
                                        </div>
                                    </div>
                                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                >
                                    Sign Out All Other Sessions
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-destructive">
                            <CardHeader>
                                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                                <CardDescription>
                                    Irreversible actions for your account
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    variant="destructive"
                                    className="w-full"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Account
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Branding Tab */}
                    <TabsContent
                        value="branding"
                        className="space-y-6"
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Brand Identity</CardTitle>
                                <CardDescription>
                                    Manage your logos, colors, and branding elements that appear on
                                    invoices, documents, and your public profile
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Primary Logo Upload */}
                                <div className="space-y-3">
                                    <Label>Primary Logo</Label>
                                    <div
                                        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                                            isDraggingLogo
                                                ? "border-primary bg-primary/5"
                                                : brandingSettings.logo
                                                  ? "border-green-500 bg-green-50 dark:bg-green-900/10"
                                                  : "border-muted-foreground/25 hover:border-primary hover:bg-accent/50"
                                        }`}
                                        onDragEnter={handleLogoDragEnter}
                                        onDragOver={handleLogoDragOver}
                                        onDragLeave={handleLogoDragLeave}
                                        onDrop={(e) => handleLogoDrop(e, "primary")}
                                        onClick={() =>
                                            document.getElementById("logo-file-input")?.click()
                                        }
                                    >
                                        <input
                                            id="logo-file-input"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) =>
                                                handleLogoFileInputChange(e, "primary")
                                            }
                                            className="hidden"
                                        />

                                        {brandingSettings.logo ? (
                                            <div className="space-y-3">
                                                <div className="relative mx-auto max-w-xs h-32 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                                                    <img
                                                        src={brandingSettings.logo}
                                                        alt="Primary Logo"
                                                        className="max-h-full max-w-full object-contain"
                                                    />
                                                </div>
                                                <div className="flex items-center justify-center space-x-2 text-sm text-green-600 dark:text-green-400">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span className="font-medium">
                                                        {brandingSettings.logoFile?.name ||
                                                            "Logo uploaded"}
                                                    </span>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setBrandingSettings((prev) => ({
                                                            ...prev,
                                                            logo: "",
                                                            logoFile: null
                                                        }));
                                                    }}
                                                >
                                                    <X className="w-4 h-4 mr-2" />
                                                    Remove
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="flex justify-center">
                                                    <div
                                                        className={`rounded-full p-3 ${
                                                            isDraggingLogo
                                                                ? "bg-primary/10"
                                                                : "bg-muted"
                                                        }`}
                                                    >
                                                        <ImageIcon
                                                            className={`w-6 h-6 ${
                                                                isDraggingLogo
                                                                    ? "text-primary"
                                                                    : "text-muted-foreground"
                                                            }`}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-medium text-sm">
                                                        {isDraggingLogo
                                                            ? "Drop your logo here"
                                                            : "Drag and drop your primary logo"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        or click to browse • PNG, SVG, JPG
                                                        recommended
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Used in invoices, documents, email headers, and your public
                                        profile
                                    </p>
                                </div>

                                {/* Secondary Logo Upload */}
                                <div className="space-y-3">
                                    <Label>Secondary Logo (Optional)</Label>
                                    <div
                                        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                                            isDraggingSecondaryLogo
                                                ? "border-primary bg-primary/5"
                                                : brandingSettings.secondaryLogo
                                                  ? "border-green-500 bg-green-50 dark:bg-green-900/10"
                                                  : "border-muted-foreground/25 hover:border-primary hover:bg-accent/50"
                                        }`}
                                        onDragEnter={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setIsDraggingSecondaryLogo(true);
                                        }}
                                        onDragOver={handleLogoDragOver}
                                        onDragLeave={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setIsDraggingSecondaryLogo(false);
                                        }}
                                        onDrop={(e) => handleLogoDrop(e, "secondary")}
                                        onClick={() =>
                                            document
                                                .getElementById("secondary-logo-file-input")
                                                ?.click()
                                        }
                                    >
                                        <input
                                            id="secondary-logo-file-input"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) =>
                                                handleLogoFileInputChange(e, "secondary")
                                            }
                                            className="hidden"
                                        />

                                        {brandingSettings.secondaryLogo ? (
                                            <div className="space-y-3">
                                                <div className="relative mx-auto max-w-xs h-32 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                                                    <img
                                                        src={brandingSettings.secondaryLogo}
                                                        alt="Secondary Logo"
                                                        className="max-h-full max-w-full object-contain"
                                                    />
                                                </div>
                                                <div className="flex items-center justify-center space-x-2 text-sm text-green-600 dark:text-green-400">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span className="font-medium">
                                                        {brandingSettings.secondaryLogoFile?.name ||
                                                            "Logo uploaded"}
                                                    </span>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setBrandingSettings((prev) => ({
                                                            ...prev,
                                                            secondaryLogo: "",
                                                            secondaryLogoFile: null
                                                        }));
                                                    }}
                                                >
                                                    <X className="w-4 h-4 mr-2" />
                                                    Remove
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="flex justify-center">
                                                    <div
                                                        className={`rounded-full p-3 ${
                                                            isDraggingSecondaryLogo
                                                                ? "bg-primary/10"
                                                                : "bg-muted"
                                                        }`}
                                                    >
                                                        <ImageIcon
                                                            className={`w-6 h-6 ${
                                                                isDraggingSecondaryLogo
                                                                    ? "text-primary"
                                                                    : "text-muted-foreground"
                                                            }`}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-medium text-sm">
                                                        {isDraggingSecondaryLogo
                                                            ? "Drop your logo here"
                                                            : "Drag and drop an alternate logo"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        or click to browse • PNG, SVG, JPG
                                                        recommended
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Alternate version for different backgrounds or use cases
                                    </p>
                                </div>

                                <Separator />

                                {/* Tagline & Website */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="tagline">Tagline</Label>
                                        <Input
                                            id="tagline"
                                            value={brandingSettings.tagline}
                                            onChange={(e) =>
                                                setBrandingSettings((prev) => ({
                                                    ...prev,
                                                    tagline: e.target.value
                                                }))
                                            }
                                            placeholder="e.g., Crafting beauty from clay"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Appears below your logo on documents
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="website">Website</Label>
                                        <Input
                                            id="website"
                                            value={brandingSettings.website}
                                            onChange={(e) =>
                                                setBrandingSettings((prev) => ({
                                                    ...prev,
                                                    website: e.target.value
                                                }))
                                            }
                                            placeholder="https://yourstudio.com"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Shown on invoices and documents
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Color Palette */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Color Palette</CardTitle>
                                <CardDescription>
                                    Define your brand colors for consistent styling across documents
                                    and materials
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Primary Colors */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="primaryColor">Primary Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="primaryColor"
                                                type="color"
                                                value={brandingSettings.primaryColor}
                                                onChange={(e) =>
                                                    setBrandingSettings((prev) => ({
                                                        ...prev,
                                                        primaryColor: e.target.value
                                                    }))
                                                }
                                                className="w-16 h-10 p-1 cursor-pointer"
                                            />
                                            <Input
                                                value={brandingSettings.primaryColor}
                                                onChange={(e) =>
                                                    setBrandingSettings((prev) => ({
                                                        ...prev,
                                                        primaryColor: e.target.value
                                                    }))
                                                }
                                                placeholder="#8B5CF6"
                                                className="flex-1"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Main brand color
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="secondaryColor">Secondary Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="secondaryColor"
                                                type="color"
                                                value={brandingSettings.secondaryColor}
                                                onChange={(e) =>
                                                    setBrandingSettings((prev) => ({
                                                        ...prev,
                                                        secondaryColor: e.target.value
                                                    }))
                                                }
                                                className="w-16 h-10 p-1 cursor-pointer"
                                            />
                                            <Input
                                                value={brandingSettings.secondaryColor}
                                                onChange={(e) =>
                                                    setBrandingSettings((prev) => ({
                                                        ...prev,
                                                        secondaryColor: e.target.value
                                                    }))
                                                }
                                                placeholder="#EC4899"
                                                className="flex-1"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Supporting color
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="accentColor">Accent Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="accentColor"
                                                type="color"
                                                value={brandingSettings.accentColor}
                                                onChange={(e) =>
                                                    setBrandingSettings((prev) => ({
                                                        ...prev,
                                                        accentColor: e.target.value
                                                    }))
                                                }
                                                className="w-16 h-10 p-1 cursor-pointer"
                                            />
                                            <Input
                                                value={brandingSettings.accentColor}
                                                onChange={(e) =>
                                                    setBrandingSettings((prev) => ({
                                                        ...prev,
                                                        accentColor: e.target.value
                                                    }))
                                                }
                                                placeholder="#F59E0B"
                                                className="flex-1"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Highlight color
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                {/* Text & Background */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="textColor">Text Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="textColor"
                                                type="color"
                                                value={brandingSettings.textColor}
                                                onChange={(e) =>
                                                    setBrandingSettings((prev) => ({
                                                        ...prev,
                                                        textColor: e.target.value
                                                    }))
                                                }
                                                className="w-16 h-10 p-1 cursor-pointer"
                                            />
                                            <Input
                                                value={brandingSettings.textColor}
                                                onChange={(e) =>
                                                    setBrandingSettings((prev) => ({
                                                        ...prev,
                                                        textColor: e.target.value
                                                    }))
                                                }
                                                placeholder="#1F2937"
                                                className="flex-1"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Default text color
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="backgroundColor">Background Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="backgroundColor"
                                                type="color"
                                                value={brandingSettings.backgroundColor}
                                                onChange={(e) =>
                                                    setBrandingSettings((prev) => ({
                                                        ...prev,
                                                        backgroundColor: e.target.value
                                                    }))
                                                }
                                                className="w-16 h-10 p-1 cursor-pointer"
                                            />
                                            <Input
                                                value={brandingSettings.backgroundColor}
                                                onChange={(e) =>
                                                    setBrandingSettings((prev) => ({
                                                        ...prev,
                                                        backgroundColor: e.target.value
                                                    }))
                                                }
                                                placeholder="#FFFFFF"
                                                className="flex-1"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Default background
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                {/* Custom Colors */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Custom Colors</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Add additional colors for specific use cases
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAddCustomColor}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Color
                                        </Button>
                                    </div>

                                    {brandingSettings.customColors.length > 0 && (
                                        <div className="space-y-3">
                                            {brandingSettings.customColors.map((color, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-start gap-3 p-3 border rounded-lg"
                                                >
                                                    <Input
                                                        type="color"
                                                        value={color.value}
                                                        onChange={(e) =>
                                                            handleUpdateCustomColor(
                                                                index,
                                                                "value",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-14 h-10 p-1 cursor-pointer"
                                                    />
                                                    <div className="flex-1 space-y-2">
                                                        <Input
                                                            value={color.name}
                                                            onChange={(e) =>
                                                                handleUpdateCustomColor(
                                                                    index,
                                                                    "name",
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Color name (e.g., Studio Teal)"
                                                        />
                                                        <Input
                                                            value={color.usage}
                                                            onChange={(e) =>
                                                                handleUpdateCustomColor(
                                                                    index,
                                                                    "usage",
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Usage (e.g., Class headers, promotional materials)"
                                                        />
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleRemoveCustomColor(index)
                                                        }
                                                    >
                                                        <Trash2 className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Color Preview */}
                                <div className="p-4 border rounded-lg bg-muted/30">
                                    <Label className="mb-3 block">Color Preview</Label>
                                    <div className="flex flex-wrap gap-3">
                                        <div className="text-center">
                                            <div
                                                className="w-20 h-20 rounded-lg shadow-sm border"
                                                style={{
                                                    backgroundColor: brandingSettings.primaryColor
                                                }}
                                            />
                                            <p className="text-xs mt-1">Primary</p>
                                        </div>
                                        <div className="text-center">
                                            <div
                                                className="w-20 h-20 rounded-lg shadow-sm border"
                                                style={{
                                                    backgroundColor: brandingSettings.secondaryColor
                                                }}
                                            />
                                            <p className="text-xs mt-1">Secondary</p>
                                        </div>
                                        <div className="text-center">
                                            <div
                                                className="w-20 h-20 rounded-lg shadow-sm border"
                                                style={{
                                                    backgroundColor: brandingSettings.accentColor
                                                }}
                                            />
                                            <p className="text-xs mt-1">Accent</p>
                                        </div>
                                        {brandingSettings.customColors.map((color, index) => (
                                            <div
                                                key={index}
                                                className="text-center"
                                            >
                                                <div
                                                    className="w-20 h-20 rounded-lg shadow-sm border"
                                                    style={{ backgroundColor: color.value }}
                                                />
                                                <p className="text-xs mt-1">
                                                    {color.name || `Custom ${index + 1}`}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Typography */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Typography</CardTitle>
                                <CardDescription>
                                    Choose the font family for your branded materials
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fontFamily">Font Family</Label>
                                    <Select
                                        value={brandingSettings.fontFamily}
                                        onValueChange={(value) =>
                                            setBrandingSettings((prev) => ({
                                                ...prev,
                                                fontFamily: value
                                            }))
                                        }
                                    >
                                        <SelectTrigger id="fontFamily">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Inter">Inter (Default)</SelectItem>
                                            <SelectItem value="Arial">Arial</SelectItem>
                                            <SelectItem value="Helvetica">Helvetica</SelectItem>
                                            <SelectItem value="Georgia">Georgia</SelectItem>
                                            <SelectItem value="Times New Roman">
                                                Times New Roman
                                            </SelectItem>
                                            <SelectItem value="Courier New">Courier New</SelectItem>
                                            <SelectItem value="Verdana">Verdana</SelectItem>
                                            <SelectItem value="Trebuchet MS">
                                                Trebuchet MS
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Used in invoices, documents, and marketing materials
                                    </p>
                                </div>

                                {/* Font Preview */}
                                <div className="p-6 border rounded-lg bg-muted/30">
                                    <Label className="mb-3 block">Font Preview</Label>
                                    <div style={{ fontFamily: brandingSettings.fontFamily }}>
                                        <p className="text-2xl mb-2">The Quick Brown Fox</p>
                                        <p className="text-base mb-2">Jumps Over the Lazy Dog</p>
                                        <p className="text-sm text-muted-foreground">
                                            1234567890 - Sample invoice and document text preview
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Invoice Templates */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Invoice Templates</CardTitle>
                                <CardDescription>
                                    Customize your invoice appearance for marketplace sales and
                                    custom invoices
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Layout Selection */}
                                <div className="space-y-3">
                                    <Label>Invoice Layout</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div
                                            onClick={() =>
                                                setBrandingSettings((prev) => ({
                                                    ...prev,
                                                    invoiceLayout: "modern"
                                                }))
                                            }
                                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                                brandingSettings.invoiceLayout === "modern"
                                                    ? "border-primary bg-primary/5"
                                                    : "border-muted hover:border-primary/50"
                                            }`}
                                        >
                                            <div className="space-y-2">
                                                {/* Modern Layout Preview */}
                                                <div className="h-40 bg-white border rounded-lg overflow-hidden shadow-sm">
                                                    <div className="h-full p-3 space-y-1.5 text-[6px]">
                                                        {/* Header with gradient */}
                                                        <div className="flex items-center justify-between pb-1.5 border-b-2 border-primary">
                                                            <div className="flex items-center gap-1">
                                                                <div className="w-3 h-3 bg-primary rounded-sm"></div>
                                                                <div className="space-y-0.5">
                                                                    <div className="w-8 h-1 bg-gray-800 rounded"></div>
                                                                    <div className="w-6 h-0.5 bg-gray-400 rounded"></div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="w-10 h-1.5 bg-primary rounded mb-0.5 ml-auto"></div>
                                                                <div className="w-6 h-0.5 bg-gray-400 rounded ml-auto"></div>
                                                            </div>
                                                        </div>
                                                        {/* Accent banner */}
                                                        <div className="w-full h-2 bg-gradient-to-r from-primary/20 to-accent/20 rounded"></div>
                                                        {/* Bill to */}
                                                        <div className="space-y-0.5">
                                                            <div className="w-8 h-1 bg-gray-700 rounded"></div>
                                                            <div className="w-12 h-0.5 bg-gray-400 rounded"></div>
                                                        </div>
                                                        {/* Items */}
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between items-center py-0.5 border-b border-primary/30">
                                                                <div className="w-10 h-0.5 bg-gray-600 rounded"></div>
                                                                <div className="w-4 h-0.5 bg-gray-600 rounded"></div>
                                                            </div>
                                                            <div className="flex justify-between items-center py-0.5">
                                                                <div className="w-8 h-0.5 bg-gray-400 rounded"></div>
                                                                <div className="w-3 h-0.5 bg-gray-400 rounded"></div>
                                                            </div>
                                                        </div>
                                                        {/* Total */}
                                                        <div className="flex justify-end pt-1 border-t-2 border-primary">
                                                            <div className="w-8 h-1 bg-primary rounded"></div>
                                                        </div>
                                                        {/* Footer */}
                                                        <div className="w-full h-1 bg-gray-200 rounded mt-auto"></div>
                                                    </div>
                                                </div>
                                                <h4 className="font-medium">Modern</h4>
                                                <p className="text-xs text-muted-foreground">
                                                    Clean design with accent colors and bold
                                                    typography
                                                </p>
                                            </div>
                                        </div>
                                        <div
                                            onClick={() =>
                                                setBrandingSettings((prev) => ({
                                                    ...prev,
                                                    invoiceLayout: "classic"
                                                }))
                                            }
                                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                                brandingSettings.invoiceLayout === "classic"
                                                    ? "border-primary bg-primary/5"
                                                    : "border-muted hover:border-primary/50"
                                            }`}
                                        >
                                            <div className="space-y-2">
                                                {/* Classic Layout Preview */}
                                                <div className="h-40 bg-gray-50 border-2 border-gray-300 rounded overflow-hidden">
                                                    <div className="h-full p-3 space-y-1.5 text-[6px]">
                                                        {/* Traditional header */}
                                                        <div className="flex items-start justify-between pb-2 border-b-2 border-gray-800">
                                                            <div className="space-y-0.5">
                                                                <div className="w-3 h-3 bg-gray-800 rounded-sm"></div>
                                                                <div className="w-10 h-1 bg-gray-800 rounded"></div>
                                                                <div className="w-8 h-0.5 bg-gray-600 rounded"></div>
                                                                <div className="w-8 h-0.5 bg-gray-600 rounded"></div>
                                                            </div>
                                                            <div className="text-right space-y-0.5 mt-1">
                                                                <div className="w-12 h-1.5 bg-gray-800 rounded ml-auto"></div>
                                                                <div className="w-8 h-0.5 bg-gray-600 rounded ml-auto"></div>
                                                                <div className="w-6 h-0.5 bg-gray-600 rounded ml-auto"></div>
                                                            </div>
                                                        </div>
                                                        {/* Bill to section */}
                                                        <div className="grid grid-cols-2 gap-1 py-1">
                                                            <div className="space-y-0.5">
                                                                <div className="w-6 h-0.5 bg-gray-700 rounded"></div>
                                                                <div className="w-8 h-0.5 bg-gray-500 rounded"></div>
                                                                <div className="w-7 h-0.5 bg-gray-500 rounded"></div>
                                                            </div>
                                                            <div className="space-y-0.5">
                                                                <div className="w-6 h-0.5 bg-gray-700 rounded"></div>
                                                                <div className="w-5 h-0.5 bg-gray-500 rounded"></div>
                                                            </div>
                                                        </div>
                                                        {/* Table */}
                                                        <div className="border border-gray-400">
                                                            <div className="grid grid-cols-4 gap-1 bg-gray-200 p-0.5 border-b border-gray-400">
                                                                <div className="w-full h-0.5 bg-gray-700 rounded"></div>
                                                                <div className="w-full h-0.5 bg-gray-700 rounded"></div>
                                                                <div className="w-full h-0.5 bg-gray-700 rounded"></div>
                                                                <div className="w-full h-0.5 bg-gray-700 rounded"></div>
                                                            </div>
                                                            <div className="grid grid-cols-4 gap-1 p-0.5 border-b border-gray-300">
                                                                <div className="w-full h-0.5 bg-gray-500 rounded"></div>
                                                                <div className="w-full h-0.5 bg-gray-500 rounded"></div>
                                                                <div className="w-full h-0.5 bg-gray-500 rounded"></div>
                                                                <div className="w-full h-0.5 bg-gray-500 rounded"></div>
                                                            </div>
                                                            <div className="grid grid-cols-4 gap-1 p-0.5">
                                                                <div className="w-full h-0.5 bg-gray-500 rounded"></div>
                                                                <div className="w-full h-0.5 bg-gray-500 rounded"></div>
                                                                <div className="w-full h-0.5 bg-gray-500 rounded"></div>
                                                                <div className="w-full h-0.5 bg-gray-500 rounded"></div>
                                                            </div>
                                                        </div>
                                                        {/* Total box */}
                                                        <div className="flex justify-end">
                                                            <div className="w-10 border border-gray-400 p-0.5 space-y-0.5">
                                                                <div className="w-full h-0.5 bg-gray-600 rounded"></div>
                                                                <div className="w-full h-1 bg-gray-800 rounded"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <h4 className="font-medium">Classic</h4>
                                                <p className="text-xs text-muted-foreground">
                                                    Traditional business invoice with professional
                                                    look
                                                </p>
                                            </div>
                                        </div>
                                        <div
                                            onClick={() =>
                                                setBrandingSettings((prev) => ({
                                                    ...prev,
                                                    invoiceLayout: "minimal"
                                                }))
                                            }
                                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                                brandingSettings.invoiceLayout === "minimal"
                                                    ? "border-primary bg-primary/5"
                                                    : "border-muted hover:border-primary/50"
                                            }`}
                                        >
                                            <div className="space-y-2">
                                                {/* Minimal Layout Preview */}
                                                <div className="h-40 bg-white border border-gray-200 rounded overflow-hidden">
                                                    <div className="h-full p-4 space-y-2 text-[6px]">
                                                        {/* Simple header */}
                                                        <div className="flex items-center justify-between pb-2">
                                                            <div className="w-2 h-2 rounded-full border border-gray-400"></div>
                                                            <div className="w-10 h-1 bg-gray-900 rounded"></div>
                                                        </div>
                                                        {/* Spacious content */}
                                                        <div className="space-y-1.5 pt-1">
                                                            <div className="w-6 h-0.5 bg-gray-400 rounded"></div>
                                                            <div className="w-10 h-0.5 bg-gray-300 rounded"></div>
                                                        </div>
                                                        {/* Simple list */}
                                                        <div className="space-y-1.5 pt-2">
                                                            <div className="flex justify-between">
                                                                <div className="w-8 h-0.5 bg-gray-600 rounded"></div>
                                                                <div className="w-3 h-0.5 bg-gray-600 rounded"></div>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <div className="w-6 h-0.5 bg-gray-400 rounded"></div>
                                                                <div className="w-2 h-0.5 bg-gray-400 rounded"></div>
                                                            </div>
                                                        </div>
                                                        {/* Minimal total */}
                                                        <div className="flex justify-end pt-3 mt-auto">
                                                            <div className="space-y-0.5">
                                                                <div className="w-8 h-0.5 bg-gray-300 rounded ml-auto"></div>
                                                                <div className="w-6 h-1 bg-gray-900 rounded ml-auto"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <h4 className="font-medium">Minimal</h4>
                                                <p className="text-xs text-muted-foreground">
                                                    Simple, clean layout with maximum whitespace
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Invoice Settings */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="invoiceNumberPrefix">
                                            Invoice Number Prefix
                                        </Label>
                                        <Input
                                            id="invoiceNumberPrefix"
                                            value={brandingSettings.invoiceNumberPrefix}
                                            onChange={(e) =>
                                                setBrandingSettings((prev) => ({
                                                    ...prev,
                                                    invoiceNumberPrefix: e.target.value
                                                }))
                                            }
                                            placeholder="INV"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Example: {brandingSettings.invoiceNumberPrefix}-001
                                        </p>
                                    </div>
                                    <div className="space-y-3">
                                        <Label>Display Options</Label>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id="showLogoOnInvoice"
                                                    checked={brandingSettings.showLogoOnInvoice}
                                                    onCheckedChange={(checked) =>
                                                        setBrandingSettings((prev) => ({
                                                            ...prev,
                                                            showLogoOnInvoice: checked as boolean
                                                        }))
                                                    }
                                                />
                                                <Label
                                                    htmlFor="showLogoOnInvoice"
                                                    className="cursor-pointer"
                                                >
                                                    Show logo on invoices
                                                </Label>
                                            </div>
                                            {currentUser.activeMode === "studio" && (
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox
                                                            id="showStudioInfo"
                                                            checked={
                                                                brandingSettings.showStudioInfo
                                                            }
                                                            onCheckedChange={(checked) =>
                                                                setBrandingSettings((prev) => ({
                                                                    ...prev,
                                                                    showStudioInfo:
                                                                        checked as boolean
                                                                }))
                                                            }
                                                        />
                                                        <Label
                                                            htmlFor="showStudioInfo"
                                                            className="cursor-pointer"
                                                        >
                                                            Show studio information
                                                        </Label>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox
                                                            id="showArtistInfo"
                                                            checked={
                                                                brandingSettings.showArtistInfo
                                                            }
                                                            onCheckedChange={(checked) =>
                                                                setBrandingSettings((prev) => ({
                                                                    ...prev,
                                                                    showArtistInfo:
                                                                        checked as boolean
                                                                }))
                                                            }
                                                        />
                                                        <Label
                                                            htmlFor="showArtistInfo"
                                                            className="cursor-pointer"
                                                        >
                                                            Show artist information on studio sales
                                                        </Label>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Invoice Text Content */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="invoiceHeader">
                                            Invoice Header (Optional)
                                        </Label>
                                        <Textarea
                                            id="invoiceHeader"
                                            value={brandingSettings.invoiceHeader}
                                            onChange={(e) =>
                                                setBrandingSettings((prev) => ({
                                                    ...prev,
                                                    invoiceHeader: e.target.value
                                                }))
                                            }
                                            placeholder="Custom message to appear at the top of invoices"
                                            rows={2}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Appears below the logo and above invoice details
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="invoiceTerms">Payment Terms</Label>
                                        <Textarea
                                            id="invoiceTerms"
                                            value={brandingSettings.invoiceTerms}
                                            onChange={(e) =>
                                                setBrandingSettings((prev) => ({
                                                    ...prev,
                                                    invoiceTerms: e.target.value
                                                }))
                                            }
                                            placeholder="Payment is due within 30 days..."
                                            rows={2}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Standard payment terms and conditions
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="invoiceNotes">
                                            Additional Notes (Optional)
                                        </Label>
                                        <Textarea
                                            id="invoiceNotes"
                                            value={brandingSettings.invoiceNotes}
                                            onChange={(e) =>
                                                setBrandingSettings((prev) => ({
                                                    ...prev,
                                                    invoiceNotes: e.target.value
                                                }))
                                            }
                                            placeholder="Special instructions or notes for buyers"
                                            rows={2}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Additional information for customers
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="invoiceFooter">Invoice Footer</Label>
                                        <Textarea
                                            id="invoiceFooter"
                                            value={brandingSettings.invoiceFooter}
                                            onChange={(e) =>
                                                setBrandingSettings((prev) => ({
                                                    ...prev,
                                                    invoiceFooter: e.target.value
                                                }))
                                            }
                                            placeholder="Thank you for your business!"
                                            rows={2}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Appears at the bottom of all invoices
                                        </p>
                                    </div>
                                </div>

                                {/* Invoice Preview */}
                                <div className="space-y-3">
                                    <Label>Invoice Preview</Label>
                                    <InvoicePreview
                                        layout={brandingSettings.invoiceLayout}
                                        settings={{
                                            fontFamily: brandingSettings.fontFamily,
                                            textColor: brandingSettings.textColor,
                                            primaryColor: brandingSettings.primaryColor,
                                            accentColor: brandingSettings.accentColor,
                                            logo: brandingSettings.logo,
                                            showLogoOnInvoice: brandingSettings.showLogoOnInvoice,
                                            tagline: brandingSettings.tagline,
                                            website: brandingSettings.website,
                                            invoiceNumberPrefix:
                                                brandingSettings.invoiceNumberPrefix,
                                            invoiceHeader: brandingSettings.invoiceHeader,
                                            invoiceTerms: brandingSettings.invoiceTerms,
                                            invoiceNotes: brandingSettings.invoiceNotes,
                                            invoiceFooter: brandingSettings.invoiceFooter
                                        }}
                                        userName={
                                            currentUser.activeMode === "studio"
                                                ? currentStudio?.name || currentUser.name
                                                : currentUser.name
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <Button size="lg">
                                <Check className="w-4 h-4 mr-2" />
                                Save Branding Settings
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
                {/* Upgrade Dialog */}
                <Dialog
                    open={showUpgradeDialog}
                    onOpenChange={setShowUpgradeDialog}
                >
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Upgrade Your Plan</DialogTitle>
                            <DialogDescription>
                                Choose the plan that's right for you
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                            {(currentUser.activeMode === "studio"
                                ? paymentPlans.studio
                                : paymentPlans.artist
                            ).map((plan) => (
                                <Card
                                    key={plan.id}
                                    className={plan.current ? "border-primary" : ""}
                                >
                                    <CardHeader>
                                        <CardTitle>{plan.name}</CardTitle>
                                        <div className="mt-4">
                                            <span className="text-3xl font-bold">
                                                ${plan.price}
                                            </span>
                                            <span className="text-muted-foreground">/month</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <ul className="space-y-2">
                                            {plan.features.map((feature, idx) => (
                                                <li
                                                    key={idx}
                                                    className="flex items-start gap-2 text-sm"
                                                >
                                                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        {plan.current ? (
                                            <Button
                                                disabled
                                                className="w-full"
                                            >
                                                Current Plan
                                            </Button>
                                        ) : (
                                            <Button className="w-full">Select Plan</Button>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
                {/* Add Domain Dialog */}
                <Dialog
                    open={showDomainDialog}
                    onOpenChange={setShowDomainDialog}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Custom Domain</DialogTitle>
                            <DialogDescription>
                                Enter your custom domain name to connect it to your profile
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="domain">Domain Name</Label>
                                <Input
                                    id="domain"
                                    placeholder="example.com"
                                    value={newDomain}
                                    onChange={(e) => setNewDomain(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Don't include "http://" or "www"
                                </p>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowDomainDialog(false);
                                        setNewDomain("");
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAddDomain}
                                    disabled={!newDomain}
                                >
                                    Add Domain
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
                {/* Role Dialog */}
                <Dialog
                    open={showRoleDialog}
                    onOpenChange={setShowRoleDialog}
                >
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingRole ? "Edit Role" : "Create New Role"}
                            </DialogTitle>
                            <DialogDescription>
                                Define the role name, description, and permissions
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="roleName">Role Name *</Label>
                                <Input
                                    id="roleName"
                                    placeholder="e.g., Studio Manager"
                                    value={editingRole?.name || newRole.name}
                                    onChange={(e) => {
                                        if (editingRole) {
                                            setEditingRole({
                                                ...editingRole,
                                                name: e.target.value
                                            });
                                        } else {
                                            setNewRole({ ...newRole, name: e.target.value });
                                        }
                                    }}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="roleDescription">Description *</Label>
                                <Textarea
                                    id="roleDescription"
                                    placeholder="Describe the responsibilities and scope of this role..."
                                    rows={3}
                                    value={editingRole?.description || newRole.description}
                                    onChange={(e) => {
                                        if (editingRole) {
                                            setEditingRole({
                                                ...editingRole,
                                                description: e.target.value
                                            });
                                        } else {
                                            setNewRole({ ...newRole, description: e.target.value });
                                        }
                                    }}
                                />
                            </div>

                            <div className="space-y-4">
                                <Label>Permissions</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    {Object.entries(
                                        (editingRole?.permissions ||
                                            newRole.permissions) as Role["permissions"]
                                    ).map(([key, value]) => (
                                        <div
                                            key={key}
                                            className="flex items-center space-x-2"
                                        >
                                            <Switch
                                                checked={value}
                                                disabled={
                                                    editingRole?.name === "Administrator" &&
                                                    key === "settings"
                                                }
                                                onCheckedChange={(checked) => {
                                                    if (editingRole) {
                                                        setEditingRole({
                                                            ...editingRole,
                                                            permissions: {
                                                                ...editingRole.permissions,
                                                                [key]: checked
                                                            }
                                                        });
                                                    } else {
                                                        setNewRole({
                                                            ...newRole,
                                                            permissions: {
                                                                ...newRole.permissions!,
                                                                [key]: checked
                                                            }
                                                        });
                                                    }
                                                }}
                                            />
                                            <Label className="capitalize cursor-pointer">
                                                {key.replace(/([A-Z])/g, " $1").trim()}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowRoleDialog(false);
                                        setEditingRole(null);
                                        setNewRole({
                                            name: "",
                                            description: "",
                                            permissions: {
                                                dashboard: true,
                                                classes: false,
                                                events: false,
                                                calendar: false,
                                                kiln: false,
                                                glaze: false,
                                                members: false,
                                                staff: false,
                                                documents: false,
                                                marketplace: false,
                                                reports: false,
                                                settings: false
                                            }
                                        });
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSaveRole}
                                    disabled={
                                        !(editingRole?.name || newRole.name) ||
                                        !(editingRole?.description || newRole.description)
                                    }
                                >
                                    {editingRole ? "Save Changes" : "Create Role"}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </DefaultLayout>
        </RequireAuth>
    );
}
