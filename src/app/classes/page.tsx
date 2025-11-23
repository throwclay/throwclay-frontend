"use client";

import { useState } from "react";
import {
    Calendar,
    Clock,
    Users,
    MapPin,
    Star,
    BookOpen,
    ChevronRight,
    Filter,
    Search,
    CreditCard,
    CheckCircle,
    AlertCircle,
    XCircle,
    Eye,
    MessageCircle,
    Download,
    Phone,
    Mail,
    DollarSign,
    GraduationCap,
    Award,
    Target
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
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { toast } from "sonner";

interface ClassData {
    id: string;
    name: string;
    instructor: string;
    instructorImage?: string;
    studio: string;
    studioLocation: string;
    schedule: string;
    duration: string;
    startDate: string;
    endDate: string;
    level: string;
    capacity: number;
    enrolled: number;
    waitlist: number;
    price: number;
    status: "upcoming" | "in-progress" | "completed" | "cancelled";
    description: string;
    materials: string;
    prerequisites: string;
    whatYouLearn: string[];
    images: string[];
    thumbnail: string;
    rating: number;
    reviewCount: number;
    tags: string[];
    pricingTiers: PricingTier[];
    discountCodes: DiscountCode[];
    sessions?: ClassSession[];
    enrollment?: EnrollmentDetails;
}

interface PricingTier {
    id: string;
    name: string;
    price: number;
    description: string;
    isDefault: boolean;
}

interface DiscountCode {
    id: string;
    code: string;
    type: "percentage" | "fixed";
    value: number;
    description: string;
}

interface ClassSession {
    id: string;
    date: string;
    time: string;
    topic: string;
    attended: boolean;
    notes?: string;
}

interface EnrollmentDetails {
    enrollmentDate: string;
    pricingTier: string;
    amountPaid: number;
    paymentStatus: "paid" | "pending" | "overdue";
    attendanceRate: number;
    progressNotes: string;
}

export default function ArtistClasses() {
    const [activeClassTab, setActiveClassTab] = useState("available");
    const [selectedLocation, setSelectedLocation] = useState("all");
    const [classSearchTerm, setClassSearchTerm] = useState("");
    const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
    const [showEnrollDialog, setShowEnrollDialog] = useState(false);
    const [showClassDetails, setShowClassDetails] = useState(false);

    // Mock classes data
    const mockAvailableClasses: ClassData[] = [
        {
            id: "1",
            name: "Wheel Throwing Fundamentals",
            instructor: "Sarah Martinez",
            instructorImage: "https://images.unsplash.com/photo-1494790108755-2616b612b1d8?w=150",
            studio: "Clay Studio Downtown",
            studioLocation: "Downtown Portland, OR",
            schedule: "Tue & Thu, 6:00-8:00 PM",
            duration: "8 weeks",
            startDate: "2025-02-15",
            endDate: "2025-04-10",
            level: "Beginner",
            capacity: 12,
            enrolled: 8,
            waitlist: 2,
            price: 320,
            status: "upcoming",
            description:
                "Learn the fundamentals of wheel throwing in this comprehensive beginner course. Perfect for those new to pottery.",
            materials: "Clay, glazes, and basic tools included. Bring an apron.",
            prerequisites: "No experience required",
            whatYouLearn: [
                "Clay preparation and wedging techniques",
                "Centering clay on the wheel",
                "Basic pulling and shaping methods",
                "Trimming and finishing techniques",
                "Introduction to glazing"
            ],
            images: [
                "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800"
            ],
            thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
            rating: 4.8,
            reviewCount: 24,
            tags: ["beginner", "wheel", "pottery", "fundamentals"],
            pricingTiers: [
                {
                    id: "1",
                    name: "Early Bird",
                    price: 280,
                    description: "Save $40 with early registration",
                    isDefault: false
                },
                {
                    id: "2",
                    name: "Standard",
                    price: 320,
                    description: "Regular class price",
                    isDefault: true
                },
                {
                    id: "3",
                    name: "Premium",
                    price: 380,
                    description: "Includes take-home clay package",
                    isDefault: false
                }
            ],
            discountCodes: [
                {
                    id: "1",
                    code: "FIRSTTIME20",
                    type: "percentage",
                    value: 20,
                    description: "First-time student discount"
                }
            ]
        },
        {
            id: "2",
            name: "Advanced Glazing Workshop",
            instructor: "Michael Chen",
            instructorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
            studio: "Artisan Ceramics Studio",
            studioLocation: "Southeast Portland, OR",
            schedule: "Sat, 10:00 AM-1:00 PM",
            duration: "4 weeks",
            startDate: "2025-03-01",
            endDate: "2025-03-22",
            level: "Advanced",
            capacity: 8,
            enrolled: 6,
            waitlist: 0,
            price: 280,
            status: "upcoming",
            description:
                "Master advanced glazing techniques including layering, reduction firing, and custom glaze formulation.",
            materials: "Glazes, brushes, and test tiles provided",
            prerequisites: "Basic pottery experience required",
            whatYouLearn: [
                "Advanced glazing techniques",
                "Layering and blending methods",
                "Troubleshooting glaze defects",
                "Creating custom glaze recipes",
                "Reduction firing principles"
            ],
            images: ["https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800"],
            thumbnail: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400",
            rating: 4.9,
            reviewCount: 18,
            tags: ["advanced", "glazing", "workshop", "techniques"],
            pricingTiers: [
                {
                    id: "1",
                    name: "Standard",
                    price: 280,
                    description: "Workshop fee",
                    isDefault: true
                }
            ],
            discountCodes: []
        },
        {
            id: "3",
            name: "Handbuilding Essentials",
            instructor: "Emma Rodriguez",
            instructorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
            studio: "Northwest Clay Collective",
            studioLocation: "Northwest Portland, OR",
            schedule: "Wed, 7:00-9:00 PM",
            duration: "6 weeks",
            startDate: "2025-02-20",
            endDate: "2025-04-02",
            level: "All Levels",
            capacity: 15,
            enrolled: 12,
            waitlist: 3,
            price: 240,
            status: "upcoming",
            description:
                "Explore handbuilding techniques including coil, slab, and pinch methods for creating unique ceramic pieces.",
            materials: "Clay and tools provided",
            prerequisites: "None",
            whatYouLearn: [
                "Pinch pot techniques",
                "Coil building methods",
                "Slab construction",
                "Surface decoration",
                "Joining and finishing"
            ],
            images: ["https://images.unsplash.com/photo-1594736797933-d0c6ba7a6d48?w=800"],
            thumbnail: "https://images.unsplash.com/photo-1594736797933-d0c6ba7a6d48?w=400",
            rating: 4.7,
            reviewCount: 32,
            tags: ["handbuilding", "coil", "slab", "all-levels"],
            pricingTiers: [
                {
                    id: "1",
                    name: "Standard",
                    price: 240,
                    description: "Regular class price",
                    isDefault: true
                }
            ],
            discountCodes: []
        },
        {
            id: "4",
            name: "Pottery for Beginners",
            instructor: "David Park",
            instructorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
            studio: "Eastside Clay Works",
            studioLocation: "Southeast Portland, OR",
            schedule: "Mon & Wed, 7:00-9:00 PM",
            duration: "6 weeks",
            startDate: "2025-02-10",
            endDate: "2025-03-24",
            level: "Beginner",
            capacity: 10,
            enrolled: 7,
            waitlist: 1,
            price: 290,
            status: "upcoming",
            description:
                "A gentle introduction to pottery making, covering both wheel throwing and handbuilding basics.",
            materials: "All materials provided",
            prerequisites: "None - perfect for first-time students",
            whatYouLearn: [
                "Introduction to clay types and properties",
                "Basic handbuilding techniques",
                "Wheel throwing basics",
                "Surface decoration methods",
                "Firing and glazing overview"
            ],
            images: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800"],
            thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
            rating: 4.6,
            reviewCount: 28,
            tags: ["beginner", "pottery", "basics", "wheel", "handbuilding"],
            pricingTiers: [
                {
                    id: "1",
                    name: "Standard",
                    price: 290,
                    description: "Regular class price",
                    isDefault: true
                },
                {
                    id: "2",
                    name: "Student",
                    price: 250,
                    description: "Student discount available",
                    isDefault: false
                }
            ],
            discountCodes: [
                {
                    id: "1",
                    code: "STUDENT10",
                    type: "percentage",
                    value: 10,
                    description: "Student discount"
                }
            ]
        }
    ];

    const mockEnrolledClasses: ClassData[] = [
        {
            id: "5",
            name: "Beginner Pottery Series",
            instructor: "Sarah Martinez",
            instructorImage: "https://images.unsplash.com/photo-1494790108755-2616b612b1d8?w=150",
            studio: "Clay Studio Downtown",
            studioLocation: "Downtown Portland, OR",
            schedule: "Mon & Wed, 6:00-8:00 PM",
            duration: "8 weeks",
            startDate: "2025-01-08",
            endDate: "2025-03-03",
            level: "Beginner",
            capacity: 12,
            enrolled: 12,
            waitlist: 0,
            price: 300,
            status: "in-progress",
            description:
                "Introduction to pottery making covering basic techniques and fundamentals.",
            materials: "All materials included",
            prerequisites: "None",
            whatYouLearn: [
                "Basic clay preparation",
                "Simple throwing techniques",
                "Handbuilding basics",
                "Glazing introduction"
            ],
            images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800"],
            thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
            rating: 4.8,
            reviewCount: 15,
            tags: ["beginner", "pottery", "basics"],
            pricingTiers: [
                {
                    id: "1",
                    name: "Standard",
                    price: 300,
                    description: "Regular price",
                    isDefault: true
                }
            ],
            discountCodes: [],
            sessions: [
                {
                    id: "1",
                    date: "2025-01-08",
                    time: "6:00-8:00 PM",
                    topic: "Introduction to Clay",
                    attended: true,
                    notes: "Great first session! Learned about clay types."
                },
                {
                    id: "2",
                    date: "2025-01-10",
                    time: "6:00-8:00 PM",
                    topic: "Basic Pinch Pots",
                    attended: true,
                    notes: "Made my first pinch pot."
                },
                {
                    id: "3",
                    date: "2025-01-13",
                    time: "6:00-8:00 PM",
                    topic: "Coil Building",
                    attended: true
                },
                {
                    id: "4",
                    date: "2025-01-15",
                    time: "6:00-8:00 PM",
                    topic: "Wheel Introduction",
                    attended: false,
                    notes: "Missed due to work"
                },
                {
                    id: "5",
                    date: "2025-01-20",
                    time: "6:00-8:00 PM",
                    topic: "Centering Practice",
                    attended: true
                },
                {
                    id: "6",
                    date: "2025-01-22",
                    time: "6:00-8:00 PM",
                    topic: "Basic Pulling",
                    attended: true
                },
                {
                    id: "7",
                    date: "2025-01-27",
                    time: "6:00-8:00 PM",
                    topic: "Trimming Basics",
                    attended: false
                },
                {
                    id: "8",
                    date: "2025-01-29",
                    time: "6:00-8:00 PM",
                    topic: "Glazing Workshop",
                    attended: false
                }
            ],
            enrollment: {
                enrollmentDate: "2024-12-15",
                pricingTier: "Standard",
                amountPaid: 300,
                paymentStatus: "paid",
                attendanceRate: 75,
                progressNotes:
                    "Showing good progress with handbuilding. Needs more practice with wheel throwing."
            }
        }
    ];

    const mockCompletedClasses: ClassData[] = [
        {
            id: "6",
            name: "Introduction to Ceramics",
            instructor: "Emma Rodriguez",
            instructorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
            studio: "Northwest Clay Collective",
            studioLocation: "Northwest Portland, OR",
            schedule: "Sat, 10:00 AM-12:00 PM",
            duration: "4 weeks",
            startDate: "2024-11-02",
            endDate: "2024-11-23",
            level: "Beginner",
            capacity: 12,
            enrolled: 12,
            waitlist: 0,
            price: 200,
            status: "completed",
            description:
                "A short introduction to ceramic arts covering basic handbuilding techniques.",
            materials: "Clay and basic tools provided",
            prerequisites: "None",
            whatYouLearn: [
                "Basic clay properties",
                "Simple handbuilding",
                "Basic glazing",
                "Kiln firing basics"
            ],
            images: ["https://images.unsplash.com/photo-1594736797933-d0c6ba7a6d48?w=800"],
            thumbnail: "https://images.unsplash.com/photo-1594736797933-d0c6ba7a6d48?w=400",
            rating: 4.5,
            reviewCount: 12,
            tags: ["beginner", "ceramics", "handbuilding"],
            pricingTiers: [
                {
                    id: "1",
                    name: "Standard",
                    price: 200,
                    description: "Workshop price",
                    isDefault: true
                }
            ],
            discountCodes: [],
            sessions: [
                {
                    id: "1",
                    date: "2024-11-02",
                    time: "10:00 AM-12:00 PM",
                    topic: "Clay Basics",
                    attended: true
                },
                {
                    id: "2",
                    date: "2024-11-09",
                    time: "10:00 AM-12:00 PM",
                    topic: "Pinch Pots",
                    attended: true
                },
                {
                    id: "3",
                    date: "2024-11-16",
                    time: "10:00 AM-12:00 PM",
                    topic: "Glazing",
                    attended: true
                },
                {
                    id: "4",
                    date: "2024-11-23",
                    time: "10:00 AM-12:00 PM",
                    topic: "Final Projects",
                    attended: true
                }
            ],
            enrollment: {
                enrollmentDate: "2024-10-15",
                pricingTier: "Standard",
                amountPaid: 200,
                paymentStatus: "paid",
                attendanceRate: 100,
                progressNotes:
                    "Excellent attendance and enthusiasm. Completed all projects successfully."
            }
        }
    ];

    const studioLocations = [
        "All Locations",
        "Downtown Portland, OR",
        "Southeast Portland, OR",
        "Northwest Portland, OR",
        "Beaverton, OR",
        "Lake Oswego, OR"
    ];

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "upcoming":
                return <Badge variant="secondary">Upcoming</Badge>;
            case "in-progress":
                return <Badge variant="default">In Progress</Badge>;
            case "completed":
                return <Badge variant="outline">Completed</Badge>;
            case "cancelled":
                return <Badge variant="destructive">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPaymentStatusBadge = (status: string) => {
        switch (status) {
            case "paid":
                return (
                    <Badge
                        variant="default"
                        className="bg-green-500"
                    >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Paid
                    </Badge>
                );
            case "pending":
                return (
                    <Badge variant="secondary">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Pending
                    </Badge>
                );
            case "overdue":
                return (
                    <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" />
                        Overdue
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const filteredAvailableClasses = mockAvailableClasses.filter((cls) => {
        const matchesSearch =
            cls.name.toLowerCase().includes(classSearchTerm.toLowerCase()) ||
            cls.instructor.toLowerCase().includes(classSearchTerm.toLowerCase()) ||
            cls.studio.toLowerCase().includes(classSearchTerm.toLowerCase());
        const matchesLocation =
            selectedLocation === "all" || cls.studioLocation === selectedLocation;
        return matchesSearch && matchesLocation;
    });

    const handleEnrollInClass = (classData: ClassData) => {
        setSelectedClass(classData);
        setShowEnrollDialog(true);
    };

    const handleViewClassDetails = (classData: ClassData) => {
        setSelectedClass(classData);
        setShowClassDetails(true);
    };

    const handleEnrollment = () => {
        if (!selectedClass) return;
        toast.success(`Successfully enrolled in "${selectedClass.name}"!`);
        setShowEnrollDialog(false);
        setSelectedClass(null);
    };

    const renderStarRating = (rating: number) => {
        return (
            <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                ))}
                <span className="text-sm text-muted-foreground ml-1">({rating})</span>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-semibold">Classes</h1>
                <p className="text-muted-foreground">
                    Discover and enroll in pottery classes from studios in your area
                </p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Available Classes
                            </CardTitle>
                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{mockAvailableClasses.length}</div>
                        <p className="text-xs text-muted-foreground">Classes you can enroll in</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Enrolled Classes
                            </CardTitle>
                            <GraduationCap className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{mockEnrolledClasses.length}</div>
                        <p className="text-xs text-muted-foreground">Currently taking</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Completed Classes
                            </CardTitle>
                            <Award className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{mockCompletedClasses.length}</div>
                        <p className="text-xs text-muted-foreground">Successfully finished</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Overall Progress
                            </CardTitle>
                            <Target className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">75%</div>
                        <p className="text-xs text-muted-foreground">Average attendance rate</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs
                value={activeClassTab}
                onValueChange={setActiveClassTab}
                className="space-y-6"
            >
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="available">Available Classes</TabsTrigger>
                    <TabsTrigger value="enrolled">My Classes</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="progress">Progress</TabsTrigger>
                </TabsList>

                {/* Available Classes Tab */}
                <TabsContent
                    value="available"
                    className="space-y-6"
                >
                    {/* Search and Filters */}
                    <div className="flex items-center space-x-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search classes, instructors, or studios..."
                                value={classSearchTerm}
                                onChange={(e) => setClassSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select
                            value={selectedLocation}
                            onValueChange={setSelectedLocation}
                        >
                            <SelectTrigger className="w-64">
                                <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                                {studioLocations.map((location, index) => (
                                    <SelectItem
                                        key={index}
                                        value={index === 0 ? "all" : location}
                                    >
                                        {location}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline">
                            <Filter className="w-4 h-4 mr-2" />
                            More Filters
                        </Button>
                    </div>

                    {/* Available Classes Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAvailableClasses.map((classData) => (
                            <Card
                                key={classData.id}
                                className="overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="aspect-video bg-muted relative">
                                    <ImageWithFallback
                                        src={classData.thumbnail}
                                        alt={classData.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 right-2 flex space-x-1">
                                        <Badge variant="secondary">{classData.level}</Badge>
                                        {getStatusBadge(classData.status)}
                                    </div>
                                </div>

                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">{classData.name}</CardTitle>
                                    <div className="flex items-center space-x-2">
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src={classData.instructorImage} />
                                            <AvatarFallback className="text-xs">
                                                {getInitials(classData.instructor)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">
                                                {classData.instructor}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {classData.studio}
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-0 space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            {classData.schedule}
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Clock className="w-4 h-4 mr-2" />
                                            {classData.duration}
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            {classData.studioLocation}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {renderStarRating(classData.rating)}
                                        <p className="text-sm text-muted-foreground">
                                            {classData.reviewCount} reviews
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2">
                                                <Users className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm">
                                                    {classData.enrolled}/{classData.capacity}{" "}
                                                    enrolled
                                                </span>
                                            </div>
                                            {classData.waitlist > 0 && (
                                                <p className="text-xs text-muted-foreground">
                                                    {classData.waitlist} on waitlist
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-semibold">
                                                ${classData.price}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                per class
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        <Button
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleEnrollInClass(classData)}
                                            disabled={classData.enrolled >= classData.capacity}
                                        >
                                            {classData.enrolled >= classData.capacity
                                                ? "Join Waitlist"
                                                : "Enroll Now"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleViewClassDetails(classData)}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {filteredAvailableClasses.length === 0 && (
                        <div className="text-center py-12">
                            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-medium mb-2">No classes found</h3>
                            <p className="text-muted-foreground">
                                Try adjusting your search or filter criteria
                            </p>
                        </div>
                    )}
                </TabsContent>

                {/* Enrolled Classes Tab */}
                <TabsContent
                    value="enrolled"
                    className="space-y-6"
                >
                    {mockEnrolledClasses.length > 0 ? (
                        <div className="space-y-6">
                            {mockEnrolledClasses.map((classData) => (
                                <Card key={classData.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-16 h-16 rounded-lg overflow-hidden">
                                                    <ImageWithFallback
                                                        src={classData.thumbnail}
                                                        alt={classData.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <CardTitle className="text-xl">
                                                        {classData.name}
                                                    </CardTitle>
                                                    <p className="text-muted-foreground">
                                                        {classData.instructor} • {classData.studio}
                                                    </p>
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusBadge(classData.status)}
                                                        {classData.enrollment &&
                                                            getPaymentStatusBadge(
                                                                classData.enrollment.paymentStatus
                                                            )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right space-y-2">
                                                <div className="text-lg font-semibold">
                                                    ${classData.enrollment?.amountPaid}
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleViewClassDetails(classData)
                                                    }
                                                >
                                                    View Details
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-3">
                                                <h4 className="font-medium">Class Schedule</h4>
                                                <div className="space-y-2 text-sm text-muted-foreground">
                                                    <div className="flex items-center">
                                                        <Calendar className="w-4 h-4 mr-2" />
                                                        {classData.schedule}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Clock className="w-4 h-4 mr-2" />
                                                        {classData.startDate} - {classData.endDate}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <MapPin className="w-4 h-4 mr-2" />
                                                        {classData.studioLocation}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="font-medium">Progress</h4>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span>Attendance Rate</span>
                                                        <span>
                                                            {classData.enrollment?.attendanceRate}%
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={classData.enrollment?.attendanceRate}
                                                        className="h-2"
                                                    />
                                                    <div className="text-xs text-muted-foreground">
                                                        {
                                                            classData.sessions?.filter(
                                                                (s) => s.attended
                                                            ).length
                                                        }{" "}
                                                        of {classData.sessions?.length} sessions
                                                        attended
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="font-medium">Quick Actions</h4>
                                                <div className="flex flex-col space-y-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        <MessageCircle className="w-4 h-4 mr-2" />
                                                        Message Instructor
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Download Materials
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {classData.enrollment?.progressNotes && (
                                            <div className="p-4 bg-muted rounded-lg">
                                                <h5 className="font-medium mb-2">
                                                    Instructor Notes
                                                </h5>
                                                <p className="text-sm text-muted-foreground">
                                                    {classData.enrollment.progressNotes}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-medium mb-2">No enrolled classes</h3>
                            <p className="text-muted-foreground mb-4">
                                You're not currently enrolled in any classes
                            </p>
                            <Button onClick={() => setActiveClassTab("available")}>
                                Browse Available Classes
                            </Button>
                        </div>
                    )}
                </TabsContent>

                {/* Completed Classes Tab */}
                <TabsContent
                    value="completed"
                    className="space-y-6"
                >
                    {mockCompletedClasses.length > 0 ? (
                        <div className="space-y-6">
                            {mockCompletedClasses.map((classData) => (
                                <Card key={classData.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-16 h-16 rounded-lg overflow-hidden">
                                                    <ImageWithFallback
                                                        src={classData.thumbnail}
                                                        alt={classData.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <CardTitle className="text-xl">
                                                        {classData.name}
                                                    </CardTitle>
                                                    <p className="text-muted-foreground">
                                                        {classData.instructor} • {classData.studio}
                                                    </p>
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusBadge(classData.status)}
                                                        <Badge variant="outline">
                                                            <Award className="w-3 h-3 mr-1" />
                                                            Certificate Earned
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right space-y-2">
                                                <div className="text-lg font-semibold">
                                                    100% Complete
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleViewClassDetails(classData)
                                                    }
                                                >
                                                    View Certificate
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <h4 className="font-medium">Class Period</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {classData.startDate} - {classData.endDate}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="font-medium">Final Attendance</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {classData.enrollment?.attendanceRate}%
                                                    attendance rate
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="font-medium">Skills Learned</h4>
                                                <div className="flex flex-wrap gap-1">
                                                    {classData.tags.slice(0, 3).map((tag) => (
                                                        <Badge
                                                            key={tag}
                                                            variant="secondary"
                                                            className="text-xs capitalize"
                                                        >
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {classData.enrollment?.progressNotes && (
                                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                                <h5 className="font-medium mb-2 text-green-900">
                                                    Final Assessment
                                                </h5>
                                                <p className="text-sm text-green-700">
                                                    {classData.enrollment.progressNotes}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-medium mb-2">No completed classes yet</h3>
                            <p className="text-muted-foreground">
                                Complete your enrolled classes to see them here
                            </p>
                        </div>
                    )}
                </TabsContent>

                {/* Progress Tab */}
                <TabsContent
                    value="progress"
                    className="space-y-6"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Overall Progress</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Classes Completed</span>
                                        <span>
                                            {mockCompletedClasses.length}/
                                            {mockEnrolledClasses.length +
                                                mockCompletedClasses.length}
                                        </span>
                                    </div>
                                    <Progress
                                        value={
                                            (mockCompletedClasses.length /
                                                (mockEnrolledClasses.length +
                                                    mockCompletedClasses.length)) *
                                            100
                                        }
                                        className="h-2"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Total Attendance</span>
                                        <span>75%</span>
                                    </div>
                                    <Progress
                                        value={75}
                                        className="h-2"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Skills Learned</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Pinch Pots</span>
                                        <Badge variant="default">Completed</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Coil Building</span>
                                        <Badge variant="default">Completed</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Wheel Throwing</span>
                                        <Badge variant="secondary">In Progress</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Glazing</span>
                                        <Badge variant="outline">Not Started</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Goals</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <Target className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm">Complete beginner series</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Target className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm">Learn glazing techniques</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Target className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm">Create first bowl</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Learning Journey</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4 p-4 border rounded-lg">
                                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium">Introduction to Ceramics</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Completed Nov 23, 2024 • 4 weeks
                                        </p>
                                    </div>
                                    <Badge variant="default">100%</Badge>
                                </div>

                                <div className="flex items-center space-x-4 p-4 border rounded-lg">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Clock className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium">Beginner Pottery Series</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Started Jan 8, 2025 • 8 weeks
                                        </p>
                                    </div>
                                    <Badge variant="secondary">75%</Badge>
                                </div>

                                <div className="flex items-center space-x-4 p-4 border rounded-lg opacity-50">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium">Advanced Glazing Workshop</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Planning to enroll • 4 weeks
                                        </p>
                                    </div>
                                    <Badge variant="outline">Planned</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Enrollment Dialog */}
            <Dialog
                open={showEnrollDialog}
                onOpenChange={setShowEnrollDialog}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Enroll in {selectedClass?.name}</DialogTitle>
                        <DialogDescription>
                            Complete your enrollment for this class
                        </DialogDescription>
                    </DialogHeader>

                    {selectedClass && (
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-20 h-20 rounded-lg overflow-hidden">
                                    <ImageWithFallback
                                        src={selectedClass.thumbnail}
                                        alt={selectedClass.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">{selectedClass.name}</h3>
                                    <p className="text-muted-foreground">
                                        {selectedClass.instructor}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedClass.studio}
                                    </p>
                                    <div className="flex items-center space-x-2 mt-2">
                                        <Badge variant="secondary">{selectedClass.level}</Badge>
                                        {renderStarRating(selectedClass.rating)}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">Schedule</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedClass.schedule}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Duration</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedClass.duration}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Start Date</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedClass.startDate}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Location</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedClass.studioLocation}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm font-medium">Pricing Options</Label>
                                <div className="space-y-2">
                                    {selectedClass.pricingTiers.map((tier) => (
                                        <div
                                            key={tier.id}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium">{tier.name}</span>
                                                    {tier.isDefault && (
                                                        <Badge variant="secondary">Popular</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {tier.description}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold">${tier.price}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowEnrollDialog(false)}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleEnrollment}>
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Enroll & Pay
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Class Details Dialog */}
            <Dialog
                open={showClassDetails}
                onOpenChange={setShowClassDetails}
            >
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedClass?.name}</DialogTitle>
                        <DialogDescription>
                            Complete class details and information
                        </DialogDescription>
                    </DialogHeader>

                    {selectedClass && (
                        <div className="space-y-6">
                            <div className="aspect-video rounded-lg overflow-hidden">
                                <ImageWithFallback
                                    src={selectedClass.thumbnail}
                                    alt={selectedClass.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold mb-2">Class Description</h3>
                                        <p className="text-muted-foreground">
                                            {selectedClass.description}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2">What You'll Learn</h3>
                                        <ul className="space-y-1">
                                            {selectedClass.whatYouLearn.map((item, index) => (
                                                <li
                                                    key={index}
                                                    className="flex items-center text-sm text-muted-foreground"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2">Materials</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedClass.materials}
                                        </p>
                                    </div>

                                    {selectedClass.prerequisites && (
                                        <div>
                                            <h3 className="font-semibold mb-2">Prerequisites</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedClass.prerequisites}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold mb-2">Instructor</h3>
                                        <div className="flex items-center space-x-3">
                                            <Avatar className="w-12 h-12">
                                                <AvatarImage src={selectedClass.instructorImage} />
                                                <AvatarFallback>
                                                    {getInitials(selectedClass.instructor)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">
                                                    {selectedClass.instructor}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {selectedClass.studio}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2">Class Details</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Level:
                                                </span>
                                                <span>{selectedClass.level}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Duration:
                                                </span>
                                                <span>{selectedClass.duration}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Schedule:
                                                </span>
                                                <span>{selectedClass.schedule}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Capacity:
                                                </span>
                                                <span>
                                                    {selectedClass.enrolled}/
                                                    {selectedClass.capacity}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Location:
                                                </span>
                                                <span>{selectedClass.studioLocation}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2">Rating & Reviews</h3>
                                        <div className="space-y-2">
                                            {renderStarRating(selectedClass.rating)}
                                            <p className="text-sm text-muted-foreground">
                                                Based on {selectedClass.reviewCount} student reviews
                                            </p>
                                        </div>
                                    </div>

                                    {/* Show session details if enrolled */}
                                    {selectedClass.sessions && (
                                        <div>
                                            <h3 className="font-semibold mb-2">Class Sessions</h3>
                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                {selectedClass.sessions.map((session) => (
                                                    <div
                                                        key={session.id}
                                                        className="flex items-center justify-between p-2 border rounded text-sm"
                                                    >
                                                        <div>
                                                            <p className="font-medium">
                                                                {session.topic}
                                                            </p>
                                                            <p className="text-muted-foreground">
                                                                {session.date} • {session.time}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            {session.attended ? (
                                                                <Badge variant="default">
                                                                    Attended
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline">
                                                                    Missed
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowClassDetails(false)}
                                >
                                    Close
                                </Button>
                                {!selectedClass.sessions && (
                                    <Button
                                        onClick={() => {
                                            setShowClassDetails(false);
                                            handleEnrollInClass(selectedClass);
                                        }}
                                    >
                                        Enroll in Class
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
