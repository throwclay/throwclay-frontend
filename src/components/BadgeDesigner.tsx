import { useState, useRef } from "react";
import {
    Palette,
    Upload,
    Download,
    RotateCcw,
    Eye,
    Save,
    Sparkles,
    Circle,
    Square,
    Shield,
    Hexagon,
    Star,
    Diamond
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import type { BadgeDesign } from "@/app/context/AppContext";
import { toast } from "sonner";

interface BadgeDesignerProps {
    initialDesign?: BadgeDesign;
    onSave: (design: BadgeDesign) => void;
    onCancel: () => void;
    previewMode?: boolean;
}

const PREDEFINED_ICONS = [
    { id: "pottery", name: "Pottery Wheel", icon: "🏺" },
    { id: "ceramic", name: "Ceramic Bowl", icon: "🥣" },
    { id: "fire", name: "Fire", icon: "🔥" },
    { id: "medal", name: "Medal", icon: "🏅" },
    { id: "trophy", name: "Trophy", icon: "🏆" },
    { id: "star", name: "Star", icon: "⭐" },
    { id: "gem", name: "Gem", icon: "💎" },
    { id: "crown", name: "Crown", icon: "👑" },
    { id: "art", name: "Artist Palette", icon: "🎨" },
    { id: "graduate", name: "Graduate", icon: "🎓" },
    { id: "target", name: "Target", icon: "🎯" },
    { id: "rocket", name: "Rocket", icon: "🚀" },
    { id: "lightning", name: "Lightning", icon: "⚡" },
    { id: "heart", name: "Heart", icon: "❤️" },
    { id: "thumbs-up", name: "Thumbs Up", icon: "👍" },
    { id: "checkmark", name: "Check Mark", icon: "✅" }
];

const SHAPE_ICONS = {
    circle: Circle,
    square: Square,
    shield: Shield,
    hexagon: Hexagon,
    star: Star,
    diamond: Diamond
};

const COLOR_PRESETS = [
    { name: "Clay Brown", colors: ["#8B4513", "#D2B48C"] },
    { name: "Ocean Blue", colors: ["#1E40AF", "#3B82F6"] },
    { name: "Forest Green", colors: ["#166534", "#22C55E"] },
    { name: "Sunset Orange", colors: ["#EA580C", "#FB923C"] },
    { name: "Royal Purple", colors: ["#7C3AED", "#A855F7"] },
    { name: "Rose Gold", colors: ["#BE185D", "#F472B6"] },
    { name: "Charcoal", colors: ["#374151", "#6B7280"] },
    { name: "Mint", colors: ["#059669", "#34D399"] }
];

export function BadgeDesigner({
    initialDesign,
    onSave,
    onCancel,
    previewMode = false
}: BadgeDesignerProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [design, setDesign] = useState<BadgeDesign>(
        initialDesign || {
            id: "",
            name: "New Badge",
            shape: "circle",
            backgroundColor: "#3B82F6",
            borderColor: "#1D4ED8",
            borderWidth: 3,
            iconType: "emoji",
            icon: "🏺",
            textColor: "#FFFFFF",
            fontSize: "medium",
            gradientEnabled: false,
            shadowEnabled: true,
            shadowColor: "#000000",
            shadowBlur: 10,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    );

    const [showPreview, setShowPreview] = useState(false);

    const updateDesign = (updates: Partial<BadgeDesign>) => {
        setDesign((prev) => ({
            ...prev,
            ...updates,
            updatedAt: new Date().toISOString()
        }));
    };

    const handleColorPreset = (preset: { name: string; colors: string[] }) => {
        updateDesign({
            backgroundColor: preset.colors[0],
            borderColor: preset.colors[1],
            gradientEnabled: true,
            gradientColors: preset.colors,
            gradientDirection: "diagonal"
        });
        toast.success(`Applied ${preset.name} color scheme`);
    };

    const handleIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                // 5MB limit
                toast.error("File size must be less than 5MB");
                return;
            }

            if (!file.type.startsWith("image/")) {
                toast.error("Please upload an image file");
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target?.result as string;
                updateDesign({
                    iconType: "custom",
                    customIconUrl: imageUrl
                });
                toast.success("Custom icon uploaded successfully");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (!design.name.trim()) {
            toast.error("Please enter a badge name");
            return;
        }

        const finalDesign = {
            ...design,
            id: design.id || `badge_${Date.now()}`,
            name: design.name.trim()
        };

        onSave(finalDesign);
        toast.success("Badge design saved successfully");
    };

    const resetDesign = () => {
        setDesign({
            id: "",
            name: "New Badge",
            shape: "circle",
            backgroundColor: "#3B82F6",
            borderColor: "#1D4ED8",
            borderWidth: 3,
            iconType: "emoji",
            icon: "🏺",
            textColor: "#FFFFFF",
            fontSize: "medium",
            gradientEnabled: false,
            shadowEnabled: true,
            shadowColor: "#000000",
            shadowBlur: 10,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        toast.success("Design reset to defaults");
    };

    const exportDesign = () => {
        const designData = JSON.stringify(design, null, 2);
        const blob = new Blob([designData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${design.name.replace(/\s+/g, "_")}_badge_design.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Badge design exported");
    };

    const renderBadgePreview = (size: "small" | "medium" | "large" = "medium") => {
        const sizeMap = {
            small: { width: 60, height: 60, iconSize: 24, fontSize: 12 },
            medium: { width: 120, height: 120, iconSize: 48, fontSize: 16 },
            large: { width: 200, height: 200, iconSize: 80, fontSize: 24 }
        };

        const dimensions = sizeMap[size];
        const ShapeIcon = SHAPE_ICONS[design.shape];

        const gradientStyle =
            design.gradientEnabled && design.gradientColors
                ? {
                      background: `linear-gradient(${
                          design.gradientDirection === "vertical"
                              ? "180deg"
                              : design.gradientDirection === "horizontal"
                                ? "90deg"
                                : "45deg"
                      }, ${design.gradientColors.join(", ")})`
                  }
                : {
                      backgroundColor: design.backgroundColor
                  };

        const shadowStyle = design.shadowEnabled
            ? {
                  boxShadow: `0 ${design.shadowBlur || 10}px ${(design.shadowBlur || 10) * 2}px ${design.shadowColor || "#000000"}40`
              }
            : {};

        return (
            <div className="flex items-center justify-center p-4">
                <div
                    className="relative flex items-center justify-center border-solid"
                    style={{
                        width: dimensions.width,
                        height: dimensions.height,
                        borderWidth: design.borderWidth,
                        borderColor: design.borderColor,
                        borderRadius:
                            design.shape === "circle"
                                ? "50%"
                                : design.shape === "square"
                                  ? "8px"
                                  : design.shape === "shield"
                                    ? "8px 8px 50% 50%"
                                    : design.shape === "hexagon"
                                      ? "0"
                                      : design.shape === "star"
                                        ? "0"
                                        : "12px",
                        clipPath:
                            design.shape === "hexagon"
                                ? "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)"
                                : design.shape === "star"
                                  ? "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
                                  : design.shape === "diamond"
                                    ? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"
                                    : "none",
                        ...gradientStyle,
                        ...shadowStyle
                    }}
                >
                    {/* Icon */}
                    <div className="flex flex-col items-center justify-center">
                        {design.iconType === "emoji" && design.icon && (
                            <span style={{ fontSize: dimensions.iconSize, lineHeight: 1 }}>
                                {design.icon}
                            </span>
                        )}
                        {design.iconType === "custom" && design.customIconUrl && (
                            <img
                                src={design.customIconUrl}
                                alt="Custom badge icon"
                                style={{
                                    width: dimensions.iconSize,
                                    height: dimensions.iconSize,
                                    objectFit: "contain"
                                }}
                            />
                        )}
                        {design.iconType === "predefined" && design.icon && (
                            <span style={{ fontSize: dimensions.iconSize, lineHeight: 1 }}>
                                {PREDEFINED_ICONS.find((i) => i.id === design.icon)?.icon || "🏺"}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (previewMode) {
        return (
            <div className="space-y-4">
                <div className="text-center">
                    <h3 className="font-semibold">{design.name}</h3>
                </div>
                {renderBadgePreview("large")}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">Badge Designer</h2>
                    <p className="text-muted-foreground">
                        Create a custom badge for your class completion
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowPreview(true)}
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                    </Button>
                    <Button
                        variant="outline"
                        onClick={exportDesign}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button
                        variant="outline"
                        onClick={resetDesign}
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Design Controls */}
                <div className="space-y-6">
                    {/* Basic Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="badge-name">Badge Name</Label>
                                <Input
                                    id="badge-name"
                                    value={design.name}
                                    onChange={(e) => updateDesign({ name: e.target.value })}
                                    placeholder="Enter badge name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Shape</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {Object.entries(SHAPE_ICONS).map(([shape, Icon]) => (
                                        <Button
                                            key={shape}
                                            variant={design.shape === shape ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => updateDesign({ shape: shape as any })}
                                            className="flex flex-col items-center p-3 h-auto"
                                        >
                                            <Icon className="w-6 h-6 mb-1" />
                                            <span className="text-xs capitalize">{shape}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Colors */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Colors</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Color Presets */}
                            <div className="space-y-2">
                                <Label>Quick Color Schemes</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {COLOR_PRESETS.map((preset) => (
                                        <Button
                                            key={preset.name}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleColorPreset(preset)}
                                            className="flex items-center space-x-2 h-auto p-3"
                                        >
                                            <div className="flex space-x-1">
                                                {preset.colors.map((color, index) => (
                                                    <div
                                                        key={index}
                                                        className="w-4 h-4 rounded border"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-xs">{preset.name}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            {/* Gradient Toggle */}
                            <div className="flex items-center justify-between">
                                <Label htmlFor="gradient-enabled">Enable Gradient</Label>
                                <Switch
                                    id="gradient-enabled"
                                    checked={design.gradientEnabled}
                                    onCheckedChange={(checked) =>
                                        updateDesign({ gradientEnabled: checked })
                                    }
                                />
                            </div>

                            {design.gradientEnabled ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="gradient-color-1">Color 1</Label>
                                            <div className="flex items-center space-x-2">
                                                <Input
                                                    id="gradient-color-1"
                                                    type="color"
                                                    value={
                                                        design.gradientColors?.[0] ||
                                                        design.backgroundColor
                                                    }
                                                    onChange={(e) =>
                                                        updateDesign({
                                                            gradientColors: [
                                                                e.target.value,
                                                                design.gradientColors?.[1] ||
                                                                    design.borderColor
                                                            ]
                                                        })
                                                    }
                                                    className="w-12 h-8"
                                                />
                                                <Input
                                                    value={
                                                        design.gradientColors?.[0] ||
                                                        design.backgroundColor
                                                    }
                                                    onChange={(e) =>
                                                        updateDesign({
                                                            gradientColors: [
                                                                e.target.value,
                                                                design.gradientColors?.[1] ||
                                                                    design.borderColor
                                                            ]
                                                        })
                                                    }
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="gradient-color-2">Color 2</Label>
                                            <div className="flex items-center space-x-2">
                                                <Input
                                                    id="gradient-color-2"
                                                    type="color"
                                                    value={
                                                        design.gradientColors?.[1] ||
                                                        design.borderColor
                                                    }
                                                    onChange={(e) =>
                                                        updateDesign({
                                                            gradientColors: [
                                                                design.gradientColors?.[0] ||
                                                                    design.backgroundColor,
                                                                e.target.value
                                                            ]
                                                        })
                                                    }
                                                    className="w-12 h-8"
                                                />
                                                <Input
                                                    value={
                                                        design.gradientColors?.[1] ||
                                                        design.borderColor
                                                    }
                                                    onChange={(e) =>
                                                        updateDesign({
                                                            gradientColors: [
                                                                design.gradientColors?.[0] ||
                                                                    design.backgroundColor,
                                                                e.target.value
                                                            ]
                                                        })
                                                    }
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Gradient Direction</Label>
                                        <Select
                                            value={design.gradientDirection}
                                            onValueChange={(value: any) =>
                                                updateDesign({ gradientDirection: value })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="vertical">Vertical</SelectItem>
                                                <SelectItem value="horizontal">
                                                    Horizontal
                                                </SelectItem>
                                                <SelectItem value="diagonal">Diagonal</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="background-color">Background Color</Label>
                                    <div className="flex items-center space-x-2">
                                        <Input
                                            id="background-color"
                                            type="color"
                                            value={design.backgroundColor}
                                            onChange={(e) =>
                                                updateDesign({ backgroundColor: e.target.value })
                                            }
                                            className="w-12 h-8"
                                        />
                                        <Input
                                            value={design.backgroundColor}
                                            onChange={(e) =>
                                                updateDesign({ backgroundColor: e.target.value })
                                            }
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="border-color">Border Color</Label>
                                <div className="flex items-center space-x-2">
                                    <Input
                                        id="border-color"
                                        type="color"
                                        value={design.borderColor}
                                        onChange={(e) =>
                                            updateDesign({ borderColor: e.target.value })
                                        }
                                        className="w-12 h-8"
                                    />
                                    <Input
                                        value={design.borderColor}
                                        onChange={(e) =>
                                            updateDesign({ borderColor: e.target.value })
                                        }
                                        className="flex-1"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Border Width: {design.borderWidth}px</Label>
                                <Slider
                                    value={[design.borderWidth]}
                                    onValueChange={([value]) =>
                                        updateDesign({ borderWidth: value })
                                    }
                                    max={10}
                                    min={0}
                                    step={1}
                                    className="w-full"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Icon Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Icon</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Tabs
                                value={design.iconType}
                                onValueChange={(value: any) => updateDesign({ iconType: value })}
                            >
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="emoji">Emoji</TabsTrigger>
                                    <TabsTrigger value="predefined">Predefined</TabsTrigger>
                                    <TabsTrigger value="custom">Custom</TabsTrigger>
                                </TabsList>

                                <TabsContent
                                    value="emoji"
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="emoji-input">Emoji</Label>
                                        <Input
                                            id="emoji-input"
                                            value={design.icon || ""}
                                            onChange={(e) => updateDesign({ icon: e.target.value })}
                                            placeholder="Enter emoji (e.g., 🏺)"
                                            maxLength={2}
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent
                                    value="predefined"
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-4 gap-2">
                                        {PREDEFINED_ICONS.map((iconItem) => (
                                            <Button
                                                key={iconItem.id}
                                                variant={
                                                    design.icon === iconItem.id
                                                        ? "default"
                                                        : "outline"
                                                }
                                                size="sm"
                                                onClick={() => updateDesign({ icon: iconItem.id })}
                                                className="flex flex-col items-center p-3 h-auto"
                                                title={iconItem.name}
                                            >
                                                <span className="text-2xl mb-1">
                                                    {iconItem.icon}
                                                </span>
                                                <span className="text-xs text-center leading-tight">
                                                    {iconItem.name}
                                                </span>
                                            </Button>
                                        ))}
                                    </div>
                                </TabsContent>

                                <TabsContent
                                    value="custom"
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <Label>Upload Custom Icon</Label>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex-1"
                                            >
                                                <Upload className="w-4 h-4 mr-2" />
                                                Choose Image
                                            </Button>
                                            <Input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleIconUpload}
                                                className="hidden"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Recommended: Square image, max 5MB
                                        </p>
                                        {design.customIconUrl && (
                                            <div className="mt-2">
                                                <img
                                                    src={design.customIconUrl}
                                                    alt="Custom icon preview"
                                                    className="w-16 h-16 object-contain border rounded"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* Effects */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Effects</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="shadow-enabled">Drop Shadow</Label>
                                <Switch
                                    id="shadow-enabled"
                                    checked={design.shadowEnabled}
                                    onCheckedChange={(checked) =>
                                        updateDesign({ shadowEnabled: checked })
                                    }
                                />
                            </div>

                            {design.shadowEnabled && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="shadow-color">Shadow Color</Label>
                                        <div className="flex items-center space-x-2">
                                            <Input
                                                id="shadow-color"
                                                type="color"
                                                value={design.shadowColor || "#000000"}
                                                onChange={(e) =>
                                                    updateDesign({ shadowColor: e.target.value })
                                                }
                                                className="w-12 h-8"
                                            />
                                            <Input
                                                value={design.shadowColor || "#000000"}
                                                onChange={(e) =>
                                                    updateDesign({ shadowColor: e.target.value })
                                                }
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Shadow Blur: {design.shadowBlur || 10}px</Label>
                                        <Slider
                                            value={[design.shadowBlur || 10]}
                                            onValueChange={([value]) =>
                                                updateDesign({ shadowBlur: value })
                                            }
                                            max={30}
                                            min={0}
                                            step={1}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Preview */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Sparkles className="w-5 h-5" />
                                <span>Live Preview</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {renderBadgePreview("large")}

                            <div className="mt-6 space-y-4">
                                <div className="flex justify-center space-x-4">
                                    <div className="text-center">
                                        <div className="text-sm text-muted-foreground mb-2">
                                            Small
                                        </div>
                                        {renderBadgePreview("small")}
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm text-muted-foreground mb-2">
                                            Medium
                                        </div>
                                        {renderBadgePreview("medium")}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Design Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Design Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Shape:</span>
                                <Badge
                                    variant="secondary"
                                    className="capitalize"
                                >
                                    {design.shape}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Icon Type:</span>
                                <Badge
                                    variant="secondary"
                                    className="capitalize"
                                >
                                    {design.iconType}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Gradient:</span>
                                <Badge variant={design.gradientEnabled ? "default" : "outline"}>
                                    {design.gradientEnabled ? "Enabled" : "Disabled"}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Shadow:</span>
                                <Badge variant={design.shadowEnabled ? "default" : "outline"}>
                                    {design.shadowEnabled ? "Enabled" : "Disabled"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Badge Design
                </Button>
            </div>

            {/* Preview Dialog */}
            <Dialog
                open={showPreview}
                onOpenChange={setShowPreview}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Badge Preview</DialogTitle>
                        <DialogDescription>
                            How your badge will appear to students
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="font-semibold text-lg mb-4">{design.name}</h3>
                            {renderBadgePreview("large")}
                        </div>

                        <div className="space-y-4">
                            <div className="text-center">
                                <h4 className="font-medium mb-2">Different Sizes</h4>
                                <div className="flex justify-center space-x-6">
                                    <div className="text-center">
                                        <div className="text-xs text-muted-foreground mb-2">
                                            Small
                                        </div>
                                        {renderBadgePreview("small")}
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-muted-foreground mb-2">
                                            Medium
                                        </div>
                                        {renderBadgePreview("medium")}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
