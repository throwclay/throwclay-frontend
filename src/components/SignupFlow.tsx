import { useState } from "react";
import {
    User,
    Building2,
    ArrowLeft,
    ArrowRight,
    Check,
    Mail,
    Lock,
    MapPin,
    Globe,
    Palette,
    Calendar,
    DollarSign,
    Users,
    Crown,
    Zap,
    Star,
    Info
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";

interface SignupFlowProps {
    onComplete: (userData: SignupData) => void;
    onBack: () => void;
}

export interface SignupData {
    accountType: "artist" | "studio";
    // Plan selection
    selectedPlan?: string;
    // Basic Info
    name: string;
    email: string;
    password: string;
    // Location (artist) / Primary Location (studio)
    city: string;
    state: string;
    country: string;
    locationName?: string;
    locationAddress?: string;
    locationZip?: string;
    locationPhone?: string;
    // Artist-specific
    artistHandle?: string;
    specialties?: string[];
    experience?: string;
    // Studio-specific
    studioName?: string;
    studioHandle?: string;
    studioType?: string;
    numberOfLocations?: number;
    memberCapacity?: number;
    // Customization
    primaryColor?: string;
    bio?: string;
    website?: string;
    instagram?: string;
}

const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "Germany",
    "France",
    "Spain",
    "Italy",
    "Japan",
    "Other"
];

const usStates = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming"
];

const specialtyOptions = [
    "Wheel Throwing",
    "Hand Building",
    "Sculpture",
    "Functional Pottery",
    "Decorative Ceramics",
    "Raku",
    "Porcelain",
    "Stoneware",
    "Earthenware",
    "Glazing",
    "Surface Decoration",
    "Kiln Firing"
];

