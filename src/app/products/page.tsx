import { useState } from "react";
import {
    Package,
    Plus,
    Search,
    Filter,
    Edit2,
    Trash2,
    ShoppingCart,
    Users,
    Lock,
    Image as ImageIcon,
    DollarSign,
    AlertCircle,
    CheckCircle2,
    MoreVertical
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAppContext } from "@/app/context/AppContext";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Product {
    id: string;
    name: string;
    category: string;
    description: string;
    price: number;
    quantity: number;
    imageUrl: string;
    membersOnly: boolean;
    isActive: boolean;
    createdDate: string;
    lastUpdated: string;
}

const PRODUCT_CATEGORIES = [
    "Clay",
    "Tools",
    "Glazes",
    "Equipment",
    "Supplies",
    "Chemicals",
    "Books & Resources",
    "Safety Gear",
    "Other"
];

export default function Products() {
    const { currentStudio } = useAppContext();
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [showAddProductDialog, setShowAddProductDialog] = useState(false);
    const [showEditProductDialog, setShowEditProductDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Mock products data
    const [products, setProducts] = useState<Product[]>([
        {
            id: "1",
            name: "Stoneware Clay - 25lb",
            category: "Clay",
            description:
                "High-fire stoneware clay, cone 6-10. Perfect for wheel throwing and hand building. Smooth texture with excellent plasticity.",
            price: 28.5,
            quantity: 45,
            imageUrl: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800",
            membersOnly: false,
            isActive: true,
            createdDate: "2024-01-15",
            lastUpdated: "2024-03-10"
        },
        {
            id: "2",
            name: "Porcelain Clay - 25lb",
            category: "Clay",
            description:
                "Premium porcelain clay body, cone 6-10. Bright white color, excellent for fine detail work.",
            price: 42.0,
            quantity: 30,
            imageUrl: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800",
            membersOnly: true,
            isActive: true,
            createdDate: "2024-01-20",
            lastUpdated: "2024-03-05"
        },
        {
            id: "3",
            name: "Wire Clay Cutting Tool Set",
            category: "Tools",
            description:
                "Professional 3-piece wire cutting tool set. Includes standard wire, twisted wire, and cheese cutter.",
            price: 24.99,
            quantity: 12,
            imageUrl: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800",
            membersOnly: false,
            isActive: true,
            createdDate: "2024-02-01",
            lastUpdated: "2024-02-15"
        },
        {
            id: "4",
            name: "Underglazes Color Set - 12 Pack",
            category: "Glazes",
            description:
                "Vibrant underglaze colors in 2oz bottles. Safe for cone 06-10. Mix and layer for endless possibilities.",
            price: 89.99,
            quantity: 8,
            imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800",
            membersOnly: false,
            isActive: true,
            createdDate: "2024-02-10",
            lastUpdated: "2024-03-01"
        },
        {
            id: "5",
            name: "Pottery Rib Set - Wood & Metal",
            category: "Tools",
            description:
                "8-piece professional rib set including wood, metal, and rubber ribs for shaping and smoothing.",
            price: 32.5,
            quantity: 0,
            imageUrl: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800",
            membersOnly: false,
            isActive: false,
            createdDate: "2024-01-25",
            lastUpdated: "2024-03-12"
        },
        {
            id: "6",
            name: "Studio Apron - Canvas",
            category: "Safety Gear",
            description:
                "Heavy-duty canvas apron with adjustable straps and pockets. Water-resistant and easy to clean.",
            price: 38.0,
            quantity: 20,
            imageUrl: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800",
            membersOnly: true,
            isActive: true,
            createdDate: "2024-02-05",
            lastUpdated: "2024-02-20"
        }
    ]);

    // Form state for add/edit
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        description: "",
        price: "",
        quantity: "",
        imageUrl: "",
        membersOnly: false,
        isActive: true
    });

    const handleAddProduct = () => {
        const newProduct: Product = {
            id: Date.now().toString(),
            name: formData.name,
            category: formData.category,
            description: formData.description,
            price: parseFloat(formData.price),
            quantity: parseInt(formData.quantity),
            imageUrl: formData.imageUrl,
            membersOnly: formData.membersOnly,
            isActive: formData.isActive,
            createdDate: new Date().toISOString().split("T")[0],
            lastUpdated: new Date().toISOString().split("T")[0]
        };

        setProducts([newProduct, ...products]);
        setShowAddProductDialog(false);
        resetForm();
    };

    const handleEditProduct = () => {
        if (!selectedProduct) return;

        setProducts(
            products.map((p) =>
                p.id === selectedProduct.id
                    ? {
                          ...p,
                          name: formData.name,
                          category: formData.category,
                          description: formData.description,
                          price: parseFloat(formData.price),
                          quantity: parseInt(formData.quantity),
                          imageUrl: formData.imageUrl,
                          membersOnly: formData.membersOnly,
                          isActive: formData.isActive,
                          lastUpdated: new Date().toISOString().split("T")[0]
                      }
                    : p
            )
        );

        setShowEditProductDialog(false);
        setSelectedProduct(null);
        resetForm();
    };

    const handleDeleteProduct = () => {
        if (!selectedProduct) return;
        setProducts(products.filter((p) => p.id !== selectedProduct.id));
        setShowDeleteDialog(false);
        setSelectedProduct(null);
    };

    const resetForm = () => {
        setFormData({
            name: "",
            category: "",
            description: "",
            price: "",
            quantity: "",
            imageUrl: "",
            membersOnly: false,
            isActive: true
        });
    };

    const openEditDialog = (product: Product) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name,
            category: product.category,
            description: product.description,
            price: product.price.toString(),
            quantity: product.quantity.toString(),
            imageUrl: product.imageUrl,
            membersOnly: product.membersOnly,
            isActive: product.isActive
        });
        setShowEditProductDialog(true);
    };

    const openDeleteDialog = (product: Product) => {
        setSelectedProduct(product);
        setShowDeleteDialog(true);
    };

    // Filter products
    const filteredProducts = products.filter((product) => {
        const matchesSearch =
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const activeProducts = products.filter((p) => p.isActive).length;
    const lowStockProducts = products.filter((p) => p.quantity > 0 && p.quantity <= 10).length;
    const outOfStockProducts = products.filter((p) => p.quantity === 0).length;

    if (!currentStudio) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <Package className="w-16 h-16 text-muted-foreground mb-4" />
                <h2>No Studio Selected</h2>
                <p className="text-muted-foreground mt-2">
                    Please select a studio to manage products
                </p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="flex items-center gap-3">
                        <Package className="w-8 h-8" />
                        Products
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your studio's inventory and products for sale
                    </p>
                </div>
                <Button
                    onClick={() => {
                        resetForm();
                        setShowAddProductDialog(true);
                    }}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground">Total Products</p>
                                <p className="mt-1">{products.length}</p>
                            </div>
                            <Package className="w-8 h-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground">Active Products</p>
                                <p className="mt-1">{activeProducts}</p>
                            </div>
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground">Low Stock</p>
                                <p className="mt-1">{lowStockProducts}</p>
                            </div>
                            <AlertCircle className="w-8 h-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground">Out of Stock</p>
                                <p className="mt-1">{outOfStockProducts}</p>
                            </div>
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select
                            value={categoryFilter}
                            onValueChange={setCategoryFilter}
                        >
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {PRODUCT_CATEGORIES.map((cat) => (
                                    <SelectItem
                                        key={cat}
                                        value={cat}
                                    >
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Products List */}
            <Card>
                <CardContent className="p-0">
                    {filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Package className="w-12 h-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                                {searchQuery || categoryFilter !== "all"
                                    ? "No products found matching your filters"
                                    : "No products yet. Add your first product to get started!"}
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[300px]">Product</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 flex-shrink-0">
                                                    <ImageWithFallback
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover rounded"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium truncate">
                                                        {product.name}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{product.category}</Badge>
                                        </TableCell>
                                        <TableCell>${product.price.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span>{product.quantity}</span>
                                                {product.quantity === 0 && (
                                                    <Badge
                                                        variant="destructive"
                                                        className="text-xs"
                                                    >
                                                        Out
                                                    </Badge>
                                                )}
                                                {product.quantity > 0 && product.quantity <= 10 && (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-yellow-500 text-yellow-600 text-xs"
                                                    >
                                                        Low
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {!product.isActive && (
                                                    <Badge variant="secondary">Inactive</Badge>
                                                )}
                                                {product.membersOnly && (
                                                    <Badge
                                                        variant="outline"
                                                        className="gap-1"
                                                    >
                                                        <Lock className="w-3 h-3" />
                                                        Members
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
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
                                                    <DropdownMenuItem
                                                        onClick={() => openEditDialog(product)}
                                                    >
                                                        <Edit2 className="w-4 h-4 mr-2" />
                                                        Edit Product
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => openDeleteDialog(product)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete Product
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Add Product Dialog */}
            <Dialog
                open={showAddProductDialog}
                onOpenChange={setShowAddProductDialog}
            >
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
                        <DialogDescription>
                            Add a new product to your studio's inventory
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label htmlFor="name">Product Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    placeholder="e.g., Stoneware Clay - 25lb"
                                />
                            </div>

                            <div>
                                <Label htmlFor="category">Category *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, category: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PRODUCT_CATEGORIES.map((cat) => (
                                            <SelectItem
                                                key={cat}
                                                value={cat}
                                            >
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="price">Price ($) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) =>
                                        setFormData({ ...formData, price: e.target.value })
                                    }
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="quantity">Quantity Available *</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    value={formData.quantity}
                                    onChange={(e) =>
                                        setFormData({ ...formData, quantity: e.target.value })
                                    }
                                    placeholder="0"
                                />
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="imageUrl">Image URL</Label>
                                <Input
                                    id="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={(e) =>
                                        setFormData({ ...formData, imageUrl: e.target.value })
                                    }
                                    placeholder="https://example.com/image.jpg"
                                />
                                <p className="text-muted-foreground mt-1">
                                    Enter an image URL for your product
                                </p>
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    placeholder="Describe your product..."
                                    rows={4}
                                />
                            </div>

                            <div className="col-span-2 space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Lock className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p>Members Only</p>
                                            <p className="text-muted-foreground">
                                                Only studio members can purchase this product
                                            </p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={formData.membersOnly}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, membersOnly: checked })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p>Active Product</p>
                                            <p className="text-muted-foreground">
                                                Product is visible and available for purchase
                                            </p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, isActive: checked })
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowAddProductDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddProduct}
                            disabled={
                                !formData.name ||
                                !formData.category ||
                                !formData.price ||
                                !formData.quantity ||
                                !formData.description
                            }
                        >
                            Add Product
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Product Dialog */}
            <Dialog
                open={showEditProductDialog}
                onOpenChange={setShowEditProductDialog}
            >
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                        <DialogDescription>
                            Update product information and availability
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label htmlFor="edit-name">Product Name *</Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    placeholder="e.g., Stoneware Clay - 25lb"
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-category">Category *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, category: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PRODUCT_CATEGORIES.map((cat) => (
                                            <SelectItem
                                                key={cat}
                                                value={cat}
                                            >
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="edit-price">Price ($) *</Label>
                                <Input
                                    id="edit-price"
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) =>
                                        setFormData({ ...formData, price: e.target.value })
                                    }
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="edit-quantity">Quantity Available *</Label>
                                <Input
                                    id="edit-quantity"
                                    type="number"
                                    value={formData.quantity}
                                    onChange={(e) =>
                                        setFormData({ ...formData, quantity: e.target.value })
                                    }
                                    placeholder="0"
                                />
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="edit-imageUrl">Image URL</Label>
                                <Input
                                    id="edit-imageUrl"
                                    value={formData.imageUrl}
                                    onChange={(e) =>
                                        setFormData({ ...formData, imageUrl: e.target.value })
                                    }
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="edit-description">Description *</Label>
                                <Textarea
                                    id="edit-description"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    placeholder="Describe your product..."
                                    rows={4}
                                />
                            </div>

                            <div className="col-span-2 space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Lock className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p>Members Only</p>
                                            <p className="text-muted-foreground">
                                                Only studio members can purchase this product
                                            </p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={formData.membersOnly}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, membersOnly: checked })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p>Active Product</p>
                                            <p className="text-muted-foreground">
                                                Product is visible and available for purchase
                                            </p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, isActive: checked })
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowEditProductDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEditProduct}
                            disabled={
                                !formData.name ||
                                !formData.category ||
                                !formData.price ||
                                !formData.quantity ||
                                !formData.description
                            }
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Product</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedProduct?.name}"? This action
                            cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteProduct}
                        >
                            Delete Product
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
