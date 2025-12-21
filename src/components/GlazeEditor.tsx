"use client";
import { useState, useEffect } from "react";
import {
    ArrowLeft,
    Save,
    X,
    Plus,
    Upload,
    Image as ImageIcon,
    Palette,
    Beaker,
    Thermometer,
    Calendar,
    User
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useAppContext } from "@/app/context/AppContext";

interface GlazeEntry {
    id: string;
    name: string;
    type: "store-bought" | "experiment";
    status: "available" | "experiment" | "not-available";
    experimenterName?: string;
    experimentedBy?: string;
    testDate?: string;
    firedDate?: string;
    imageUrl?: string;
    quantity: number;
    quantityUnit: string;
    cone: string[];
    atmosphere: string;
    notes: string;
    tags: string[];
    ingredients?: { ingredient: string; quantity: number; unit: string }[];
    manufacturer?: string;
    productCode?: string;
    createdAt: string;
    updatedAt: string;
}

interface GlazeEditorProps {
    glazeId?: string;
    onBack: () => void;
    onSave: (glaze: GlazeEntry) => void;
}

// Default form state to prevent undefined values
const getDefaultGlazeForm = (): Partial<GlazeEntry> => ({
    name: "",
    type: "experiment",
    status: "available",
    experimenterName: "",
    experimentedBy: "",
    testDate: "",
    firedDate: "",
    imageUrl: "",
    quantity: 0,
    quantityUnit: "grams",
    cone: [],
    atmosphere: "oxidation",
    notes: "",
    tags: [],
    ingredients: [],
    manufacturer: "",
    productCode: ""
});

