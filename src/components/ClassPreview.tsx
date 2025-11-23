import { useState } from "react";
import {
    ArrowLeft,
    Calendar,
    Clock,
    MapPin,
    Users,
    Star,
    MessageCircle,
    Share2,
    Heart,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    Percent,
    Check,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { toast } from "sonner";

interface ClassData {
    id: string;
    name: string;
    instructor: string;
    schedule: string;
    capacity: number;
    enrolled: number;
    waitlist: number;
    startDate: string;
    endDate: string;
    status: string;
    level: string;
    price: string;
    thumbnail?: string;
}

interface ClassPreviewProps {
    classData?: ClassData;
    onBack: () => void;
}

interface PricingOption {
    id: string;
    name: string;
    price: number;
    description: string;
    isDefault: boolean;
}

interface Review {
    id: string;
    studentName: string;
    rating: number;
    comment: string;
    date: string;
    avatar?: string;
}

export function ClassPreview({ classData, onBack }: ClassPreviewProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedPricing, setSelectedPricing] = useState<string>("");
    const [discountCode, setDiscountCode] = useState("");
    const [showEnrollDialog, setShowEnrollDialog] = useState(false);
    const [showWaitlistDialog, setShowWaitlistDialog] = useState(false);

    // Mock extended class data
    const mockClassData = {
        ...classData,
        description:
            "Learn the fundamentals of wheel throwing pottery including centering, pulling walls, and basic forms. This comprehensive course covers everything from clay preparation to finishing techniques. Perfect for beginners looking to develop a solid foundation in pottery.",
        materials: "All materials included: clay, glazes, tools, and kiln firing",
        prerequisites: "No prior experience required - perfect for beginners!",
        location: "Studio A - Main Pottery Room",
        duration: "8 weeks",
        sessionsPerWeek: 2,
        sessionDuration: "2 hours",
        whatYouLearn: [
            "Clay preparation and wedging techniques",
            "Centering clay on the wheel",
            "Pulling and shaping basic forms",
            "Trimming and finishing techniques",
            "Glazing and firing processes",
            "Safety practices in the pottery studio"
        ],
        images: [
            "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
            "https://images.unsplash.com/photo-1594736797933-d0c6ba7a6d48?w=800",
            "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800"
        ]
    };

    const pricingOptions: PricingOption[] = [
        {
            id: "1",
            name: "Early Bird Special",
            price: 280,
            description: "Save $40 with early registration (valid until 2 weeks before class)",
            isDefault: false
        },
        {
            id: "2",
            name: "Standard Price",
            price: 320,
            description: "Regular class price includes all materials and firing",
            isDefault: true
        },
        {
            id: "3",
            name: "Premium Package",
            price: 380,
            description:
                "Includes extra studio time, advanced glazing options, and take-home tool kit",
            isDefault: false
        }
    ];

    const mockReviews: Review[] = [
        {
            id: "1",
            studentName: "Jennifer Walsh",
            rating: 5,
            comment:
                "Sarah is an amazing instructor! I went from never touching clay to making beautiful bowls. The class atmosphere is so supportive and fun.",
            date: "2 weeks ago"
        },
        {
            id: "2",
            studentName: "Michael Rodriguez",
            rating: 5,
            comment:
                "Best pottery class I've taken. Great balance of instruction and hands-on practice. Highly recommend for beginners!",
            date: "1 month ago"
        },
        {
            id: "3",
            studentName: "Lisa Chen",
            rating: 4,
            comment:
                "Really enjoyed the class structure. Sarah explains techniques clearly and gives great individual feedback.",
            date: "1 month ago"
        }
    ];

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev === mockClassData.images.length - 1 ? 0 : prev + 1));
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? mockClassData.images.length - 1 : prev - 1));
    };

    const handleEnroll = () => {
        if (mockClassData.enrolled >= mockClassData.capacity) {
            setShowWaitlistDialog(true);
        } else {
            setShowEnrollDialog(true);
        }
    };

    const handleApplyDiscount = () => {
        if (discountCode.toUpperCase() === "EARLY20") {
            toast.success("Discount code applied! 20% off your enrollment.");
        } else {
            toast.error("Invalid discount code. Please check and try again.");
        }
    };

    const calculateDiscountedPrice = (originalPrice: number) => {
        if (discountCode.toUpperCase() === "EARLY20") {
            return originalPrice * 0.8;
        }
        return originalPrice;
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
            />
        ));
    };

    const averageRating =
        mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length;
    const selectedPrice =
        pricingOptions.find((p) => p.id === selectedPricing) ||
        pricingOptions.find((p) => p.isDefault);
    const finalPrice = selectedPrice ? calculateDiscountedPrice(selectedPrice.price) : 0;

    if (!mockClassData) {
        return <div>Class not found</div>;
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onBack}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Classes
                    </Button>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                        >
                            <Share2 className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                        >
                            <Heart className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Image Gallery */}
                        <div className="relative">
                            <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                                <ImageWithFallback
                                    src={mockClassData.images[currentImageIndex]}
                                    alt={`${mockClassData.name} - Image ${currentImageIndex + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {mockClassData.images.length > 1 && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur"
                                        onClick={handlePrevImage}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur"
                                        onClick={handleNextImage}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>

                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                        {mockClassData.images.map((_, index) => (
                                            <button
                                                key={index}
                                                className={`w-2 h-2 rounded-full transition-colors ${
                                                    index === currentImageIndex
                                                        ? "bg-white"
                                                        : "bg-white/50"
                                                }`}
                                                onClick={() => setCurrentImageIndex(index)}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Class Header */}
                        <div>
                            <div className="flex items-center space-x-3 mb-3">
                                <Badge variant="outline">{mockClassData.level}</Badge>
                                <Badge
                                    variant={
                                        mockClassData.status === "active" ? "default" : "secondary"
                                    }
                                >
                                    {mockClassData.status}
                                </Badge>
                                <div className="flex items-center space-x-1">
                                    {renderStars(Math.round(averageRating))}
                                    <span className="text-sm text-muted-foreground ml-1">
                                        ({averageRating.toFixed(1)}) • {mockReviews.length} reviews
                                    </span>
                                </div>
                            </div>

                            <h1 className="text-3xl font-bold mb-2">{mockClassData.name}</h1>

                            <div className="flex items-center space-x-6 text-muted-foreground">
                                <div className="flex items-center space-x-2">
                                    <Avatar className="w-8 h-8">
                                        <AvatarFallback>
                                            {mockClassData.instructor
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span>with {mockClassData.instructor}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{mockClassData.schedule}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{mockClassData.location}</span>
                                </div>
                            </div>
                        </div>

                        {/* About This Class */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4">About This Class</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                {mockClassData.description}
                            </p>
                        </div>

                        {/* What You'll Learn */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4">What You'll Learn</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {mockClassData.whatYouLearn.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start space-x-2"
                                    >
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Class Details */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Class Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="font-medium text-sm text-muted-foreground">
                                            Duration
                                        </h3>
                                        <p>
                                            {mockClassData.duration} •{" "}
                                            {mockClassData.sessionsPerWeek} sessions per week
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm text-muted-foreground">
                                            Session Length
                                        </h3>
                                        <p>{mockClassData.sessionDuration} per session</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm text-muted-foreground">
                                            Class Size
                                        </h3>
                                        <p>Maximum {mockClassData.capacity} students</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="font-medium text-sm text-muted-foreground">
                                            Materials
                                        </h3>
                                        <p>{mockClassData.materials}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm text-muted-foreground">
                                            Prerequisites
                                        </h3>
                                        <p>{mockClassData.prerequisites}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm text-muted-foreground">
                                            Location
                                        </h3>
                                        <p>{mockClassData.location}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reviews */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Student Reviews</h2>
                            <div className="space-y-4">
                                {mockReviews.map((review) => (
                                    <Card key={review.id}>
                                        <CardContent className="pt-6">
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
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <span className="font-medium">
                                                            {review.studentName}
                                                        </span>
                                                        <div className="flex space-x-1">
                                                            {renderStars(review.rating)}
                                                        </div>
                                                        <span className="text-sm text-muted-foreground">
                                                            {review.date}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {review.comment}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Enrollment Card */}
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Enroll in Class</span>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold">
                                            $
                                            {finalPrice !== selectedPrice?.price ? (
                                                <>
                                                    <span className="line-through text-lg text-muted-foreground mr-2">
                                                        ${selectedPrice?.price}
                                                    </span>
                                                    ${finalPrice}
                                                </>
                                            ) : (
                                                `$${finalPrice}`
                                            )}
                                        </div>
                                        {selectedPrice && (
                                            <div className="text-xs text-muted-foreground">
                                                {selectedPrice.name}
                                            </div>
                                        )}
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Pricing Options */}
                                <div className="space-y-2">
                                    <Label>Pricing Options</Label>
                                    <Select
                                        value={selectedPricing}
                                        onValueChange={setSelectedPricing}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select pricing option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pricingOptions.map((option) => (
                                                <SelectItem
                                                    key={option.id}
                                                    value={option.id}
                                                >
                                                    <div className="flex items-center justify-between w-full">
                                                        <span>{option.name}</span>
                                                        <span className="ml-2">
                                                            ${option.price}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {selectedPrice && (
                                        <p className="text-xs text-muted-foreground">
                                            {selectedPrice.description}
                                        </p>
                                    )}
                                </div>

                                {/* Discount Code */}
                                <div className="space-y-2">
                                    <Label>Discount Code (Optional)</Label>
                                    <div className="flex space-x-2">
                                        <Input
                                            placeholder="Enter code"
                                            value={discountCode}
                                            onChange={(e) => setDiscountCode(e.target.value)}
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleApplyDiscount}
                                        >
                                            Apply
                                        </Button>
                                    </div>
                                </div>

                                {/* Enrollment Status */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Enrollment:</span>
                                        <span>
                                            {mockClassData.enrolled}/{mockClassData.capacity}{" "}
                                            enrolled
                                        </span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full transition-all"
                                            style={{
                                                width: `${(mockClassData.enrolled / mockClassData.capacity) * 100}%`
                                            }}
                                        />
                                    </div>
                                    {mockClassData.waitlist > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            {mockClassData.waitlist} people on waitlist
                                        </p>
                                    )}
                                </div>

                                {/* Enroll Button */}
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handleEnroll}
                                    disabled={!selectedPricing}
                                >
                                    {mockClassData.enrolled >= mockClassData.capacity
                                        ? "Join Waitlist"
                                        : "Enroll Now"}
                                </Button>

                                {/* Contact Instructor */}
                                <Button
                                    variant="outline"
                                    className="w-full"
                                >
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Message Instructor
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Class Schedule */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Calendar className="w-5 h-5" />
                                    <span>Schedule</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center space-x-2 text-sm">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span>{mockClassData.schedule}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span>
                                        {mockClassData.startDate} - {mockClassData.endDate}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span>{mockClassData.location}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Enrollment Dialog */}
            <Dialog
                open={showEnrollDialog}
                onOpenChange={setShowEnrollDialog}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enroll in {mockClassData.name}</DialogTitle>
                        <DialogDescription>
                            Complete your enrollment for this pottery class
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">{selectedPrice?.name}</span>
                                <span className="font-bold">${finalPrice}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {selectedPrice?.description}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="studentName">Full Name</Label>
                            <Input
                                id="studentName"
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="studentEmail">Email Address</Label>
                            <Input
                                id="studentEmail"
                                type="email"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="studentPhone">Phone Number</Label>
                            <Input
                                id="studentPhone"
                                type="tel"
                                placeholder="Enter your phone number"
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowEnrollDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    toast.success("Enrollment successful! Welcome to the class.");
                                    setShowEnrollDialog(false);
                                }}
                            >
                                Complete Enrollment
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Waitlist Dialog */}
            <Dialog
                open={showWaitlistDialog}
                onOpenChange={setShowWaitlistDialog}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Join Waitlist</DialogTitle>
                        <DialogDescription>
                            This class is currently full. Join the waitlist to be notified when a
                            spot opens up.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">
                                    Current waitlist position: #{mockClassData.waitlist + 1}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                We'll notify you immediately when a spot becomes available.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="waitlistName">Full Name</Label>
                            <Input
                                id="waitlistName"
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="waitlistEmail">Email Address</Label>
                            <Input
                                id="waitlistEmail"
                                type="email"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowWaitlistDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    toast.success(
                                        "Added to waitlist! We'll notify you when a spot opens."
                                    );
                                    setShowWaitlistDialog(false);
                                }}
                            >
                                Join Waitlist
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
