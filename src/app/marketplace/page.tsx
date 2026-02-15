"use client";
import { useState } from "react";
import {
    ShoppingBag,
    Search,
    Filter,
    DollarSign,
    Eye,
    Heart,
    User,
    Star,
    Palette,
    Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useAppContext } from "@/app/context/AppContext";
import type { PotteryEntry } from "@/types";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";

import { DefaultLayout } from "@/components/layout/DefaultLayout";

export default function CommerceMarketplace() {
    const { currentUser, currentStudio } = useAppContext();
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [priceFilter, setPriceFilter] = useState("all");

    // Mock marketplace items
    const [marketplaceItems] = useState<
        (PotteryEntry & { artistName: string; artistAvatar?: string })[]
    >([
        {
            id: "1",
            date: "2025-06-03",
            title: "Experimental Vase",
            potteryType: "Vase",
            clayType: "Porcelain",
            techniques: ["Hand building", "Coil technique"],
            firingType: "Glaze",
            firingTemp: "1280°C",
            glazes: ["Copper Green", "Matte White"],
            status: "completed",
            notes: "Tried a new coil building technique for texture.",
            photos: [
                {
                    id: "2",
                    url: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=300&fit=crop",
                    type: "photo",
                    caption: "Finished vase with copper green glaze",
                    notes: "The glaze pooled beautifully in the texture grooves",
                    timestamp: "2025-06-03T16:45:00Z"
                }
            ],
            challenges: "Getting the coils to blend smoothly",
            nextSteps: "Document technique for future reference",
            artistId: "artist1",
            isForSale: true,
            price: 85,
            description:
                "Unique hand-built vase with beautiful copper green glaze. Perfect for dried flowers or as a decorative piece.",
            dimensions: '8" H x 4" W',
            artistName: "Jane Potter",
            artistAvatar:
                "https://images.unsplash.com/photo-1494790108755-2616b812c8e5?w=100&h=100&fit=crop&crop=face",
            isShared: false,
            sharePermissions: [],
            comments: [],
            createdAt: "2025-06-03T16:45:00Z",
            updatedAt: "2025-06-03T16:45:00Z",
            whiteboardPages: [],
            whiteboardMode: false
        },
        {
            id: "2",
            date: "2025-06-01",
            title: "Ceramic Bowl Set",
            potteryType: "Bowl",
            clayType: "Stoneware",
            techniques: ["Wheel throwing"],
            firingType: "Glaze",
            firingTemp: "1280°C",
            glazes: ["Celadon"],
            status: "completed",
            notes: "Set of 4 matching bowls with consistent form.",
            photos: [
                {
                    id: "3",
                    url: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=300&fit=crop",
                    type: "photo",
                    caption: "Set of ceramic bowls",
                    notes: "Consistent glazing across all pieces",
                    timestamp: "2025-06-01T14:30:00Z"
                }
            ],
            challenges: "Maintaining consistency across set",
            nextSteps: "Create matching plates",
            artistId: "artist2",
            isForSale: true,
            price: 120,
            description:
                "Beautiful set of 4 handmade ceramic bowls. Perfect for everyday dining or special occasions.",
            dimensions: '6" diameter each',
            artistName: "Mike Clay",
            artistAvatar:
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
            isShared: false,
            sharePermissions: [],
            comments: [],
            createdAt: "2025-06-01T14:30:00Z",
            updatedAt: "2025-06-01T14:30:00Z",
            whiteboardPages: [],
            whiteboardMode: false
        },
        {
            id: "3",
            date: "2025-05-28",
            title: "Decorative Platter",
            potteryType: "Platter",
            clayType: "Earthenware",
            techniques: ["Slab building"],
            firingType: "Glaze",
            firingTemp: "1100°C",
            glazes: ["Iron Red", "Matte White"],
            status: "completed",
            notes: "Large serving platter with geometric design.",
            photos: [
                {
                    id: "4",
                    url: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&fit=crop",
                    type: "photo",
                    caption: "Decorative ceramic platter",
                    notes: "Geometric pattern with contrasting glazes",
                    timestamp: "2025-05-28T11:15:00Z"
                }
            ],
            challenges: "Even glaze application on large surface",
            nextSteps: "Create matching serving pieces",
            artistId: "artist1",
            isForSale: true,
            price: 65,
            description:
                "Striking decorative platter featuring geometric patterns in iron red and matte white glazes.",
            dimensions: '12" diameter',
            artistName: "Jane Potter",
            artistAvatar:
                "https://images.unsplash.com/photo-1494790108755-2616b812c8e5?w=100&h=100&fit=crop&crop=face",
            isShared: false,
            sharePermissions: [],
            comments: [],
            createdAt: "2025-05-28T11:15:00Z",
            updatedAt: "2025-05-28T11:15:00Z",
            whiteboardPages: [],
            whiteboardMode: false
        }
    ]);

    const filteredItems = marketplaceItems.filter((item) => {
        const matchesSearch =
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.artistName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesPrice =
            priceFilter === "all" ||
            (priceFilter === "under50" && (item.price || 0) < 50) ||
            (priceFilter === "50to100" && (item.price || 0) >= 50 && (item.price || 0) <= 100) ||
            (priceFilter === "over100" && (item.price || 0) > 100);

        return matchesSearch && matchesPrice;
    });

    const sortedItems = [...filteredItems].sort((a, b) => {
        switch (sortBy) {
            case "price-low":
                return (a.price || 0) - (b.price || 0);
            case "price-high":
                return (b.price || 0) - (a.price || 0);
            case "oldest":
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            case "newest":
            default:
                return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
    });

    const handlePurchase = (item: PotteryEntry) => {
        // Mock purchase functionality
        alert(`Purchase initiated for "${item.title}" - $${item.price}`);
    };

    // Mock commission rate since it's not in the Studio interface
    const mockCommissionRate = 15;

    const getCommissionInfo = (price: number) => {
        const commission = (price * mockCommissionRate) / 100;
        const artistReceives = price - commission;

        return { commission, artistReceives };
    };

    return (
        <DefaultLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1>Pottery Marketplace</h1>
                        <p className="text-muted-foreground">
                            Discover unique handmade pottery from{" "}
                            {currentStudio?.name || "talented artists"}
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Badge
                            variant="secondary"
                            className="flex items-center space-x-1"
                        >
                            <ShoppingBag className="w-3 h-3" />
                            <span>{sortedItems.length} items</span>
                        </Badge>
                        {currentStudio && (
                            <Badge className="bg-blue-100 text-blue-800">
                                Studio Commission: {mockCommissionRate}%
                            </Badge>
                        )}
                    </div>
                </div>
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search pottery, artists, or descriptions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex gap-4">
                        <Select
                            value={sortBy}
                            onValueChange={setSortBy}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="oldest">Oldest First</SelectItem>
                                <SelectItem value="price-low">Price: Low to High</SelectItem>
                                <SelectItem value="price-high">Price: High to Low</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={priceFilter}
                            onValueChange={setPriceFilter}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Prices</SelectItem>
                                <SelectItem value="under50">Under $50</SelectItem>
                                <SelectItem value="50to100">$50 - $100</SelectItem>
                                <SelectItem value="over100">Over $100</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                {/* Marketplace Grid */}
                {sortedItems.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent>
                            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <h3>No items found</h3>
                            <p className="text-muted-foreground">
                                {marketplaceItems.length === 0
                                    ? "No pottery is currently available for sale."
                                    : "Try adjusting your search or filters."}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedItems.map((item) => (
                            <Card
                                key={item.id}
                                className="overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                {/* Image */}
                                <div className="aspect-square relative">
                                    <ImageWithFallback
                                        src={item.photos?.[0]?.url}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-3 right-3">
                                        <Badge className="bg-green-100 text-green-800">
                                            ${item.price}
                                        </Badge>
                                    </div>
                                </div>

                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-medium line-clamp-1">{item.title}</h3>
                                        <div className="flex items-center space-x-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="p-1"
                                            >
                                                <Heart className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="p-1"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                        {item.description}
                                    </p>

                                    {/* Artist Info */}
                                    <div className="flex items-center space-x-2 mb-3">
                                        <Avatar className="w-6 h-6">
                                            <AvatarImage src={item.artistAvatar} />
                                            <AvatarFallback className="text-xs">
                                                {item.artistName
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm text-muted-foreground">
                                            by {item.artistName}
                                        </span>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-1 mb-4 text-xs text-muted-foreground">
                                        <div>Type: {item.potteryType}</div>
                                        <div>Clay: {item.clayType}</div>
                                        {item.dimensions && <div>Size: {item.dimensions}</div>}
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {item.glazes?.slice(0, 2).map((glaze) => (
                                                <Badge
                                                    key={glaze}
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {glaze}
                                                </Badge>
                                            ))}
                                            {item.glazes && item.glazes.length > 2 && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    +{item.glazes.length - 2} more
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Commission Info for Studio Admin */}
                                    {currentUser?.type === "studio" && currentStudio && (
                                        <div className="text-xs bg-muted p-2 rounded mb-3">
                                            <div className="flex justify-between">
                                                <span>Artist receives:</span>
                                                <span>
                                                    $
                                                    {getCommissionInfo(
                                                        item.price || 0
                                                    )?.artistReceives.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Studio commission:</span>
                                                <span>
                                                    $
                                                    {getCommissionInfo(
                                                        item.price || 0
                                                    )?.commission.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Purchase Button */}
                                    <Button
                                        onClick={() => handlePurchase(item)}
                                        className="w-full flex items-center space-x-2"
                                    >
                                        <ShoppingBag className="w-4 h-4" />
                                        <span>Purchase ${item.price}</span>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
                {/* Studio Info Footer */}
                {currentStudio && (
                    <Card className="mt-12">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Building2 className="w-5 h-5" />
                                <span>About {currentStudio.name}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                All pottery featured in this marketplace is created by talented
                                artists at {currentStudio.name}. Each piece is handmade with care
                                and attention to detail.
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center space-x-2">
                                    <User className="w-4 h-4" />
                                    <span>{currentStudio.memberCount || 0} Artists</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Palette className="w-4 h-4" />
                                    <span>
                                        {currentStudio.glazes?.length || 0} Available Glazes
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <DollarSign className="w-4 h-4" />
                                    <span>{mockCommissionRate}% Studio Commission</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DefaultLayout>
    );
}
