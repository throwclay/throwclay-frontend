import { useState } from "react";
import {
    Trophy,
    Award,
    Star,
    Calendar,
    User,
    Download,
    Share2,
    Eye,
    Check,
    X,
    Clock,
    Filter,
    Search,
    MoreHorizontal,
    ExternalLink,
    Medal,
    Crown,
    Target,
    Zap,
    Heart,
    Sparkles
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
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
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import type { StudentBadge, BadgeDesign, ClassBadge } from "@/app/context/AppContext";
import { toast } from "sonner";

interface BadgeManagementProps {
    badges: StudentBadge[];
    isStudioView?: boolean;
    studentId?: string;
    onAwardBadge?: (badgeId: string, studentId: string) => void;
    onRevokeBadge?: (badgeId: string) => void;
    onShareBadge?: (badge: StudentBadge) => void;
}

const SHAPE_ICONS = {
    circle: "rounded-full",
    square: "rounded-lg",
    shield: "rounded-lg",
    hexagon: "rounded-lg",
    star: "rounded-lg",
    diamond: "rounded-lg"
};

export function BadgeManagement({
    badges,
    isStudioView = false,
    studentId,
    onAwardBadge,
    onRevokeBadge,
    onShareBadge
}: BadgeManagementProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "revoked">("all");
    const [selectedBadge, setSelectedBadge] = useState<StudentBadge | null>(null);
    const [showBadgeDetails, setShowBadgeDetails] = useState(false);

    // Mock additional badge data for demonstration
    const mockClassBadges: ClassBadge[] = [
        {
            id: "badge_wheel_mastery",
            classId: "class_1",
            name: "Wheel Throwing Master",
            description:
                "Mastered the art of wheel throwing with consistent centering and pulling techniques",
            design: {
                id: "design_1",
                name: "Wheel Master",
                shape: "circle",
                backgroundColor: "#8B4513",
                borderColor: "#5D2F0A",
                borderWidth: 3,
                iconType: "emoji",
                icon: "🏺",
                textColor: "#FFFFFF",
                fontSize: "medium",
                gradientEnabled: true,
                gradientColors: ["#8B4513", "#D2B48C"],
                gradientDirection: "diagonal",
                shadowEnabled: true,
                shadowColor: "#000000",
                shadowBlur: 10,
                createdAt: "2025-01-01",
                updatedAt: "2025-01-01"
            },
            requirements: [
                {
                    id: "req_1",
                    type: "attendance",
                    description: "Attend at least 80% of class sessions",
                    criteria: { attendancePercentage: 80 },
                    isRequired: true
                },
                {
                    id: "req_2",
                    type: "skill",
                    description: "Demonstrate consistent centering and pulling",
                    criteria: { skillsRequired: ["centering", "pulling", "shaping"] },
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
    ];

    const filteredBadges = badges.filter((badge) => {
        const matchesSearch =
            badge.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            badge.studentName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || badge.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const renderBadgePreview = (
        badge: StudentBadge,
        size: "small" | "medium" | "large" = "medium"
    ) => {
        // Find the associated class badge to get design
        const classBadge = mockClassBadges.find((cb) => cb.id === badge.badgeId);
        if (!classBadge) return null;

        const design = classBadge.design;

        const sizeMap = {
            small: { width: 40, height: 40, iconSize: 16 },
            medium: { width: 80, height: 80, iconSize: 32 },
            large: { width: 120, height: 120, iconSize: 48 }
        };

        const dimensions = sizeMap[size];

        const gradientStyle =
            design.gradientEnabled && design.gradientColors
                ? {
                      background: `linear-gradient(${
                          design.gradientDirection === "vertical"
                              ? "180deg"
                              : design.gradientDirection === "horizontal"
                                ? "90deg"
                                : "45deg"
                      }, ${design.gradientColors.join(", ")})`
                  }
                : {
                      backgroundColor: design.backgroundColor
                  };

        const shadowStyle = design.shadowEnabled
            ? {
                  boxShadow: `0 ${design.shadowBlur || 10}px ${(design.shadowBlur || 10) * 2}px ${design.shadowColor || "#000000"}40`
              }
            : {};

        return (
            <div className="relative">
                <div
                    className={`relative flex items-center justify-center border-solid ${SHAPE_ICONS[design.shape]} ${
                        badge.status === "revoked" ? "opacity-50 grayscale" : ""
                    }`}
                    style={{
                        width: dimensions.width,
                        height: dimensions.height,
                        borderWidth: design.borderWidth,
                        borderColor: design.borderColor,
                        ...gradientStyle,
                        ...shadowStyle
                    }}
                >
                    {/* Icon */}
                    <div className="flex items-center justify-center">
                        {design.iconType === "emoji" && design.icon && (
                            <span style={{ fontSize: dimensions.iconSize, lineHeight: 1 }}>
                                {design.icon}
                            </span>
                        )}
                        {design.iconType === "custom" && design.customIconUrl && (
                            <img
                                src={design.customIconUrl}
                                alt="Badge icon"
                                style={{
                                    width: dimensions.iconSize,
                                    height: dimensions.iconSize,
                                    objectFit: "contain"
                                }}
                            />
                        )}
                    </div>
                </div>

                {badge.status === "revoked" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <X className="w-6 h-6 text-red-500" />
                    </div>
                )}
            </div>
        );
    };

    const getBadgeStatusIcon = (status: string) => {
        switch (status) {
            case "active":
                return <Check className="w-4 h-4 text-green-500" />;
            case "revoked":
                return <X className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-yellow-500" />;
        }
    };

    const handleShareBadge = (badge: StudentBadge) => {
        if (onShareBadge) {
            onShareBadge(badge);
        } else {
            // Default sharing behavior
            const shareText = `I earned the "${mockClassBadges.find((cb) => cb.id === badge.badgeId)?.name}" badge! 🏆`;
            if (navigator.share) {
                navigator.share({
                    title: "My Badge Achievement",
                    text: shareText,
                    url: window.location.href
                });
            } else {
                navigator.clipboard.writeText(shareText);
                toast.success("Badge achievement copied to clipboard!");
            }
        }
    };

    const handleDownloadCertificate = (badge: StudentBadge) => {
        // Mock certificate download
        toast.success("Certificate download started");
    };

    const handleViewBadgeDetails = (badge: StudentBadge) => {
        setSelectedBadge(badge);
        setShowBadgeDetails(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">
                        {isStudioView ? "Student Badges" : "My Badges"}
                    </h2>
                    <p className="text-muted-foreground">
                        {isStudioView
                            ? "Manage and track student badge achievements"
                            : "View your earned badges and achievements"}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge
                        variant="secondary"
                        className="flex items-center space-x-1"
                    >
                        <Trophy className="w-3 h-3" />
                        <span>{badges.filter((b) => b.status === "active").length} Active</span>
                    </Badge>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                            <Trophy className="w-8 h-8 text-yellow-500" />
                            <div>
                                <div className="text-2xl font-semibold">
                                    {badges.filter((b) => b.status === "active").length}
                                </div>
                                <div className="text-sm text-muted-foreground">Active Badges</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                            <Calendar className="w-8 h-8 text-blue-500" />
                            <div>
                                <div className="text-2xl font-semibold">
                                    {
                                        badges.filter((b) => {
                                            const awardDate = new Date(b.awardedDate);
                                            const thirtyDaysAgo = new Date();
                                            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                                            return awardDate > thirtyDaysAgo;
                                        }).length
                                    }
                                </div>
                                <div className="text-sm text-muted-foreground">Recent Badges</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                            <Star className="w-8 h-8 text-purple-500" />
                            <div>
                                <div className="text-2xl font-semibold">
                                    {Math.round(
                                        badges
                                            .filter((b) => b.status === "active")
                                            .reduce((sum, b) => sum + (b.finalAttendance || 0), 0) /
                                            Math.max(badges.length, 1)
                                    )}
                                    %
                                </div>
                                <div className="text-sm text-muted-foreground">Avg Attendance</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                            <Award className="w-8 h-8 text-green-500" />
                            <div>
                                <div className="text-2xl font-semibold">
                                    {badges.filter((b) => b.awardMethod === "automatic").length}
                                </div>
                                <div className="text-sm text-muted-foreground">Auto Awarded</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder={
                            isStudioView ? "Search by student name..." : "Search badges..."
                        }
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select
                    value={statusFilter}
                    onValueChange={(value: any) => setStatusFilter(value)}
                >
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Badges</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="revoked">Revoked</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                </Button>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBadges.map((badge) => {
                    const classBadge = mockClassBadges.find((cb) => cb.id === badge.badgeId);

                    return (
                        <Card
                            key={badge.id}
                            className="overflow-hidden hover:shadow-md transition-shadow"
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                        {renderBadgePreview(badge, "medium")}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold truncate">
                                                {classBadge?.name || "Unknown Badge"}
                                            </h3>
                                            {isStudioView && (
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {badge.studentName}
                                                </p>
                                            )}
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
                                                onClick={() => handleViewBadgeDetails(badge)}
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleShareBadge(badge)}
                                            >
                                                <Share2 className="w-4 h-4 mr-2" />
                                                Share Badge
                                            </DropdownMenuItem>
                                            {badge.certificateUrl && (
                                                <DropdownMenuItem
                                                    onClick={() => handleDownloadCertificate(badge)}
                                                >
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Download Certificate
                                                </DropdownMenuItem>
                                            )}
                                            {isStudioView &&
                                                badge.status === "active" &&
                                                onRevokeBadge && (
                                                    <DropdownMenuItem
                                                        onClick={() => onRevokeBadge(badge.id)}
                                                        className="text-red-600"
                                                    >
                                                        <X className="w-4 h-4 mr-2" />
                                                        Revoke Badge
                                                    </DropdownMenuItem>
                                                )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0 space-y-3">
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {classBadge?.description || "No description available"}
                                </p>

                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center space-x-1">
                                        {getBadgeStatusIcon(badge.status)}
                                        <span className="capitalize">{badge.status}</span>
                                    </div>
                                    <span>{new Date(badge.awardedDate).toLocaleDateString()}</span>
                                </div>

                                {/* Achievement Stats */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span>Attendance</span>
                                        <span>{badge.finalAttendance}%</span>
                                    </div>
                                    <Progress
                                        value={badge.finalAttendance}
                                        className="h-1"
                                    />

                                    {badge.finalGrade && (
                                        <>
                                            <div className="flex justify-between text-xs">
                                                <span>Final Grade</span>
                                                <span>{badge.finalGrade}%</span>
                                            </div>
                                            <Progress
                                                value={badge.finalGrade}
                                                className="h-1"
                                            />
                                        </>
                                    )}
                                </div>

                                {/* Badge Actions */}
                                <div className="flex space-x-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => handleViewBadgeDetails(badge)}
                                    >
                                        <Eye className="w-3 h-3 mr-1" />
                                        View
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleShareBadge(badge)}
                                    >
                                        <Share2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {filteredBadges.length === 0 && (
                <div className="text-center py-12">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No badges found</h3>
                    <p className="text-muted-foreground">
                        {badges.length === 0
                            ? isStudioView
                                ? "No badges have been awarded yet"
                                : "You haven't earned any badges yet"
                            : "Try adjusting your search or filter criteria"}
                    </p>
                </div>
            )}

            {/* Badge Details Dialog */}
            <Dialog
                open={showBadgeDetails}
                onOpenChange={setShowBadgeDetails}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Badge Details</DialogTitle>
                        <DialogDescription>
                            Complete information about this badge achievement
                        </DialogDescription>
                    </DialogHeader>

                    {selectedBadge && (
                        <div className="space-y-6">
                            {/* Badge Header */}
                            <div className="flex items-center space-x-4">
                                {renderBadgePreview(selectedBadge, "large")}
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold">
                                        {
                                            mockClassBadges.find(
                                                (cb) => cb.id === selectedBadge.badgeId
                                            )?.name
                                        }
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {
                                            mockClassBadges.find(
                                                (cb) => cb.id === selectedBadge.badgeId
                                            )?.description
                                        }
                                    </p>
                                    <div className="flex items-center space-x-2 mt-2">
                                        {getBadgeStatusIcon(selectedBadge.status)}
                                        <Badge
                                            variant={
                                                selectedBadge.status === "active"
                                                    ? "default"
                                                    : "destructive"
                                            }
                                        >
                                            {selectedBadge.status === "active"
                                                ? "Active"
                                                : "Revoked"}
                                        </Badge>
                                        <Badge variant="secondary">
                                            {selectedBadge.awardMethod === "automatic"
                                                ? "Auto Awarded"
                                                : "Manual Award"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Award Information */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="font-medium">Award Information</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Awarded Date:
                                            </span>
                                            <span>
                                                {new Date(
                                                    selectedBadge.awardedDate
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Awarded By:
                                            </span>
                                            <span>{selectedBadge.awardedBy}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Verification Code:
                                            </span>
                                            <span className="font-mono text-xs">
                                                {selectedBadge.verificationCode}
                                            </span>
                                        </div>
                                        {isStudioView && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Student:
                                                </span>
                                                <span>{selectedBadge.studentName}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-medium">Achievement Metrics</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Final Attendance</span>
                                                <span>{selectedBadge.finalAttendance}%</span>
                                            </div>
                                            <Progress
                                                value={selectedBadge.finalAttendance}
                                                className="h-2"
                                            />
                                        </div>

                                        {selectedBadge.finalGrade && (
                                            <div>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>Final Grade</span>
                                                    <span>{selectedBadge.finalGrade}%</span>
                                                </div>
                                                <Progress
                                                    value={selectedBadge.finalGrade}
                                                    className="h-2"
                                                />
                                            </div>
                                        )}

                                        <div className="text-sm">
                                            <span className="text-muted-foreground">
                                                Projects Completed:
                                            </span>
                                            <span className="ml-2">
                                                {selectedBadge.projectsCompleted}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Skills Achieved */}
                            {selectedBadge.skillsAchieved.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="font-medium">Skills Achieved</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedBadge.skillsAchieved.map((skill) => (
                                            <Badge
                                                key={skill}
                                                variant="secondary"
                                            >
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Instructor Notes */}
                            {selectedBadge.instructorNotes && (
                                <div className="space-y-3">
                                    <h4 className="font-medium">Instructor Notes</h4>
                                    <div className="p-3 bg-muted rounded-lg text-sm">
                                        {selectedBadge.instructorNotes}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handleShareBadge(selectedBadge)}
                                >
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share Badge
                                </Button>
                                {selectedBadge.certificateUrl && (
                                    <Button
                                        variant="outline"
                                        onClick={() => handleDownloadCertificate(selectedBadge)}
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download Certificate
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        const verifyUrl = `${window.location.origin}/verify-badge/${selectedBadge.verificationCode}`;
                                        navigator.clipboard.writeText(verifyUrl);
                                        toast.success("Verification link copied to clipboard");
                                    }}
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Copy Verification Link
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
