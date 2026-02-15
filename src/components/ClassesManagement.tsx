"use client";
import { useState, useEffect, useCallback } from "react";
import {
    Plus,
    Search,
    Filter,
    Calendar,
    Users,
    Clock,
    MoreHorizontal,
    Trash,
    Eye,
    Settings,
    FileText,
    Copy,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClassManagementPage } from "@/components/ClassManagementPage";
import { ClassPreview } from "@/components/ClassPreview";
import { ClassTemplateManager } from "@/components/ClassTemplateManager";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { PageLoadingProgress } from "@/components/ui/page-loading-progress";
import { toast } from "sonner";
import { useAppContext } from "@/app/context/AppContext";
import type {
    Class as ClassType,
    ClassTemplate,
    ClassStats,
    StudioLocation
} from "@/types";

interface PricingTier {
    id: string;
    name: string;
    price: number;
    priceCents?: number;
    description: string;
    isDefault: boolean;
}

interface DiscountCode {
    id: string;
    code: string;
    type: "percentage" | "fixed";
    value: number;
    description: string;
    expiryDate?: string;
    usageLimit: number;
    isActive: boolean;
}

interface ClassImage {
    id: string;
    url: string;
    alt: string;
    isMain: boolean;
}

// Frontend display class (transformed from API)
interface DisplayClass {
    id: string;
    name: string;
    instructor: string | null;
    schedule: string;
    capacity: number;
    enrolled: number;
    waitlist: number;
    startDate: string;
    endDate: string;
    status: "draft" | "published" | "in-session" | "completed" | "cancelled";
    level: string;
    price: string;
    thumbnail?: string;
    revenue: number;
    templateId?: string | null;
    templateName?: string | null;
}

