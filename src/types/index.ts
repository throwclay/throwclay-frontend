// Photo and Whiteboard Interfaces
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
  color:
    | "yellow"
    | "blue"
    | "green"
    | "pink"
    | "orange"
    | "purple"
    | "red"
    | "white";
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

// Collaboration Interfaces
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

// Project and Pottery Interfaces
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

// Subscription Interfaces
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

// Studio Interfaces
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

export interface StudioInvite {
  id: string;
  email: string;
  role: string;
  status: string;
  invited_at: string;

  // ---- User-level invite metadata (optional) ----
  name?: string | null;
  phone?: string | null;
  token?: string | null;
  studios?: {
    id: string;
    name: string;
    handle: string;
  } | null;

  // ---- Studio-membership specific fields (optional) ----
  location_id?: string | null;
  membership_type?: string | null;
  studio_id?: string | null;
}

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
  roleForCurrentUser: string;
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

// User Interfaces
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

export interface User {
  id: string;
  name: string;
  handle: string;
  email: string;
  phone: string;
  type: "artist" | "studio";

  // Artist-specific fields
  artistPlan?:
    | "artist-free"
    | "artist-plus"
    | "artist-studio-lite"
    | "artist-studio-enterprise";
  subscription?: string | null;
  subscriptionLimits?: SubscriptionLimits;
  usageStats?: UsageStats;
  availableModes?: ("artist" | "studio")[];
  activeMode?: "artist" | "studio";

