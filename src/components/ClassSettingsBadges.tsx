"use client";
import { useState } from "react";
import {
    Plus,
    Edit,
    Eye,
    Trash2,
    Copy,
    Settings,
    Trophy,
    Target,
    Users,
    CheckCircle,
    XCircle,
    AlertCircle,
    Award,
    Star
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { Separator } from "./ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { BadgeDesigner } from "./BadgeDesigner";
import { BadgeAwardingService } from "./BadgeAwardingService";
import type {
    ClassBadge,
    BadgeDesign,
    BadgeRequirement,
    User,
    StudentBadge
} from "@/app/context/AppContext";
import { toast } from "sonner";

interface ClassSettingsBadgesProps {
    classId: string;
    classBadges: ClassBadge[];
    onUpdateClassBadges: (badges: ClassBadge[]) => void;
    students: User[];
    studentBadges: StudentBadge[];
    onAwardBadge: (badgeId: string, studentId: string, studentName: string) => void;
    onRevokeBadge: (badgeId: string) => void;
    // Mock data for demonstration
    attendanceRecords: Record<
        string,
        { percentage: number; sessionsAttended: number; totalSessions: number }
    >;
    gradeRecords: Record<string, { finalGrade: number; projectsCompleted: number }>;
    skillsRecords: Record<string, string[]>;
}

export function ClassSettingsBadges({
    classId,
    classBadges,
    onUpdateClassBadges,
    students,
    studentBadges,
    onAwardBadge,
    onRevokeBadge,
    attendanceRecords,
    gradeRecords,
    skillsRecords
}: ClassSettingsBadgesProps) {
    const [selectedBadge, setSelectedBadge] = useState<ClassBadge | null>(null);
    const [showBadgeDesigner, setShowBadgeDesigner] = useState(false);
    const [showRequirementsDialog, setShowRequirementsDialog] = useState(false);
    const [showAwardingService, setShowAwardingService] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Badge creation/editing functions
    const createNewBadge = () => {
        setSelectedBadge(null);
        setIsCreating(true);
        setShowBadgeDesigner(true);
    };

    const editBadge = (badge: ClassBadge) => {
        setSelectedBadge(badge);
        setIsCreating(false);
        setShowBadgeDesigner(true);
    };

    const saveBadgeDesign = (design: BadgeDesign) => {
        const newBadge: ClassBadge = {
            id: selectedBadge?.id || `badge_${Date.now()}`,
            classId,
            name: design.name,
            description:
                selectedBadge?.description || "Complete the class requirements to earn this badge",
            design,
            requirements: selectedBadge?.requirements || [
                {
                    id: `req_${Date.now()}`,
                    type: "attendance",
                    description: "Attend at least 80% of class sessions",
                    criteria: { attendancePercentage: 80 },
                    isRequired: true
                }
            ],
            isEnabled: selectedBadge?.isEnabled ?? true,
            autoAward: selectedBadge?.autoAward ?? true,
            manualReview: selectedBadge?.manualReview ?? false,
            revokable: selectedBadge?.revokable ?? false,
            createdBy: "current_user",
            createdAt: selectedBadge?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const updatedBadges = selectedBadge
            ? classBadges.map((b) => (b.id === selectedBadge.id ? newBadge : b))
            : [...classBadges, newBadge];

        onUpdateClassBadges(updatedBadges);
        setShowBadgeDesigner(false);
        toast.success(isCreating ? "Badge created successfully" : "Badge updated successfully");
    };

    const deleteBadge = (badgeId: string) => {
        // Check if badge has been awarded
        const hasAwardedBadges = studentBadges.some((sb) => sb.badgeId === badgeId);

        if (hasAwardedBadges) {
            toast.error("Cannot delete badge that has been awarded to students");
            return;
        }

        const updatedBadges = classBadges.filter((b) => b.id !== badgeId);
        onUpdateClassBadges(updatedBadges);
        toast.success("Badge deleted successfully");
    };

    const duplicateBadge = (badge: ClassBadge) => {
        const duplicatedBadge: ClassBadge = {
            ...badge,
            id: `badge_${Date.now()}`,
            name: `${badge.name} (Copy)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        onUpdateClassBadges([...classBadges, duplicatedBadge]);
        toast.success("Badge duplicated successfully");
    };

    const toggleBadgeEnabled = (badgeId: string) => {
        const updatedBadges = classBadges.map((badge) =>
            badge.id === badgeId
                ? { ...badge, isEnabled: !badge.isEnabled, updatedAt: new Date().toISOString() }
                : badge
        );
        onUpdateClassBadges(updatedBadges);
    };

    const updateBadgeSettings = (badgeId: string, settings: Partial<ClassBadge>) => {
        const updatedBadges = classBadges.map((badge) =>
            badge.id === badgeId
                ? { ...badge, ...settings, updatedAt: new Date().toISOString() }
                : badge
        );
        onUpdateClassBadges(updatedBadges);
    };

    const getBadgeStats = (badgeId: string) => {
        const awarded = studentBadges.filter(
            (sb) => sb.badgeId === badgeId && sb.status === "active"
        ).length;
        const total = students.length;
        const percentage = total > 0 ? (awarded / total) * 100 : 0;
        return { awarded, total, percentage };
    };

    const renderBadgePreview = (badge: ClassBadge, size: "small" | "medium" = "medium") => {
        const design = badge.design;
        const sizeMap = {
            small: { width: 60, height: 60, iconSize: 24 },
            medium: { width: 80, height: 80, iconSize: 32 }
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
            <div
                className={`relative flex items-center justify-center border-solid rounded-${design.shape === "circle" ? "full" : "lg"}`}
                style={{
                    width: dimensions.width,
                    height: dimensions.height,
                    borderWidth: design.borderWidth,
                    borderColor: design.borderColor,
                    ...gradientStyle,
                    ...shadowStyle
                }}
            >
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
        );
    };

    return (
        <div className="space-y-6">
            <Tabs
                defaultValue="badges"
                className="space-y-6"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold">Class Badges</h2>
                        <p className="text-muted-foreground">
                            Create and manage badges for student achievements
                        </p>
                    </div>
                    <TabsList>
                        <TabsTrigger value="badges">Badge Design</TabsTrigger>
                        <TabsTrigger value="awarding">Award Badges</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent
                    value="badges"
                    className="space-y-6"
                >
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                    <Trophy className="w-8 h-8 text-yellow-500" />
                                    <div>
                                        <div className="text-2xl font-semibold">
                                            {classBadges.length}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Total Badges
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                    <div>
                                        <div className="text-2xl font-semibold">
                                            {classBadges.filter((b) => b.isEnabled).length}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Active Badges
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                    <Award className="w-8 h-8 text-blue-500" />
                                    <div>
                                        <div className="text-2xl font-semibold">
                                            {
                                                studentBadges.filter((sb) => sb.status === "active")
                                                    .length
                                            }
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Badges Awarded
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                    <Users className="w-8 h-8 text-purple-500" />
                                    <div>
                                        <div className="text-2xl font-semibold">
                                            {students.length}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Students
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Badge List */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Class Badges</CardTitle>
                                <Button onClick={createNewBadge}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Badge
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {classBadges.length === 0 ? (
                                <div className="text-center py-12">
                                    <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                                    <h3 className="text-lg font-medium mb-2">
                                        No badges created yet
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        Create your first badge to motivate and reward student
                                        achievements
                                    </p>
                                    <Button onClick={createNewBadge}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create First Badge
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {classBadges.map((badge) => {
                                        const stats = getBadgeStats(badge.id);

                                        return (
                                            <div
                                                key={badge.id}
                                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    {renderBadgePreview(badge)}
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2">
                                                            <h3 className="font-medium">
                                                                {badge.name}
                                                            </h3>
                                                            <Badge
                                                                variant={
                                                                    badge.isEnabled
                                                                        ? "default"
                                                                        : "secondary"
                                                                }
                                                            >
                                                                {badge.isEnabled
                                                                    ? "Active"
                                                                    : "Inactive"}
                                                            </Badge>
                                                            {badge.autoAward && (
                                                                <Badge variant="outline">
                                                                    Auto Award
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {badge.description}
                                                        </p>
                                                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                                                            <span>
                                                                {stats.awarded} / {stats.total}{" "}
                                                                awarded
                                                            </span>
                                                            <span>
                                                                {stats.percentage.toFixed(0)}%
                                                                completion
                                                            </span>
                                                            <span>
                                                                {badge.requirements.length}{" "}
                                                                requirements
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <Switch
                                                        checked={badge.isEnabled}
                                                        onCheckedChange={() =>
                                                            toggleBadgeEnabled(badge.id)
                                                        }
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => editBadge(badge)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => duplicateBadge(badge)}
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedBadge(badge);
                                                            setShowRequirementsDialog(true);
                                                        }}
                                                    >
                                                        <Settings className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => deleteBadge(badge.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Badge Designer Dialog */}
                    <Dialog
                        open={showBadgeDesigner}
                        onOpenChange={setShowBadgeDesigner}
                    >
                        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>
                                    {isCreating ? "Create New Badge" : "Edit Badge"}
                                </DialogTitle>
                                <DialogDescription>
                                    Design your badge appearance and visual elements
                                </DialogDescription>
                            </DialogHeader>

                            <BadgeDesigner
                                initialDesign={selectedBadge?.design}
                                onSave={saveBadgeDesign}
                                onCancel={() => setShowBadgeDesigner(false)}
                            />
                        </DialogContent>
                    </Dialog>

                    {/* Requirements Dialog */}
                    <Dialog
                        open={showRequirementsDialog}
                        onOpenChange={setShowRequirementsDialog}
                    >
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Badge Requirements & Settings</DialogTitle>
                                <DialogDescription>
                                    Configure the requirements and awarding criteria for this badge
                                </DialogDescription>
                            </DialogHeader>

                            {selectedBadge && (
                                <div className="space-y-6">
                                    {/* Basic Settings */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium">Basic Settings</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="badge-name">Badge Name</Label>
                                                <Input
                                                    id="badge-name"
                                                    value={selectedBadge.name}
                                                    onChange={(e) => {
                                                        const updatedBadge = {
                                                            ...selectedBadge,
                                                            name: e.target.value
                                                        };
                                                        setSelectedBadge(updatedBadge);
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="badge-enabled">Status</Label>
                                                <div className="flex items-center space-x-2">
                                                    <Switch
                                                        id="badge-enabled"
                                                        checked={selectedBadge.isEnabled}
                                                        onCheckedChange={(checked) => {
                                                            const updatedBadge = {
                                                                ...selectedBadge,
                                                                isEnabled: checked
                                                            };
                                                            setSelectedBadge(updatedBadge);
                                                        }}
                                                    />
                                                    <Label htmlFor="badge-enabled">
                                                        {selectedBadge.isEnabled
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </Label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="badge-description">Description</Label>
                                            <Textarea
                                                id="badge-description"
                                                value={selectedBadge.description}
                                                onChange={(e) => {
                                                    const updatedBadge = {
                                                        ...selectedBadge,
                                                        description: e.target.value
                                                    };
                                                    setSelectedBadge(updatedBadge);
                                                }}
                                                rows={3}
                                            />
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Awarding Settings */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium">Awarding Settings</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id="auto-award"
                                                    checked={selectedBadge.autoAward}
                                                    onCheckedChange={(checked) => {
                                                        const updatedBadge = {
                                                            ...selectedBadge,
                                                            autoAward: checked
                                                        };
                                                        setSelectedBadge(updatedBadge);
                                                    }}
                                                />
                                                <Label htmlFor="auto-award">Automatic Award</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id="manual-review"
                                                    checked={selectedBadge.manualReview}
                                                    onCheckedChange={(checked) => {
                                                        const updatedBadge = {
                                                            ...selectedBadge,
                                                            manualReview: checked
                                                        };
                                                        setSelectedBadge(updatedBadge);
                                                    }}
                                                />
                                                <Label htmlFor="manual-review">Manual Review</Label>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="revokable"
                                                checked={selectedBadge.revokable}
                                                onCheckedChange={(checked) => {
                                                    const updatedBadge = {
                                                        ...selectedBadge,
                                                        revokable: checked
                                                    };
                                                    setSelectedBadge(updatedBadge);
                                                }}
                                            />
                                            <Label htmlFor="revokable">Revokable</Label>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Requirements */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">Requirements</h4>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Requirement
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            {selectedBadge.requirements.map((req, index) => (
                                                <div
                                                    key={req.id}
                                                    className="flex items-center justify-between p-3 border rounded-lg"
                                                >
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2">
                                                            <Badge
                                                                variant="outline"
                                                                className="capitalize"
                                                            >
                                                                {req.type}
                                                            </Badge>
                                                            {req.isRequired && (
                                                                <Badge
                                                                    variant="destructive"
                                                                    className="text-xs"
                                                                >
                                                                    Required
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="mt-1 text-sm">
                                                            {req.description}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-end space-x-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowRequirementsDialog(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                updateBadgeSettings(
                                                    selectedBadge.id,
                                                    selectedBadge
                                                );
                                                setShowRequirementsDialog(false);
                                                toast.success("Badge settings updated");
                                            }}
                                        >
                                            Save Settings
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                <TabsContent
                    value="awarding"
                    className="space-y-6"
                >
                    <BadgeAwardingService
                        classId={classId}
                        classBadges={classBadges}
                        students={students}
                        onAwardBadge={onAwardBadge}
                        onRevokeBadge={onRevokeBadge}
                        studentBadges={studentBadges}
                        attendanceRecords={attendanceRecords}
                        gradeRecords={gradeRecords}
                        skillsRecords={skillsRecords}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
