import { useState, useEffect } from "react";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { PhotoManager } from "./PhotoManager";
import type { PotteryEntry, PhotoEntry } from "@/app/context/AppContext";

interface EntryFormProps {
    entry?: PotteryEntry | null;
    onSave: (entry: Omit<PotteryEntry, "id">) => void;
    onCancel: () => void;
}

const potteryTypes = [
    "Bowl",
    "Mug",
    "Vase",
    "Plate",
    "Cup",
    "Pitcher",
    "Sculpture",
    "Tile",
    "Pot",
    "Other"
];

const clayTypes = [
    "Earthenware",
    "Stoneware",
    "Porcelain",
    "Raku",
    "Paper Clay",
    "Terracotta",
    "Other"
];

const techniques = [
    "Wheel throwing",
    "Hand building",
    "Coil technique",
    "Slab construction",
    "Pinch technique",
    "Press molding",
    "Slip casting",
    "Trimming",
    "Carving",
    "Texturing"
];

const firingTypes = [
    "Bisque",
    "Glaze",
    "Raku",
    "Pit firing",
    "Saggar",
    "Wood firing",
    "Gas reduction",
    "Electric"
];

const glazeOptions = [
    "Celadon",
    "Iron Red",
    "Copper Green",
    "Cobalt Blue",
    "Matte White",
    "Glossy Clear",
    "Tenmoku",
    "Shino",
    "Ash Glaze",
    "Crystalline",
    "Metallic",
    "Underglaze"
];

