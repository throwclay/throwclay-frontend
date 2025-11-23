import { useState } from "react";
import {
    Building2,
    MapPin,
    Clock,
    Users,
    Phone,
    Globe,
    Plus,
    Trash2,
    Edit2,
    Save,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useAppContext } from "@/app/context/AppContext";
import type { StudioLocation } from "@/app/context/AppContext";

interface StudioSettingsData {
    name: string;
    description: string;
    website: string;
    memberCapacity: number;
    usedCapacity: number;
    coneTypes: string[];
    clayTypes: string[];
    firingTypes: string[];
    kilns: {
        electric: number;
        gas: number;
    };
    glazesCount: number;
}

export function StudioSettings() {
    const context = useAppContext();
    const [isEditing, setIsEditing] = useState(false);
    const [editingLocation, setEditingLocation] = useState<string | null>(null);
    const [showAddLocation, setShowAddLocation] = useState(false);

    // Studio general settings state
    const [studioData, setStudioData] = useState<StudioSettingsData>({
        name: context.currentStudio?.name || "",
        description: context.currentStudio?.description || "",
        website: "",
        memberCapacity: 200,
        usedCapacity: 45,
        coneTypes: ["04", "05", "06", "10", "11"],
        clayTypes: ["Stoneware", "Porcelain", "Earthenware", "Raku Clay"],
        firingTypes: ["Electric Bisque", "Electric Glaze", "Gas Reduction", "Raku", "Wood Fire"],
        kilns: {
            electric: 3,
            gas: 2
        },
        glazesCount: context.currentStudio?.glazes?.length || 0
    });

    // New location form state
    const [newLocation, setNewLocation] = useState<Partial<StudioLocation>>({
        name: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        phone: "",
        capacity: 50,
        isActive: true
    });

    const [locationHours, setLocationHours] = useState({
        monday: { open: "09:00", close: "21:00", isOpen: true },
        tuesday: { open: "09:00", close: "21:00", isOpen: true },
        wednesday: { open: "09:00", close: "21:00", isOpen: true },
        thursday: { open: "09:00", close: "21:00", isOpen: true },
        friday: { open: "09:00", close: "22:00", isOpen: true },
        saturday: { open: "08:00", close: "22:00", isOpen: true },
        sunday: { open: "10:00", close: "18:00", isOpen: true }
    });

    const [memberHours, setMemberHours] = useState({
        monday: { open: "06:00", close: "23:00", isOpen: true },
        tuesday: { open: "06:00", close: "23:00", isOpen: true },
        wednesday: { open: "06:00", close: "23:00", isOpen: true },
        thursday: { open: "06:00", close: "23:00", isOpen: true },
        friday: { open: "06:00", close: "24:00", isOpen: true },
        saturday: { open: "06:00", close: "24:00", isOpen: true },
        sunday: { open: "08:00", close: "22:00", isOpen: true }
    });

    const handleSaveStudio = () => {
        // In a real app, this would save to backend
        console.log("Saving studio data:", studioData);
        setIsEditing(false);
    };

    const handleAddLocation = () => {
        // In a real app, this would save to backend
        console.log("Adding new location:", newLocation);
        setShowAddLocation(false);
        setNewLocation({
            name: "",
            address: "",
            city: "",
            state: "",
            zipCode: "",
            phone: "",
            capacity: 50,
            isActive: true
        });
    };

    const handleDeleteLocation = (locationId: string) => {
        // In a real app, this would delete from backend
        console.log("Deleting location:", locationId);
    };

    const addConeType = (cone: string) => {
        if (cone && !studioData.coneTypes.includes(cone)) {
            setStudioData((prev) => ({
                ...prev,
                coneTypes: [...prev.coneTypes, cone].sort((a, b) => {
                    const numA = parseInt(a);
                    const numB = parseInt(b);
                    return numA - numB;
                })
            }));
        }
    };

    const removeConeType = (cone: string) => {
        setStudioData((prev) => ({
            ...prev,
            coneTypes: prev.coneTypes.filter((c) => c !== cone)
        }));
    };

    const addClayType = (clay: string) => {
        if (clay && !studioData.clayTypes.includes(clay)) {
            setStudioData((prev) => ({
                ...prev,
                clayTypes: [...prev.clayTypes, clay]
            }));
        }
    };

    const removeClayType = (clay: string) => {
        setStudioData((prev) => ({
            ...prev,
            clayTypes: prev.clayTypes.filter((c) => c !== clay)
        }));
    };

    const addFiringType = (firing: string) => {
        if (firing && !studioData.firingTypes.includes(firing)) {
            setStudioData((prev) => ({
                ...prev,
                firingTypes: [...prev.firingTypes, firing]
            }));
        }
    };

    const removeFiringType = (firing: string) => {
        setStudioData((prev) => ({
            ...prev,
            firingTypes: prev.firingTypes.filter((f) => f !== firing)
        }));
    };

    const availabilityPercentage = (studioData.usedCapacity / studioData.memberCapacity) * 100;

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1>Studio Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your studio's general information and locations
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    {isEditing ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setIsEditing(false)}
                            >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                            <Button onClick={handleSaveStudio}>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Studio Info
                        </Button>
                    )}
                </div>
            </div>

            {/* General Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Building2 className="w-5 h-5" />
                        <span>General Information</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="studio-name">Studio Name</Label>
                            {isEditing ? (
                                <Input
                                    id="studio-name"
                                    value={studioData.name}
                                    onChange={(e) =>
                                        setStudioData((prev) => ({ ...prev, name: e.target.value }))
                                    }
                                    placeholder="Enter studio name"
                                />
                            ) : (
                                <p className="text-sm text-muted-foreground bg-accent/50 p-2 rounded">
                                    {studioData.name}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            {isEditing ? (
                                <Input
                                    id="website"
                                    value={studioData.website}
                                    onChange={(e) =>
                                        setStudioData((prev) => ({
                                            ...prev,
                                            website: e.target.value
                                        }))
                                    }
                                    placeholder="https://yourstudio.com"
                                />
                            ) : (
                                <p className="text-sm text-muted-foreground bg-accent/50 p-2 rounded">
                                    {studioData.website || "No website added"}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Studio Description</Label>
                        {isEditing ? (
                            <Textarea
                                id="description"
                                value={studioData.description}
                                onChange={(e) =>
                                    setStudioData((prev) => ({
                                        ...prev,
                                        description: e.target.value
                                    }))
                                }
                                placeholder="Describe your studio, mission, and what makes it special..."
                                rows={4}
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground bg-accent/50 p-3 rounded min-h-[100px]">
                                {studioData.description || "No description added"}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Space and Availability */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Users className="w-5 h-5" />
                        <span>Space &amp; Availability</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Member Capacity</p>
                            <p className="text-sm text-muted-foreground">
                                {studioData.usedCapacity} of {studioData.memberCapacity} member
                                profiles used
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold">
                                {studioData.memberCapacity - studioData.usedCapacity}
                            </p>
                            <p className="text-sm text-muted-foreground">Available</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Usage</span>
                            <span>{Math.round(availabilityPercentage)}%</span>
                        </div>
                        <Progress
                            value={availabilityPercentage}
                            className="h-2"
                        />
                    </div>

                    {isEditing && (
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div className="space-y-2">
                                <Label>Total Capacity</Label>
                                <Input
                                    type="number"
                                    value={studioData.memberCapacity}
                                    onChange={(e) =>
                                        setStudioData((prev) => ({
                                            ...prev,
                                            memberCapacity: parseInt(e.target.value) || 0
                                        }))
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Used Capacity</Label>
                                <Input
                                    type="number"
                                    value={studioData.usedCapacity}
                                    onChange={(e) =>
                                        setStudioData((prev) => ({
                                            ...prev,
                                            usedCapacity: parseInt(e.target.value) || 0
                                        }))
                                    }
                                    max={studioData.memberCapacity}
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Studio Specific Questions */}
            <Card>
                <CardHeader>
                    <CardTitle>Studio Pottery Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Cone Types */}
                    <div className="space-y-3">
                        <Label>Cone Types Available</Label>
                        <div className="flex flex-wrap gap-2">
                            {studioData.coneTypes.map((cone) => (
                                <Badge
                                    key={cone}
                                    variant="secondary"
                                    className="flex items-center space-x-1"
                                >
                                    <span>Cone {cone}</span>
                                    {isEditing && (
                                        <button
                                            onClick={() => removeConeType(cone)}
                                            className="ml-1 hover:text-destructive"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </Badge>
                            ))}
                        </div>
                        {isEditing && (
                            <div className="flex space-x-2">
                                <Select onValueChange={addConeType}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Add cone type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[
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
                                        ].map((cone) => (
                                            <SelectItem
                                                key={cone}
                                                value={cone}
                                            >
                                                Cone {cone}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* Clay Types */}
                    <div className="space-y-3">
                        <Label>Types of Clay</Label>
                        <div className="flex flex-wrap gap-2">
                            {studioData.clayTypes.map((clay) => (
                                <Badge
                                    key={clay}
                                    variant="secondary"
                                    className="flex items-center space-x-1"
                                >
                                    <span>{clay}</span>
                                    {isEditing && (
                                        <button
                                            onClick={() => removeClayType(clay)}
                                            className="ml-1 hover:text-destructive"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </Badge>
                            ))}
                        </div>
                        {isEditing && (
                            <div className="flex space-x-2">
                                <Select onValueChange={addClayType}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Add clay type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Stoneware">Stoneware</SelectItem>
                                        <SelectItem value="Porcelain">Porcelain</SelectItem>
                                        <SelectItem value="Earthenware">Earthenware</SelectItem>
                                        <SelectItem value="Raku Clay">Raku Clay</SelectItem>
                                        <SelectItem value="Paper Clay">Paper Clay</SelectItem>
                                        <SelectItem value="Sculpture Clay">
                                            Sculpture Clay
                                        </SelectItem>
                                        <SelectItem value="Terra Cotta">Terra Cotta</SelectItem>
                                        <SelectItem value="Fire Clay">Fire Clay</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* Firing Types */}
                    <div className="space-y-3">
                        <Label>Types of Firing</Label>
                        <div className="flex flex-wrap gap-2">
                            {studioData.firingTypes.map((firing) => (
                                <Badge
                                    key={firing}
                                    variant="secondary"
                                    className="flex items-center space-x-1"
                                >
                                    <span>{firing}</span>
                                    {isEditing && (
                                        <button
                                            onClick={() => removeFiringType(firing)}
                                            className="ml-1 hover:text-destructive"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </Badge>
                            ))}
                        </div>
                        {isEditing && (
                            <div className="flex space-x-2">
                                <Select onValueChange={addFiringType}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Add firing type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Electric Bisque">
                                            Electric Bisque
                                        </SelectItem>
                                        <SelectItem value="Electric Glaze">
                                            Electric Glaze
                                        </SelectItem>
                                        <SelectItem value="Gas Reduction">Gas Reduction</SelectItem>
                                        <SelectItem value="Gas Oxidation">Gas Oxidation</SelectItem>
                                        <SelectItem value="Raku">Raku</SelectItem>
                                        <SelectItem value="Wood Fire">Wood Fire</SelectItem>
                                        <SelectItem value="Salt Fire">Salt Fire</SelectItem>
                                        <SelectItem value="Pit Fire">Pit Fire</SelectItem>
                                        <SelectItem value="Saggar">Saggar</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* Kilns */}
                    <div className="space-y-3">
                        <Label>Number of Kilns</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="electric-kilns">Electric Kilns</Label>
                                {isEditing ? (
                                    <Input
                                        id="electric-kilns"
                                        type="number"
                                        min="0"
                                        value={studioData.kilns.electric}
                                        onChange={(e) =>
                                            setStudioData((prev) => ({
                                                ...prev,
                                                kilns: {
                                                    ...prev.kilns,
                                                    electric: parseInt(e.target.value) || 0
                                                }
                                            }))
                                        }
                                    />
                                ) : (
                                    <p className="text-2xl font-bold text-primary">
                                        {studioData.kilns.electric}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gas-kilns">Gas Kilns</Label>
                                {isEditing ? (
                                    <Input
                                        id="gas-kilns"
                                        type="number"
                                        min="0"
                                        value={studioData.kilns.gas}
                                        onChange={(e) =>
                                            setStudioData((prev) => ({
                                                ...prev,
                                                kilns: {
                                                    ...prev.kilns,
                                                    gas: parseInt(e.target.value) || 0
                                                }
                                            }))
                                        }
                                    />
                                ) : (
                                    <p className="text-2xl font-bold text-secondary">
                                        {studioData.kilns.gas}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Glazes */}
                    <div className="space-y-2">
                        <Label>Available Glazes</Label>
                        <div className="flex items-center space-x-4">
                            <div className="text-3xl font-bold text-primary">
                                {studioData.glazesCount}
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Different glaze options
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Managed in Glazes section
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Locations */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                            <MapPin className="w-5 h-5" />
                            <span>Studio Locations</span>
                        </CardTitle>
                        <Button onClick={() => setShowAddLocation(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Location
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Existing Locations */}
                    {context.currentStudio?.locations?.map((location) => (
                        <div
                            key={location.id}
                            className="border rounded-lg p-4 space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div
                                        className="w-8 h-8 bg-primary/10 flex items-center justify-center rounded"
                                        style={{
                                            borderRadius: "68% 32% 62% 38% / 55% 48% 52% 45%"
                                        }}
                                    >
                                        <MapPin className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <h4>{location.name}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {location.city}, {location.state}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setEditingLocation(
                                                editingLocation === location.id ? null : location.id
                                            )
                                        }
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteLocation(location.id)}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {editingLocation === location.id && (
                                <div className="space-y-4 pt-4 border-t">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Location Name</Label>
                                            <Input defaultValue={location.name} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Phone Number</Label>
                                            <Input defaultValue={location.phone} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Address</Label>
                                            <Input defaultValue={location.address} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Capacity</Label>
                                            <Input
                                                type="number"
                                                defaultValue={location.capacity}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>City</Label>
                                            <Input defaultValue={location.city} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>State</Label>
                                            <Input defaultValue={location.state} />
                                        </div>
                                    </div>

                                    {/* Operating Hours */}
                                    <div className="space-y-3">
                                        <Label>Operating Hours</Label>
                                        <div className="space-y-2">
                                            {Object.entries(locationHours).map(([day, hours]) => (
                                                <div
                                                    key={day}
                                                    className="flex items-center space-x-4"
                                                >
                                                    <div className="w-24 text-sm capitalize">
                                                        {day}
                                                    </div>
                                                    <Switch
                                                        checked={hours.isOpen}
                                                        onCheckedChange={(checked) =>
                                                            setLocationHours((prev) => ({
                                                                ...prev,
                                                                [day]: { ...hours, isOpen: checked }
                                                            }))
                                                        }
                                                    />
                                                    {hours.isOpen && (
                                                        <>
                                                            <Input
                                                                type="time"
                                                                value={hours.open}
                                                                onChange={(e) =>
                                                                    setLocationHours((prev) => ({
                                                                        ...prev,
                                                                        [day]: {
                                                                            ...hours,
                                                                            open: e.target.value
                                                                        }
                                                                    }))
                                                                }
                                                                className="w-24"
                                                            />
                                                            <span className="text-sm text-muted-foreground">
                                                                to
                                                            </span>
                                                            <Input
                                                                type="time"
                                                                value={hours.close}
                                                                onChange={(e) =>
                                                                    setLocationHours((prev) => ({
                                                                        ...prev,
                                                                        [day]: {
                                                                            ...hours,
                                                                            close: e.target.value
                                                                        }
                                                                    }))
                                                                }
                                                                className="w-24"
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Member Hours */}
                                    <div className="space-y-3">
                                        <Label>Member Access Hours</Label>
                                        <div className="space-y-2">
                                            {Object.entries(memberHours).map(([day, hours]) => (
                                                <div
                                                    key={day}
                                                    className="flex items-center space-x-4"
                                                >
                                                    <div className="w-24 text-sm capitalize">
                                                        {day}
                                                    </div>
                                                    <Switch
                                                        checked={hours.isOpen}
                                                        onCheckedChange={(checked) =>
                                                            setMemberHours((prev) => ({
                                                                ...prev,
                                                                [day]: { ...hours, isOpen: checked }
                                                            }))
                                                        }
                                                    />
                                                    {hours.isOpen && (
                                                        <>
                                                            <Input
                                                                type="time"
                                                                value={hours.open}
                                                                onChange={(e) =>
                                                                    setMemberHours((prev) => ({
                                                                        ...prev,
                                                                        [day]: {
                                                                            ...hours,
                                                                            open: e.target.value
                                                                        }
                                                                    }))
                                                                }
                                                                className="w-24"
                                                            />
                                                            <span className="text-sm text-muted-foreground">
                                                                to
                                                            </span>
                                                            <Input
                                                                type="time"
                                                                value={hours.close}
                                                                onChange={(e) =>
                                                                    setMemberHours((prev) => ({
                                                                        ...prev,
                                                                        [day]: {
                                                                            ...hours,
                                                                            close: e.target.value
                                                                        }
                                                                    }))
                                                                }
                                                                className="w-24"
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setEditingLocation(null)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button onClick={() => setEditingLocation(null)}>
                                            Save Location
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Add New Location Form */}
                    {showAddLocation && (
                        <div className="border rounded-lg p-4 space-y-4 bg-accent/20">
                            <div className="flex items-center justify-between">
                                <h4>Add New Location</h4>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowAddLocation(false)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Location Name</Label>
                                    <Input
                                        placeholder="e.g., Downtown Branch"
                                        value={newLocation.name}
                                        onChange={(e) =>
                                            setNewLocation((prev) => ({
                                                ...prev,
                                                name: e.target.value
                                            }))
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <Input
                                        placeholder="(555) 123-4567"
                                        value={newLocation.phone}
                                        onChange={(e) =>
                                            setNewLocation((prev) => ({
                                                ...prev,
                                                phone: e.target.value
                                            }))
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Address</Label>
                                    <Input
                                        placeholder="123 Main Street"
                                        value={newLocation.address}
                                        onChange={(e) =>
                                            setNewLocation((prev) => ({
                                                ...prev,
                                                address: e.target.value
                                            }))
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Capacity</Label>
                                    <Input
                                        type="number"
                                        placeholder="50"
                                        value={newLocation.capacity}
                                        onChange={(e) =>
                                            setNewLocation((prev) => ({
                                                ...prev,
                                                capacity: parseInt(e.target.value) || 0
                                            }))
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>City</Label>
                                    <Input
                                        placeholder="Portland"
                                        value={newLocation.city}
                                        onChange={(e) =>
                                            setNewLocation((prev) => ({
                                                ...prev,
                                                city: e.target.value
                                            }))
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>State</Label>
                                    <Input
                                        placeholder="OR"
                                        value={newLocation.state}
                                        onChange={(e) =>
                                            setNewLocation((prev) => ({
                                                ...prev,
                                                state: e.target.value
                                            }))
                                        }
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    placeholder="Describe this location..."
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowAddLocation(false)}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleAddLocation}>Add Location</Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
