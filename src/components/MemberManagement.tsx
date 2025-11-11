"user client";

import { useState, useEffect } from "react";
import {
  Search,
  Download,
  DollarSign,
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

import { useAppContext } from "@/app/context/AppContext";

import type {
  User as UserType,
  StudioMembership,
  MembershipApplication,
  PaymentInvoice,
} from "@/types";

import { MemberIntakeFormBuilder } from "./MemberIntakeFormBuilder";
import { supabase as supabaseClient } from "@/lib/apis/supabaseClient";
import { toast } from "sonner";

interface MemberData extends UserType {
  membership: StudioMembership;
  invoices: PaymentInvoice[];
  classHistory: any[];
  eventHistory: any[];
}

interface StudioInvite {
  id: string;
  email: string;
  role: string;
  status: string;
  invited_at: string;
  location_id: string | null;
  membership_type: string | null;
}

type InviteRole = "member" | "employee" | "manager" | "admin";

export function MemberManagement() {
  const [activeTab, setActiveTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  // Members
  const [members, setMembers] = useState<MemberData[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<InviteRole>("member");
  const [inviteLocationId, setInviteLocationId] = useState<string | "">("");
  const [inviteMembershipType, setInviteMembershipType] = useState<
    "basic" | "premium" | "unlimited"
  >("basic");
  const [isInviting, setIsInviting] = useState(false);

  const [invites, setInvites] = useState<StudioInvite[]>([]);
  const [isLoadingInvites, setIsLoadingInvites] = useState(false);
  const [invitesError, setInvitesError] = useState<string | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const { authToken, currentUser, currentStudio, setPendingInvites } =
    useAppContext();

  // Guard: only studios should see this
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

  // Mock pending applications
  const [applications] = useState<MembershipApplication[]>([
    {
      id: "app1",
      applicantName: "Emma Thompson",
      applicantEmail: "emma.t@email.com",
      applicantPhone: "(503) 555-0200",
      studioId: currentStudio.id || "",
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
      studioId: currentStudio.id || "",
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

    // const matchesStatus =
    //   activeTab === "all" || member.membership.status === activeTab;

    return matchesSearch && matchesLocation; // && matchesStatus;
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

  const getLocationName = (locationId?: string | null) => {
    if (!locationId) return "Unassigned";

    const fromStudio = currentStudio.locations?.find(
      (loc) => loc.id === locationId
    );

    return fromStudio?.name || "Unknown Location";
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

  // --- API: fetch invites ---
  const fetchInvites = async () => {
    if (!authToken) {
      setInvitesError("You must be logged in to view invites.");
      setInvites([]);
      return;
    }

    try {
      setIsLoadingInvites(true);
      setInvitesError(null);

      const res = await fetch(
        `/api/studios/${currentStudio.id}/invites?status=pending`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setInvitesError(body.error || "Failed to load invites");
        setInvites([]);
        return;
      }

      const body = await res.json();
      setInvites(body.invites || []);
      setPendingInvites(body.invites || []);
    } catch (err) {
      console.error("Error fetching invites", err);
      setInvitesError("Failed to load invites");
      setInvites([]);
    } finally {
      setIsLoadingInvites(false);
    }
  };

  // --- API: send invite ---
  const handleSendInvite = async () => {
    if (!currentStudio) {
      toast.error("No studio selected");
      return;
    }

    if (!inviteEmail) {
      toast.error("Please enter an email");
      return;
    }

    if (!inviteLocationId) {
      toast.error("Location is required");
      return;
    }

    if (!authToken) {
      toast.error("You must be logged in to send invites.");
      return;
    }

    setIsInviting(true);
    try {
      const res = await fetch(`/api/studios/${currentStudio.id}/invites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole, // DB expects: member | employee | manager | co-admin
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

      // ✅ auto-close the dialog on success
      setInviteDialogOpen(false);

      // Refresh pending invites list
      fetchInvites();
    } catch (e) {
      console.error("Invite error", e);
      toast.error("Something went wrong sending the invite");
    } finally {
      setIsInviting(false);
    }
  };

  useEffect(() => {
    if (!currentStudio?.id) {
      setMembers([]);
      return;
    }

    const loadMembers = async () => {
      if (!authToken || !currentStudio?.id) {
        setMembers([]);
        return;
      }

      setIsLoadingMembers(true);
      setMembersError(null);

      const res = await fetch(`/api/studios/${currentStudio.id}/members`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("Error fetching members", body);
        setMembersError(body.error || "Failed to load members");
        setMembers([]);
        setIsLoadingMembers(false);
        return;
      }

      const body = await res.json();

      const mapped: MemberData[] = (body.members || []).map((row: any) => {
        const profile = row.profiles ?? {};
        const membershipType =
          (row.membership_type as "basic" | "premium" | "unlimited") || "basic";

        return {
          id: profile.id ?? row.user_id,
          name: profile.name ?? "Member",
          email: profile.email ?? "",
          handle: profile.handle ?? "",
          type: "artist",
          studioId: row.studio_id,
          phone: profile.phone ?? "",
          subscription: "free",
          role: row.role ?? "member",
          createdAt: row.created_at,
          isActive: profile.is_active ?? true,
          membership: {
            id: row.id,
            userId: row.user_id,
            studioId: row.studio_id,
            locationId: row.location_id,
            membershipType,
            status: row.status ?? "active",
            startDate: row.created_at,
            shelfNumber: null,
            monthlyRate:
              membershipType === "basic"
                ? 85
                : membershipType === "premium"
                ? 125
                : 185,
            passionProjectsUpgrade: false,
            passionProjectsRate: 0,
            joinedAt: row.created_at,
            lastActivity: null,
          },
          invoices: [],
          classHistory: [],
          eventHistory: [],
        };
      });

      setMembers(mapped);
      setIsLoadingMembers(false);
    };

    loadMembers();
  }, [currentStudio?.id]);

  useEffect(() => {
    console.log("Members updated:", members.length, members);
  }, [members]);

  const studioLocations = currentStudio.locations ?? [];

  useEffect(() => {
    const studioLocations = currentStudio.locations ?? [];
    if (!inviteLocationId && studioLocations.length > 0) {
      setInviteLocationId(studioLocations[0].id);
    }
  }, [currentStudio.locations, inviteLocationId, setInviteLocationId]);

  useEffect(() => {
    if (!currentStudio?.id || !authToken) {
      setInvites([]);
      return;
    }
    fetchInvites();
  }, [currentStudio?.id, authToken]);

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

          {/* Invite dialog */}
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
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
                  They&apos;ll be added as a member after accepting.
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
                      setInviteRole(value as InviteRole)
                    }
                  >
                    <SelectTrigger id="inviteRole">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
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
                    disabled={studioLocations.length === 0}
                  >
                    <SelectTrigger id="inviteLocation">
                      <SelectValue
                        placeholder={
                          studioLocations.length === 0
                            ? "No locations available"
                            : "Select location"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {studioLocations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name}
                          {loc.city && loc.state
                            ? ` – ${loc.city}, ${loc.state}`
                            : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Location is required. The member will be associated with +
                    this studio location when they accept.
                  </p>
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
            {/* <TabsTrigger value="pending">
              Pending Applications
              {applications.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {applications.length}
                </Badge>
              )}
            </TabsTrigger> */}
            <TabsTrigger value="invites">
              Pending Invites
              {invites.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {invites.length}
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
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {studioLocations?.map((location) => (
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
                {isLoadingMembers ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      Loading members…
                    </TableCell>
                  </TableRow>
                ) : filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No members found for this studio.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
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
                  ))
                )}
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

        {/* Pending Invites */}
        <TabsContent value="invites" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Pending Invites</h2>
              <p className="text-sm text-muted-foreground">
                These invites haven&apos;t been accepted yet.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchInvites}
              disabled={isLoadingInvites}
            >
              Refresh
            </Button>
          </div>

          {isLoadingInvites ? (
            <div className="border rounded-lg p-6 text-center text-muted-foreground">
              Loading invites…
            </div>
          ) : invitesError ? (
            <div className="border rounded-lg p-6 text-center text-red-500 text-sm">
              {invitesError}
            </div>
          ) : invites.length === 0 ? (
            <div className="border rounded-lg p-10 text-center space-y-2">
              <p className="font-medium">No pending invites</p>
              <p className="text-sm text-muted-foreground">
                Send an invite from the Member Management header to add new
                members.
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Membership</TableHead>
                    <TableHead>Invited At</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invites.map((invite) => (
                    <TableRow key={invite.id}>
                      <TableCell>{invite.email}</TableCell>
                      <TableCell className="capitalize">
                        {invite.role}
                      </TableCell>
                      <TableCell>
                        {getLocationName(invite.location_id)}
                      </TableCell>
                      <TableCell className="capitalize">
                        {invite.membership_type || "—"}
                      </TableCell>
                      <TableCell>
                        {invite.invited_at
                          ? new Date(invite.invited_at).toLocaleString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {invite.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
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
