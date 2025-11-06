import { useState } from 'react';
import { MapPin, Star, Users, Clock, Phone, Globe, Instagram, Search, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Studio {
  id: string;
  name: string;
  description: string;
  location: string;
  city: string;
  state: string;
  rating: number;
  reviewCount: number;
  memberCount: number;
  specialties: string[];
  images: string[];
  contact: {
    phone?: string;
    website?: string;
    instagram?: string;
    email?: string;
  };
  classes: {
    beginner: boolean;
    intermediate: boolean;
    advanced: boolean;
    workshops: boolean;
  };
  amenities: string[];
  priceRange: 'low' | 'medium' | 'high';
  openToPublic: boolean;
  distance?: number;
}

export function PublicStudiosDirectory() {
  const [studios] = useState<Studio[]>([
    {
      id: '1',
      name: 'Artisan Clay Studio',
      description: 'A welcoming community studio focused on traditional and contemporary ceramic techniques. Perfect for beginners and experienced potters alike.',
      location: '123 Main Street',
      city: 'Portland',
      state: 'OR',
      rating: 4.8,
      reviewCount: 42,
      memberCount: 85,
      specialties: ['Wheel Throwing', 'Hand Building', 'Glazing', 'Raku'],
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1594736797933-d0401ba6fe65?w=400&h=300&fit=crop'
      ],
      contact: {
        phone: '(503) 555-0123',
        website: 'https://artisanclay.com',
        instagram: '@artisanclay',
        email: 'hello@artisanclay.com'
      },
      classes: {
        beginner: true,
        intermediate: true,
        advanced: true,
        workshops: true
      },
      amenities: ['24/7 Access', 'Kiln Firing', 'Tools Provided', 'Glazing Station', 'Parking'],
      priceRange: 'medium',
      openToPublic: true,
      distance: 2.3
    },
    {
      id: '2',
      name: 'River Clay Collective',
      description: 'Artist-run cooperative studio emphasizing sustainable practices and community engagement. Specializes in functional pottery.',
      location: '456 River Road',
      city: 'Portland',
      state: 'OR',
      rating: 4.6,
      reviewCount: 28,
      memberCount: 45,
      specialties: ['Functional Pottery', 'Eco-Glazing', 'Community Kiln'],
      images: [
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&fit=crop'
      ],
      contact: {
        website: 'https://riverclay.coop',
        instagram: '@riverclay',
        email: 'info@riverclay.coop'
      },
      classes: {
        beginner: true,
        intermediate: true,
        advanced: false,
        workshops: true
      },
      amenities: ['Eco-Friendly', 'Community Events', 'Kiln Firing', 'Open Studio'],
      priceRange: 'low',
      openToPublic: true,
      distance: 5.7
    },
    {
      id: '3',
      name: 'Mountain View Ceramics',
      description: 'Professional ceramic studio offering intensive courses and artist residencies. State-of-the-art equipment and expert instruction.',
      location: '789 Hill Street',
      city: 'Seattle',
      state: 'WA',
      rating: 4.9,
      reviewCount: 67,
      memberCount: 120,
      specialties: ['Advanced Techniques', 'Sculpture', 'Professional Development', 'Artist Residency'],
      images: [
        'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=300&fit=crop'
      ],
      contact: {
        phone: '(206) 555-0198',
        website: 'https://mountainviewceramics.com',
        email: 'studio@mountainviewceramics.com'
      },
      classes: {
        beginner: false,
        intermediate: true,
        advanced: true,
        workshops: true
      },
      amenities: ['Professional Equipment', 'Artist Residency', 'Gallery Space', 'Private Studios'],
      priceRange: 'high',
      openToPublic: false,
      distance: 173.2
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');

  const filteredStudios = studios.filter(studio => {
    const matchesSearch = studio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         studio.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         studio.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = locationFilter === 'all' || studio.state === locationFilter;
    const matchesSpecialty = specialtyFilter === 'all' || studio.specialties.some(s => s.toLowerCase().includes(specialtyFilter.toLowerCase()));
    const matchesPrice = priceFilter === 'all' || studio.priceRange === priceFilter;
    
    return matchesSearch && matchesLocation && matchesSpecialty && matchesPrice;
  });

  const getPriceDisplay = (priceRange: string) => {
    switch (priceRange) {
      case 'low': return '$';
      case 'medium': return '$$';
      case 'high': return '$$$';
      default: return '$$';
    }
  };

  const handleApplyToStudio = (studio: Studio) => {
    // This would typically open an application form or redirect to studio's application page
    alert(`Application process for ${studio.name} would open here. This feature requires studio integration.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1>Find Pottery Studios Near You</h1>
        <p className="text-muted-foreground text-lg mt-4">
          Discover pottery studios in your area, learn about their classes, and apply to join their community.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-muted/30 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search studios, techniques, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="OR">Oregon</SelectItem>
              <SelectItem value="WA">Washington</SelectItem>
              <SelectItem value="CA">California</SelectItem>
            </SelectContent>
          </Select>

          <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              <SelectItem value="wheel">Wheel Throwing</SelectItem>
              <SelectItem value="hand">Hand Building</SelectItem>
              <SelectItem value="glazing">Glazing</SelectItem>
              <SelectItem value="raku">Raku</SelectItem>
              <SelectItem value="sculpture">Sculpture</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="low">$ Budget-friendly</SelectItem>
              <SelectItem value="medium">$$ Moderate</SelectItem>
              <SelectItem value="high">$$$ Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-muted-foreground">
          Found {filteredStudios.length} pottery studios
        </p>
        <Select defaultValue="distance">
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="distance">Sort by Distance</SelectItem>
            <SelectItem value="rating">Sort by Rating</SelectItem>
            <SelectItem value="name">Sort by Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Studios Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredStudios.map((studio) => (
          <Card key={studio.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Studio Images */}
            <div className="aspect-video relative">
              <ImageWithFallback
                src={studio.images[0]}
                alt={studio.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex space-x-2">
                <Badge className="bg-white text-black">
                  {getPriceDisplay(studio.priceRange)}
                </Badge>
                {studio.distance && (
                  <Badge className="bg-white text-black">
                    {studio.distance} mi
                  </Badge>
                )}
              </div>
              <div className="absolute top-4 right-4">
                <Badge className={studio.openToPublic ? 'bg-green-500' : 'bg-yellow-500'}>
                  {studio.openToPublic ? 'Open to Public' : 'Members Only'}
                </Badge>
              </div>
            </div>

            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{studio.name}</CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {studio.city}, {studio.state}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{studio.rating}</span>
                  <span className="text-muted-foreground text-sm">({studio.reviewCount})</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-muted-foreground line-clamp-2">
                {studio.description}
              </p>

              {/* Specialties */}
              <div>
                <Label className="text-sm font-medium">Specialties:</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {studio.specialties.slice(0, 3).map((specialty, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                  {studio.specialties.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{studio.specialties.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Classes Offered */}
              <div>
                <Label className="text-sm font-medium">Classes:</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {studio.classes.beginner && <Badge variant="outline" className="text-xs">Beginner</Badge>}
                  {studio.classes.intermediate && <Badge variant="outline" className="text-xs">Intermediate</Badge>}
                  {studio.classes.advanced && <Badge variant="outline" className="text-xs">Advanced</Badge>}
                  {studio.classes.workshops && <Badge variant="outline" className="text-xs">Workshops</Badge>}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <Label className="text-sm font-medium">Amenities:</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {studio.amenities.slice(0, 3).map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {studio.amenities.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{studio.amenities.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Studio Stats */}
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{studio.memberCount} members</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex items-center space-x-4">
                {studio.contact.website && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={studio.contact.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4 mr-1" />
                      Website
                    </a>
                  </Button>
                )}
                {studio.contact.instagram && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`https://instagram.com/${studio.contact.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                      <Instagram className="w-4 h-4 mr-1" />
                      Instagram
                    </a>
                  </Button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <Button 
                  onClick={() => handleApplyToStudio(studio)}
                  disabled={!studio.openToPublic}
                  className="flex-1"
                >
                  {studio.openToPublic ? 'Apply to Join' : 'Contact Studio'}
                </Button>
                <Button variant="outline">
                  View Classes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStudios.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3>No studios found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or check back later for new studios.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}