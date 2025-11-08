import { useState } from "react";
import {
  User,
  Camera,
  Edit,
  Save,
  ExternalLink,
  Instagram,
  Globe,
  Twitter,
  Facebook,
  Trophy,
  Award,
  Star,
  Grid3X3,
  Heart,
  MessageCircle,
  Share,
  Settings,
  MoreHorizontal,
  MapPin,
  Calendar,
  Users,
  Copy,
  Check,
  ShoppingBag,
  GraduationCap,
  BookOpen,
  Clock,
  DollarSign,
  Phone,
  Mail,
  Navigation,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { AspectRatio } from "./ui/aspect-ratio";
import { Skeleton } from "./ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { BadgeManagement } from "./BadgeManagement";
import type {
  User as UserType,
  ArtistProfile as ArtistProfileType,
  StudentBadge,
} from "@/types";

import { toast } from "sonner";

interface ArtistProfileProps {
  currentUser: UserType | null;
  onProfileUpdated?: (user: UserType) => void;
}

export function ArtistProfile({
  currentUser,
  onProfileUpdated,
}: ArtistProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState<string | null>(null);
  const [editedProfile, setEditedProfile] = useState<ArtistProfileType>(
    currentUser?.profile || {
      bio: "",
      socialMedia: {},
      branding: {
        primaryColor: "#030213",
      },
    }
  );

  // Mock badges data - in real app would come from API
  const mockBadges: StudentBadge[] = [
    {
      id: "badge_1",
      badgeId: "badge_wheel_mastery",
      classId: "class_1",
      studentId: currentUser?.id || "student_1",
      studentName: currentUser?.name || "Student",
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
      instructorNotes:
        "Excellent progress throughout the course. Mastered wheel throwing fundamentals with exceptional attention to detail.",
      displayOnProfile: true,
    },
    {
      id: "badge_2",
      badgeId: "badge_glazing_expert",
      classId: "class_2",
      studentId: currentUser?.id || "student_1",
      studentName: currentUser?.name || "Student",
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
        "Demonstrated advanced understanding of glaze chemistry and application techniques.",
      displayOnProfile: true,
    },
  ];

  // Mock posts data for Instagram-like grid
  const mockPosts = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
      likes: 124,
      comments: 18,
      title: "Morning wheel session with our intermediate students",
      date: "2025-01-10",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1465408953385-7c4627c2d4a6?w=400&h=400&fit=crop",
      likes: 89,
      comments: 12,
      title: "Exploring new glaze combinations in our test kiln",
      date: "2025-01-08",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1595475116879-45f4495e6db5?w=400&h=400&fit=crop",
      likes: 156,
      comments: 24,
      title: "Fresh pieces from our weekend intensive workshop",
      date: "2025-01-06",
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1593826988276-b9d8e3b74282?w=400&h=400&fit=crop",
      likes: 67,
      comments: 8,
      title: "Behind the scenes: Loading the large reduction kiln",
      date: "2025-01-05",
    },
    {
      id: 5,
      image:
        "https://images.unsplash.com/photo-1543254382-96cd0c0b8746?w=400&h=400&fit=crop",
      likes: 203,
      comments: 31,
      title: "Student showcase: Amazing texture work by Lisa",
      date: "2025-01-03",
    },
    {
      id: 6,
      image:
        "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop",
      likes: 112,
      comments: 15,
      title: "Raku firing session - always magical results",
      date: "2025-01-01",
    },
  ];

  // Mock shop items for studio
  const mockShopItems = [
    {
      id: 1,
      name: "Handcrafted Ceramic Bowl",
      price: 45,
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop",
      artist: "Sarah Martinez",
      inStock: true,
    },
    {
      id: 2,
      name: "Glazed Pottery Mug Set",
      price: 65,
      image:
        "https://images.unsplash.com/photo-1465408953385-7c4627c2d4a6?w=300&h=300&fit=crop",
      artist: "Mike Chen",
      inStock: true,
    },
    {
      id: 3,
      name: "Decorative Vase - Blue Glaze",
      price: 89,
      image:
        "https://images.unsplash.com/photo-1595475116879-45f4495e6db5?w=300&h=300&fit=crop",
      artist: "Elena Rodriguez",
      inStock: false,
    },
    {
      id: 4,
      name: "Ceramic Planter Set",
      price: 120,
      image:
        "https://images.unsplash.com/photo-1593826988276-b9d8e3b74282?w=300&h=300&fit=crop",
      artist: "David Kim",
      inStock: true,
    },
    {
      id: 5,
      name: "Artisan Dinner Plates",
      price: 180,
      image:
        "https://images.unsplash.com/photo-1543254382-96cd0c0b8746?w=300&h=300&fit=crop",
      artist: "Lisa Park",
      inStock: true,
    },
    {
      id: 6,
      name: "Raku Fired Bowl",
      price: 95,
      image:
        "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=300&h=300&fit=crop",
      artist: "Tom Wilson",
      inStock: true,
    },
  ];

  // Mock classes for studio
  const mockClasses = [
    {
      id: 1,
      name: "Beginner Wheel Throwing",
      description:
        "Learn the fundamentals of wheel throwing in our comprehensive 6-week course.",
      price: 280,
      duration: "6 weeks",
      level: "Beginner",
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop",
      instructor: "Sarah Martinez",
      schedule: "Thursdays 7-9 PM",
      spotsLeft: 3,
    },
    {
      id: 2,
      name: "Advanced Glazing Techniques",
      description:
        "Explore advanced glazing methods including layering, crystalline, and reduction techniques.",
      price: 320,
      duration: "4 weeks",
      level: "Advanced",
      image:
        "https://images.unsplash.com/photo-1465408953385-7c4627c2d4a6?w=400&h=250&fit=crop",
      instructor: "Mike Chen",
      schedule: "Saturdays 10 AM-1 PM",
      spotsLeft: 5,
    },
    {
      id: 3,
      name: "Handbuilding Intensive",
      description:
        "Master coil, slab, and pinch techniques in this hands-on workshop series.",
      price: 350,
      duration: "5 weeks",
      level: "Intermediate",
      image:
        "https://images.unsplash.com/photo-1595475116879-45f4495e6db5?w=400&h=250&fit=crop",
      instructor: "Elena Rodriguez",
      schedule: "Tuesdays 6-8:30 PM",
      spotsLeft: 2,
    },
  ];

  // Mock blog posts for studio
  const mockBlogPosts = [
    {
      id: 1,
      title: "The Art of Raku Firing: Ancient Techniques for Modern Pottery",
      excerpt:
        "Discover the magical process of raku firing and how it creates unique, unpredictable glazes that have captivated ceramicists for centuries.",
      image:
        "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=250&fit=crop",
      author: "Sarah Martinez",
      date: "2025-01-08",
      readTime: "8 min read",
      category: "Techniques",
    },
    {
      id: 2,
      title: "Choosing the Right Clay Body for Your Project",
      excerpt:
        "Understanding the different properties of clay bodies and how to select the perfect one for your specific pottery goals.",
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop",
      author: "Mike Chen",
      date: "2025-01-05",
      readTime: "6 min read",
      category: "Materials",
    },
    {
      id: 3,
      title: "Studio Spotlight: Student Success Stories",
      excerpt:
        "Meet some of our amazing students and learn about their pottery journeys, from first wheel session to confident ceramic artists.",
      image:
        "https://images.unsplash.com/photo-1543254382-96cd0c0b8746?w=400&h=250&fit=crop",
      author: "Elena Rodriguez",
      date: "2025-01-03",
      readTime: "10 min read",
      category: "Community",
    },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleSave = () => {
    if (!currentUser) return;

    const updatedUser: User = {
      ...currentUser,
      profile: editedProfile,
    };

    // bubble up to parent (Home) so it can store this in state
    onProfileUpdated?.(updatedUser);

    setIsEditing(false);
    toast.success("Profile updated successfully");
  };

  const handleCancel = () => {
    setEditedProfile(
      currentUser?.profile || {
        bio: "",
        socialMedia: {},
        branding: { primaryColor: "#030213" },
      }
    );
    setIsEditing(false);
  };

  const getSocialIcon = (platform: string) => {
    const iconClass = "w-5 h-5";
    switch (platform) {
      case "instagram":
        return <Instagram className={iconClass} />;
      case "twitter":
        return <Twitter className={iconClass} />;
      case "facebook":
        return <Facebook className={iconClass} />;
      case "website":
        return <Globe className={iconClass} />;
      default:
        return <ExternalLink className={iconClass} />;
    }
  };

  const getSocialUrl = (platform: string, value: string) => {
    switch (platform) {
      case "instagram":
        return `https://instagram.com/${value.replace("@", "")}`;
      case "twitter":
        return `https://twitter.com/${value.replace("@", "")}`;
      case "facebook":
        return value.startsWith("http")
          ? value
          : `https://facebook.com/${value}`;
      case "website":
        return value.startsWith("http") ? value : `https://${value}`;
      default:
        return value;
    }
  };

  const copyBadgeUrl = (badge: StudentBadge) => {
    const badgeUrl = `${window.location.origin}/badge/${badge.verificationCode}`;
    navigator.clipboard.writeText(badgeUrl);
    setCopiedBadge(badge.id);
    setTimeout(() => setCopiedBadge(null), 2000);
    toast.success("Badge URL copied to clipboard");
  };

  if (!currentUser) {
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

  const isStudio = currentUser.type === "studio";

  return (
    <TooltipProvider>
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-b from-background to-background/80 border-b">
          <div className="p-4 md:p-8">
            {/* Profile Header */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-12 space-y-8 lg:space-y-0">
              {/* Profile Picture */}
              <div className="flex justify-center lg:justify-start">
                <div className="relative group">
                  <Avatar className="w-40 h-40 border-4 border-background shadow-xl">
                    <AvatarImage
                      src={editedProfile.profileImage}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-primary/20 to-secondary/20">
                      {getInitials(currentUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-6">
                {/* Top Row - Name and Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-light tracking-tight">
                      {currentUser.name}
                    </h1>
                    <p className="text-muted-foreground">
                      @{currentUser.handle}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    {!isEditing ? (
                      <>
                        {isStudio ? (
                          <Button className="flex-1 sm:flex-none">
                            <Phone className="w-4 h-4 mr-2" />
                            Contact Studio
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            onClick={() => setIsEditing(true)}
                            className="flex-1 sm:flex-none"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Profile
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Share className="w-4 h-4 mr-2" />
                              Share Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Profile URL
                            </DropdownMenuItem>
                            {isStudio && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Navigation className="w-4 h-4 mr-2" />
                                  Get Directions
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" onClick={handleCancel}>
                          Cancel
                        </Button>
                        <Button onClick={handleSave}>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex justify-center lg:justify-start">
                  <div className="flex space-x-8 md:space-x-12">
                    <div className="text-center">
                      <div className="text-xl md:text-2xl font-semibold">
                        {mockPosts.length}
                      </div>
                      <div className="text-sm text-muted-foreground">posts</div>
                    </div>
                    {isStudio ? (
                      <>
                        <div className="text-center">
                          <div className="text-xl md:text-2xl font-semibold">
                            250+
                          </div>
                          <div className="text-sm text-muted-foreground">
                            members
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl md:text-2xl font-semibold">
                            12
                          </div>
                          <div className="text-sm text-muted-foreground">
                            classes
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl md:text-2xl font-semibold">
                            4.9
                          </div>
                          <div className="text-sm text-muted-foreground">
                            rating
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-center">
                          <div className="text-xl md:text-2xl font-semibold">
                            2.8k
                          </div>
                          <div className="text-sm text-muted-foreground">
                            followers
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl md:text-2xl font-semibold">
                            312
                          </div>
                          <div className="text-sm text-muted-foreground">
                            following
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Bio and Details */}
                <div className="space-y-4">
                  {/* Badges and Type */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {isStudio ? "Pottery Studio" : "Artist"}
                    </Badge>
                    {currentUser.subscription && (
                      <Badge variant="secondary" className="text-xs capitalize">
                        {currentUser.subscription === "free"
                          ? "Free"
                          : currentUser.subscription === "passion"
                          ? "Passion"
                          : currentUser.subscription === "small-artist"
                          ? "Artist"
                          : "Studio Pro"}
                      </Badge>
                    )}
                    {!isStudio &&
                      mockBadges.filter((b) => b.status === "active").length >
                        0 && (
                        <Badge
                          variant="default"
                          className="flex items-center space-x-1 text-xs"
                        >
                          <Trophy className="w-3 h-3" />
                          <span>
                            {
                              mockBadges.filter((b) => b.status === "active")
                                .length
                            }
                          </span>
                        </Badge>
                      )}
                  </div>

                  {/* Bio */}
                  {isEditing ? (
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-sm">
                        Bio
                      </Label>
                      <Textarea
                        id="bio"
                        value={editedProfile.bio}
                        onChange={(e) =>
                          setEditedProfile((prev) => ({
                            ...prev,
                            bio: e.target.value,
                          }))
                        }
                        placeholder={
                          isStudio
                            ? "Tell people about your studio..."
                            : "Tell people about your pottery journey..."
                        }
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {editedProfile.bio ||
                          (isStudio
                            ? "A welcoming pottery studio offering classes for all skill levels. Join our community of ceramic artists and discover the joy of working with clay! 🏺"
                            : "Passionate ceramic artist exploring traditional and contemporary techniques. 🏺✨")}
                      </p>
                      {/* Studio Info */}
                      {isStudio && (
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>Portland, OR</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Est. 2018</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Mon-Sat 9AM-9PM</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="w-4 h-4" />
                            <span>(503) 555-0123</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Social Links */}
                  <div className="flex space-x-4">
                    {Object.entries(editedProfile.socialMedia)
                      .filter(([_, value]) => value)
                      .map(([platform, value]) => (
                        <Tooltip key={platform}>
                          <TooltipTrigger asChild>
                            <a
                              href={getSocialUrl(platform, value)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-accent rounded-lg"
                            >
                              {getSocialIcon(platform)}
                            </a>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="capitalize">{platform}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <div className="border-b bg-background/80 backdrop-blur-sm sticky top-16 z-10">
            <div className="px-4 md:px-8">
              <TabsList className="bg-transparent border-none h-auto p-0 w-full justify-center">
                <TabsTrigger
                  value="posts"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary rounded-none px-6 py-4 text-sm font-medium"
                >
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  POSTS
                </TabsTrigger>
                {isStudio ? (
                  <>
                    <TabsTrigger
                      value="shop"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary rounded-none px-6 py-4 text-sm font-medium"
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      SHOP
                    </TabsTrigger>
                    <TabsTrigger
                      value="classes"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary rounded-none px-6 py-4 text-sm font-medium"
                    >
                      <GraduationCap className="w-4 h-4 mr-2" />
                      CLASSES
                    </TabsTrigger>
                    <TabsTrigger
                      value="blog"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary rounded-none px-6 py-4 text-sm font-medium"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      BLOG
                    </TabsTrigger>
                  </>
                ) : (
                  <TabsTrigger
                    value="badges"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary rounded-none px-6 py-4 text-sm font-medium"
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    BADGES (
                    {mockBadges.filter((b) => b.status === "active").length})
                  </TabsTrigger>
                )}
              </TabsList>
            </div>
          </div>

          {/* Posts Grid */}
          <TabsContent value="posts" className="mt-0 p-4 md:p-8">
            {mockPosts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1 md:gap-4">
                {mockPosts.map((post) => (
                  <Dialog key={post.id}>
                    <DialogTrigger asChild>
                      <div className="aspect-square relative group cursor-pointer overflow-hidden rounded-lg md:rounded-xl">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-6">
                          <div className="flex items-center text-white font-semibold">
                            <Heart className="w-5 h-5 mr-2" />
                            <span>{post.likes}</span>
                          </div>
                          <div className="flex items-center text-white font-semibold">
                            <MessageCircle className="w-5 h-5 mr-2" />
                            <span>{post.comments}</span>
                          </div>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl p-0">
                      <div className="grid md:grid-cols-2 h-[80vh]">
                        <div className="relative">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-6 flex flex-col">
                          <DialogHeader>
                            <DialogTitle className="flex items-center space-x-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={editedProfile.profileImage} />
                                <AvatarFallback className="text-xs">
                                  {getInitials(currentUser.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{currentUser.name}</span>
                            </DialogTitle>
                          </DialogHeader>
                          <div className="flex-1 mt-4 space-y-2">
                            <p className="text-sm font-medium">{post.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {post.date}
                            </p>
                          </div>
                          <div className="border-t pt-4 mt-4">
                            <div className="flex items-center justify-between">
                              <div className="flex space-x-4">
                                <Button variant="ghost" size="sm">
                                  <Heart className="w-4 h-4 mr-2" />
                                  {post.likes}
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  {post.comments}
                                </Button>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Share className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 space-y-6">
                <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <Camera className="w-12 h-12 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">No Posts Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Start sharing your pottery journey! Upload photos of your
                    latest creations and connect with the community.
                  </p>
                </div>
                <Button>
                  <Camera className="w-4 h-4 mr-2" />
                  Create Your First Post
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Shop Tab (Studio Only) */}
          {isStudio && (
            <TabsContent value="shop" className="mt-0 p-4 md:p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Studio Shop</h2>
                  <Button variant="outline">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    View All Items
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockShopItems.map((item) => (
                    <Card
                      key={item.id}
                      className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
                    >
                      <div className="aspect-square relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        {!item.inStock && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Badge variant="secondary">Sold Out</Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium text-sm mb-1">
                          {item.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2">
                          by {item.artist}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">${item.price}</span>
                          <Button size="sm" disabled={!item.inStock}>
                            {item.inStock ? "Add to Cart" : "Sold Out"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}

          {/* Classes Tab (Studio Only) */}
          {isStudio && (
            <TabsContent value="classes" className="mt-0 p-4 md:p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Available Classes</h2>
                  <Button variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    View Schedule
                  </Button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {mockClasses.map((classItem) => (
                    <Card key={classItem.id} className="overflow-hidden">
                      <div className="md:flex">
                        <div className="md:w-1/3">
                          <AspectRatio ratio={4 / 3}>
                            <img
                              src={classItem.image}
                              alt={classItem.name}
                              className="w-full h-full object-cover"
                            />
                          </AspectRatio>
                        </div>
                        <CardContent className="md:w-2/3 p-6">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold">
                                  {classItem.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {classItem.instructor}
                                </p>
                              </div>
                              <Badge variant="outline">{classItem.level}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {classItem.description}
                            </p>
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{classItem.duration}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{classItem.schedule}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-semibold text-lg">
                                  ${classItem.price}
                                </span>
                                <p className="text-xs text-muted-foreground">
                                  {classItem.spotsLeft} spots left
                                </p>
                              </div>
                              <Button>Enroll Now</Button>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}

          {/* Blog Tab (Studio Only) */}
          {isStudio && (
            <TabsContent value="blog" className="mt-0 p-4 md:p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Studio Blog</h2>
                  <Button variant="outline">
                    <BookOpen className="w-4 h-4 mr-2" />
                    View All Posts
                  </Button>
                </div>
                <div className="space-y-6">
                  {mockBlogPosts.map((post) => (
                    <Card
                      key={post.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <div className="md:flex">
                        <div className="md:w-1/3">
                          <AspectRatio ratio={16 / 9}>
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          </AspectRatio>
                        </div>
                        <CardContent className="md:w-2/3 p-6">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary">{post.category}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {post.readTime}
                              </span>
                            </div>
                            <h3 className="text-xl font-semibold hover:text-primary transition-colors">
                              {post.title}
                            </h3>
                            <p className="text-muted-foreground">
                              {post.excerpt}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <span>by {post.author}</span>
                                <span>•</span>
                                <span>
                                  {new Date(post.date).toLocaleDateString()}
                                </span>
                              </div>
                              <Button variant="ghost" size="sm">
                                Read More
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}

          {/* Badges Tab (Artist Only) */}
          {!isStudio && (
            <TabsContent value="badges" className="mt-4 p-4 md:p-8">
              {mockBadges.length > 0 ? (
                <div className="space-y-6">
                  {/* Featured Badges */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {mockBadges.slice(0, 4).map((badge) => (
                      <Card key={badge.id} className="relative overflow-hidden">
                        <CardContent className="p-4 text-center space-y-3">
                          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                            <Trophy className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">
                              Badge Earned
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              Grade: {badge.finalGrade}% • Attendance:{" "}
                              {badge.finalAttendance}%
                            </p>
                          </div>
                          <div className="flex space-x-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyBadgeUrl(badge)}
                                  className="flex-1"
                                >
                                  {copiedBadge === badge.id ? (
                                    <Check className="w-3 h-3" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy verification URL</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex-1"
                                >
                                  <Share className="w-3 h-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Share badge</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Skills Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Star className="w-5 h-5" />
                        <span>Skills Mastered</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(
                          new Set(mockBadges.flatMap((b) => b.skillsAchieved))
                        ).map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="capitalize"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-16 space-y-6">
                  <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <Trophy className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">No Badges Yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Complete classes and achieve learning milestones to earn
                      badges that showcase your pottery skills.
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
