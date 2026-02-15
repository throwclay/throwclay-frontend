"use client";
import { useState, useEffect, useCallback } from "react";
import {
    ArrowLeft,
    Plus,
    Search,
    Filter,
    Copy,
    Edit,
    Trash2,
    Eye,
    BookOpen,
    Users,
    Calendar,
    DollarSign,
    Star,
    MoreHorizontal,
    Save,
    FileText,
    History,
    Tag,
    Loader2
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";
import { useAppContext } from "@/app/context/AppContext";
import type { ClassTemplate as ClassTemplateType } from "@/types";

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
    baseTemplateId?: string;
    versions: TemplateVersion[];
}

interface PricingTier {
    name: string;
    price: number;
    description: string;
    isDefault: boolean;
}

interface DiscountCode {
    code: string;
    type: "percentage" | "fixed";
    value: number;
    description: string;
}

interface TemplateVersion {
    id: string;
    version: string;
    description: string;
    createdBy: string;
    createdDate: string;
    isActive: boolean;
}

interface ClassTemplateManagerProps {
    onBack: () => void;
    onSelectTemplate?: (template: ClassTemplate) => void;
    mode?: "manage" | "select";
}

export function ClassTemplateManager({
    onBack,
    onSelectTemplate,
    mode = "manage"
}: ClassTemplateManagerProps) {
    const context = useAppContext();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showVersionDialog, setShowVersionDialog] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<ClassTemplate | null>(null);
    const [newTemplateName, setNewTemplateName] = useState("");
    const [newTemplateDescription, setNewTemplateDescription] = useState("");
    const [newTemplateCategory, setNewTemplateCategory] = useState("");
    const [newTemplateTags, setNewTemplateTags] = useState("");
    const [templates, setTemplates] = useState<ClassTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch templates from API
    const fetchTemplates = useCallback(async () => {
        if (!context.currentStudio?.id || !context.authToken) {
            setTemplates([]);
            return;
        }

        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedCategory !== "all") {
                params.append("category", selectedCategory);
            }
            if (searchTerm) {
                params.append("search", searchTerm);
            }

            const res = await fetch(
                `/api/admin/studios/${context.currentStudio.id}/class-templates?${params.toString()}`,
                {
                    headers: { Authorization: `Bearer ${context.authToken}` }
                }
            );

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error || "Failed to load templates");
            }

            const data = await res.json();
            // Transform API data to match component interface
            const transformedTemplates: ClassTemplate[] = (data.templates || []).map((t: any) => ({
                id: t.id,
                name: t.name,
                description: t.description || "",
                category: t.category || "",
                level: t.level || "",
                duration: t.duration || "",
                capacity: t.capacity || 0,
                materials: t.materials || "",
                prerequisites: t.prerequisites || "",
                whatYouLearn: t.whatYouLearn || [],
                pricingTiers: t.pricingTiers || [],
                discountCodes: t.discountCodes || [],
                images: t.images || [],
                thumbnail: t.thumbnail || "",
                createdBy: t.createdBy || "",
                createdDate: t.createdDate || t.createdAt || "",
                lastModified: t.lastModified || t.updatedAt || "",
                version: t.version || "1.0",
                isPublic: t.isPublic || false,
                usageCount: t.usageCount || 0,
                tags: t.tags || [],
                baseTemplateId: t.baseTemplateId,
                versions: [] // Versions not in API response yet
            }));

            setTemplates(transformedTemplates);
        } catch (err: any) {
            console.error("Error fetching templates", err);
            toast.error(err.message || "Failed to load templates");
            setTemplates([]);
        } finally {
            setIsLoading(false);
        }
    }, [context.currentStudio?.id, context.authToken, selectedCategory, searchTerm]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);


    const categories = [
        "all",
        "Wheel Throwing",
        "Handbuilding",
        "Glazing",
        "Kids Classes",
        "Sculpting",
        "Workshops"
    ];

    // Filter templates client-side (API already filters by category and search)
    const filteredTemplates = templates;

    const handleCreateTemplate = async () => {
        if (!newTemplateName.trim()) {
            toast.error("Please enter a template name");
            return;
        }

        if (!context.currentStudio?.id || !context.authToken) {
            toast.error("Missing required information");
            return;
        }

        try {
            const res = await fetch(
                `/api/admin/studios/${context.currentStudio.id}/class-templates`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${context.authToken}`
                    },
                    body: JSON.stringify({
                        name: newTemplateName,
                        description: newTemplateDescription,
                        category: newTemplateCategory,
                        level: "",
                        duration: "",
                        capacity: 0,
                        materials: "",
                        prerequisites: "",
                        whatYouLearn: [],
                        pricingTiers: [],
                        discountCodes: [],
                        images: [],
                        thumbnail: "",
                        isPublic: false
                    })
                }
            );

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error || "Failed to create template");
            }

            toast.success("Template created successfully!");
            setShowCreateDialog(false);
            setNewTemplateName("");
            setNewTemplateDescription("");
            setNewTemplateCategory("");
            setNewTemplateTags("");
            fetchTemplates();
        } catch (err: any) {
            console.error("Error creating template", err);
            toast.error(err.message || "Failed to create template");
        }
    };

    const handleSelectTemplate = (template: ClassTemplate) => {
        if (mode === "select" && onSelectTemplate) {
            onSelectTemplate(template);
            toast.success(`Template "${template.name}" selected`);
        }
    };

    const handleDuplicateTemplate = async (template: ClassTemplate) => {
        if (!context.currentStudio?.id || !context.authToken) {
            toast.error("Missing required information");
            return;
        }

        try {
            const res = await fetch(
                `/api/admin/studios/${context.currentStudio.id}/class-templates/${template.id}/duplicate`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${context.authToken}`
                    },
                    body: JSON.stringify({
                        name: `${template.name} (Copy)`
                    })
                }
            );

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error || "Failed to duplicate template");
            }

            toast.success(`Template "${template.name}" duplicated`);
            fetchTemplates();
        } catch (err: any) {
            console.error("Error duplicating template", err);
            toast.error(err.message || "Failed to duplicate template");
        }
    };

    const handleDeleteTemplate = async (templateId: string, templateName: string) => {
        if (!context.currentStudio?.id || !context.authToken) {
            toast.error("Missing required information");
            return;
        }

        if (!confirm(`Are you sure you want to delete "${templateName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const res = await fetch(
                `/api/admin/studios/${context.currentStudio.id}/class-templates/${templateId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${context.authToken}`
                    }
                }
            );

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error || "Failed to delete template");
            }

            toast.success(`Template "${templateName}" deleted`);
            fetchTemplates();
        } catch (err: any) {
            console.error("Error deleting template", err);
            toast.error(err.message || "Failed to delete template");
        }
    };

    const handleCreateVersion = () => {
        if (!selectedTemplate) return;

        toast.success(`New version created for "${selectedTemplate.name}"`);
        setShowVersionDialog(false);
        setSelectedTemplate(null);
    };

    const getBadgeVariant = (level: string) => {
        switch (level) {
            case "Beginner":
                return "default";
            case "Intermediate":
                return "secondary";
            case "Advanced":
                return "destructive";
            default:
                return "outline";
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onBack}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">
                            {mode === "select" ? "Select Template" : "Class Templates"}
                        </h1>
                        <p className="text-muted-foreground">
                            {mode === "select"
                                ? "Choose a template to create your class"
                                : "Manage your class templates and versions"}
                        </p>
                    </div>
                </div>

                {mode === "manage" && (
                    <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Template
                    </Button>
                )}
            </div>

            {/* Search and Filters */}
            <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Search templates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                >
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((category) => (
                            <SelectItem
                                key={category}
                                value={category}
                            >
                                {category === "all" ? "All Categories" : category}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                </Button>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                    <Card
                        key={template.id}
                        className="overflow-hidden hover:shadow-md transition-shadow"
                    >
                        <div className="aspect-video bg-muted relative">
                            <ImageWithFallback
                                src={template.thumbnail}
                                alt={template.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 flex space-x-1">
                                <Badge variant={getBadgeVariant(template.level)}>
                                    {template.level}
                                </Badge>
                                {template.isPublic && <Badge variant="outline">Public</Badge>}
                            </div>
                        </div>

                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="text-lg">{template.name}</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {template.category}
                                    </p>
                                </div>
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
                                        {mode === "select" ? (
                                            <>
                                                <DropdownMenuItem
                                                    onClick={() => handleSelectTemplate(template)}
                                                >
                                                    <FileText className="w-4 h-4 mr-2" />
                                                    Use Template
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    Preview
                                                </DropdownMenuItem>
                                            </>
                                        ) : (
                                            <>
                                                <DropdownMenuItem>
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit Template
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleDuplicateTemplate(template)
                                                    }
                                                >
                                                    <Copy className="w-4 h-4 mr-2" />
                                                    Duplicate
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setSelectedTemplate(template);
                                                        setShowVersionDialog(true);
                                                    }}
                                                >
                                                    <History className="w-4 h-4 mr-2" />
                                                    Manage Versions
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() =>
                                                        handleDeleteTemplate(
                                                            template.id,
                                                            template.name
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                {template.description}
                            </p>

                            <div className="flex flex-wrap gap-1 mb-4">
                                {template.tags.slice(0, 3).map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant="secondary"
                                        className="text-xs"
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                                {template.tags.length > 3 && (
                                    <Badge
                                        variant="outline"
                                        className="text-xs"
                                    >
                                        +{template.tags.length - 3}
                                    </Badge>
                                )}
                            </div>

                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center space-x-4">
                                    <span className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {template.duration}
                                    </span>
                                    <span className="flex items-center">
                                        <Users className="w-4 h-4 mr-1" />
                                        {template.capacity}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span>v{template.version}</span>
                                    <span>•</span>
                                    <span>{template.usageCount} uses</span>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Avatar className="w-6 h-6">
                                        <AvatarFallback className="text-xs">
                                            {template.createdBy
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm text-muted-foreground">
                                        {template.createdBy}
                                    </span>
                                </div>

                                {mode === "select" && (
                                    <Button
                                        size="sm"
                                        onClick={() => handleSelectTemplate(template)}
                                    >
                                        Use Template
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading templates...</span>
                </div>
            ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No templates found</h3>
                    <p className="text-muted-foreground">
                        {searchTerm || selectedCategory !== "all"
                            ? "Try adjusting your search or filter criteria"
                            : "Create your first template to get started"}
                    </p>
                </div>
            ) : null}

            {/* Create Template Dialog */}
            <Dialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create New Template</DialogTitle>
                        <DialogDescription>
                            Create a reusable template for your classes
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="template-name">Template Name *</Label>
                                <Input
                                    id="template-name"
                                    placeholder="e.g., Beginner Wheel Throwing"
                                    value={newTemplateName}
                                    onChange={(e) => setNewTemplateName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="template-category">Category *</Label>
                                <Select
                                    value={newTemplateCategory}
                                    onValueChange={setNewTemplateCategory}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories
                                            .filter((c) => c !== "all")
                                            .map((category) => (
                                                <SelectItem
                                                    key={category}
                                                    value={category}
                                                >
                                                    {category}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="template-description">Description</Label>
                            <Textarea
                                id="template-description"
                                placeholder="Describe what this template is for..."
                                value={newTemplateDescription}
                                onChange={(e) => setNewTemplateDescription(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="template-tags">Tags (comma-separated)</Label>
                            <Input
                                id="template-tags"
                                placeholder="e.g., beginner, wheel, pottery"
                                value={newTemplateTags}
                                onChange={(e) => setNewTemplateTags(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowCreateDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleCreateTemplate}>Create Template</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Version Management Dialog */}
            <Dialog
                open={showVersionDialog}
                onOpenChange={setShowVersionDialog}
            >
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Manage Template Versions</DialogTitle>
                        <DialogDescription>
                            {selectedTemplate
                                ? `Managing versions for "${selectedTemplate.name}"`
                                : ""}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedTemplate && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-medium">
                                        Current Version: {selectedTemplate.version}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Last modified: {selectedTemplate.lastModified}
                                    </p>
                                </div>
                                <Button size="sm">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create New Version
                                </Button>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                {selectedTemplate.versions.map((version) => (
                                    <div
                                        key={version.id}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <Badge
                                                    variant={
                                                        version.isActive ? "default" : "outline"
                                                    }
                                                >
                                                    v{version.version}
                                                </Badge>
                                                {version.isActive && (
                                                    <Badge variant="secondary">Active</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm mt-1">{version.description}</p>
                                            <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                                                <span>By {version.createdBy}</span>
                                                <span>•</span>
                                                <span>{version.createdDate}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            {!version.isActive && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    Activate
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
