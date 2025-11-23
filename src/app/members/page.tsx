"use client"

"use client";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAppContext } from "@/app/context/AppContext";

import type {
  MembershipApplication,
  MemberData,
  PaymentInvoice,
  StudioInvite,
  InviteRole,
} from "@/types";

import { MemberIntakeFormBuilder } from "@/components/MemberIntakeFormBuilder";
import { toast } from "sonner";

export default function MemberManagement() {
  const [activeTab, setActiveTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  // Members
  const [members, setMembers] = useState<MemberData[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);

  // applications state
  const [applications, setApplications] = useState<MembershipApplication[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const [applicationsError, setApplicationsError] = useState<string | null>(
    null
  );

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

  const context = useAppContext();

  // Guard: only studios should see this
  if (!context.currentStudio) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">Member Management</h1>
        <p className="text-muted-foreground">
          Select a studio to manage members.
        </p>
      </div>
    );
  }

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

    const fromStudio = context.currentStudio?.locations?.find(
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

  // --- API: fetch invites (studio-level only) ---
  const fetchInvites = async () => {
    if (!context.authToken) {
      setInvitesError("You must be logged in to view invites.");
      setInvites([]);
      return;
    }
    if (!context.currentStudio) {
      setInvitesError("No studio selected.");
      setInvites([]);
      return;
    }

    try {
      setIsLoadingInvites(true);
      setInvitesError(null);

      const res = await fetch(
        `/api/studios/${context.currentStudio?.id}/invites?status=pending`,
        {
          headers: {
            Authorization: `Bearer ${context.authToken}`,
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
      setInvites((body.invites || []) as StudioInvite[]); // local studio-level table
    } catch (err) {
      console.error("Error fetching invites", err);
      setInvitesError("Failed to load invites");
      setInvites([]);
    } finally {
      setIsLoadingInvites(false);
    }
  };

  // --API: fetch members --
  const fetchMembers = async () => {
    if (!context.authToken || !context.currentStudio?.id) {
      setMembers([]);
      return;
    }

    try {
      setIsLoadingMembers(true);
      setMembersError(null);

      const res = await fetch(
        `/api/studios/${context.currentStudio?.id}/members`,
        {
          headers: {
            Authorization: `Bearer ${context.authToken}`,
          },
        }
      );

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
            lastActivity: profile.last_login,
          },
          invoices: [],
          classHistory: [],
          eventHistory: [],
        };
      });

      setMembers(mapped);
      setIsLoadingMembers(false);
    } catch (err) {
      console.error("Error fetching members", err);
      setMembersError("Failed to load invites");
      setMembers([]);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // --- API: fetch membership applications (studio-level) ---
  const fetchApplications = async () => {
    if (!context.authToken || !context.currentStudio?.id) {
      setApplications([]);
      return;
    }

    try {
      setIsLoadingApplications(true);
      setApplicationsError(null);

      const res = await fetch(
        `/api/studios/${context.currentStudio.id}/applications?status=pending`,
        {
          headers: {
            Authorization: `Bearer ${context.authToken}`,
          },
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("Error fetching applications", body);
        setApplicationsError(body.error || "Failed to load applications");
        setApplications([]);
        return;
      }

      const body = await res.json();

      // 🔑 Map DB rows -> MembershipApplication type
      const mapped: MembershipApplication[] = (body.applications || []).map(
        (row: any) => {
          const profile = row.profiles ?? {};

          return {
            id: row.id,
            studioId: row.studio_id,
            locationId: row.location_id,
            membershipType: row.requested_membership_type,

            submittedAt: row.submitted_at,

            // normalizing our experience
            // if we're storing a string like "beginner", this still works:
            experience: row.experience,

            interests: row.interests || [],
            goals: row.goals || [],
            referralSource: row.referral_source || null,
            emergencyContact: row.emergency_contact || null,
            customFields: row.custom_fields || {},

            status: row.status,

            // This is what our UI uses... may rethink this later
            applicantName: profile.name ?? "(No name)",
            applicantEmail: profile.email ?? "",
            applicantPhone: profile.phone ?? null,
            applicantHandle: profile.handle ?? null,
          };
        }
      );

      setApplications(mapped);
    } catch (err) {
      console.error("Error fetching applications", err);
      setApplicationsError("Failed to load applications");
      setApplications([]);
    } finally {
      setIsLoadingApplications(false);
    }
  };

  // --- API: send invite ---
  const handleSendInvite = async () => {
    if (!context.currentStudio) {
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

    if (!context.authToken) {
      toast.error("You must be logged in to send invites.");
      return;
    }

    setIsInviting(true);
    try {
      const res = await fetch(
        `/api/studios/${context.currentStudio?.id}/invites`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${context.authToken}`,
          },
          body: JSON.stringify({
            email: inviteEmail,
            role: inviteRole, // DB expects: member | employee | manager | co-admin
            locationId: inviteLocationId,
            membershipType: inviteMembershipType,
          }),
        }
      );

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

  const handleApplicationDecision = async (
    applicationId: string,
    decision: "approve" | "reject"
  ) => {
    if (!context.currentStudio?.id) {
      toast.error("No studio selected");
      return;
    }
    if (!context.authToken) {
      toast.error("You must be logged in to manage applications.");
      return;
    }

    try {
      const res = await fetch(
        `/api/studios/${context.currentStudio?.id}/applications/${applicationId}/decision`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${context.authToken}`,
          },
          body: JSON.stringify({ decision }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Application decision error", err);
        toast.error(err.error || "Failed to update application");
        return;
      }

      toast.success(
        decision === "approve"
          ? "Application approved and member added."
          : "Application rejected."
      );

      // Refresh lists
      await fetchApplications();
      if (decision === "approve") {
        await fetchMembers();
      }
    } catch (e) {
      console.error("Application decision error", e);
      toast.error("Something went wrong updating the application");
    }
  };

  useEffect(() => {
    if (!context.currentStudio?.id) {
      setMembers([]);
      return;
    }

    fetchMembers();
  }, [context.currentStudio?.id]);

  useEffect(() => {
    console.log("Members updated:", members.length, members);
  }, [members]);

  const studioLocations = context.currentStudio?.locations ?? [];

  useEffect(() => {
    const studioLocations = context.currentStudio?.locations ?? [];
    if (!inviteLocationId && studioLocations.length > 0) {
      setInviteLocationId(studioLocations[0].id);
    }
  }, [context.currentStudio?.locations, inviteLocationId, setInviteLocationId]);

  // load invites
  useEffect(() => {
    if (!context.currentStudio?.id || !context.authToken) {
      setInvites([]);
      return;
    }
    fetchInvites();
  }, [context.currentStudio?.id, context.authToken]);

  // load applications
  useEffect(() => {
    if (!context.currentStudio?.id || !context.authToken) {
      setApplications([]);
      return;
    }
    fetchApplications();
  }, [context.currentStudio?.id, context.authToken]);

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
                  <span className="font-medium">
                    @{context.currentStudio?.handle}
                  </span>
                  . They&apos;ll be added as a member after accepting.
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
              {invites.length > 0 && (
                <Badge variant="destructive" className="ml-2">
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

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Active Members</h2>
              {/* <p className="text-sm text-muted-foreground">
                These invites haven&apos;t been accepted yet.
              </p> */}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMembers}
              disabled={isLoadingMembers}
            >
              Refresh
            </Button>
          </div>

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
                  <TableHead>Member Since</TableHead>
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
                        {getMembershipStatusBadge(
                          member.membership.status ?? "inactive"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {member.membership.startDate
                            ? new Date(
                                member.membership.startDate
                              ).toLocaleDateString()
                            : "Never"}
                        </div>
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
        <TabsContent value="pending" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Pending Applications</h2>
              <p className="text-sm text-muted-foreground">
                Review and approve new member applications for this studio.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchApplications}
              disabled={isLoadingApplications}
            >
              Refresh
            </Button>
          </div>

          {isLoadingApplications ? (
            <div className="border rounded-lg p-6 text-center text-muted-foreground">
              Loading applications…
            </div>
          ) : applicationsError ? (
            <div className="border rounded-lg p-6 text-center text-sm text-red-500">
              {applicationsError}
            </div>
          ) : applications.length === 0 ? (
            <div className="border rounded-lg p-10 text-center space-y-2">
              <p className="font-medium">No pending applications</p>
              <p className="text-sm text-muted-foreground">
                When artists apply to join your studio, their applications will
                appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <Card key={application.id} className="border rounded-lg">
                  <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">
                        {application.applicantName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        @{application.applicantHandle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Applied{" "}
                        {new Date(application.submittedAt).toLocaleDateString()}{" "}
                        • {application.membershipType || "membership"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleApplicationDecision(application.id, "reject")
                        }
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          handleApplicationDecision(application.id, "approve")
                        }
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Core details grid */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      {/* Contact Info */}
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                          Contact Information
                        </Label>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                            {application.applicantEmail}
                          </div>
                          {application.applicantPhone && (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                              {application.applicantPhone}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Preferred Location */}
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                          Preferred Location
                        </Label>
                        <div className="flex items-center text-sm">
                          <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                          {getLocationName(application.locationId || undefined)}
                        </div>
                      </div>

                      {/* Experience Level */}
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                          Experience Level
                        </Label>
                        <p className="text-sm">
                          {typeof application.experience === "string"
                            ? application.experience
                            : !application.experience
                            ? "Not specified"
                            : application.experience}
                        </p>
                      </div>

                      {/* Emergency Contact */}
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                          Emergency Contact
                        </Label>
                        <div className="space-y-1 text-sm">
                          <div>
                            {application.emergencyContact?.name ||
                              "Not provided"}
                          </div>
                          {application.emergencyContact?.phone && (
                            <div className="text-muted-foreground">
                              {application.emergencyContact.phone}
                              {application.emergencyContact.relationship
                                ? ` (${application.emergencyContact.relationship})`
                                : ""}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Additional details */}
                    <div className="border-t pt-4 space-y-4">
                      {application.interests &&
                        application.interests.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
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
                        )}

                      {application.goals && (
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                            Goals
                          </Label>
                          <p className="text-sm">{application.goals}</p>
                        </div>
                      )}

                      {application.notes && (
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                            Notes
                          </Label>
                          <p className="text-sm whitespace-pre-line">
                            {application.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
