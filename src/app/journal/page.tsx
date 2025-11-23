"use client"

import { useState, useRef, useCallback } from "react";
import {
    Plus,
    Search,
    Filter,
    Calendar,
    BookOpen,
    FolderOpen,
    Share2,
    Users,
    Edit3,
    MessageSquare,
    Eye,
    Copy,
    Settings,
    MoreHorizontal,
    Star,
    Trash2,
    Archive,
    Tag,
    Clock,
    CheckCircle,
    AlertCircle,
    Crown,
    Lock,
    Unlock,
    UserPlus,
    Send,
    Check,
    X,
    Camera,
    Save,
    Palette,
    Image,
    Type,
    Thermometer,
    Flame,
    Beaker,
    FileText,
    BarChart3,
    Upload,
    MousePointer,
    Pen,
    Eraser,
    Highlighter,
    Shapes,
    StickyNote,
    Move,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Download,
    FileDown,
    ChevronLeft,
    ChevronRight,
    Layers,
    Grid,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Bold,
    Italic,
    Underline,
    PlusSquare,
    Minus,
    ArrowUp,
    ArrowDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import {
    useAppContext,
    type Project,
    type PotteryEntry,
    type WhiteboardPage,
    type StickyNote,
    type TextBox,
    type PhotoEntry,
    type DrawingStroke,
    type CollaborationPermission,
    type CollaborationComment,
    type SubscriptionLimits,
    type UsageStats
} from "@/app/context/AppContext";
import { getSubscriptionLimits } from "@/utils/subscriptions";

export default function PotteryJournal() {
    const context = useAppContext();
    const [activeTab, setActiveTab] = useState("throws");
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Dialog states
    const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
    const [showNewThrowDialog, setShowNewThrowDialog] = useState(false);
    const [showEditProjectDialog, setShowEditProjectDialog] = useState(false);
    const [showEditThrowDialog, setShowEditThrowDialog] = useState(false);
    const [showShareDialog, setShowShareDialog] = useState(false);

    // Edit states
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [editingThrow, setEditingThrow] = useState<PotteryEntry | null>(null);
    const [shareTarget, setShareTarget] = useState<{
        type: "project" | "throw";
        id: string;
    } | null>(null);

    // Form states - New Project
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDescription, setNewProjectDescription] = useState("");
    const [newProjectColor, setNewProjectColor] = useState("#8B4513");

    // Form states - New Throw
    const [newThrowData, setNewThrowData] = useState({
        title: "",
        description: "",
        clayType: "Stoneware",
        techniques: [] as string[],
        firingType: "Oxidation",
        firingTemp: "1240°C",
        glazes: [] as string[],
        status: "planning" as const,
        notes: "",
        challenges: "",
        nextSteps: "",
        projectId: "none",
        dimensions: "",
        whiteboardMode: false
    });

    // Share states
    const [shareEmail, setShareEmail] = useState("");
    const [sharePermission, setSharePermission] = useState<"view" | "comment" | "edit">("view");
    const [canDuplicate, setCanDuplicate] = useState(false);

    const subscriptionLimits = getSubscriptionLimits(context.currentUser?.subscription);

    // Available options
    const clayTypes = [
        "Stoneware",
        "Porcelain",
        "Earthenware",
        "Raku",
        "Paper Clay",
        "Grogged Clay"
    ];
    const potteryTypes = [
        "Bowl",
        "Mug",
        "Vase",
        "Plate",
        "Cup",
        "Pitcher",
        "Teapot",
        "Platter",
        "Sculpture",
        "Tile",
        "Bottle",
        "Jar",
        "Other"
    ];
    const techniques = [
        "Wheel throwing",
        "Hand building",
        "Coil building",
        "Slab building",
        "Trimming",
        "Altering",
        "Carving",
        "Texturing",
        "Slip trailing",
        "Mishima"
    ];
    const firingTypes = [
        "Oxidation",
        "Reduction",
        "Raku",
        "Pit firing",
        "Saggar",
        "Salt/Soda",
        "Wood firing"
    ];
    const temperatures = [
        "1000°C",
        "1100°C",
        "1200°C",
        "1240°C",
        "1260°C",
        "1280°C",
        "1300°C",
        "1320°C",
        "Custom"
    ];
    const availableGlazes = context.currentStudio?.glazes || [
        "Clear",
        "Celadon",
        "Iron Red",
        "Copper Green",
        "Matte White",
        "Cobalt Blue"
    ];

    // Mock data - in real app, this would come from your backend
    const [projects, setProjects] = useState<Project[]>([
        {
            id: "proj1",
            name: "Ceramic Bowls Collection",
            description: "A series of functional bowls exploring different glazing techniques",
            color: "#8B4513",
            createdAt: "2025-06-01T10:00:00Z",
            updatedAt: "2025-06-15T14:30:00Z",
            artistId: context.currentUser?.id || "user1",
            throwCount: 3,
            isShared: false,
            sharePermissions: [],
            comments: [],
            tags: ["bowls", "functional", "glazing"],
            status: "active"
        },
        {
            id: "proj2",
            name: "Experimental Vases",
            description: "Testing new forms and surface treatments",
            color: "#2563EB",
            createdAt: "2025-05-15T09:00:00Z",
            updatedAt: "2025-06-10T16:45:00Z",
            artistId: context.currentUser?.id || "user1",
            throwCount: 2,
            isShared: true,
            sharePermissions: [
                {
                    id: "perm1",
                    userId: "artist2",
                    userName: "Sarah Chen",
                    userHandle: "sarahchen",
                    permission: "comment",
                    canDuplicate: false,
                    grantedBy: context.currentUser?.id || "user1",
                    grantedAt: "2025-06-05T10:00:00Z"
                }
            ],
            comments: [
                {
                    id: "comment1",
                    userId: "artist2",
                    userName: "Sarah Chen",
                    userHandle: "sarahchen",
                    content:
                        "Love the experimental approach! The surface textures are really interesting.",
                    createdAt: "2025-06-10T15:30:00Z"
                }
            ],
            tags: ["vases", "experimental", "surface"],
            status: "active"
        }
    ]);

    const [throws, setThrows] = useState<PotteryEntry[]>([
        {
            id: "throw1",
            date: "2025-06-14",
            title: "Celadon Bowl #1",
            potteryType: "Bowl",
            clayType: "Stoneware",
            techniques: ["Wheel throwing", "Trimming"],
            firingType: "Reduction",
            firingTemp: "1280°C",
            glazes: ["Celadon"],
            status: "in-progress",
            notes: "First attempt at the new celadon glaze recipe",
            photos: [],
            challenges: "Getting the rim thickness consistent",
            nextSteps: "Bisque fire next week",
            artistId: context.currentUser?.id || "user1",
            projectId: "proj1",
            dimensions: '6" diameter x 3" height',
            description: "Functional celadon bowl with subtle rim details",
            isShared: false,
            sharePermissions: [],
            comments: [],
            createdAt: "2025-06-14T10:00:00Z",
            updatedAt: "2025-06-14T15:30:00Z",
            whiteboardPages: [
                {
                    id: "page1",
                    title: "Process Overview",
                    order: 0,
                    canvasWidth: 1400,
                    canvasHeight: 900,
                    backgroundColor: "#FFFFFF",
                    elements: {
                        photos: [],
                        stickyNotes: [
                            {
                                id: "sticky1",
                                content: "Center the clay\nPull up walls slowly",
                                x: 100,
                                y: 100,
                                width: 200,
                                height: 120,
                                color: "yellow",
                                fontSize: "medium",
                                createdAt: "2025-06-14T10:00:00Z",
                                createdBy: context.currentUser?.id || "user1"
                            }
                        ],
                        textBoxes: [],
                        drawings: []
                    },
                    createdAt: "2025-06-14T10:00:00Z",
                    updatedAt: "2025-06-14T10:00:00Z"
                }
            ],
            whiteboardMode: true,
            coverImageUrl: undefined
        },
        {
            id: "throw2",
            date: "2025-06-12",
            title: "Experimental Vase Form",
            potteryType: "Vase",
            clayType: "Porcelain",
            techniques: ["Wheel throwing", "Altering"],
            firingType: "Oxidation",
            firingTemp: "1240°C",
            glazes: ["Ash glaze", "Iron wash"],
            status: "completed",
            notes: "Trying a new asymmetrical form",
            photos: [],
            challenges: "Keeping the altered form stable during drying",
            nextSteps: "Document for portfolio",
            artistId: context.currentUser?.id || "user1",
            projectId: "proj2",
            dimensions: '8" height x 4" width',
            description: "Contemporary altered vase with natural ash glaze",
            isShared: false,
            sharePermissions: [],
            comments: [],
            createdAt: "2025-06-12T09:00:00Z",
            updatedAt: "2025-06-13T11:15:00Z",
            whiteboardPages: [],
            whiteboardMode: false,
            coverImageUrl: undefined
        }
    ]);

    const calculateUsageStats = (): UsageStats => {
        const projectsUsed = projects.length;
        const throwsInProjects = throws.filter((t) => t.projectId).length;
        const additionalThrowsUsed = throws.filter((t) => !t.projectId).length;
        const totalThrows = throws.length;

        return {
            projectsUsed,
            throwsInProjects,
            additionalThrowsUsed,
            totalThrows
        };
    };

    const usageStats = calculateUsageStats();

    const filteredThrows = throws.filter((entry) => {
        const matchesSearch =
            entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.potteryType.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || entry.status === statusFilter;
        const matchesProject =
            selectedProject === null ||
            (selectedProject === "none" ? !entry.projectId : entry.projectId === selectedProject);

        return matchesSearch && matchesStatus && matchesProject;
    });

    const filteredProjects = projects.filter((project) =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Helper functions
    const resetNewThrowForm = () => {
        setNewThrowData({
            title: "",
            description: "",
            clayType: "Stoneware",
            techniques: [],
            firingType: "Oxidation",
            firingTemp: "1240°C",
            glazes: [],
            status: "planning",
            notes: "",
            challenges: "",
            nextSteps: "",
            projectId: "none",
            dimensions: "",
            whiteboardMode: false
        });
    };

    const handleCreateProject = () => {
        if (!newProjectName.trim()) return;

        if (
            subscriptionLimits.projects !== -1 &&
            usageStats.projectsUsed >= subscriptionLimits.projects
        ) {
            alert(
                `You've reached your project limit of ${subscriptionLimits.projects}. Upgrade to create more projects.`
            );
            return;
        }

        const newProject: Project = {
            id: `proj${Date.now()}`,
            name: newProjectName,
            description: newProjectDescription,
            color: newProjectColor,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            artistId: context.currentUser?.id || "user1",
            throwCount: 0,
            isShared: false,
            sharePermissions: [],
            comments: [],
            tags: [],
            status: "active"
        };

        setProjects((prev) => [newProject, ...prev]);
        setNewProjectName("");
        setNewProjectDescription("");
        setNewProjectColor("#8B4513");
        setShowNewProjectDialog(false);
    };

    const handleCreateThrow = () => {
        if (!newThrowData.title.trim()) return;

        const actualProjectId =
            newThrowData.projectId === "none" ? undefined : newThrowData.projectId;
        const isInProject = !!actualProjectId;

        if (
            !isInProject &&
            subscriptionLimits.additionalThrows !== -1 &&
            usageStats.additionalThrowsUsed >= subscriptionLimits.additionalThrows
        ) {
            alert(
                `You've reached your individual throws limit of ${subscriptionLimits.additionalThrows}. Upgrade or add to a project.`
            );
            return;
        }

        const initialWhiteboardPages: WhiteboardPage[] = newThrowData.whiteboardMode
            ? [
                  {
                      id: `page${Date.now()}`,
                      title: "Page 1",
                      order: 0,
                      canvasWidth: 1400,
                      canvasHeight: 900,
                      backgroundColor: "#FFFFFF",
                      elements: {
                          photos: [],
                          stickyNotes: [],
                          textBoxes: [],
                          drawings: []
                      },
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                  }
              ]
            : [];

        const newThrow: PotteryEntry = {
            id: `throw${Date.now()}`,
            date: new Date().toISOString().split("T")[0],
            ...newThrowData,
            potteryType: "Pottery", // Default value since it's required in the interface
            projectId: actualProjectId,
            photos: [],
            artistId: context.currentUser?.id || "user1",
            isForSale: false,
            isShared: false,
            sharePermissions: [],
            comments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            whiteboardPages: initialWhiteboardPages,
            coverImageUrl: undefined
        };

        setThrows((prev) => [newThrow, ...prev]);

        if (actualProjectId) {
            setProjects((prev) =>
                prev.map((p) =>
                    p.id === actualProjectId
                        ? {
                              ...p,
                              throwCount: p.throwCount + 1,
                              updatedAt: new Date().toISOString()
                          }
                        : p
                )
            );
        }

        resetNewThrowForm();
        setShowNewThrowDialog(false);

        // If whiteboard mode, navigate to whiteboard editor
        if (newThrowData.whiteboardMode) {
            context.setCurrentThrow(newThrow);

            // TODO: navigateToPage does not
            context.navigateToPage("whiteboard");
        }
    };

    const handleEditThrow = (throwItem: PotteryEntry) => {
        if (throwItem.whiteboardMode && throwItem.whiteboardPages.length > 0) {
            // Navigate to whiteboard editor
            context.setCurrentThrow(throwItem);
            context.navigateToPage("whiteboard");
        } else {
            // Open traditional form editor
            setEditingThrow(throwItem);
            setShowEditThrowDialog(true);
        }
    };

    const handleUpdateThrow = () => {
        if (!editingThrow) return;

        setThrows((prev) =>
            prev.map((t) =>
                t.id === editingThrow.id
                    ? { ...editingThrow, updatedAt: new Date().toISOString() }
                    : t
            )
        );

        setEditingThrow(null);
        setShowEditThrowDialog(false);
    };

    const handleExportToPDF = (throwId: string) => {
        if (!subscriptionLimits.canExport) {
            alert(
                "PDF export is not available in your current plan. Please upgrade to unlock this feature."
            );
            return;
        }
        alert(
            "PDF export functionality would be implemented here. This would generate a PDF with all pages and elements."
        );
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case "in-progress":
                return <Clock className="w-4 h-4 text-blue-500" />;
            case "fired":
                return <Star className="w-4 h-4 text-orange-500" />;
            case "planning":
                return <FileText className="w-4 h-4 text-purple-500" />;
            default:
                return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
        }
    };

    const getSubscriptionBadge = () => {
        const subscription = context.currentUser?.subscription || "free";
        const colors = {
            free: "bg-gray-500",
            passion: "bg-blue-500",
            "small-artist": "bg-purple-500",
            "studio-pro": "bg-yellow-600"
        };

        return (
            <Badge className={`${colors[subscription as keyof typeof colors]} text-white`}>
                {subscription === "free"
                    ? "Free"
                    : subscription === "passion"
                      ? "Passion"
                      : subscription === "small-artist"
                        ? "Small Artist"
                        : "Studio Pro"}
            </Badge>
        );
    };

    const renderUsageLimits = () => (
        <Card className="mb-6">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                        <BarChart3 className="w-5 h-5" />
                        <span>Usage & Limits</span>
                    </CardTitle>
                    {getSubscriptionBadge()}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm">Projects</Label>
                            <span className="text-sm text-muted-foreground">
                                {usageStats.projectsUsed}/
                                {subscriptionLimits.projects === -1
                                    ? "∞"
                                    : subscriptionLimits.projects}
                            </span>
                        </div>
                        <Progress
                            value={
                                subscriptionLimits.projects === -1
                                    ? 0
                                    : (usageStats.projectsUsed / subscriptionLimits.projects) * 100
                            }
                            className="h-2"
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm">Individual Throws</Label>
                            <span className="text-sm text-muted-foreground">
                                {usageStats.additionalThrowsUsed}/
                                {subscriptionLimits.additionalThrows === -1
                                    ? "∞"
                                    : subscriptionLimits.additionalThrows}
                            </span>
                        </div>
                        <Progress
                            value={
                                subscriptionLimits.additionalThrows === -1
                                    ? 0
                                    : (usageStats.additionalThrowsUsed /
                                          subscriptionLimits.additionalThrows) *
                                      100
                            }
                            className="h-2"
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm">Total Throws</Label>
                            <span className="text-sm text-muted-foreground">
                                {usageStats.totalThrows}
                            </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {usageStats.throwsInProjects} in projects,{" "}
                            {usageStats.additionalThrowsUsed} individual
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t">
                    <div className="flex items-center space-x-2">
                        <div
                            className={`w-2 h-2 rounded-full ${
                                subscriptionLimits.canUploadPhotos ? "bg-green-500" : "bg-gray-400"
                            }`}
                        />
                        <span className="text-xs text-muted-foreground">Photo Upload</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div
                            className={`w-2 h-2 rounded-full ${
                                subscriptionLimits.canAnnotatePhotos
                                    ? "bg-green-500"
                                    : "bg-gray-400"
                            }`}
                        />
                        <span className="text-xs text-muted-foreground">Photo Annotation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div
                            className={`w-2 h-2 rounded-full ${
                                subscriptionLimits.canExport ? "bg-green-500" : "bg-gray-400"
                            }`}
                        />
                        <span className="text-xs text-muted-foreground">PDF Export</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div
                            className={`w-2 h-2 rounded-full ${
                                subscriptionLimits.canCollaborate ? "bg-green-500" : "bg-gray-400"
                            }`}
                        />
                        <span className="text-xs text-muted-foreground">Collaboration</span>
                    </div>
                </div>

                {context.currentUser?.subscription === "free" && (
                    <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border">
                        <div>
                            <p className="text-sm font-medium">Unlock advanced features</p>
                            <p className="text-xs text-muted-foreground">
                                Photo uploads, multiple pages, and PDF export
                            </p>
                        </div>
                        <Button size="sm">Upgrade</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="flex items-center space-x-3">
                        <Palette className="w-8 h-8 text-primary" />
                        <span>Pottery Journal</span>
                    </h1>
                    <p className="text-muted-foreground">
                        Document your ceramic journey with photos, sketches, and notes
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        variant="outline"
                        onClick={() => setShowNewProjectDialog(true)}
                        disabled={
                            subscriptionLimits.projects !== -1 &&
                            usageStats.projectsUsed >= subscriptionLimits.projects
                        }
                    >
                        <FolderOpen className="w-4 h-4 mr-2" />
                        New Project
                    </Button>
                    <Button
                        onClick={() => setShowNewThrowDialog(true)}
                        disabled={
                            subscriptionLimits.additionalThrows !== -1 &&
                            usageStats.additionalThrowsUsed >= subscriptionLimits.additionalThrows
                        }
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Throw
                    </Button>
                </div>
            </div>

            {renderUsageLimits()}

            {/* Main Content */}
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
            >
                <TabsList>
                    <TabsTrigger value="throws">All Throws ({throws.length})</TabsTrigger>
                    <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
                </TabsList>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="relative flex-1 min-w-64">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    placeholder={
                                        activeTab === "throws"
                                            ? "Search throws..."
                                            : "Search projects..."
                                    }
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {activeTab === "throws" && (
                                <>
                                    <Select
                                        value={statusFilter}
                                        onValueChange={setStatusFilter}
                                    >
                                        <SelectTrigger className="w-48">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value="planning">Planning</SelectItem>
                                            <SelectItem value="in-progress">In Progress</SelectItem>
                                            <SelectItem value="fired">Fired</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={selectedProject || "all"}
                                        onValueChange={(value) =>
                                            setSelectedProject(value === "all" ? null : value)
                                        }
                                    >
                                        <SelectTrigger className="w-48">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Projects</SelectItem>
                                            <SelectItem value="none">No Project</SelectItem>
                                            {projects.map((project) => (
                                                <SelectItem
                                                    key={project.id}
                                                    value={project.id}
                                                >
                                                    {project.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Throws Tab */}
                <TabsContent
                    value="throws"
                    className="space-y-6"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredThrows.map((entry) => {
                            const project = entry.projectId
                                ? projects.find((p) => p.id === entry.projectId)
                                : null;

                            return (
                                <Card
                                    key={entry.id}
                                    className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4"
                                    style={{ borderLeftColor: project?.color || "#e5e7eb" }}
                                    onClick={() => handleEditThrow(entry)}
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    {getStatusIcon(entry.status)}
                                                    <h3 className="font-semibold truncate">
                                                        {entry.title}
                                                    </h3>
                                                    {entry.whiteboardMode && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            <Layers className="w-3 h-3 mr-1" />
                                                            {entry.whiteboardPages.length}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>
                                                        {new Date(entry.date).toLocaleDateString()}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {entry.potteryType}
                                                    </Badge>
                                                </div>
                                                {project && (
                                                    <div className="flex items-center space-x-1 mb-2">
                                                        <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{
                                                                backgroundColor: project.color
                                                            }}
                                                        />
                                                        <span className="text-xs text-muted-foreground">
                                                            {project.name}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    asChild
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="opacity-0 group-hover:opacity-100"
                                                    >
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditThrow(entry);
                                                        }}
                                                    >
                                                        <Edit3 className="w-4 h-4 mr-2" />
                                                        {entry.whiteboardMode
                                                            ? "Open Whiteboard"
                                                            : "Edit Throw"}
                                                    </DropdownMenuItem>
                                                    {subscriptionLimits.canExport && (
                                                        <DropdownMenuItem
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleExportToPDF(entry.id);
                                                            }}
                                                        >
                                                            <FileDown className="w-4 h-4 mr-2" />
                                                            Export PDF
                                                        </DropdownMenuItem>
                                                    )}
                                                    {subscriptionLimits.canCollaborate && (
                                                        <DropdownMenuItem
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setShareTarget({
                                                                    type: "throw",
                                                                    id: entry.id
                                                                });
                                                                setShowShareDialog(true);
                                                            }}
                                                        >
                                                            <Share2 className="w-4 h-4 mr-2" />
                                                            Share
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (
                                                                confirm(
                                                                    "Are you sure you want to delete this throw?"
                                                                )
                                                            ) {
                                                                setThrows((prev) =>
                                                                    prev.filter(
                                                                        (t) => t.id !== entry.id
                                                                    )
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Clay:</span>
                                                <span>{entry.clayType}</span>
                                            </div>
                                            {entry.dimensions && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        Size:
                                                    </span>
                                                    <span>{entry.dimensions}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    Firing:
                                                </span>
                                                <span>
                                                    {entry.firingType} @ {entry.firingTemp}
                                                </span>
                                            </div>
                                            {entry.glazes.length > 0 && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        Glazes:
                                                    </span>
                                                    <span className="truncate">
                                                        {entry.glazes.join(", ")}
                                                    </span>
                                                </div>
                                            )}
                                            {entry.notes && (
                                                <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                                                    {entry.notes}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between pt-2">
                                                <div className="flex items-center space-x-2">
                                                    {entry.isShared && (
                                                        <div className="flex items-center space-x-1">
                                                            <Users className="w-3 h-3 text-blue-500" />
                                                            <span className="text-xs text-blue-500">
                                                                Shared
                                                            </span>
                                                        </div>
                                                    )}
                                                    {entry.whiteboardMode && (
                                                        <div className="flex items-center space-x-1">
                                                            <Palette className="w-3 h-3 text-purple-500" />
                                                            <span className="text-xs text-purple-500">
                                                                Whiteboard
                                                            </span>
                                                        </div>
                                                    )}
                                                    {entry.techniques.length > 0 && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            {entry.techniques.length} technique
                                                            {entry.techniques.length !== 1
                                                                ? "s"
                                                                : ""}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <Badge
                                                    variant={
                                                        entry.status === "completed"
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                    className="text-xs"
                                                >
                                                    {entry.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {filteredThrows.length === 0 && (
                        <div className="text-center py-12">
                            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3>No throws found</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchTerm
                                    ? "Try adjusting your search or filters"
                                    : "Start documenting your pottery journey"}
                            </p>
                            <Button onClick={() => setShowNewThrowDialog(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create First Throw
                            </Button>
                        </div>
                    )}
                </TabsContent>

                {/* Projects Tab */}
                <TabsContent
                    value="projects"
                    className="space-y-6"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => (
                            <Card
                                key={project.id}
                                className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4"
                                style={{ borderLeftColor: project.color }}
                                onClick={() => {
                                    setSelectedProject(project.id);
                                    setActiveTab("throws");
                                }}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-3 flex-1">
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: project.color }}
                                            />
                                            <div>
                                                <h3 className="font-semibold">{project.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {project.throwCount} throws
                                                </p>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger
                                                asChild
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="opacity-0 group-hover:opacity-100"
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingProject(project);
                                                        setShowEditProjectDialog(true);
                                                    }}
                                                >
                                                    <Edit3 className="w-4 h-4 mr-2" />
                                                    Edit Project
                                                </DropdownMenuItem>
                                                {subscriptionLimits.canCollaborate && (
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShareTarget({
                                                                type: "project",
                                                                id: project.id
                                                            });
                                                            setShowShareDialog(true);
                                                        }}
                                                    >
                                                        <Share2 className="w-4 h-4 mr-2" />
                                                        Share Project
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (
                                                            confirm(
                                                                "Are you sure you want to delete this project?"
                                                            )
                                                        ) {
                                                            setProjects((prev) =>
                                                                prev.filter(
                                                                    (p) => p.id !== project.id
                                                                )
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {project.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                                            {project.description}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-muted-foreground">Created:</span>
                                        <span>
                                            {new Date(project.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Updated:</span>
                                        <span>
                                            {new Date(project.updatedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center space-x-2">
                                            {project.isShared && (
                                                <div className="flex items-center space-x-1">
                                                    <Users className="w-3 h-3 text-blue-500" />
                                                    <span className="text-xs text-blue-500">
                                                        Shared
                                                    </span>
                                                </div>
                                            )}
                                            {project.comments.length > 0 && (
                                                <div className="flex items-center space-x-1">
                                                    <MessageSquare className="w-3 h-3 text-green-500" />
                                                    <span className="text-xs text-green-500">
                                                        {project.comments.length}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <Badge variant="outline">{project.status}</Badge>
                                    </div>
                                    {project.tags && project.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {project.tags.slice(0, 3).map((tag) => (
                                                <Badge
                                                    key={tag}
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                            {project.tags.length > 3 && (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    +{project.tags.length - 3} more
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {filteredProjects.length === 0 && (
                        <div className="text-center py-12">
                            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3>No projects found</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchTerm
                                    ? "Try adjusting your search"
                                    : "Create your first project to organize your throws"}
                            </p>
                            <Button onClick={() => setShowNewProjectDialog(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create First Project
                            </Button>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <Dialog
                open={showNewProjectDialog}
                onOpenChange={setShowNewProjectDialog}
            >
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <FolderOpen className="w-5 h-5" />
                            <span>Create New Project</span>
                        </DialogTitle>
                        <DialogDescription>
                            Organize your throws into projects to better track your ceramic journey.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                                htmlFor="project-name"
                                className="text-right"
                            >
                                Name
                            </Label>
                            <Input
                                id="project-name"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                placeholder="e.g., Dinner Set Collection"
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label
                                htmlFor="project-description"
                                className="text-right mt-2"
                            >
                                Description
                            </Label>
                            <Textarea
                                id="project-description"
                                value={newProjectDescription}
                                onChange={(e) => setNewProjectDescription(e.target.value)}
                                placeholder="What's this project about?"
                                className="col-span-3"
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                                htmlFor="project-color"
                                className="text-right"
                            >
                                Color
                            </Label>
                            <div className="flex items-center space-x-3 col-span-3">
                                <input
                                    id="project-color"
                                    type="color"
                                    value={newProjectColor}
                                    onChange={(e) => setNewProjectColor(e.target.value)}
                                    className="w-12 h-10 rounded border"
                                />
                                <span className="text-sm text-muted-foreground">
                                    Choose a color to identify your project
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowNewProjectDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateProject}
                            disabled={!newProjectName.trim()}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Create Project
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog
                open={showNewThrowDialog}
                onOpenChange={setShowNewThrowDialog}
            >
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <Plus className="w-5 h-5" />
                            <span>Document New Throw</span>
                        </DialogTitle>
                        <DialogDescription>
                            Record the details of your pottery piece. Choose traditional form or
                            whiteboard mode for visual documentation.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="space-y-4">
                            <h4 className="flex items-center space-x-2 font-medium">
                                <Settings className="w-4 h-4" />
                                <span>Documentation Mode</span>
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card
                                    className={`cursor-pointer transition-all duration-200 ${
                                        !newThrowData.whiteboardMode
                                            ? "ring-2 ring-primary"
                                            : "hover:shadow-md"
                                    }`}
                                    onClick={() =>
                                        setNewThrowData((prev) => ({
                                            ...prev,
                                            whiteboardMode: false
                                        }))
                                    }
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <FileText className="w-8 h-8 text-blue-500" />
                                            <div>
                                                <h5 className="font-medium">Traditional Form</h5>
                                                <p className="text-sm text-muted-foreground">
                                                    Structured form with fields for pottery details
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card
                                    className={`cursor-pointer transition-all duration-200 ${
                                        newThrowData.whiteboardMode
                                            ? "ring-2 ring-primary"
                                            : "hover:shadow-md"
                                    }`}
                                    onClick={() =>
                                        setNewThrowData((prev) => ({
                                            ...prev,
                                            whiteboardMode: true
                                        }))
                                    }
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <Palette className="w-8 h-8 text-purple-500" />
                                            <div>
                                                <h5 className="font-medium">Whiteboard Mode</h5>
                                                <p className="text-sm text-muted-foreground">
                                                    Visual canvas with photos, sketches, and notes
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="flex items-center space-x-2 font-medium">
                                <Type className="w-4 h-4" />
                                <span>Basic Information</span>
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="throw-title">Title *</Label>
                                    <Input
                                        id="throw-title"
                                        value={newThrowData.title}
                                        onChange={(e) =>
                                            setNewThrowData((prev) => ({
                                                ...prev,
                                                title: e.target.value
                                            }))
                                        }
                                        placeholder="e.g., Celadon Bowl #1"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="throw-description">Description</Label>
                                    <Textarea
                                        id="throw-description"
                                        value={newThrowData.description}
                                        onChange={(e) =>
                                            setNewThrowData((prev) => ({
                                                ...prev,
                                                description: e.target.value
                                            }))
                                        }
                                        placeholder="Describe your piece - what are you making, what's special about it?"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="throw-project">Project (Optional)</Label>
                                    <Select
                                        value={newThrowData.projectId}
                                        onValueChange={(value) =>
                                            setNewThrowData((prev) => ({
                                                ...prev,
                                                projectId: value
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="No project" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No project</SelectItem>
                                            {projects.map((project) => (
                                                <SelectItem
                                                    key={project.id}
                                                    value={project.id}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{
                                                                backgroundColor: project.color
                                                            }}
                                                        />
                                                        <span>{project.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {newThrowData.whiteboardMode && (
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                <div className="flex items-start space-x-3">
                                    <Palette className="w-5 h-5 text-purple-500 mt-0.5" />
                                    <div>
                                        <h5 className="font-medium text-purple-900">
                                            Whiteboard Mode
                                        </h5>
                                        <p className="text-sm text-purple-700 mt-1">
                                            Your throw will open in a visual whiteboard where you
                                            can add photos, sketches, sticky notes, and text.
                                            Perfect for documenting your process with visual
                                            elements and freeform notes.
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <Badge
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                <Upload className="w-3 h-3 mr-1" />
                                                Photo Upload
                                            </Badge>
                                            <Badge
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                <StickyNote className="w-3 h-3 mr-1" />
                                                Sticky Notes
                                            </Badge>
                                            <Badge
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                <Pen className="w-3 h-3 mr-1" />
                                                Drawing Tools
                                            </Badge>
                                            <Badge
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                <Layers className="w-3 h-3 mr-1" />
                                                Multiple Pages
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowNewThrowDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateThrow}
                            disabled={!newThrowData.title.trim()}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {newThrowData.whiteboardMode ? "Create Whiteboard" : "Save Throw"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Traditional Throw Edit Dialog */}
            <Dialog
                open={showEditThrowDialog}
                onOpenChange={setShowEditThrowDialog}
            >
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <Edit3 className="w-5 h-5" />
                            <span>Edit Throw</span>
                        </DialogTitle>
                        <DialogDescription>
                            Update the details of your pottery piece.
                        </DialogDescription>
                    </DialogHeader>
                    {editingThrow && (
                        <div className="grid gap-6 py-4">
                            <div className="space-y-4">
                                <h4 className="flex items-center space-x-2 font-medium">
                                    <Type className="w-4 h-4" />
                                    <span>Basic Information</span>
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="edit-throw-title">Title *</Label>
                                        <Input
                                            id="edit-throw-title"
                                            value={editingThrow.title}
                                            onChange={(e) =>
                                                setEditingThrow({
                                                    ...editingThrow,
                                                    title: e.target.value
                                                })
                                            }
                                            placeholder="e.g., Celadon Bowl #1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-throw-type">Pottery Type</Label>
                                        <Select
                                            value={editingThrow.potteryType}
                                            onValueChange={(value) =>
                                                setEditingThrow({
                                                    ...editingThrow,
                                                    potteryType: value
                                                })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {potteryTypes.map((type) => (
                                                    <SelectItem
                                                        key={type}
                                                        value={type}
                                                    >
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-throw-dimensions">Dimensions</Label>
                                        <Input
                                            id="edit-throw-dimensions"
                                            value={editingThrow.dimensions || ""}
                                            onChange={(e) =>
                                                setEditingThrow({
                                                    ...editingThrow,
                                                    dimensions: e.target.value
                                                })
                                            }
                                            placeholder="e.g., 6″ diameter x 3″ height"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-throw-status">Status</Label>
                                        <Select
                                            value={editingThrow.status}
                                            onValueChange={(
                                                value:
                                                    | "planning"
                                                    | "in-progress"
                                                    | "fired"
                                                    | "completed"
                                            ) =>
                                                setEditingThrow({ ...editingThrow, status: value })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="planning">Planning</SelectItem>
                                                <SelectItem value="in-progress">
                                                    In Progress
                                                </SelectItem>
                                                <SelectItem value="fired">Fired</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="flex items-center space-x-2 font-medium">
                                    <Flame className="w-4 h-4" />
                                    <span>Clay & Firing</span>
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="edit-clay-type">Clay Type</Label>
                                        <Select
                                            value={editingThrow.clayType}
                                            onValueChange={(value) =>
                                                setEditingThrow({
                                                    ...editingThrow,
                                                    clayType: value
                                                })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {clayTypes.map((type) => (
                                                    <SelectItem
                                                        key={type}
                                                        value={type}
                                                    >
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-firing-type">Firing Type</Label>
                                        <Select
                                            value={editingThrow.firingType}
                                            onValueChange={(value) =>
                                                setEditingThrow({
                                                    ...editingThrow,
                                                    firingType: value
                                                })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {firingTypes.map((type) => (
                                                    <SelectItem
                                                        key={type}
                                                        value={type}
                                                    >
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-firing-temp">Temperature</Label>
                                        <Select
                                            value={editingThrow.firingTemp}
                                            onValueChange={(value) =>
                                                setEditingThrow({
                                                    ...editingThrow,
                                                    firingTemp: value
                                                })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {temperatures.map((temp) => (
                                                    <SelectItem
                                                        key={temp}
                                                        value={temp}
                                                    >
                                                        {temp}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="flex items-center space-x-2 font-medium">
                                    <FileText className="w-4 h-4" />
                                    <span>Notes & Reflection</span>
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="edit-throw-description">Description</Label>
                                        <Textarea
                                            id="edit-throw-description"
                                            value={editingThrow.description || ""}
                                            onChange={(e) =>
                                                setEditingThrow({
                                                    ...editingThrow,
                                                    description: e.target.value
                                                })
                                            }
                                            placeholder="Brief description of the piece..."
                                            rows={2}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-throw-notes">Process Notes</Label>
                                        <Textarea
                                            id="edit-throw-notes"
                                            value={editingThrow.notes}
                                            onChange={(e) =>
                                                setEditingThrow({
                                                    ...editingThrow,
                                                    notes: e.target.value
                                                })
                                            }
                                            placeholder="What happened during the making process?"
                                            rows={3}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-throw-challenges">Challenges</Label>
                                        <Textarea
                                            id="edit-throw-challenges"
                                            value={editingThrow.challenges}
                                            onChange={(e) =>
                                                setEditingThrow({
                                                    ...editingThrow,
                                                    challenges: e.target.value
                                                })
                                            }
                                            placeholder="What was difficult?"
                                            rows={2}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-throw-next-steps">Next Steps</Label>
                                        <Textarea
                                            id="edit-throw-next-steps"
                                            value={editingThrow.nextSteps}
                                            onChange={(e) =>
                                                setEditingThrow({
                                                    ...editingThrow,
                                                    nextSteps: e.target.value
                                                })
                                            }
                                            placeholder="What's next for this piece?"
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowEditThrowDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateThrow}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Share Dialog */}
            <Dialog
                open={showShareDialog}
                onOpenChange={setShowShareDialog}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Share {shareTarget?.type === "project" ? "Project" : "Throw"}
                        </DialogTitle>
                        <DialogDescription>
                            Collaborate with other artists by sharing your work.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Email Address</Label>
                            <Input
                                value={shareEmail}
                                onChange={(e) => setShareEmail(e.target.value)}
                                placeholder="artist@example.com"
                                type="email"
                            />
                        </div>
                        <div>
                            <Label>Permission Level</Label>
                            <Select
                                value={sharePermission}
                                onValueChange={(value: "view" | "comment" | "edit") =>
                                    setSharePermission(value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="view">View Only</SelectItem>
                                    <SelectItem value="comment">Comment</SelectItem>
                                    <SelectItem value="edit">Edit</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                checked={canDuplicate}
                                onCheckedChange={setCanDuplicate}
                            />
                            <Label>Allow duplication</Label>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowShareDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => alert("Share functionality would be implemented here")}
                            disabled={!shareEmail.trim()}
                        >
                            <Send className="w-4 h-4 mr-2" />
                            Share
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
