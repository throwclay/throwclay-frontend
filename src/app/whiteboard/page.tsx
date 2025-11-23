"use client"

import { useState, useRef, useCallback, useEffect } from "react";
import {
  ArrowLeft,
  Share2,
  FileDown,
  Save,
  Plus,
  Minus,
  ZoomIn,
  ZoomOut,
  MousePointer,
  Pen,
  Eraser,
  Highlighter,
  StickyNote,
  Image,
  Type,
  Grid,
  Upload,
  PlusSquare,
  ChevronLeft,
  ChevronRight,
  Layers,
  Settings,
  Flame,
  Palette as PaletteIcon,
  Scissors,
  Paintbrush,
  Thermometer,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Users,
  Send,
  Eye,
  MessageSquare,
  Edit3,
  MoreHorizontal,
  Trash2,
  Copy,
  RotateCcw,
  Move,
  BookOpen,
  Camera,
  Beaker,
  FileText,
  Calendar,
  Tag,
  Target,
  Zap,
  Workflow,
  Sparkles,
  Wand2,
  Lightbulb,
  ChevronDown,
  X,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useAppContext,
  type PotteryEntry,
  type WhiteboardPage,
  type StickyNote,
  type TextBox,
  type PhotoEntry,
  type DrawingStroke,
} from "@/app/context/AppContext";
import { getSubscriptionLimits } from "@/utils/subscriptions";

