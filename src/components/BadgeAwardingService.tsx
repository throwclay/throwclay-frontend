"use client";
import { useState, useEffect } from "react";
import { Check, X, Clock, Trophy, AlertCircle, Users, Award, Target } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { StudentBadge, ClassBadge, BadgeRequirement, User } from "@/app/context/AppContext";
import { toast } from "sonner";

interface BadgeAwardingServiceProps {
    classId: string;
    classBadges: ClassBadge[];
    students: User[];
    onAwardBadge: (badgeId: string, studentId: string, studentName: string) => void;
    onRevokeBadge: (badgeId: string) => void;
    studentBadges: StudentBadge[];
    attendanceRecords: Record<
        string,
        { percentage: number; sessionsAttended: number; totalSessions: number }
    >;
    gradeRecords: Record<string, { finalGrade: number; projectsCompleted: number }>;
    skillsRecords: Record<string, string[]>;
}

interface BadgeEligibility {
    badgeId: string;
    studentId: string;
    studentName: string;
    isEligible: boolean;
    requirements: {
        requirementId: string;
        type: "attendance" | "grade" | "skill" | "project";
        description: string;
        isRequired: boolean;
        isMet: boolean;
        currentValue?: number;
        targetValue?: number;
        details?: string;
    }[];
    overallProgress: number;
    hasExistingBadge: boolean;
}

