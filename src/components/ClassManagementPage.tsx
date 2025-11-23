import { useState } from "react";
import {
    ArrowLeft,
    Users,
    Calendar,
    Settings,
    MessageCircle,
    Download,
    Upload,
    Bell,
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Check,
    X,
    Clock,
    AlertCircle,
    BookOpen,
    FileText,
    Camera,
    DollarSign,
    Percent,
    Star,
    Image as ImageIcon,
    Eye,
    Share2,
    Heart,
    ChevronLeft,
    ChevronRight,
    Edit,
    Trash2,
    Copy,
    Trophy,
    Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { ClassPreview } from "@/components/ClassPreview";
import { ClassSettingsBadges } from "@/components/ClassSettingsBadges";
import type { ClassBadge, BadgeDesign, StudentBadge, User } from "@/app/context/AppContext";
import { toast } from "sonner";

interface ClassManagementPageProps {
    classId: string;
    onBack: () => void;
}

interface Enrollment {
    id: string;
    studentName: string;
    studentEmail: string;
    enrolledDate: string;
    status: "active" | "dropped" | "completed";
    paymentStatus: "paid" | "pending" | "overdue";
    avatar?: string;
    phone?: string;
    emergencyContact?: string;
    pricingTier?: string;
    discountApplied?: string;
    amountPaid?: number;
}

interface AttendanceRecord {
    id: string;
    studentId: string;
    studentName: string;
    date: string;
    status: "present" | "absent" | "late" | "excused";
    notes?: string;
}

interface WaitlistEntry {
    id: string;
    studentName: string;
    studentEmail: string;
    waitlistedDate: string;
    position: number;
    notifications: boolean;
}

interface PricingTier {
    id: string;
    name: string;
    price: number;
    description: string;
    isDefault: boolean;
    isActive: boolean;
    enrollmentCount: number;
}

interface DiscountCode {
    id: string;
    code: string;
    type: "percentage" | "fixed";
    value: number;
    description: string;
    expiryDate: string;
    usageLimit: number;
    usageCount: number;
    isActive: boolean;
}

interface ClassImage {
    id: string;
    url: string;
    alt: string;
    isMain: boolean;
    uploadDate: string;
}

interface StudentReview {
    id: string;
    studentName: string;
    studentEmail: string;
    rating: number;
    comment: string;
    date: string;
    isPublic: boolean;
    avatar?: string;
}

export function ClassManagementPage({ classId, onBack }: ClassManagementPageProps) {
    const [activeTab, setActiveTab] = useState("enrollments");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [showNotificationDialog, setShowNotificationDialog] = useState(false);
    const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);
    const [showRosterDialog, setShowRosterDialog] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [selectedPricingTier, setSelectedPricingTier] = useState<string>("");
    const [selectedDiscountCode, setSelectedDiscountCode] = useState<string>("");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Mock enrollment data with pricing info
    const mockEnrollments: Enrollment[] = [
        {
            id: "1",
            studentName: "Alice Johnson",
            studentEmail: "alice@example.com",
            enrolledDate: "2025-01-10",
            status: "active",
            paymentStatus: "paid",
            phone: "(555) 123-4567",
            emergencyContact: "Bob Johnson - (555) 987-6543",
            pricingTier: "Early Bird Special",
            discountApplied: "EARLY20",
            amountPaid: 224
        },
        {
            id: "2",
            studentName: "Mark Chen",
            studentEmail: "mark@example.com",
            enrolledDate: "2025-01-12",
            status: "active",
            paymentStatus: "paid",
            phone: "(555) 234-5678",
            pricingTier: "Standard Price",
            amountPaid: 320
        },
        {
            id: "3",
            studentName: "Emma Wilson",
            studentEmail: "emma@example.com",
            enrolledDate: "2025-01-08",
            status: "active",
            paymentStatus: "pending",
            phone: "(555) 345-6789",
            pricingTier: "Premium Package",
            discountApplied: "STUDENT50",
            amountPaid: 330
        }
    ];

    // Badge system state
    const [classBadges, setClassBadges] = useState<ClassBadge[]>([
        {
            id: "badge_completion",
            classId: classId,
            name: "Class Completion",
            description: "Successfully completed the Wheel Throwing Fundamentals class",
            design: {
                id: "design_completion",
                name: "Class Completion",
                shape: "circle",
                backgroundColor: "#3B82F6",
                borderColor: "#1D4ED8",
                borderWidth: 3,
                iconType: "emoji",
                icon: "🏆",
                textColor: "#FFFFFF",
                fontSize: "medium",
                gradientEnabled: true,
                gradientColors: ["#3B82F6", "#1D4ED8"],
                gradientDirection: "diagonal",
                shadowEnabled: true,
                shadowColor: "#000000",
                shadowBlur: 10,
                createdAt: "2025-01-01",
                updatedAt: "2025-01-01"
            },
            requirements: [
                {
                    id: "req_attendance",
                    type: "attendance",
                    description: "Attend at least 80% of class sessions",
                    criteria: { attendancePercentage: 80 },
                    isRequired: true
                },
                {
                    id: "req_grade",
                    type: "grade",
                    description: "Achieve a minimum grade of 75%",
                    criteria: { minimumGrade: 75 },
                    isRequired: true
                }
            ],
            isEnabled: true,
            autoAward: true,
            manualReview: false,
            revokable: false,
            createdBy: "instructor_1",
            createdAt: "2025-01-01",
            updatedAt: "2025-01-01"
        }
    ]);

    const [studentBadges, setStudentBadges] = useState<StudentBadge[]>([
        {
            id: "sb_1",
            badgeId: "badge_completion",
            classId: classId,
            studentId: "1",
            studentName: "Alice Johnson",
            awardedDate: "2025-01-15T10:00:00Z",
            awardedBy: "Sarah Martinez",
            awardMethod: "automatic",
            status: "active",
            verificationCode: "WTF-2025-001-ABC",
            socialShareEnabled: true,
            finalGrade: 87,
            finalAttendance: 90,
            projectsCompleted: 4,
            skillsAchieved: ["centering", "pulling", "shaping"],
            instructorNotes: "Excellent progress throughout the course.",
            displayOnProfile: true
        }
    ]);

    // Mock student data for badge system
    const mockStudents: User[] = mockEnrollments.map((enrollment) => ({
        id: enrollment.id,
        name: enrollment.studentName,
        email: enrollment.studentEmail,
        handle: enrollment.studentName.toLowerCase().replace(" ", ""),
        type: "artist",
        subscription: "free",
        createdAt: "2025-01-01",
        profile: {
            bio: "",
            socialMedia: {},
            branding: { primaryColor: "#030213" }
        }
    }));

    // Mock attendance and grade records for badge system
    const mockAttendanceRecords = {
        "1": { percentage: 90, sessionsAttended: 14, totalSessions: 16 },
        "2": { percentage: 85, sessionsAttended: 13, totalSessions: 16 },
        "3": { percentage: 75, sessionsAttended: 12, totalSessions: 16 }
    };

    const mockGradeRecords = {
        "1": { finalGrade: 87, projectsCompleted: 4 },
        "2": { finalGrade: 82, projectsCompleted: 3 },
        "3": { finalGrade: 78, projectsCompleted: 5 }
    };

    const mockSkillsRecords = {
        "1": ["centering", "pulling", "shaping"],
        "2": ["centering", "pulling"],
        "3": ["centering", "pulling", "shaping", "trimming"]
    };

    // Mock class data
    const classData = {
        id: classId,
        name: "Wheel Throwing Fundamentals",
        instructor: "Sarah Martinez",
        level: "Beginner",
        capacity: 12,
        enrolled: 10,
        waitlist: 3,
        schedule: "Tuesdays & Thursdays, 6:00 PM - 8:00 PM",
        duration: "8 weeks",
        startDate: "2025-01-15",
        endDate: "2025-03-06",
        location: "Studio A",
        price: "$320",
        description:
            "Learn the fundamentals of wheel throwing pottery including centering, pulling walls, and basic forms.",
        materials: "Clay, glazes, and tools included",
        status: "active",
        sessionsCompleted: 3,
        totalSessions: 16,
        thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        averageRating: 4.8,
        totalReviews: 24
    };

    // Mock pricing tiers
    const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([
        {
            id: "1",
            name: "Early Bird Special",
            price: 280,
            description: "Save $40 with early registration",
            isDefault: false,
            isActive: true,
            enrollmentCount: 3
        },
        {
            id: "2",
            name: "Standard Price",
            price: 320,
            description: "Regular class price includes all materials",
            isDefault: true,
            isActive: true,
            enrollmentCount: 6
        },
        {
            id: "3",
            name: "Premium Package",
            price: 380,
            description: "Includes extra studio time and advanced glazing",
            isDefault: false,
            isActive: true,
            enrollmentCount: 1
        }
    ]);

    // Mock discount codes
    const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([
        {
            id: "1",
            code: "EARLY20",
            type: "percentage",
            value: 20,
            description: "Early bird discount",
            expiryDate: "2025-01-31",
            usageLimit: 50,
            usageCount: 12,
            isActive: true
        },
        {
            id: "2",
            code: "STUDENT50",
            type: "fixed",
            value: 50,
            description: "Student discount",
            expiryDate: "2025-03-31",
            usageLimit: 0,
            usageCount: 3,
            isActive: true
        }
    ]);

    // Mock class images
    const [classImages, setClassImages] = useState<ClassImage[]>([
        {
            id: "1",
            url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
            alt: "Students working on pottery wheels",
            isMain: true,
            uploadDate: "2025-01-10"
        },
        {
            id: "2",
            url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
            alt: "Pottery wheel demonstration",
            isMain: false,
            uploadDate: "2025-01-10"
        },
        {
            id: "3",
            url: "https://images.unsplash.com/photo-1594736797933-d0c6ba7a6d48?w=800",
            alt: "Finished pottery pieces",
            isMain: false,
            uploadDate: "2025-01-10"
        }
    ]);

    // Mock student reviews
    const [studentReviews, setStudentReviews] = useState<StudentReview[]>([
        {
            id: "1",
            studentName: "Jennifer Walsh",
            studentEmail: "jennifer@example.com",
            rating: 5,
            comment:
                "Sarah is an amazing instructor! I went from never touching clay to making beautiful bowls.",
            date: "2025-01-05",
            isPublic: true
        },
        {
            id: "2",
            studentName: "Michael Rodriguez",
            studentEmail: "michael@example.com",
            rating: 5,
            comment:
                "Best pottery class I've taken. Great balance of instruction and hands-on practice.",
            date: "2025-01-03",
            isPublic: true
        },
        {
            id: "3",
            studentName: "Lisa Chen",
            studentEmail: "lisa@example.com",
            rating: 4,
            comment: "Really enjoyed the class structure. Sarah explains techniques clearly.",
            date: "2025-01-02",
            isPublic: false
        }
    ]);

    // Mock attendance data
    const mockAttendance: AttendanceRecord[] = [
        {
            id: "1",
            studentId: "1",
            studentName: "Alice Johnson",
            date: "2025-01-15",
            status: "present"
        },
        {
            id: "2",
            studentId: "2",
            studentName: "Mark Chen",
            date: "2025-01-15",
            status: "present"
        },
        {
            id: "3",
            studentId: "3",
            studentName: "Emma Wilson",
            date: "2025-01-15",
            status: "late",
            notes: "Arrived 15 minutes late due to traffic"
        }
    ];

    // Mock waitlist data
    const mockWaitlist: WaitlistEntry[] = [
        {
            id: "1",
            studentName: "David Park",
            studentEmail: "david@example.com",
            waitlistedDate: "2025-01-13",
            position: 1,
            notifications: true
        },
        {
            id: "2",
            studentName: "Lisa Brown",
            studentEmail: "lisa@example.com",
            waitlistedDate: "2025-01-14",
            position: 2,
            notifications: true
        }
    ];

    const handleDownloadRoster = () => {
        const csvContent = `Student Name,Email,Phone,Emergency Contact,Status,Pricing Tier,Amount Paid\n${mockEnrollments
            .map(
                (e) =>
                    `${e.studentName},${e.studentEmail},${e.phone || ""},${e.emergencyContact || ""},${e.status},${e.pricingTier || ""},${e.amountPaid || ""}`
            )
            .join("\n")}`;

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${classData.name}_roster.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast.success("Roster downloaded successfully");
    };

    const handleUploadRoster = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            toast.success("Attendance roster uploaded and processed");
            setShowRosterDialog(false);
        }
    };

    const handleSendNotification = () => {
        toast.success("Notifications sent to selected students");
        setShowNotificationDialog(false);
        setSelectedStudents([]);
    };

    const addPricingTier = () => {
        const newTier: PricingTier = {
            id: Date.now().toString(),
            name: "New Tier",
            price: 0,
            description: "",
            isDefault: false,
            isActive: true,
            enrollmentCount: 0
        };
        setPricingTiers([...pricingTiers, newTier]);
    };

    const updatePricingTier = (id: string, field: keyof PricingTier, value: any) => {
        setPricingTiers((prev) =>
            prev.map((tier) => (tier.id === id ? { ...tier, [field]: value } : tier))
        );
    };

    const deletePricingTier = (id: string) => {
        setPricingTiers((prev) => prev.filter((tier) => tier.id !== id));
        toast.success("Pricing tier deleted");
    };

    const addDiscountCode = () => {
        const newCode: DiscountCode = {
            id: Date.now().toString(),
            code: "",
            type: "percentage",
            value: 0,
            description: "",
            expiryDate: "",
            usageLimit: 0,
            usageCount: 0,
            isActive: true
        };
        setDiscountCodes([...discountCodes, newCode]);
    };

    const updateDiscountCode = (id: string, field: keyof DiscountCode, value: any) => {
        setDiscountCodes((prev) =>
            prev.map((code) => (code.id === id ? { ...code, [field]: value } : code))
        );
    };

    const deleteDiscountCode = (id: string) => {
        setDiscountCodes((prev) => prev.filter((code) => code.id !== id));
        toast.success("Discount code deleted");
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            Array.from(files).forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageUrl = e.target?.result as string;
                    const newImage: ClassImage = {
                        id: `${Date.now()}-${index}`,
                        url: imageUrl,
                        alt: `Class image ${classImages.length + index + 1}`,
                        isMain: false,
                        uploadDate: new Date().toISOString().split("T")[0]
                    };
                    setClassImages((prev) => [...prev, newImage]);
                };
                reader.readAsDataURL(file);
            });
            toast.success("Images uploaded successfully");
        }
    };

    const removeImage = (id: string) => {
        setClassImages((prev) => prev.filter((img) => img.id !== id));
        toast.success("Image removed");
    };

    const setMainImage = (id: string) => {
        setClassImages((prev) => prev.map((img) => ({ ...img, isMain: img.id === id })));
        toast.success("Main image updated");
    };

    const updateReviewVisibility = (id: string, isPublic: boolean) => {
        setStudentReviews((prev) =>
            prev.map((review) => (review.id === id ? { ...review, isPublic } : review))
        );
    };

    const deleteReview = (id: string) => {
        setStudentReviews((prev) => prev.filter((review) => review.id !== id));
        toast.success("Review deleted");
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <Badge variant="default">Active</Badge>;
            case "dropped":
                return <Badge variant="destructive">Dropped</Badge>;
            case "completed":
                return <Badge variant="secondary">Completed</Badge>;
            case "present":
                return <Badge variant="default">Present</Badge>;
            case "absent":
                return <Badge variant="destructive">Absent</Badge>;
            case "late":
                return <Badge variant="secondary">Late</Badge>;
            case "excused":
                return <Badge variant="outline">Excused</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPaymentBadge = (status: string) => {
        switch (status) {
            case "paid":
                return (
                    <Badge
                        variant="default"
                        className="bg-green-500"
                    >
                        Paid
                    </Badge>
                );
            case "pending":
                return <Badge variant="secondary">Pending</Badge>;
            case "overdue":
                return <Badge variant="destructive">Overdue</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
            />
        ));
    };

    const copyDiscountCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success("Discount code copied to clipboard");
    };

    // Badge system handlers
    const handleUpdateClassBadges = (badges: ClassBadge[]) => {
        setClassBadges(badges);
    };

    const handleAwardBadge = (badgeId: string, studentId: string, studentName: string) => {
        const newBadge: StudentBadge = {
            id: `sb_${Date.now()}`,
            badgeId,
            classId: classId,
            studentId,
            studentName,
            awardedDate: new Date().toISOString(),
            awardedBy: "Current Instructor",
            awardMethod: "manual",
            status: "active",
            verificationCode: `${classId.toUpperCase()}-${Date.now()}`,
            socialShareEnabled: true,
            finalGrade: mockGradeRecords[studentId]?.finalGrade || 0,
            finalAttendance: mockAttendanceRecords[studentId]?.percentage || 0,
            projectsCompleted: mockGradeRecords[studentId]?.projectsCompleted || 0,
            skillsAchieved: mockSkillsRecords[studentId] || [],
            instructorNotes: "Badge awarded for meeting all requirements",
            displayOnProfile: true
        };

        setStudentBadges((prev) => [...prev, newBadge]);
        toast.success(`Badge awarded to ${studentName}`);
    };

    const handleRevokeBadge = (badgeId: string) => {
        setStudentBadges((prev) => prev.filter((badge) => badge.id !== badgeId));
        toast.success("Badge revoked successfully");
    };

    if (showPreview) {
        return (
            <ClassPreview
                classData={classData}
                onBack={() => setShowPreview(false)}
            />
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Classes
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">{classData.name}</h1>
                    <p className="text-muted-foreground">Instructor: {classData.instructor}</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setShowPreview(true)}
                >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Page
                </Button>
                <Button onClick={() => setShowNotificationDialog(true)}>
                    <Bell className="w-4 h-4 mr-2" />
                    Send Notification
                </Button>
                <Button variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Class Discussion
                </Button>
            </div>

            {/* Class Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Enrollment
                            </CardTitle>
                            <Users className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {classData.enrolled}/{classData.capacity}
                        </div>
                        <div className="mt-2">
                            <Progress
                                value={(classData.enrolled / classData.capacity) * 100}
                                className="h-2"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            {classData.waitlist} on waitlist
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Progress
                            </CardTitle>
                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {classData.sessionsCompleted}/{classData.totalSessions}
                        </div>
                        <div className="mt-2">
                            <Progress
                                value={
                                    (classData.sessionsCompleted / classData.totalSessions) * 100
                                }
                                className="h-2"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Sessions completed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Revenue
                            </CardTitle>
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${mockEnrollments.reduce((sum, e) => sum + (e.amountPaid || 0), 0)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Total revenue</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Reviews
                            </CardTitle>
                            <Star className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center space-x-2">
                            <span>{classData.averageRating}</span>
                            <div className="flex">
                                {renderStars(Math.round(classData.averageRating))}
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            {classData.totalReviews} reviews
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
            >
                <TabsList className="grid w-full grid-cols-9">
                    <TabsTrigger value="enrollments">
                        <Users className="w-4 h-4 mr-2" />
                        Enrollments
                    </TabsTrigger>
                    <TabsTrigger value="attendance">
                        <Check className="w-4 h-4 mr-2" />
                        Attendance
                    </TabsTrigger>
                    <TabsTrigger value="waitlist">
                        <Clock className="w-4 h-4 mr-2" />
                        Waitlist
                    </TabsTrigger>
                    <TabsTrigger value="badges">
                        <Trophy className="w-4 h-4 mr-2" />
                        Badges
                    </TabsTrigger>
                    <TabsTrigger value="pricing">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Pricing
                    </TabsTrigger>
                    <TabsTrigger value="discounts">
                        <Percent className="w-4 h-4 mr-2" />
                        Discounts
                    </TabsTrigger>
                    <TabsTrigger value="images">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Images
                    </TabsTrigger>
                    <TabsTrigger value="reviews">
                        <Star className="w-4 h-4 mr-2" />
                        Reviews
                    </TabsTrigger>
                    <TabsTrigger value="settings">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                    </TabsTrigger>
                </TabsList>

                {/* Enrollments Tab */}
                <TabsContent
                    value="enrollments"
                    className="space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    placeholder="Search students..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-64"
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Filter
                            </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                onClick={handleDownloadRoster}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Roster
                            </Button>
                            <Button onClick={() => setShowAddStudentDialog(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Student
                            </Button>
                        </div>
                    </div>

                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={
                                                selectedStudents.length === mockEnrollments.length
                                            }
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedStudents(
                                                        mockEnrollments.map((e) => e.id)
                                                    );
                                                } else {
                                                    setSelectedStudents([]);
                                                }
                                            }}
                                        />
                                    </TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Pricing</TableHead>
                                    <TableHead>Payment</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockEnrollments.map((enrollment) => (
                                    <TableRow key={enrollment.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedStudents.includes(enrollment.id)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedStudents((prev) => [
                                                            ...prev,
                                                            enrollment.id
                                                        ]);
                                                    } else {
                                                        setSelectedStudents((prev) =>
                                                            prev.filter(
                                                                (id) => id !== enrollment.id
                                                            )
                                                        );
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarImage src={enrollment.avatar} />
                                                    <AvatarFallback>
                                                        {enrollment.studentName
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">
                                                        {enrollment.studentName}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {enrollment.studentEmail}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div>{enrollment.phone}</div>
                                                {enrollment.emergencyContact && (
                                                    <div className="text-muted-foreground">
                                                        Emergency: {enrollment.emergencyContact}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div className="font-medium">
                                                    {enrollment.pricingTier}
                                                </div>
                                                {enrollment.discountApplied && (
                                                    <div className="text-green-600">
                                                        Discount: {enrollment.discountApplied}
                                                    </div>
                                                )}
                                                <div className="text-muted-foreground">
                                                    ${enrollment.amountPaid}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getPaymentBadge(enrollment.paymentStatus)}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
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
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        View Profile
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        Send Message
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        Update Payment
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive">
                                                        Remove from Class
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                {/* Attendance Tab */}
                <TabsContent
                    value="attendance"
                    className="space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Input
                                type="date"
                                className="w-40"
                            />
                            <Button variant="outline">
                                <Filter className="w-4 h-4 mr-2" />
                                Filter by Date
                            </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowRosterDialog(true)}
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Attendance
                            </Button>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Mark Attendance
                            </Button>
                        </div>
                    </div>

                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Notes</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockAttendance.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarFallback>
                                                        {record.studentName
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">
                                                    {record.studentName}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{record.date}</TableCell>
                                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {record.notes || "-"}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                            >
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                {/* Waitlist Tab */}
                <TabsContent
                    value="waitlist"
                    className="space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    placeholder="Search waitlist..."
                                    className="pl-10 w-64"
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Add to Waitlist
                            </Button>
                        </div>
                    </div>

                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Waitlisted Date</TableHead>
                                    <TableHead>Notifications</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockWaitlist.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell>
                                            <Badge variant="secondary">#{entry.position}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">
                                                    {entry.studentName}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {entry.studentEmail}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(entry.waitlistedDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    entry.notifications ? "default" : "secondary"
                                                }
                                            >
                                                {entry.notifications ? "Enabled" : "Disabled"}
                                            </Badge>
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
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        Move to Class
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        Send Message
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        Toggle Notifications
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive">
                                                        Remove from Waitlist
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                {/* Badges Tab */}
                <TabsContent
                    value="badges"
                    className="space-y-4"
                >
                    <ClassSettingsBadges
                        classId={classId}
                        classBadges={classBadges}
                        onUpdateClassBadges={handleUpdateClassBadges}
                        students={mockStudents}
                        studentBadges={studentBadges}
                        onAwardBadge={handleAwardBadge}
                        onRevokeBadge={handleRevokeBadge}
                        attendanceRecords={mockAttendanceRecords}
                        gradeRecords={mockGradeRecords}
                        skillsRecords={mockSkillsRecords}
                    />
                </TabsContent>

                {/* Pricing Tab */}
                <TabsContent
                    value="pricing"
                    className="space-y-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium">Pricing Tiers</h3>
                            <p className="text-sm text-muted-foreground">
                                Manage pricing options for your class
                            </p>
                        </div>
                        <Button onClick={addPricingTier}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Tier
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {pricingTiers.map((tier) => (
                            <Card key={tier.id}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Tier Name</Label>
                                                    <Input
                                                        value={tier.name}
                                                        onChange={(e) =>
                                                            updatePricingTier(
                                                                tier.id,
                                                                "name",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Price</Label>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                        <Input
                                                            type="number"
                                                            className="pl-10"
                                                            value={tier.price}
                                                            onChange={(e) =>
                                                                updatePricingTier(
                                                                    tier.id,
                                                                    "price",
                                                                    Number(e.target.value)
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Description</Label>
                                                <Textarea
                                                    value={tier.description}
                                                    onChange={(e) =>
                                                        updatePricingTier(
                                                            tier.id,
                                                            "description",
                                                            e.target.value
                                                        )
                                                    }
                                                    rows={2}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Switch
                                                            checked={tier.isDefault}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    setPricingTiers((prev) =>
                                                                        prev.map((t) => ({
                                                                            ...t,
                                                                            isDefault:
                                                                                t.id === tier.id
                                                                        }))
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <Label>Default pricing</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Switch
                                                            checked={tier.isActive}
                                                            onCheckedChange={(checked) =>
                                                                updatePricingTier(
                                                                    tier.id,
                                                                    "isActive",
                                                                    checked
                                                                )
                                                            }
                                                        />
                                                        <Label>Active</Label>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {tier.enrollmentCount} enrollments
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => deletePricingTier(tier.id)}
                                            className="ml-4"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Discounts Tab */}
                <TabsContent
                    value="discounts"
                    className="space-y-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium">Discount Codes</h3>
                            <p className="text-sm text-muted-foreground">
                                Create and manage discount codes for your class
                            </p>
                        </div>
                        <Button onClick={addDiscountCode}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Code
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {discountCodes.map((code) => (
                            <Card key={code.id}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1 space-y-4">
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Discount Code</Label>
                                                    <div className="flex space-x-2">
                                                        <Input
                                                            value={code.code}
                                                            onChange={(e) =>
                                                                updateDiscountCode(
                                                                    code.id,
                                                                    "code",
                                                                    e.target.value.toUpperCase()
                                                                )
                                                            }
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                copyDiscountCode(code.code)
                                                            }
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Type</Label>
                                                    <Select
                                                        value={code.type}
                                                        onValueChange={(
                                                            value: "percentage" | "fixed"
                                                        ) =>
                                                            updateDiscountCode(
                                                                code.id,
                                                                "type",
                                                                value
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="percentage">
                                                                Percentage
                                                            </SelectItem>
                                                            <SelectItem value="fixed">
                                                                Fixed Amount
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Value</Label>
                                                    <div className="relative">
                                                        {code.type === "percentage" ? (
                                                            <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                        ) : (
                                                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                        )}
                                                        <Input
                                                            type="number"
                                                            className="pl-10"
                                                            value={code.value}
                                                            onChange={(e) =>
                                                                updateDiscountCode(
                                                                    code.id,
                                                                    "value",
                                                                    Number(e.target.value)
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Expiry Date</Label>
                                                    <Input
                                                        type="date"
                                                        value={code.expiryDate}
                                                        onChange={(e) =>
                                                            updateDiscountCode(
                                                                code.id,
                                                                "expiryDate",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Usage Limit</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="0 = unlimited"
                                                        value={code.usageLimit}
                                                        onChange={(e) =>
                                                            updateDiscountCode(
                                                                code.id,
                                                                "usageLimit",
                                                                Number(e.target.value)
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Description</Label>
                                                <Input
                                                    value={code.description}
                                                    onChange={(e) =>
                                                        updateDiscountCode(
                                                            code.id,
                                                            "description",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Switch
                                                        checked={code.isActive}
                                                        onCheckedChange={(checked) =>
                                                            updateDiscountCode(
                                                                code.id,
                                                                "isActive",
                                                                checked
                                                            )
                                                        }
                                                    />
                                                    <Label>Active</Label>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {code.usageCount} / {code.usageLimit || "∞"}{" "}
                                                    uses
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => deleteDiscountCode(code.id)}
                                            className="ml-4"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {discountCodes.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <Percent className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">No discount codes created yet</p>
                            <p className="text-sm">
                                Create discount codes to offer special promotions to your students
                            </p>
                        </div>
                    )}
                </TabsContent>

                {/* Images Tab */}
                <TabsContent
                    value="images"
                    className="space-y-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium">Class Images</h3>
                            <p className="text-sm text-muted-foreground">
                                Manage images for your class listing
                            </p>
                        </div>
                        <div>
                            <Label
                                htmlFor="images-upload"
                                className="cursor-pointer"
                            >
                                <Button asChild>
                                    <span>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload Images
                                    </span>
                                </Button>
                            </Label>
                            <Input
                                id="images-upload"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {classImages.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {classImages.map((image) => (
                                <Card
                                    key={image.id}
                                    className="overflow-hidden"
                                >
                                    <div className="relative">
                                        <div className="aspect-video bg-muted">
                                            <ImageWithFallback
                                                src={image.url}
                                                alt={image.alt}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        {image.isMain && (
                                            <Badge className="absolute top-2 left-2">
                                                Main Image
                                            </Badge>
                                        )}
                                        <div className="absolute top-2 right-2 flex space-x-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setMainImage(image.id)}
                                                disabled={image.isMain}
                                            >
                                                <Star className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeImage(image.id)}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <p className="text-sm font-medium">{image.alt}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Uploaded: {image.uploadDate}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">No images uploaded yet</p>
                            <p className="text-sm">
                                Add images to showcase your class and attract students
                            </p>
                        </div>
                    )}
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent
                    value="reviews"
                    className="space-y-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium">Student Reviews</h3>
                            <p className="text-sm text-muted-foreground">
                                Manage student reviews and ratings
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                                {studentReviews.filter((r) => r.isPublic).length} Public
                            </Badge>
                            <Badge variant="outline">
                                {studentReviews.filter((r) => !r.isPublic).length} Private
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {studentReviews.map((review) => (
                            <Card key={review.id}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3">
                                            <Avatar className="w-10 h-10">
                                                <AvatarImage src={review.avatar} />
                                                <AvatarFallback>
                                                    {review.studentName
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="font-medium">
                                                        {review.studentName}
                                                    </span>
                                                    <div className="flex space-x-1">
                                                        {renderStars(review.rating)}
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">
                                                        {review.date}
                                                    </span>
                                                    {review.isPublic ? (
                                                        <Badge
                                                            variant="default"
                                                            className="text-xs"
                                                        >
                                                            Public
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            Private
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {review.comment}
                                                </p>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        updateReviewVisibility(
                                                            review.id,
                                                            !review.isPublic
                                                        )
                                                    }
                                                >
                                                    {review.isPublic
                                                        ? "Make Private"
                                                        : "Make Public"}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>Reply to Review</DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => deleteReview(review.id)}
                                                >
                                                    Delete Review
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {studentReviews.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <Star className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">No reviews yet</p>
                            <p className="text-sm">
                                Student reviews will appear here once they submit them
                            </p>
                        </div>
                    )}
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent
                    value="settings"
                    className="space-y-6"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Edit fundamental class details
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-class-name">Class Name *</Label>
                                    <Input
                                        id="edit-class-name"
                                        defaultValue={classData.name}
                                        placeholder="e.g., Wheel Throwing Fundamentals"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-instructor">Instructor *</Label>
                                    <Select defaultValue="sarah">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select instructor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sarah">Sarah Martinez</SelectItem>
                                            <SelectItem value="michael">Michael Chen</SelectItem>
                                            <SelectItem value="emma">Emma Rodriguez</SelectItem>
                                            <SelectItem value="david">David Park</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Description *</Label>
                                <Textarea
                                    id="edit-description"
                                    defaultValue={classData.description}
                                    placeholder="Describe what students will learn in this class..."
                                    rows={4}
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-4 border-t">
                                <Button variant="outline">Cancel Changes</Button>
                                <Button
                                    onClick={() =>
                                        toast.success("Class information updated successfully")
                                    }
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Notification Dialog */}
            <Dialog
                open={showNotificationDialog}
                onOpenChange={setShowNotificationDialog}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send Notification</DialogTitle>
                        <DialogDescription>
                            Send a message or announcement to your class students
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Recipients</Label>
                            <p className="text-sm text-muted-foreground">
                                {selectedStudents.length > 0
                                    ? `${selectedStudents.length} selected students`
                                    : "All enrolled students"}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                                id="subject"
                                placeholder="Class update..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                                id="message"
                                placeholder="Enter your message..."
                                rows={4}
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowNotificationDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleSendNotification}>
                                <Bell className="w-4 h-4 mr-2" />
                                Send Notification
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Roster Upload Dialog */}
            <Dialog
                open={showRosterDialog}
                onOpenChange={setShowRosterDialog}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Attendance Roster</DialogTitle>
                        <DialogDescription>
                            Upload a completed attendance roster to automatically update attendance
                            records
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                            <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <div className="space-y-2">
                                <Label
                                    htmlFor="roster-upload"
                                    className="cursor-pointer"
                                >
                                    <span className="text-primary hover:underline">
                                        Choose file
                                    </span>{" "}
                                    or drag and drop
                                </Label>
                                <Input
                                    id="roster-upload"
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleUploadRoster}
                                    className="hidden"
                                />
                                <p className="text-xs text-muted-foreground">
                                    CSV, Excel files supported
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowRosterDialog(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
