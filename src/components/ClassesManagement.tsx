import { useState } from "react";
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
    Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClassManagementPage } from "@/components/ClassManagementPage";
import { ClassPreview } from "@/components/ClassPreview";
import { ClassTemplateManager } from "@/components/ClassTemplateManager";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { toast } from "sonner";

interface Class {
    id: string;
    name: string;
    instructor: string;
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
    revenue?: number;
    templateId?: string;
    templateName?: string;
}

interface ClassTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    level: string;
    duration: string;
    capacity: number;
    materials: string;
    prerequisites: string;
    whatYouLearn: string[];
    pricingTiers: PricingTier[];
    discountCodes: DiscountCode[];
    images: string[];
    thumbnail: string;
    createdBy: string;
    createdDate: string;
    lastModified: string;
    version: string;
    isPublic: boolean;
    usageCount: number;
    tags: string[];
}

interface PricingTier {
    id: string;
    name: string;
    price: number;
    description: string;
    isDefault: boolean;
}

interface DiscountCode {
    id: string;
    code: string;
    type: "percentage" | "fixed";
    value: number;
    description: string;
    expiryDate: string;
    usageLimit: number;
    isActive: boolean;
}

interface ClassImage {
    id: string;
    url: string;
    alt: string;
    isMain: boolean;
}

