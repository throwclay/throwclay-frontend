"use client";
import { useState } from "react";
import {
    GripVertical,
    X,
    Type,
    ImageIcon,
    Video,
    Link,
    Upload,
    Eye,
    Edit as EditIcon
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

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

interface DocumentContentBlockProps {
    block: ContentBlock;
    onUpdate: (id: string, content: string) => void;
    onUpdateMetadata: (id: string, metadata: any) => void;
    onRemove: (id: string) => void;
}

export function DocumentContentBlock({
    block,
    onUpdate,
    onUpdateMetadata,
    onRemove
}: DocumentContentBlockProps) {
    const [uploadMode, setUploadMode] = useState<"link" | "upload">("link");

    const handleFileUpload = (file: File, type: "image" | "video") => {
        // Simulate file upload - in a real app, this would upload to a server
        const reader = new FileReader();
        reader.onloadend = () => {
            // For demo, use a placeholder URL
            const placeholderUrl =
                type === "image"
                    ? "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800"
                    : "https://example.com/uploaded-video.mp4";
            onUpdateMetadata(block.id, { url: placeholderUrl });
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="group relative">
            {/* Drag Handle & Remove Button */}
            <div className="absolute -left-8 top-3 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 cursor-move"
                >
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => onRemove(block.id)}
                >
                    <X className="w-4 h-4 text-destructive" />
                </Button>
            </div>

            {/* Heading Block */}
            {block.type === "heading" && (
                <div className="flex items-center gap-2 p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
                    <Type className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <Select
                        value={block.metadata?.level?.toString() || "2"}
                        onValueChange={(value) =>
                            onUpdateMetadata(block.id, { level: parseInt(value) })
                        }
                    >
                        <SelectTrigger className="w-20 h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">H1</SelectItem>
                            <SelectItem value="2">H2</SelectItem>
                            <SelectItem value="3">H3</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input
                        value={block.content}
                        onChange={(e) => onUpdate(block.id, e.target.value)}
                        placeholder="Heading text..."
                        className="border-0 bg-transparent focus-visible:ring-0"
                    />
                </div>
            )}

            {/* Text Block */}
            {block.type === "text" && (
                <div className="p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
                    <Textarea
                        value={block.content}
                        onChange={(e) => onUpdate(block.id, e.target.value)}
                        placeholder="Start typing..."
                        rows={3}
                        className="border-0 bg-transparent resize-none focus-visible:ring-0 p-0"
                    />
                </div>
            )}

            {/* Image Block */}
            {block.type === "image" && (
                <div className="p-4 rounded-lg border bg-background space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Image</span>
                        </div>
                    </div>

                    <Tabs
                        value={uploadMode}
                        onValueChange={(v) => setUploadMode(v as "link" | "upload")}
                        className="w-full"
                    >
                        <TabsList className="w-full">
                            <TabsTrigger
                                value="link"
                                className="flex-1"
                            >
                                <Link className="w-3 h-3 mr-2" />
                                Link
                            </TabsTrigger>
                            <TabsTrigger
                                value="upload"
                                className="flex-1"
                            >
                                <Upload className="w-3 h-3 mr-2" />
                                Upload
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="link"
                            className="space-y-2"
                        >
                            <Input
                                value={block.metadata?.url || ""}
                                onChange={(e) =>
                                    onUpdateMetadata(block.id, { url: e.target.value })
                                }
                                placeholder="Paste image URL..."
                            />
                        </TabsContent>

                        <TabsContent
                            value="upload"
                            className="space-y-2"
                        >
                            <label className="block">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(file, "image");
                                    }}
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    asChild
                                >
                                    <span>
                                        <Upload className="w-3 h-3 mr-2" />
                                        Choose Image File
                                    </span>
                                </Button>
                            </label>
                            <p className="text-xs text-muted-foreground">
                                Max file size: 5MB • JPG, PNG, GIF
                            </p>
                        </TabsContent>
                    </Tabs>

                    <Input
                        value={block.metadata?.caption || ""}
                        onChange={(e) => onUpdateMetadata(block.id, { caption: e.target.value })}
                        placeholder="Caption (optional)"
                    />

                    {block.metadata?.url && (
                        <div className="relative group/img">
                            <img
                                src={block.metadata.url}
                                alt={block.metadata.caption || "Document image"}
                                className="rounded-lg w-full object-cover max-h-80"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                >
                                    <Eye className="w-3 h-3 mr-1" />
                                    Preview
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => onUpdateMetadata(block.id, { url: "" })}
                                >
                                    <EditIcon className="w-3 h-3 mr-1" />
                                    Replace
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Video Block */}
            {block.type === "video" && (
                <div className="p-4 rounded-lg border bg-background space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Video className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Video</span>
                        </div>
                    </div>

                    <Tabs
                        value={uploadMode}
                        onValueChange={(v) => setUploadMode(v as "link" | "upload")}
                        className="w-full"
                    >
                        <TabsList className="w-full">
                            <TabsTrigger
                                value="link"
                                className="flex-1"
                            >
                                <Link className="w-3 h-3 mr-2" />
                                Embed
                            </TabsTrigger>
                            <TabsTrigger
                                value="upload"
                                className="flex-1"
                            >
                                <Upload className="w-3 h-3 mr-2" />
                                Upload
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="link"
                            className="space-y-2"
                        >
                            <Input
                                value={block.metadata?.url || ""}
                                onChange={(e) =>
                                    onUpdateMetadata(block.id, { url: e.target.value })
                                }
                                placeholder="YouTube, Vimeo, or video URL..."
                            />
                            <p className="text-xs text-muted-foreground">
                                Paste link from YouTube, Vimeo, or direct video URL
                            </p>
                        </TabsContent>

                        <TabsContent
                            value="upload"
                            className="space-y-2"
                        >
                            <label className="block">
                                <input
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(file, "video");
                                    }}
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    asChild
                                >
                                    <span>
                                        <Upload className="w-3 h-3 mr-2" />
                                        Choose Video File
                                    </span>
                                </Button>
                            </label>
                            <p className="text-xs text-muted-foreground">
                                Max file size: 100MB • MP4, MOV, AVI
                            </p>
                        </TabsContent>
                    </Tabs>

                    <Input
                        value={block.metadata?.caption || ""}
                        onChange={(e) => onUpdateMetadata(block.id, { caption: e.target.value })}
                        placeholder="Caption (optional)"
                    />

                    {block.metadata?.url && (
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative group/video">
                            <Video className="w-12 h-12 text-muted-foreground" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/video:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                >
                                    <Eye className="w-3 h-3 mr-1" />
                                    Preview
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => onUpdateMetadata(block.id, { url: "" })}
                                >
                                    <EditIcon className="w-3 h-3 mr-1" />
                                    Replace
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