export function BadgeAwardingService({
    classId,
    classBadges,
    students,
    onAwardBadge,
    onRevokeBadge,
    studentBadges,
    attendanceRecords,
    gradeRecords,
    skillsRecords
}: BadgeAwardingServiceProps) {
    const [selectedBadge, setSelectedBadge] = useState<string>("all");
    const [eligibilityData, setEligibilityData] = useState<BadgeEligibility[]>([]);
    const [showEligibilityDialog, setShowEligibilityDialog] = useState(false);
    const [selectedEligibility, setSelectedEligibility] = useState<BadgeEligibility | null>(null);
    const [autoAwardMode, setAutoAwardMode] = useState<"manual" | "automatic">("manual");

    // Calculate badge eligibility for all students
    const calculateEligibility = () => {
        const eligibility: BadgeEligibility[] = [];

        classBadges.forEach((badge) => {
            if (!badge.isEnabled) return;

            students.forEach((student) => {
                const existingBadge = studentBadges.find(
                    (sb) =>
                        sb.badgeId === badge.id &&
                        sb.studentId === student.id &&
                        sb.status === "active"
                );

                const requirements = badge.requirements.map((req) => {
                    let isMet = false;
                    let currentValue: number | undefined;
                    let targetValue: number | undefined;
                    let details: string | undefined;

                    switch (req.type) {
                        case "attendance":
                            const attendanceRecord = attendanceRecords[student.id];
                            currentValue = attendanceRecord?.percentage || 0;
                            targetValue = req.criteria.attendancePercentage;
                            isMet = currentValue >= targetValue;
                            details = `${attendanceRecord?.sessionsAttended || 0}/${attendanceRecord?.totalSessions || 0} sessions`;
                            break;

                        case "grade":
                            const gradeRecord = gradeRecords[student.id];
                            currentValue = gradeRecord?.finalGrade || 0;
                            targetValue = req.criteria.minimumGrade;
                            isMet = currentValue >= targetValue;
                            details = `Final grade: ${currentValue}%`;
                            break;

                        case "skill":
                            const studentSkills = skillsRecords[student.id] || [];
                            const requiredSkills = req.criteria.skillsRequired || [];
                            const acquiredSkills = requiredSkills.filter((skill) =>
                                studentSkills.includes(skill)
                            );
                            currentValue = acquiredSkills.length;
                            targetValue = requiredSkills.length;
                            isMet = currentValue >= targetValue;
                            details = `${acquiredSkills.length}/${requiredSkills.length} skills mastered`;
                            break;

                        case "project":
                            const projectRecord = gradeRecords[student.id];
                            currentValue = projectRecord?.projectsCompleted || 0;
                            targetValue = req.criteria.minimumProjects;
                            isMet = currentValue >= targetValue;
                            details = `${currentValue} projects completed`;
                            break;
                    }

                    return {
                        requirementId: req.id,
                        type: req.type,
                        description: req.description,
                        isRequired: req.isRequired,
                        isMet,
                        currentValue,
                        targetValue,
                        details
                    };
                });

                const requiredRequirements = requirements.filter((r) => r.isRequired);
                const metRequiredRequirements = requiredRequirements.filter((r) => r.isMet);
                const isEligible =
                    requiredRequirements.length > 0
                        ? metRequiredRequirements.length === requiredRequirements.length
                        : requirements.some((r) => r.isMet);

                const overallProgress =
                    requirements.length > 0
                        ? (requirements.filter((r) => r.isMet).length / requirements.length) * 100
                        : 0;

                eligibility.push({
                    badgeId: badge.id,
                    studentId: student.id,
                    studentName: student.name,
                    isEligible,
                    requirements,
                    overallProgress,
                    hasExistingBadge: !!existingBadge
                });
            });
        });

        setEligibilityData(eligibility);
    };

    useEffect(() => {
        calculateEligibility();
    }, [classBadges, students, attendanceRecords, gradeRecords, skillsRecords, studentBadges]);

    // Auto-award badges for eligible students
    const performAutoAward = () => {
        const eligibleForAward = eligibilityData.filter((e) => e.isEligible && !e.hasExistingBadge);

        if (eligibleForAward.length === 0) {
            toast.info("No students are currently eligible for automatic badge awards");
            return;
        }

        eligibleForAward.forEach((eligibility) => {
            const badge = classBadges.find((b) => b.id === eligibility.badgeId);
            if (badge?.autoAward) {
                onAwardBadge(eligibility.badgeId, eligibility.studentId, eligibility.studentName);
            }
        });

        toast.success(`Automatically awarded ${eligibleForAward.length} badges`);
    };

    // Manual award badge
    const handleManualAward = (badgeId: string, studentId: string, studentName: string) => {
        onAwardBadge(badgeId, studentId, studentName);
        calculateEligibility(); // Refresh eligibility after awarding
    };

    // Get summary statistics
    const getStats = () => {
        const totalEligible = eligibilityData.filter(
            (e) => e.isEligible && !e.hasExistingBadge
        ).length;
        const totalAwarded = eligibilityData.filter((e) => e.hasExistingBadge).length;
        const totalPending = eligibilityData.filter(
            (e) => !e.isEligible && !e.hasExistingBadge
        ).length;

        return { totalEligible, totalAwarded, totalPending };
    };

    const stats = getStats();

    const getEligibilityStatus = (eligibility: BadgeEligibility) => {
        if (eligibility.hasExistingBadge) return "awarded";
        if (eligibility.isEligible) return "eligible";
        return "pending";
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "awarded":
                return "text-green-600";
            case "eligible":
                return "text-blue-600";
            case "pending":
                return "text-yellow-600";
            default:
                return "text-gray-600";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "awarded":
                return <Check className="w-4 h-4" />;
            case "eligible":
                return <Trophy className="w-4 h-4" />;
            case "pending":
                return <Clock className="w-4 h-4" />;
            default:
                return <X className="w-4 h-4" />;
        }
    };

    const selectedBadgeData = classBadges.find((b) => b.id === selectedBadge);
    const filteredEligibility =
        selectedBadge && selectedBadge !== "all"
            ? eligibilityData.filter((e) => e.badgeId === selectedBadge)
            : eligibilityData;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">Badge Awarding System</h2>
                    <p className="text-muted-foreground">
                        Automatically award badges based on student progress and achievements
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Select
                        value={autoAwardMode}
                        onValueChange={(value: any) => setAutoAwardMode(value)}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="manual">Manual Review</SelectItem>
                            <SelectItem value="automatic">Auto Award</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        onClick={performAutoAward}
                        disabled={stats.totalEligible === 0}
                    >
                        <Trophy className="w-4 h-4 mr-2" />
                        Award Eligible ({stats.totalEligible})
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                            <Trophy className="w-8 h-8 text-blue-500" />
                            <div>
                                <div className="text-2xl font-semibold">{stats.totalEligible}</div>
                                <div className="text-sm text-muted-foreground">
                                    Eligible for Award
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                            <Award className="w-8 h-8 text-green-500" />
                            <div>
                                <div className="text-2xl font-semibold">{stats.totalAwarded}</div>
                                <div className="text-sm text-muted-foreground">Already Awarded</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                            <Clock className="w-8 h-8 text-yellow-500" />
                            <div>
                                <div className="text-2xl font-semibold">{stats.totalPending}</div>
                                <div className="text-sm text-muted-foreground">In Progress</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                            <Users className="w-8 h-8 text-purple-500" />
                            <div>
                                <div className="text-2xl font-semibold">{students.length}</div>
                                <div className="text-sm text-muted-foreground">Total Students</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Badge Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Badge Selection</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Select
                            value={selectedBadge}
                            onValueChange={setSelectedBadge}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a badge to review eligibility" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Badges</SelectItem>
                                {classBadges.map((badge) => (
                                    <SelectItem
                                        key={badge.id}
                                        value={badge.id}
                                    >
                                        {badge.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {selectedBadgeData && selectedBadge !== "all" && (
                            <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                                        <Trophy className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <div className="font-medium">{selectedBadgeData.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {selectedBadgeData.description}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge
                                        variant={
                                            selectedBadgeData.autoAward ? "default" : "secondary"
                                        }
                                    >
                                        {selectedBadgeData.autoAward
                                            ? "Auto Award"
                                            : "Manual Review"}
                                    </Badge>
                                    <Badge
                                        variant={
                                            selectedBadgeData.isEnabled ? "default" : "outline"
                                        }
                                    >
                                        {selectedBadgeData.isEnabled ? "Enabled" : "Disabled"}
                                    </Badge>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Student Eligibility */}
            <Card>
                <CardHeader>
                    <CardTitle>Student Eligibility</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredEligibility.map((eligibility) => {
                            const badge = classBadges.find((b) => b.id === eligibility.badgeId);
                            const status = getEligibilityStatus(eligibility);

                            return (
                                <div
                                    key={`${eligibility.badgeId}-${eligibility.studentId}`}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <Avatar>
                                            <AvatarFallback>
                                                {eligibility.studentName
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">
                                                {eligibility.studentName}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {badge?.name} -{" "}
                                                {eligibility.overallProgress.toFixed(0)}% complete
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <div
                                                className={`flex items-center space-x-1 ${getStatusColor(status)}`}
                                            >
                                                {getStatusIcon(status)}
                                                <span className="text-sm capitalize">{status}</span>
                                            </div>
                                            <Progress
                                                value={eligibility.overallProgress}
                                                className="w-24 h-2 mt-1"
                                            />
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedEligibility(eligibility);
                                                    setShowEligibilityDialog(true);
                                                }}
                                            >
                                                <AlertCircle className="w-4 h-4" />
                                            </Button>

                                            {status === "eligible" && (
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        handleManualAward(
                                                            eligibility.badgeId,
                                                            eligibility.studentId,
                                                            eligibility.studentName
                                                        )
                                                    }
                                                >
                                                    <Trophy className="w-4 h-4 mr-1" />
                                                    Award
                                                </Button>
                                            )}

                                            {status === "awarded" && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const existingBadge = studentBadges.find(
                                                            (sb) =>
                                                                sb.badgeId ===
                                                                    eligibility.badgeId &&
                                                                sb.studentId ===
                                                                    eligibility.studentId
                                                        );
                                                        if (existingBadge) {
                                                            onRevokeBadge(existingBadge.id);
                                                        }
                                                    }}
                                                >
                                                    <X className="w-4 h-4 mr-1" />
                                                    Revoke
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Eligibility Details Dialog */}
            <Dialog
                open={showEligibilityDialog}
                onOpenChange={setShowEligibilityDialog}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Badge Eligibility Details</DialogTitle>
                        <DialogDescription>
                            Detailed breakdown of badge requirements and student progress
                        </DialogDescription>
                    </DialogHeader>

                    {selectedEligibility && (
                        <div className="space-y-6">
                            {/* Student & Badge Info */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Avatar>
                                        <AvatarFallback>
                                            {selectedEligibility.studentName
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">
                                            {selectedEligibility.studentName}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {
                                                classBadges.find(
                                                    (b) => b.id === selectedEligibility.badgeId
                                                )?.name
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-semibold">
                                        {selectedEligibility.overallProgress.toFixed(0)}%
                                    </div>
                                    <div className="text-sm text-muted-foreground">Complete</div>
                                </div>
                            </div>

                            <Separator />

                            {/* Requirements Breakdown */}
                            <div className="space-y-4">
                                <h4 className="font-medium">Requirements</h4>
                                {selectedEligibility.requirements.map((req) => (
                                    <div
                                        key={req.requirementId}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                    req.isMet
                                                        ? "bg-green-100 text-green-600"
                                                        : "bg-gray-100 text-gray-600"
                                                }`}
                                            >
                                                {req.isMet ? (
                                                    <Check className="w-4 h-4" />
                                                ) : (
                                                    <X className="w-4 h-4" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium">{req.description}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {req.details}
                                                    {req.isRequired && (
                                                        <span className="text-red-500 ml-1">*</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {req.currentValue !== undefined &&
                                            req.targetValue !== undefined && (
                                                <div className="text-right">
                                                    <div className="text-sm font-medium">
                                                        {req.currentValue} / {req.targetValue}
                                                    </div>
                                                    <Progress
                                                        value={
                                                            (req.currentValue / req.targetValue) *
                                                            100
                                                        }
                                                        className="w-20 h-2 mt-1"
                                                    />
                                                </div>
                                            )}
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowEligibilityDialog(false)}
                                >
                                    Close
                                </Button>
                                {selectedEligibility.isEligible &&
                                    !selectedEligibility.hasExistingBadge && (
                                        <Button
                                            onClick={() => {
                                                handleManualAward(
                                                    selectedEligibility.badgeId,
                                                    selectedEligibility.studentId,
                                                    selectedEligibility.studentName
                                                );
                                                setShowEligibilityDialog(false);
                                            }}
                                        >
                                            <Trophy className="w-4 h-4 mr-2" />
                                            Award Badge
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
