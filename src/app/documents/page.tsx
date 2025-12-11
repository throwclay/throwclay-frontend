"use client";
import { useState } from "react";
import {
    FileText,
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Users,
    Book,
    Shield,
    Lightbulb,
    Video,
    Image as ImageIcon,
    Type,
    Sparkles,
    Save,
    X,
    Send,
    MoreVertical,
    Download,
    Copy,
    Clock,
    CheckCircle,
    Link,
    RefreshCw,
    ExternalLink as ExternalLinkIcon,
    Tag,
    Upload,
    GripVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { DocumentContentBlock } from "@/components/DocumentContentBlock";

interface Document {
    id: string;
    title: string;
    category: string; // Now allows custom categories
    audience: string[]; // Now allows custom roles
    status: "draft" | "published";
    content: ContentBlock[];
    author: string;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    googleDocsUrl?: string;
    lastSyncedAt?: string;
    syncEnabled?: boolean;
}

interface ContentBlock {
    id: string;
    type: "text" | "image" | "video" | "heading";
    content: string;
    metadata?: {
        url?: string;
        caption?: string;
        level?: number;
    };
}

export default function StudioDocuments() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showGoogleDocsDialog, setShowGoogleDocsDialog] = useState(false);
    const [showCategoryDialog, setShowCategoryDialog] = useState(false);
    const [editingDocument, setEditingDocument] = useState<Document | null>(null);
    const [showAIAssistant, setShowAIAssistant] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("");
    const [aiSuggestion, setAiSuggestion] = useState("");
    const [googleDocsUrl, setGoogleDocsUrl] = useState("");
    const [newCategory, setNewCategory] = useState("");

    // Available membership types and staff roles (from member & staff management)
    const membershipTypes = [
        { id: "basic", label: "Basic Members" },
        { id: "premium", label: "Premium Members" },
        { id: "unlimited", label: "Unlimited Members" },
        { id: "all-members", label: "All Members" }
    ];

    const staffRoles = [
        { id: "instructor", label: "Instructors" },
        { id: "manager", label: "Managers" },
        { id: "studio-assistant", label: "Studio Assistants" },
        { id: "all-staff", label: "All Staff" }
    ];

    // Preset and custom categories
    const [customCategories, setCustomCategories] = useState<string[]>([]);

    const presetCategories = [
        { value: "privacy", label: "Privacy Policy" },
        { value: "policy", label: "Studio Policy" },
        { value: "best-practices", label: "Best Practices" },
        { value: "instructional", label: "Instructional Material" },
        { value: "safety", label: "Safety Guidelines" }
    ];

    const allCategories = [
        ...presetCategories,
        ...customCategories.map((cat) => ({
            value: cat.toLowerCase().replace(/\s+/g, "-"),
            label: cat
        }))
    ];

    // Mock documents data
    const [documents, setDocuments] = useState<Document[]>([
        {
            id: "1",
            title: "Studio Safety Guidelines",
            category: "safety",
            audience: ["all-members", "all-staff"],
            status: "published",
            author: "Sarah Johnson",
            createdAt: "2024-11-01",
            updatedAt: "2024-11-10",
            publishedAt: "2024-11-05",
            content: [
                {
                    id: "b1",
                    type: "heading",
                    content: "General Safety Rules",
                    metadata: { level: 1 }
                },
                {
                    id: "b2",
                    type: "text",
                    content:
                        "Always wear appropriate protective equipment when working with clay and glazes. This includes aprons, closed-toe shoes, and eye protection when mixing glazes."
                },
                {
                    id: "b3",
                    type: "heading",
                    content: "Kiln Safety",
                    metadata: { level: 2 }
                },
                {
                    id: "b4",
                    type: "text",
                    content:
                        "Never open a kiln until it has cooled below 200°F. Hot kilns can cause severe burns and damage pottery."
                }
            ]
        },
        {
            id: "2",
            title: "Privacy Policy",
            category: "privacy",
            audience: ["all-members"],
            status: "published",
            author: "Emily Rodriguez",
            createdAt: "2024-10-15",
            updatedAt: "2024-10-15",
            publishedAt: "2024-10-20",
            googleDocsUrl: "https://docs.google.com/document/d/example123",
            lastSyncedAt: "2024-10-20",
            syncEnabled: true,
            content: [
                {
                    id: "b1",
                    type: "heading",
                    content: "Information We Collect",
                    metadata: { level: 1 }
                },
                {
                    id: "b2",
                    type: "text",
                    content:
                        "We collect personal information necessary for membership management, including name, contact details, and payment information."
                }
            ]
        },
        {
            id: "3",
            title: "Wheel Throwing Best Practices",
            category: "best-practices",
            audience: ["premium", "unlimited", "instructor"],
            status: "published",
            author: "Mike Chen",
            createdAt: "2024-11-08",
            updatedAt: "2024-11-12",
            publishedAt: "2024-11-12",
            content: [
                {
                    id: "b1",
                    type: "heading",
                    content: "Centering Techniques",
                    metadata: { level: 1 }
                },
                {
                    id: "b2",
                    type: "text",
                    content:
                        "Proper centering is the foundation of successful wheel throwing. Keep your elbows braced and use your whole body, not just your arms."
                }
            ]
        },
        {
            id: "4",
            title: "New Member Onboarding",
            category: "instructional",
            audience: ["manager", "studio-assistant"],
            status: "draft",
            author: "Sarah Johnson",
            createdAt: "2024-11-13",
            updatedAt: "2024-11-13",
            content: [
                {
                    id: "b1",
                    type: "heading",
                    content: "Day 1 Checklist",
                    metadata: { level: 1 }
                },
                {
                    id: "b2",
                    type: "text",
                    content:
                        "Welcome new members and provide studio tour. Assign shelf number and locker if applicable."
                }
            ]
        }
    ]);

    const [newDocument, setNewDocument] = useState<Partial<Document>>({
        title: "",
        category: "policy",
        audience: [],
        status: "draft",
        content: [{ id: "b1", type: "text", content: "" }]
    });

    const handleCreateDocument = () => {
        const doc: Document = {
            id: `doc-${Date.now()}`,
            title: newDocument.title || "Untitled Document",
            category: newDocument.category || "policy",
            audience: newDocument.audience || [],
            status: "draft",
            content: newDocument.content || [{ id: "b1", type: "text", content: "" }],
            author: "Current User",
            createdAt: new Date().toISOString().split("T")[0],
            updatedAt: new Date().toISOString().split("T")[0]
        };

        setDocuments([...documents, doc]);
        setShowCreateDialog(false);
        setEditingDocument(doc);
        setNewDocument({
            title: "",
            category: "policy",
            audience: [],
            status: "draft",
            content: [{ id: "b1", type: "text", content: "" }]
        });
    };

    const handleGoogleDocsImport = () => {
        // Simulate Google Docs import
        const doc: Document = {
            id: `doc-${Date.now()}`,
            title: "Imported from Google Docs",
            category: "policy",
            audience: ["all-members"],
            status: "draft",
            googleDocsUrl: googleDocsUrl,
            lastSyncedAt: new Date().toISOString().split("T")[0],
            syncEnabled: true,
            content: [
                {
                    id: "b1",
                    type: "heading",
                    content: "Imported Content",
                    metadata: { level: 1 }
                },
                {
                    id: "b2",
                    type: "text",
                    content:
                        "This document was imported from Google Docs. Content will sync automatically when changes are made in the source document."
                }
            ],
            author: "Current User",
            createdAt: new Date().toISOString().split("T")[0],
            updatedAt: new Date().toISOString().split("T")[0]
        };

        setDocuments([...documents, doc]);
        setShowGoogleDocsDialog(false);
        setGoogleDocsUrl("");
        setEditingDocument(doc);
    };

    const handleSyncGoogleDocs = (docId: string) => {
        // Simulate syncing from Google Docs
        setDocuments(
            documents.map((doc) =>
                doc.id === docId && doc.googleDocsUrl
                    ? {
                          ...doc,
                          lastSyncedAt: new Date().toISOString().split("T")[0],
                          updatedAt: new Date().toISOString().split("T")[0]
                      }
                    : doc
            )
        );
        alert("Document synced from Google Docs");
    };

    const handleAddCategory = () => {
        if (newCategory && !customCategories.includes(newCategory)) {
            setCustomCategories([...customCategories, newCategory]);
            setNewCategory("");
            setShowCategoryDialog(false);
        }
    };

    const handleAIAssist = () => {
        // Simulate AI response
        const suggestions = [
            `Based on your prompt, here's a suggested outline:\n\n1. Introduction and Purpose\n2. Scope and Applicability\n3. Detailed Guidelines\n4. Responsibilities\n5. Enforcement and Compliance\n\nWould you like me to expand any section?`,
            `Here's a draft based on your request:\n\n**Safety First**\nAll studio members must prioritize safety when working with equipment and materials. This includes:\n- Wearing appropriate protective gear\n- Following equipment operating procedures\n- Reporting hazards immediately\n- Maintaining a clean workspace`,
            `I can help you create this document. Consider including:\n- Clear objectives\n- Step-by-step instructions\n- Visual aids or diagrams\n- Common mistakes to avoid\n- Additional resources`
        ];

        setAiSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)]);
    };

    const handlePublishDocument = (docId: string) => {
        setDocuments(
            documents.map((doc) =>
                doc.id === docId
                    ? {
                          ...doc,
                          status: "published" as const,
                          publishedAt: new Date().toISOString().split("T")[0]
                      }
                    : doc
            )
        );
    };

    const handleUnpublishDocument = (docId: string) => {
        setDocuments(
            documents.map((doc) => (doc.id === docId ? { ...doc, status: "draft" as const } : doc))
        );
    };

    const handleDeleteDocument = (docId: string) => {
        if (confirm("Are you sure you want to delete this document?")) {
            setDocuments(documents.filter((doc) => doc.id !== docId));
        }
    };

    const addContentBlock = (type: ContentBlock["type"]) => {
        if (editingDocument) {
            const newBlock: ContentBlock = {
                id: `b-${Date.now()}`,
                type,
                content: "",
                metadata: type === "heading" ? { level: 2 } : {}
            };

            setEditingDocument({
                ...editingDocument,
                content: [...editingDocument.content, newBlock]
            });
        }
    };

    const updateContentBlock = (blockId: string, content: string) => {
        if (editingDocument) {
            setEditingDocument({
                ...editingDocument,
                content: editingDocument.content.map((block) =>
                    block.id === blockId ? { ...block, content } : block
                )
            });
        }
    };

    const updateBlockMetadata = (blockId: string, metadata: any) => {
        if (editingDocument) {
            setEditingDocument({
                ...editingDocument,
                content: editingDocument.content.map((block) =>
                    block.id === blockId
                        ? { ...block, metadata: { ...block.metadata, ...metadata } }
                        : block
                )
            });
        }
    };

    const removeContentBlock = (blockId: string) => {
        if (editingDocument) {
            setEditingDocument({
                ...editingDocument,
                content: editingDocument.content.filter((block) => block.id !== blockId)
            });
        }
    };

    const saveDocument = () => {
        if (editingDocument) {
            setDocuments(
                documents.map((doc) =>
                    doc.id === editingDocument.id
                        ? {
                              ...editingDocument,
                              updatedAt: new Date().toISOString().split("T")[0]
                          }
                        : doc
                )
            );
            setEditingDocument(null);
        }
    };

    const filteredDocuments = documents.filter((doc) => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === "all" || doc.category === filterCategory;
        const matchesStatus = filterStatus === "all" || doc.status === filterStatus;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "privacy":
                return <Shield className="w-4 h-4" />;
            case "policy":
                return <FileText className="w-4 h-4" />;
            case "best-practices":
                return <Lightbulb className="w-4 h-4" />;
            case "instructional":
                return <Book className="w-4 h-4" />;
            case "safety":
                return <Shield className="w-4 h-4 text-red-500" />;
            default:
                return <Tag className="w-4 h-4" />;
        }
    };

    const getCategoryLabel = (category: string) => {
        const found = allCategories.find((c) => c.value === category);
        return found
            ? found.label
            : category
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ");
    };

    const getAudienceLabel = (audienceId: string) => {
        const memberType = membershipTypes.find((m) => m.id === audienceId);
        if (memberType) return memberType.label;

        const staffRole = staffRoles.find((s) => s.id === audienceId);
        if (staffRole) return staffRole.label;

        return audienceId;
    };

    const toggleAudience = (audienceId: string) => {
        if (editingDocument) {
            const current = editingDocument.audience;
            setEditingDocument({
                ...editingDocument,
                audience: current.includes(audienceId)
                    ? current.filter((a) => a !== audienceId)
                    : [...current, audienceId]
            });
        }
    };

    return (
        <div className="container max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1>Studio Documents</h1>
                    <p className="text-muted-foreground">
                        Manage policies, guidelines, and instructional materials for your studio
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* Google Docs Import */}
                    <Dialog
                        open={showGoogleDocsDialog}
                        onOpenChange={setShowGoogleDocsDialog}
                    >
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Link className="w-4 h-4 mr-2" />
                                Import from Google Docs
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Import from Google Docs</DialogTitle>
                                <DialogDescription>
                                    Paste a link to your Google Doc to import and sync content
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label>Google Docs URL</Label>
                                    <Input
                                        placeholder="https://docs.google.com/document/d/..."
                                        value={googleDocsUrl}
                                        onChange={(e) => setGoogleDocsUrl(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Make sure the document is set to "Anyone with the link can
                                        view"
                                    </p>
                                </div>
                                <Alert>
                                    <ExternalLinkIcon className="w-4 h-4" />
                                    <AlertDescription>
                                        Imported documents will sync automatically when changes are
                                        made in Google Docs
                                    </AlertDescription>
                                </Alert>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowGoogleDocsDialog(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleGoogleDocsImport}
                                        disabled={!googleDocsUrl}
                                    >
                                        <Link className="w-4 h-4 mr-2" />
                                        Import & Sync
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Create New Document */}
                    <Dialog
                        open={showCreateDialog}
                        onOpenChange={setShowCreateDialog}
                    >
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                New Document
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Create New Document</DialogTitle>
                                <DialogDescription>
                                    Set up the basic information for your document
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label>Document Title</Label>
                                    <Input
                                        placeholder="e.g., Studio Safety Guidelines"
                                        value={newDocument.title}
                                        onChange={(e) =>
                                            setNewDocument({
                                                ...newDocument,
                                                title: e.target.value
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <Label>Category</Label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowCategoryDialog(true)}
                                        >
                                            <Plus className="w-3 h-3 mr-1" />
                                            Add Custom
                                        </Button>
                                    </div>
                                    <Select
                                        value={newDocument.category}
                                        onValueChange={(value) =>
                                            setNewDocument({ ...newDocument, category: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allCategories.map((cat) => (
                                                <SelectItem
                                                    key={cat.value}
                                                    value={cat.value}
                                                >
                                                    {cat.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="mb-2 block">Target Audience</Label>
                                    <ScrollArea className="h-[200px] border rounded-md p-3">
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm font-medium mb-2">
                                                    Membership Types
                                                </p>
                                                <div className="space-y-2">
                                                    {membershipTypes.map((type) => (
                                                        <div
                                                            key={type.id}
                                                            className="flex items-center space-x-2"
                                                        >
                                                            <Checkbox
                                                                checked={newDocument.audience?.includes(
                                                                    type.id
                                                                )}
                                                                onCheckedChange={(checked) => {
                                                                    const current =
                                                                        newDocument.audience || [];
                                                                    setNewDocument({
                                                                        ...newDocument,
                                                                        audience: checked
                                                                            ? [...current, type.id]
                                                                            : current.filter(
                                                                                  (a) =>
                                                                                      a !== type.id
                                                                              )
                                                                    });
                                                                }}
                                                            />
                                                            <label className="text-sm">
                                                                {type.label}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium mb-2">
                                                    Staff Roles
                                                </p>
                                                <div className="space-y-2">
                                                    {staffRoles.map((role) => (
                                                        <div
                                                            key={role.id}
                                                            className="flex items-center space-x-2"
                                                        >
                                                            <Checkbox
                                                                checked={newDocument.audience?.includes(
                                                                    role.id
                                                                )}
                                                                onCheckedChange={(checked) => {
                                                                    const current =
                                                                        newDocument.audience || [];
                                                                    setNewDocument({
                                                                        ...newDocument,
                                                                        audience: checked
                                                                            ? [...current, role.id]
                                                                            : current.filter(
                                                                                  (a) =>
                                                                                      a !== role.id
                                                                              )
                                                                    });
                                                                }}
                                                            />
                                                            <label className="text-sm">
                                                                {role.label}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </ScrollArea>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowCreateDialog(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleCreateDocument}
                                        disabled={!newDocument.title}
                                    >
                                        Create & Edit
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Custom Category Dialog */}
                    <Dialog
                        open={showCategoryDialog}
                        onOpenChange={setShowCategoryDialog}
                    >
                        <DialogContent className="max-w-sm">
                            <DialogHeader>
                                <DialogTitle>Add Custom Category</DialogTitle>
                                <DialogDescription>
                                    Create a new document category for your studio
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label>Category Name</Label>
                                    <Input
                                        placeholder="e.g., Equipment Manuals"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowCategoryDialog(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleAddCategory}
                                        disabled={!newCategory}
                                    >
                                        Add Category
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            {/* Filters and Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search documents..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <Select
                            value={filterCategory}
                            onValueChange={setFilterCategory}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {allCategories.map((cat) => (
                                    <SelectItem
                                        key={cat.value}
                                        value={cat.value}
                                    >
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={filterStatus}
                            onValueChange={setFilterStatus}
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
            {/* Document List */}
            {!editingDocument ? (
                <div className="grid gap-4">
                    {filteredDocuments.map((doc) => (
                        <Card key={doc.id}>
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                {getCategoryIcon(doc.category)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="text-lg">{doc.title}</h3>
                                                    <Badge
                                                        variant={
                                                            doc.status === "published"
                                                                ? "default"
                                                                : "secondary"
                                                        }
                                                    >
                                                        {doc.status === "published" ? (
                                                            <>
                                                                <CheckCircle className="w-3 h-3 mr-1" />{" "}
                                                                Published
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Clock className="w-3 h-3 mr-1" />{" "}
                                                                Draft
                                                            </>
                                                        )}
                                                    </Badge>
                                                    {doc.googleDocsUrl && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            <Link className="w-3 h-3 mr-1" />
                                                            Synced{" "}
                                                            {doc.lastSyncedAt &&
                                                                `${new Date(
                                                                    doc.lastSyncedAt
                                                                ).toLocaleDateString()}`}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                                    <span>{getCategoryLabel(doc.category)}</span>
                                                    <span>•</span>
                                                    <span>
                                                        Updated{" "}
                                                        {new Date(
                                                            doc.updatedAt
                                                        ).toLocaleDateString()}
                                                    </span>
                                                    <span>•</span>
                                                    <span>By {doc.author}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-3 flex-wrap">
                                            {doc.audience.map((aud) => (
                                                <Badge
                                                    key={aud}
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    <Users className="w-3 h-3 mr-1" />
                                                    {getAudienceLabel(aud)}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {doc.googleDocsUrl && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSyncGoogleDocs(doc.id)}
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setEditingDocument(doc)}
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                        {doc.status === "draft" ? (
                                            <Button
                                                size="sm"
                                                onClick={() => handlePublishDocument(doc.id)}
                                            >
                                                <Send className="w-4 h-4 mr-2" />
                                                Publish
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleUnpublishDocument(doc.id)}
                                            >
                                                <EyeOff className="w-4 h-4 mr-2" />
                                                Unpublish
                                            </Button>
                                        )}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    Preview
                                                </DropdownMenuItem>
                                                {doc.googleDocsUrl && (
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            window.open(doc.googleDocsUrl, "_blank")
                                                        }
                                                    >
                                                        <ExternalLinkIcon className="w-4 h-4 mr-2" />
                                                        Open in Google Docs
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem>
                                                    <Copy className="w-4 h-4 mr-2" />
                                                    Duplicate
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Export PDF
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => handleDeleteDocument(doc.id)}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                /* Document Editor */
                (<Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <Input
                                    value={editingDocument.title}
                                    onChange={(e) =>
                                        setEditingDocument({
                                            ...editingDocument,
                                            title: e.target.value
                                        })
                                    }
                                    className="text-2xl border-0 px-0 focus-visible:ring-0"
                                    placeholder="Document Title"
                                />
                                <div className="flex items-center gap-3 mt-2">
                                    <Select
                                        value={editingDocument.category}
                                        onValueChange={(value) =>
                                            setEditingDocument({
                                                ...editingDocument,
                                                category: value
                                            })
                                        }
                                    >
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allCategories.map((cat) => (
                                                <SelectItem
                                                    key={cat.value}
                                                    value={cat.value}
                                                >
                                                    {cat.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Badge
                                        variant={
                                            editingDocument.status === "published"
                                                ? "default"
                                                : "secondary"
                                        }
                                    >
                                        {editingDocument.status}
                                    </Badge>
                                    {editingDocument.googleDocsUrl && (
                                        <Badge variant="outline">
                                            <Link className="w-3 h-3 mr-1" />
                                            Google Docs Sync
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {editingDocument.googleDocsUrl && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSyncGoogleDocs(editingDocument.id)}
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Sync Now
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowAIAssistant(!showAIAssistant);
                                    }}
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    AI Assist
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setEditingDocument(null)}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Close
                                </Button>
                                <Button onClick={saveDocument}>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-6">
                            {/* Main Editor */}
                            <div className="col-span-2 space-y-4">
                                {/* Audience Selection */}
                                <div className="p-4 bg-muted rounded-lg">
                                    <Label className="mb-3 block">Target Audience</Label>
                                    <Tabs
                                        defaultValue="members"
                                        className="w-full"
                                    >
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="members">
                                                Membership Types
                                            </TabsTrigger>
                                            <TabsTrigger value="staff">Staff Roles</TabsTrigger>
                                        </TabsList>
                                        <TabsContent
                                            value="members"
                                            className="space-y-2 mt-3"
                                        >
                                            {membershipTypes.map((type) => (
                                                <div
                                                    key={type.id}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <Checkbox
                                                        checked={editingDocument.audience.includes(
                                                            type.id
                                                        )}
                                                        onCheckedChange={() =>
                                                            toggleAudience(type.id)
                                                        }
                                                    />
                                                    <label className="text-sm">{type.label}</label>
                                                </div>
                                            ))}
                                        </TabsContent>
                                        <TabsContent
                                            value="staff"
                                            className="space-y-2 mt-3"
                                        >
                                            {staffRoles.map((role) => (
                                                <div
                                                    key={role.id}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <Checkbox
                                                        checked={editingDocument.audience.includes(
                                                            role.id
                                                        )}
                                                        onCheckedChange={() =>
                                                            toggleAudience(role.id)
                                                        }
                                                    />
                                                    <label className="text-sm">{role.label}</label>
                                                </div>
                                            ))}
                                        </TabsContent>
                                    </Tabs>
                                </div>

                                {/* Content Blocks */}
                                <ScrollArea className="h-[600px] pr-4">
                                    <div className="space-y-3">
                                        {editingDocument.content.map((block) => (
                                            <DocumentContentBlock
                                                key={block.id}
                                                block={block}
                                                onUpdate={updateContentBlock}
                                                onUpdateMetadata={updateBlockMetadata}
                                                onRemove={removeContentBlock}
                                            />
                                        ))}

                                        {/* Add Content Buttons */}
                                        <div className="flex flex-wrap gap-2 pt-4 border-t mt-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addContentBlock("heading")}
                                            >
                                                <Type className="w-4 h-4 mr-2" />
                                                Add Heading
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addContentBlock("text")}
                                            >
                                                <FileText className="w-4 h-4 mr-2" />
                                                Add Text
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addContentBlock("image")}
                                            >
                                                <ImageIcon className="w-4 h-4 mr-2" />
                                                Add Image
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addContentBlock("video")}
                                            >
                                                <Video className="w-4 h-4 mr-2" />
                                                Add Video
                                            </Button>
                                        </div>
                                    </div>
                                </ScrollArea>
                            </div>

                            {/* AI Assistant Sidebar */}
                            <div className="space-y-4">
                                {showAIAssistant && (
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Sparkles className="w-4 h-4" />
                                                AI Writing Assistant
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <Textarea
                                                placeholder="Describe what you want to write... (e.g., 'Write a safety policy about kiln usage')"
                                                value={aiPrompt}
                                                onChange={(e) => setAiPrompt(e.target.value)}
                                                rows={3}
                                            />
                                            <Button
                                                className="w-full"
                                                onClick={handleAIAssist}
                                            >
                                                <Sparkles className="w-4 h-4 mr-2" />
                                                Generate
                                            </Button>
                                            {aiSuggestion && (
                                                <div className="p-3 bg-muted rounded-lg space-y-2">
                                                    <p className="text-sm whitespace-pre-line">
                                                        {aiSuggestion}
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="flex-1"
                                                        >
                                                            <Copy className="w-3 h-3 mr-1" />
                                                            Copy
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            className="flex-1"
                                                        >
                                                            Insert
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Google Docs Info */}
                                {editingDocument.googleDocsUrl && (
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Link className="w-4 h-4" />
                                                Google Docs Sync
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-sm">
                                            <p className="text-muted-foreground">
                                                This document syncs with Google Docs
                                            </p>
                                            {editingDocument.lastSyncedAt && (
                                                <p className="text-xs text-muted-foreground">
                                                    Last synced:{" "}
                                                    {new Date(
                                                        editingDocument.lastSyncedAt
                                                    ).toLocaleString()}
                                                </p>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                onClick={() =>
                                                    window.open(
                                                        editingDocument.googleDocsUrl,
                                                        "_blank"
                                                    )
                                                }
                                            >
                                                <ExternalLinkIcon className="w-3 h-3 mr-2" />
                                                Open in Google Docs
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Quick Tips */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Quick Tips</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                                        <p>• Use headings to organize your content</p>
                                        <p>• Add images for visual clarity</p>
                                        <p>• Embed videos for demonstrations</p>
                                        <p>• Save as draft to preview before publishing</p>
                                        <p>• Target specific member types and staff roles</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </CardContent>
                </Card>)
            )}
        </div>
    );
}