export function GlazeEditor({ glazeId, onBack, onSave }: GlazeEditorProps) {
    const { currentUser } = useAppContext();
    const [activeTab, setActiveTab] = useState("basic");
    const [isSaving, setIsSaving] = useState(false);

    // Form state with proper defaults
    const [glazeForm, setGlazeForm] = useState<Partial<GlazeEntry>>(getDefaultGlazeForm);

    // Common ingredients
    const commonIngredients = [
        "Potash Feldspar",
        "Soda Feldspar",
        "Nepheline Syenite",
        "Silica",
        "Whiting",
        "Kaolin",
        "Ball Clay",
        "Dolomite",
        "Barium Carbonate",
        "Zinc Oxide",
        "Iron Oxide",
        "Cobalt Carbonate",
        "Copper Carbonate",
        "Chrome Oxide",
        "Tin Oxide",
        "Titanium Dioxide",
        "Rutile",
        "Manganese Dioxide",
        "Red Iron Oxide",
        "Yellow Ochre",
        "Bentonite",
        "Gerstley Borate",
        "Lithium Carbonate",
        "Magnesium Carbonate",
        "Talc",
        "Bone Ash"
    ];

    // Cone options
    const coneOptions = [
        "022",
        "021",
        "020",
        "019",
        "018",
        "017",
        "016",
        "015",
        "014",
        "013",
        "012",
        "011",
        "010",
        "09",
        "08",
        "07",
        "06",
        "05",
        "04",
        "03",
        "02",
        "01",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14"
    ];

    // Custom tags
    const predefinedTags = [
        "matte",
        "glossy",
        "crystalline",
        "celadon",
        "shino",
        "tenmoku",
        "ash-glaze",
        "copper-red",
        "iron-red",
        "cobalt-blue",
        "chrome-green",
        "rutile-blue",
        "high-fire",
        "mid-fire",
        "low-fire",
        "food-safe",
        "decorative-only",
        "translucent",
        "opaque",
        "flowing",
        "stable",
        "experimental",
        "reliable",
        "commercial",
        "traditional",
        "modern",
        "functional",
        "artistic"
    ];

    // Load existing glaze data if editing
    useEffect(() => {
        if (glazeId) {
            // In a real app, this would fetch the glaze data from API
            console.log("Loading glaze data for ID:", glazeId);
            // Mock loading existing data
            setGlazeForm({
                id: glazeId,
                name: "Celadon Green",
                type: "experiment",
                status: "available",
                experimenterName: currentUser?.name || "",
                experimentedBy: currentUser?.id || "",
                testDate: "2025-06-01",
                firedDate: "2025-06-03",
                imageUrl: "",
                quantity: 500,
                quantityUnit: "grams",
                cone: ["9", "10"],
                atmosphere: "reduction",
                notes: "Beautiful jade green color in reduction. Flows nicely.",
                tags: ["celadon", "high-fire", "food-safe"],
                ingredients: [
                    { ingredient: "Potash Feldspar", quantity: 45, unit: "g" },
                    { ingredient: "Silica", quantity: 30, unit: "g" },
                    { ingredient: "Whiting", quantity: 15, unit: "g" },
                    { ingredient: "Kaolin", quantity: 8, unit: "g" },
                    { ingredient: "Iron Oxide", quantity: 2, unit: "g" }
                ],
                manufacturer: "",
                productCode: ""
            });
        } else {
            // Reset to defaults for new glaze
            setGlazeForm({
                ...getDefaultGlazeForm(),
                experimenterName: currentUser?.name || "",
                experimentedBy: currentUser?.id || ""
            });
        }
    }, [glazeId, currentUser]);

    const handleSave = async () => {
        setIsSaving(true);

        const glazeData: GlazeEntry = {
            id: glazeId || `glaze_${Date.now()}`,
            experimenterName: currentUser?.name || "",
            experimentedBy: currentUser?.id || "",
            createdAt: glazeId
                ? glazeForm.createdAt || new Date().toISOString()
                : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...glazeForm
        } as GlazeEntry;

        console.log("Saving glaze:", glazeData);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        onSave(glazeData);
        setIsSaving(false);
    };

    const handleAddIngredient = () => {
        setGlazeForm((prev) => ({
            ...prev,
            ingredients: [...(prev.ingredients || []), { ingredient: "", quantity: 0, unit: "g" }]
        }));
    };

    const handleUpdateIngredient = (index: number, field: string, value: any) => {
        setGlazeForm((prev) => ({
            ...prev,
            ingredients:
                prev.ingredients?.map((ing, i) =>
                    i === index ? { ...ing, [field]: value } : ing
                ) || []
        }));
    };

    const handleRemoveIngredient = (index: number) => {
        setGlazeForm((prev) => ({
            ...prev,
            ingredients: prev.ingredients?.filter((_, i) => i !== index) || []
        }));
    };

    const handleConeToggle = (cone: string) => {
        setGlazeForm((prev) => ({
            ...prev,
            cone: prev.cone?.includes(cone)
                ? prev.cone.filter((c) => c !== cone)
                : [...(prev.cone || []), cone]
        }));
    };

    const handleTagToggle = (tag: string) => {
        setGlazeForm((prev) => ({
            ...prev,
            tags: prev.tags?.includes(tag)
                ? prev.tags.filter((t) => t !== tag)
                : [...(prev.tags || []), tag]
        }));
    };

    const isFormValid = glazeForm.name && glazeForm.type && glazeForm.status;

    return (
        <div className="max-w-6xl mx-auto p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        onClick={onBack}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Glazes
                    </Button>
                    <div className="space-y-1">
                        <h1 className="flex items-center space-x-3 text-3xl font-semibold">
                            <Palette className="w-8 h-8 text-primary" />
                            <span>{glazeId ? "Edit Glaze" : "New Glaze"}</span>
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            {glazeId
                                ? "Update glaze details and recipe"
                                : "Create a new glaze experiment or add store-bought glaze"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        variant="outline"
                        onClick={onBack}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!isFormValid || isSaving}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? "Saving..." : "Save Glaze"}
                    </Button>
                </div>
            </div>

            {/* Main Form */}
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-8"
            >
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="recipe">Recipe & Ingredients</TabsTrigger>
                    <TabsTrigger value="testing">Testing & Results</TabsTrigger>
                    <TabsTrigger value="notes">Notes & Tags</TabsTrigger>
                </TabsList>

                {/* Basic Info Tab */}
                <TabsContent
                    value="basic"
                    className="space-y-8"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Glaze Name *</Label>
                                    <Input
                                        value={glazeForm.name || ""}
                                        onChange={(e) =>
                                            setGlazeForm((prev) => ({
                                                ...prev,
                                                name: e.target.value
                                            }))
                                        }
                                        placeholder="e.g., Celadon Green or Amaco Potter's Choice"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Type *</Label>
                                    <Select
                                        value={glazeForm.type || "experiment"}
                                        onValueChange={(value) =>
                                            setGlazeForm((prev) => ({
                                                ...prev,
                                                type: value as any
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="experiment">
                                                Experiment/Recipe
                                            </SelectItem>
                                            <SelectItem value="store-bought">
                                                Store Bought
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label>Status *</Label>
                                    <Select
                                        value={glazeForm.status || "available"}
                                        onValueChange={(value) =>
                                            setGlazeForm((prev) => ({
                                                ...prev,
                                                status: value as any
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="available">Available</SelectItem>
                                            <SelectItem value="experiment">Experiment</SelectItem>
                                            <SelectItem value="not-available">
                                                Not Available
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Quantity</Label>
                                    <Input
                                        type="number"
                                        value={glazeForm.quantity || 0}
                                        onChange={(e) =>
                                            setGlazeForm((prev) => ({
                                                ...prev,
                                                quantity: parseFloat(e.target.value) || 0
                                            }))
                                        }
                                        placeholder="500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Unit</Label>
                                    <Select
                                        value={glazeForm.quantityUnit || "grams"}
                                        onValueChange={(value) =>
                                            setGlazeForm((prev) => ({
                                                ...prev,
                                                quantityUnit: value
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="grams">Grams</SelectItem>
                                            <SelectItem value="ounces">Ounces</SelectItem>
                                            <SelectItem value="pint">Pint</SelectItem>
                                            <SelectItem value="quart">Quart</SelectItem>
                                            <SelectItem value="gallon">Gallon</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {glazeForm.type === "store-bought" && (
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Manufacturer</Label>
                                        <Input
                                            value={glazeForm.manufacturer || ""}
                                            onChange={(e) =>
                                                setGlazeForm((prev) => ({
                                                    ...prev,
                                                    manufacturer: e.target.value
                                                }))
                                            }
                                            placeholder="e.g., Amaco, Mayco, Spectrum"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Product Code</Label>
                                        <Input
                                            value={glazeForm.productCode || ""}
                                            onChange={(e) =>
                                                setGlazeForm((prev) => ({
                                                    ...prev,
                                                    productCode: e.target.value
                                                }))
                                            }
                                            placeholder="e.g., PC-10, SW-118"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Test Date</Label>
                                    <Input
                                        type="date"
                                        value={glazeForm.testDate || ""}
                                        onChange={(e) =>
                                            setGlazeForm((prev) => ({
                                                ...prev,
                                                testDate: e.target.value
                                            }))
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Fired Date</Label>
                                    <Input
                                        type="date"
                                        value={glazeForm.firedDate || ""}
                                        onChange={(e) =>
                                            setGlazeForm((prev) => ({
                                                ...prev,
                                                firedDate: e.target.value
                                            }))
                                        }
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Image URL</Label>
                                <div className="flex space-x-2">
                                    <Input
                                        value={glazeForm.imageUrl || ""}
                                        onChange={(e) =>
                                            setGlazeForm((prev) => ({
                                                ...prev,
                                                imageUrl: e.target.value
                                            }))
                                        }
                                        placeholder="https://example.com/glaze-photo.jpg"
                                    />
                                    <Button
                                        variant="outline"
                                        type="button"
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload
                                    </Button>
                                </div>
                                {glazeForm.imageUrl && (
                                    <div className="mt-3">
                                        <img
                                            src={glazeForm.imageUrl}
                                            alt="Glaze preview"
                                            className="w-32 h-32 object-cover rounded border"
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Recipe & Ingredients Tab */}
                <TabsContent
                    value="recipe"
                    className="space-y-8"
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Recipe & Ingredients</CardTitle>
                                <Button
                                    onClick={handleAddIngredient}
                                    disabled={glazeForm.type === "store-bought"}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Ingredient
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {glazeForm.type === "store-bought" ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Beaker className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p>Recipe details not available for store-bought glazes</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {glazeForm.ingredients && glazeForm.ingredients.length > 0 ? (
                                        glazeForm.ingredients.map((ingredient, index) => (
                                            <div
                                                key={index}
                                                className="grid grid-cols-5 gap-4 items-end p-4 border rounded-lg"
                                            >
                                                <div className="col-span-2 space-y-1">
                                                    <Label className="text-sm">Ingredient</Label>
                                                    <Select
                                                        value={ingredient.ingredient}
                                                        onValueChange={(value) =>
                                                            handleUpdateIngredient(
                                                                index,
                                                                "ingredient",
                                                                value
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select ingredient" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {commonIngredients.map((ing) => (
                                                                <SelectItem
                                                                    key={ing}
                                                                    value={ing}
                                                                >
                                                                    {ing}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-sm">Quantity</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        value={ingredient.quantity}
                                                        onChange={(e) =>
                                                            handleUpdateIngredient(
                                                                index,
                                                                "quantity",
                                                                parseFloat(e.target.value) || 0
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-sm">Unit</Label>
                                                    <Select
                                                        value={ingredient.unit}
                                                        onValueChange={(value) =>
                                                            handleUpdateIngredient(
                                                                index,
                                                                "unit",
                                                                value
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="g">Grams</SelectItem>
                                                            <SelectItem value="oz">
                                                                Ounces
                                                            </SelectItem>
                                                            <SelectItem value="lbs">
                                                                Pounds
                                                            </SelectItem>
                                                            <SelectItem value="%">
                                                                Percentage
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveIngredient(index)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-muted-foreground">
                                            <Beaker className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                            <p>No ingredients added yet</p>
                                            <p className="text-sm">
                                                Click "Add Ingredient" to start building your recipe
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Testing & Results Tab */}
                <TabsContent
                    value="testing"
                    className="space-y-8"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Testing & Firing Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label>Cone (Select multiple)</Label>
                                    <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                                        {coneOptions.map((cone) => (
                                            <div
                                                key={cone}
                                                className="flex items-center space-x-2"
                                            >
                                                <Checkbox
                                                    id={`cone-${cone}`}
                                                    checked={
                                                        glazeForm.cone?.includes(cone) || false
                                                    }
                                                    onCheckedChange={() => handleConeToggle(cone)}
                                                />
                                                <Label
                                                    htmlFor={`cone-${cone}`}
                                                    className="text-xs"
                                                >
                                                    {cone}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                    {glazeForm.cone && glazeForm.cone.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {glazeForm.cone.map((cone) => (
                                                <Badge
                                                    key={cone}
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    Cone {cone}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Kiln Atmosphere</Label>
                                    <Select
                                        value={glazeForm.atmosphere || "oxidation"}
                                        onValueChange={(value) =>
                                            setGlazeForm((prev) => ({ ...prev, atmosphere: value }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="oxidation">Oxidation</SelectItem>
                                            <SelectItem value="reduction">Reduction</SelectItem>
                                            <SelectItem value="neutral">Neutral</SelectItem>
                                            <SelectItem value="raku">Raku</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {glazeId && (
                                <div className="space-y-4">
                                    <Separator />
                                    <div>
                                        <Label className="text-lg">Test Results</Label>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Record your firing results and observations
                                        </p>
                                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                            <Thermometer className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>Test results tracking coming soon</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notes & Tags Tab */}
                <TabsContent
                    value="notes"
                    className="space-y-8"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes & Tags</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Notes</Label>
                                <Textarea
                                    value={glazeForm.notes || ""}
                                    onChange={(e) =>
                                        setGlazeForm((prev) => ({ ...prev, notes: e.target.value }))
                                    }
                                    placeholder="Test results, color description, application notes, firing observations..."
                                    rows={6}
                                />
                            </div>

                            <div className="space-y-3">
                                <Label>Tags</Label>
                                <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto border rounded-lg p-4">
                                    {predefinedTags.map((tag) => (
                                        <div
                                            key={tag}
                                            className="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                id={tag}
                                                checked={glazeForm.tags?.includes(tag) || false}
                                                onCheckedChange={() => handleTagToggle(tag)}
                                            />
                                            <Label
                                                htmlFor={tag}
                                                className="text-sm capitalize"
                                            >
                                                {tag.replace("-", " ")}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                {glazeForm.tags && glazeForm.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {glazeForm.tags.map((tag) => (
                                            <Badge
                                                key={tag}
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                {tag.replace("-", " ")}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {currentUser && (
                                <div className="pt-4 border-t">
                                    <div className="grid grid-cols-2 gap-6 text-sm text-muted-foreground">
                                        <div className="flex items-center space-x-2">
                                            <User className="w-4 h-4" />
                                            <span>Experimenter: {currentUser.name}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                {glazeId ? "Last updated: " : "Created: "}
                                                {new Date().toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