export function SignupFlow({ onComplete, onBack }: SignupFlowProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<SignupData>({
        accountType: "artist",
        name: "",
        email: "",
        password: "",
        city: "",
        state: "",
        country: "United States",
        locationName: "",
        locationAddress: "",
        locationZip: "",
        locationPhone: "",
        specialties: [],
        primaryColor: "#6B73FF"
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const totalSteps = 5;
    const progress = (step / totalSteps) * 100;

    const updateFormData = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateStep = (currentStep: number): boolean => {
        const newErrors: Record<string, string> = {};

        switch (currentStep) {
            case 1:
                // Account type is always valid since we have a default
                break;

            case 2:
                // Basic Info validation
                if (!formData.name.trim()) {
                    newErrors.name = "Name is required";
                }
                if (!formData.email.trim()) {
                    newErrors.email = "Email is required";
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                    newErrors.email = "Please enter a valid email";
                }
                if (!formData.password) {
                    newErrors.password = "Password is required";
                } else if (formData.password.length < 8) {
                    newErrors.password = "Password must be at least 8 characters";
                }
                if (formData.accountType === "artist" && !formData.artistHandle?.trim()) {
                    newErrors.artistHandle = "Username is required";
                }
                if (formData.accountType === "studio" && !formData.studioName?.trim()) {
                    newErrors.studioName = "Studio name is required";
                }
                if (formData.accountType === "studio" && !formData.studioHandle?.trim()) {
                    newErrors.studioHandle = "Studio handle is required";
                }
                break;

            case 3:
                // Location validation
                if (!formData.city.trim()) {
                    newErrors.city = "City is required";
                }
                if (!formData.state.trim()) {
                    newErrors.state = "State is required";
                }
                if (!formData.country.trim()) {
                    newErrors.country = "Country is required";
                }
                // For studios, require full primary location details
                if (formData.accountType === "studio") {
                    if (!formData.locationName?.trim()) {
                        newErrors.locationName = "Location name is required";
                    }
                    if (!formData.locationAddress?.trim()) {
                        newErrors.locationAddress = "Address is required";
                    }
                    if (!formData.locationZip?.trim()) {
                        newErrors.locationZip = "ZIP / Postal code is required";
                    }
                    if (!formData.locationPhone?.trim()) {
                        newErrors.locationPhone = "Location phone is required";
                    }
                }
                break;

            case 4:
                // Customization step - all optional
                break;

            case 5:
                // Plan selection - artists default to free, studios must select
                if (formData.accountType === "studio" && !formData.selectedPlan) {
                    newErrors.selectedPlan = "Please select a plan";
                }
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            if (step < totalSteps) {
                setStep(step + 1);
            } else {
                onComplete(formData);
            }
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            onBack();
        }
    };

    const toggleSpecialty = (specialty: string) => {
        const current = formData.specialties || [];
        if (current.includes(specialty)) {
            updateFormData(
                "specialties",
                current.filter((s) => s !== specialty)
            );
        } else {
            updateFormData("specialties", [...current, specialty]);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBack}
                        >
                            <ArrowLeft className="size-4 mr-2" />
                            Back
                        </Button>
                        <div className="text-sm text-muted-foreground">
                            Step {step} of {totalSteps}
                        </div>
                    </div>
                    <Progress
                        value={progress}
                        className="mb-4"
                    />
                    <CardTitle>
                        {step === 1 && "Choose Your Account Type"}
                        {step === 2 && "Create Your Account"}
                        {step === 3 && "Where Are You Located?"}
                        {step === 4 && "Customize Your Profile"}
                        {step === 5 && "Select Your Plan"}
                    </CardTitle>
                    <CardDescription>
                        {step === 1 && "Select the type of account that best fits your needs"}
                        {step === 2 && "Enter your basic information to get started"}
                        {step === 3 && "Help us connect you with your local pottery community"}
                        {step === 4 && "Add some personality to your profile (optional)"}
                        {step === 5 && formData.accountType === "artist"
                            ? "Start free forever, upgrade anytime"
                            : "Choose the plan that fits your studio"}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {/* Step 1: Account Type */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => updateFormData("accountType", "artist")}
                                    className={`p-6 border-2 rounded-lg transition-all hover:border-primary ${
                                        formData.accountType === "artist"
                                            ? "border-primary bg-primary/5"
                                            : "border-border"
                                    }`}
                                >
                                    <div className="flex flex-col items-center text-center space-y-3">
                                        <div
                                            className={`p-4 rounded-full ${
                                                formData.accountType === "artist"
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted"
                                            }`}
                                        >
                                            <Palette className="size-8" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">Artist</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Track your work, share your portfolio, and connect
                                                with studios
                                            </p>
                                        </div>
                                        {formData.accountType === "artist" && (
                                            <div className="flex items-center gap-2 text-primary">
                                                <Check className="size-4" />
                                                <span className="text-sm">Selected</span>
                                            </div>
                                        )}
                                    </div>
                                </button>

                                <button
                                    onClick={() => updateFormData("accountType", "studio")}
                                    className={`p-6 border-2 rounded-lg transition-all hover:border-primary ${
                                        formData.accountType === "studio"
                                            ? "border-primary bg-primary/5"
                                            : "border-border"
                                    }`}
                                >
                                    <div className="flex flex-col items-center text-center space-y-3">
                                        <div
                                            className={`p-4 rounded-full ${
                                                formData.accountType === "studio"
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted"
                                            }`}
                                        >
                                            <Building2 className="size-8" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">Studio</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Manage members, classes, kilns, and studio
                                                operations
                                            </p>
                                        </div>
                                        {formData.accountType === "studio" && (
                                            <div className="flex items-center gap-2 text-primary">
                                                <Check className="size-4" />
                                                <span className="text-sm">Selected</span>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Basic Info */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    {formData.accountType === "studio" ? "Your Name" : "Full Name"}
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        placeholder={
                                            formData.accountType === "studio"
                                                ? "John Doe"
                                                : "Enter your full name"
                                        }
                                        value={formData.name}
                                        onChange={(e) => updateFormData("name", e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>

                            {formData.accountType === "studio" && (
                                <div className="space-y-2">
                                    <Label htmlFor="studioName">Studio Name</Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                        <Input
                                            id="studioName"
                                            placeholder="Clay & Fire Studio"
                                            value={formData.studioName || ""}
                                            onChange={(e) =>
                                                updateFormData("studioName", e.target.value)
                                            }
                                            className="pl-9"
                                        />
                                    </div>
                                    {errors.studioName && (
                                        <p className="text-sm text-destructive">
                                            {errors.studioName}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="handle">
                                    {formData.accountType === "studio"
                                        ? "Studio Handle"
                                        : "Username"}
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        @
                                    </span>
                                    <Input
                                        id="handle"
                                        placeholder={
                                            formData.accountType === "studio"
                                                ? "clayandfire"
                                                : "johndoe"
                                        }
                                        value={
                                            formData.accountType === "studio"
                                                ? formData.studioHandle || ""
                                                : formData.artistHandle || ""
                                        }
                                        onChange={(e) =>
                                            updateFormData(
                                                formData.accountType === "studio"
                                                    ? "studioHandle"
                                                    : "artistHandle",
                                                e.target.value
                                                    .toLowerCase()
                                                    .replace(/[^a-z0-9_]/g, "")
                                            )
                                        }
                                        className="pl-7"
                                    />
                                </div>
                                {(errors.artistHandle || errors.studioHandle) && (
                                    <p className="text-sm text-destructive">
                                        {errors.artistHandle || errors.studioHandle}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={(e) => updateFormData("email", e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="At least 8 characters"
                                        value={formData.password}
                                        onChange={(e) => updateFormData("password", e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-destructive">{errors.password}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Location */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground z-10" />
                                    <Select
                                        value={formData.country}
                                        onValueChange={(value) => updateFormData("country", value)}
                                    >
                                        <SelectTrigger
                                            id="country"
                                            className="pl-9"
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countries.map((country) => (
                                                <SelectItem
                                                    key={country}
                                                    value={country}
                                                >
                                                    {country}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {errors.country && (
                                    <p className="text-sm text-destructive">{errors.country}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                        <Input
                                            id="city"
                                            placeholder="Portland"
                                            value={formData.city}
                                            onChange={(e) => updateFormData("city", e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                    {errors.city && (
                                        <p className="text-sm text-destructive">{errors.city}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="state">State / Province</Label>
                                    {formData.country === "United States" ? (
                                        <Select
                                            value={formData.state}
                                            onValueChange={(value) =>
                                                updateFormData("state", value)
                                            }
                                        >
                                            <SelectTrigger id="state">
                                                <SelectValue placeholder="Select state" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {usStates.map((state) => (
                                                    <SelectItem
                                                        key={state}
                                                        value={state}
                                                    >
                                                        {state}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Input
                                            id="state"
                                            placeholder="Enter state/province"
                                            value={formData.state}
                                            onChange={(e) =>
                                                updateFormData("state", e.target.value)
                                            }
                                        />
                                    )}
                                    {errors.state && (
                                        <p className="text-sm text-destructive">{errors.state}</p>
                                    )}
                                </div>
                            </div>

                            {formData.accountType === "studio" && (
                                <div className="space-y-4 mt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="locationName">Primary Location Name</Label>
                                        <Input
                                            id="locationName"
                                            placeholder="Main Studio"
                                            value={formData.locationName || ""}
                                            onChange={(e) =>
                                                updateFormData("locationName", e.target.value)
                                            }
                                        />
                                        {errors.locationName && (
                                            <p className="text-sm text-destructive">
                                                {errors.locationName}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="locationAddress">Street Address</Label>
                                        <Input
                                            id="locationAddress"
                                            placeholder="123 Pottery Lane"
                                            value={formData.locationAddress || ""}
                                            onChange={(e) =>
                                                updateFormData("locationAddress", e.target.value)
                                            }
                                        />
                                        {errors.locationAddress && (
                                            <p className="text-sm text-destructive">
                                                {errors.locationAddress}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="locationZip">ZIP / Postal Code</Label>
                                            <Input
                                                id="locationZip"
                                                placeholder="97205"
                                                value={formData.locationZip || ""}
                                                onChange={(e) =>
                                                    updateFormData("locationZip", e.target.value)
                                                }
                                            />
                                            {errors.locationZip && (
                                                <p className="text-sm text-destructive">
                                                    {errors.locationZip}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="locationPhone">Location Phone</Label>
                                            <Input
                                                id="locationPhone"
                                                placeholder="(555) 123-4567"
                                                value={formData.locationPhone || ""}
                                                onChange={(e) =>
                                                    updateFormData("locationPhone", e.target.value)
                                                }
                                            />
                                            {errors.locationPhone && (
                                                <p className="text-sm text-destructive">
                                                    {errors.locationPhone}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 4: Customization */}
                    {step === 4 && (
                        <div className="space-y-6">
                            {formData.accountType === "artist" && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="experience">Experience Level</Label>
                                        <Select
                                            value={formData.experience || ""}
                                            onValueChange={(value) =>
                                                updateFormData("experience", value)
                                            }
                                        >
                                            <SelectTrigger id="experience">
                                                <SelectValue placeholder="Select your experience level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="beginner">
                                                    Beginner - Just starting out
                                                </SelectItem>
                                                <SelectItem value="intermediate">
                                                    Intermediate - 1-3 years experience
                                                </SelectItem>
                                                <SelectItem value="advanced">
                                                    Advanced - 3+ years experience
                                                </SelectItem>
                                                <SelectItem value="professional">
                                                    Professional - Teaching or selling work
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Specialties & Interests</Label>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            Select all that apply
                                        </p>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {specialtyOptions.map((specialty) => (
                                                <button
                                                    key={specialty}
                                                    onClick={() => toggleSpecialty(specialty)}
                                                    className={`px-3 py-2 text-sm rounded-md border transition-all ${
                                                        formData.specialties?.includes(specialty)
                                                            ? "bg-primary text-primary-foreground border-primary"
                                                            : "bg-background border-border hover:border-primary"
                                                    }`}
                                                >
                                                    {specialty}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {formData.accountType === "studio" && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="studioType">Studio Type</Label>
                                        <Select
                                            value={formData.studioType || ""}
                                            onValueChange={(value) =>
                                                updateFormData("studioType", value)
                                            }
                                        >
                                            <SelectTrigger id="studioType">
                                                <SelectValue placeholder="Select studio type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="community">
                                                    Community Studio
                                                </SelectItem>
                                                <SelectItem value="teaching">
                                                    Teaching Studio
                                                </SelectItem>
                                                <SelectItem value="production">
                                                    Production Studio
                                                </SelectItem>
                                                <SelectItem value="shared">
                                                    Shared Workspace
                                                </SelectItem>
                                                <SelectItem value="private">
                                                    Private Studio
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="locations">Number of Locations</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                                <Input
                                                    id="locations"
                                                    type="number"
                                                    min="1"
                                                    placeholder="1"
                                                    value={formData.numberOfLocations || ""}
                                                    onChange={(e) =>
                                                        updateFormData(
                                                            "numberOfLocations",
                                                            parseInt(e.target.value) || 1
                                                        )
                                                    }
                                                    className="pl-9"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="capacity">Member Capacity</Label>
                                            <div className="relative">
                                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                                <Input
                                                    id="capacity"
                                                    type="number"
                                                    min="1"
                                                    placeholder="50"
                                                    value={formData.memberCapacity || ""}
                                                    onChange={(e) =>
                                                        updateFormData(
                                                            "memberCapacity",
                                                            parseInt(e.target.value) || 50
                                                        )
                                                    }
                                                    className="pl-9"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="bio">
                                    {formData.accountType === "studio"
                                        ? "Studio Description"
                                        : "Bio"}
                                </Label>
                                <Textarea
                                    id="bio"
                                    placeholder={
                                        formData.accountType === "studio"
                                            ? "Tell us about your studio, teaching philosophy, and what makes your space unique..."
                                            : "Tell us about yourself, your ceramic journey, and what inspires you..."
                                    }
                                    value={formData.bio || ""}
                                    onChange={(e) => updateFormData("bio", e.target.value)}
                                    rows={4}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="website">Website (Optional)</Label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input
                                        id="website"
                                        type="url"
                                        placeholder="https://yourwebsite.com"
                                        value={formData.website || ""}
                                        onChange={(e) => updateFormData("website", e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="instagram">Instagram (Optional)</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        @
                                    </span>
                                    <Input
                                        id="instagram"
                                        placeholder="yourusername"
                                        value={formData.instagram || ""}
                                        onChange={(e) =>
                                            updateFormData(
                                                "instagram",
                                                e.target.value.replace("@", "")
                                            )
                                        }
                                        className="pl-7"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="primaryColor">Brand Color</Label>
                                <div className="flex gap-3 items-center">
                                    <Input
                                        id="primaryColor"
                                        type="color"
                                        value={formData.primaryColor}
                                        onChange={(e) =>
                                            updateFormData("primaryColor", e.target.value)
                                        }
                                        className="w-20 h-10 cursor-pointer"
                                    />
                                    <span className="text-sm text-muted-foreground">
                                        Choose a color that represents your{" "}
                                        {formData.accountType === "studio"
                                            ? "studio"
                                            : "artistic style"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Plan Selection */}
                    {step === 5 && (
                        <div className="space-y-6">
                            {formData.accountType === "artist" ? (
                                <>
                                    {/* Artist Free Plan */}
                                    <div className="p-6 border-2 border-primary bg-primary/5 rounded-lg">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Star className="size-5 text-primary" />
                                                    <h3 className="text-xl font-semibold">
                                                        Free Forever
                                                    </h3>
                                                </div>
                                                <p className="text-3xl font-bold">
                                                    $0
                                                    <span className="text-lg font-normal text-muted-foreground">
                                                        /month
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm">
                                                Selected
                                            </div>
                                        </div>
                                        <p className="text-muted-foreground mb-4">
                                            Perfect for individual artists getting started
                                        </p>
                                        <ul className="space-y-2 mb-4">
                                            <li className="flex items-center gap-2">
                                                <Check className="size-4 text-primary" />
                                                <span className="text-sm">
                                                    Personal pottery journal
                                                </span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="size-4 text-primary" />
                                                <span className="text-sm">
                                                    Track up to 50 pieces
                                                </span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="size-4 text-primary" />
                                                <span className="text-sm">Basic portfolio</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="size-4 text-primary" />
                                                <span className="text-sm">
                                                    Connect with studios
                                                </span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Upgrade Option */}
                                    <div className="p-6 border-2 border-border rounded-lg hover:border-primary transition-colors">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Crown className="size-5 text-amber-500" />
                                                    <h3 className="text-xl font-semibold">
                                                        Pro Artist
                                                    </h3>
                                                </div>
                                                <p className="text-3xl font-bold">
                                                    $12
                                                    <span className="text-lg font-normal text-muted-foreground">
                                                        /month
                                                    </span>
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    updateFormData("selectedPlan", "pro")
                                                }
                                            >
                                                Upgrade
                                            </Button>
                                        </div>
                                        <p className="text-muted-foreground mb-4">
                                            For professional artists and sellers
                                        </p>
                                        <ul className="space-y-2 mb-4">
                                            <li className="flex items-center gap-2">
                                                <Check className="size-4 text-primary" />
                                                <span className="text-sm">
                                                    Unlimited pieces tracking
                                                </span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="size-4 text-primary" />
                                                <span className="text-sm">Advanced analytics</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="size-4 text-primary" />
                                                <span className="text-sm">Sell in marketplace</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="size-4 text-primary" />
                                                <span className="text-sm">Custom branding</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="size-4 text-primary" />
                                                <span className="text-sm">Priority support</span>
                                            </li>
                                        </ul>
                                        <p className="text-xs text-muted-foreground">
                                            You can upgrade anytime from your account settings
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Studio Plans */}
                                    <Alert>
                                        <Info className="size-4" />
                                        <AlertDescription>
                                            All studio plans include a{" "}
                                            <strong>7-day limited trial</strong> for setup. During
                                            the trial, you won't be able to invite members. Our
                                            onboarding team will contact you to schedule a
                                            personalized onboarding session and provide ongoing
                                            support.
                                        </AlertDescription>
                                    </Alert>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Starter Plan */}
                                        <button
                                            onClick={() =>
                                                updateFormData("selectedPlan", "starter")
                                            }
                                            className={`p-6 border-2 rounded-lg transition-all text-left ${
                                                formData.selectedPlan === "starter"
                                                    ? "border-primary bg-primary/5"
                                                    : "border-border hover:border-primary"
                                            }`}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="font-semibold mb-1">Starter</h3>
                                                    <p className="text-2xl font-bold">
                                                        $79
                                                        <span className="text-sm font-normal text-muted-foreground">
                                                            /mo
                                                        </span>
                                                    </p>
                                                </div>
                                                {formData.selectedPlan === "starter" && (
                                                    <Check className="size-5 text-primary" />
                                                )}
                                            </div>
                                            <ul className="space-y-2">
                                                <li className="flex items-center gap-2">
                                                    <Check className="size-4" />
                                                    <span className="text-sm">
                                                        Up to 25 members
                                                    </span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="size-4" />
                                                    <span className="text-sm">2 kilns</span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="size-4" />
                                                    <span className="text-sm">
                                                        Basic scheduling
                                                    </span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="size-4" />
                                                    <span className="text-sm">
                                                        Member management
                                                    </span>
                                                </li>
                                            </ul>
                                        </button>

                                        {/* Professional Plan */}
                                        <button
                                            onClick={() =>
                                                updateFormData("selectedPlan", "professional")
                                            }
                                            className={`p-6 border-2 rounded-lg transition-all text-left relative ${
                                                formData.selectedPlan === "professional"
                                                    ? "border-primary bg-primary/5"
                                                    : "border-border hover:border-primary"
                                            }`}
                                        >
                                            <div className="absolute -top-3 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs">
                                                Popular
                                            </div>
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="font-semibold mb-1">
                                                        Professional
                                                    </h3>
                                                    <p className="text-2xl font-bold">
                                                        $149
                                                        <span className="text-sm font-normal text-muted-foreground">
                                                            /mo
                                                        </span>
                                                    </p>
                                                </div>
                                                {formData.selectedPlan === "professional" && (
                                                    <Check className="size-5 text-primary" />
                                                )}
                                            </div>
                                            <ul className="space-y-2">
                                                <li className="flex items-center gap-2">
                                                    <Check className="size-4" />
                                                    <span className="text-sm">
                                                        Up to 100 members
                                                    </span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="size-4" />
                                                    <span className="text-sm">Unlimited kilns</span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="size-4" />
                                                    <span className="text-sm">
                                                        Advanced scheduling
                                                    </span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="size-4" />
                                                    <span className="text-sm">
                                                        Class management
                                                    </span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="size-4" />
                                                    <span className="text-sm">Glaze library</span>
                                                </li>
                                            </ul>
                                        </button>

                                        {/* Enterprise Plan */}
                                        <button
                                            onClick={() =>
                                                updateFormData("selectedPlan", "enterprise")
                                            }
                                            className={`p-6 border-2 rounded-lg transition-all text-left md:col-span-2 ${
                                                formData.selectedPlan === "enterprise"
                                                    ? "border-primary bg-primary/5"
                                                    : "border-border hover:border-primary"
                                            }`}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Crown className="size-5 text-amber-500" />
                                                        <h3 className="font-semibold">
                                                            Enterprise
                                                        </h3>
                                                    </div>
                                                    <p className="text-2xl font-bold">
                                                        $299
                                                        <span className="text-sm font-normal text-muted-foreground">
                                                            /mo
                                                        </span>
                                                    </p>
                                                </div>
                                                {formData.selectedPlan === "enterprise" && (
                                                    <Check className="size-5 text-primary" />
                                                )}
                                            </div>
                                            <div className="grid md:grid-cols-3 gap-4">
                                                <ul className="space-y-2">
                                                    <li className="flex items-center gap-2">
                                                        <Check className="size-4" />
                                                        <span className="text-sm">
                                                            Unlimited members
                                                        </span>
                                                    </li>
                                                    <li className="flex items-center gap-2">
                                                        <Check className="size-4" />
                                                        <span className="text-sm">
                                                            Multiple locations
                                                        </span>
                                                    </li>
                                                </ul>
                                                <ul className="space-y-2">
                                                    <li className="flex items-center gap-2">
                                                        <Check className="size-4" />
                                                        <span className="text-sm">
                                                            Custom branding
                                                        </span>
                                                    </li>
                                                    <li className="flex items-center gap-2">
                                                        <Check className="size-4" />
                                                        <span className="text-sm">API access</span>
                                                    </li>
                                                </ul>
                                                <ul className="space-y-2">
                                                    <li className="flex items-center gap-2">
                                                        <Check className="size-4" />
                                                        <span className="text-sm">
                                                            Dedicated support
                                                        </span>
                                                    </li>
                                                    <li className="flex items-center gap-2">
                                                        <Check className="size-4" />
                                                        <span className="text-sm">
                                                            Priority features
                                                        </span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <div className="flex justify-between pt-6 mt-6 border-t">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                        >
                            <ArrowLeft className="size-4 mr-2" />
                            {step === 1 ? "Cancel" : "Previous"}
                        </Button>
                        <Button onClick={handleNext}>
                            {step === totalSteps ? "Create Account" : "Next"}
                            {step < totalSteps && <ArrowRight className="size-4 ml-2" />}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