  // Shared fields
  profile?: ArtistProfile;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

// Glaze Experiment Tracking Interfaces
export interface GlazeIngredient {
  id: string;
  name: string;
  type:
    | "flux"
    | "silica"
    | "alumina"
    | "colorant"
    | "opacifier"
    | "matting-agent"
    | "other";
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
  glazeType:
    | "new-recipe"
    | "existing-recipe"
    | "purchased-glaze"
    | "modification";
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
  recommendedAtmospheres: (
    | "oxidation"
    | "reduction"
    | "neutral"
    | "raku"
    | "other"
  )[];
  tags: string[];
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  usageCount: number;
  averageRating: number;
}

// Kiln Interfaces
export interface KilnFiringTemplate {
  id: string;
  studioId: string;
  kilnId: string; // Reference to specific kiln
  name: string;
  description?: string;
  baseType:
    | "bisque"
    | "glaze"
    | "raku"
    | "pit"
    | "saggar"
    | "crystalline"
    | "other";
  temperatureCurve: {
    phase: "initial" | "ramp-up" | "soak" | "cool-down";
    targetTemp: number;
    ratePerHour: number;
    holdTime: number;
    notes?: string;
    kilnAdjustments?: {
      topBottomTempDifference?: number;
      ventingRequired?: boolean;
      damperPosition?: string;
      pressureSettings?: string;
    };
  }[];
  atmosphere: "oxidation" | "reduction" | "neutral";
  estimatedDuration: number;
  clayCompatibility: string[];
  glazeCompatibility: string[];
  safetyNotes?: string;
  kilnSpecificInstructions?: string;
  shelfConfiguration?: {
    recommendedShelfHeight: number[];
    loadingPattern?: string;
    maxPiecesPerShelf?: number[];
    shelfSupports?: string;
  };
  isDefault: boolean;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastUsed?: string;
  usageCount: number;
  averageSuccessRate?: number;
  isShared: boolean;
  parentTemplateId?: string;
  version: string;
  changeNotes?: string;
  performanceMetrics?: {
    averageFiringTime: number;
    energyUsage: number;
    successfulFirings: number;
    totalFirings: number;
    commonIssues?: string[];
    lastPerformanceReview?: string;
  };
}

export interface CustomFiringType {
  id: string;
  studioId: string;
  name: string;
  description?: string;
  baseType:
    | "bisque"
    | "glaze"
    | "raku"
    | "pit"
    | "saggar"
    | "crystalline"
    | "other";
  temperatureCurve: {
    phase: "initial" | "ramp-up" | "soak" | "cool-down";
    targetTemp: number;
    ratePerHour: number;
    holdTime: number;
    notes?: string;
  }[];
  atmosphere: "oxidation" | "reduction" | "neutral";
  estimatedDuration: number;
  specialInstructions?: string;
  clayCompatibility: string[];
  glazeCompatibility: string[];
  safetyNotes?: string;
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastUsed?: string;
  usageCount: number;
}

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
  status:
    | "assigned"
    | "in-progress"
    | "completed"
    | "cancelled"
    | "needs-cover";
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

export interface KilnCamera {
  id: string;
  kilnId: string;
  cameraId: string;
  position: "interior" | "exterior" | "control-panel" | "pyrometer";
  isActive: boolean;
  monitoringSettings: {
    recordDuringFiring: boolean;
    createTimeLapse: boolean;
    timeLapseInterval: number;
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
    recordingType:
      | "live-stream"
      | "time-lapse"
      | "temperature-alert"
      | "motion-detection";
    startTime: string;
    endTime?: string;
    fileUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
    fileSize?: number;
    metadata?: {
      maxTemp?: number;
      avgTemp?: number;
      anomaliesDetected?: number;
    };
  }[];
  lastHealthCheck: string;
  healthStatus: "online" | "offline" | "error" | "maintenance";
  batteryLevel?: number;
  signalStrength?: number;
}

export interface RingIntegration {
  id: string;
  studioId: string;
  isEnabled: boolean;
  apiKey: string;
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

export interface KilnShelf {
  id: string;
  level: number;
  capacity: number;
  usedCapacity: number;
  items: KilnLoadItem[];
}

export interface KilnLoadItem {
  id: string;
  throwId?: string;
  artistId: string;
  artistName: string;
  itemName: string;
  clayType: string;
  glazes: string[];
  dimensions?: string;
  specialInstructions?: string;
  shelfPosition?: string;
  loadedAt: string;
  loadedBy: string;
  status: "loaded" | "firing" | "cooling" | "ready-for-pickup" | "picked-up";
  pickupNotified?: string;
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
  assignedEmployee?: string;
  assignment?: KilnAssignment;
  notes?: string;
  photos?: string[];
}

export interface KilnPerformanceLog {
  id: string;
  kilnId: string;
  firingId: string;
  timestamp: string;
  temperature: number;
  targetTemperature: number;
  phase: "heating" | "holding" | "cooling";
  gasUsage?: number;
  electricUsage?: number;
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
  capacity: number;
  maxTemp: number;
  shelfCount: number;
  shelfConfiguration: {
    level: number;
    height: number;
    capacity: number;
  }[];
  status:
    | "available"
    | "loading"
    | "firing"
    | "cooling"
    | "maintenance"
    | "out-of-service";
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
  cameras: KilnCamera[];
  currentAssignment?: KilnAssignment;
  firingTemplates: KilnFiringTemplate[];
}

// Employee and Management Interfaces
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
  classId?: string;
  coveringForId?: string;
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
  category:
    | "operations"
    | "classes"
    | "social-media"
    | "covering-shift"
    | "training"
    | "other";
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
  status:
    | "draft"
    | "submitted"
    | "approved"
    | "rejected"
    | "needs-review"
    | "processed";
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
  level: number;
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
  assignedClasses: string[];
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
  role: "admin" | "manager" | "employee";
  responsibilities: string[];
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
  responsibilities: string[];
  notes?: string;
  status: "scheduled" | "in-progress" | "completed" | "absent";
  locationId?: string;
  createdAt: string;
  updatedAt: string;
}

// Class and Event Interfaces
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
  icon?: string;
  customIconUrl?: string;
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
  designId: string;
  category: "completion" | "achievement" | "skill" | "participation" | "custom";
  isDefault: boolean;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completionCriteria: {
    type: "attendance" | "grading" | "manual" | "time-based" | "project-based";
    requirements: {
      minimumAttendance?: number;
      minimumGrade?: number;
      requiredSessions?: number;
      requiredProjects?: number;
      timeThreshold?: number;
      customCriteria?: string;
    };
    autoAward: boolean;
  };
  displaySettings: {
    showOnProfile: boolean;
    isPublic: boolean;
    showOnCertificate: boolean;
    includeBadgeCode: boolean;
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
  badgeId: string;
  classId: string;
  studentId: string;
  studentName: string;
  awardedDate: string;
  awardedBy: string;
  awardMethod: "automatic" | "manual" | "imported";
  status: "active" | "revoked" | "archived";
  verificationCode: string;
  socialShareEnabled: boolean;
  finalGrade?: number;
  finalAttendance?: number;
  projectsCompleted?: number;
  skillsAchieved?: string[];
  instructorNotes?: string;
  displayOnProfile: boolean;
  customTitle?: string;
  customDescription?: string;
  shareCount: number;
  viewCount: number;
  classDetails?: {
    className: string;
    instructorName: string;
    studioName: string;
    completionDate: string;
    duration: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ClassBadgeSettings {
  id: string;
  classId: string;
  isEnabled: boolean;
  selectedBadgeId?: string;
  customBadgeDesign?: BadgeDesign;
  awardingCriteria: {
    type: "attendance" | "grading" | "manual" | "combined";
    attendanceThreshold?: number;
    gradeThreshold?: number;
    requiresBothCriteria?: boolean;
    customRequirements?: string;
  };
  autoAwardEnabled: boolean;
  instructorApprovalRequired: boolean;
  allowStudentSelfNomination: boolean;
  badgeCustomization?: {
    title?: string;
    subtitle?: string;
    includeClassDetails: boolean;
    includeDuration: boolean;
    includeSkills: boolean;
    customMessage?: string;
  };
  notifications: {
    emailStudent: boolean;
    emailInstructor: boolean;
    showInClassFeed: boolean;
    socialMediaPost: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export type UUID = string;

export type MembershipStatus =
  | "active"
  | "paused"
  | "canceled"
  | "pending"
  | "inactive"
  | (string & {}); // allow other backend values

export type MembershipType =
  | "month-to-month"
  | "annual"
  | "drop-in"
  | "student"
  | "resident"
  | (string & {});

export interface StudioMembership {
  id: UUID;
  userId: UUID;
  studioId: UUID;

  // Used by your UI:
  shelfNumber?: string | null;
  locationId?: UUID | null;
  membershipType?: MembershipType | null;
  monthlyRate?: number | null;
  passionProjectsUpgrade?: boolean | null;

  status?: MembershipStatus;
  lastActivity?: string | Date | null;
  startDate?: string;

  role?: StudioRole;
  studioName?: string;
  studioHandle?: string;
  locationName?: string | null;

  // Room for whatever else you already have:
  createdAt?: string;
  updatedAt?: string;
}

export type InvoiceStatus =
  | "draft"
  | "open"
  | "paid"
  | "partial"
  | "overdue"
  | "void"
  | "refunded"
  | (string & {});

export interface PaymentInvoice {
  id: UUID;
  memberId?: UUID;
  amount?: number; // e.g., dollars
  amountCents?: number; // or cents
  dueDate?: string | Date | null;
  paidAt?: string | Date | null;
  status: InvoiceStatus; // required since UI expects it
  createdAt?: string;
  updatedAt?: string;
}

export type ExperienceLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | (string & {});

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship?: string;
}

export interface MembershipApplication {
  id: UUID;

  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string | null;
  applicantHandle?: string | null;

  submittedAt: string | Date;

  membershipType?: MembershipType | null;
  locationId?: UUID | null;
  studioId?: UUID | null;

  experience?: ExperienceLevel | number | null;

  emergencyContact?: EmergencyContact | null;

  interests?: string[];
  goals?: string[];

  notes?: string | null;
  referralSource?: string | null;
  customFields?: {};
  status?: "submitted" | "reviewing" | "accepted" | "rejected" | (string & {});
}

// ---- Studio-mode policy guards ----
export type StudioRole =
  | "owner"
  | "admin"
  | "manager"
  | "instructor"
  | "employee"
  | "member";

export type NotificationItem = {
  id: string;
  type: "invite" | "kiln" | "class" | "membership" | string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
};

export type AppContextType = {
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;
  currentStudio: Studio | null;
  setCurrentStudio: (s: Studio | null) => void;

  currentMembership: StudioMembership | null;
  setCurrentMembership: (m: StudioMembership | null) => void;

  studioMemberships: StudioMembership[];
  setStudioMemberships: (ms: StudioMembership[]) => void;

  currentThrow: PotteryEntry | null;
  setCurrentThrow: (t: PotteryEntry | null) => void;

  authToken: string | null;
  setAuthToken: (token: string | null) => void;

  // user-level pending invites (for nav badge + InvitesPanel)
  pendingInvites: StudioInvite[];
  setPendingInvites: (invites: StudioInvite[]) => void;

  // central user-level invite fetcher
  refreshInvites: (opts?: {
    status?: string;
    tokenOverride?: string;
  }) => Promise<StudioInvite[]>;
};

export type PriceRange = "low" | "medium" | "high";

export interface PublicStudioLocationCard {
  locationId: UUID; // studio_locations.id
  studioId: UUID; // studios.id (UUID)
  studioName: string;
  locationName: string;
  description: string;
  addressLine: string;
  city: string;
  state: string;
  zipCode: string;
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
  priceRange: PriceRange;
  openToPublic: boolean;
  distance?: number;
}

export interface MemberData extends User {
  membership: StudioMembership;
  invoices: PaymentInvoice[];
  classHistory: any[];
  eventHistory: any[];
}

export type InviteRole = "member";
