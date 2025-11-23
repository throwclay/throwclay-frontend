"use client"

import { useState } from 'react';
import { MapPin, Heart, DollarSign, User, Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

interface CeramicPiece {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  artistId: string;
  artistName: string;
  artistHandle: string;
  artistLocation: string;
  city: string;
  state: string;
  category: 'functional' | 'decorative' | 'sculpture' | 'dinnerware' | 'vase' | 'bowl' | 'mug' | 'tile';
  tags: string[];
  dimensions: {
    height: number;
    width: number;
    depth?: number;
  };
  materials: string[];
  techniques: string[];
  firingType: string;
  glazes: string[];
  isAvailable: boolean;
  isFeatured: boolean;
  createdAt: string;
  likes: number;
  views: number;
  distance?: number;
}

export default function PublicCeramicsMarketplace() {
  const [ceramics] = useState<CeramicPiece[]>([
    {
      id: '1',
      title: 'Sunset Glaze Dinner Set',
      description: 'Hand-thrown stoneware dinner set with warm sunset glazes. Perfect for everyday dining or special occasions. Set includes 4 plates, bowls, and mugs.',
      price: 280,
      images: [
        'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=400&fit=crop'
      ],
      artistId: 'artist1',
      artistName: 'Sarah Chen',
      artistHandle: 'sarahceramics',
      artistLocation: 'Portland, OR',
      city: 'Portland',
      state: 'OR',
      category: 'dinnerware',
      tags: ['handmade', 'functional', 'dinner set', 'stoneware'],
      dimensions: { height: 3, width: 10 },
      materials: ['Stoneware Clay', 'Food-safe Glaze'],
      techniques: ['Wheel Throwing', 'Trimming'],
      firingType: 'Cone 10 Reduction',
      glazes: ['Sunset Orange', 'Warm Brown'],
      isAvailable: true,
      isFeatured: true,
      createdAt: '2025-06-10',
      likes: 24,
      views: 158,
      distance: 2.1
    },
    {
      id: '2',
      title: 'Minimalist Celadon Vase',
      description: 'Elegant celadon vase with subtle crackling. Hand-thrown and finished with traditional celadon glaze. Perfect for fresh flowers or as a standalone piece.',
      price: 85,
      images: [
        'https://images.unsplash.com/photo-1594736797933-d0401ba6fe65?w=400&h=400&fit=crop'
      ],
      artistId: 'artist2',
      artistName: 'Marcus Kim',
      artistHandle: 'marcusceramics',
      artistLocation: 'Seattle, WA',
      city: 'Seattle',
      state: 'WA',
      category: 'vase',
      tags: ['celadon', 'minimalist', 'crackling', 'traditional'],
      dimensions: { height: 12, width: 4 },
      materials: ['Porcelain Clay', 'Celadon Glaze'],
      techniques: ['Wheel Throwing'],
      firingType: 'Cone 10 Oxidation',
      glazes: ['Traditional Celadon'],
      isAvailable: true,
      isFeatured: false,
      createdAt: '2025-06-08',
      likes: 12,
      views: 89,
      distance: 173.5
    },
    {
      id: '3',
      title: 'Rustic Coffee Mug Set',
      description: 'Set of 4 handmade coffee mugs with earthy glazes. Each mug is unique with slight variations. Microwave and dishwasher safe.',
      price: 120,
      images: [
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop'
      ],
      artistId: 'artist3',
      artistName: 'Emma Rodriguez',
      artistHandle: 'earthenware_emma',
      artistLocation: 'Portland, OR',
      city: 'Portland',
      state: 'OR',
      category: 'mug',
      tags: ['coffee mug', 'rustic', 'set', 'earthy'],
      dimensions: { height: 4, width: 3.5 },
      materials: ['Stoneware Clay', 'Matte Glaze'],
      techniques: ['Wheel Throwing'],
      firingType: 'Cone 6 Oxidation',
      glazes: ['Earth Brown', 'Forest Green'],
      isAvailable: true,
      isFeatured: true,
      createdAt: '2025-06-05',
      likes: 18,
      views: 142,
      distance: 5.8
    },
    {
      id: '4',
      title: 'Abstract Sculptural Bowl',
      description: 'Contemporary sculptural bowl with organic form and crystalline glaze. A statement piece for modern interiors.',
      price: 195,
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop'
      ],
      artistId: 'artist4',
      artistName: 'David Park',
      artistHandle: 'modernceramics',
      artistLocation: 'San Francisco, CA',
      city: 'San Francisco',
      state: 'CA',
      category: 'sculpture',
      tags: ['abstract', 'contemporary', 'crystalline', 'statement piece'],
      dimensions: { height: 6, width: 12, depth: 8 },
      materials: ['Porcelain Clay', 'Crystalline Glaze'],
      techniques: ['Hand Building', 'Carving'],
      firingType: 'Cone 10 Oxidation',
      glazes: ['Blue Crystalline'],
      isAvailable: true,
      isFeatured: false,
      createdAt: '2025-06-12',
      likes: 31,
      views: 203,
      distance: 635.2
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const filteredCeramics = ceramics.filter(piece => {
    const matchesSearch = piece.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         piece.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         piece.artistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         piece.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || piece.category === categoryFilter;
    const matchesLocation = locationFilter === 'all' || piece.state === locationFilter;
    const matchesPrice = piece.price >= priceRange[0] && piece.price <= priceRange[1];

    return matchesSearch && matchesCategory && matchesLocation && matchesPrice && piece.isAvailable;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'popular': return b.likes - a.likes;
      case 'distance': return (a.distance || 0) - (b.distance || 0);
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const featuredCeramics = ceramics.filter(piece => piece.isFeatured && piece.isAvailable);

  const handleContactArtist = (piece: CeramicPiece) => {
    // This would typically open a contact form or redirect to artist's profile
    alert(`Contact form for ${piece.artistName} would open here. This would allow buyers to inquire about the piece.`);
  };

  const handleLikePiece = (pieceId: string) => {
    // This would typically require user authentication
    alert('Please sign up or log in to like pieces and save them to your favorites.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1>Ceramics Marketplace</h1>
        <p className="text-muted-foreground text-lg mt-4">
          Discover unique handmade ceramics from talented artists around the world.
        </p>
      </div>

      {/* Featured Section */}
      {featuredCeramics.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl mb-6">Featured Pieces</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCeramics.slice(0, 3).map((piece) => (
              <Card key={piece.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square relative">
                  <ImageWithFallback
                    src={piece.images[0]}
                    alt={piece.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                    Featured
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-3 right-3 bg-white/80 hover:bg-white"
                    onClick={() => handleLikePiece(piece.id)}
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium line-clamp-1">{piece.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    by {piece.artistName}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold">${piece.price}</span>
                    <Badge variant="outline">{piece.category}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-muted/30 rounded-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search ceramics, artists, or techniques..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="functional">Functional</SelectItem>
                <SelectItem value="decorative">Decorative</SelectItem>
                <SelectItem value="dinnerware">Dinnerware</SelectItem>
                <SelectItem value="vase">Vases</SelectItem>
                <SelectItem value="bowl">Bowls</SelectItem>
                <SelectItem value="mug">Mugs</SelectItem>
                <SelectItem value="sculpture">Sculpture</SelectItem>
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="OR">Oregon</SelectItem>
                <SelectItem value="WA">Washington</SelectItem>
                <SelectItem value="CA">California</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={showFilters} onOpenChange={setShowFilters}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Filter Ceramics</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div>
                    <Label>Price Range: ${priceRange[0]} - ${priceRange[1]}</Label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={500}
                      step={10}
                      className="mt-2"
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Results and Sort */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">
          {filteredCeramics.length} ceramics available
        </p>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="distance">Distance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ceramics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCeramics.map((piece) => (
          <Card key={piece.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
            <div className="aspect-square relative">
              <ImageWithFallback
                src={piece.images[0]}
                alt={piece.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-3 right-3 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleLikePiece(piece.id)}
              >
                <Heart className="w-4 h-4" />
              </Button>
              {piece.distance && (
                <Badge className="absolute bottom-3 left-3 bg-black/70 text-white">
                  {piece.distance} mi
                </Badge>
              )}
            </div>

            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium line-clamp-1">{piece.title}</h3>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span className="line-clamp-1">{piece.artistName}</span>
                  </div>
                </div>
                <Badge variant="outline" className="ml-2">
                  {piece.category}
                </Badge>
              </div>

              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
                <MapPin className="w-3 h-3" />
                <span>{piece.artistLocation}</span>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {piece.description}
              </p>

              <div className="flex flex-wrap gap-1 mb-3">
                {piece.tags.slice(0, 2).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {piece.tags.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{piece.tags.length - 2}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold">${piece.price}</span>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>{piece.likes} likes</span>
                    <span>•</span>
                    <span>{piece.views} views</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleContactArtist(piece)}
                >
                  Contact Artist
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCeramics.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3>No ceramics found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or check back later for new pieces.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Call to Action for Artists */}
      <div className="mt-16 bg-primary/5 rounded-lg p-8 text-center">
        <h3 className="text-2xl mb-4">Are you a ceramic artist?</h3>
        <p className="text-muted-foreground mb-6">
          Join Throw Clay and start selling your ceramics to pottery enthusiasts worldwide.
        </p>
        <Button size="lg">
          Start Selling Your Ceramics
        </Button>
      </div>
    </div>
  );
}