export function EntryForm({ entry, onSave, onCancel }: EntryFormProps) {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split("T")[0],
        title: "",
        potteryType: "",
        clayType: "",
        techniques: [] as string[],
        firingType: "",
        firingTemp: "",
        glazes: [] as string[],
        status: "planning" as const,
        notes: "",
        photos: [] as PhotoEntry[],
        challenges: "",
        nextSteps: ""
    });

    const [newTechnique, setNewTechnique] = useState("");
    const [newGlaze, setNewGlaze] = useState("");

    useEffect(() => {
        if (entry) {
            setFormData({
                date: entry.date,
                title: entry.title,
                potteryType: entry.potteryType,
                clayType: entry.clayType,
                techniques: entry.techniques,
                firingType: entry.firingType,
                firingTemp: entry.firingTemp,
                glazes: entry.glazes,
                status: entry.status,
                notes: entry.notes,
                photos: entry.photos,
                challenges: entry.challenges,
                nextSteps: entry.nextSteps
            });
        }
    }, [entry]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const addTechnique = (technique: string) => {
        if (technique && !formData.techniques.includes(technique)) {
            setFormData((prev) => ({
                ...prev,
                techniques: [...prev.techniques, technique]
            }));
        }
        setNewTechnique("");
    };

    const removeTechnique = (technique: string) => {
        setFormData((prev) => ({
            ...prev,
            techniques: prev.techniques.filter((t) => t !== technique)
        }));
    };

    const addGlaze = (glaze: string) => {
        if (glaze && !formData.glazes.includes(glaze)) {
            setFormData((prev) => ({
                ...prev,
                glazes: [...prev.glazes, glaze]
            }));
        }
        setNewGlaze("");
    };

    const removeGlaze = (glaze: string) => {
        setFormData((prev) => ({
            ...prev,
            glazes: prev.glazes.filter((g) => g !== glaze)
        }));
    };

    const handlePhotosChange = (photos: PhotoEntry[]) => {
        setFormData((prev) => ({ ...prev, photos }));
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-8">
                <Button
                    variant="ghost"
                    onClick={onCancel}
                    className="p-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <h1>{entry ? "Edit Entry" : "New Pottery Entry"}</h1>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, date: e.target.value }))
                                    }
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value: any) =>
                                        setFormData((prev) => ({ ...prev, status: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="planning">Planning</SelectItem>
                                        <SelectItem value="in-progress">In Progress</SelectItem>
                                        <SelectItem value="fired">Fired</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="title">Project Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                                }
                                placeholder="e.g., Ceramic Bowl Set, Experimental Vase..."
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="potteryType">Pottery Type</Label>
                                <Select
                                    value={formData.potteryType}
                                    onValueChange={(value) =>
                                        setFormData((prev) => ({ ...prev, potteryType: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
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
                                <Label htmlFor="clayType">Clay Type</Label>
                                <Select
                                    value={formData.clayType}
                                    onValueChange={(value) =>
                                        setFormData((prev) => ({ ...prev, clayType: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select clay type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clayTypes.map((clay) => (
                                            <SelectItem
                                                key={clay}
                                                value={clay}
                                            >
                                                {clay}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Techniques */}
                <Card>
                    <CardHeader>
                        <CardTitle>Techniques</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {formData.techniques.map((technique) => (
                                <Badge
                                    key={technique}
                                    variant="secondary"
                                    className="flex items-center space-x-2"
                                >
                                    <span>{technique}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeTechnique(technique)}
                                        className="ml-1 hover:bg-accent rounded-full p-0.5"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {techniques
                                .filter((t) => !formData.techniques.includes(t))
                                .map((technique) => (
                                    <Button
                                        key={technique}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addTechnique(technique)}
                                    >
                                        <Plus className="w-3 h-3 mr-1" />
                                        {technique}
                                    </Button>
                                ))}
                        </div>

                        <div className="flex space-x-2">
                            <Input
                                placeholder="Add custom technique..."
                                value={newTechnique}
                                onChange={(e) => setNewTechnique(e.target.value)}
                                onKeyPress={(e) =>
                                    e.key === "Enter" &&
                                    (e.preventDefault(), addTechnique(newTechnique))
                                }
                            />
                            <Button
                                type="button"
                                onClick={() => addTechnique(newTechnique)}
                            >
                                Add
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Firing & Glazes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Firing & Glazes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="firingType">Firing Type</Label>
                                <Select
                                    value={formData.firingType}
                                    onValueChange={(value) =>
                                        setFormData((prev) => ({ ...prev, firingType: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select firing type" />
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
                                <Label htmlFor="firingTemp">Firing Temperature</Label>
                                <Input
                                    id="firingTemp"
                                    value={formData.firingTemp}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            firingTemp: e.target.value
                                        }))
                                    }
                                    placeholder="e.g., 1000°C, Cone 04"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Glazes Used</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.glazes.map((glaze) => (
                                    <Badge
                                        key={glaze}
                                        variant="secondary"
                                        className="flex items-center space-x-2"
                                    >
                                        <span>{glaze}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeGlaze(glaze)}
                                            className="ml-1 hover:bg-accent rounded-full p-0.5"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>

                            <div className="flex flex-wrap gap-2 mt-2">
                                {glazeOptions
                                    .filter((g) => !formData.glazes.includes(g))
                                    .map((glaze) => (
                                        <Button
                                            key={glaze}
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addGlaze(glaze)}
                                        >
                                            <Plus className="w-3 h-3 mr-1" />
                                            {glaze}
                                        </Button>
                                    ))}
                            </div>

                            <div className="flex space-x-2 mt-2">
                                <Input
                                    placeholder="Add custom glaze..."
                                    value={newGlaze}
                                    onChange={(e) => setNewGlaze(e.target.value)}
                                    onKeyPress={(e) =>
                                        e.key === "Enter" &&
                                        (e.preventDefault(), addGlaze(newGlaze))
                                    }
                                />
                                <Button
                                    type="button"
                                    onClick={() => addGlaze(newGlaze)}
                                >
                                    Add
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Photos & Sketches */}
                <PhotoManager
                    photos={formData.photos}
                    onPhotosChange={handlePhotosChange}
                />

                {/* Notes & Reflection */}
                <Card>
                    <CardHeader>
                        <CardTitle>Notes & Reflection</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="notes">Process Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                                }
                                placeholder="Describe your process, observations, and thoughts..."
                                rows={4}
                            />
                        </div>

                        <div>
                            <Label htmlFor="challenges">Challenges Encountered</Label>
                            <Textarea
                                id="challenges"
                                value={formData.challenges}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, challenges: e.target.value }))
                                }
                                placeholder="What difficulties did you face? How did you overcome them?"
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label htmlFor="nextSteps">Next Steps</Label>
                            <Textarea
                                id="nextSteps"
                                value={formData.nextSteps}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, nextSteps: e.target.value }))
                                }
                                placeholder="What needs to be done next? Future improvements?"
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button type="submit">{entry ? "Update Entry" : "Save Entry"}</Button>
                </div>
            </form>
        </div>
    );
}
