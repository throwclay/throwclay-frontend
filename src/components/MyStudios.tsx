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
  Minus,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar } from "./ui/avatar";
import { Checkbox } from "./ui/checkbox";
import { useAppContext } from "@/app/context/AppContext";

export function MyStudios() {
  const { currentUser, currentStudio } = useAppContext();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedStudioId, setSelectedStudioId] = useState("studio1");
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

  // Cart state
  const [cart, setCart] = useState<
    Array<{ productId: string; quantity: number }>
  >([]);
  const [showCartDialog, setShowCartDialog] = useState(false);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);

  // Glaze reporting state
  const [showGlazeReportDialog, setShowGlazeReportDialog] = useState(false);
  const [selectedGlazeForReport, setSelectedGlazeForReport] = useState<
    string | null
  >(null);
  const [glazeReportIssue, setGlazeReportIssue] = useState("");
  const [glazeReportMessage, setGlazeReportMessage] = useState("");

  // Mock data - multiple studios for the artist
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
    },
  ];

  const selectedStudio =
    myStudios.find((s) => s.id === selectedStudioId) || myStudios[0];

  // Mock data - in real app this would come from your backend
  const memberDetails = {
    memberId: selectedStudio.memberId,
    shelfNumber: selectedStudio.shelfNumber,
    membershipPlan: selectedStudio.membershipPlan,
    memberSince: selectedStudio.memberSince,
    renewalDate: "2025-03-15",
    monthlyFee: "$189",
    nextPaymentDate: "2024-12-01",
    paymentMethod: "Visa •••• 4242",
    status: "Active",
  };

  // Available shelves for kiln loading
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

  const kilnSchedule = [
    {
      id: "1",
      name: "Bisque Kiln 1",
      type: "Bisque",
      startDate: "2024-11-13",
      endDate: "2024-11-14",
      status: "scheduled",
      spotsAvailable: 3,
      yourPieces: 0,
    },
    {
      id: "2",
      name: "Glaze Kiln 2",
      type: "Glaze",
      startDate: "2024-11-14",
      endDate: "2024-11-15",
      status: "loading",
      spotsAvailable: 1,
      yourPieces: 2,
    },
    {
      id: "3",
      name: "Bisque Kiln 1",
      type: "Bisque",
      startDate: "2024-11-16",
      endDate: "2024-11-17",
      status: "scheduled",
      spotsAvailable: 5,
      yourPieces: 0,
    },
    {
      id: "4",
      name: "Glaze Kiln 1",
      type: "Glaze",
      startDate: "2024-11-17",
      endDate: "2024-11-18",
      status: "scheduled",
      spotsAvailable: 4,
      yourPieces: 1,
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
    },
    {
      id: "2",
      name: "Glazing Techniques",
      instructor: "Mike Chen",
      nextSession: "2024-11-16 14:00",
      location: "Studio B",
      spotsLeft: 4,
      sessionsLeft: 4,
    },
    {
      id: "3",
      name: "Hand Building Basics",
      instructor: "Emily Rodriguez",
      nextSession: "2024-11-18 10:00",
      location: "Studio A",
      spotsLeft: 1,
      sessionsLeft: 8,
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

    // Simulate AI response
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

  // Cart functions
  const addToCart = (productId: string) => {
    const existingItem = cart.find((item) => item.productId === productId);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { productId, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(
        cart.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const product = studioProducts.find((p) => p.id === item.productId);
      if (product) {
        const price = parseFloat(product.price.replace("$", ""));
        return total + price * item.quantity;
      }
      return total;
    }, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    // In a real app, this would process payment
    alert(
      `Order placed! Total: $${getCartTotal().toFixed(
        2
      )}\n\nItems will be available for pickup at the studio front desk.`
    );
    setCart([]);
    setShowCheckoutDialog(false);
  };

  // Glaze report handler
  const handleSubmitGlazeReport = () => {
    if (!glazeReportIssue || !glazeReportMessage.trim()) {
      alert("Please select an issue type and provide a description.");
      return;
    }

    const glaze = glazeRepository.find((g) => g.id === selectedGlazeForReport);

    // In a real app, this would send the report to the backend
    // The studio would receive a notification and the report would be stored
    alert(
      `Report submitted for ${glaze?.name}!\n\nIssue: ${glazeReportIssue}\nMessage: ${glazeReportMessage}\n\nThe studio will be notified and will review your feedback.`
    );

    // Reset form
    setShowGlazeReportDialog(false);
    setSelectedGlazeForReport(null);
    setGlazeReportIssue("");
    setGlazeReportMessage("");
  };

  return (
    // <div className="space-y-6 pb-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1>My Studios</h1>
          <p className="text-muted-foreground">
            Access your studio resources, schedules, and community
          </p>
        </div>

        {/* Studio Selector - if multiple studios */}
        {myStudios.length > 1 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Label>Select Studio:</Label>
                <Select
                  value={selectedStudioId}
                  onValueChange={setSelectedStudioId}
                >
                  <SelectTrigger className="w-[300px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {myStudios.map((studio) => (
                      <SelectItem key={studio.id} value={studio.id}>
                        {studio.name} - @{studio.handle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Studio Quick Info */}
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Studio Name and Handle - Clickable */}
              <div>
                <Button
                  variant="link"
                  className="h-auto p-0 text-2xl font-semibold"
                  onClick={() => {
                    // Navigate to studio profile - in real app this would use router
                    alert(
                      `Navigate to studio profile: @${selectedStudio.handle}`
                    );
                  }}
                >
                  {selectedStudio.name}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-sm text-muted-foreground">
                  <Button
                    variant="link"
                    className="h-auto p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      alert(
                        `Navigate to studio profile: @${selectedStudio.handle}`
                      );
                    }}
                  >
                    @{selectedStudio.handle}
                  </Button>
                </p>
              </div>

              {/* Studio Contact Information - Clickable */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
                <Button
                  variant="ghost"
                  className="justify-start h-auto p-2"
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
                  <span className="text-sm text-left">
                    {selectedStudio.address}
                  </span>
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

              {/* Membership Summary */}
              <div className="flex flex-wrap gap-4 pt-2 border-t">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Your Shelf</p>
                  <p className="font-semibold">{selectedStudio.shelfNumber}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Membership</p>
                  <Badge>{memberDetails.status}</Badge>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="font-semibold text-sm">
                    {selectedStudio.membershipPlan}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="kiln">
            <Flame className="w-4 h-4 mr-2" />
            Kiln
          </TabsTrigger>
          <TabsTrigger value="classes">
            <Calendar className="w-4 h-4 mr-2" />
            Classes
          </TabsTrigger>
          <TabsTrigger value="membership">
            <CreditCard className="w-4 h-4 mr-2" />
            Membership
          </TabsTrigger>
          <TabsTrigger value="glazes">
            <Palette className="w-4 h-4 mr-2" />
            Glazes
          </TabsTrigger>
          <TabsTrigger value="blog">
            <BookOpen className="w-4 h-4 mr-2" />
            Blog
          </TabsTrigger>
          <TabsTrigger value="shop">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Shop
          </TabsTrigger>
          <TabsTrigger value="staff">
            <Users className="w-4 h-4 mr-2" />
            Staff
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Quick Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-2">
                      <Flame className="w-4 h-4" />
                      Kiln Pieces
                    </CardDescription>
                    <CardTitle className="text-3xl">3</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Classes
                    </CardDescription>
                    <CardTitle className="text-3xl">
                      {enrolledClasses.length}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Glazes
                    </CardDescription>
                    <CardTitle className="text-3xl">
                      {glazeRepository.filter((g) => g.available).length}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Shelf No.
                    </CardDescription>
                    <CardTitle className="text-3xl">
                      {memberDetails.shelfNumber}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {/* Upcoming Classes */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Classes</CardTitle>
                  <CardDescription>Your next scheduled classes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {enrolledClasses.slice(0, 2).map((classItem) => (
                    <div
                      key={classItem.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{classItem.name}</p>
                          <p className="text-sm text-muted-foreground">
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
                      </div>
                      <Badge variant="outline">
                        {classItem.sessionsLeft} sessions left
                      </Badge>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setActiveTab("classes")}
                  >
                    View All Classes
                  </Button>
                </CardContent>
              </Card>

              {/* Kiln Schedule Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Kiln Firings</CardTitle>
                  <CardDescription>Your pieces in the queue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {kilnSchedule
                    .filter((k) => k.yourPieces > 0)
                    .map((kiln) => (
                      <div
                        key={kiln.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                            <Flame className="w-5 h-5 text-orange-500" />
                          </div>
                          <div>
                            <p className="font-medium">{kiln.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(kiln.startDate).toLocaleDateString()} -{" "}
                              {kiln.type}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge>{kiln.yourPieces} pieces</Badge>
                          {getKilnStatusBadge(kiln.status)}
                        </div>
                      </div>
                    ))}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setActiveTab("kiln")}
                  >
                    View Full Schedule
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - AI Bot */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>Studio Assistant</CardTitle>
                      <CardDescription>AI-powered help</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ScrollArea className="h-[300px] pr-4">
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
                            className={`max-w-[85%] p-3 rounded-lg ${
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
                      placeholder="Ask about studio policies..."
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                    />
                    <Button size="icon" onClick={handleSendMessage}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentMessage("What are the studio hours?");
                        setTimeout(handleSendMessage, 100);
                      }}
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      Studio hours
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentMessage("How do I reserve kiln space?");
                        setTimeout(handleSendMessage, 100);
                      }}
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      Kiln reservations
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Kiln Schedule Tab */}
        <TabsContent value="kiln" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Kiln Firing Schedule</CardTitle>
                  <CardDescription>
                    View upcoming firings and reserve space for your pieces
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Reserve Space
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {kilnSchedule.map((kiln) => (
                  <Card key={kiln.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                            <Flame className="w-6 h-6 text-orange-500" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
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
                                - {new Date(kiln.endDate).toLocaleDateString()}
                              </span>
                              <span>
                                Available Spots: {kiln.spotsAvailable}
                              </span>
                              {kiln.yourPieces > 0 && (
                                <span className="text-primary font-medium">
                                  Your Pieces: {kiln.yourPieces}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {kiln.yourPieces > 0 ? (
                            <Button variant="outline">Manage Pieces</Button>
                          ) : (
                            <Button disabled={kiln.spotsAvailable === 0}>
                              Reserve Spot
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
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
                <Button variant="outline">Browse Classes</Button>
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
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message Instructor
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Membership Details</CardTitle>
                  <CardDescription>
                    Your current membership information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-muted-foreground">Member ID</Label>
                      <p className="font-medium">{memberDetails.memberId}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Shelf Number
                      </Label>
                      <p className="font-medium">{memberDetails.shelfNumber}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Membership Plan
                      </Label>
                      <p className="font-medium">
                        {memberDetails.membershipPlan}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Status</Label>
                      <Badge className="mt-1">{memberDetails.status}</Badge>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Member Since
                      </Label>
                      <p className="font-medium">
                        {new Date(
                          memberDetails.memberSince
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Renewal Date
                      </Label>
                      <p className="font-medium">
                        {new Date(
                          memberDetails.renewalDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                  <CardDescription>Manage your payment details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-muted-foreground">
                        Monthly Fee
                      </Label>
                      <p className="font-medium text-2xl">
                        {memberDetails.monthlyFee}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Next Payment
                      </Label>
                      <p className="font-medium">
                        {new Date(
                          memberDetails.nextPaymentDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-muted-foreground">
                        Payment Method
                      </Label>
                      <div className="flex items-center justify-between mt-2 p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-muted-foreground" />
                          <span className="font-medium">
                            {memberDetails.paymentMethod}
                          </span>
                        </div>
                        <Button variant="outline" size="sm">
                          Update
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <DollarSign className="w-4 h-4 mr-2" />
                      View Payment History
                    </Button>
                    <Button variant="outline">Update Payment Method</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Membership Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Unlimited Studio Access</p>
                        <p className="text-sm text-muted-foreground">
                          Open studio hours
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Personal Shelf Space</p>
                        <p className="text-sm text-muted-foreground">
                          Dedicated storage
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Kiln Firing</p>
                        <p className="text-sm text-muted-foreground">
                          2 firings/month included
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Glaze Library Access</p>
                        <p className="text-sm text-muted-foreground">
                          50+ glazes available
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Member Discounts</p>
                        <p className="text-sm text-muted-foreground">
                          15% off classes & supplies
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Glazes Tab */}
        <TabsContent value="glazes" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Glaze Repository</CardTitle>
                  <CardDescription>
                    Browse available glazes in the studio
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by cone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cones</SelectItem>
                      <SelectItem value="cone6">Cone 6</SelectItem>
                      <SelectItem value="cone10">Cone 10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {glazeRepository.map((glaze) => (
                  <Card
                    key={glaze.id}
                    className={!glaze.available ? "opacity-50" : ""}
                  >
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-lg border-2"
                              style={{ backgroundColor: glaze.color }}
                            />
                            <div>
                              <h4>{glaze.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {glaze.code}
                              </p>
                            </div>
                          </div>
                          {glaze.available ? (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              Available
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Out of Stock</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Cone</p>
                            <p className="font-medium">{glaze.cone}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Finish</p>
                            <p className="font-medium">{glaze.finish}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-muted-foreground">Location</p>
                            <p className="font-medium">{glaze.location}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setSelectedGlazeForReport(glaze.id);
                            setShowGlazeReportDialog(true);
                          }}
                        >
                          <AlertTriangle className="w-3 h-3 mr-2" />
                          Report Issue
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Glaze Report Dialog */}
          <Dialog
            open={showGlazeReportDialog}
            onOpenChange={setShowGlazeReportDialog}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Report Glaze Issue</DialogTitle>
                <DialogDescription>
                  Let the studio know about any problems with this glaze
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {selectedGlazeForReport && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg border-2"
                        style={{
                          backgroundColor: glazeRepository.find(
                            (g) => g.id === selectedGlazeForReport
                          )?.color,
                        }}
                      />
                      <div>
                        <p className="font-medium">
                          {
                            glazeRepository.find(
                              (g) => g.id === selectedGlazeForReport
                            )?.name
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {
                            glazeRepository.find(
                              (g) => g.id === selectedGlazeForReport
                            )?.code
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="issue-type">Issue Type</Label>
                  <Select
                    value={glazeReportIssue}
                    onValueChange={setGlazeReportIssue}
                  >
                    <SelectTrigger id="issue-type">
                      <SelectValue placeholder="Select an issue type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low-quantity">Low Quantity</SelectItem>
                      <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                      <SelectItem value="quality-issue">
                        Quality Issue
                      </SelectItem>
                      <SelectItem value="contaminated">Contaminated</SelectItem>
                      <SelectItem value="mislabeled">Mislabeled</SelectItem>
                      <SelectItem value="consistency">
                        Consistency Problem
                      </SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issue-description">Description</Label>
                  <Textarea
                    id="issue-description"
                    placeholder="Please describe the issue in detail..."
                    value={glazeReportMessage}
                    onChange={(e) => setGlazeReportMessage(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowGlazeReportDialog(false);
                      setSelectedGlazeForReport(null);
                      setGlazeReportIssue("");
                      setGlazeReportMessage("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitGlazeReport}>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Report
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Blog Tab */}
        <TabsContent value="blog" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Studio Blog</CardTitle>
              <CardDescription>
                News, updates, and announcements from the studio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studioBlogs.map((blog) => (
                  <Card key={blog.id}>
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        {blog.image && (
                          <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <h4>{blog.title}</h4>
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              {new Date(blog.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {blog.excerpt}
                          </p>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                              By {blog.author}
                            </span>
                            <Button variant="link" className="h-auto p-0">
                              Read more →
                            </Button>
                          </div>
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Studio Shop</CardTitle>
                  <CardDescription>
                    Purchase clay, tools, and supplies
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Cart ({getCartItemCount()})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studioProducts.map((product) => (
                  <Card key={product.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4>{product.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {product.category}
                              </p>
                            </div>
                            {product.stock === "In Stock" ? (
                              <Badge className="bg-green-500 hover:bg-green-600">
                                In Stock
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Low Stock</Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold">
                                {product.price}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {product.unit}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => addToCart(product.id)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add
                            </Button>
                          </div>
                        </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeEmployees.map((employee) => (
                  <Card key={employee.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-medium text-primary">
                              {employee.avatar}
                            </span>
                          </div>
                          <div>
                            <h4>{employee.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {employee.role}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {employee.location}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getEmployeeStatusBadge(employee.status)}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={employee.status !== "available"}
                                onClick={() => setSelectedEmployee(employee.id)}
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Chat
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Message {employee.name}
                                </DialogTitle>
                                <DialogDescription>
                                  Send a quick message to {employee.role}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label>Message</Label>
                                  <Textarea
                                    placeholder="Type your message..."
                                    rows={4}
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline">Cancel</Button>
                                  <Button>
                                    <Send className="w-4 h-4 mr-2" />
                                    Send
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
