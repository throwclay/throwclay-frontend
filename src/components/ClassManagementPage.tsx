"use client";
import { useState, useEffect, useCallback } from "react";
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
    Award,
    Loader2,
    Save
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Progress } from "./ui/progress";
import { Checkbox } from "./ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent
} from "./ui/dropdown-menu";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ClassPreview } from "./ClassPreview";
import { ClassSettingsBadges } from "./ClassSettingsBadges";
import { toast } from "sonner";
import { useAppContext } from "@/app/context/AppContext";
import type {
    ClassEnrollment,
    ClassWaitlistEntry,
    ClassAttendanceRecord,
    ClassPricingTier,
    ClassDiscountCode,
    ClassImage as ClassImageType,
    ClassReview,
    BadgeDesign,
    StudentBadge
} from "@/types";
import type { User } from "@/types";

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
    const context = useAppContext();
    const [activeTab, setActiveTab] = useState("enrollments");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [showNotificationDialog, setShowNotificationDialog] = useState(false);
    const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);
    const [showAddToWaitlistDialog, setShowAddToWaitlistDialog] = useState(false);
    const [showMarkAttendanceDialog, setShowMarkAttendanceDialog] = useState(false);
    const [showRosterDialog, setShowRosterDialog] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    
    // Dialog form states
    const [addStudentForm, setAddStudentForm] = useState({
        studentId: "",
        pricingTierId: "",
        discountCodeId: "",
        emergencyContact: "",
        phone: ""
    });
    const [addToWaitlistForm, setAddToWaitlistForm] = useState({
        studentId: ""
    });
    const [markAttendanceForm, setMarkAttendanceForm] = useState({
        sessionDate: new Date().toISOString().split("T")[0],
        selectedStudents: [] as string[],
        status: "present" as "present" | "absent" | "late" | "excused",
        notes: ""
    });
    
    // Students/members for selection
    const [availableStudents, setAvailableStudents] = useState<Array<{
        id: string;
        name: string;
        email: string;
        phone?: string;
    }>>([]);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const [selectedPricingTier, setSelectedPricingTier] = useState<string>("");
    const [selectedDiscountCode, setSelectedDiscountCode] = useState<string>("");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(false);
    const [isLoadingWaitlist, setIsLoadingWaitlist] = useState(false);
    const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
    const [instructors, setInstructors] = useState<Array<{ id: string; name: string; email?: string }>>([]);
    
    // Settings form state
    const [settingsForm, setSettingsForm] = useState({
        name: "",
        description: "",
        instructorId: ""
    });

    // Class data state
    const [classData, setClassData] = useState<any>(null);
    const [enrollments, setEnrollments] = useState<ClassEnrollment[]>([]);
    const [waitlist, setWaitlist] = useState<ClassWaitlistEntry[]>([]);
    const [attendance, setAttendance] = useState<ClassAttendanceRecord[]>([]);

    // Fetch class data and all related data
    const fetchClassData = useCallback(async () => {
        if (!context.currentStudio?.id || !context.authToken) return;

        setIsLoading(true);
        try {
            const res = await fetch(
                `/api/admin/studios/${context.currentStudio.id}/classes/${classId}`,
                {
                    headers: { Authorization: `Bearer ${context.authToken}` }
                }
            );

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error || "Failed to load class");
            }

            const data = await res.json();
            setClassData(data.class);
            setEnrollments(data.enrollments || []);
            setWaitlist(data.waitlist || []);
            setAttendance(data.attendance || []);
            // Initialize settings form with current class data
            if (data.class) {
                setSettingsForm({
                    name: data.class.name || "",
                    description: data.class.description || "",
                    instructorId: data.class.instructor_id || ""
                });
            }
            setPricingTiers(
                (data.pricingTiers || []).map((tier: any) => ({
                    id: tier.id,
                    name: tier.name,
                    price: tier.price_cents / 100,
                    description: tier.description || "",
                    isDefault: tier.is_default,
                    isActive: tier.is_active,
                    enrollmentCount: tier.enrollment_count || 0
                }))
            );
            setDiscountCodes(
                (data.discountCodes || []).map((code: any) => ({
                    id: code.id,
                    code: code.code,
                    type: code.type,
                    value: code.value,
                    description: code.description || "",
                    expiryDate: code.expiry_date || "",
                    usageLimit: code.usage_limit || 0,
                    usageCount: code.usage_count || 0,
                    isActive: code.is_active
                }))
            );
            setClassImages(
                (data.images || []).map((img: any) => ({
                    id: img.id,
                    url: img.url,
                    alt: img.alt_text || "",
                    isMain: img.is_main,
                    uploadDate: img.upload_date
                }))
            );
            setStudentReviews(
                (data.reviews || []).map((review: any) => ({
                    id: review.id,
                    studentName: review.studentName || "",
                    studentEmail: review.studentEmail || "",
                    rating: review.rating,
                    comment: review.comment || "",
                    date: review.date || review.created_at,
                    isPublic: review.isPublic || review.is_public
                }))
            );
        } catch (err: any) {
            console.error("Error fetching class data", err);
            toast.error(err.message || "Failed to load class");
        } finally {
            setIsLoading(false);
        }
    }, [context.currentStudio?.id, context.authToken, classId]);

    // Fetch instructors
    const fetchInstructors = useCallback(async () => {
        if (!context.currentStudio?.id || !context.authToken) return;

        try {
            const res = await fetch(
                `/api/admin/studios/${context.currentStudio.id}/staff`,
                {
                    headers: { Authorization: `Bearer ${context.authToken}` }
                }
            );

            if (!res.ok) {
                console.error("Failed to fetch instructors");
                return;
            }

            const data = await res.json();
            // Filter for instructors only and map to the format we need
            setInstructors(
                (data.staff || [])
                    // .filter((staff: any) => staff.role === "instructor")
                    .map((staff: any) => ({
                        id: staff.userId || staff.id,
                        name: staff.name || staff.email?.split("@")[0] || "Unnamed Instructor",
                        email: staff.email
                    }))
            );
        } catch (err) {
            console.error("Error fetching instructors", err);
        }
    }, [context.currentStudio?.id, context.authToken]);

    // Fetch available students/members for enrollment (filtered by class location)
    const fetchAvailableStudents = useCallback(async () => {
        if (!context.currentStudio?.id || !context.authToken || !classData?.location_id) return;

        setIsLoadingStudents(true);
        try {
            // Fetch members for the class's location
            const url = new URL(
                `/api/studios/${context.currentStudio.id}/members`,
                window.location.origin
            );
            url.searchParams.set("locationId", classData.location_id);

            const res = await fetch(url.toString(), {
                headers: { Authorization: `Bearer ${context.authToken}` }
            });

            if (res.ok) {
                const data = await res.json();
                // Filter out students already enrolled or on waitlist
                const enrolledStudentIds = new Set(enrollments.map((e) => e.studentId));
                const waitlistedStudentIds = new Set(waitlist.map((w) => w.studentId));
                
                setAvailableStudents(
                    (data.members || [])
                        .filter((member: any) => {
                            const userId = member.user_id || member.profiles?.id;
                            return (
                                !enrolledStudentIds.has(userId) &&
                                !waitlistedStudentIds.has(userId)
                            );
                        })
                        .map((member: any) => ({
                            id: member.user_id || member.profiles?.id,
                            name: member.profiles?.name || member.profiles?.email?.split("@")[0] || "Unnamed",
                            email: member.profiles?.email || "",
                            phone: member.profiles?.phone || ""
                        }))
                );
            }
        } catch (err) {
            console.error("Error fetching students", err);
        } finally {
            setIsLoadingStudents(false);
        }
    }, [context.currentStudio?.id, context.authToken, classData?.location_id, enrollments, waitlist]);

    useEffect(() => {
        fetchClassData();
        fetchInstructors();
    }, [fetchClassData, fetchInstructors]);

    // Fetch available students when dialogs open
    useEffect(() => {
        if ((showAddStudentDialog || showAddToWaitlistDialog) && classData?.location_id) {
            fetchAvailableStudents();
        }
    }, [showAddStudentDialog, showAddToWaitlistDialog, classData?.location_id, fetchAvailableStudents]);


    // Badge system state - using any type for now as ClassBadge is not exported
    const [classBadges, setClassBadges] = useState<any[]>([
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
            displayOnProfile: true,
            shareCount: 0,
            viewCount: 0,
            createdAt: "2025-01-15T10:00:00Z",
            updatedAt: "2025-01-15T10:00:00Z"
        }
    ]);

    // Student data for badge system (using real enrollments)
    // Transform enrollments to User format for badge system
    const students: User[] = enrollments
        .filter((enrollment) => enrollment.studentName) // Filter out enrollments without student names
        .map((enrollment) => ({
            id: enrollment.studentId,
            name: enrollment.studentName || "Unnamed Student",
            email: enrollment.studentEmail || "",
            handle: (enrollment.studentName || "unnamed")
                .toLowerCase()
                .replace(/\s+/g, ""),
            phone: enrollment.phone || "",
            type: "artist" as const,
            subscription: "free",
            createdAt: enrollment.enrolledDate || new Date().toISOString(),
            isActive: true,
            profile: {
                bio: "",
                socialMedia: {},
                branding: { primaryColor: "#030213" }
            }
        }));

    // Calculate attendance statistics from actual attendance data
    const studentAttendanceStats: Record<string, { percentage: number; sessionsAttended: number; totalSessions: number }> = {};
    const totalSessions = classData?.total_sessions || 0;
    
    enrollments.forEach((enrollment) => {
        const studentId = enrollment.studentId;
        const studentAttendance = attendance.filter((a) => a.studentId === studentId && a.status === "present");
        const sessionsAttended = studentAttendance.length;
        const percentage = totalSessions > 0 ? Math.round((sessionsAttended / totalSessions) * 100) : 0;
        
        studentAttendanceStats[studentId] = {
            percentage,
            sessionsAttended,
            totalSessions
        };
    });

    // Grade records - placeholder until grade system is implemented
    const studentGradeStats: Record<string, { finalGrade: number; projectsCompleted: number }> = {};
    enrollments.forEach((enrollment) => {
        studentGradeStats[enrollment.studentId] = {
            finalGrade: 0,
            projectsCompleted: 0
        };
    });

    // Skills records - placeholder until skills system is implemented
    const studentSkillsStats: Record<string, string[]> = {};
    enrollments.forEach((enrollment) => {
        studentSkillsStats[enrollment.studentId] = [];
    });

    // Transform class data for display
    const displayClassData = classData
        ? {
              id: classData.id,
              name: classData.name,
              instructor: classData.instructor?.name || "TBD",
              level: classData.level || "",
              capacity: classData.capacity || 0,
              enrolled: classData.enrolled_count || 0,
              waitlist: classData.waitlist_count || 0,
              schedule: classData.schedule || "",
              duration: classData.total_sessions
                  ? `${classData.total_sessions} sessions`
                  : "TBD",
              startDate: classData.start_date || "",
              endDate: classData.end_date || "",
              location: classData.location || "",
              price: "$0", // Will be calculated from pricing tiers
              description: classData.description || "",
              materials: classData.materials || "",
              status: classData.status || "draft",
              sessionsCompleted: classData.sessions_completed || 0,
              totalSessions: classData.total_sessions || 0,
              thumbnail: classData.thumbnail_url || "",
              averageRating: classData.average_rating || 0,
              totalReviews: classData.total_reviews || 0
          }
        : null;

    // Pricing tiers state
    const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
    const [editingTiers, setEditingTiers] = useState<Record<string, Partial<PricingTier>>>({});

    // Discount codes state
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

    // Class images state
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

    // Student reviews state
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

    // Attendance data (using real data from state)
    const attendanceRecords: AttendanceRecord[] = attendance.map((record) => ({
        id: record.id,
        studentId: record.studentId,
        studentName: record.studentName,
        date: record.sessionDate,
        status: record.status,
        notes: record.notes || undefined
    }));

    // Waitlist data (using real data from state)
    const waitlistEntries: WaitlistEntry[] = waitlist.map((entry) => ({
        id: entry.id,
        studentName: entry.studentName,
        studentEmail: entry.studentEmail,
        waitlistedDate: entry.waitlistedDate,
        position: entry.position,
        notifications: entry.notificationsEnabled
    }));

    const handleDownloadRoster = () => {
        if (!displayClassData) return;

        const csvContent = `Student Name,Email,Phone,Emergency Contact,Status,Pricing Tier,Amount Paid\n${enrollments
            .map(
                (e) =>
                    `${e.studentName},${e.studentEmail},${e.phone || ""},${e.emergencyContact || ""},${e.status},${e.pricingTier?.name || ""},${e.amountPaid || ""}`
            )
            .join("\n")}`;

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${displayClassData.name}_roster.csv`;
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

    // Enrollment management handlers
    const handleAddStudentSubmit = async () => {
        if (!addStudentForm.studentId) {
            toast.error("Please select a student");
            return;
        }

        const selectedStudent = availableStudents.find((s) => s.id === addStudentForm.studentId);
        if (!selectedStudent) {
            toast.error("Selected student not found");
            return;
        }

        if (!context.currentStudio?.id || !context.authToken) {
            toast.error("Missing required information");
            return;
        }

        try {
            const res = await fetch(
                `/api/admin/studios/${context.currentStudio.id}/classes/${classId}/enrollments`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${context.authToken}`
                    },
                    body: JSON.stringify({
                        studentId: addStudentForm.studentId,
                        pricingTierId: addStudentForm.pricingTierId || null,
                        discountCodeId: addStudentForm.discountCodeId || null,
                        emergencyContact: addStudentForm.emergencyContact || null,
                        phone: addStudentForm.phone || null
                    })
                }
            );

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error || "Failed to enroll student");
            }

            toast.success(`Student "${selectedStudent.name}" enrolled successfully`);
            setShowAddStudentDialog(false);
            setAddStudentForm({
                studentId: "",
                pricingTierId: "",
                discountCodeId: "",
                emergencyContact: "",
                phone: ""
            });
            fetchClassData(); // Refresh enrollments
        } catch (err: any) {
            console.error("Error enrolling student", err);
            toast.error(err.message || "Failed to enroll student");
        }
    };

    const handleRemoveEnrollment = async (enrollmentId: string, studentName: string) => {
        if (!context.currentStudio?.id || !context.authToken) {
            toast.error("Missing required information");
            return;
        }

        if (!confirm(`Are you sure you want to remove "${studentName}" from this class?`)) {
            return;
        }

        try {
            const res = await fetch(
                `/api/admin/studios/${context.currentStudio.id}/classes/${classId}/enrollments/${enrollmentId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${context.authToken}`
                    }
                }
            );

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error || "Failed to remove enrollment");
            }

            toast.success(`Student "${studentName}" removed from class`);
            fetchClassData(); // Refresh enrollments
        } catch (err: any) {
            console.error("Error removing enrollment", err);
            toast.error(err.message || "Failed to remove enrollment");
        }
    };

    // Waitlist management handlers
    const handleAddToWaitlistSubmit = async () => {
        if (!addToWaitlistForm.studentId) {
            toast.error("Please select a student");
            return;
        }

        const selectedStudent = availableStudents.find((s) => s.id === addToWaitlistForm.studentId);
        if (!selectedStudent) {
            toast.error("Selected student not found");
            return;
        }

        if (!context.currentStudio?.id || !context.authToken) {
            toast.error("Missing required information");
            return;
        }

        try {
            const res = await fetch(
                `/api/admin/studios/${context.currentStudio.id}/classes/${classId}/waitlist`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${context.authToken}`
                    },
                    body: JSON.stringify({
                        studentId: addToWaitlistForm.studentId,
                        notificationsEnabled: true
                    })
                }
            );

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error || "Failed to add to waitlist");
            }

            toast.success(`Student "${selectedStudent.name}" added to waitlist`);
            setShowAddToWaitlistDialog(false);
            setAddToWaitlistForm({ studentId: "" });
            fetchClassData(); // Refresh waitlist
        } catch (err: any) {
            console.error("Error adding to waitlist", err);
            toast.error(err.message || "Failed to add to waitlist");
        }
    };

    const handleRemoveFromWaitlist = async (waitlistId: string, studentName: string) => {
        if (!context.currentStudio?.id || !context.authToken) {
            toast.error("Missing required information");
            return;
        }

        if (!confirm(`Are you sure you want to remove "${studentName}" from the waitlist?`)) {
            return;
        }

        try {
            const res = await fetch(
                `/api/admin/studios/${context.currentStudio.id}/classes/${classId}/waitlist/${waitlistId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${context.authToken}`
                    }
                }
            );

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error || "Failed to remove from waitlist");
            }

            toast.success(`Student "${studentName}" removed from waitlist`);
            fetchClassData(); // Refresh waitlist
        } catch (err: any) {
            console.error("Error removing from waitlist", err);
            toast.error(err.message || "Failed to remove from waitlist");
        }
    };

    const handlePromoteFromWaitlist = async (waitlistId: string, studentName: string) => {
        if (!context.currentStudio?.id || !context.authToken) {
            toast.error("Missing required information");
            return;
        }

        try {
            const res = await fetch(
                `/api/admin/studios/${context.currentStudio.id}/classes/${classId}/waitlist/${waitlistId}/promote`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${context.authToken}`
                    },
                    body: JSON.stringify({
                        pricingTierId: selectedPricingTier || null,
                        discountCodeId: selectedDiscountCode || null
                    })
                }
            );

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error || "Failed to promote from waitlist");
            }

            toast.success(`Student "${studentName}" promoted from waitlist and enrolled`);
            fetchClassData(); // Refresh enrollments and waitlist
        } catch (err: any) {
            console.error("Error promoting from waitlist", err);
            toast.error(err.message || "Failed to promote from waitlist");
        }
    };

    // Attendance management handlers
    const handleMarkAttendanceSubmit = async () => {
        if (markAttendanceForm.selectedStudents.length === 0) {
            toast.error("Please select at least one student");
            return;
        }

        if (!markAttendanceForm.sessionDate) {
            toast.error("Please select a date");
            return;
        }

        if (!context.currentStudio?.id || !context.authToken) {
            toast.error("Missing required information");
            return;
        }

        try {
            // Record attendance for all selected students
            const studioId = context.currentStudio?.id;
            if (!studioId) {
                toast.error("Studio not found");
                return;
            }
            
            const attendancePromises = markAttendanceForm.selectedStudents.map((studentId) =>
                fetch(
                    `/api/admin/studios/${studioId}/classes/${classId}/attendance`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${context.authToken}`
                        },
                        body: JSON.stringify({
                            studentId,
                            sessionDate: markAttendanceForm.sessionDate,
                            status: markAttendanceForm.status,
                            notes: markAttendanceForm.notes || null
                        })
                    }
                )
            );

            const results = await Promise.all(attendancePromises);
            const errors = results.filter((res) => !res.ok);

            if (errors.length > 0) {
                throw new Error(`Failed to record attendance for ${errors.length} student(s)`);
            }

            toast.success(
                `Attendance recorded for ${markAttendanceForm.selectedStudents.length} student(s)`
            );
            setShowMarkAttendanceDialog(false);
            setMarkAttendanceForm({
                sessionDate: new Date().toISOString().split("T")[0],
                selectedStudents: [],
                status: "present",
                notes: ""
            });
            fetchClassData(); // Refresh attendance records
        } catch (err: any) {
            console.error("Error recording attendance", err);
            toast.error(err.message || "Failed to record attendance");
        }
    };

    // Update enrollment status
    const handleUpdateEnrollmentStatus = async (
        enrollmentId: string,
        status: "active" | "dropped" | "completed"
    ) => {
        if (!context.currentStudio?.id || !context.authToken) {
            toast.error("Missing required information");
            return;
        }

        try {
            const res = await fetch(
                `/api/admin/studios/${context.currentStudio.id}/classes/${classId}/enrollments/${enrollmentId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${context.authToken}`
                    },
                    body: JSON.stringify({ status })
                }
            );

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error || "Failed to update enrollment status");
            }

            toast.success("Enrollment status updated");
            fetchClassData(); // Refresh enrollments
        } catch (err: any) {
            console.error("Error updating enrollment status", err);
            toast.error(err.message || "Failed to update enrollment status");
        }
    };

    // Update payment status
    const handleUpdatePaymentStatus = async (
        enrollmentId: string,
        paymentStatus: "paid" | "pending" | "overdue",
        amountPaid?: number
    ) => {
        if (!context.currentStudio?.id || !context.authToken) {
            toast.error("Missing required information");
            return;
        }

        try {
            const updateData: any = { paymentStatus };
            if (amountPaid !== undefined) {
                updateData.amountPaid = amountPaid;
            }

            const res = await fetch(
                `/api/admin/studios/${context.currentStudio.id}/classes/${classId}/enrollments/${enrollmentId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${context.authToken}`
                    },
                    body: JSON.stringify(updateData)
                }
            );

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error || "Failed to update payment status");
            }

            toast.success("Payment status updated");
            fetchClassData(); // Refresh enrollments
        } catch (err: any) {
            console.error("Error updating payment status", err);
            toast.error(err.message || "Failed to update payment status");
        }
    };

    const addPricingTier = async () => {
        if (!context.currentStudio?.id || !context.authToken) {
            toast.error("Missing required information");
            return;
        }

        // Use a default price of $100 (10000 cents) instead of 0
        const defaultPriceCents = 10000; // $100.00

        try {
            const res = await fetch(
                `/api/admin/studios/${context.currentStudio.id}/classes/${classId}/pricing-tiers`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${context.authToken}`
                    },
                    body: JSON.stringify({
            name: "New Tier",
                        priceCents: defaultPriceCents,
            description: "",
                        isDefault: false
                    })
                }
            );

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error || "Failed to create pricing tier");
            }

            const data = await res.json();
            const newTier: PricingTier = {
                id: data.pricingTier.id,
                name: data.pricingTier.name,
                price: data.pricingTier.price,
                description: data.pricingTier.description || "",
                isDefault: data.pricingTier.isDefault,
                isActive: data.pricingTier.isActive,
                enrollmentCount: data.pricingTier.enrollmentCount || 0
        };
        setPricingTiers([...pricingTiers, newTier]);
            toast.success("Pricing tier created");
            fetchClassData(); // Refresh to get updated counts
        } catch (err: any) {
            console.error("Error creating pricing tier", err);
            toast.error(err.message || "Failed to create pricing tier");
        }
    };

    // Update local editing state (no API call)
    const updatePricingTierLocal = (id: string, field: keyof PricingTier, value: any) => {
        setEditingTiers((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value
            }
        }));
    };

    // Get the current value for a field (either edited or original)
    const getTierFieldValue = (tier: PricingTier, field: keyof PricingTier): any => {
        if (editingTiers[tier.id] && editingTiers[tier.id][field] !== undefined) {
            return editingTiers[tier.id][field];
        }
        return tier[field];
    };

    // Check if a tier has unsaved changes
    const hasUnsavedChanges = (tierId: string): boolean => {
        return editingTiers[tierId] !== undefined && Object.keys(editingTiers[tierId]).length > 0;
    };

    // Save pricing tier changes
    const savePricingTier = async (id: string) => {
        if (!context.currentStudio?.id || !context.authToken) {
            toast.error("Missing required information");
            return;
        }

        const tier = pricingTiers.find((t) => t.id === id);
        if (!tier) {
            toast.error("Pricing tier not found");
            return;
        }

        const edits = editingTiers[id];
        if (!edits || Object.keys(edits).length === 0) {
            return; // No changes to save
        }

        try {
            const updateData: any = {};
            
            if (edits.price !== undefined) {
                const priceInCents = Math.round(edits.price * 100);
                if (priceInCents <= 0) {
                    toast.error("Price must be greater than 0");
                    return;
                }
                updateData.price = edits.price;
            }
            if (edits.name !== undefined) updateData.name = edits.name;
            if (edits.description !== undefined) updateData.description = edits.description;
            if (edits.isDefault !== undefined) updateData.isDefault = edits.isDefault;
            if (edits.isActive !== undefined) updateData.isActive = edits.isActive;

            const res = await fetch(
                `/api/admin/studios/${context.currentStudio.id}/classes/${classId}/pricing-tiers/${id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${context.authToken}`
                    },
                    body: JSON.stringify(updateData)
                }
            );

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error || "Failed to update pricing tier");
            }

            const data = await res.json();
            // Update local state with the response data
        setPricingTiers((prev) =>
                prev.map((t) => {
                    if (t.id === id) {
                        return {
                            ...t,
                            name: data.pricingTier?.name ?? t.name,
                            price: data.pricingTier?.price ?? t.price,
                            description: data.pricingTier?.description ?? t.description,
                            isDefault: data.pricingTier?.isDefault ?? t.isDefault,
                            isActive: data.pricingTier?.isActive ?? t.isActive,
                            enrollmentCount: data.pricingTier?.enrollmentCount ?? t.enrollmentCount
                        };
                    }
                    return t;
                })
            );

            // Clear editing state for this tier
            setEditingTiers((prev) => {
                const newState = { ...prev };
                delete newState[id];
                return newState;
            });

            toast.success("Pricing tier updated");
            fetchClassData(); // Refresh to get updated counts
        } catch (err: any) {
            console.error("Error updating pricing tier", err);
            toast.error(err.message || "Failed to update pricing tier");
        }
    };

    // Cancel editing for a tier
    const cancelPricingTierEdit = (id: string) => {
        setEditingTiers((prev) => {
            const newState = { ...prev };
            delete newState[id];
            return newState;
        });
    };

    // Update class settings
    const handleUpdateClassSettings = async () => {
        if (!context.currentStudio?.id || !context.authToken) {
            toast.error("Missing required information");
            return;
        }

        try {
            const updateData: any = {};
            if (settingsForm.name !== classData?.name) {
                updateData.name = settingsForm.name;
            }
            if (settingsForm.description !== classData?.description) {
                updateData.description = settingsForm.description;
            }
            if (settingsForm.instructorId !== classData?.instructor_id) {
                updateData.instructorId = settingsForm.instructorId || null;
            }

            if (Object.keys(updateData).length === 0) {
                toast.info("No changes to save");
                return;
            }

            const res = await fetch(
                `/api/admin/studios/${context.currentStudio.id}/classes/${classId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${context.authToken}`
                    },
                    body: JSON.stringify(updateData)
                }
            );

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error || "Failed to update class");
            }

            toast.success("Class information updated successfully");
            fetchClassData(); // Refresh to get updated data
        } catch (err: any) {
            console.error("Error updating class settings", err);
            toast.error(err.message || "Failed to update class");
        }
    };

    const deletePricingTier = async (id: string) => {
        if (!context.currentStudio?.id || !context.authToken) {
            toast.error("Missing required information");
            return;
        }

        if (!confirm("Are you sure you want to delete this pricing tier?")) {
            return;
        }

        try {
            const res = await fetch(
                `/api/admin/studios/${context.currentStudio.id}/classes/${classId}/pricing-tiers/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${context.authToken}`
                    }
                }
            );

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error || "Failed to delete pricing tier");
            }

        setPricingTiers((prev) => prev.filter((tier) => tier.id !== id));
        toast.success("Pricing tier deleted");
            fetchClassData(); // Refresh to get updated counts
        } catch (err: any) {
            console.error("Error deleting pricing tier", err);
            toast.error(err.message || "Failed to delete pricing tier");
        }
    };

    const addDiscountCode = async () => {
        if (!context.currentStudio?.id || !context.authToken) {
            toast.error("Missing required information");
            return;
        }

        try {
            const res = await fetch(
                `/api/admin/studios/${context.currentStudio.id}/classes/${classId}/discount-codes`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${context.authToken}`
                    },
                    body: JSON.stringify({
            code: "",
            type: "percentage",
            value: 0,
            description: "",
                        expiryDate: null,
                        usageLimit: 0
                    })
                }
            );

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error || "Failed to create discount code");
            }

            const data = await res.json();
            const newCode: DiscountCode = {
                id: data.code.id,
                code: data.code.code,
                type: data.code.type,
                value: data.code.value,
                description: data.code.description || "",
                expiryDate: data.code.expiry_date || "",
                usageLimit: data.code.usage_limit || 0,
                usageCount: data.code.usage_count || 0,
                isActive: data.code.is_active
        };
        setDiscountCodes([...discountCodes, newCode]);
            toast.success("Discount code created");
            fetchClassData(); // Refresh to get updated counts
        } catch (err: any) {
            console.error("Error creating discount code", err);
            toast.error(err.message || "Failed to create discount code");
        }
    };

    const updateDiscountCode = async (id: string, field: keyof DiscountCode, value: any) => {
        if (!context.currentStudio?.id || !context.authToken) {
            toast.error("Missing required information");
            return;
        }

        try {
            const updateData: any = {};
            if (field === "code") {
                updateData.code = value.toUpperCase();
            } else if (field === "type") {
                updateData.type = value;
            } else if (field === "value") {
                updateData.value = value;
            } else if (field === "description") {
                updateData.description = value;
            } else if (field === "expiryDate") {
                updateData.expiry_date = value || null;
            } else if (field === "usageLimit") {
                updateData.usage_limit = value;
            } else if (field === "isActive") {
                updateData.is_active = value;
            }

            const res = await fetch(
                `/api/admin/studios/${context.currentStudio.id}/classes/${classId}/discount-codes/${id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${context.authToken}`
                    },
                    body: JSON.stringify(updateData)
                }
            );

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error || "Failed to update discount code");
            }

        setDiscountCodes((prev) =>
            prev.map((code) => (code.id === id ? { ...code, [field]: value } : code))
        );
            toast.success("Discount code updated");
            fetchClassData(); // Refresh to get updated counts
        } catch (err: any) {
            console.error("Error updating discount code", err);
            toast.error(err.message || "Failed to update discount code");
        }
    };

    const deleteDiscountCode = async (id: string) => {
        if (!context.currentStudio?.id || !context.authToken) {
            toast.error("Missing required information");
            return;
        }

        if (!confirm("Are you sure you want to delete this discount code?")) {
            return;
        }

        try {
            const res = await fetch(
                `/api/admin/studios/${context.currentStudio.id}/classes/${classId}/discount-codes/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${context.authToken}`
                    }
                }
            );

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error || "Failed to delete discount code");
            }

        setDiscountCodes((prev) => prev.filter((code) => code.id !== id));
        toast.success("Discount code deleted");
            fetchClassData(); // Refresh to get updated counts
        } catch (err: any) {
            console.error("Error deleting discount code", err);
            toast.error(err.message || "Failed to delete discount code");
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        if (!context.currentStudio?.id || !context.authToken) {
            toast.error("Missing required information");
            return;
        }

        // For now, we'll convert to base64 and send URLs
        // In production, you'd want to upload to a storage service first
        const uploadPromises = Array.from(files).map(async (file) => {
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageUrl = e.target?.result as string;
                    resolve(imageUrl);
                };
                reader.readAsDataURL(file);
            });
        });

        try {
            const imageUrls = await Promise.all(uploadPromises);

            const res = await fetch(
                `/api/admin/studios/${context.currentStudio.id}/classes/${classId}/images`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${context.authToken}`
                    },
                    body: JSON.stringify({
                        images: imageUrls.map((url, index) => ({
                            url,
                            altText: `Class image ${classImages.length + index + 1}`,
                            isMain: classImages.length === 0 && index === 0
                        }))
                    })
                }
            );

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error || "Failed to upload images");
            }

            toast.success("Images uploaded successfully");
            fetchClassData(); // Refresh to get updated images
        } catch (err: any) {
            console.error("Error uploading images", err);
            toast.error(err.message || "Failed to upload images");
        }
    };

    const removeImage = async (id: string) => {
        if (!context.currentStudio?.id || !context.authToken) {
            toast.error("Missing required information");
            return;
        }

        if (!confirm("Are you sure you want to remove this image?")) {
            return;
        }

        try {
            const res = await fetch(
                `/api/admin/studios/${context.currentStudio.id}/classes/${classId}/images/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${context.authToken}`
                    }
                }
            );

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error || "Failed to remove image");
            }

        setClassImages((prev) => prev.filter((img) => img.id !== id));
        toast.success("Image removed");
            fetchClassData(); // Refresh to get updated images
        } catch (err: any) {
            console.error("Error removing image", err);
            toast.error(err.message || "Failed to remove image");
        }
    };

    const setMainImage = async (id: string) => {
        if (!context.currentStudio?.id || !context.authToken) {
            toast.error("Missing required information");
            return;
        }

        try {
            const res = await fetch(
                `/api/admin/studios/${context.currentStudio.id}/classes/${classId}/images/${id}/set-main`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${context.authToken}`
                    }
                }
            );

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error || "Failed to set main image");
            }

        setClassImages((prev) => prev.map((img) => ({ ...img, isMain: img.id === id })));
        toast.success("Main image updated");
            fetchClassData(); // Refresh to get updated images
        } catch (err: any) {
            console.error("Error setting main image", err);
            toast.error(err.message || "Failed to set main image");
        }
    };

    const updateReviewVisibility = async (id: string, isPublic: boolean) => {
        if (!context.currentStudio?.id || !context.authToken) {
            toast.error("Missing required information");
            return;
        }

        try {
            const res = await fetch(
                `/api/admin/studios/${context.currentStudio.id}/classes/${classId}/reviews/${id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${context.authToken}`
                    },
                    body: JSON.stringify({ isPublic })
                }
            );

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error || "Failed to update review visibility");
            }

        setStudentReviews((prev) =>
            prev.map((review) => (review.id === id ? { ...review, isPublic } : review))
        );
            toast.success("Review visibility updated");
            fetchClassData(); // Refresh to get updated reviews
        } catch (err: any) {
            console.error("Error updating review visibility", err);
            toast.error(err.message || "Failed to update review visibility");
        }
    };

    const deleteReview = async (id: string) => {
        if (!context.currentStudio?.id || !context.authToken) {
            toast.error("Missing required information");
            return;
        }

        if (!confirm("Are you sure you want to delete this review?")) {
            return;
        }

        try {
            const res = await fetch(
                `/api/admin/studios/${context.currentStudio.id}/classes/${classId}/reviews/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${context.authToken}`
                    }
                }
            );

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error || "Failed to delete review");
            }

        setStudentReviews((prev) => prev.filter((review) => review.id !== id));
        toast.success("Review deleted");
            fetchClassData(); // Refresh to get updated reviews
        } catch (err: any) {
            console.error("Error deleting review", err);
            toast.error(err.message || "Failed to delete review");
        }
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
    const handleUpdateClassBadges = (badges: any[]) => {
        setClassBadges(badges);
    };

    const handleAwardBadge = (badgeId: string, studentId: string, studentName: string) => {
        const now = new Date().toISOString();
        const newBadge: StudentBadge = {
            id: `sb_${Date.now()}`,
            badgeId,
            classId: classId,
            studentId,
            studentName,
            awardedDate: now,
            awardedBy: "Current Instructor",
            awardMethod: "manual",
            status: "active",
            verificationCode: `${classId.toUpperCase()}-${Date.now()}`,
            socialShareEnabled: true,
            finalGrade: (studentGradeStats as any)[studentId]?.finalGrade || 0,
            finalAttendance: (studentAttendanceStats as any)[studentId]?.percentage || 0,
            projectsCompleted: (studentGradeStats as any)[studentId]?.projectsCompleted || 0,
            skillsAchieved: (studentSkillsStats as any)[studentId] || [],
            instructorNotes: "Badge awarded for meeting all requirements",
            displayOnProfile: true,
            shareCount: 0,
            viewCount: 0,
            createdAt: now,
            updatedAt: now
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

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading class data...</span>
                </div>
            </div>
        );
    }

    if (!displayClassData) {
        return (
            <div className="p-6">
                <Button variant="ghost" onClick={onBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Classes
                </Button>
                <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Class not found</h3>
                    <p className="text-muted-foreground">The class you're looking for doesn't exist</p>
                </div>
            </div>
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
                    <h1 className="text-2xl font-bold">{displayClassData.name}</h1>
                    <p className="text-muted-foreground">Instructor: {displayClassData.instructor}</p>
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
                            {displayClassData.enrolled}/{displayClassData.capacity}
                        </div>
                        <div className="mt-2">
                            <Progress
                                value={
                                    displayClassData.capacity > 0
                                        ? (displayClassData.enrolled / displayClassData.capacity) * 100
                                        : 0
                                }
                                className="h-2"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            {displayClassData.waitlist} on waitlist
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
                            {displayClassData.sessionsCompleted}/{displayClassData.totalSessions}
                        </div>
                        <div className="mt-2">
                            <Progress
                                value={
                                    displayClassData.totalSessions > 0
                                        ? (displayClassData.sessionsCompleted /
                                              displayClassData.totalSessions) *
                                          100
                                        : 0
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
                            ${(classData?.revenue_cents || 0) / 100}
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
                            <span>{displayClassData.averageRating.toFixed(1)}</span>
                            <div className="flex">
                                {renderStars(Math.round(displayClassData.averageRating))}
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            {displayClassData.totalReviews} reviews
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
                            <Button
                                onClick={() => setShowAddStudentDialog(true)}
                            >
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
                                                selectedStudents.length === enrollments.length &&
                                                enrollments.length > 0
                                            }
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedStudents(
                                                        enrollments.map((e) => e.id)
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
                                {isLoadingEnrollments ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center py-8"
                                        >
                                            <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                ) : enrollments.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center py-8 text-muted-foreground"
                                        >
                                            No enrollments yet
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    <>
                                        {enrollments
                                            .filter((e) =>
                                                searchTerm
                                                    ? e.studentName
                                                          .toLowerCase()
                                                          .includes(searchTerm.toLowerCase()) ||
                                                      e.studentEmail
                                                          .toLowerCase()
                                                          .includes(searchTerm.toLowerCase())
                                                    : true
                                            )
                                            .map((enrollment) => (
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
                                                    <AvatarFallback>
                                                        {enrollment.studentName || "Unnamed Student"
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
                                                <div>{enrollment.phone || "-"}</div>
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
                                                    {enrollment.pricingTier?.name || "No tier"}
                                                </div>
                                                {enrollment.discountApplied && (
                                                    <div className="text-green-600">
                                                        Discount: {enrollment.discountApplied.code}
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
                                                    <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger>
                                                            Update Status
                                                        </DropdownMenuSubTrigger>
                                                        <DropdownMenuSubContent>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleUpdateEnrollmentStatus(
                                                                        enrollment.id,
                                                                        "active"
                                                                    )
                                                                }
                                                            >
                                                                Active
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleUpdateEnrollmentStatus(
                                                                        enrollment.id,
                                                                        "dropped"
                                                                    )
                                                                }
                                                            >
                                                                Dropped
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleUpdateEnrollmentStatus(
                                                                        enrollment.id,
                                                                        "completed"
                                                                    )
                                                                }
                                                            >
                                                                Completed
                                                            </DropdownMenuItem>
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuSub>
                                                    <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger>
                                                        Update Payment
                                                        </DropdownMenuSubTrigger>
                                                        <DropdownMenuSubContent>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleUpdatePaymentStatus(
                                                                        enrollment.id,
                                                                        "paid"
                                                                    )
                                                                }
                                                            >
                                                                Mark as Paid
                                                    </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleUpdatePaymentStatus(
                                                                        enrollment.id,
                                                                        "pending"
                                                                    )
                                                                }
                                                            >
                                                                Mark as Pending
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleUpdatePaymentStatus(
                                                                        enrollment.id,
                                                                        "overdue"
                                                                    )
                                                                }
                                                            >
                                                                Mark as Overdue
                                                            </DropdownMenuItem>
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuSub>
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() =>
                                                            handleRemoveEnrollment(
                                                                enrollment.id,
                                                                enrollment.studentName
                                                            )
                                                        }
                                                    >
                                                        Remove from Class
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                    </>
                                )}
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
                            <Button onClick={() => setShowMarkAttendanceDialog(true)}>
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
                                {attendanceRecords.map((record) => (
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
                            <Button onClick={() => setShowAddToWaitlistDialog(true)}>
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
                                {waitlistEntries.map((entry) => (
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
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handlePromoteFromWaitlist(
                                                                entry.id,
                                                                entry.studentName
                                                            )
                                                        }
                                                    >
                                                        Move to Class
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        Send Message
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        Toggle Notifications
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() =>
                                                            handleRemoveFromWaitlist(
                                                                entry.id,
                                                                entry.studentName
                                                            )
                                                        }
                                                    >
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
                        students={students}
                        studentBadges={studentBadges}
                        onAwardBadge={handleAwardBadge}
                        onRevokeBadge={handleRevokeBadge}
                        attendanceRecords={studentAttendanceStats}
                        gradeRecords={studentGradeStats}
                        skillsRecords={studentSkillsStats}
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
                        {pricingTiers.map((tier) => {
                            const hasChanges = hasUnsavedChanges(tier.id);
                            const displayTier = {
                                ...tier,
                                name: getTierFieldValue(tier, "name") as string,
                                price: getTierFieldValue(tier, "price") as number,
                                description: getTierFieldValue(tier, "description") as string,
                                isDefault: getTierFieldValue(tier, "isDefault") as boolean,
                                isActive: getTierFieldValue(tier, "isActive") as boolean
                            };

                            return (
                                <Card key={tier.id} className={hasChanges ? "border-orange-500" : ""}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Tier Name</Label>
                                                    <Input
                                                            value={displayTier.name}
                                                        onChange={(e) =>
                                                                updatePricingTierLocal(
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
                                                                step="0.01"
                                                            className="pl-10"
                                                                value={displayTier.price}
                                                            onChange={(e) =>
                                                                    updatePricingTierLocal(
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
                                                        value={displayTier.description}
                                                    onChange={(e) =>
                                                            updatePricingTierLocal(
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
                                                                checked={displayTier.isDefault}
                                                            onCheckedChange={(checked) => {
                                                                    updatePricingTierLocal(
                                                                        tier.id,
                                                                        "isDefault",
                                                                        checked
                                                                    );
                                                            }}
                                                        />
                                                        <Label>Default pricing</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Switch
                                                                checked={displayTier.isActive}
                                                            onCheckedChange={(checked) =>
                                                                    updatePricingTierLocal(
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
                                            <div className="flex items-center space-x-2 ml-4">
                                                {hasChanges && (
                                                    <>
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            onClick={() => savePricingTier(tier.id)}
                                                        >
                                                            <Save className="w-4 h-4 mr-2" />
                                                            Save
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => cancelPricingTierEdit(tier.id)}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => deletePricingTier(tier.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                            </div>
                                    </div>
                                </CardContent>
                            </Card>
                            );
                        })}
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
                                        value={settingsForm.name}
                                        onChange={(e) =>
                                            setSettingsForm((prev) => ({
                                                ...prev,
                                                name: e.target.value
                                            }))
                                        }
                                        placeholder="e.g., Wheel Throwing Fundamentals"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-instructor">Instructor *</Label>
                                    <Select
                                        value={settingsForm.instructorId}
                                        onValueChange={(value) =>
                                            setSettingsForm((prev) => ({
                                                ...prev,
                                                instructorId: value
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select instructor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {instructors.length === 0 ? (
                                                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                                    No instructors available
                                                </div>
                                            ) : (
                                                instructors.map((instructor) => (
                                                    <SelectItem
                                                        key={instructor.id}
                                                        value={instructor.id}
                                                    >
                                                        {instructor.name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Description *</Label>
                                <Textarea
                                    id="edit-description"
                                    value={settingsForm.description}
                                    onChange={(e) =>
                                        setSettingsForm((prev) => ({
                                            ...prev,
                                            description: e.target.value
                                        }))
                                    }
                                    placeholder="Describe what students will learn in this class..."
                                    rows={4}
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        // Reset form to original values
                                        setSettingsForm({
                                            name: classData?.name || "",
                                            description: classData?.description || "",
                                            instructorId: classData?.instructor_id || ""
                                        });
                                    }}
                                >
                                    Cancel Changes
                                </Button>
                                <Button onClick={handleUpdateClassSettings}>
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

            {/* Add Student Dialog */}
            <Dialog
                open={showAddStudentDialog}
                onOpenChange={setShowAddStudentDialog}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add Student to Class</DialogTitle>
                        <DialogDescription>
                            Select a student and configure their enrollment details
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="student-select">Student *</Label>
                            {isLoadingStudents ? (
                                <div className="flex items-center space-x-2 py-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm text-muted-foreground">Loading students...</span>
                                </div>
                            ) : (
                                <Select
                                    value={addStudentForm.studentId}
                                    onValueChange={(value) =>
                                        setAddStudentForm((prev) => ({ ...prev, studentId: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a student" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableStudents.length === 0 ? (
                                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                                No available students
                                            </div>
                                        ) : (
                                            availableStudents.map((student) => (
                                                <SelectItem key={student.id} value={student.id}>
                                                    {student.name} ({student.email})
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="pricing-tier-select">Pricing Tier</Label>
                                <Select
                                    value={addStudentForm.pricingTierId || undefined}
                                    onValueChange={(value) =>
                                        setAddStudentForm((prev) => ({ ...prev, pricingTierId: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select pricing tier (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pricingTiers
                                            .filter((tier) => tier.isActive)
                                            .map((tier) => (
                                                <SelectItem key={tier.id} value={tier.id}>
                                                    {tier.name} - ${tier.price}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="discount-code-select">Discount Code</Label>
                                <Select
                                    value={addStudentForm.discountCodeId || undefined}
                                    onValueChange={(value) =>
                                        setAddStudentForm((prev) => ({ ...prev, discountCodeId: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select discount code (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {discountCodes
                                            .filter((code) => code.isActive)
                                            .map((code) => (
                                                <SelectItem key={code.id} value={code.id}>
                                                    {code.code} - {code.type === "percentage" ? `${code.value}%` : `$${code.value}`}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={addStudentForm.phone}
                                    onChange={(e) =>
                                        setAddStudentForm((prev) => ({ ...prev, phone: e.target.value }))
                                    }
                                    placeholder="(555) 123-4567"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="emergency-contact">Emergency Contact</Label>
                                <Input
                                    id="emergency-contact"
                                    value={addStudentForm.emergencyContact}
                                    onChange={(e) =>
                                        setAddStudentForm((prev) => ({
                                            ...prev,
                                            emergencyContact: e.target.value
                                        }))
                                    }
                                    placeholder="Name and phone"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowAddStudentDialog(false);
                                    setAddStudentForm({
                                        studentId: "",
                                        pricingTierId: "",
                                        discountCodeId: "",
                                        emergencyContact: "",
                                        phone: ""
                                    });
                                }}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleAddStudentSubmit}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Student
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add to Waitlist Dialog */}
            <Dialog
                open={showAddToWaitlistDialog}
                onOpenChange={setShowAddToWaitlistDialog}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Student to Waitlist</DialogTitle>
                        <DialogDescription>
                            Select a student to add to the waitlist
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="waitlist-student-select">Student *</Label>
                            {isLoadingStudents ? (
                                <div className="flex items-center space-x-2 py-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm text-muted-foreground">Loading students...</span>
                                </div>
                            ) : (
                                <Select
                                    value={addToWaitlistForm.studentId}
                                    onValueChange={(value) =>
                                        setAddToWaitlistForm((prev) => ({ ...prev, studentId: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a student" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableStudents.length === 0 ? (
                                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                                No available students
                                            </div>
                                        ) : (
                                            availableStudents.map((student) => (
                                                <SelectItem key={student.id} value={student.id}>
                                                    {student.name} ({student.email})
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowAddToWaitlistDialog(false);
                                    setAddToWaitlistForm({ studentId: "" });
                                }}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleAddToWaitlistSubmit}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add to Waitlist
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Mark Attendance Dialog */}
            <Dialog
                open={showMarkAttendanceDialog}
                onOpenChange={setShowMarkAttendanceDialog}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Mark Attendance</DialogTitle>
                        <DialogDescription>
                            Select a date and students to record attendance
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="attendance-date">Session Date *</Label>
                                <Input
                                    id="attendance-date"
                                    type="date"
                                    value={markAttendanceForm.sessionDate}
                                    onChange={(e) =>
                                        setMarkAttendanceForm((prev) => ({
                                            ...prev,
                                            sessionDate: e.target.value
                                        }))
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="attendance-status">Status *</Label>
                                <Select
                                    value={markAttendanceForm.status}
                                    onValueChange={(value: "present" | "absent" | "late" | "excused") =>
                                        setMarkAttendanceForm((prev) => ({ ...prev, status: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="present">Present</SelectItem>
                                        <SelectItem value="absent">Absent</SelectItem>
                                        <SelectItem value="late">Late</SelectItem>
                                        <SelectItem value="excused">Excused</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Select Students *</Label>
                            <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                                {enrollments.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No enrolled students
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2 pb-2 border-b">
                                            <Checkbox
                                                checked={
                                                    markAttendanceForm.selectedStudents.length ===
                                                        enrollments.length && enrollments.length > 0
                                                }
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setMarkAttendanceForm((prev) => ({
                                                            ...prev,
                                                            selectedStudents: enrollments.map((e) => e.studentId)
                                                        }));
                                                    } else {
                                                        setMarkAttendanceForm((prev) => ({
                                                            ...prev,
                                                            selectedStudents: []
                                                        }));
                                                    }
                                                }}
                                            />
                                            <Label className="text-sm font-medium">
                                                Select All ({enrollments.length})
                                            </Label>
                                        </div>
                                        {enrollments.map((enrollment) => (
                                            <div
                                                key={enrollment.id}
                                                className="flex items-center space-x-2"
                                            >
                                                <Checkbox
                                                    checked={markAttendanceForm.selectedStudents.includes(
                                                        enrollment.studentId
                                                    )}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setMarkAttendanceForm((prev) => ({
                                                                ...prev,
                                                                selectedStudents: [
                                                                    ...prev.selectedStudents,
                                                                    enrollment.studentId
                                                                ]
                                                            }));
                                                        } else {
                                                            setMarkAttendanceForm((prev) => ({
                                                                ...prev,
                                                                selectedStudents: prev.selectedStudents.filter(
                                                                    (id) => id !== enrollment.studentId
                                                                )
                                                            }));
                                                        }
                                                    }}
                                                />
                                                <Label className="text-sm">
                                                    {enrollment.studentName}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {markAttendanceForm.selectedStudents.length} student(s) selected
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="attendance-notes">Notes (optional)</Label>
                            <Textarea
                                id="attendance-notes"
                                value={markAttendanceForm.notes}
                                onChange={(e) =>
                                    setMarkAttendanceForm((prev) => ({ ...prev, notes: e.target.value }))
                                }
                                placeholder="Add any notes about this attendance session..."
                                rows={3}
                            />
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowMarkAttendanceDialog(false);
                                    setMarkAttendanceForm({
                                        sessionDate: new Date().toISOString().split("T")[0],
                                        selectedStudents: [],
                                        status: "present",
                                        notes: ""
                                    });
                                }}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleMarkAttendanceSubmit}>
                                <Check className="w-4 h-4 mr-2" />
                                Mark Attendance
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