export function ClassesManagement() {
    const context = useAppContext();
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"list" | "manage" | "preview" | "templates">("list");
    const [activeStatusTab, setActiveStatusTab] = useState("all");
    const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
    const [createFormTab, setCreateFormTab] = useState("basic");
    const [selectedLocationId, setSelectedLocationId] = useState<string>("");
    const [locations, setLocations] = useState<StudioLocation[]>([]);
    const [classes, setClasses] = useState<DisplayClass[]>([]);
    const [stats, setStats] = useState<ClassStats>({
        total: 0,
        draft: 0,
        published: 0,
        inSession: 0,
        completed: 0,
        cancelled: 0,
        totalStudents: 0,
        totalWaitlist: 0,
        totalRevenue: 0
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingLocations, setIsLoadingLocations] = useState(true);
    const [instructors, setInstructors] = useState<Array<{ id: string; name: string }>>([]);

    // Form state
    const [classForm, setClassForm] = useState({
        name: "",
        instructor: "",
        description: "",
        level: "",
        capacity: "",
        startDate: "",
        endDate: "",
        schedule: "",
        location: "",
        materials: "",
        prerequisites: ""
    });

    const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([
        {
            id: "1",
            name: "Standard",
            price: 320,
            description: "Regular class price",
            isDefault: true
        }
    ]);

    const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
    const [classImages, setClassImages] = useState<ClassImage[]>([]);
    const [thumbnailImage, setThumbnailImage] = useState<string>("");

    // Fetch locations for the studio
    useEffect(() => {
        const fetchLocations = async () => {
            if (!context.currentStudio?.id || !context.authToken) {
                setIsLoadingLocations(false);
                return;
            }

            setIsLoadingLocations(true);
            try {
                const res = await fetch(`/api/studios/${context.currentStudio.id}/locations`, {
                    headers: { Authorization: `Bearer ${context.authToken}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setLocations(data.locations || []);
                    // Set first location as default if available
                    if (data.locations && data.locations.length > 0 && !selectedLocationId) {
                        setSelectedLocationId(data.locations[0].id);
                    }
                }
            } catch (err) {
                console.error("Error fetching locations", err);
            } finally {
                setIsLoadingLocations(false);
            }
        };

        fetchLocations();
    }, [context.currentStudio?.id, context.authToken]);

    // Fetch staff/instructors for the studio
    useEffect(() => {
        const fetchInstructors = async () => {
            if (!context.currentStudio?.id || !context.authToken) return;

            try {
                const res = await fetch(
                    `/api/admin/studios/${context.currentStudio.id}/staff`,
                    {
                        headers: { Authorization: `Bearer ${context.authToken}` }
                    }
                );

                if (res.ok) {
                    const data = await res.json();
                    setInstructors(
                        (data.staff || []).map((s: any) => ({
                            id: s.userId || s.id,
                            name: s.name
                        }))
                    );
                }
            } catch (err) {
                console.error("Error fetching instructors", err);
            }
        };

        fetchInstructors();
    }, [context.currentStudio?.id, context.authToken]);

    // Fetch classes
    const fetchClasses = useCallback(async () => {
        if (!context.currentStudio?.id || !context.authToken || !selectedLocationId) {
            setClasses([]);
            return;
        }

        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                locationId: selectedLocationId
            });
            if (activeStatusTab !== "all") {
                params.append("status", activeStatusTab);
            }
            if (searchTerm) {
                params.append("search", searchTerm);
            }

            const res = await fetch(
                `/api/admin/studios/${context.currentStudio.id}/classes?${params.toString()}`,
                {
                    headers: { Authorization: `Bearer ${context.authToken}` }
                }
            );

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error || "Failed to load classes");
            }

            const data = await res.json();
            const transformedClasses: DisplayClass[] = (data.classes || []).map((cls: any) => ({
                id: cls.id,
                name: cls.name,
                instructor: cls.instructor?.name || null,
                schedule: cls.schedule || "",
                capacity: cls.capacity,
                enrolled: cls.enrolled,
                waitlist: cls.waitlist,
                startDate: cls.startDate,
                endDate: cls.endDate,
                status: cls.status,
                level: cls.level || "",
                price: cls.price || "$0",
                thumbnail: cls.thumbnail || undefined,
                revenue: cls.revenue || 0,
                templateId: cls.templateId,
                templateName: cls.templateName
            }));

            setClasses(transformedClasses);
            setStats(data.stats || stats);
        } catch (err: any) {
            console.error("Error fetching classes", err);
            toast.error(err.message || "Failed to load classes");
            setClasses([]);
        } finally {
            setIsLoading(false);
        }
    }, [context.currentStudio?.id, context.authToken, selectedLocationId, activeStatusTab, searchTerm]);

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);


    const statusTabs = [
        { id: "all", label: "All Classes", count: stats.total },
        { id: "draft", label: "Draft", count: stats.draft },
        { id: "published", label: "Published", count: stats.published },
        { id: "in-session", label: "In Session", count: stats.inSession },
        { id: "completed", label: "Completed", count: stats.completed },
        { id: "cancelled", label: "Cancelled", count: stats.cancelled }
    ];

    // Filter classes client-side (API already filters by status, but we filter by search)
    const filteredClasses = classes.filter((cls) => {
        const matchesSearch =
            cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (cls.instructor && cls.instructor.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "draft":
                return <Badge variant="outline">Draft</Badge>;
            case "published":
                return <Badge variant="secondary">Published</Badge>;
            case "in-session":
                return <Badge variant="default">In Session</Badge>;
            case "completed":
                return <Badge variant="outline">Completed</Badge>;
            case "cancelled":
                return <Badge variant="destructive">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handleManageClass = (classId: string) => {
        setSelectedClass(classId);
        setViewMode("manage");
    };

    const handlePreviewClass = (classId: string) => {
        setSelectedClass(classId);
        setViewMode("preview");
    };

    const handleBackToList = () => {
        setSelectedClass(null);
        setViewMode("list");
    };

    const handleSelectTemplate = (template: any) => {
        setSelectedTemplate(template);
        setShowTemplateSelector(false);
        setShowCreateDialog(true);

        // Pre-populate form with template data
        setClassForm({
            name: template.name,
            instructor: "",
            description: template.description || "",
            level: template.level || "",
            capacity: (template.capacity || 0).toString(),
            startDate: "",
            endDate: "",
            schedule: "",
            location: "",
            materials: template.materials || "",
            prerequisites: template.prerequisites || ""
        });

        // Set pricing tiers from template
        setPricingTiers(
            (template.pricingTiers || []).map((tier: any) => ({
                id: Date.now().toString() + Math.random(),
                name: tier.name,
                price: tier.price,
                priceCents: tier.priceCents,
                description: tier.description || "",
                isDefault: tier.isDefault
            }))
        );

        // Set discount codes from template
        setDiscountCodes(
            (template.discountCodes || []).map((code: any) => ({
                id: Date.now().toString() + Math.random(),
                code: code.code,
                type: code.type,
                value: code.value,
                description: code.description || "",
                expiryDate: code.expiryDate || undefined,
                usageLimit: code.usageLimit,
                isActive: true
            }))
        );

        setThumbnailImage(template.thumbnailUrl || "");
        setClassImages(
            (template.images || []).map((url: string, index: number) => ({
                id: `${Date.now()}-${index}`,
                url,
                alt: `Class image ${index + 1}`,
                isMain: index === 0
            }))
        );

        toast.success(`Template "${template.name}" loaded`);
    };

    const handleCreateFromScratch = () => {
        setSelectedTemplate(null);
        setShowCreateDialog(true);
        // Reset form to defaults
        setClassForm({
            name: "",
            instructor: "",
            description: "",
            level: "",
            capacity: "",
            startDate: "",
            endDate: "",
            schedule: "",
            location: "",
            materials: "",
            prerequisites: ""
        });
        setPricingTiers([
            {
                id: "1",
                name: "Standard",
                price: 320,
                description: "Regular class price",
                isDefault: true
            }
        ]);
        setDiscountCodes([]);
        setClassImages([]);
        setThumbnailImage("");
    };

    const handleCreateClass = async () => {
        if (!context.currentStudio?.id || !context.authToken || !selectedLocationId) {
            toast.error("Missing required information");
            return;
        }

        // Validation
        if (!classForm.name || !classForm.instructor || !classForm.level || !classForm.capacity || !classForm.startDate || !classForm.endDate) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            const res = await fetch(
                `/api/admin/studios/${context.currentStudio.id}/classes`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${context.authToken}`
                    },
                    body: JSON.stringify({
                        name: classForm.name,
                        description: classForm.description,
                        instructorId: classForm.instructor,
                        level: classForm.level === "all" ? "all-levels" : classForm.level,
                        capacity: parseInt(classForm.capacity),
                        startDate: classForm.startDate,
                        endDate: classForm.endDate,
                        schedule: classForm.schedule,
                        location: classForm.location,
                        locationId: selectedLocationId,
                        materials: classForm.materials,
                        prerequisites: classForm.prerequisites,
                        templateId: selectedTemplate?.id,
                        pricingTiers: pricingTiers.map((tier) => ({
                            name: tier.name,
                            priceCents: (tier.priceCents || tier.price * 100),
                            description: tier.description,
                            isDefault: tier.isDefault
                        })),
                        discountCodes: discountCodes.map((code) => ({
                            code: code.code,
                            type: code.type,
                            value: code.value,
                            description: code.description,
                            expiryDate: code.expiryDate,
                            usageLimit: code.usageLimit
                        })),
                        images: classImages.map((img) => img.url),
                        thumbnail: thumbnailImage
                    })
                }
            );

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error || "Failed to create class");
            }

            const templateText = selectedTemplate ? ` using template "${selectedTemplate.name}"` : "";
            toast.success(`Class "${classForm.name}" created successfully${templateText}!`);
            setShowCreateDialog(false);
            setSelectedTemplate(null);
            // Reset form
            setClassForm({
                name: "",
                instructor: "",
                description: "",
                level: "",
                capacity: "",
                startDate: "",
                endDate: "",
                schedule: "",
                location: "",
                materials: "",
                prerequisites: ""
            });
            setPricingTiers([{
                id: "1",
                name: "Standard",
                price: 320,
                description: "Regular class price",
                isDefault: true
            }]);
            setDiscountCodes([]);
            setClassImages([]);
            setThumbnailImage("");
            // Refresh classes list
            fetchClasses();
        } catch (err: any) {
            console.error("Error creating class", err);
            toast.error(err.message || "Failed to create class");
        }
    };

    const handleDuplicateClass = async (classItem: DisplayClass) => {
        if (!context.currentStudio?.id || !context.authToken) {
            toast.error("Missing required information");
            return;
        }

        try {
            const res = await fetch(
                `/api/admin/studios/${context.currentStudio.id}/classes/${classItem.id}/duplicate`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${context.authToken}`
                    },
                    body: JSON.stringify({
                        name: `${classItem.name} (Copy)`
                    })
                }
            );

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error || "Failed to duplicate class");
            }

            toast.success(`Class "${classItem.name}" duplicated successfully`);
            fetchClasses();
        } catch (err: any) {
            console.error("Error duplicating class", err);
            toast.error(err.message || "Failed to duplicate class");
        }
    };

    const handleDeleteClass = async (classId: string, className: string) => {
        if (!context.currentStudio?.id || !context.authToken) {
            toast.error("Missing required information");
            return;
        }

        if (!confirm(`Are you sure you want to delete "${className}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const res = await fetch(
                `/api/admin/studios/${context.currentStudio.id}/classes/${classId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${context.authToken}`
                    }
                }
            );

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error || "Failed to delete class");
            }

            toast.success(`Class "${className}" deleted successfully`);
            fetchClasses();
        } catch (err: any) {
            console.error("Error deleting class", err);
            toast.error(err.message || "Failed to delete class");
        }
    };

    const isPageLoading = isLoading || isLoadingLocations;

    // Navigation handlers
    if (viewMode === "manage" && selectedClass) {
        return (
            <>
                <PageLoadingProgress isLoading={isPageLoading} />
                <ClassManagementPage
                    classId={selectedClass}
                    onBack={handleBackToList}
                />
            </>
        );
    }

    if (viewMode === "preview" && selectedClass) {
        const classData = classes.find((c) => c.id === selectedClass);
        if (!classData) {
            return (
                <>
                    <PageLoadingProgress isLoading={isPageLoading} />
                    <div className="p-6">
                        <Button variant="ghost" onClick={handleBackToList}>
                            Back to Classes
                        </Button>
                        <p>Class not found</p>
                    </div>
                </>
            );
        }
        // Transform DisplayClass to match ClassPreview expectations
        const previewData = {
            ...classData,
            instructor: classData.instructor || "TBD"
        };
        return (
            <>
                <PageLoadingProgress isLoading={isPageLoading} />
                <ClassPreview
                    classData={previewData as any}
                    onBack={handleBackToList}
                />
            </>
        );
    }

    if (viewMode === "templates") {
        return (
            <>
                <PageLoadingProgress isLoading={isPageLoading} />
                <ClassTemplateManager
                onBack={handleBackToList}
                mode="manage"
                />
            </>
        );
    }

    if (showTemplateSelector) {
        return (
            <>
                <PageLoadingProgress isLoading={isPageLoading} />
                <ClassTemplateManager
                onBack={() => setShowTemplateSelector(false)}
                onSelectTemplate={handleSelectTemplate}
                mode="select"
                />
            </>
        );
    }

    // Show location selection message if no location selected (and done loading)
    if (locations.length === 0 && !isLoadingLocations) {
        return (
            <>
                <PageLoadingProgress isLoading={isPageLoading} />
                <div className="p-6">
                <div className="text-center py-12">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No locations available</h3>
                    <p className="text-muted-foreground">
                        Please create a location for your studio first
                    </p>
                </div>
            </div>
            </>
        );
    }

    if (!selectedLocationId && locations.length > 0) {
        return (
            <>
                <PageLoadingProgress isLoading={isPageLoading} />
                <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Classes Management</h1>
                        <p className="text-muted-foreground">
                            Manage your studio's classes and workshops
                        </p>
                    </div>
                </div>
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center">
                            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-medium mb-2">Select a Location</h3>
                            <p className="text-muted-foreground mb-4">
                                Please select a location to view and manage classes
                            </p>
                            <Select
                                value={selectedLocationId}
                                onValueChange={setSelectedLocationId}
                            >
                                <SelectTrigger className="w-64 mx-auto">
                                    <SelectValue placeholder="Select location" />
                                </SelectTrigger>
                                <SelectContent>
                                    {locations.map((location) => (
                                        <SelectItem
                                            key={location.id}
                                            value={location.id}
                                        >
                                            {location.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </div>
            </>
        );
    }

    return (
        <>
            <PageLoadingProgress isLoading={isPageLoading} />
            <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Classes Management</h1>
                    <p className="text-muted-foreground">
                        Manage your studio's classes and workshops
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    {locations.length > 0 && (
                        <Select
                            value={selectedLocationId}
                            onValueChange={setSelectedLocationId}
                        >
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                                {locations.map((location) => (
                                    <SelectItem
                                        key={location.id}
                                        value={location.id}
                                    >
                                        {location.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    <Button
                        variant="outline"
                        onClick={() => setViewMode("templates")}
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Manage Templates
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Class
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setShowTemplateSelector(true)}>
                                <FileText className="w-4 h-4 mr-2" />
                                Use Template
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleCreateFromScratch}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create from Scratch
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Status Tabs */}
            <Tabs
                value={activeStatusTab}
                onValueChange={setActiveStatusTab}
            >
                <TabsList className="grid w-full grid-cols-6">
                    {statusTabs.map((tab) => (
                        <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="ml-2"
                                >
                                    {tab.count}
                                </Badge>
                            )}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Classes
                                </CardTitle>
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.inSession} in session
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Students
                                </CardTitle>
                                <Users className="w-4 h-4 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalStudents}</div>
                            <p className="text-xs text-muted-foreground">
                                Across all classes
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Waitlist
                                </CardTitle>
                                <Clock className="w-4 h-4 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalWaitlist}</div>
                            <p className="text-xs text-muted-foreground">
                                Students waiting
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Revenue
                                </CardTitle>
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${(stats.totalRevenue / 100).toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">Total revenue</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filters */}
                <div className="flex items-center space-x-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search classes or instructors..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    {/* <Button variant="outline">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button> */}
                </div>

                {/* Classes Table */}
                <Card>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            <span className="ml-2 text-muted-foreground">Loading classes...</span>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Class</TableHead>
                                    <TableHead>Instructor</TableHead>
                                    <TableHead>Schedule</TableHead>
                                    <TableHead>Enrollment</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Revenue</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredClasses.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="text-center py-12"
                                        >
                                            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                                            <h3 className="text-lg font-medium mb-2">No classes found</h3>
                                            <p className="text-muted-foreground">
                                                {searchTerm || activeStatusTab !== "all"
                                                    ? "Try adjusting your search or filter criteria"
                                                    : "Create your first class to get started"}
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredClasses.map((classItem) => (
                                <TableRow key={classItem.id}>
                                    <TableCell>
                                        <div className="flex items-center space-x-3">
                                            {classItem.thumbnail && (
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                                                    <ImageWithFallback
                                                        src={classItem.thumbnail}
                                                        alt={classItem.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium">{classItem.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {classItem.level} • {classItem.price}
                                                    {classItem.templateName && (
                                                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                            {classItem.templateName}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{classItem.instructor}</TableCell>
                                    <TableCell className="text-sm">{classItem.schedule}</TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div>
                                                {classItem.enrolled}/{classItem.capacity} enrolled
                                            </div>
                                            {classItem.waitlist > 0 && (
                                                <div className="text-muted-foreground">
                                                    {classItem.waitlist} waitlisted
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        <div>{classItem.startDate}</div>
                                        <div className="text-muted-foreground">
                                            to {classItem.endDate}
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(classItem.status)}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">
                                            ${classItem.revenue?.toLocaleString() || "0"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => handleManageClass(classItem.id)}
                                                >
                                                    <Settings className="w-4 h-4 mr-2" />
                                                    Manage Class
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handlePreviewClass(classItem.id)}
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    Preview Page
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDuplicateClass(classItem)}
                                                >
                                                    <Copy className="w-4 h-4 mr-2" />
                                                    Duplicate Class
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() =>
                                                        handleDeleteClass(
                                                            classItem.id,
                                                            classItem.name
                                                        )
                                                    }
                                                >
                                                    <Trash className="w-4 h-4 mr-2" />
                                                    Delete Class
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </Card>
            </Tabs>

            {/* Create Class Dialog */}
            <Dialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
            >
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedTemplate
                                ? `Create Class from Template: ${selectedTemplate.name}`
                                : "Create New Class"}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedTemplate
                                ? `Using template "${selectedTemplate.name}" as a starting point`
                                : "Create a new class or workshop for your pottery studio"}
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs
                        value={createFormTab}
                        onValueChange={setCreateFormTab}
                    >
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="basic">Basic Info</TabsTrigger>
                            <TabsTrigger value="pricing">Pricing</TabsTrigger>
                            <TabsTrigger value="images">Images</TabsTrigger>
                            <TabsTrigger value="preview">Preview</TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="basic"
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="className">Class Name *</Label>
                                    <Input
                                        id="className"
                                        placeholder="e.g., Wheel Throwing Basics"
                                        value={classForm.name}
                                        onChange={(e) =>
                                            setClassForm((prev) => ({
                                                ...prev,
                                                name: e.target.value
                                            }))
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="instructor">Instructor *</Label>
                                    <Select
                                        value={classForm.instructor}
                                        onValueChange={(value) =>
                                            setClassForm((prev) => ({ ...prev, instructor: value }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select instructor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {instructors.map((instructor) => (
                                                <SelectItem
                                                    key={instructor.id}
                                                    value={instructor.id}
                                                >
                                                    {instructor.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe what students will learn in this class..."
                                    rows={4}
                                    value={classForm.description}
                                    onChange={(e) =>
                                        setClassForm((prev) => ({
                                            ...prev,
                                            description: e.target.value
                                        }))
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="level">Level *</Label>
                                    <Select
                                        value={classForm.level}
                                        onValueChange={(value) =>
                                            setClassForm((prev) => ({ ...prev, level: value }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="beginner">Beginner</SelectItem>
                                            <SelectItem value="intermediate">
                                                Intermediate
                                            </SelectItem>
                                            <SelectItem value="advanced">Advanced</SelectItem>
                                            <SelectItem value="all-levels">All Levels</SelectItem>
                                            <SelectItem value="kids">Kids (8-12)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="capacity">Capacity *</Label>
                                    <Input
                                        id="capacity"
                                        type="number"
                                        placeholder="12"
                                        value={classForm.capacity}
                                        onChange={(e) =>
                                            setClassForm((prev) => ({
                                                ...prev,
                                                capacity: e.target.value
                                            }))
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location Name</Label>
                                    <Input
                                        id="location"
                                        placeholder="Studio A"
                                        value={classForm.location}
                                        onChange={(e) =>
                                            setClassForm((prev) => ({
                                                ...prev,
                                                location: e.target.value
                                            }))
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Physical location within the studio
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date *</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={classForm.startDate}
                                        onChange={(e) =>
                                            setClassForm((prev) => ({
                                                ...prev,
                                                startDate: e.target.value
                                            }))
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate">End Date *</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={classForm.endDate}
                                        onChange={(e) =>
                                            setClassForm((prev) => ({
                                                ...prev,
                                                endDate: e.target.value
                                            }))
                                        }
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="schedule">Schedule *</Label>
                                <Input
                                    id="schedule"
                                    placeholder="e.g., Tuesdays & Thursdays, 6:00 PM - 8:00 PM"
                                    value={classForm.schedule}
                                    onChange={(e) =>
                                        setClassForm((prev) => ({
                                            ...prev,
                                            schedule: e.target.value
                                        }))
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="materials">Materials Included</Label>
                                <Textarea
                                    id="materials"
                                    placeholder="List what materials are included..."
                                    rows={2}
                                    value={classForm.materials}
                                    onChange={(e) =>
                                        setClassForm((prev) => ({
                                            ...prev,
                                            materials: e.target.value
                                        }))
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="prerequisites">Prerequisites</Label>
                                <Textarea
                                    id="prerequisites"
                                    placeholder="Any prerequisites or requirements..."
                                    rows={2}
                                    value={classForm.prerequisites}
                                    onChange={(e) =>
                                        setClassForm((prev) => ({
                                            ...prev,
                                            prerequisites: e.target.value
                                        }))
                                    }
                                />
                            </div>

                            {selectedTemplate && (
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        <span className="font-medium text-blue-900">
                                            Using Template: {selectedTemplate.name}
                                        </span>
                                    </div>
                                    <p className="text-sm text-blue-700">
                                        This class is being created from the "
                                        {selectedTemplate.name}" template. You can modify any of the
                                        pre-filled information above.
                                    </p>
                                </div>
                            )}
                        </TabsContent>

                        {/* Other tabs would follow the same pattern as the original component */}
                        <TabsContent value="pricing">
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">
                                    Pricing configuration interface
                                </p>
                            </div>
                        </TabsContent>

                        <TabsContent value="images">
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">Image upload interface</p>
                            </div>
                        </TabsContent>

                        <TabsContent value="preview">
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">Class preview interface</p>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-end space-x-2 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={() => setShowCreateDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleCreateClass}>Create Class</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
        </>
    );
}
