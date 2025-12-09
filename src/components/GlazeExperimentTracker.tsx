import { useState } from "react";
import {
    Plus,
    Search,
    Filter,
    Eye,
    Edit2,
    Trash2,
    Star,
    Upload,
    Download,
    Beaker,
    Calendar,
    User,
    Flame,
    Thermometer,
    Image as ImageIcon,
    Tag,
    Save,
    X,
    Copy,
    BarChart3,
    TrendingUp,
    AlertTriangle,
    MoreHorizontal,
    Palette,
    CheckSquare,
    FileSpreadsheet,
    Settings
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Checkbox } from "./ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "./ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "./ui/dialog";
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

interface GlazeExperimentTrackerProps {
    onNavigateToEditor: (glazeId?: string) => void;
}

export function GlazeExperimentTracker({ onNavigateToEditor }: GlazeExperimentTrackerProps) {
    const { currentUser } = useAppContext();
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [showBulkEdit, setShowBulkEdit] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterType, setFilterType] = useState<string>("all");
    const [filterAtmosphere, setFilterAtmosphere] = useState<string>("all");

    // Mock data
    const [glazes] = useState<GlazeEntry[]>([
        {
            id: "glaze1",
            name: "Celadon Green",
            type: "experiment",
            status: "available",
            experimenterName: "Jane Potter",
            experimentedBy: "user1",
            testDate: "2025-06-01",
            firedDate: "2025-06-03",
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
            createdAt: "2025-06-01T10:00:00Z",
            updatedAt: "2025-06-03T15:30:00Z"
        },
        {
            id: "glaze2",
            name: "Amaco Potter's Choice Amber",
            type: "store-bought",
            status: "available",
            quantity: 1,
            quantityUnit: "pint",
            cone: ["5", "6"],
            atmosphere: "oxidation",
            notes: "Reliable amber glaze. Good for functional ware.",
            tags: ["amber", "mid-fire", "food-safe", "commercial"],
            manufacturer: "Amaco",
            productCode: "PC-10",
            createdAt: "2025-05-15T09:00:00Z",
            updatedAt: "2025-05-15T09:00:00Z"
        },
        {
            id: "glaze3",
            name: "Iron Red Experiment",
            type: "experiment",
            status: "experiment",
            experimenterName: "Mike Chen",
            experimentedBy: "user2",
            testDate: "2025-06-10",
            quantity: 200,
            quantityUnit: "grams",
            cone: ["6"],
            atmosphere: "reduction",
            notes: "Testing iron content variations. Current batch too thin.",
            tags: ["iron-red", "experimental", "high-iron"],
            ingredients: [
                { ingredient: "Potash Feldspar", quantity: 40, unit: "g" },
                { ingredient: "Silica", quantity: 25, unit: "g" },
                { ingredient: "Whiting", quantity: 20, unit: "g" },
                { ingredient: "Red Iron Oxide", quantity: 15, unit: "g" }
            ],
            createdAt: "2025-06-10T14:00:00Z",
            updatedAt: "2025-06-10T14:00:00Z"
        }
    ]);

    const filteredGlazes = glazes.filter((glaze) => {
        const matchesSearch =
            glaze.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            glaze.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
            glaze.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = filterStatus === "all" || glaze.status === filterStatus;
        const matchesType = filterType === "all" || glaze.type === filterType;
        const matchesAtmosphere =
            filterAtmosphere === "all" || glaze.atmosphere === filterAtmosphere;

        return matchesSearch && matchesStatus && matchesType && matchesAtmosphere;
    });

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedItems(filteredGlazes.map((g) => g.id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleSelectItem = (glazeId: string, checked: boolean) => {
        if (checked) {
            setSelectedItems((prev) => [...prev, glazeId]);
        } else {
            setSelectedItems((prev) => prev.filter((id) => id !== glazeId));
        }
    };

    const handleBulkStatusChange = (newStatus: string) => {
        console.log("Bulk changing status to:", newStatus, "for items:", selectedItems);
        setSelectedItems([]);
        setShowBulkEdit(false);
    };

    const handleExport = (format: "csv" | "excel") => {
        console.log(
            `Exporting ${selectedItems.length || filteredGlazes.length} items as ${format}`
        );
    };

    const handleImport = () => {
        console.log("Opening import dialog");
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "available":
                return "default";
            case "experiment":
                return "secondary";
            case "not-available":
                return "destructive";
            default:
                return "outline";
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="flex items-center space-x-3 text-3xl font-semibold">
                        <Palette className="w-8 h-8 text-primary" />
                        <span>Glaze</span>
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Track and manage your glaze recipes, experiments, and inventory
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        variant="outline"
                        onClick={() => handleExport("csv")}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => handleExport("excel")}
                    >
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Export Excel
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleImport}
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                    </Button>
                    <Button onClick={() => onNavigateToEditor()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Glaze
                    </Button>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input
                            placeholder="Search glazes, notes, tags..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-64"
                        />
                    </div>
                    <Select
                        value={filterStatus}
                        onValueChange={setFilterStatus}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="experiment">Experiment</SelectItem>
                            <SelectItem value="not-available">Not Available</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={filterType}
                        onValueChange={setFilterType}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="experiment">Experiment</SelectItem>
                            <SelectItem value="store-bought">Store Bought</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={filterAtmosphere}
                        onValueChange={setFilterAtmosphere}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Atmosphere" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Atmospheres</SelectItem>
                            <SelectItem value="oxidation">Oxidation</SelectItem>
                            <SelectItem value="reduction">Reduction</SelectItem>
                            <SelectItem value="neutral">Neutral</SelectItem>
                            <SelectItem value="raku">Raku</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {selectedItems.length > 0 && (
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                            {selectedItems.length} selected
                        </span>
                        <Dialog
                            open={showBulkEdit}
                            onOpenChange={setShowBulkEdit}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                >
                                    <Settings className="w-4 h-4 mr-2" />
                                    Bulk Edit
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Bulk Edit Glazes</DialogTitle>
                                    <DialogDescription>
                                        Apply changes to {selectedItems.length} selected glazes
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Change Status</label>
                                        <div className="space-y-2">
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start"
                                                onClick={() => handleBulkStatusChange("available")}
                                            >
                                                Set to Available
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start"
                                                onClick={() => handleBulkStatusChange("experiment")}
                                            >
                                                Set to Experiment
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start"
                                                onClick={() =>
                                                    handleBulkStatusChange("not-available")
                                                }
                                            >
                                                Set to Not Available
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </div>

            {/* Glazes Table */}
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={
                                        selectedItems.length === filteredGlazes.length &&
                                        filteredGlazes.length > 0
                                    }
                                    onCheckedChange={handleSelectAll}
                                />
                            </TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Cone</TableHead>
                            <TableHead>Atmosphere</TableHead>
                            <TableHead>Experimenter</TableHead>
                            <TableHead>Test Date</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredGlazes.map((glaze) => (
                            <TableRow key={glaze.id}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedItems.includes(glaze.id)}
                                        onCheckedChange={(checked) =>
                                            handleSelectItem(glaze.id, checked as boolean)
                                        }
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="font-medium">{glaze.name}</div>
                                        {glaze.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {glaze.tags.slice(0, 3).map((tag) => (
                                                    <Badge
                                                        key={tag}
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        {tag}
                                                    </Badge>
                                                ))}
                                                {glaze.tags.length > 3 && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        +{glaze.tags.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className="capitalize"
                                    >
                                        {glaze.type === "store-bought"
                                            ? "Store Bought"
                                            : "Experiment"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getStatusBadge(glaze.status) as any}>
                                        {glaze.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {glaze.quantity} {glaze.quantityUnit}
                                </TableCell>
                                <TableCell>
                                    {glaze.cone.map((cone) => `Cone ${cone}`).join(", ")}
                                </TableCell>
                                <TableCell className="capitalize">{glaze.atmosphere}</TableCell>
                                <TableCell>{glaze.experimenterName || "-"}</TableCell>
                                <TableCell>
                                    {glaze.testDate
                                        ? new Date(glaze.testDate).toLocaleDateString()
                                        : "-"}
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
                                        <DropdownMenuContent>
                                            <DropdownMenuItem
                                                onClick={() => onNavigateToEditor(glaze.id)}
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => onNavigateToEditor(glaze.id)}
                                            >
                                                <Edit2 className="w-4 h-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Copy className="w-4 h-4 mr-2" />
                                                Duplicate
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {filteredGlazes.length === 0 && (
                <div className="text-center py-16 space-y-4">
                    <Palette className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold">No glazes found</h3>
                        <p className="text-muted-foreground">
                            {searchTerm ||
                            filterStatus !== "all" ||
                            filterType !== "all" ||
                            filterAtmosphere !== "all"
                                ? "Try adjusting your search or filters"
                                : "Start by adding your first glaze experiment or store-bought glaze"}
                        </p>
                    </div>
                    {!searchTerm &&
                        filterStatus === "all" &&
                        filterType === "all" &&
                        filterAtmosphere === "all" && (
                            <Button onClick={() => onNavigateToEditor()}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add First Glaze
                            </Button>
                        )}
                </div>
            )}
        </div>
    );
}
