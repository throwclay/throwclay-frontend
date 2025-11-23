"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Star,
  Users,
  Phone,
  Globe,
  Instagram,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { useAppContext } from "@/app/context/AppContext";
import { supabase } from "@/lib/apis/supabaseClient";
import { toast } from "sonner";
import { PriceRange, PublicStudioLocationCard } from "@/types";

export default function PublicStudiosDirectory({
  onNavigate,
}: {
  onNavigate?: (page: string) => void;
}) {
  const context = useAppContext();

  const [locations, setLocations] = useState<PublicStudioLocationCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");

  // Application dialog state
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<PublicStudioLocationCard | null>(null);
  const [appMembershipType, setAppMembershipType] = useState<
    "basic" | "premium" | "unlimited"
  >("basic");
  const [appExperience, setAppExperience] = useState("");
  const [appGoals, setAppGoals] = useState("");
  const [appReferralSource, setAppReferralSource] = useState("");
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);

  // --- Fetch studios + locations ---
  useEffect(() => {
    const fetchLocations = async () => {
      setIsLoading(true);
      setLoadError(null);

      const { data, error } = await supabase
        .from("studio_locations")
        .select(
          `
          id,
          name,
          address,
          city,
          state,
          zip_code,
          phone,
          email,
          is_active,
          studios:studio_id (
            id,
            name,
            description,
            email,
            website,
            plan,
            is_active
          )
        `
        )
        .eq("is_active", true); // only active locations

      if (error) {
        console.error("Error loading studio locations", error);
        setLoadError(
          error.message || "Failed to load studios. Please try again later."
        );
        setLocations([]);
        setIsLoading(false);
        return;
      }

      const mapped: PublicStudioLocationCard[] = (data ?? [])
        .map((row: any) => {
          const studio = row.studios;
          if (!studio) return null; // in case of orphaned location rows

          let priceRange: PriceRange = "medium";
          if (studio.plan === "studio-solo") priceRange = "low";
          if (
            studio.plan === "studio-pro" ||
            studio.plan === "studio-unlimited"
          )
            priceRange = "high";

          return {
            locationId: row.id,
            studioId: studio.id,
            studioName: studio.name,
            locationName: row.name,
            description:
              studio.description ||
              "Studio description coming soon. Contact this studio to learn more.",
            addressLine: row.address || "",
            city: row.city || "",
            state: row.state || "",
            zipCode: row.zip_code || "",
            rating: 5.0, // placeholder
            reviewCount: 0, // placeholder
            memberCount: 0, // future: use a view or count
            specialties: [], // future: add to schema
            images: [
              "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
            ],
            contact: {
              phone: row.phone || undefined,
              website: studio.website || undefined,
              instagram: undefined,
              email: studio.email || row.email || undefined,
            },
            classes: {
              beginner: true,
              intermediate: true,
              advanced: true,
              workshops: true,
            },
            amenities: [],
            priceRange,
            openToPublic: studio.is_active !== false,
            distance: undefined,
          };
        })
        .filter(Boolean) as PublicStudioLocationCard[];

      setLocations(mapped);
      setIsLoading(false);
    };

    fetchLocations();
  }, []);

  const filteredLocations = locations.filter((loc) => {
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      loc.studioName.toLowerCase().includes(term) ||
      loc.locationName.toLowerCase().includes(term) ||
      loc.city.toLowerCase().includes(term) ||
      loc.description.toLowerCase().includes(term) ||
      loc.specialties.some((s) => s.toLowerCase().includes(term));

    const matchesLocation =
      locationFilter === "all" || loc.state === locationFilter;

    const matchesSpecialty =
      specialtyFilter === "all" ||
      loc.specialties.some((s) =>
        s.toLowerCase().includes(specialtyFilter.toLowerCase())
      );

    const matchesPrice =
      priceFilter === "all" || loc.priceRange === priceFilter;

    return matchesSearch && matchesLocation && matchesSpecialty && matchesPrice;
  });

  const getPriceDisplay = (priceRange: PriceRange) => {
    switch (priceRange) {
      case "low":
        return "$";
      case "medium":
        return "$$";
      case "high":
        return "$$$";
      default:
        return "$$";
    }
  };

  const handleApplyToLocation = (loc: PublicStudioLocationCard) => {
    if (!context.currentUser || !context.authToken) {
      toast.error("Please log in to apply to a studio.");
      return;
    }

    setSelectedLocation(loc);
    setAppMembershipType("basic");
    setAppExperience("");
    setAppGoals("");
    setAppReferralSource("");
    setApplyDialogOpen(true);
  };

  const submitApplication = async () => {
    if (!selectedLocation) return;

    if (!context.currentUser || !context.authToken) {
      toast.error("Please log in to apply.");
      return;
    }

    try {
      setIsSubmittingApplication(true);

      const res = await fetch(
        `/api/studios/${selectedLocation.studioId}/applications`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${context.authToken}`,
          },
          body: JSON.stringify({
            requestedMembershipType: appMembershipType,
            experience: appExperience,
            goals: appGoals,
            referralSource: appReferralSource || null,
            locationId: selectedLocation.locationId,
            applicantName: context.currentUser?.name, // the api ignores this for now
            applicantEmail: context.currentUser?.email, // the api ignores this for now
            applicantPhone: context.currentUser?.phone, // the api ignores this for now
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Application submit error", err);
        toast.error(err.error || "Failed to submit application");
        return;
      }

      toast.success(
        "Application submitted! The studio will review your request."
      );
      setApplyDialogOpen(false);
      setSelectedLocation(null);
    } catch (e) {
      console.error("Application submit error", e);
      toast.error("Something went wrong submitting your application");
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  const isMemberOfLocation = (locationId: string) => {
    const { context.currentUser, context.currentStudio, context.currentMembership } = context;

    if (!context.currentUser || !context.currentStudio || !context.currentMembership) return false;

    // must match same studio AND same location
    if (context.currentMembership.studioId !== context.currentStudio.id) return false;

    return context.currentMembership.locationId === locationId;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1>Find Pottery Studios Near You</h1>
        <p className="text-muted-foreground text-lg mt-4">
          Discover pottery studios and specific locations, then apply to join
          the one that fits you best.
        </p>
      </div>

      {/* Search + filters */}
      <div className="bg-muted/30 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search studios, locations, or techniques..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="OR">Oregon</SelectItem>
              <SelectItem value="WA">Washington</SelectItem>
              <SelectItem value="CA">California</SelectItem>
            </SelectContent>
          </Select>

          <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              <SelectItem value="wheel">Wheel Throwing</SelectItem>
              <SelectItem value="hand">Hand Building</SelectItem>
              <SelectItem value="glazing">Glazing</SelectItem>
              <SelectItem value="raku">Raku</SelectItem>
              <SelectItem value="sculpture">Sculpture</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="low">$ Budget-friendly</SelectItem>
              <SelectItem value="medium">$$ Moderate</SelectItem>
              <SelectItem value="high">$$$ Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results header */}
      <div className="mb-6 flex items-center justify-between">
        {isLoading ? (
          <p className="text-muted-foreground">Loading studios…</p>
        ) : loadError ? (
          <p className="text-red-500 text-sm">{loadError}</p>
        ) : (
          <p className="text-muted-foreground">
            Found {filteredLocations.length} studio locations
          </p>
        )}

        <Select defaultValue="distance">
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="distance">Sort by Distance</SelectItem>
            <SelectItem value="rating">Sort by Rating</SelectItem>
            <SelectItem value="name">Sort by Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {!isLoading && !loadError && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredLocations.map((loc) => (
              <Card
                key={loc.locationId}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video relative">
                  <ImageWithFallback
                    src={loc.images[0]}
                    alt={loc.studioName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 flex space-x-2">
                    <Badge className="bg-white text-black">
                      {getPriceDisplay(loc.priceRange)}
                    </Badge>
                    {loc.distance && (
                      <Badge className="bg-white text-black">
                        {loc.distance} mi
                      </Badge>
                    )}
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge
                      className={
                        loc.openToPublic ? "bg-green-500" : "bg-yellow-500"
                      }
                    >
                      {loc.openToPublic ? "Open to Public" : "Members Only"}
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        {loc.studioName}
                      </CardTitle>
                      <div className="text-sm text-muted-foreground">
                        {loc.locationName}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {loc.city && loc.state
                            ? `${loc.city}, ${loc.state}`
                            : "Location coming soon"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{loc.rating}</span>
                      <span className="text-muted-foreground text-sm">
                        ({loc.reviewCount})
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-muted-foreground line-clamp-2">
                    {loc.description}
                  </p>

                  {/* Classes */}
                  <div>
                    <Label className="text-sm font-medium">Classes:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {loc.classes.beginner && (
                        <Badge variant="outline" className="text-xs">
                          Beginner
                        </Badge>
                      )}
                      {loc.classes.intermediate && (
                        <Badge variant="outline" className="text-xs">
                          Intermediate
                        </Badge>
                      )}
                      {loc.classes.advanced && (
                        <Badge variant="outline" className="text-xs">
                          Advanced
                        </Badge>
                      )}
                      {loc.classes.workshops && (
                        <Badge variant="outline" className="text-xs">
                          Workshops
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{loc.memberCount} members</span>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="flex items-center space-x-4">
                    {loc.contact.website && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={loc.contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Globe className="w-4 h-4 mr-1" />
                          Website
                        </a>
                      </Button>
                    )}
                    {loc.contact.instagram && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={`https://instagram.com/${loc.contact.instagram.replace(
                            "@",
                            ""
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Instagram className="w-4 h-4 mr-1" />
                          Instagram
                        </a>
                      </Button>
                    )}
                    {loc.contact.phone && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="w-4 h-4 mr-1" />
                        {loc.contact.phone}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    {(() => {
                      const isMember = isMemberOfLocation(loc.locationId);

                      const handlePrimaryClick = () => {
                        if (isMember) {
                          // Route to My Studios view
                          if (onNavigate) {
                            onNavigate("mystudios");
                          } else {
                            // fallback for when this is used as a standalone page
                            window.location.href = "/?tab=mystudios";
                          }
                          return;
                        }

                        // Normal apply flow
                        handleApplyToLocation(loc);
                      };

                      const label = isMember
                        ? "Go to My Studio"
                        : loc.openToPublic
                        ? "Apply to Join"
                        : "Contact Studio";

                      return (
                        <Button
                          onClick={handlePrimaryClick}
                          disabled={!loc.openToPublic && !isMember}
                          className="flex-1"
                        >
                          {label}
                        </Button>
                      );
                    })()}

                    <Button variant="outline">View Classes</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredLocations.length === 0 && locations.length > 0 && (
            <Card className="text-center py-12 mt-8">
              <CardContent>
                <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3>No studio locations match your filters</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or filters.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!isLoading && !loadError && locations.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3>No studio locations published yet</h3>
            <p className="text-muted-foreground">
              Once studios start adding locations, you’ll see them here.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Application Dialog */}
      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Apply to Join{" "}
              {selectedLocation
                ? `${selectedLocation.studioName} – ${selectedLocation.locationName}`
                : "this studio"}
            </DialogTitle>
            <DialogDescription>
              Tell the studio a bit about your experience and what you’re
              looking for.
            </DialogDescription>
          </DialogHeader>

          {!context.currentUser ? (
            <p className="text-sm text-muted-foreground">
              Please log in to submit an application.
            </p>
          ) : (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <Input value={context.currentUser?.name} disabled />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <Input value={context.currentUser?.email} disabled />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="membershipType"
                  className="text-xs text-muted-foreground"
                >
                  Membership Type
                </Label>
                <Select
                  value={appMembershipType}
                  onValueChange={(val) =>
                    setAppMembershipType(
                      val as "basic" | "premium" | "unlimited"
                    )
                  }
                >
                  <SelectTrigger id="membershipType">
                    <SelectValue placeholder="Select membership type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">
                      Basic – a few sessions per month
                    </SelectItem>
                    <SelectItem value="premium">
                      Premium – regular weekly access
                    </SelectItem>
                    <SelectItem value="unlimited">
                      Unlimited – full access
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="experience"
                  className="text-xs text-muted-foreground"
                >
                  Experience (optional)
                </Label>
                <Textarea
                  id="experience"
                  value={appExperience}
                  onChange={(e) => setAppExperience(e.target.value)}
                  placeholder="Tell the studio about your pottery experience, if any."
                  rows={3}
                />
              </div>

              <div>
                <Label
                  htmlFor="goals"
                  className="text-xs text-muted-foreground"
                >
                  Goals (optional)
                </Label>
                <Textarea
                  id="goals"
                  value={appGoals}
                  onChange={(e) => setAppGoals(e.target.value)}
                  placeholder="What do you hope to get out of joining this studio?"
                  rows={3}
                />
              </div>

              <div>
                <Label
                  htmlFor="referral"
                  className="text-xs text-muted-foreground"
                >
                  How did you hear about this studio? (optional)
                </Label>
                <Input
                  id="referral"
                  value={appReferralSource}
                  onChange={(e) => setAppReferralSource(e.target.value)}
                  placeholder="Friend, Instagram, Google, etc."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setApplyDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={submitApplication}
                  disabled={isSubmittingApplication || !selectedLocation}
                >
                  {isSubmittingApplication
                    ? "Submitting..."
                    : "Submit Application"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
