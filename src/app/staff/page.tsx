"use client";

import { useEffect, useState } from "react";
import { Users, UserCog, Users2, Mail, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { EmployeeManagement } from "@/components/EmployeeManagement";
import { useAppContext } from "@/app/context/AppContext";
import type { StudioInvite } from "@/types";

import { DefaultLayout } from "@/components/layout/DefaultLayout";

export default function StaffManagement() {
    const context = useAppContext();
    const [activeTab, setActiveTab] = useState("employees");

    const [staffCount, setStaffCount] = useState(0);
    const [staffInvites, setStaffInvites] = useState<StudioInvite[]>([]);
    const [isLoadingStaffInvites, setIsLoadingStaffInvites] = useState(false);

    useEffect(() => {
        if (!context.currentStudio?.id || !context.authToken) {
            setStaffCount(0);
            return;
        }

        let cancelled = false;

        const loadStaffCount = async () => {
            try {
                const studioId = context.currentStudio?.id;
                if (!studioId) return;

                const res = await fetch(`/api/admin/studios/${studioId}/staff`, {
                    headers: {
                        Authorization: `Bearer ${context.authToken}`
                    }
                });

                if (!res.ok) {
                    if (!cancelled) setStaffCount(0);
                    return;
                }

                const body = await res.json();
                if (!cancelled) {
                    setStaffCount((body.staff ?? []).length);
                }
            } catch {
                if (!cancelled) setStaffCount(0);
            }
        };

        loadStaffCount();

        return () => {
            cancelled = true;
        };
    }, [context.currentStudio?.id, context.authToken]);

    useEffect(() => {
        if (!context.currentStudio?.id || !context.authToken) {
            setStaffInvites([]);
            return;
        }

        let cancelled = false;

        const loadStaffInvites = async () => {
            try {
                setIsLoadingStaffInvites(true);
                const studioId = context.currentStudio?.id;
                if (!studioId) return;

                const res = await fetch(`/api/studios/${studioId}/invites?status=pending`, {
                    headers: {
                        Authorization: `Bearer ${context.authToken}`
                    }
                });

                if (!res.ok) {
                    if (!cancelled) {
                        setStaffInvites([]);
                    }
                    return;
                }

                const body = await res.json();
                const invites: any[] = body.invites ?? [];
                const staffInvites = invites.filter(
                    (invite) => invite.role && invite.role !== "member"
                );

                if (!cancelled) {
                    setStaffInvites(staffInvites);
                }
            } catch {
                if (!cancelled) setStaffInvites([]);
            } finally {
                if (!cancelled) setIsLoadingStaffInvites(false);
            }
        };

        loadStaffInvites();

        return () => {
            cancelled = true;
        };
    }, [context.currentStudio?.id, context.authToken]);

    const getLocationName = (locationId?: string | null) => {
        if (!locationId) return "Unassigned";

        const fromStudio = context.currentStudio?.locations?.find((loc) => loc.id === locationId);

        return fromStudio?.name || "Unknown Location";
    };

    const getInviteStatusBadge = (status: string) => {
        console.log("getInviteStatusBadge", status);
        switch (status) {
            case "pending":
                return <Badge variant="blue">Pending</Badge>;
            case "accepted":
                return <Badge variant="secondary">Accepted</Badge>;
            case "revoked":
            case "cancelled":
                return <Badge variant="destructive">Cancelled</Badge>;
            case "expired":
                return <Badge variant="outline">Expired</Badge>;
            default:
                return (
                    <Badge
                        variant="outline"
                        className="capitalize"
                    >
                        {status}
                    </Badge>
                );
        }
    };

    return (
        <DefaultLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <UserCog className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <h1>Staff Management</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Manage employees, instructors, time cards, and payroll for your pottery
                        studio
                    </p>
                </div>

                {/* Staff Management Tabs */}
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-6"
                >
                    <TabsList className="grid w-full max-w-md grid-cols-1">
                        <TabsTrigger
                            value="employees"
                            className="flex items-center space-x-2"
                        >
                            <Users className="w-4 h-4" />
                            <span>Staff</span>
                            <Badge
                                variant="secondary"
                                className="ml-1"
                            >
                                {staffCount}
                            </Badge>
                            {staffInvites.length > 0 && (
                                <Badge
                                    variant="outline"
                                    className="ml-1 text-xs"
                                >
                                    {staffInvites.length} pending invites
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent
                        value="employees"
                        className="space-y-6"
                    >
                        <EmployeeManagement />

                        {staffInvites.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pending Staff Invites</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {isLoadingStaffInvites ? (
                                        <div className="text-sm text-muted-foreground">
                                            Loading staff invites…
                                        </div>
                                    ) : staffInvites.length === 0 ? (
                                        <div className="text-sm text-muted-foreground">
                                            No pending staff invites.
                                        </div>
                                    ) : (
                                        <div className="border rounded-lg">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Invitee</TableHead>
                                                        <TableHead>Contact</TableHead>
                                                        <TableHead>Location</TableHead>
                                                        <TableHead>Role</TableHead>
                                                        <TableHead>Invited</TableHead>
                                                        <TableHead>Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {staffInvites.map((invite) => (
                                                        <TableRow key={invite.id}>
                                                            <TableCell>
                                                                <div className="flex items-center space-x-3">
                                                                    <Users2 className="w-8 h-8 text-muted-foreground" />
                                                                    <div className="space-y-1">
                                                                        <div className="font-medium">
                                                                            {invite.name ||
                                                                                "Staff Member"}
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            {invite.email.split(
                                                                                "@"
                                                                            )[0] || "New staff"}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center text-sm">
                                                                    <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                                                                    {invite.email}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center text-sm">
                                                                    <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                                                                    {getLocationName(
                                                                        invite.location_id
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="capitalize text-sm">
                                                                {invite.role}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {invite.invited_at
                                                                        ? new Date(
                                                                              invite.invited_at
                                                                          ).toLocaleDateString(
                                                                              undefined,
                                                                              {
                                                                                  month: "short",
                                                                                  day: "numeric",
                                                                                  year: "numeric"
                                                                              }
                                                                          )
                                                                        : "—"}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                {getInviteStatusBadge(
                                                                    invite.status
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </DefaultLayout>
    );
}
