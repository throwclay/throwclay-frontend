import { useState } from "react";
import {
  Flame,
  Calendar,
  Users,
  MessageCircle,
  CreditCard,
  Palette,
  BookOpen,
  ShoppingCart,
  Bot,
  Package,
  Clock,
  DollarSign,
  MapPin,
  Mail,
  Phone,
  Search,
  Filter,
  Plus,
  Send,
  Sparkles,
  ExternalLink,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Download,
  Receipt,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAppContext } from "@/app/context/AppContext";

export function MyStudios() {
  // const context = useAppContext();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedStudioId, setSelectedStudioId] = useState("studio1");
  const [isStudioInfoOpen, setIsStudioInfoOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: "user" | "bot"; message: string }>
  >([
    {
      role: "bot",
      message:
        "Hi! I'm the studio assistant. I can help you with studio policies, schedules, and answer questions. How can I help you today?",
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedKilnId, setSelectedKilnId] = useState<string | null>(null);
  const [selectedShelves, setSelectedShelves] = useState<string[]>([]);
  const [showShelfDialog, setShowShelfDialog] = useState(false);
  const [showBulkRequestDialog, setShowBulkRequestDialog] = useState(false);
  const [showAvailableClassesDialog, setShowAvailableClassesDialog] =
    useState(false);
  const [showLinkThrowsDialog, setShowLinkThrowsDialog] = useState(false);
  const [selectedThrows, setSelectedThrows] = useState<string[]>([]);
  const [currentShelfForLinking, setCurrentShelfForLinking] = useState<
    string | null
  >(null);
  const [shelfThrowLinks, setShelfThrowLinks] = useState<
    Record<string, string[]>
  >({
    "B-3": ["throw1", "throw2"],
    "A-5": ["throw3"],
    "C-2": ["throw4", "throw5", "throw6"],
  });

  // Mock data - multiple studios for the artist (including inactive membership)
  const myStudios = [
    {
      id: "studio1",
      name: "Clay Studio Downtown",
      handle: "claystudiodtx",
      address: "123 Main Street, Austin, TX 78701",
      phone: "(512) 555-0123",
      email: "info@claystudiodtx.com",
      membershipPlan: "Unlimited Studio Access",
      shelfNumber: "A-12",
      memberId: "M-2024-0423",
      memberSince: "2024-03-15",
      status: "Active",
    },
    {
      id: "studio2",
      name: "Westlake Pottery",
      handle: "westlakepottery",
      address: "456 Oak Ave, Austin, TX 78746",
      phone: "(512) 555-0456",
      email: "contact@westlakepottery.com",
      membershipPlan: "Weekend Access",
      shelfNumber: "C-8",
      memberId: "M-2024-0789",
      memberSince: "2024-01-20",
      status: "Active",
    },
    {
      id: "studio3",
      name: "North Austin Ceramics",
      handle: "northaustinceramics",
      address: "789 Cedar Ln, Austin, TX 78758",
      phone: "(512) 555-0789",
      email: "hello@northaustinceramics.com",
      membershipPlan: "Full Access Plan",
      shelfNumber: "B-15",
      memberId: "M-2023-0156",
      memberSince: "2023-06-01",
      membershipEnded: "2024-08-31",
      status: "Inactive",
    },
  ];

  const selectedStudio =
    myStudios.find((s) => s.id === selectedStudioId) || myStudios[0];
  const isActiveMember = selectedStudio.status === "Active";

  // Mock data - varies by studio
  const getMemberDetails = () => {
    if (selectedStudioId === "studio3") {
      return {
        memberId: selectedStudio.memberId,
        shelfNumber: selectedStudio.shelfNumber,
        membershipPlan: selectedStudio.membershipPlan,
        memberSince: selectedStudio.memberSince,
        membershipEnded: "2024-08-31",
        renewalDate: null,
        monthlyFee: "$165",
        nextPaymentDate: null,
        paymentMethod: null,
        status: "Inactive",
      };
    }
    return {
      memberId: selectedStudio.memberId,
      shelfNumber: selectedStudio.shelfNumber,
      membershipPlan: selectedStudio.membershipPlan,
      memberSince: selectedStudio.memberSince,
      renewalDate: "2025-03-15",
      monthlyFee: selectedStudioId === "studio1" ? "$189" : "$145",
      nextPaymentDate: "2024-12-01",
      paymentMethod: "Visa •••• 4242",
      status: "Active",
    };
  };

  const memberDetails = getMemberDetails();

  const getPaymentHistory = () => {
    if (selectedStudioId === "studio3") {
      // Inactive studio - past payments only
      return [
        {
          id: "1",
          date: "2024-08-01",
          type: "Membership Fee",
          description: "Monthly membership - August 2024",
          amount: "$165.00",
          status: "Paid",
          method: "Visa •••• 4242",
          receiptUrl: "#",
        },
        {
          id: "2",
          date: "2024-07-01",
          type: "Membership Fee",
          description: "Monthly membership - July 2024",
          amount: "$165.00",
          status: "Paid",
          method: "Visa •••• 4242",
          receiptUrl: "#",
        },
        {
          id: "3",
          date: "2024-06-15",
          type: "Class Enrollment",
          description: "Summer Pottery Workshop",
          amount: "$280.00",
          status: "Paid",
          method: "Visa •••• 4242",
          receiptUrl: "#",
        },
        {
          id: "4",
          date: "2024-06-01",
          type: "Membership Fee",
          description: "Monthly membership - June 2024",
          amount: "$165.00",
          status: "Paid",
          method: "Visa •••• 4242",
          receiptUrl: "#",
        },
        {
          id: "5",
          date: "2024-05-01",
          type: "Membership Fee",
          description: "Monthly membership - May 2024",
          amount: "$165.00",
          status: "Paid",
          method: "Visa •••• 4242",
          receiptUrl: "#",
        },
        {
          id: "6",
          date: "2024-04-20",
          type: "Studio Purchase",
          description: "Clay and supplies",
          amount: "$95.00",
          status: "Paid",
          method: "Visa •••• 4242",
          receiptUrl: "#",
        },
      ];
    }

    // Active studios
    return [
      {
        id: "1",
        date: "2024-11-01",
        type: "Membership Fee",
        description: "Monthly membership - November 2024",
        amount: memberDetails.monthlyFee,
        status: "Paid",
        method: "Visa •••• 4242",
        receiptUrl: "#",
      },
      {
        id: "2",
        date: "2024-10-15",
        type: "Class Enrollment",
        description: "Advanced Wheel Throwing - 8 sessions",
        amount: "$320.00",
        status: "Paid",
        method: "Visa •••• 4242",
        receiptUrl: "#",
      },
      {
        id: "3",
        date: "2024-10-01",
        type: "Membership Fee",
        description: "Monthly membership - October 2024",
        amount: memberDetails.monthlyFee,
        status: "Paid",
        method: "Visa •••• 4242",
        receiptUrl: "#",
      },
      {
        id: "4",
        date: "2024-09-20",
        type: "Studio Purchase",
        description: "Clay and Tools",
        amount: "$85.00",
        status: "Paid",
        method: "Visa •••• 4242",
        receiptUrl: "#",
      },
      {
        id: "5",
        date: "2024-09-01",
        type: "Membership Fee",
        description: "Monthly membership - September 2024",
        amount: memberDetails.monthlyFee,
        status: "Paid",
        method: "Visa •••• 4242",
        receiptUrl: "#",
      },
      {
        id: "6",
        date: "2024-08-15",
        type: "Studio Credit",
        description: "Referral bonus",
        amount: "-$50.00",
        status: "Applied",
        method: "Credit",
        receiptUrl: "#",
      },
      {
        id: "7",
        date: "2024-08-01",
        type: "Membership Fee",
        description: "Monthly membership - August 2024",
        amount: memberDetails.monthlyFee,
        status: "Paid",
        method: "Visa •••• 4242",
        receiptUrl: "#",
      },
    ];
  };

  const paymentHistory = getPaymentHistory();

  const availableShelves = [
    "A-1",
    "A-2",
    "A-3",
    "A-4",
    "A-5",
    "B-1",
    "B-2",
    "B-3",
    "B-4",
    "B-5",
    "C-1",
    "C-2",
    "C-3",
    "C-4",
    "C-5",
  ];

  // Journal throws/pottery pieces
  const journalThrows = [
    {
      id: "throw1",
      name: "Celadon Bowl",
      type: "Bowl",
      diameter: '8"',
      height: '3"',
      clay: "Porcelain",
      status: "Bisque Fired",
      created: "2024-11-01",
      glazed: false,
    },
    {
      id: "throw2",
      name: "Tall Vase",
      type: "Vase",
      diameter: '5"',
      height: '12"',
      clay: "Stoneware",
      status: "Bisque Fired",
      created: "2024-11-03",
      glazed: false,
    },
    {
      id: "throw3",
      name: "Tea Cup Set (4)",
      type: "Cup",
      diameter: '3"',
      height: '3.5"',
      clay: "Porcelain",
      status: "Glazed",
      created: "2024-10-28",
      glazed: true,
    },
    {
      id: "throw4",
      name: "Large Platter",
      type: "Plate",
      diameter: '14"',
      height: '2"',
      clay: "Stoneware",
      status: "Glazed",
      created: "2024-10-25",
      glazed: true,
    },
    {
      id: "throw5",
      name: "Mug",
      type: "Mug",
      diameter: '4"',
      height: '4"',
      clay: "Stoneware",
      status: "Glazed",
      created: "2024-10-30",
      glazed: true,
    },
    {
      id: "throw6",
      name: "Small Bowl",
      type: "Bowl",
      diameter: '6"',
      height: '2.5"',
      clay: "Porcelain",
      status: "Glazed",
      created: "2024-11-02",
      glazed: true,
    },
    {
      id: "throw7",
      name: "Yunomi Cup",
      type: "Cup",
      diameter: '3.5"',
      height: '4"',
      clay: "Stoneware",
      status: "Leather Hard",
      created: "2024-11-08",
      glazed: false,
    },
    {
      id: "throw8",
      name: "Serving Bowl",
      type: "Bowl",
      diameter: '10"',
      height: '4"',
      clay: "Stoneware",
      status: "Bisque Fired",
      created: "2024-11-05",
      glazed: false,
    },
  ];

  const kilnSchedule = [
    {
      id: "1",
      name: "Bisque Kiln 1",
      type: "Bisque",
      startDate: "2024-11-13",
      endDate: "2024-11-14",
      status: "scheduled",
      spotsAvailable: 3,
      yourShelves: [] as string[],
    },
    {
      id: "2",
      name: "Glaze Kiln 2",
      type: "Glaze",
      startDate: "2024-11-14",
      endDate: "2024-11-15",
      status: "loading",
      spotsAvailable: 1,
      yourShelves: ["B-3", "A-5"],
    },
    {
      id: "3",
      name: "Bisque Kiln 1",
      type: "Bisque",
      startDate: "2024-11-16",
      endDate: "2024-11-17",
      status: "scheduled",
      spotsAvailable: 5,
      yourShelves: [] as string[],
    },
    {
      id: "4",
      name: "Glaze Kiln 1",
      type: "Glaze",
      startDate: "2024-11-17",
      endDate: "2024-11-18",
      status: "scheduled",
      spotsAvailable: 4,
      yourShelves: ["C-2"],
    },
  ];

  const enrolledClasses = [
    {
      id: "1",
      name: "Advanced Wheel Throwing",
      instructor: "Sarah Johnson",
      nextSession: "2024-11-15 18:00",
      location: "Studio A",
      spotsLeft: 2,
      sessionsLeft: 6,
      price: "$320",
    },
    {
      id: "2",
      name: "Glazing Techniques",
      instructor: "Mike Chen",
      nextSession: "2024-11-16 14:00",
      location: "Studio B",
      spotsLeft: 4,
      sessionsLeft: 4,
      price: "$280",
    },
    {
      id: "3",
      name: "Hand Building Basics",
      instructor: "Emily Rodriguez",
      nextSession: "2024-11-18 10:00",
      location: "Studio A",
      spotsLeft: 1,
      sessionsLeft: 8,
      price: "$360",
    },
  ];

  const availableClasses = [
    {
      id: "4",
      name: "Sculptural Ceramics",
      instructor: "David Park",
      startDate: "2024-12-01",
      duration: "6 weeks",
      price: "$420",
      spotsLeft: 8,
      description: "Explore three-dimensional form and creative expression",
    },
    {
      id: "5",
      name: "Raku Firing Workshop",
      instructor: "Sarah Johnson",
      startDate: "2024-11-20",
      duration: "1 day",
      price: "$150",
      spotsLeft: 5,
      description: "Learn the exciting raku firing technique",
    },
    {
      id: "6",
      name: "Beginner Wheel Throwing",
      instructor: "Mike Chen",
      startDate: "2024-12-05",
      duration: "8 weeks",
      price: "$480",
      spotsLeft: 3,
      description: "Perfect for complete beginners",
    },
  ];

  const activeEmployees = [
    {
      id: "1",
      name: "Sarah Johnson",
      role: "Lead Instructor",
      status: "available",
      avatar: "SJ",
      location: "Studio A",
    },
    {
      id: "2",
      name: "Mike Chen",
      role: "Instructor",
      status: "in-class",
      avatar: "MC",
      location: "Studio B",
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      role: "Studio Manager",
      status: "available",
      avatar: "ER",
      location: "Front Desk",
    },
    {
      id: "4",
      name: "David Park",
      role: "Studio Assistant",
      status: "available",
      avatar: "DP",
      location: "Kiln Room",
    },
  ];

  const glazeRepository = [
    {
      id: "1",
      name: "Celadon Green",
      code: "CG-101",
      cone: "Cone 6",
      finish: "Glossy",
      color: "#7FB069",
      available: true,
      location: "Shelf B-3",
    },
    {
      id: "2",
      name: "Tenmoku",
      code: "TM-205",
      cone: "Cone 10",
      finish: "Glossy",
      color: "#3E2723",
      available: true,
      location: "Shelf A-5",
    },
    {
      id: "3",
      name: "Oribe Green",
      code: "OR-142",
      cone: "Cone 6",
      finish: "Glossy",
      color: "#2D5016",
      available: true,
      location: "Shelf B-1",
    },
    {
      id: "4",
      name: "Shino White",
      code: "SH-301",
      cone: "Cone 10",
      finish: "Matte",
      color: "#F5E6D3",
      available: false,
      location: "Shelf A-2",
    },
    {
      id: "5",
      name: "Iron Red",
      code: "IR-188",
      cone: "Cone 6",
      finish: "Glossy",
      color: "#8B4513",
      available: true,
      location: "Shelf C-4",
    },
    {
      id: "6",
      name: "Cobalt Blue",
      code: "CB-220",
      cone: "Cone 6",
      finish: "Glossy",
      color: "#0047AB",
      available: true,
      location: "Shelf B-5",
    },
  ];

  const studioBlogs = [
    {
      id: "1",
      title: "New Glazing Workshop Series",
      author: "Sarah Johnson",
      date: "2024-11-10",
      excerpt:
        "We're excited to announce our new advanced glazing workshop series starting next month...",
      image: true,
    },
    {
      id: "2",
      title: "Studio Closure Notice - Thanksgiving",
      author: "Emily Rodriguez",
      date: "2024-11-08",
      excerpt:
        "Please note that the studio will be closed November 28-29 for Thanksgiving...",
      image: false,
    },
    {
      id: "3",
      title: "Member Showcase: Fall Collection",
      author: "Mike Chen",
      date: "2024-11-05",
      excerpt:
        "Check out these amazing pieces from our members in our fall showcase...",
      image: true,
    },
  ];

  const studioProducts = [
    {
      id: "1",
      name: "Laguna B-Mix 5",
      category: "Clay",
      price: "$32.00",
      unit: "25 lbs",
      stock: "In Stock",
      image: true,
    },
    {
      id: "2",
      name: "Porcelain Clay",
      category: "Clay",
      price: "$28.00",
      unit: "25 lbs",
      stock: "Low Stock",
      image: true,
    },
    {
      id: "3",
      name: "Wire Clay Cutter Set",
      category: "Tools",
      price: "$15.00",
      unit: "set",
      stock: "In Stock",
      image: true,
    },
    {
      id: "4",
      name: "Sponge Set (6pc)",
      category: "Tools",
      price: "$12.00",
      unit: "set",
      stock: "In Stock",
      image: true,
    },
    {
      id: "5",
      name: "Rib Tool Set",
      category: "Tools",
      price: "$18.00",
      unit: "set",
      stock: "In Stock",
      image: true,
    },
    {
      id: "6",
      name: "Trimming Tool Set",
      category: "Tools",
      price: "$24.00",
      unit: "set",
      stock: "In Stock",
      image: true,
    },
  ];

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    setChatMessages([
      ...chatMessages,
      { role: "user", message: currentMessage },
    ]);

    setTimeout(() => {
      const responses = [
        "Our studio hours are Monday-Friday 9am-9pm, Saturday-Sunday 10am-6pm.",
        "You can reserve a kiln spot through the Kiln Schedule tab. Each member can reserve up to 2 shelves per firing.",
        "All pieces must be labeled with your shelf number and date. Unlabeled pieces will be moved to the lost & found after 7 days.",
        "Clay purchases can be made at the front desk or through the Studio Products tab. We offer bulk discounts for 100+ lbs.",
        "Open studio time is included with your membership. You can work anytime during studio hours when a class isn't in session.",
      ];
      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];
      setChatMessages((prev) => [
        ...prev,
        { role: "bot", message: randomResponse },
      ]);
    }, 1000);

    setCurrentMessage("");
  };

  const toggleShelf = (shelf: string) => {
    setSelectedShelves((prev) =>
      prev.includes(shelf) ? prev.filter((s) => s !== shelf) : [...prev, shelf]
    );
  };

  const handleViewStudioProfile = () => {
    alert(`Navigate to studio profile: @${selectedStudio.handle}`);
  };

  const handleMarkShelves = (kilnId: string) => {
    setSelectedKilnId(kilnId);
    setSelectedShelves([]);
    setShowShelfDialog(true);
  };

  const handleSubmitShelves = () => {
    alert(
      `Marked shelves ${selectedShelves.join(", ")} for kiln ${selectedKilnId}`
    );
    setShowShelfDialog(false);
    setSelectedShelves([]);
  };

  const handleDownloadReceipt = (paymentId: string) => {
    alert(`Downloading receipt for payment ${paymentId}`);
  };

  const handleDownloadAllReceipts = () => {
    alert("Downloading all receipts as ZIP file");
  };

  // const handleManageEnrollment = (classId: string) => {
  //   // Navigate to Classes page
  //   if (navigateToPage) {
  //     navigateToPage('artistClasses');
  //   }
  // };

  const handleReapplyMembership = () => {
    alert(`Redirecting to membership application for ${selectedStudio.name}`);
  };

  const handleLinkThrowsToShelf = (kilnId: string, shelf: string) => {
    setSelectedKilnId(kilnId);
    setCurrentShelfForLinking(shelf);
    setSelectedThrows(shelfThrowLinks[shelf] || []);
    setShowLinkThrowsDialog(true);
  };

  const toggleThrowSelection = (throwId: string) => {
    setSelectedThrows((prev) =>
      prev.includes(throwId)
        ? prev.filter((t) => t !== throwId)
        : [...prev, throwId]
    );
  };

  const handleSubmitThrowLinks = () => {
    if (currentShelfForLinking) {
      setShelfThrowLinks((prev) => ({
        ...prev,
        [currentShelfForLinking]: selectedThrows,
      }));
    }
    setShowLinkThrowsDialog(false);
    setSelectedThrows([]);
    setCurrentShelfForLinking(null);
  };

  const getKilnStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline">Scheduled</Badge>;
      case "loading":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Loading</Badge>;
      case "firing":
        return (
          <Badge className="bg-orange-500 hover:bg-orange-600">Firing</Badge>
        );
      case "cooling":
        return (
          <Badge className="bg-purple-500 hover:bg-purple-600">Cooling</Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getEmployeeStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Available</Badge>
        );
      case "in-class":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">In Class</Badge>
        );
      case "busy":
        return <Badge variant="secondary">Busy</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1>My Studios</h1>
        <p className="text-muted-foreground">
          Access your studio resources, schedules, and community
        </p>
      </div>

      {/* Collapsible Studio Selector & Info */}
      <Collapsible open={isStudioInfoOpen} onOpenChange={setIsStudioInfoOpen}>
        <Card
          className={`border-l-4 ${
            isActiveMember ? "border-l-primary" : "border-l-gray-400"
          }`}
        >
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Top row - Studio selector and collapse button */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  {myStudios.length > 1 && (
                    <>
                      <Label>Studio:</Label>
                      <Select
                        value={selectedStudioId}
                        onValueChange={setSelectedStudioId}
                      >
                        <SelectTrigger className="w-[280px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {myStudios.map((studio) => (
                            <SelectItem key={studio.id} value={studio.id}>
                              {studio.name}{" "}
                              {studio.status === "Inactive" && "(Past Member)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  )}
                  {myStudios.length === 1 && (
                    <div>
                      <p className="font-semibold">{selectedStudio.name}</p>
                      <p className="text-sm text-muted-foreground">
                        @{selectedStudio.handle}
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2 ml-auto">
                    <Badge
                      className={
                        isActiveMember ? "bg-green-500" : "bg-gray-500"
                      }
                    >
                      {memberDetails.status}
                    </Badge>
                    {isActiveMember && (
                      <Badge variant="outline">
                        Shelf: {selectedStudio.shelfNumber}
                      </Badge>
                    )}
                  </div>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {isStudioInfoOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>

              {/* Collapsible content */}
              <CollapsibleContent>
                <div className="space-y-4 border-t pt-4">
                  {!isActiveMember && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        You are no longer an active member at this studio. Your
                        membership ended on {memberDetails.membershipEnded}. You
                        can view your payment history and reapply for
                        membership.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <Button
                      variant="link"
                      className="h-auto p-0"
                      onClick={handleViewStudioProfile}
                    >
                      View Studio Profile
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </Button>
                  </div>

                  {/* Contact Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Button
                      variant="ghost"
                      className="justify-start h-auto p-2 text-left"
                      onClick={() =>
                        window.open(
                          `https://maps.google.com/?q=${encodeURIComponent(
                            selectedStudio.address
                          )}`,
                          "_blank"
                        )
                      }
                    >
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{selectedStudio.address}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start h-auto p-2"
                      onClick={() =>
                        (window.location.href = `tel:${selectedStudio.phone}`)
                      }
                    >
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{selectedStudio.phone}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start h-auto p-2"
                      onClick={() =>
                        (window.location.href = `mailto:${selectedStudio.email}`)
                      }
                    >
                      <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{selectedStudio.email}</span>
                    </Button>
                  </div>

                  {/* Membership Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Member ID</p>
                      <p className="font-semibold text-sm">
                        {selectedStudio.memberId}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Plan</p>
                      <p className="font-semibold text-sm">
                        {selectedStudio.membershipPlan}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Member Since
                      </p>
                      <p className="font-semibold text-sm">
                        {new Date(
                          selectedStudio.memberSince
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {isActiveMember ? "Next Payment" : "Membership Ended"}
                      </p>
                      <p className="font-semibold text-sm">
                        {isActiveMember
                          ? `${memberDetails.monthlyFee} on ${new Date(
                              memberDetails.nextPaymentDate!
                            ).toLocaleDateString()}`
                          : new Date(
                              memberDetails.membershipEnded!
                            ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </CardContent>
        </Card>
      </Collapsible>

      {/* Main Tabs - Only show Membership tab for inactive members */}
      {!isActiveMember ? (
        <Card>
          <CardHeader>
            <CardTitle>Membership Details</CardTitle>
            <CardDescription>
              Your past membership information and payment history
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your membership at {selectedStudio.name} ended on{" "}
                {new Date(memberDetails.membershipEnded!).toLocaleDateString()}.
                You can view your payment history below and reapply for
                membership if you'd like to rejoin.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Member ID</Label>
                <p className="font-semibold">{memberDetails.memberId}</p>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div>
                  <Badge className="bg-gray-500">{memberDetails.status}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Membership Plan</Label>
                <p className="font-semibold">{memberDetails.membershipPlan}</p>
              </div>
              <div className="space-y-2">
                <Label>Your Shelf (Past)</Label>
                <p className="font-semibold">{memberDetails.shelfNumber}</p>
              </div>
              <div className="space-y-2">
                <Label>Member Since</Label>
                <p>
                  {new Date(memberDetails.memberSince).toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric", year: "numeric" }
                  )}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Membership Ended</Label>
                <p>
                  {new Date(memberDetails.membershipEnded!).toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric", year: "numeric" }
                  )}
                </p>
              </div>
            </div>

            {/* Payment History */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4>Payment History</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadAllReceipts}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download All Receipts
                </Button>
              </div>
              <div className="space-y-2">
                {paymentHistory.map((payment) => (
                  <Card key={payment.id}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Receipt className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm">
                                {payment.type}
                              </p>
                              <Badge
                                variant={
                                  payment.status === "Paid"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {payment.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {payment.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(payment.date).toLocaleDateString()} •{" "}
                              {payment.method}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{payment.amount}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-4"
                          onClick={() => handleDownloadReceipt(payment.id)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Reapply Button */}
            <div className="border-t pt-6">
              <Button onClick={handleReapplyMembership} className="w-full">
                <Users className="w-4 h-4 mr-2" />
                Reapply for Membership at {selectedStudio.name}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="kiln">
              <Flame className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Kiln</span>
            </TabsTrigger>
            <TabsTrigger value="classes">
              <Calendar className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Classes</span>
            </TabsTrigger>
            <TabsTrigger value="membership">
              <CreditCard className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Membership</span>
            </TabsTrigger>
            <TabsTrigger value="glazes">
              <Palette className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Glazes</span>
            </TabsTrigger>
            <TabsTrigger value="blog">
              <BookOpen className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Blog</span>
            </TabsTrigger>
            <TabsTrigger value="shop">
              <ShoppingCart className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Shop</span>
            </TabsTrigger>
            <TabsTrigger value="staff">
              <Users className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Staff</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column - Status Cards */}
              <div className="lg:col-span-2 space-y-4">
                {/* Kiln Schedule */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <CardTitle className="text-base">
                          Kiln Schedule
                        </CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("kiln")}
                      >
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    {kilnSchedule
                      .filter((k) => k.yourShelves.length > 0)
                      .slice(0, 1)
                      .map((kiln) => (
                        <div
                          key={kiln.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-sm">
                                {kiln.name}
                              </p>
                              {getKilnStatusBadge(kiln.status)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(kiln.startDate).toLocaleDateString()} •
                              Shelves: {kiln.yourShelves.join(", ")}
                            </p>
                          </div>
                        </div>
                      ))}
                    {kilnSchedule.filter((k) => k.yourShelves.length > 0)
                      .length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No upcoming firings scheduled
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* My Classes */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <CardTitle className="text-base">My Classes</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("classes")}
                      >
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    {enrolledClasses.slice(0, 1).map((classItem) => (
                      <div key={classItem.id} className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">
                              {classItem.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Next:{" "}
                              {new Date(classItem.nextSession).toLocaleString(
                                "en-US",
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {classItem.sessionsLeft} left
                          </Badge>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-xs font-medium">Assignment:</p>
                          <p className="text-xs text-muted-foreground">
                            Practice centering - 3 bowls with consistent wall
                            thickness
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Staff */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-500" />
                        <CardTitle className="text-base">Staff</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("staff")}
                      >
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    {activeEmployees
                      .filter((e) => e.status === "available")
                      .slice(0, 1)
                      .map((employee) => {
                        const getStatusColor = (status: string) => {
                          if (status === "available") return "bg-green-500";
                          if (status === "in-class" || status === "busy")
                            return "bg-yellow-500";
                          return "bg-red-500";
                        };

                        const getStatusText = (status: string) => {
                          if (status === "available")
                            return "Available: Mon-Fri 2pm-8pm";
                          if (status === "in-class" || status === "busy")
                            return "Away from desk - delayed response";
                          return "On break - back in 20 mins";
                        };

                        return (
                          <div
                            key={employee.id}
                            className="flex items-center justify-between"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-2 h-2 rounded-full ${getStatusColor(
                                    employee.status
                                  )}`}
                                />
                                <p className="font-semibold text-sm">
                                  {employee.name}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground ml-4">
                                {getStatusText(employee.status)}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm">
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Studio Assistant */}
              <div className="lg:col-span-1">
                <Card className="sticky top-6">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Bot className="w-5 h-5" />
                      <CardTitle>Studio Assistant</CardTitle>
                    </div>
                    <CardDescription>
                      Ask questions about studio policies and resources
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4 mb-4">
                      <div className="space-y-4">
                        {chatMessages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex ${
                              msg.role === "user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                msg.role === "user"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm">{msg.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ask a question..."
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
                      />
                      <Button onClick={handleSendMessage}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Kiln Tab */}
          <TabsContent value="kiln" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Kiln Firing Schedule</CardTitle>
                    <CardDescription>
                      Mark shelves where you've placed your pieces or request
                      bulk space
                    </CardDescription>
                  </div>
                  <Dialog
                    open={showBulkRequestDialog}
                    onOpenChange={setShowBulkRequestDialog}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Request Bulk Space
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Request Bulk Kiln Space</DialogTitle>
                        <DialogDescription>
                          For large quantities or special firing needs, submit a
                          request to the studio
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Select Kiln & Firing</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a kiln firing..." />
                            </SelectTrigger>
                            <SelectContent>
                              {kilnSchedule.map((kiln) => (
                                <SelectItem key={kiln.id} value={kiln.id}>
                                  {kiln.name} - {kiln.type} (
                                  {new Date(
                                    kiln.startDate
                                  ).toLocaleDateString()}
                                  )
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Number of Shelves Needed</Label>
                          <Input type="number" placeholder="e.g., 5" min="1" />
                        </div>
                        <div className="space-y-2">
                          <Label>Description of Pieces</Label>
                          <Textarea
                            placeholder="Describe what you're firing..."
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Special Instructions (Optional)</Label>
                          <Textarea
                            placeholder="Any special firing requirements..."
                            rows={2}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setShowBulkRequestDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => {
                              alert("Bulk space request submitted!");
                              setShowBulkRequestDialog(false);
                            }}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Submit Request
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {kilnSchedule.map((kiln) => (
                    <Card key={kiln.id}>
                      <CardContent className="pt-6">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Flame className="w-6 h-6 text-orange-500" />
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4>{kiln.name}</h4>
                                {getKilnStatusBadge(kiln.status)}
                                <Badge variant="outline">{kiln.type}</Badge>
                              </div>
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {new Date(
                                    kiln.startDate
                                  ).toLocaleDateString()}{" "}
                                  -{" "}
                                  {new Date(kiln.endDate).toLocaleDateString()}
                                </span>
                                <span>
                                  Available Spots: {kiln.spotsAvailable}
                                </span>
                              </div>
                              {kiln.yourShelves.length > 0 && (
                                <div className="space-y-2 pt-2">
                                  <span className="text-sm font-medium text-primary">
                                    Your Shelves:
                                  </span>
                                  <div className="flex flex-col gap-2">
                                    {kiln.yourShelves.map((shelf) => {
                                      const linkedThrows =
                                        shelfThrowLinks[shelf] || [];
                                      const throwDetails = linkedThrows
                                        .map((throwId) =>
                                          journalThrows.find(
                                            (t) => t.id === throwId
                                          )
                                        )
                                        .filter(Boolean);

                                      return (
                                        <div
                                          key={shelf}
                                          className="flex items-start gap-2 p-2 bg-muted rounded-md"
                                        >
                                          <Badge
                                            variant="secondary"
                                            className="mt-1"
                                          >
                                            {shelf}
                                          </Badge>
                                          <div className="flex-1">
                                            {throwDetails.length > 0 ? (
                                              <div className="space-y-1">
                                                {throwDetails.map(
                                                  (throwItem) =>
                                                    throwItem && (
                                                      <div
                                                        key={throwItem.id}
                                                        className="text-xs text-muted-foreground"
                                                      >
                                                        • {throwItem.name} (
                                                        {throwItem.type})
                                                      </div>
                                                    )
                                                )}
                                              </div>
                                            ) : (
                                              <div className="text-xs text-muted-foreground">
                                                No pieces linked
                                              </div>
                                            )}
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              handleLinkThrowsToShelf(
                                                kiln.id,
                                                shelf
                                              )
                                            }
                                            disabled={
                                              kiln.status === "firing" ||
                                              kiln.status === "cooling"
                                            }
                                          >
                                            <Package className="w-3 h-3 mr-1" />
                                            Link
                                          </Button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant={
                                kiln.yourShelves.length > 0
                                  ? "outline"
                                  : "default"
                              }
                              onClick={() => handleMarkShelves(kiln.id)}
                              disabled={
                                kiln.status === "firing" ||
                                kiln.status === "cooling"
                              }
                            >
                              {kiln.yourShelves.length > 0
                                ? "Update Shelves"
                                : "Mark Shelves"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Dialog open={showShelfDialog} onOpenChange={setShowShelfDialog}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Mark Your Shelves</DialogTitle>
                  <DialogDescription>
                    Select the shelf numbers where you've placed your pieces for
                    this firing
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-5 gap-2">
                    {availableShelves.map((shelf) => (
                      <Button
                        key={shelf}
                        variant={
                          selectedShelves.includes(shelf)
                            ? "default"
                            : "outline"
                        }
                        className="relative"
                        onClick={() => toggleShelf(shelf)}
                      >
                        {shelf}
                        {selectedShelves.includes(shelf) && (
                          <Check className="w-4 h-4 absolute top-1 right-1" />
                        )}
                      </Button>
                    ))}
                  </div>
                  {selectedShelves.length > 0 && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-2">
                        Selected Shelves:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedShelves.map((shelf) => (
                          <Badge
                            key={shelf}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {shelf}
                            <X
                              className="w-3 h-3 cursor-pointer"
                              onClick={() => toggleShelf(shelf)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowShelfDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitShelves}
                      disabled={selectedShelves.length === 0}
                    >
                      Confirm Shelves ({selectedShelves.length})
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Link Throws to Shelf Dialog */}
            <Dialog
              open={showLinkThrowsDialog}
              onOpenChange={setShowLinkThrowsDialog}
            >
              <DialogContent className="max-w-3xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>
                    Link Pottery Pieces to Shelf {currentShelfForLinking}
                  </DialogTitle>
                  <DialogDescription>
                    Select the pottery pieces from your journal that are on this
                    shelf
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[50vh]">
                  <div className="space-y-2 pr-4">
                    {journalThrows.map((throwItem) => {
                      const isSelected = selectedThrows.includes(throwItem.id);
                      return (
                        <div
                          key={throwItem.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => toggleThrowSelection(throwItem.id)}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() =>
                                toggleThrowSelection(throwItem.id)
                              }
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-sm font-semibold">
                                  {throwItem.name}
                                </h4>
                                <Badge
                                  variant={
                                    throwItem.glazed ? "default" : "outline"
                                  }
                                >
                                  {throwItem.status}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                <span>Type: {throwItem.type}</span>
                                <span>Clay: {throwItem.clay}</span>
                                <span>
                                  Size: {throwItem.diameter} ×{" "}
                                  {throwItem.height}
                                </span>
                                <span>
                                  Created:{" "}
                                  {new Date(
                                    throwItem.created
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
                {selectedThrows.length > 0 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">
                      Selected Pieces: {selectedThrows.length}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedThrows.map((throwId) => {
                        const throwItem = journalThrows.find(
                          (t) => t.id === throwId
                        );
                        return (
                          throwItem && (
                            <Badge
                              key={throwId}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {throwItem.name}
                              <X
                                className="w-3 h-3 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleThrowSelection(throwId);
                                }}
                              />
                            </Badge>
                          )
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowLinkThrowsDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitThrowLinks}>
                    <Check className="w-4 h-4 mr-2" />
                    Save Links ({selectedThrows.length} pieces)
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Classes Tab */}
          <TabsContent value="classes" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Classes</CardTitle>
                    <CardDescription>
                      Classes you're currently enrolled in
                    </CardDescription>
                  </div>
                  <Dialog
                    open={showAvailableClassesDialog}
                    onOpenChange={setShowAvailableClassesDialog}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Search className="w-4 h-4 mr-2" />
                        Browse Classes
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          Available Classes at {selectedStudio.name}
                        </DialogTitle>
                        <DialogDescription>
                          Explore and enroll in upcoming classes
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {availableClasses.map((classItem) => (
                          <Card key={classItem.id}>
                            <CardContent className="pt-6">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4>{classItem.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      Instructor: {classItem.instructor}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {classItem.description}
                                    </p>
                                  </div>
                                  <Badge variant="secondary">
                                    {classItem.spotsLeft} spots left
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Starts:{" "}
                                    {new Date(
                                      classItem.startDate
                                    ).toLocaleDateString()}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {classItem.duration}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="w-4 h-4" />
                                    {classItem.price}
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm">Enroll Now</Button>
                                  <Button size="sm" variant="outline">
                                    Learn More
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            handleViewStudioProfile();
                            setShowAvailableClassesDialog(false);
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View All Classes on Studio Profile
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {enrolledClasses.map((classItem) => (
                    <Card key={classItem.id}>
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Calendar className="w-6 h-6 text-primary" />
                            </div>
                            <div className="space-y-2">
                              <div>
                                <h4>{classItem.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Instructor: {classItem.instructor}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-4 text-sm">
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <Clock className="w-4 h-4" />
                                  Next:{" "}
                                  {new Date(
                                    classItem.nextSession
                                  ).toLocaleString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })}
                                </span>
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <MapPin className="w-4 h-4" />
                                  {classItem.location}
                                </span>
                                <Badge variant="outline">
                                  {classItem.sessionsLeft} sessions remaining
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button variant="outline" size="sm">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Message Instructor
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleManageEnrollment(classItem.id)
                              }
                            >
                              Manage Enrollment
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Membership Tab */}
          <TabsContent value="membership" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Membership Details</CardTitle>
                <CardDescription>
                  Your current membership plan and payment information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Member ID</Label>
                    <p className="font-semibold">{memberDetails.memberId}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <div>
                      <Badge className="bg-green-500">
                        {memberDetails.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Membership Plan</Label>
                    <p className="font-semibold">
                      {memberDetails.membershipPlan}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Your Shelf</Label>
                    <p className="font-semibold">{memberDetails.shelfNumber}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Member Since</Label>
                    <p>
                      {new Date(memberDetails.memberSince).toLocaleDateString(
                        "en-US",
                        { month: "long", day: "numeric", year: "numeric" }
                      )}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Renewal Date</Label>
                    <p>
                      {new Date(memberDetails.renewalDate!).toLocaleDateString(
                        "en-US",
                        { month: "long", day: "numeric", year: "numeric" }
                      )}
                    </p>
                  </div>
                </div>
                <div className="border-t pt-6">
                  <h4 className="mb-4">Payment Information</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Monthly Fee</Label>
                      <p className="font-semibold">
                        {memberDetails.monthlyFee}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Next Payment Date</Label>
                      <p>
                        {new Date(
                          memberDetails.nextPaymentDate!
                        ).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <p>{memberDetails.paymentMethod}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Update Payment Method</Button>
                  <Button variant="outline">Change Plan</Button>
                </div>

                {/* Payment History */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4>Payment History</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadAllReceipts}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download All Receipts
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {paymentHistory.map((payment) => (
                      <Card key={payment.id}>
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Receipt className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-sm">
                                    {payment.type}
                                  </p>
                                  <Badge
                                    variant={
                                      payment.status === "Paid"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {payment.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {payment.description}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(payment.date).toLocaleDateString()}{" "}
                                  • {payment.method}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">
                                  {payment.amount}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-4"
                              onClick={() => handleDownloadReceipt(payment.id)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Glazes Tab */}
          <TabsContent value="glazes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Glaze Repository</CardTitle>
                <CardDescription>
                  Browse available glazes at the studio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {glazeRepository.map((glaze) => (
                    <Card key={glaze.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div
                            className="w-12 h-12 rounded-lg flex-shrink-0 border"
                            style={{ backgroundColor: glaze.color }}
                          />
                          <div className="flex-1 space-y-1">
                            <h4 className="text-sm">{glaze.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {glaze.code}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="text-xs">
                                {glaze.cone}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {glaze.finish}
                              </Badge>
                              <Badge
                                className={
                                  glaze.available
                                    ? "bg-green-500 text-xs"
                                    : "bg-gray-500 text-xs"
                                }
                              >
                                {glaze.available ? "Available" : "Out of Stock"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Location: {glaze.location}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blog Tab */}
          <TabsContent value="blog" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Studio Blog & Announcements</CardTitle>
                <CardDescription>
                  Stay updated with studio news and events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studioBlogs.map((blog) => (
                    <Card key={blog.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <h4>{blog.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              By {blog.author} •{" "}
                              {new Date(blog.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm">{blog.excerpt}</p>
                            <Button variant="link" className="h-auto p-0">
                              Read more →
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shop Tab */}
          <TabsContent value="shop" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Studio Products</CardTitle>
                <CardDescription>
                  Purchase clay, tools, and supplies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {studioProducts.map((product) => (
                    <Card key={product.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                            <Package className="w-12 h-12 text-muted-foreground" />
                          </div>
                          <div>
                            <h4 className="text-sm">{product.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {product.category}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{product.price}</p>
                              <p className="text-xs text-muted-foreground">
                                {product.unit}
                              </p>
                            </div>
                            <Badge
                              variant={
                                product.stock === "In Stock"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {product.stock}
                            </Badge>
                          </div>
                          <Button className="w-full" size="sm">
                            Add to Cart
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Studio Staff</CardTitle>
                <CardDescription>
                  Connect with instructors and staff members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeEmployees.map((employee) => (
                    <Card key={employee.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12 flex items-center justify-center bg-primary/10">
                              <span className="font-semibold text-primary">
                                {employee.avatar}
                              </span>
                            </Avatar>
                            <div>
                              <h4>{employee.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {employee.role}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {getEmployeeStatusBadge(employee.status)}
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {employee.location}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Studio Assistant also in Staff Tab */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  <CardTitle>Studio Assistant</CardTitle>
                </div>
                <CardDescription>
                  Ask questions about studio policies and resources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4 mb-4">
                  <div className="space-y-4">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask a question..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
