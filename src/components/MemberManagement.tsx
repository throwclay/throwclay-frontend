import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  MessageCircle,
  Eye,
  CheckCircle,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Settings,
  Users2,
  FileText,
  MoreHorizontal,
  FormInput,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Checkbox } from "./ui/checkbox";
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
import { Label } from "./ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  useAppContext,
  type StudioMembership,
  type MembershipApplication,
  type PaymentInvoice,
  type User,
} from "@/app/context/AppContext";

import type {
  User as UserType,
  Studio,
  PotteryEntry,
  StudioLocation,
} from "@/types";

import { MemberIntakeFormBuilder } from "./MemberIntakeFormBuilder";
import { supabase as supabaseClient } from "@/lib/apis/supabaseClient";
import { toast } from "sonner";

interface MemberData extends User {
  membership: StudioMembership;
  invoices: PaymentInvoice[];
  classHistory: any[];
  eventHistory: any[];
  currentUser: UserType | null;
  setCurrentUser: (user: UserType | null) => void;
  currentStudio: Studio | null;
  setCurrentStudio: (studio: Studio | null) => void;
}

export function MemberManagement({ currentStudio }: MemberData) {
  const [activeTab, setActiveTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  const [locations, setLocations] = useState<StudioLocation[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [locationsError, setLocationsError] = useState<string | null>(null);

  // NEW: invite form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<
    "member" | "employee" | "manager" | "admin"
  >("member");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteLocationId, setInviteLocationId] = useState<string | "">("");
  const [inviteMembershipType, setInviteMembershipType] = useState<
    "basic" | "premium" | "unlimited"
  >("basic");

  // Mock member data
  const [members] = useState<MemberData[]>([
    {
      id: "mem1",
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      handle: "sarahj",
      type: "artist",
      studioId: currentStudio?.id,
      phone: "(503) 555-0101",
      subscription: "free",
      role: "member",
      membership: {
        id: "membership1",
        userId: "mem1",
        studioId: currentStudio?.id || "",
        locationId: "loc1",
        membershipType: "basic",
        status: "active",
        startDate: "2025-01-15",
        shelfNumber: "A-12",
        monthlyRate: 85,
        passionProjectsUpgrade: true,
        passionProjectsRate: 5,
        joinedAt: "2025-01-15",
        lastActivity: "2025-06-13",
      },
      invoices: [
        {
          id: "inv1",
          userId: "mem1",
          studioId: currentStudio?.id || "",
          type: "membership",
          amount: 85,
          description: "Monthly Membership - June 2025",
          dueDate: "2025-06-01",
          paidDate: "2025-06-01",
          status: "paid",
        },
      ],
      classHistory: [
        {
          id: "class1",
          title: "Wheel Throwing Basics",
          status: "completed",
          date: "2025-03-15",
        },
        {
          id: "class2",
          title: "Glazing Workshop",
          status: "enrolled",
          date: "2025-06-20",
        },
      ],
      eventHistory: [
        {
          id: "event1",
          title: "Spring Pottery Sale",
          status: "participated",
          date: "2025-04-12",
        },
      ],
    },
    {
      id: "mem2",
      name: "Mike Rodriguez",
      email: "mike.r@email.com",
      handle: "mikerod",
      type: "artist",
      studioId: currentStudio?.id,
      phone: "(503) 555-0102",
      subscription: "free",
      role: "member",
      membership: {
        id: "membership2",
        userId: "mem2",
        studioId: currentStudio?.id || "",
        locationId: "loc2",
        membershipType: "premium",
        status: "active",
        startDate: "2025-02-01",
        shelfNumber: "B-08",
        monthlyRate: 125,
        passionProjectsUpgrade: false,
        passionProjectsRate: 5,
        joinedAt: "2025-02-01",
        lastActivity: "2025-06-12",
      },
      invoices: [
        {
          id: "inv3",
          userId: "mem2",
          studioId: currentStudio?.id || "",
          type: "membership",
          amount: 125,
          description: "Premium Membership - June 2025",
          dueDate: "2025-06-01",
          status: "overdue",
        },
      ],
      classHistory: [
        {
          id: "class3",
          title: "Advanced Throwing",
          status: "enrolled",
          date: "2025-06-15",
        },
      ],
      eventHistory: [],
    },
  ]);

  // Mock pending applications
  const [applications] = useState<MembershipApplication[]>([
    {
      id: "app1",
      applicantName: "Emma Thompson",
      applicantEmail: "emma.t@email.com",
      applicantPhone: "(503) 555-0200",
      studioId: currentStudio?.id || "",
      locationId: "loc1",
      membershipType: "basic",
      experience: "Beginner - took a few classes elsewhere",
      interests: ["Wheel Throwing", "Glazing"],
      goals: "Learn pottery as a hobby and stress relief",
      referralSource: "Google Search",
      emergencyContact: {
        name: "John Thompson",
        phone: "(503) 555-0201",
        relationship: "Spouse",
      },
      status: "pending",
      submittedAt: "2025-06-10",
      customFields: {
        hearAboutUs: "Friend recommendation",
        preferredClassTime: "Evenings",
      },
    },
    {
      id: "app2",
      applicantName: "David Kim",
      applicantEmail: "david.kim@email.com",
      applicantPhone: "(503) 555-0203",
      studioId: currentStudio?.id || "",
      locationId: "loc2",
      membershipType: "premium",
      experience: "Intermediate - 2 years experience",
      interests: ["Hand Building", "Sculpture", "Raku"],
      goals: "Develop advanced techniques and sell work",
      referralSource: "Instagram",
      emergencyContact: {
        name: "Lisa Kim",
        phone: "(503) 555-0204",
        relationship: "Sister",
      },
      status: "pending",
      submittedAt: "2025-06-12",
      customFields: {
        hearAboutUs: "Social media",
        preferredClassTime: "Weekends",
      },
    },
  ]);

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.membership.shelfNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesLocation =
      selectedLocation === "all" ||
      member.membership.locationId === selectedLocation;
    const matchesStatus =
      activeTab === "all" || member.membership.status === activeTab;

    return matchesSearch && matchesLocation && matchesStatus;
  });

  const handleMemberSelect = (memberId: string, checked: boolean) => {
    if (checked) {
      setSelectedMembers((prev) => [...prev, memberId]);
    } else {
      setSelectedMembers((prev) => prev.filter((id) => id !== memberId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMembers(filteredMembers.map((m) => m.id));
    } else {
      setSelectedMembers([]);
    }
  };

  const getLocationName = (locationId?: string) => {
    if (!locationId) return "Unassigned";
    const location = currentStudio?.locations.find(
      (loc) => loc.id === locationId
    );
    return location?.name || "Unknown Location";
  };

  const getMembershipStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>;
      case "expired":
        return <Badge variant="outline">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (invoice: PaymentInvoice) => {
    switch (invoice.status) {
      case "paid":
        return <Badge variant="default">Paid</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">{invoice.status}</Badge>;
    }
  };

  // 🔑 NEW: send studio invite via API
  const handleSendInvite = async () => {
    if (!currentStudio) {
      toast.error("No studio selected");
      return;
    }

    if (!inviteEmail) {
      toast.error("Please enter an email");
      return;
    }

    setIsInviting(true);
    try {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      if (!session) {
        toast.error("You must be logged in to send invites");
        setIsInviting(false);
        return;
      }

      const res = await fetch(`/api/studios/${currentStudio.id}/invites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          locationId: inviteLocationId,
          membershipType: inviteMembershipType,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Invite error", err);
        toast.error(err.error || "Failed to send invite");
        setIsInviting(false);
        return;
      }

      const data = await res.json();
      console.log("Invite created:", data.invite);
      toast.success("Invite sent!");

      // Reset form
      setInviteEmail("");
      setInviteRole("member");
      setInviteLocationId("");
      setInviteMembershipType("basic");
    } catch (e) {
      console.error("Invite error", e);
      toast.error("Something went wrong sending the invite");
    } finally {
      setIsInviting(false);
    }
  };

  useEffect(() => {
    if (!currentStudio?.id) return;

    const loadLocations = async () => {
      setIsLoadingLocations(true);
      setLocationsError(null);

      const { data, error } = await supabaseClient
        .from("studio_locations")
        .select("*")
        .eq("studio_id", currentStudio.id)
        .order("name", { ascending: true });

      console.log(`Studio Locations: ${data?.length}`);

      if (error) {
        console.error("Error fetching studio locations", error);
        setLocationsError("Failed to load locations");
      } else {
        setLocations((data || []) as StudioLocation[]);

        // auto-select first location:
        if (!inviteLocationId && data && data.length > 0) {
          setInviteLocationId(data[0].id);
        }
      }

      setIsLoadingLocations(false);
    };

    loadLocations();
  }, [currentStudio?.id]);

  if (!currentStudio) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">Member Management</h1>
        <p className="text-muted-foreground">
          Select a studio to manage members.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Member Management</h1>
          <p className="text-muted-foreground text-lg">
            Manage studio memberships, applications, and member information
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>

          {/* 🔑 Invite dialog instead of direct "Create Member" */}
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Invite a New Member</DialogTitle>
                <DialogDescription>
                  Send an invite to join{" "}
                  <span className="font-medium">@{currentStudio.handle}</span>.
                  They&apos;ll be assigned a location and membership type after
                  accepting.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Email</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    placeholder="artist@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="inviteRole">Role</Label>
                  <Select
                    value={inviteRole}
                    onValueChange={(value) =>
                      setInviteRole(value as typeof inviteRole)
                    }
                  >
                    <SelectTrigger id="inviteRole">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="inviteLocation">
                    Location <span className="text-red-500">*</span>
                  </Label>

                  <Select
                    value={inviteLocationId}
                    onValueChange={(value) => setInviteLocationId(value)}
                    disabled={isLoadingLocations || locations.length === 0}
                  >
                    <SelectTrigger id="inviteLocation">
                      <SelectValue
                        placeholder={
                          isLoadingLocations
                            ? "Loading locations..."
                            : locations.length === 0
                            ? "No locations available"
                            : "Select location"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name}
                          {loc.city && loc.state
                            ? ` – ${loc.city}, ${loc.state}`
                            : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {locationsError && (
                    <p className="text-xs text-red-500 mt-1">
                      {locationsError}
                    </p>
                  )}
                  {!locationsError && (
                    <p className="text-xs text-muted-foreground">
                      Location is required. The member will be associated with
                      this studio location when they accept.
                    </p>
                  )}
                </div>

                {/* Membership type */}
                <div className="space-y-2">
                  <Label htmlFor="inviteMembershipType">Membership Type</Label>
                  <Select
                    value={inviteMembershipType}
                    onValueChange={(value) =>
                      setInviteMembershipType(
                        value as typeof inviteMembershipType
                      )
                    }
                  >
                    <SelectTrigger id="inviteMembershipType">
                      <SelectValue placeholder="Select membership type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic – $85/month</SelectItem>
                      <SelectItem value="premium">
                        Premium – $125/month
                      </SelectItem>
                      <SelectItem value="unlimited">
                        Unlimited – $185/month
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setInviteEmail("");
                      setInviteRole("member");
                      setInviteLocationId("");
                      setInviteMembershipType("basic");
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSendInvite}
                    disabled={isInviting || !inviteEmail || !inviteLocationId}
                  >
                    {isInviting ? "Sending..." : "Send Invite"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-8"
      >
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="active">Active Members</TabsTrigger>
            <TabsTrigger value="pending">
              Pending Applications
              {applications.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {applications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="invites">
              Pending Invites
              {applications.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {applications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="suspended">Suspended</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
            <TabsTrigger value="intake-form">
              <FormInput className="w-4 h-4 mr-2" />
              Intake Form
            </TabsTrigger>
          </TabsList>

          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select
              value={selectedLocation}
              onValueChange={setSelectedLocation}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {currentStudio?.locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Members */}
        <TabsContent value="active" className="space-y-8">
          {/* Bulk Actions */}
          {selectedMembers.length > 0 && (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-accent/20">
              <span className="text-sm text-muted-foreground">
                {selectedMembers.length} member
                {selectedMembers.length !== 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Bulk Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Change Status
                </Button>
              </div>
            </div>
          )}

          {/* Members Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedMembers.length === filteredMembers.length &&
                        filteredMembers.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Membership</TableHead>
                  <TableHead>Shelf</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedMembers.includes(member.id)}
                        onCheckedChange={(checked) =>
                          handleMemberSelect(member.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Users2 className="w-8 h-8 text-muted-foreground" />
                        <div className="space-y-1">
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">
                            @{member.handle}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                          {member.email}
                        </div>
                        {member.phone && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="w-4 h-4 mr-2" />
                            {member.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                        {getLocationName(member.membership.locationId)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="font-medium capitalize">
                          {member.membership.membershipType}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ${member.membership.monthlyRate}/month
                        </div>
                        {member.membership.passionProjectsUpgrade && (
                          <Badge variant="secondary" className="text-xs">
                            +Passion Projects
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {member.membership.shelfNumber || "Unassigned"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getMembershipStatusBadge(member.membership.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {member.membership.lastActivity
                          ? new Date(
                              member.membership.lastActivity
                            ).toLocaleDateString()
                          : "Never"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Member
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="w-4 h-4 mr-2" />
                            View Invoices
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <DollarSign className="w-4 h-4 mr-2" />
                            Payment History
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Pending Applications */}
        <TabsContent value="pending" className="space-y-8">
          <div className="space-y-8">
            {applications.map((application) => (
              <div
                key={application.id}
                className="border rounded-lg p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">
                      {application.applicantName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Applied{" "}
                      {new Date(application.submittedAt).toLocaleDateString()} •{" "}
                      {application.membershipType} membership
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button variant="outline" size="sm">
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button size="sm">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Contact Information
                    </Label>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                        {application.applicantEmail}
                      </div>
                      {application.applicantPhone && (
                        <div className="flex items-center text-sm">
                          <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                          {application.applicantPhone}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Preferred Location
                    </Label>
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                      {getLocationName(application.locationId)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Experience Level
                    </Label>
                    <p className="text-sm">{application.experience}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Emergency Contact
                    </Label>
                    <div className="space-y-1">
                      <div className="text-sm">
                        {application.emergencyContact.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {application.emergencyContact.phone} (
                        {application.emergencyContact.relationship})
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Interests
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {application.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Goals
                    </Label>
                    <p className="text-sm">{application.goals}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Other status tabs */}
        <TabsContent value="suspended">
          <div className="text-center py-16 space-y-4">
            <Users2 className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">No Suspended Members</h3>
              <p className="text-muted-foreground">
                All members are currently in good standing.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="expired">
          <div className="text-center py-16 space-y-4">
            <Users2 className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">No Expired Memberships</h3>
              <p className="text-muted-foreground">
                All current memberships are active.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Intake Form Tab */}
        <TabsContent value="intake-form">
          <MemberIntakeFormBuilder />
        </TabsContent>
      </Tabs>
    </div>
  );
}