export function ClassesManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"list" | "manage" | "preview" | "templates">("list");
    const [activeStatusTab, setActiveStatusTab] = useState("all");
    const [selectedTemplate, setSelectedTemplate] = useState<ClassTemplate | null>(null);
    const [createFormTab, setCreateFormTab] = useState("basic");

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

    // Mock classes data with different statuses
    const mockClasses: Class[] = [
        {
            id: "1",
            name: "Wheel Throwing Fundamentals",
            instructor: "Sarah Martinez",
            schedule: "Tue & Thu, 6:00-8:00 PM",
            capacity: 12,
            enrolled: 10,
            waitlist: 3,
            startDate: "2025-01-15",
            endDate: "2025-03-06",
            status: "in-session",
            level: "Beginner",
            price: "$320",
            thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
            revenue: 3200,
            templateId: "1",
            templateName: "Beginner Wheel Throwing"
        },
        {
            id: "2",
            name: "Advanced Glazing Techniques",
            instructor: "Michael Chen",
            schedule: "Sat, 10:00 AM-1:00 PM",
            capacity: 8,
            enrolled: 6,
            waitlist: 0,
            startDate: "2025-02-01",
            endDate: "2025-04-05",
            status: "published",
            level: "Advanced",
            price: "$280",
            thumbnail: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400",
            revenue: 1680,
            templateId: "2",
            templateName: "Advanced Glazing Workshop"
        },
        {
            id: "3",
            name: "Handbuilding Workshop",
            instructor: "Emma Rodriguez",
            schedule: "Wed, 7:00-9:00 PM",
            capacity: 15,
            enrolled: 15,
            waitlist: 5,
            startDate: "2025-01-08",
            endDate: "2025-02-26",
            status: "in-session",
            level: "All Levels",
            price: "$240",
            thumbnail: "https://images.unsplash.com/photo-1594736797933-d0c6ba7a6d48?w=400",
            revenue: 3600
        },
        {
            id: "4",
            name: "Pottery for Kids",
            instructor: "David Park",
            schedule: "Sat, 2:00-3:30 PM",
            capacity: 10,
            enrolled: 8,
            waitlist: 2,
            startDate: "2025-01-11",
            endDate: "2025-03-01",
            status: "in-session",
            level: "Kids (8-12)",
            price: "$180",
            thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
            revenue: 1440,
            templateId: "3",
            templateName: "Kids Pottery Fun"
        },
        {
            id: "5",
            name: "Sculpture Intensive",
            instructor: "Sarah Martinez",
            schedule: "Mon & Wed, 10:00 AM-12:00 PM",
            capacity: 6,
            enrolled: 4,
            waitlist: 0,
            startDate: "2025-02-15",
            endDate: "2025-04-15",
            status: "draft",
            level: "Intermediate",
            price: "$450",
            thumbnail: "https://images.unsplash.com/photo-1594736797933-d0c6ba7a6d48?w=400",
            revenue: 0
        },
        {
            id: "6",
            name: "Beginner Pottery Series",
            instructor: "Michael Chen",
            schedule: "Fri, 6:00-8:00 PM",
            capacity: 12,
            enrolled: 12,
            waitlist: 0,
            startDate: "2024-10-01",
            endDate: "2024-12-15",
            status: "completed",
            level: "Beginner",
            price: "$300",
            thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
            revenue: 3600
        },
        {
            id: "7",
            name: "Holiday Pottery Workshop",
            instructor: "Emma Rodriguez",
            schedule: "Dec 20-22, 2:00-5:00 PM",
            capacity: 15,
            enrolled: 8,
            waitlist: 0,
            startDate: "2024-12-20",
            endDate: "2024-12-22",
            status: "cancelled",
            level: "All Levels",
            price: "$120",
            thumbnail: "https://images.unsplash.com/photo-1594736797933-d0c6ba7a6d48?w=400",
            revenue: 0
        }
    ];

    const statusTabs = [
        { id: "all", label: "All Classes", count: mockClasses.length },
        {
            id: "draft",
            label: "Draft",
            count: mockClasses.filter((c) => c.status === "draft").length
        },
        {
            id: "published",
            label: "Published",
            count: mockClasses.filter((c) => c.status === "published").length
        },
        {
            id: "in-session",
            label: "In Session",
            count: mockClasses.filter((c) => c.status === "in-session").length
        },
        {
            id: "completed",
            label: "Completed",
            count: mockClasses.filter((c) => c.status === "completed").length
        },
        {
            id: "cancelled",
            label: "Cancelled",
            count: mockClasses.filter((c) => c.status === "cancelled").length
        }
    ];

    const filteredClasses = mockClasses.filter((cls) => {
        const matchesSearch =
            cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cls.instructor.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = activeStatusTab === "all" || cls.status === activeStatusTab;
        return matchesSearch && matchesStatus;
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

    const handleSelectTemplate = (template: ClassTemplate) => {
        setSelectedTemplate(template);
        setShowTemplateSelector(false);
        setShowCreateDialog(true);

        // Pre-populate form with template data
        setClassForm({
            name: template.name,
            instructor: "",
            description: template.description,
            level: template.level,
            capacity: template.capacity.toString(),
            startDate: "",
            endDate: "",
            schedule: "",
            location: "",
            materials: template.materials,
            prerequisites: template.prerequisites
        });

        // Set pricing tiers from template
        setPricingTiers(
            template.pricingTiers.map((tier) => ({
                ...tier,
                id: Date.now().toString() + Math.random()
            }))
        );

        // Set discount codes from template
        setDiscountCodes(
            template.discountCodes.map((code) => ({
                ...code,
                id: Date.now().toString() + Math.random(),
                usageCount: 0
            }))
        );

        setThumbnailImage(template.thumbnail);
        setClassImages(
            template.images.map((url, index) => ({
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

    const handleCreateClass = () => {
        // Validation and creation logic here
        const templateText = selectedTemplate ? ` using template "${selectedTemplate.name}"` : "";
        toast.success(`Class "${classForm.name}" created successfully${templateText}!`);
        setShowCreateDialog(false);
        setSelectedTemplate(null);
    };

    const handleDuplicateClass = (classItem: Class) => {
        toast.success(`Class "${classItem.name}" duplicated successfully`);
    };

    const handleDeleteClass = (classId: string, className: string) => {
        toast.success(`Class "${className}" deleted successfully`);
    };

    // Navigation handlers
    if (viewMode === "manage" && selectedClass) {
        return (
            <ClassManagementPage
                classId={selectedClass}
                onBack={handleBackToList}
            />
        );
    }

    if (viewMode === "preview" && selectedClass) {
        const classData = mockClasses.find((c) => c.id === selectedClass);
        return (
            <ClassPreview
                classData={classData}
                onBack={handleBackToList}
            />
        );
    }

    if (viewMode === "templates") {
        return (
            <ClassTemplateManager
                onBack={handleBackToList}
                mode="manage"
            />
        );
    }

    if (showTemplateSelector) {
        return (
            <ClassTemplateManager
                onBack={() => setShowTemplateSelector(false)}
                onSelectTemplate={handleSelectTemplate}
                mode="select"
            />
        );
    }

    return (
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
                            <div className="text-2xl font-bold">{filteredClasses.length}</div>
                            <p className="text-xs text-muted-foreground">
                                {filteredClasses.filter((c) => c.status === "in-session").length} in
                                session
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
                            <div className="text-2xl font-bold">
                                {filteredClasses.reduce((sum, cls) => sum + cls.enrolled, 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Capacity:{" "}
                                {filteredClasses.reduce((sum, cls) => sum + cls.capacity, 0)}
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
                            <div className="text-2xl font-bold">
                                {filteredClasses.reduce((sum, cls) => sum + cls.waitlist, 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {filteredClasses.filter((c) => c.waitlist > 0).length} classes with
                                waitlist
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
                                $
                                {filteredClasses
                                    .reduce((sum, cls) => sum + (cls.revenue || 0), 0)
                                    .toLocaleString()}
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
                    <Button variant="outline">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                </div>

                {/* Classes Table */}
                <Card>
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
                            {filteredClasses.map((classItem) => (
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
                            ))}
                        </TableBody>
                    </Table>
                </Card>

                {filteredClasses.length === 0 && (
                    <div className="text-center py-12">
                        <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No classes found</h3>
                        <p className="text-muted-foreground">
                            {searchTerm || activeStatusTab !== "all"
                                ? "Try adjusting your search or filter criteria"
                                : "Create your first class to get started"}
                        </p>
                    </div>
                )}
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
                                            <SelectItem value="sarah">Sarah Martinez</SelectItem>
                                            <SelectItem value="michael">Michael Chen</SelectItem>
                                            <SelectItem value="emma">Emma Rodriguez</SelectItem>
                                            <SelectItem value="david">David Park</SelectItem>
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
                                            <SelectItem value="all">All Levels</SelectItem>
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
                                    <Label htmlFor="location">Location</Label>
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
    );
}