export default function WhiteboardEditor() {
  const context = useAppContext();

  // Redirect to journal if no current throw
  useEffect(() => {
    if (!context.currentThrow) {
      context.navigateToPage("journal");
    }
  }, [context.currentThrow, context.navigateToPage]);

  // Whiteboard states
  const [currentPage, setCurrentPage] = useState(0);
  const [whiteboardTool, setWhiteboardTool] = useState<
    "select" | "pen" | "eraser" | "highlighter" | "text" | "sticky" | "photo"
  >("select");
  const [brushSize, setBrushSize] = useState(3);
  const [brushColor, setBrushColor] = useState("#000000");
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  // Dialog states
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showGlazingDialog, setShowGlazingDialog] = useState(false);
  const [showFiringDialog, setShowFiringDialog] = useState(false);
  const [showTrimmingDialog, setShowTrimmingDialog] = useState(false);

  // Share states
  const [shareEmail, setShareEmail] = useState("");
  const [sharePermission, setSharePermission] = useState<
    "view" | "comment" | "edit"
  >("view");
  const [canDuplicate, setCanDuplicate] = useState(false);

  // Pottery tool states
  const [selectedGlazes, setSelectedGlazes] = useState<string[]>([]);
  const [customGlaze, setCustomGlaze] = useState("");
  const [selectedFiring, setSelectedFiring] = useState<string>("");
  const [customFiring, setCustomFiring] = useState("");
  const [firingTemp, setFiringTemp] = useState("1240°C");
  const [selectedTrimmingPattern, setSelectedTrimmingPattern] = useState("");
  const [showTrimmingOverlay, setShowTrimmingOverlay] = useState(false);
  const [aiTrimmingSuggestions, setAiTrimmingSuggestions] = useState<any[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const subscriptionLimits = getSubscriptionLimits(context.currentUser?.subscription);

  // Available options
  const potteryTypes = [
    "Bowl",
    "Mug",
    "Plate",
    "Vase",
    "Cylinder",
    "Cup",
    "Platter",
    "Pitcher",
    "Teapot",
    "Sculpture",
    "Tile",
    "Other",
  ];
  const clayTypes = [
    "Stoneware",
    "Porcelain",
    "Earthenware",
    "Raku",
    "Paper Clay",
    "Grogged Clay",
  ];
  const techniques = [
    "Wheel throwing",
    "Hand building",
    "Coil building",
    "Slab building",
    "Trimming",
    "Altering",
    "Carving",
    "Texturing",
    "Slip trailing",
    "Mishima",
  ];
  const firingTypes = [
    "Oxidation",
    "Reduction",
    "Raku",
    "Pit firing",
    "Saggar",
    "Salt/Soda",
    "Wood firing",
  ];
  const temperatures = [
    "1000°C",
    "1100°C",
    "1200°C",
    "1240°C",
    "1260°C",
    "1280°C",
    "1300°C",
    "1320°C",
    "Custom",
  ];
  const availableGlazes = context.currentStudio?.glazes || [
    "Clear",
    "Celadon",
    "Iron Red",
    "Copper Green",
    "Matte White",
    "Cobalt Blue",
  ];

  const stickyNoteColors = [
    { name: "yellow", value: "#FFEB3B", textColor: "#000000" },
    { name: "blue", value: "#2196F3", textColor: "#FFFFFF" },
    { name: "green", value: "#4CAF50", textColor: "#FFFFFF" },
    { name: "pink", value: "#E91E63", textColor: "#FFFFFF" },
    { name: "orange", value: "#FF9800", textColor: "#000000" },
    { name: "purple", value: "#9C27B0", textColor: "#FFFFFF" },
    { name: "red", value: "#F44336", textColor: "#FFFFFF" },
    { name: "white", value: "#FFFFFF", textColor: "#000000" },
  ];

  // Pottery process buttons
  const potteryProcesses = [
    { id: "throwing", label: "Throwing", icon: Target, color: "#8B4513" },
    { id: "trimming", label: "Trimming", icon: Scissors, color: "#2563EB" },
    { id: "glazing", label: "Glazing", icon: Paintbrush, color: "#16A34A" },
    { id: "firing", label: "Firing", icon: Flame, color: "#DC2626" },
    { id: "drying", label: "Drying", icon: Clock, color: "#CA8A04" },
    { id: "wedging", label: "Wedging", icon: Zap, color: "#7C3AED" },
    { id: "centering", label: "Centering", icon: Target, color: "#0891B2" },
    { id: "burnishing", label: "Burnishing", icon: Star, color: "#BE185D" },
  ];

  // Trimming patterns for AI suggestions
  const trimmingPatterns = [
    {
      id: "traditional-foot",
      name: "Traditional Foot",
      description: "Classic raised foot ring",
      confidence: 92,
    },
    {
      id: "carved-foot",
      name: "Carved Foot",
      description: "Decorative carved patterns",
      confidence: 87,
    },
    {
      id: "beveled-edge",
      name: "Beveled Edge",
      description: "Angled bottom edge",
      confidence: 95,
    },
    {
      id: "stepped-foot",
      name: "Stepped Foot",
      description: "Multi-level foot design",
      confidence: 78,
    },
    {
      id: "minimal-trim",
      name: "Minimal Trim",
      description: "Light surface cleanup only",
      confidence: 98,
    },
    {
      id: "deep-undercut",
      name: "Deep Undercut",
      description: "Pronounced overhang",
      confidence: 84,
    },
    {
      id: "fluted-base",
      name: "Fluted Base",
      description: "Vertical groove pattern",
      confidence: 76,
    },
    {
      id: "textured-rim",
      name: "Textured Rim",
      description: "Decorative rim treatment",
      confidence: 89,
    },
  ];

  // Available firing schedules from studio
  const availableFirings =
    context.currentStudio?.firingSchedule?.map((schedule) => ({
      id: schedule.id,
      label: `${schedule.type} - ${schedule.date} (${schedule.temperature})`,
      type: schedule.type,
      date: schedule.date,
      temperature: schedule.temperature,
      available: schedule.bookedSlots < schedule.capacity,
      spotsLeft: schedule.capacity - schedule.bookedSlots,
    })) || [];

  if (!context.currentThrow) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2>No throw selected</h2>
          <p className="text-muted-foreground mb-4">
            Please select a throw from your journal to edit.
          </p>
          <Button onClick={() => context.navigateToPage("journal")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Journal
          </Button>
        </div>
      </div>
    );
  }

  const handleBackToJournal = () => {
    if (context.currentThrow) {
      context.updateThrow(context.currentThrow);
    }
    context.context.setCurrentThrow(null);
    context.navigateToPage("journal");
  };

  const handleUpdateThrowField = (field: keyof PotteryEntry, value: any) => {
    if (!context.currentThrow) return;

    const updatedThrow = {
      ...context.currentThrow,
      [field]: value,
      updatedAt: new Date().toISOString(),
    };
    context.context.setCurrentThrow(updatedThrow);
    context.updateThrow(updatedThrow);
  };

  const handlePhotoUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;
      if (!subscriptionLimits.canUploadPhotos) {
        alert(
          "Photo upload is not available in your current plan. Please upgrade to unlock this feature."
        );
        return;
      }

      Array.from(files).forEach((file) => {
        if (file.size > subscriptionLimits.maxPhotoSize * 1024 * 1024) {
          alert(
            `File ${file.name} is too large. Maximum size is ${subscriptionLimits.maxPhotoSize}MB.`
          );
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const photoEntry: PhotoEntry = {
            id: `photo${Date.now()}_${Math.random()}`,
            url: e.target?.result as string,
            type: "photo",
            caption: file.name,
            notes: "",
            timestamp: new Date().toISOString(),
            x: 50 + Math.random() * 200,
            y: 50 + Math.random() * 200,
            width: 200,
            height: 150,
            annotations: [],
          };

          if (context.currentThrow && context.currentThrow.whiteboardPages.length > 0) {
            const updatedPages = [...context.currentThrow.whiteboardPages];
            updatedPages[currentPage].elements.photos.push(photoEntry);
            const updatedThrow = {
              ...context.currentThrow,
              whiteboardPages: updatedPages,
            };
            context.context.setCurrentThrow(updatedThrow);
            context.updateThrow(updatedThrow);
          }
        };
        reader.readAsDataURL(file);
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [
      context.currentThrow,
      context.currentPage,
      context.subscriptionLimits,
      context.context.setCurrentThrow,
      context.updateThrow,
    ]
  );

  const handleAddStickyNote = () => {
    if (!context.currentThrow || context.currentThrow.whiteboardPages.length === 0) return;

    const stickyNote: StickyNote = {
      id: `sticky${Date.now()}`,
      content: "New note",
      x: 100 + Math.random() * 300,
      y: 100 + Math.random() * 200,
      width: 200,
      height: 120,
      color: "yellow",
      fontSize: "medium",
      createdAt: new Date().toISOString(),
      createdBy: context.currentUser?.id || "user1",
    };

    const updatedPages = [...currentThrow.whiteboardPages];
    updatedPages[currentPage].elements.stickyNotes.push(stickyNote);
    const updatedThrow = { ...currentThrow, whiteboardPages: updatedPages };
    context.context.setCurrentThrow(updatedThrow);
    updateThrow(updatedThrow);
  };

  const handleAddProcessNote = (processId: string) => {
    if (!context.currentThrow || context.currentThrow.whiteboardPages.length === 0) return;

    // Handle special pottery tools with enhanced dialogs
    if (processId === "glazing") {
      setShowGlazingDialog(true);
      return;
    }
    if (processId === "firing") {
      setShowFiringDialog(true);
      return;
    }
    if (processId === "trimming") {
      if (subscriptionLimits.canUsePremiumTools) {
        setShowTrimmingDialog(true);
        generateTrimmingSuggestions();
      } else {
        // Fallback to basic trimming note for free users
        addBasicProcessNote(processId);
      }
      return;
    }

    addBasicProcessNote(processId);
  };

  const addBasicProcessNote = (processId: string) => {
    const process = potteryProcesses.find((p) => p.id === processId);
    if (!process) return;

    const processNote: StickyNote = {
      id: `process${Date.now()}`,
      content: `${process.label}\n\nAdd your notes here...`,
      x: 50 + Math.random() * 400,
      y: 50 + Math.random() * 300,
      width: 240,
      height: 160,
      color: "blue",
      fontSize: "medium",
      createdAt: new Date().toISOString(),
      createdBy: context.currentUser?.id || "user1",
    };

    const updatedPages = [...currentThrow.whiteboardPages];
    updatedPages[currentPage].elements.stickyNotes.push(processNote);
    const updatedThrow = { ...currentThrow, whiteboardPages: updatedPages };
    context.context.setCurrentThrow(updatedThrow);
    context.updateThrow(updatedThrow);
  };

  const handleApplyGlazes = () => {
    if (!context.currentThrow) return;

    const glazeList = [...selectedGlazes];
    if (customGlaze.trim()) {
      glazeList.push(customGlaze.trim());
    }

    // Update the throw's glazes
    handleUpdateThrowField("glazes", glazeList);

    // Add glazing note to whiteboard
    const glazingNote: StickyNote = {
      id: `glazing${Date.now()}`,
      content: `Glazing Plan\n\n${glazeList.join(
        "\n"
      )}\n\nApplication notes:\n• Apply evenly\n• Check thickness\n• Document results`,
      x: 100 + Math.random() * 300,
      y: 100 + Math.random() * 200,
      width: 280,
      height: 200,
      color: "green",
      fontSize: "medium",
      createdAt: new Date().toISOString(),
      createdBy: context.currentUser?.id || "user1",
    };

    const updatedPages = [...context.currentThrow.whiteboardPages];
    updatedPages[currentPage].elements.stickyNotes.push(glazingNote);
    const updatedThrow = { ...context.currentThrow, whiteboardPages: updatedPages };
    context.context.setCurrentThrow(updatedThrow);
    context.updateThrow(updatedThrow);

    setShowGlazingDialog(false);
    setSelectedGlazes([]);
    setCustomGlaze("");
  };

  const handleScheduleFiring = () => {
    if (!context.currentThrow) return;

    const firingType = selectedFiring || customFiring;
    if (!firingType) return;

    const selectedSchedule = availableFirings.find(
      (f) => f.id === selectedFiring
    );

    // Update the throw's firing information
    handleUpdateThrowField("firingType", firingType);
    handleUpdateThrowField("firingTemp", firingTemp);

    // Add firing note to whiteboard
    const firingContent = selectedSchedule
      ? `Firing Schedule\n\n${selectedSchedule.type} @ ${
          selectedSchedule.temperature
        }\nDate: ${new Date(
          selectedSchedule.date
        ).toLocaleDateString()}\n\nStatus: Scheduled\n${
          selectedSchedule.spotsLeft
        } spots remaining`
      : `Custom Firing\n\n${firingType} @ ${firingTemp}\n\nScheduled for loading...\nCoordinate with studio`;

    const firingNote: StickyNote = {
      id: `firing${Date.now()}`,
      content: firingContent,
      x: 100 + Math.random() * 300,
      y: 100 + Math.random() * 200,
      width: 300,
      height: 180,
      color: "orange",
      fontSize: "medium",
      createdAt: new Date().toISOString(),
      createdBy: context.currentUser?.id || "user1",
    };

    const updatedPages = [...context.currentThrow.whiteboardPages];
    updatedPages[currentPage].elements.stickyNotes.push(firingNote);
    const updatedThrow = { ...context.currentThrow, whiteboardPages: updatedPages };
    context.context.setCurrentThrow(updatedThrow);
    context.updateThrow(updatedThrow);

    setShowFiringDialog(false);
    setSelectedFiring("");
    setCustomFiring("");
  };

  const generateTrimmingSuggestions = () => {
    setIsGeneratingAI(true);

    // Simulate AI analysis based on pottery type and photos
    setTimeout(() => {
      const suggestions = trimmingPatterns
        .filter((pattern) => {
          // Simple logic based on pottery type
          if (context.currentThrow?.potteryType === "Bowl") {
            return [
              "traditional-foot",
              "carved-foot",
              "beveled-edge",
              "minimal-trim",
            ].includes(pattern.id);
          } else if (context.currentThrow?.potteryType === "Vase") {
            return ["stepped-foot", "deep-undercut", "fluted-base"].includes(
              pattern.id
            );
          } else if (context.currentThrow?.potteryType === "Mug") {
            return [
              "traditional-foot",
              "minimal-trim",
              "textured-rim",
            ].includes(pattern.id);
          }
          return true;
        })
        .slice(0, 4);

      setAiTrimmingSuggestions(suggestions);
      setIsGeneratingAI(false);
    }, 2000); // Simulate AI processing time
  };

  const handleApplyTrimmingPattern = (patternId: string) => {
    if (!context.currentThrow) return;

    const pattern = trimmingPatterns.find((p) => p.id === patternId);
    if (!pattern) return;

    // Add trimming note with AI suggestion
    const trimmingNote: StickyNote = {
      id: `trimming${Date.now()}`,
      content: `AI Trimming Analysis\n\n${pattern.name}\n${pattern.description}\n\nConfidence: ${pattern.confidence}%\n\nRecommended approach:\n• Mark center point\n• Measure wall thickness\n• Trim gradually`,
      x: 100 + Math.random() * 300,
      y: 100 + Math.random() * 200,
      width: 320,
      height: 220,
      color: "purple",
      fontSize: "medium",
      createdAt: new Date().toISOString(),
      createdBy: context.currentUser?.id || "user1",
    };

    const updatedPages = [...context.currentThrow.whiteboardPages];
    updatedPages[currentPage].elements.stickyNotes.push(trimmingNote);
    const updatedThrow = { ...context.currentThrow, whiteboardPages: updatedPages };
    context.context.setCurrentThrow(updatedThrow);
    context.updateThrow(updatedThrow);

    setShowTrimmingDialog(false);
    setSelectedTrimmingPattern("");
  };

  const handleAddPage = () => {
    if (!context.currentThrow) return;

    const maxPages = subscriptionLimits.maxPagesPerThrow;
    if (maxPages !== -1 && context.currentThrow.whiteboardPages.length >= maxPages) {
      alert(
        `You've reached the maximum number of pages (${maxPages}) for your subscription plan.`
      );
      return;
    }

    const newPage: WhiteboardPage = {
      id: `page${Date.now()}`,
      title: `Page ${context.currentThrow.whiteboardPages.length + 1}`,
      order: context.currentThrow.whiteboardPages.length,
      canvasWidth: 1400,
      canvasHeight: 900,
      backgroundColor: "#FFFFFF",
      elements: {
        photos: [],
        stickyNotes: [],
        textBoxes: [],
        drawings: [],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedPages = [...context.currentThrow.whiteboardPages, newPage];
    const updatedThrow = { ...context.currentThrow, whiteboardPages: updatedPages };
    context.context.setCurrentThrow(updatedThrow);
    context.updateThrow(updatedThrow);
    context.setCurrentPage(updatedPages.length - 1);
  };

  const handleExportToPDF = () => {
    if (!subscriptionLimits.canExport) {
      alert(
        "PDF export is not available in your current plan. Please upgrade to unlock this feature."
      );
      return;
    }
    setShowExportDialog(true);
  };

  const handleShare = () => {
    if (!subscriptionLimits.canCollaborate) {
      alert(
        "Sharing is not available in your current plan. Please upgrade to unlock this feature."
      );
      return;
    }
    setShowShareDialog(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "in-progress":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "fired":
        return <Star className="w-4 h-4 text-orange-500" />;
      case "planning":
        return <FileText className="w-4 h-4 text-purple-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const renderToolbar = () => (
    <div className="flex items-center justify-between p-4 bg-card border-b sticky top-0 z-10">
      {/* Left side - Navigation */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={handleBackToJournal}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Journal
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {getStatusIcon(context.currentThrow.status)}
            <h1 className="text-xl font-semibold">{context.currentThrow.title}</h1>
          </div>
          <Badge variant="outline">
            {context.currentThrow.whiteboardPages.length} page
            {context.currentThrow.whiteboardPages.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          <Settings className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleShare}>
          <Share2 className="w-4 h-4 mr-1" />
          Share
        </Button>
        <Button variant="ghost" size="sm" onClick={handleExportToPDF}>
          <FileDown className="w-4 h-4 mr-1" />
          Export
        </Button>
        <Button size="sm" onClick={() => updateThrow(context.currentThrow)}>
          <Save className="w-4 h-4 mr-1" />
          Save
        </Button>
      </div>
    </div>
  );

  const renderWhiteboardTools = () => (
    <div className="flex items-center space-x-2 p-3 bg-card border-b overflow-x-auto">
      {/* Tool Selection */}
      <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
        <Toggle
          pressed={whiteboardTool === "select"}
          onPressedChange={() => setWhiteboardTool("select")}
        >
          <MousePointer className="w-4 h-4" />
        </Toggle>
        <Toggle
          pressed={whiteboardTool === "pen"}
          onPressedChange={() => setWhiteboardTool("pen")}
        >
          <Pen className="w-4 h-4" />
        </Toggle>
        <Toggle
          pressed={whiteboardTool === "highlighter"}
          onPressedChange={() => setWhiteboardTool("highlighter")}
        >
          <Highlighter className="w-4 h-4" />
        </Toggle>
        <Toggle
          pressed={whiteboardTool === "eraser"}
          onPressedChange={() => setWhiteboardTool("eraser")}
        >
          <Eraser className="w-4 h-4" />
        </Toggle>
        <Toggle
          pressed={whiteboardTool === "text"}
          onPressedChange={() => setWhiteboardTool("text")}
        >
          <Type className="w-4 h-4" />
        </Toggle>
        <Toggle
          pressed={whiteboardTool === "sticky"}
          onPressedChange={() => setWhiteboardTool("sticky")}
        >
          <StickyNote className="w-4 h-4" />
        </Toggle>
        <Toggle
          pressed={whiteboardTool === "photo"}
          onPressedChange={() => setWhiteboardTool("photo")}
        >
          <Image className="w-4 h-4" />
        </Toggle>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Enhanced Pottery Process Buttons */}
      <div className="flex items-center space-x-1">
        {potteryProcesses.slice(0, 4).map((process) => {
          const isEnhanced = ["glazing", "firing", "trimming"].includes(
            process.id
          );
          return (
            <Button
              key={process.id}
              variant="ghost"
              size="sm"
              onClick={() => handleAddProcessNote(process.id)}
              className={`flex items-center space-x-1 ${
                isEnhanced ? "relative" : ""
              }`}
            >
              <process.icon
                className="w-4 h-4"
                style={{ color: process.color }}
              />
              <span>{process.label}</span>
              {isEnhanced && (
                <Sparkles className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
              )}
            </Button>
          );
        })}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {potteryProcesses.slice(4).map((process) => (
              <DropdownMenuItem
                key={process.id}
                onClick={() => handleAddProcessNote(process.id)}
              >
                <process.icon
                  className="w-4 h-4 mr-2"
                  style={{ color: process.color }}
                />
                {process.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Brush Settings */}
      {(whiteboardTool === "pen" || whiteboardTool === "highlighter") && (
        <>
          <div className="flex items-center space-x-2">
            <Label className="text-sm">Size:</Label>
            <Slider
              value={[brushSize]}
              onValueChange={(value) => setBrushSize(value[0])}
              max={20}
              min={1}
              step={1}
              className="w-20"
            />
            <span className="text-sm text-muted-foreground w-6">
              {brushSize}px
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Label className="text-sm">Color:</Label>
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              className="w-8 h-8 rounded border"
            />
          </div>
          <Separator orientation="vertical" className="h-6" />
        </>
      )}

      {/* Canvas Controls */}
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCanvasZoom(Math.max(0.25, canvasZoom - 0.25))}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-sm text-muted-foreground w-12 text-center">
          {Math.round(canvasZoom * 100)}%
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCanvasZoom(Math.min(3, canvasZoom + 0.25))}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
      </div>

      <Toggle pressed={showGrid} onPressedChange={setShowGrid}>
        <Grid className="w-4 h-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6" />

      {/* Quick Actions */}
      <Button variant="ghost" size="sm" onClick={handleAddStickyNote}>
        <PlusSquare className="w-4 h-4 mr-1" />
        Note
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-4 h-4 mr-1" />
        Photo
      </Button>
    </div>
  );

  const renderCanvas = () => {
    if (!context.currentThrow || context.currentThrow.whiteboardPages.length === 0) return null;

    const currentPageData = context.currentThrow.whiteboardPages[currentPage];

    return (
      <div
        className="flex-1 relative overflow-auto bg-gray-50"
        style={{
          transform: `scale(${canvasZoom})`,
          transformOrigin: "top left",
        }}
      >
        {/* Grid Background */}
        {showGrid && (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px",
            }}
          />
        )}

        {/* Canvas */}
        <div
          className="relative bg-white shadow-lg mx-4 my-4"
          style={{
            width: currentPageData.canvasWidth,
            height: currentPageData.canvasHeight,
            backgroundColor: currentPageData.backgroundColor,
          }}
        >
          {/* Photos */}
          {currentPageData.elements.photos.map((photo) => (
            <div
              key={photo.id}
              className="absolute border-2 border-transparent hover:border-blue-500 cursor-move group"
              style={{
                left: photo.x,
                top: photo.y,
                width: photo.width,
                height: photo.height,
              }}
            >
              <img
                src={photo.url}
                alt={photo.caption}
                className="w-full h-full object-cover rounded"
                draggable={false}
              />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="secondary" className="h-6 w-6 p-0">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}

          {/* Sticky Notes */}
          {currentPageData.elements.stickyNotes.map((note) => {
            const colorConfig =
              stickyNoteColors.find((c) => c.name === note.color) ||
              stickyNoteColors[0];
            return (
              <div
                key={note.id}
                className="absolute p-3 shadow-md cursor-move border-2 border-transparent hover:border-blue-500 group"
                style={{
                  left: note.x,
                  top: note.y,
                  width: note.width,
                  height: note.height,
                  backgroundColor: colorConfig.value,
                  color: colorConfig.textColor,
                  fontSize:
                    note.fontSize === "small"
                      ? "12px"
                      : note.fontSize === "large"
                      ? "16px"
                      : "14px",
                }}
              >
                <div className="whitespace-pre-wrap h-full overflow-hidden">
                  {note.content}
                </div>
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0"
                    style={{ color: colorConfig.textColor }}
                  >
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            );
          })}

          {/* Text Boxes */}
          {currentPageData.elements.textBoxes.map((textBox) => (
            <div
              key={textBox.id}
              className="absolute p-2 cursor-move border-2 border-transparent hover:border-blue-500"
              style={{
                left: textBox.x,
                top: textBox.y,
                width: textBox.width,
                height: textBox.height,
                fontSize: textBox.fontSize,
                color: textBox.fontColor,
                backgroundColor: textBox.backgroundColor,
                borderColor: textBox.borderColor,
                textAlign: textBox.alignment,
              }}
            >
              <div className="whitespace-pre-wrap">{textBox.content}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPageNavigation = () => (
    <div className="flex items-center justify-between p-3 bg-card border-t">
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center space-x-1">
          {context.currentThrow?.whiteboardPages.map((page, index) => (
            <Button
              key={page.id}
              variant={index === currentPage ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentPage(index)}
              className="min-w-[40px]"
            >
              {index + 1}
            </Button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setCurrentPage(
              Math.min(
                (context.currentThrow?.whiteboardPages.length || 1) - 1,
                currentPage + 1
              )
            )
          }
          disabled={
            currentPage >= (context.currentThrow?.whiteboardPages.length || 1) - 1
          }
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">
          Page {currentPage + 1} of {context.currentThrow?.whiteboardPages.length || 0}
        </span>

        <Button variant="ghost" size="sm" onClick={handleAddPage}>
          <Plus className="w-4 h-4 mr-1" />
          Add Page
        </Button>
      </div>
    </div>
  );

  const renderSidebar = () => (
    <div className="w-80 bg-card border-l flex flex-col">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-3 m-2">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="process">Process</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          {/* Details Tab */}
          <TabsContent value="details" className="p-4 space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium flex items-center space-x-2">
                <Tag className="w-4 h-4" />
                <span>Basic Information</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={context.currentThrow.title}
                    onChange={(e) =>
                      handleUpdateThrowField("title", e.target.value)
                    }
                    placeholder="Enter throw title"
                  />
                </div>

                <div>
                  <Label>Pottery Type</Label>
                  <Select
                    value={context.currentThrow.potteryType}
                    onValueChange={(value) =>
                      handleUpdateThrowField("potteryType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {potteryTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Dimensions</Label>
                  <Input
                    value={context.currentThrow.dimensions || ""}
                    onChange={(e) =>
                      handleUpdateThrowField("dimensions", e.target.value)
                    }
                    placeholder="e.g., 6″ diameter x 3″ height"
                  />
                </div>

                <div>
                  <Label>Status</Label>
                  <Select
                    value={context.currentThrow.status}
                    onValueChange={(value) =>
                      handleUpdateThrowField("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="fired">Fired</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-medium flex items-center space-x-2">
                <PaletteIcon className="w-4 h-4" />
                <span>Clay & Materials</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <Label>Clay Type</Label>
                  <Select
                    value={context.currentThrow.clayType}
                    onValueChange={(value) =>
                      handleUpdateThrowField("clayType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {clayTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Techniques</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {techniques.slice(0, 6).map((technique) => (
                      <Badge
                        key={technique}
                        variant={
                          context.currentThrow.techniques.includes(technique)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer text-xs"
                        onClick={() => {
                          const newTechniques =
                            context.currentThrow.techniques.includes(technique)
                              ? context.currentThrow.techniques.filter(
                                  (t) => t !== technique
                                )
                              : [...currentThrow.techniques, technique];
                          handleUpdateThrowField("techniques", newTechniques);
                        }}
                      >
                        {technique}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-medium flex items-center space-x-2">
                <Flame className="w-4 h-4" />
                <span>Firing & Glazes</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <Label>Firing Type</Label>
                  <Select
                    value={context.currentThrow.firingType}
                    onValueChange={(value) =>
                      handleUpdateThrowField("firingType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {firingTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Temperature</Label>
                  <Select
                    value={context.currentThrow.firingTemp}
                    onValueChange={(value) =>
                      handleUpdateThrowField("firingTemp", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {temperatures.map((temp) => (
                        <SelectItem key={temp} value={temp}>
                          {temp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Glazes</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {availableGlazes.map((glaze) => (
                      <Badge
                        key={glaze}
                        variant={
                          context.currentThrow.glazes.includes(glaze)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer text-xs"
                        onClick={() => {
                          const newGlazes = context.currentThrow.glazes.includes(glaze)
                            ? context.currentThrow.glazes.filter((g) => g !== glaze)
                            : [...context.currentThrow.glazes, glaze];
                          handleUpdateThrowField("glazes", newGlazes);
                        }}
                      >
                        {glaze}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="p-4 space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Notes & Reflection</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={context.currentThrow.description || ""}
                    onChange={(e) =>
                      handleUpdateThrowField("description", e.target.value)
                    }
                    placeholder="Brief description of the piece..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Process Notes</Label>
                  <Textarea
                    value={context.currentThrow.notes}
                    onChange={(e) =>
                      handleUpdateThrowField("notes", e.target.value)
                    }
                    placeholder="What happened during the making process?"
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Challenges</Label>
                  <Textarea
                    value={context.currentThrow.challenges}
                    onChange={(e) =>
                      handleUpdateThrowField("challenges", e.target.value)
                    }
                    placeholder="What was difficult?"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Next Steps</Label>
                  <Textarea
                    value={context.currentThrow.nextSteps}
                    onChange={(e) =>
                      handleUpdateThrowField("nextSteps", e.target.value)
                    }
                    placeholder="What's next for this piece?"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Process Tab */}
          <TabsContent value="process" className="p-4 space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium flex items-center space-x-2">
                <Workflow className="w-4 h-4" />
                <span>Pottery Process</span>
              </h3>

              <div className="grid grid-cols-2 gap-2">
                {potteryProcesses.map((process) => {
                  const isEnhanced = ["glazing", "firing", "trimming"].includes(
                    process.id
                  );
                  return (
                    <Button
                      key={process.id}
                      variant="outline"
                      className={`flex flex-col items-center p-3 h-auto relative ${
                        isEnhanced ? "border-yellow-200 bg-yellow-50" : ""
                      }`}
                      onClick={() => handleAddProcessNote(process.id)}
                    >
                      <process.icon
                        className="w-6 h-6 mb-1"
                        style={{ color: process.color }}
                      />
                      <span className="text-xs">{process.label}</span>
                      {isEnhanced && (
                        <Sparkles className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
                      )}
                    </Button>
                  );
                })}
              </div>

              <div className="text-xs text-muted-foreground">
                ✨ Enhanced tools available for glazing, firing, and trimming
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-medium flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Timeline</span>
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>
                    {new Date(context.currentThrow.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Updated:</span>
                  <span>
                    {new Date(context.currentThrow.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Date Made:</span>
                  <span>
                    {new Date(context.currentThrow.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {/* Header */}
      {renderToolbar()}

      {/* Whiteboard Tools */}
      {renderWhiteboardTools()}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          {renderCanvas()}
          {renderPageNavigation()}
        </div>

        {/* Sidebar */}
        {showSidebar && renderSidebar()}
      </div>

      {/* Enhanced Glazing Dialog */}
      <Dialog open={showGlazingDialog} onOpenChange={setShowGlazingDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Paintbrush className="w-5 h-5 text-green-600" />
              <span>Glazing Planner</span>
              <Badge variant="secondary" className="ml-2">
                Enhanced
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Select glazes from your studio's collection or add custom glazes
              for this piece.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <Label className="text-base font-medium">Studio Glazes</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Available at {context.currentStudio?.name}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {availableGlazes.map((glaze) => (
                  <div key={glaze} className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedGlazes.includes(glaze)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedGlazes([...selectedGlazes, glaze]);
                        } else {
                          setSelectedGlazes(
                            selectedGlazes.filter((g) => g !== glaze)
                          );
                        }
                      }}
                    />
                    <Label className="text-sm">{glaze}</Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-base font-medium">Custom Glaze</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Add a glaze not in the studio collection
              </p>
              <Input
                value={customGlaze}
                onChange={(e) => setCustomGlaze(e.target.value)}
                placeholder="e.g., Personal celadon mix"
              />
            </div>

            {(selectedGlazes.length > 0 || customGlaze.trim()) && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">
                  Glazing Plan Preview
                </h4>
                <div className="space-y-1">
                  {selectedGlazes.map((glaze) => (
                    <div
                      key={glaze}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <div className="w-2 h-2 rounded-full bg-green-600" />
                      <span>{glaze}</span>
                    </div>
                  ))}
                  {customGlaze.trim() && (
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-600" />
                      <span>{customGlaze}</span>
                      <Badge variant="outline" className="text-xs">
                        Custom
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowGlazingDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyGlazes}
              disabled={selectedGlazes.length === 0 && !customGlaze.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              <Paintbrush className="w-4 h-4 mr-2" />
              Apply Glazes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Firing Dialog */}
      <Dialog open={showFiringDialog} onOpenChange={setShowFiringDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-red-600" />
              <span>Firing Scheduler</span>
              <Badge variant="secondary" className="ml-2">
                Enhanced
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Schedule your piece for an upcoming firing or plan a custom
              firing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <Tabs defaultValue="scheduled" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="scheduled">Scheduled Firings</TabsTrigger>
                <TabsTrigger value="custom">Custom Firing</TabsTrigger>
              </TabsList>

              <TabsContent value="scheduled" className="space-y-4">
                <div>
                  <Label className="text-base font-medium">
                    Available Firings
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upcoming firing schedule at {context.currentStudio?.name}
                  </p>

                  {availableFirings.length > 0 ? (
                    <div className="space-y-2">
                      {availableFirings.map((firing) => (
                        <Card
                          key={firing.id}
                          className={`cursor-pointer transition-all ${
                            selectedFiring === firing.id
                              ? "ring-2 ring-orange-500 bg-orange-50"
                              : firing.available
                              ? "hover:bg-gray-50"
                              : "opacity-60"
                          }`}
                          onClick={() =>
                            firing.available && setSelectedFiring(firing.id)
                          }
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">
                                  {firing.type} Firing
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(firing.date).toLocaleDateString()} •{" "}
                                  {firing.temperature}
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge
                                  variant={
                                    firing.available ? "default" : "secondary"
                                  }
                                >
                                  {firing.available
                                    ? `${firing.spotsLeft} spots left`
                                    : "Full"}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Flame className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No scheduled firings available</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="custom" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>Firing Type</Label>
                    <Input
                      value={customFiring}
                      onChange={(e) => setCustomFiring(e.target.value)}
                      placeholder="e.g., Special bisque firing"
                    />
                  </div>

                  <div>
                    <Label>Temperature</Label>
                    <Select value={firingTemp} onValueChange={setFiringTemp}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {temperatures.map((temp) => (
                          <SelectItem key={temp} value={temp}>
                            {temp}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowFiringDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleScheduleFiring}
              disabled={!selectedFiring && !customFiring.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              <Flame className="w-4 h-4 mr-2" />
              Schedule Firing
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Trimming Dialog */}
      <Dialog open={showTrimmingDialog} onOpenChange={setShowTrimmingDialog}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Scissors className="w-5 h-5 text-blue-600" />
              <span>AI Trimming Assistant</span>
              <Badge
                variant="secondary"
                className="ml-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                AI Powered
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Get AI-powered trimming suggestions based on your pottery type and
              uploaded photos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {isGeneratingAI ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                <h3 className="font-medium">Analyzing your piece...</h3>
                <p className="text-sm text-muted-foreground">
                  AI is examining pottery type and proportions
                </p>
              </div>
            ) : (
              <>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">
                        Analysis Complete
                      </h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Based on your{" "}
                        {context.currentThrow?.potteryType?.toLowerCase() || "piece"}{" "}
                        and uploaded photos, here are the recommended trimming
                        approaches:
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">
                    AI Recommendations
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    {aiTrimmingSuggestions.map((pattern) => (
                      <Card
                        key={pattern.id}
                        className={`cursor-pointer transition-all ${
                          selectedTrimmingPattern === pattern.id
                            ? "ring-2 ring-blue-500 bg-blue-50"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedTrimmingPattern(pattern.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium">{pattern.name}</h4>
                            <div className="flex items-center space-x-1">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  pattern.confidence >= 90
                                    ? "bg-green-500"
                                    : pattern.confidence >= 80
                                    ? "bg-yellow-500"
                                    : "bg-orange-500"
                                }`}
                              />
                              <span className="text-xs text-muted-foreground">
                                {pattern.confidence}%
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {pattern.description}
                          </p>
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              {pattern.confidence >= 90
                                ? "Highly Recommended"
                                : pattern.confidence >= 80
                                ? "Recommended"
                                : "Consider"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {selectedTrimmingPattern && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-purple-800 mb-2">
                      Selected Pattern Preview
                    </h4>
                    <p className="text-sm text-purple-700">
                      The AI will add detailed trimming guidance to your
                      whiteboard, including:
                    </p>
                    <ul className="list-disc list-inside text-sm text-purple-700 mt-2 ml-2">
                      <li>Step-by-step trimming instructions</li>
                      <li>Recommended tool angles and positions</li>
                      <li>Wall thickness guidelines</li>
                      <li>Visual reference overlays</li>
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowTrimmingDialog(false)}
            >
              Cancel
            </Button>
            {!isGeneratingAI && (
              <Button
                onClick={() =>
                  handleApplyTrimmingPattern(selectedTrimmingPattern)
                }
                disabled={!selectedTrimmingPattern}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Apply AI Suggestion
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Throw</DialogTitle>
            <DialogDescription>
              Collaborate with other artists by sharing your pottery
              documentation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email Address</Label>
              <Input
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="artist@example.com"
                type="email"
              />
            </div>
            <div>
              <Label>Permission Level</Label>
              <Select
                value={sharePermission}
                onValueChange={(value: "view" | "comment" | "edit") =>
                  setSharePermission(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4" />
                      <div>
                        <p>View Only</p>
                        <p className="text-xs text-muted-foreground">
                          Can see the throw
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="comment">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4" />
                      <div>
                        <p>Comment</p>
                        <p className="text-xs text-muted-foreground">
                          Can view and leave comments
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="edit">
                    <div className="flex items-center space-x-2">
                      <Edit3 className="w-4 h-4" />
                      <div>
                        <p>Edit</p>
                        <p className="text-xs text-muted-foreground">
                          Can view, comment, and edit
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={canDuplicate}
                onCheckedChange={setCanDuplicate}
              />
              <Label>Allow duplication</Label>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                alert("Share functionality would be implemented here")
              }
              disabled={!shareEmail.trim()}
            >
              <Send className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export to PDF</DialogTitle>
            <DialogDescription>
              Export your pottery documentation as a PDF file.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm">
              <p>Your PDF will include:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>
                  All {context.currentThrow.whiteboardPages.length} page
                  {context.currentThrow.whiteboardPages.length !== 1 ? "s" : ""}
                </li>
                <li>Photos and annotations</li>
                <li>Sticky notes and text</li>
                <li>Process details and notes</li>
                <li>AI analysis and suggestions</li>
              </ul>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowExportDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => alert("PDF export would be implemented here")}
            >
              <FileDown className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
