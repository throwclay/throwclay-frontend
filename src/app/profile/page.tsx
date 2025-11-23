import { useState } from "react";
import {
  User,
  Edit,
  Save,
  Camera,
  Instagram,
  Twitter,
  Facebook,
  Globe,
  ExternalLink,
  Award,
  Palette,
  Briefcase,
  GraduationCap,
  MapPin,
  Calendar,
  Grid3X3,
  ShoppingBag,
  Heart,
  MessageCircle,
  Eye,
  X,
  Sparkles,
  Flame,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BadgeManagement } from "@/components/BadgeManagement";
import type {
  User as UserType,
  ArtistProfile as ArtistProfileType,
  StudentBadge,
} from "@/types";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";

import { toast } from "sonner";
import { useAppContext } from "@/app/context/AppContext";

interface ArtistProfileProps {
  onProfileUpdated?: (user: UserType) => void;
}

export default function ArtistProfile({ onProfileUpdated }: ArtistProfileProps) {
  const context = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<ArtistProfileType>(
    context.currentUser?.profile || {
      bio: "",
      socialMedia: {},
      branding: {
        primaryColor: "#030213",
      },
    }
  );

  // Mock portfolio data - will be editable
  const [portfolioData, setPortfolioData] = useState({
    name: context.currentUser?.name || "Artist Name",
    title: "Ceramic Artist & Sculptor",
    tagline:
      "Creating functional art through traditional and contemporary ceramic techniques",
    bio: "Passionate ceramic artist specializing in wheel-thrown functional pottery and sculptural pieces. With over 8 years of experience, I blend traditional techniques with modern aesthetics to create unique, handcrafted pieces that bring beauty to everyday life. My work explores the intersection of form and function, with a focus on organic shapes and natural glazes.",
    location: "Portland, OR",
    memberSince: "2017",
    specialties: [
      "Wheel Throwing",
      "Hand Building",
      "Raku Firing",
      "Glaze Development",
      "Sculpture",
    ],
    techniques: [
      "High Fire Reduction",
      "Crystalline Glazes",
      "Nerikomi",
      "Sgraffito",
    ],
    education: [
      {
        degree: "BFA in Ceramics",
        institution: "Rhode Island School of Design",
        year: "2015",
      },
      {
        degree: "Certificate in Advanced Pottery",
        institution: "Haystack Mountain School of Crafts",
        year: "2018",
      },
    ],
    exhibitions: [
      {
        title: "Form & Function: Contemporary Ceramics",
        venue: "Portland Art Museum",
        year: "2024",
        link: "https://portlandartmuseum.org/exhibitions/ceramics",
      },
      {
        title: "Emerging Artists Showcase",
        venue: "Seattle Pottery Gallery",
        year: "2023",
        link: "",
      },
    ],
    awards: [
      "Best in Show - Northwest Pottery Festival 2024",
      "Emerging Artist Grant - Oregon Arts Commission 2023",
      "Excellence in Craftsmanship Award 2022",
    ],
    stats: {
      piecesCreated: 342,
      exhibitions: 12,
      yearsActive: 8,
      studiosWorked: 5,
    },
    socialMedia: {
      instagram: "@ceramicartist",
      facebook: "ceramicartistpage",
      website: "www.ceramicartist.com",
    },
  });

  // Mock badges/certifications
  const mockBadges: StudentBadge[] = [
    {
      id: "badge_1",
      badgeId: "badge_wheel_mastery",
      classId: "class_1",
      studentId: context.currentUser?.id || "student_1",
      studentName: context.currentUser?.name || "Student",
      awardedDate: "2025-01-15T10:00:00Z",
      awardedBy: "Sarah Martinez",
      awardMethod: "automatic",
      status: "active",
      verificationCode: "WM-2025-001-ABC",
      socialShareEnabled: true,
      finalGrade: 92,
      finalAttendance: 95,
      projectsCompleted: 5,
      skillsAchieved: ["centering", "pulling", "shaping", "trimming"],
      instructorNotes: "Excellent progress throughout the course.",
      displayOnProfile: true,
    },
    {
      id: "badge_2",
      badgeId: "badge_glazing_expert",
      classId: "class_2",
      studentId: context.currentUser?.id || "student_1",
      studentName: context.currentUser?.name || "Student",
      awardedDate: "2025-01-10T14:30:00Z",
      awardedBy: "Michael Chen",
      awardMethod: "manual",
      status: "active",
      verificationCode: "GE-2025-002-XYZ",
      socialShareEnabled: true,
      finalGrade: 88,
      finalAttendance: 85,
      projectsCompleted: 8,
      skillsAchieved: ["glazing", "color-mixing", "layering"],
      instructorNotes:
        "Demonstrated advanced understanding of glaze chemistry.",
      displayOnProfile: true,
    },
    {
      id: "badge_3",
      badgeId: "badge_raku_master",
      classId: "class_3",
      studentId: context.currentUser?.id || "student_1",
      studentName: context.currentUser?.name || "Student",
      awardedDate: "2024-12-20T10:00:00Z",
      awardedBy: "Elena Rodriguez",
      awardMethod: "automatic",
      status: "active",
      verificationCode: "RM-2024-003-DEF",
      socialShareEnabled: true,
      finalGrade: 95,
      finalAttendance: 100,
      projectsCompleted: 6,
      skillsAchieved: [
        "raku firing",
        "post-firing reduction",
        "safety protocols",
      ],
      instructorNotes: "Exceptional skill and safety awareness in raku firing.",
      displayOnProfile: true,
    },
  ];

  // Featured portfolio pieces
  const featuredWorks = [
    {
      id: "1",
      title: "Ocean Waves Bowl Series",
      image:
        "https://images.unsplash.com/photo-1493106819501-66d381c466f1?w=600&h=600&fit=crop",
      description: "Hand-thrown porcelain bowls with crystalline blue glaze",
      technique: "Wheel Throwing, Crystalline Glaze",
      year: "2024",
      featured: true,
    },
    {
      id: "2",
      title: "Textured Vase Collection",
      image:
        "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&h=600&fit=crop",
      description: "Sculptural vases with organic texture patterns",
      technique: "Hand Building, Sgraffito",
      year: "2024",
      featured: true,
    },
    {
      id: "3",
      title: "Minimalist Serving Set",
      image:
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=600&fit=crop",
      description: "Clean lines and matte white glaze for modern dining",
      technique: "Wheel Throwing, High Fire",
      year: "2023",
      featured: true,
    },
    {
      id: "4",
      title: "Raku Fired Sculpture",
      image:
        "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=600&fit=crop",
      description: "Abstract form with copper reduction effects",
      technique: "Raku Firing, Post-Fire Reduction",
      year: "2024",
      featured: false,
    },
    {
      id: "5",
      title: "Nerikomi Platter",
      image:
        "https://images.unsplash.com/photo-1615571022219-eb45cf7faa9d?w=600&h=600&fit=crop",
      description: "Intricate colored clay pattern work",
      technique: "Nerikomi, Slab Building",
      year: "2023",
      featured: false,
    },
    {
      id: "6",
      title: "Functional Teapot",
      image:
        "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&h=600&fit=crop",
      description: "Ergonomic design with celadon glaze",
      technique: "Wheel Throwing, Altered Forms",
      year: "2024",
      featured: false,
    },
  ];

  // Mock posts data
  const mockPosts = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
      likes: 342,
      comments: 28,
      caption: "Working on a new series of porcelain bowls 🌊",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1465408953385-7c4627c2d4a6?w=400&h=400&fit=crop",
      likes: 256,
      comments: 19,
      caption: "Testing new crystalline glaze recipes ✨",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1595475116879-45f4495e6db5?w=400&h=400&fit=crop",
      likes: 428,
      comments: 45,
      caption: "Fresh out of the kiln! Love these copper reds",
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1593826988276-b9d8e3b74282?w=400&h=400&fit=crop",
      likes: 189,
      comments: 12,
      caption: "Hand building workshop was amazing today!",
    },
    {
      id: 5,
      image:
        "https://images.unsplash.com/photo-1543254382-96cd0c0b8746?w=400&h=400&fit=crop",
      likes: 512,
      comments: 67,
      caption: "Raku firing session - always magical ✨",
    },
    {
      id: 6,
      image:
        "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop",
      likes: 298,
      comments: 34,
      caption: "Process shot: trimming fresh thrown pieces",
    },
  ];

  // Mock marketplace items
  const marketplaceItems = [
    {
      id: "1",
      image:
        "https://images.unsplash.com/photo-1493106819501-66d381c466f1?w=400&h=400&fit=crop",
      title: "Ocean Waves Serving Bowl",
      price: 125.0,
      available: true,
      views: 456,
      likes: 89,
    },
    {
      id: "2",
      image:
        "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop",
      title: "Textured Vase - Medium",
      price: 95.0,
      available: true,
      views: 312,
      likes: 67,
    },
    {
      id: "3",
      image:
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=400&fit=crop",
      title: "Minimalist Planter Set (3pc)",
      price: 145.0,
      available: false,
      views: 678,
      likes: 134,
    },
    {
      id: "4",
      image:
        "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop",
      title: "Raku Bowl - Copper Reduction",
      price: 185.0,
      available: true,
      views: 523,
      likes: 156,
    },
    {
      id: "5",
      image:
        "https://images.unsplash.com/photo-1615571022219-eb45cf7faa9d?w=400&h=400&fit=crop",
      title: "Ceramic Mug - Celadon Glaze",
      price: 45.0,
      available: true,
      views: 892,
      likes: 201,
    },
    {
      id: "6",
      image:
        "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400&h=400&fit=crop",
      title: "Artisan Dinner Plate Set (4pc)",
      price: 220.0,
      available: true,
      views: 734,
      likes: 178,
    },
  ];

  const handleSave = () => {
    if (!context.currentUser) return;

    const updatedUser = {
      ...context.currentUser,
      profile: editedProfile,
    };
    context.setCurrentUser(updatedUser);
    setIsEditing(false);
    toast.success("Profile updated successfully");
  };

  const handleCancel = () => {
    setEditedProfile(
      context.currentUser?.profile || {
        bio: "",
        socialMedia: {},
        branding: { primaryColor: "#030213" },
      }
    );
    setIsEditing(false);
  };

  if (!context.currentUser) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center py-16">
        <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Not Logged In</h3>
          <p className="text-muted-foreground">
            Please log in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="relative mb-12">
        {/* Cover/Hero Image */}
        <div
          className="relative w-full rounded-xl overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-background"
          style={{ aspectRatio: "21/6" }}
        >
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1600&h=400&fit=crop')] bg-cover bg-center opacity-20" />
          {isEditing && (
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 z-10"
            >
              <Camera className="w-4 h-4 mr-2" />
              Change Cover
            </Button>
          )}
        </div>

        {/* Profile Info */}
        <div className="relative -mt-20 px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${portfolioData.name}`}
                  />
                  <AvatarFallback>
                    {portfolioData.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 rounded-full"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="text-center md:text-left pb-2">
                {isEditing ? (
                  <Input
                    value={portfolioData.name}
                    onChange={(e) =>
                      setPortfolioData({
                        ...portfolioData,
                        name: e.target.value,
                      })
                    }
                    className="text-2xl mb-2"
                    placeholder="Your Name"
                  />
                ) : (
                  <h1 className="mb-1">{portfolioData.name}</h1>
                )}
                {isEditing ? (
                  <Input
                    value={portfolioData.title}
                    onChange={(e) =>
                      setPortfolioData({
                        ...portfolioData,
                        title: e.target.value,
                      })
                    }
                    className="mb-2"
                    placeholder="Your Title"
                  />
                ) : (
                  <p className="text-muted-foreground mb-2">
                    {portfolioData.title}
                  </p>
                )}
                <div className="flex items-center gap-4 justify-center md:justify-start text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{portfolioData.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Member since {portfolioData.memberSince}</span>
                  </div>
                </div>
                {/* Social Links */}
                <div className="flex items-center gap-2 mt-3 justify-center md:justify-start">
                  {portfolioData.socialMedia.instagram && (
                    <a
                      href={`https://instagram.com/${portfolioData.socialMedia.instagram.replace(
                        "@",
                        ""
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {portfolioData.socialMedia.facebook && (
                    <a
                      href={`https://facebook.com/${portfolioData.socialMedia.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                  {portfolioData.socialMedia.website && (
                    <a
                      href={`https://${portfolioData.socialMedia.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-center md:justify-end pb-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Portfolio
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold mb-1">
              {portfolioData.stats.piecesCreated}
            </div>
            <div className="text-sm text-muted-foreground">Pieces Created</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold mb-1">
              {portfolioData.stats.exhibitions}
            </div>
            <div className="text-sm text-muted-foreground">Exhibitions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold mb-1">
              {portfolioData.stats.yearsActive}
            </div>
            <div className="text-sm text-muted-foreground">Years Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold mb-1">
              {portfolioData.stats.studiosWorked}
            </div>
            <div className="text-sm text-muted-foreground">Studios Worked</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="portfolio" className="w-full">
        <TabsList className="grid w-full max-w-lg mb-8 grid-cols-3">
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <Grid3X3 className="w-4 h-4" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Marketplace
          </TabsTrigger>
        </TabsList>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    About
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={portfolioData.bio}
                      onChange={(e) =>
                        setPortfolioData({
                          ...portfolioData,
                          bio: e.target.value,
                        })
                      }
                      rows={6}
                      className="w-full"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-muted-foreground leading-relaxed">
                      {portfolioData.bio}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground italic mt-4">
                    {portfolioData.tagline}
                  </p>
                </CardContent>
              </Card>

              {/* Featured Works */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Featured Works
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {featuredWorks
                      .filter((w) => w.featured)
                      .map((work) => (
                        <div
                          key={work.id}
                          className="group relative rounded-lg overflow-hidden cursor-pointer"
                        >
                          <div className="aspect-square bg-muted">
                            <ImageWithFallback
                              src={work.image}
                              alt={work.title}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                              <h4 className="font-medium mb-1 text-sm">
                                {work.title}
                              </h4>
                              <p className="text-xs text-white/80 mb-2 line-clamp-2">
                                {work.description}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-white/70">
                                <Badge
                                  variant="secondary"
                                  className="bg-white/20 text-white border-0 text-xs"
                                >
                                  {work.technique}
                                </Badge>
                                <span>{work.year}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* All Portfolio Pieces */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    All Works
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {featuredWorks.map((work) => (
                      <div
                        key={work.id}
                        className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer bg-muted"
                      >
                        <ImageWithFallback
                          src={work.image}
                          alt={work.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-center p-4">
                            <p className="font-medium text-sm">{work.title}</p>
                            <p className="text-xs text-white/80 mt-1">
                              {work.year}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Exhibitions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Exhibitions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      {portfolioData.exhibitions.map((exhibition, index) => (
                        <div
                          key={index}
                          className="space-y-2 p-3 border rounded-lg relative"
                        >
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={() => {
                              const newExhibitions =
                                portfolioData.exhibitions.filter(
                                  (_, i) => i !== index
                                );
                              setPortfolioData({
                                ...portfolioData,
                                exhibitions: newExhibitions,
                              });
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Input
                            value={exhibition.title}
                            onChange={(e) => {
                              const newExhibitions = [
                                ...portfolioData.exhibitions,
                              ];
                              newExhibitions[index] = {
                                ...exhibition,
                                title: e.target.value,
                              };
                              setPortfolioData({
                                ...portfolioData,
                                exhibitions: newExhibitions,
                              });
                            }}
                            placeholder="Exhibition Title"
                            className="text-sm"
                          />
                          <Input
                            value={exhibition.venue}
                            onChange={(e) => {
                              const newExhibitions = [
                                ...portfolioData.exhibitions,
                              ];
                              newExhibitions[index] = {
                                ...exhibition,
                                venue: e.target.value,
                              };
                              setPortfolioData({
                                ...portfolioData,
                                exhibitions: newExhibitions,
                              });
                            }}
                            placeholder="Venue"
                            className="text-sm"
                          />
                          <Input
                            value={exhibition.year}
                            onChange={(e) => {
                              const newExhibitions = [
                                ...portfolioData.exhibitions,
                              ];
                              newExhibitions[index] = {
                                ...exhibition,
                                year: e.target.value,
                              };
                              setPortfolioData({
                                ...portfolioData,
                                exhibitions: newExhibitions,
                              });
                            }}
                            placeholder="Year"
                            className="text-sm"
                          />
                          <Input
                            value={exhibition.link || ""}
                            onChange={(e) => {
                              const newExhibitions = [
                                ...portfolioData.exhibitions,
                              ];
                              newExhibitions[index] = {
                                ...exhibition,
                                link: e.target.value,
                              };
                              setPortfolioData({
                                ...portfolioData,
                                exhibitions: newExhibitions,
                              });
                            }}
                            placeholder="Link (optional)"
                            className="text-sm"
                          />
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setPortfolioData({
                            ...portfolioData,
                            exhibitions: [
                              ...portfolioData.exhibitions,
                              { title: "", venue: "", year: "", link: "" },
                            ],
                          });
                        }}
                      >
                        + Add Exhibition
                      </Button>
                    </>
                  ) : (
                    portfolioData.exhibitions.map((exhibition, index) => (
                      <div key={index} className="space-y-1">
                        <div className="font-medium text-sm">
                          {exhibition.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {exhibition.venue}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {exhibition.year}
                        </div>
                        {exhibition.link && (
                          <a
                            href={exhibition.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Exhibition
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Education */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      {portfolioData.education.map((edu, index) => (
                        <div
                          key={index}
                          className="space-y-2 p-3 border rounded-lg relative"
                        >
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={() => {
                              const newEducation =
                                portfolioData.education.filter(
                                  (_, i) => i !== index
                                );
                              setPortfolioData({
                                ...portfolioData,
                                education: newEducation,
                              });
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Input
                            value={edu.degree}
                            onChange={(e) => {
                              const newEducation = [...portfolioData.education];
                              newEducation[index] = {
                                ...edu,
                                degree: e.target.value,
                              };
                              setPortfolioData({
                                ...portfolioData,
                                education: newEducation,
                              });
                            }}
                            placeholder="Degree"
                            className="text-sm"
                          />
                          <Input
                            value={edu.institution}
                            onChange={(e) => {
                              const newEducation = [...portfolioData.education];
                              newEducation[index] = {
                                ...edu,
                                institution: e.target.value,
                              };
                              setPortfolioData({
                                ...portfolioData,
                                education: newEducation,
                              });
                            }}
                            placeholder="Institution"
                            className="text-sm"
                          />
                          <Input
                            value={edu.year}
                            onChange={(e) => {
                              const newEducation = [...portfolioData.education];
                              newEducation[index] = {
                                ...edu,
                                year: e.target.value,
                              };
                              setPortfolioData({
                                ...portfolioData,
                                education: newEducation,
                              });
                            }}
                            placeholder="Year"
                            className="text-sm"
                          />
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setPortfolioData({
                            ...portfolioData,
                            education: [
                              ...portfolioData.education,
                              { degree: "", institution: "", year: "" },
                            ],
                          });
                        }}
                      >
                        + Add Education
                      </Button>
                    </>
                  ) : (
                    portfolioData.education.map((edu, index) => (
                      <div key={index} className="space-y-1">
                        <div className="font-medium text-sm">{edu.degree}</div>
                        <div className="text-sm text-muted-foreground">
                          {edu.institution}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {edu.year}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Exhibitions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Exhibitions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      {portfolioData.exhibitions.map((exhibition, index) => (
                        <div
                          key={index}
                          className="space-y-2 p-3 border rounded-lg relative"
                        >
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={() => {
                              const newExhibitions =
                                portfolioData.exhibitions.filter(
                                  (_, i) => i !== index
                                );
                              setPortfolioData({
                                ...portfolioData,
                                exhibitions: newExhibitions,
                              });
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Input
                            value={exhibition.title}
                            onChange={(e) => {
                              const newExhibitions = [
                                ...portfolioData.exhibitions,
                              ];
                              newExhibitions[index] = {
                                ...exhibition,
                                title: e.target.value,
                              };
                              setPortfolioData({
                                ...portfolioData,
                                exhibitions: newExhibitions,
                              });
                            }}
                            placeholder="Exhibition Title"
                            className="text-sm"
                          />
                          <Input
                            value={exhibition.venue}
                            onChange={(e) => {
                              const newExhibitions = [
                                ...portfolioData.exhibitions,
                              ];
                              newExhibitions[index] = {
                                ...exhibition,
                                venue: e.target.value,
                              };
                              setPortfolioData({
                                ...portfolioData,
                                exhibitions: newExhibitions,
                              });
                            }}
                            placeholder="Venue"
                            className="text-sm"
                          />
                          <Input
                            value={exhibition.year}
                            onChange={(e) => {
                              const newExhibitions = [
                                ...portfolioData.exhibitions,
                              ];
                              newExhibitions[index] = {
                                ...exhibition,
                                year: e.target.value,
                              };
                              setPortfolioData({
                                ...portfolioData,
                                exhibitions: newExhibitions,
                              });
                            }}
                            placeholder="Year"
                            className="text-sm"
                          />
                          <Input
                            value={exhibition.link || ""}
                            onChange={(e) => {
                              const newExhibitions = [
                                ...portfolioData.exhibitions,
                              ];
                              newExhibitions[index] = {
                                ...exhibition,
                                link: e.target.value,
                              };
                              setPortfolioData({
                                ...portfolioData,
                                exhibitions: newExhibitions,
                              });
                            }}
                            placeholder="Link (optional)"
                            className="text-sm"
                          />
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setPortfolioData({
                            ...portfolioData,
                            exhibitions: [
                              ...portfolioData.exhibitions,
                              { title: "", venue: "", year: "", link: "" },
                            ],
                          });
                        }}
                      >
                        + Add Exhibition
                      </Button>
                    </>
                  ) : (
                    portfolioData.exhibitions.map((exhibition, index) => (
                      <div key={index} className="space-y-1">
                        <div className="font-medium text-sm">
                          {exhibition.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {exhibition.venue}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {exhibition.year}
                        </div>
                        {exhibition.link && (
                          <a
                            href={exhibition.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Exhibition
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Education */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      {portfolioData.education.map((edu, index) => (
                        <div
                          key={index}
                          className="space-y-2 p-3 border rounded-lg relative"
                        >
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={() => {
                              const newEducation =
                                portfolioData.education.filter(
                                  (_, i) => i !== index
                                );
                              setPortfolioData({
                                ...portfolioData,
                                education: newEducation,
                              });
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Input
                            value={edu.degree}
                            onChange={(e) => {
                              const newEducation = [...portfolioData.education];
                              newEducation[index] = {
                                ...edu,
                                degree: e.target.value,
                              };
                              setPortfolioData({
                                ...portfolioData,
                                education: newEducation,
                              });
                            }}
                            placeholder="Degree"
                            className="text-sm"
                          />
                          <Input
                            value={edu.institution}
                            onChange={(e) => {
                              const newEducation = [...portfolioData.education];
                              newEducation[index] = {
                                ...edu,
                                institution: e.target.value,
                              };
                              setPortfolioData({
                                ...portfolioData,
                                education: newEducation,
                              });
                            }}
                            placeholder="Institution"
                            className="text-sm"
                          />
                          <Input
                            value={edu.year}
                            onChange={(e) => {
                              const newEducation = [...portfolioData.education];
                              newEducation[index] = {
                                ...edu,
                                year: e.target.value,
                              };
                              setPortfolioData({
                                ...portfolioData,
                                education: newEducation,
                              });
                            }}
                            placeholder="Year"
                            className="text-sm"
                          />
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setPortfolioData({
                            ...portfolioData,
                            education: [
                              ...portfolioData.education,
                              { degree: "", institution: "", year: "" },
                            ],
                          });
                        }}
                      >
                        + Add Education
                      </Button>
                    </>
                  ) : (
                    portfolioData.education.map((edu, index) => (
                      <div key={index} className="space-y-1">
                        <div className="font-medium text-sm">{edu.degree}</div>
                        <div className="text-sm text-muted-foreground">
                          {edu.institution}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {edu.year}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Specialties */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Specialties
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {portfolioData.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Techniques */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="w-5 h-5" />
                    Techniques
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {portfolioData.techniques.map((technique, index) => (
                      <Badge key={index} variant="outline">
                        {technique}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Certifications & Badges */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {mockBadges.map((badge) => (
                      <div
                        key={badge.id}
                        className="relative group cursor-pointer"
                      >
                        <div className="aspect-square rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                          <Award className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute inset-0 bg-black/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                          <p className="text-white text-xs text-center">
                            {badge.skillsAchieved.join(", ")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Posts Tab */}
        <TabsContent value="posts">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {mockPosts.map((post) => (
              <div
                key={post.id}
                className="group relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
              >
                <ImageWithFallback
                  src={post.image}
                  alt={post.caption}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-4 text-white">
                    <div className="flex items-center gap-1">
                      <Heart className="w-5 h-5 fill-white" />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-5 h-5 fill-white" />
                      <span>{post.comments}</span>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm line-clamp-2">
                    {post.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Marketplace Tab */}
        <TabsContent value="marketplace">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketplaceItems.map((item) => (
              <Card
                key={item.id}
                className="group cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  {!item.available && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Badge variant="secondary" className="text-lg">
                        SOLD
                      </Badge>
                    </div>
                  )}
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.success("Added to favorites!");
                    }}
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-1 line-clamp-1">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold">
                      ${item.price.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{item.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{item.likes}</span>
                      </div>
                    </div>
                  </div>
                  {item.available ? (
                    <Button
                      className="w-full"
                      onClick={() => toast.success("Added to cart!")}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  ) : (
                    <Button className="w-full" variant="outline" disabled>
                      Sold Out
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
