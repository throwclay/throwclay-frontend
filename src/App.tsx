// Use the shared context instead
// import { useAppContext } from '@/utils/subscriptions';

import { useState } from "react";
import {
    User,
    Building2,
    ShoppingBag,
    BarChart3,
    GraduationCap,
    Calendar,
    MessageCircle,
    Camera,
    Settings as SettingsIcon,
    MapPin,
    Globe,
    Users,
    UserCog
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { PotteryJournal } from "./components/PotteryJournal";
import { WhiteboardEditor } from "./components/WhiteboardEditor";
import { StudioDashboard } from "./components/StudioDashboard";
import { ArtistProfile } from "./components/ArtistProfile";
import { ArtistClasses } from "./components/ArtistClasses";
import { CommerceMarketplace } from "./components/CommerceMarketplace";
import { Settings } from "./components/Settings";
import { ClassesManagement } from "./components/ClassesManagement";
import { EventsManagement } from "./components/EventsManagement";
import { MessagingCenter } from "./components/MessagingCenter";
import { MemberManagement } from "./components/MemberManagement";
import { StaffManagement } from "./components/StaffManagement";
import { KilnManagement } from "./components/KilnManagement";
import { BlogManagement } from "./components/BlogManagement";

import { GlazeManagement } from "./components/GlazeManagement";

import { LoginForm } from "./components/LoginForm";
import { Navigation } from "./components/Navigation";
import { LandingPage } from "./components/LandingPage";
import { PublicStudiosDirectory } from "./components/PublicStudiosDirectory";
import { PublicCeramicsMarketplace } from "./components/PublicCeramicsMarketplace";

export interface PhotoEntry {
    id: string;
    url: string;
    type: "photo" | "sketch";
    caption: string;
    notes: string;
    timestamp: string;
    x?: number; // Position on whiteboard
    y?: number;
    width?: number;
    height?: number;
    annotations?: PhotoAnnotation[];
}

export interface PhotoAnnotation {
    id: string;
    type: "drawing" | "text" | "arrow" | "highlight";
    x: number;
    y: number;
    width?: number;
    height?: number;
    content?: string; // For text annotations
    strokes?: DrawingStroke[]; // For drawing annotations
    color: string;
    strokeWidth?: number;
    createdAt: string;
    createdBy: string;
}

export interface DrawingStroke {
    id: string;
    points: { x: number; y: number }[];
    color: string;
    strokeWidth: number;
    tool: "pen" | "brush" | "highlighter" | "eraser";
    timestamp: string;
}

export interface StickyNote {
    id: string;
    content: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: "yellow" | "blue" | "green" | "pink" | "orange" | "purple" | "red" | "white";
    fontSize: "small" | "medium" | "large";
    createdAt: string;
    createdBy: string;
    updatedAt?: string;
}

export interface TextBox {
    id: string;
    content: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    fontColor: string;
    backgroundColor?: string;
    borderColor?: string;
    alignment: "left" | "center" | "right";
    createdAt: string;
    createdBy: string;
    updatedAt?: string;
}

export interface WhiteboardPage {
    id: string;
    title: string;
    order: number;
    canvasWidth: number;
    canvasHeight: number;
    backgroundColor: string;
    elements: {
        photos: PhotoEntry[];
        stickyNotes: StickyNote[];
        textBoxes: TextBox[];
        drawings: DrawingStroke[];
    };
    createdAt: string;
    updatedAt: string;
}

export interface CollaborationComment {
    id: string;
    userId: string;
    userName: string;
    userHandle: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
    replyTo?: string; // Reply to another comment
}

export interface CollaborationPermission {
    id: string;
    userId: string;
    userName: string;
    userHandle: string;
    permission: "view" | "comment" | "edit";
    canDuplicate: boolean;
    grantedBy: string;
    grantedAt: string;
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    color?: string;
    createdAt: string;
    updatedAt: string;
    artistId: string;
    throwCount: number;
    isShared: boolean;
    sharePermissions: CollaborationPermission[];
    comments: CollaborationComment[];
    tags?: string[];
    status: "active" | "completed" | "archived";
}

export interface PotteryEntry {
    id: string;
    date: string;
    title: string;
    potteryType: string;
    clayType: string;
    techniques: string[];
    firingType: string;
    firingTemp: string;
    glazes: string[];
    status: "planning" | "in-progress" | "fired" | "completed";
    notes: string;
    photos: PhotoEntry[]; // Legacy field - kept for backward compatibility
    challenges: string;
    nextSteps: string;
    artistId: string;
    projectId?: string; // Link throws to projects
    isForSale?: boolean;
    price?: number;
    description?: string;
    dimensions?: string;
    isShared: boolean;
    sharePermissions: CollaborationPermission[];
    comments: CollaborationComment[];
    createdAt: string;
    updatedAt: string;
    // New whiteboard fields
    whiteboardPages: WhiteboardPage[];
    whiteboardMode: boolean; // Toggle between form view and whiteboard view
    coverImageUrl?: string; // Generated from first page or selected image
}

export interface SubscriptionLimits {
    projects: number;
    throwsPerProject: number;
    additionalThrows: number;
    canCollaborate: boolean;
    canExport: boolean;
    prioritySupport: boolean;
    maxPagesPerThrow: number;
    canUploadPhotos: boolean;
    maxPhotoSize: number; // in MB
    canAnnotatePhotos: boolean;
    canUsePremiumTools: boolean;
}

export interface UsageStats {
    projectsUsed: number;
    throwsInProjects: number;
    additionalThrowsUsed: number;
    totalThrows: number;
}

export interface StudioLocation {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone?: string;
    email?: string;
    manager?: string;
    capacity: number;
    amenities: string[];
    isActive: boolean;
}

// Glaze Experiment Tracking Interfaces
export interface GlazeIngredient {
    id: string;
    name: string;
    type: "flux" | "silica" | "alumina" | "colorant" | "opacifier" | "matting-agent" | "other";
    description?: string;
    supplier?: string;
    cost?: number;
    safetyNotes?: string;
    isActive: boolean;
}

export interface GlazeIngredientMeasurement {
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    unit: "grams" | "pounds" | "ounces" | "percentage" | "parts";
    notes?: string;
}

export interface GlazeTestResult {
    id: string;
    experimentId: string;
    testPieceDescription: string;
    clayBody: string;
    applicationMethod: "dipping" | "brushing" | "spraying" | "pouring" | "other";
    applicationThickness: "thin" | "medium" | "thick" | "variable";
    bisqueTemp: string;
    glazeFireTemp: string;
    cone: string[];
    atmosphere: "oxidation" | "reduction" | "neutral" | "raku" | "other";
    kilnId?: string;
    firingDate: string;
    results: {
        color: string;
        surface: "gloss" | "satin" | "matte" | "crystalline" | "textured" | "other";
        opacity: "transparent" | "translucent" | "opaque";
        quality: "excellent" | "good" | "fair" | "poor" | "defective";
        defects?: string[];
        notes?: string;
    };
    images: string[]; // URLs to uploaded images
    rating: 1 | 2 | 3 | 4 | 5; // 1 = poor, 5 = excellent
    wouldRepeat: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface GlazeExperiment {
    id: string;
    studioId: string;
    name: string;
    description?: string;
    glazeType: "new-recipe" | "existing-recipe" | "purchased-glaze" | "modification";
    baseGlazeId?: string; // Reference to existing glaze if modification
    baseGlazeName?: string;
    purchasedGlazeInfo?: {
        manufacturer: string;
        productName: string;
        productCode?: string;
        batchNumber?: string;
        purchaseDate?: string;
        cost?: number;
    };
    recipe: {
        totalBatchWeight: number;
        totalBatchUnit: "grams" | "pounds" | "ounces";
        ingredients: GlazeIngredientMeasurement[];
        mixingInstructions?: string;
        meshSize?: number;
        additionalNotes?: string;
    };
    experimentedBy: string; // User ID
    experimenterName: string;
    testDate: string;
    firingDates: string[]; // Can have multiple firings
    cones: string[]; // e.g., ['04', '6', '10'] - can test multiple cones
    atmospheres: ("oxidation" | "reduction" | "neutral" | "raku" | "other")[]; // Can test multiple atmospheres
    testResults: GlazeTestResult[];
    tags: string[]; // Custom tags for organization
    status: "planning" | "testing" | "completed" | "archived";
    isPublic: boolean; // Share with other studios
    averageRating: number; // Calculated from test results
    totalQuantityMade: number; // Total glaze quantity made
    quantityUnit: "grams" | "pounds" | "ounces" | "cups" | "liters";
    costPerBatch?: number;
    notes: string;
    createdAt: string;
    updatedAt: string;
    // Safety and handling
    safetyNotes?: string;
    storageInstructions?: string;
    shelfLife?: string;
    // Success tracking
    successfulTests: number;
    totalTests: number;
    recommendedUse?: string;
    troubleshooting?: {
        issue: string;
        solution: string;
    }[];
    // Photo gallery
    photos?: PhotoEntry[];
}

export interface GlazeExperimentTemplate {
    id: string;
    studioId: string;
    name: string;
    description: string;
    recipe: {
        totalBatchWeight: number;
        totalBatchUnit: "grams" | "pounds" | "ounces";
        ingredients: GlazeIngredientMeasurement[];
        mixingInstructions?: string;
        meshSize?: number;
    };
    recommendedCones: string[];
    recommendedAtmospheres: ("oxidation" | "reduction" | "neutral" | "raku" | "other")[];
    tags: string[];
    isPublic: boolean;
    createdBy: string;
    createdAt: string;
    usageCount: number;
    averageRating: number;
}

// Kiln-Specific Firing Templates - Templates tied to specific kilns
export interface KilnFiringTemplate {
    id: string;
    studioId: string;
    kilnId: string; // Reference to specific kiln
    name: string;
    description?: string;
    baseType: "bisque" | "glaze" | "raku" | "pit" | "saggar" | "crystalline" | "other";
    // Kiln-specific optimized temperature curve
    temperatureCurve: {
        phase: "initial" | "ramp-up" | "soak" | "cool-down";
        targetTemp: number;
        ratePerHour: number; // degrees per hour optimized for this kiln
        holdTime: number; // minutes to hold at this temp
        notes?: string;
        // Kiln-specific adjustments
        kilnAdjustments?: {
            topBottomTempDifference?: number; // account for kiln hot spots
            ventingRequired?: boolean;
            damperPosition?: string;
            pressureSettings?: string;
        };
    }[];
    atmosphere: "oxidation" | "reduction" | "neutral";
    estimatedDuration: number; // total hours for this specific kiln
    // Compatibility based on kiln characteristics
    clayCompatibility: string[]; // Compatible clay types for this kiln
    glazeCompatibility: string[]; // Compatible glaze types for this kiln
    // Kiln-specific safety and operational notes
    safetyNotes?: string;
    kilnSpecificInstructions?: string; // Instructions specific to this kiln
    shelfConfiguration?: {
        recommendedShelfHeight: number[];
        loadingPattern?: string;
        maxPiecesPerShelf?: number[];
        shelfSupports?: string;
    };
    // Usage and performance tracking
    isDefault: boolean; // Default template for this kiln + firing type combination
    isActive: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    lastUsed?: string;
    usageCount: number;
    averageSuccessRate?: number; // % of successful firings using this template
    // Template sharing and versioning
    isShared: boolean; // Can be shared with other studios
    parentTemplateId?: string; // If derived from another template
    version: string;
    changeNotes?: string;
    // Performance metrics for this template on this kiln
    performanceMetrics?: {
        averageFiringTime: number;
        energyUsage: number; // kWh or gas usage
        successfulFirings: number;
        totalFirings: number;
        commonIssues?: string[];
        lastPerformanceReview?: string;
    };
}

// Custom Firing Types - Studio-specific firing presets (general, not kiln-specific)
export interface CustomFiringType {
    id: string;
    studioId: string;
    name: string;
    description?: string;
    baseType: "bisque" | "glaze" | "raku" | "pit" | "saggar" | "crystalline" | "other";
    temperatureCurve: {
        phase: "initial" | "ramp-up" | "soak" | "cool-down";
        targetTemp: number;
        ratePerHour: number; // degrees per hour
        holdTime: number; // minutes to hold at this temp
        notes?: string;
    }[];
    atmosphere: "oxidation" | "reduction" | "neutral";
    estimatedDuration: number; // total hours
    specialInstructions?: string;
    clayCompatibility: string[]; // Compatible clay types
    glazeCompatibility: string[]; // Compatible glaze types
    safetyNotes?: string;
    isDefault: boolean; // Studio default for this base type
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    lastUsed?: string;
    usageCount: number;
}

// Employee Assignment for Kiln Operations
export interface KilnAssignment {
    id: string;
    kilnId: string;
    firingId: string;
    assignedEmployeeId: string;
    assignedEmployeeName: string;
    assignmentType: "loading" | "monitoring" | "unloading" | "full-cycle";
    scheduledStart: string;
    scheduledEnd: string;
    actualStart?: string;
    actualEnd?: string;
    status: "assigned" | "in-progress" | "completed" | "cancelled" | "needs-cover";
    tasks: {
        id: string;
        description: string;
        isCompleted: boolean;
        completedAt?: string;
        notes?: string;
    }[];
    specialInstructions?: string;
    emergencyContact?: string;
    assignedBy: string;
    assignedAt: string;
    notificationsSent: {
        type: "assignment" | "reminder" | "start-alert" | "completion-reminder";
        sentAt: string;
        acknowledged?: boolean;
    }[];
    coverRequests?: {
        id: string;
        requestedBy: string;
        requestedAt: string;
        reason: string;
        status: "pending" | "approved" | "denied";
        coveredBy?: string;
        coveredAt?: string;
    }[];
}

// Enhanced Kiln Camera Integration
export interface KilnCamera {
    id: string;
    kilnId: string;
    cameraId: string; // Reference to CameraSetup
    position: "interior" | "exterior" | "control-panel" | "pyrometer";
    isActive: boolean;
    monitoringSettings: {
        recordDuringFiring: boolean;
        createTimeLapse: boolean;
        timeLapseInterval: number; // minutes between shots for time-lapse
        alertOnTemperatureAnomaly: boolean;
        temperatureThreshold: {
            min: number;
            max: number;
        };
        recordMotionDetection: boolean;
        nightVisionAuto: boolean;
        qualitySettings: "low" | "medium" | "high" | "ultra";
    };
    firingRecordings: {
        id: string;
        firingId: string;
        recordingType: "live-stream" | "time-lapse" | "temperature-alert" | "motion-detection";
        startTime: string;
        endTime?: string;
        fileUrl?: string;
        thumbnailUrl?: string;
        duration?: number; // in minutes
        fileSize?: number; // in MB
        metadata?: {
            maxTemp?: number;
            avgTemp?: number;
            anomaliesDetected?: number;
        };
    }[];
    lastHealthCheck: string;
    healthStatus: "online" | "offline" | "error" | "maintenance";
    batteryLevel?: number; // for wireless cameras
    signalStrength?: number; // WiFi signal strength
}

// Ring Camera Specific Integration
export interface RingIntegration {
    id: string;
    studioId: string;
    isEnabled: boolean;
    apiKey: string; // Encrypted Ring API key
    refreshToken: string;
    connectedDevices: {
        deviceId: string;
        deviceName: string;
        deviceType: "doorbell" | "camera" | "floodlight-cam";
        locationName: string;
        isAssignedToKiln: boolean;
        assignedKilnId?: string;
        lastSeen: string;
        batteryLevel?: number;
        wiredPower?: boolean;
    }[];
    settings: {
        enablePushNotifications: boolean;
        enableEmailAlerts: boolean;
        enableSMSAlerts: boolean;
        recordingQuality: "auto" | "low" | "medium" | "high";
        motionSensitivity: "low" | "medium" | "high";
        nightVisionMode: "auto" | "on" | "off";
        twoWayAudioEnabled: boolean;
    };
    webhookUrl?: string;
    lastSync: string;
    syncStatus: "success" | "error" | "pending";
    errorLog: {
        timestamp: string;
        error: string;
        resolution?: string;
    }[];
}

// Kiln Management Interfaces
export interface KilnShelf {
    id: string;
    level: number; // 1 = bottom, 2 = middle, etc.
    capacity: number; // number of pieces that can fit
    usedCapacity: number;
    items: KilnLoadItem[];
}

export interface KilnLoadItem {
    id: string;
    throwId?: string; // Link to pottery entry
    artistId: string;
    artistName: string;
    itemName: string;
    clayType: string;
    glazes: string[];
    dimensions?: string;
    specialInstructions?: string;
    shelfPosition?: string; // e.g., "A3", "B1"
    loadedAt: string;
    loadedBy: string;
    status: "loaded" | "firing" | "cooling" | "ready-for-pickup" | "picked-up";
    pickupNotified?: string; // timestamp when pickup notification was sent
    notes?: string;
}

export interface KilnLoad {
    id: string;
    kilnId: string;
    firingId: string;
    shelves: KilnShelf[];
    totalItems: number;
    loadStarted: string;
    loadCompleted?: string;
    loadedBy: string;
    assignedEmployee?: string; // Employee assigned to this load
    assignment?: KilnAssignment; // Full assignment details
    notes?: string;
    photos?: string[]; // photos of loaded kiln
}

export interface KilnPerformanceLog {
    id: string;
    kilnId: string;
    firingId: string;
    timestamp: string;
    temperature: number;
    targetTemperature: number;
    phase: "heating" | "holding" | "cooling";
    gasUsage?: number; // for gas kilns
    electricUsage?: number; // for electric kilns
    notes?: string;
    recordedBy?: string;
}

export interface Kiln {
    id: string;
    name: string;
    type: "electric" | "gas" | "wood" | "raku";
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    locationId: string;
    capacity: number; // cubic feet or pieces
    maxTemp: number; // max temperature in Celsius
    shelfCount: number;
    shelfConfiguration: {
        level: number;
        height: number; // in inches
        capacity: number; // pieces per shelf
    }[];
    status: "available" | "loading" | "firing" | "cooling" | "maintenance" | "out-of-service";
    lastFired?: string;
    totalFirings: number;
    maintenanceSchedule?: {
        lastMaintenance: string;
        nextMaintenance: string;
        maintenanceType: string;
    };
    specifications: {
        voltage?: string;
        amperage?: string;
        gasType?: string;
        controllerType?: string;
    };
    isActive: boolean;
    installDate?: string;
    warrantyExpiry?: string;
    notes?: string;
    performanceLogs: KilnPerformanceLog[];
    // Enhanced camera integration
    cameras: KilnCamera[];
    // Current assignment
    currentAssignment?: KilnAssignment;
    // Kiln-specific firing templates
    firingTemplates: KilnFiringTemplate[];
}

export interface ManagerResponsibility {
    id: string;
    name: string;
    description: string;
    category: "members" | "classes" | "operations" | "content" | "custom";
    taskCompletionLink?: string;
    isRequired: boolean;
    isCustom: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ScheduleEntry {
    id: string;
    employeeId: string;
    date: string;
    startTime: string;
    endTime: string;
    category:
        | "operations"
        | "classes"
        | "social-media"
        | "covering-shift"
        | "sick-leave"
        | "vacation";
    description?: string;
    locationId?: string;
    classId?: string; // If category is 'classes'
    coveringForId?: string; // If category is 'covering-shift'
    status: "scheduled" | "in-progress" | "completed" | "cancelled";
    approvedBy?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface TimeOffRequest {
    id: string;
    employeeId: string;
    startDate: string;
    endDate: string;
    type: "vacation" | "sick-leave" | "personal" | "other";
    reason?: string;
    status: "pending" | "approved" | "denied";
    requestedAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
    notes?: string;
}

export interface TimeCardEntry {
    id: string;
    date: string;
    clockIn: string;
    clockOut?: string;
    breakStart?: string[];
    breakEnd?: string[];
    totalHours: number;
    regularHours: number;
    overtimeHours: number;
    category: "operations" | "classes" | "social-media" | "covering-shift" | "training" | "other";
    locationId?: string;
    notes?: string;
    wasScheduled: boolean;
    scheduledStart?: string;
    scheduledEnd?: string;
    discrepancyReason?: string;
    status: "draft" | "submitted" | "approved" | "rejected" | "needs-review";
    submittedAt?: string;
    reviewedAt?: string;
    reviewedBy?: string;
    reviewNotes?: string;
}

export interface TimeCard {
    id: string;
    employeeId: string;
    employeeName: string;
    payPeriodId: string;
    entries: TimeCardEntry[];
    totalRegularHours: number;
    totalOvertimeHours: number;
    totalHours: number;
    status: "draft" | "submitted" | "approved" | "rejected" | "needs-review" | "processed";
    submittedAt?: string;
    submittedBy: string;
    reviewedAt?: string;
    reviewedBy?: string;
    approvedAt?: string;
    approvedBy?: string;
    reviewNotes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PayPeriod {
    id: string;
    startDate: string;
    endDate: string;
    payDate: string;
    status: "open" | "locked" | "processed" | "paid";
    createdAt: string;
    updatedAt: string;
}

export interface TimeCardApproval {
    id: string;
    timeCardId: string;
    approverId: string;
    approverName: string;
    action: "approved" | "rejected" | "needs-changes";
    notes?: string;
    timestamp: string;
    level: number; // 1 = supervisor, 2 = manager, 3 = admin
}

export interface EmployeeCredentials {
    id: string;
    employeeId: string;
    username: string;
    email: string;
    lastPasswordReset?: string;
    requirePasswordChange: boolean;
    loginAttempts: number;
    lockedUntil?: string;
    createdAt: string;
    updatedAt: string;
}

export interface InstructorProfile {
    id: string;
    userId: string;
    studioId: string;
    bio?: string;
    specialties: string[];
    certifications: string[];
    experience: string;
    hourlyRate?: number;
    availability: {
        monday: { start: string; end: string; isAvailable: boolean };
        tuesday: { start: string; end: string; isAvailable: boolean };
        wednesday: { start: string; end: string; isAvailable: boolean };
        thursday: { start: string; end: string; isAvailable: boolean };
        friday: { start: string; end: string; isAvailable: boolean };
        saturday: { start: string; end: string; isAvailable: boolean };
        sunday: { start: string; end: string; isAvailable: boolean };
    };
    assignedClasses: string[]; // Class IDs they can edit
    isActive: boolean;
    hiredDate: string;
    profileImage?: string;
    phone?: string;
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
    };
    notes?: string;
}

export interface ManagerProfile {
    id: string;
    userId: string;
    studioId: string;
    role: "co-admin" | "manager" | "employee";
    responsibilities: string[]; // Array of ManagerResponsibility IDs
    standardWorkHours: {
        monday: { start: string; end: string; isAvailable: boolean };
        tuesday: { start: string; end: string; isAvailable: boolean };
        wednesday: { start: string; end: string; isAvailable: boolean };
        thursday: { start: string; end: string; isAvailable: boolean };
        friday: { start: string; end: string; isAvailable: boolean };
        saturday: { start: string; end: string; isAvailable: boolean };
        sunday: { start: string; end: string; isAvailable: boolean };
    };
    permissions: {
        manageMembers: boolean;
        manageClasses: boolean;
        manageEvents: boolean;
        manageMessages: boolean;
        manageInventory: boolean;
        manageFiring: boolean;
        manageFinances: boolean;
        manageSettings: boolean;
        deleteProfiles: boolean;
        changeSubscription: boolean;
        approveTimeCards: boolean;
        viewPayroll: boolean;
    };
    profileImage?: string;
    phone?: string;
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
    };
    maxVacationDays: number;
    maxSickDays: number;
    usedVacationDays: number;
    usedSickDays: number;
    isActive: boolean;
    hiredDate: string;
    lastActivity?: string;
    notes?: string;
    hourlyRate?: number;
    salaryType?: "hourly" | "salary";
    overtimeEligible: boolean;
}

export interface WorkLog {
    id: string;
    managerId: string;
    date: string;
    startTime: string;
    endTime: string;
    hoursWorked: number;
    responsibilities: string[]; // Array of completed responsibility IDs
    notes?: string;
    status: "scheduled" | "in-progress" | "completed" | "absent";
    locationId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface DiscountCode {
    id: string;
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    maxUses?: number;
    currentUses: number;
    expiresAt?: string;
    isActive: boolean;
    createdAt: string;
}

export interface ClassMaterial {
    id: string;
    name: string;
    description?: string;
    price: number;
    isRequired: boolean;
    productLink?: string;
    category: "clay" | "tools" | "glazes" | "other";
}

export interface ClassAttendance {
    id: string;
    classId: string;
    sessionDate: string;
    studentId: string;
    status: "present" | "absent" | "late" | "excused";
    notes?: string;
    markedAt: string;
    markedBy: string;
}

export interface ClassHoliday {
    id: string;
    classId: string;
    originalDate: string;
    rescheduleDate?: string;
    reason: string;
    notificationSent: boolean;
    createdAt: string;
}

// Badge System Interfaces
export interface BadgeDesign {
    id: string;
    name: string;
    shape: "circle" | "square" | "shield" | "hexagon" | "star" | "diamond";
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    iconType: "emoji" | "custom" | "predefined";
    icon?: string; // Emoji or icon identifier
    customIconUrl?: string; // For custom uploaded icons
    textColor: string;
    fontSize: "small" | "medium" | "large";
    gradientEnabled: boolean;
    gradientColors?: string[];
    gradientDirection?: "vertical" | "horizontal" | "diagonal";
    shadowEnabled: boolean;
    shadowColor?: string;
    shadowBlur?: number;
    createdAt: string;
    updatedAt: string;
}

export interface BadgeTemplate {
    id: string;
    name: string;
    description: string;
    designId: string; // Reference to BadgeDesign
    category: "completion" | "achievement" | "skill" | "participation" | "custom";
    isDefault: boolean; // System-provided templates
    isActive: boolean;
    createdBy: string; // User ID who created this template
    createdAt: string;
    updatedAt: string;
    // Completion criteria
    completionCriteria: {
        type: "attendance" | "grading" | "manual" | "time-based" | "project-based";
        requirements: {
            minimumAttendance?: number; // percentage
            minimumGrade?: number; // percentage
            requiredSessions?: number; // number of sessions
            requiredProjects?: number; // number of completed projects
            timeThreshold?: number; // minutes/hours
            customCriteria?: string; // for manual assessment
        };
        autoAward: boolean; // whether to automatically award when criteria met
    };
    displaySettings: {
        showOnProfile: boolean;
        isPublic: boolean; // visible to other students
        showOnCertificate: boolean;
        includeBadgeCode: boolean; // verification code
        socialShareable: boolean;
    };
    textOverlay?: {
        title: string;
        subtitle?: string;
        dateFormat?: "none" | "month-year" | "full-date";
        showInstructorName: boolean;
        showStudioName: boolean;
        customText?: string;
    };
}

export interface StudentBadge {
    id: string;
    badgeId: string; // Reference to BadgeTemplate
    classId: string;
    studentId: string;
    studentName: string;
    awardedDate: string;
    awardedBy: string; // Instructor ID
    awardMethod: "automatic" | "manual" | "imported";
    status: "active" | "revoked" | "archived";
    verificationCode: string; // Unique code for verification
    socialShareEnabled: boolean;

    // Class completion data
    finalGrade?: number;
    finalAttendance?: number;
    projectsCompleted?: number;
    skillsAchieved?: string[];
    instructorNotes?: string;

    // Display settings
    displayOnProfile: boolean;
    customTitle?: string;
    customDescription?: string;

    // Social proof
    shareCount: number;
    viewCount: number;

    // Metadata
    classDetails?: {
        className: string;
        instructorName: string;
        studioName: string;
        completionDate: string;
        duration: string; // e.g., "6 weeks"
    };

    createdAt: string;
    updatedAt: string;
}

export interface ClassBadgeSettings {
    id: string;
    classId: string;
    isEnabled: boolean;
    selectedBadgeId?: string; // Reference to BadgeTemplate
    customBadgeDesign?: BadgeDesign; // Override template design
    awardingCriteria: {
        type: "attendance" | "grading" | "manual" | "combined";
        attendanceThreshold?: number; // percentage
        gradeThreshold?: number; // percentage
        requiresBothCriteria?: boolean; // for combined type
        customRequirements?: string;
    };
    autoAwardEnabled: boolean;
    instructorApprovalRequired: boolean;
    allowStudentSelfNomination: boolean;

    // Badge customization for this class
    badgeCustomization?: {
        title?: string;
        subtitle?: string;
        includeClassDetails: boolean;
        includeDuration: boolean;
        includeSkills: boolean;
        customMessage?: string;
    };

    // Notification settings
    notifications: {
        emailStudent: boolean;
        emailInstructor: boolean;
        showInClassFeed: boolean;
        socialMediaPost: boolean;
    };

    createdAt: string;
    updatedAt: string;
}

// Interface for the Studio
export interface Studio {
    id: string;
    name: string;
    handle: string;
    email: string;
    website?: string;
    description?: string;
    locations: StudioLocation[];
    isActive: boolean;
    plan: "studio-solo" | "studio-duo" | "studio-pro" | "studio-unlimited";
    createdAt: string;
    memberCount: number;
    classCount: number;
    glazes?: string[];
    firingSchedule?: {
        id: string;
        type: string;
        date: string;
        temperature: string;
        capacity: number;
        bookedSlots: number;
    }[];
}

// Artist Profile Interface
export interface ArtistProfile {
    bio: string;
    socialMedia: {
        instagram?: string;
        facebook?: string;
        twitter?: string;
        website?: string;
    };
    profileImage?: string;
    branding: {
        primaryColor: string;
        secondaryColor?: string;
        logoUrl?: string;
    };
}

// User Interface - used for both artists and studio users
export interface User {
    id: string;
    name: string;
    handle: string;
    email: string;
    type: "artist" | "studio";

    // Artist-specific fields
    subscription?: "free" | "passion" | "small-artist" | "studio-pro";
    subscriptionLimits?: SubscriptionLimits;
    usageStats?: UsageStats;

    // Shared fields
    profile?: ArtistProfile;
    createdAt: string;
    lastLogin?: string;
    isActive: boolean;
}

// Subscription limits helper function - EXPORTED
export function getSubscriptionLimits(subscription?: User["subscription"]): SubscriptionLimits {
    switch (subscription) {
        case "free":
            return {
                projects: 2,
                throwsPerProject: 10,
                additionalThrows: 5,
                canCollaborate: false,
                canExport: false,
                prioritySupport: false,
                maxPagesPerThrow: 3,
                canUploadPhotos: false,
                maxPhotoSize: 5,
                canAnnotatePhotos: false,
                canUsePremiumTools: false
            };
        case "passion":
            return {
                projects: 10,
                throwsPerProject: 25,
                additionalThrows: 15,
                canCollaborate: true,
                canExport: true,
                prioritySupport: false,
                maxPagesPerThrow: 10,
                canUploadPhotos: true,
                maxPhotoSize: 25,
                canAnnotatePhotos: true,
                canUsePremiumTools: true
            };
        case "small-artist":
            return {
                projects: 25,
                throwsPerProject: 50,
                additionalThrows: 30,
                canCollaborate: true,
                canExport: true,
                prioritySupport: true,
                maxPagesPerThrow: 20,
                canUploadPhotos: true,
                maxPhotoSize: 50,
                canAnnotatePhotos: true,
                canUsePremiumTools: true
            };
        case "studio-pro":
            return {
                projects: -1, // unlimited
                throwsPerProject: -1, // unlimited
                additionalThrows: -1, // unlimited
                canCollaborate: true,
                canExport: true,
                prioritySupport: true,
                maxPagesPerThrow: -1, // unlimited
                canUploadPhotos: true,
                maxPhotoSize: 100,
                canAnnotatePhotos: true,
                canUsePremiumTools: true
            };
        default:
            return {
                projects: 2,
                throwsPerProject: 10,
                additionalThrows: 5,
                canCollaborate: false,
                canExport: false,
                prioritySupport: false,
                maxPagesPerThrow: 3,
                canUploadPhotos: false,
                maxPhotoSize: 5,
                canAnnotatePhotos: false,
                canUsePremiumTools: false
            };
    }
}

// Global app context
export interface AppContext {
    currentUser: User | null;
    setCurrentUser: (user: User | null) => void;
    currentStudio: Studio | null;
    setCurrentStudio: (studio: Studio | null) => void;
    currentThrow?: PotteryEntry | null;
    setCurrentThrow?: (throwEntry: PotteryEntry | null) => void;
    updateThrow?: (throwEntry: PotteryEntry) => void;
    navigateToPage?: (page: string) => void;
}

// const AppContext = createContext<AppContext | undefined>(undefined);

// export function useAppContext() {
//   const context = useContext(AppContext);
//   if (context === undefined) {
//     // throw new Error('useAppContext must be used within an AppProvider');
//   }
//   return context;
// }

function App() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentStudio, setCurrentStudio] = useState<Studio | null>(null);
    const [currentPage, setCurrentPage] = useState("landing");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentThrow, setCurrentThrow] = useState<PotteryEntry | null>(null);

    // Mock studios data
    const mockStudios: Studio[] = [
        {
            id: "studio_1",
            name: "Clay & Fire Studio",
            handle: "clayandfire",
            email: "hello@clayandfire.com",
            website: "https://clayandfire.com",
            description:
                "A community pottery studio offering classes for all skill levels in the heart of Portland.",
            locations: [
                {
                    id: "loc_1",
                    name: "Main Studio",
                    address: "123 Pottery Lane",
                    city: "Portland",
                    state: "OR",
                    zipCode: "97205",
                    phone: "(503) 555-0123",
                    email: "main@clayandfire.com",
                    manager: "Sarah Martinez",
                    capacity: 24,
                    amenities: ["Wheels", "Kilns", "Glazing Station", "Hand-building Area"],
                    isActive: true
                },
                {
                    id: "loc_2",
                    name: "Eastside Location",
                    address: "456 Arts District Blvd",
                    city: "Portland",
                    state: "OR",
                    zipCode: "97214",
                    phone: "(503) 555-0124",
                    email: "eastside@clayandfire.com",
                    manager: "Mike Chen",
                    capacity: 16,
                    amenities: ["Wheels", "Raku Kiln", "Outdoor Firing Area"],
                    isActive: true
                }
            ],
            isActive: true,
            plan: "studio-pro",
            createdAt: "2018-06-15T00:00:00Z",
            memberCount: 142,
            classCount: 28,
            glazes: ["Clear", "Celadon", "Iron Red", "Copper Green", "Matte White", "Cobalt Blue"],
            firingSchedule: [
                {
                    id: "firing_1",
                    type: "Bisque",
                    date: "2025-01-20T09:00:00Z",
                    temperature: "1000°C",
                    capacity: 30,
                    bookedSlots: 15
                },
                {
                    id: "firing_2",
                    type: "Glaze",
                    date: "2025-01-25T09:00:00Z",
                    temperature: "1240°C",
                    capacity: 25,
                    bookedSlots: 20
                }
            ]
        }
    ];

    const updateThrow = (throwEntry: PotteryEntry) => {
        // In a real app, this would update the backend
        console.log("Updating throw:", throwEntry);
    };

    const navigateToPage = (page: string) => {
        setCurrentPage(page);
    };

    const handleLogin = (userData: { email: string; userType: "artist" | "studio" }) => {
        // Create mock user based on type
        if (userData.userType === "studio") {
            const studio = mockStudios[0]; // Use first studio as default
            setCurrentStudio(studio);

            const studioUser: User = {
                id: "studio_user_1",
                name: "Studio Administrator",
                handle: studio.handle,
                email: userData.email,
                type: "studio",
                profile: {
                    bio: "Professional pottery studio dedicated to fostering creativity and ceramic artistry.",
                    socialMedia: {
                        instagram: "@clayandfire",
                        website: "https://clayandfire.com"
                    },
                    branding: {
                        primaryColor: "#8B4513"
                    }
                },
                createdAt: "2018-06-15T00:00:00Z",
                isActive: true
            };
            setCurrentUser(studioUser);
        } else {
            // Artist user
            const artistUser: User = {
                id: "artist_user_1",
                name: "Alex Rivera",
                handle: "alexrivera",
                email: userData.email,
                type: "artist",
                subscription: "passion",
                subscriptionLimits: getSubscriptionLimits("passion"),
                usageStats: {
                    projectsUsed: 3,
                    throwsInProjects: 18,
                    additionalThrowsUsed: 5,
                    totalThrows: 23
                },
                profile: {
                    bio: "Ceramic artist exploring the intersection of traditional techniques and contemporary forms.",
                    socialMedia: {
                        instagram: "@alexrivera_clay",
                        website: "https://alexriveraceramics.com"
                    },
                    profileImage:
                        "https://images.unsplash.com/photo-1494790108755-2616b812c8e5?w=150&h=150&fit=crop&crop=face",
                    branding: {
                        primaryColor: "#6B73FF"
                    }
                },
                createdAt: "2023-03-20T00:00:00Z",
                lastLogin: new Date().toISOString(),
                isActive: true
            };
            setCurrentUser(artistUser);
            setCurrentStudio(mockStudios[0]); // Artists can be members of studios
        }

        setIsLoggedIn(true);
        setCurrentPage(userData.userType === "studio" ? "dashboard" : "profile");
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setCurrentStudio(null);
        setCurrentThrow(null);
        setIsLoggedIn(false);
        setCurrentPage("landing");
    };

    const contextValue: AppContext = {
        currentUser,
        setCurrentUser,
        currentStudio,
        setCurrentStudio,
        currentThrow,
        setCurrentThrow,
        updateThrow,
        navigateToPage
    };

    const renderPage = () => {
        if (!isLoggedIn) {
            switch (currentPage) {
                case "login":
                    return (
                        <LoginForm
                            onLogin={handleLogin}
                            onBack={() => setCurrentPage("landing")}
                        />
                    );
                case "studios":
                    return <PublicStudiosDirectory onNavigate={setCurrentPage} />;
                case "ceramics":
                    return <PublicCeramicsMarketplace onNavigate={setCurrentPage} />;
                default:
                    return <LandingPage onNavigate={setCurrentPage} />;
            }
        }

        if (!currentUser)
            return (
                <LoginForm
                    onLogin={handleLogin}
                    onBack={() => setCurrentPage("landing")}
                />
            );

        switch (currentPage) {
            case "dashboard":
                return currentUser.type === "studio" ? <StudioDashboard /> : <DashboardMockup />;
            case "profile":
                return <ArtistProfile />;
            case "classes":
                return currentUser.type === "studio" ? <ClassesManagement /> : <ArtistClasses />;
            case "journal":
                return <PotteryJournal />;
            case "blog":
                return <BlogManagement />;
            case "whiteboard":
                return <WhiteboardEditor />;
            case "marketplace":
                return <CommerceMarketplace />;
            case "settings":
                return <Settings />;
            case "events":
                return <EventsManagement />;
            case "messages":
                return <MessagingCenter />;
            case "members":
                return <MemberManagement />;
            case "staff":
                return <StaffManagement />;
            case "kilns":
                return <KilnManagement />;
            case "glazes":
                return <GlazeManagement />;
            case "studios":
                return <PublicStudiosDirectory onNavigate={setCurrentPage} />;
            case "ceramics":
                return <PublicCeramicsMarketplace onNavigate={setCurrentPage} />;
            default:
                return (
                    <div className="p-8">
                        <h1>Page not found</h1>
                    </div>
                );
        }
    };

    return (
        // <AppContext.Provider value={contextValue}>
        <div className="min-h-screen bg-background">
            {isLoggedIn && currentUser && (
                <Navigation
                    currentUser={currentUser}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    onLogout={handleLogout}
                />
            )}
            <main>{renderPage()}</main>
        </div>
        // </AppContext.Provider>
    );
}

function DashboardMockup() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Artist Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <h3 className="font-semibold mb-4">Recent Projects</h3>
                        <p className="text-muted-foreground">
                            View and manage your pottery projects
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <h3 className="font-semibold mb-4">Upcoming Classes</h3>
                        <p className="text-muted-foreground">Your scheduled pottery classes</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <h3 className="font-semibold mb-4">Community</h3>
                        <p className="text-muted-foreground">Connect with other ceramic artists</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default App;
