// lib/server/studios.ts

import { supabaseAdmin } from "@/lib/apis/supabaseAdmin";
import type { StudioMembership, StudioRole, MembershipStatus, MembershipType } from "@/types";

export async function getMembershipsForUser(userId: string) {
    const { data, error } = await supabaseAdmin
        .from("studio_memberships")
        .select(
            `
      id,
      user_id,
      studio_id,
      role,
      status,
      location_id,
      membership_type,
      created_at,
      updated_at,
      studios:studio_id (
        id,
        name,
        handle,
        email,
        is_active,
        plan,
        created_at
      ),
      locations:location_id (
        id,
        name
      )
    `
        )
        .eq("user_id", userId);

    if (error) {
        throw new Error(`getMembershipsForUser error: ${error.message}`);
    }

    const memberships = (data ?? []).map(
        (
            row: any
        ): StudioMembership & {
            role?: StudioRole;
            studioName?: string;
            studioHandle?: string;
            locationName?: string | null;
        } => ({
            id: row.id,
            userId: row.user_id,
            studioId: row.studio_id,
            locationId: row.location_id,
            membershipType: row.membership_type as MembershipType | null,
            status: row.status as MembershipStatus,
            startDate: row.created_at,
            lastActivity: null,
            createdAt: row.created_at,
            updatedAt: row.updated_at ?? row.created_at,
            shelfNumber: null,
            monthlyRate: null,
            passionProjectsUpgrade: null,
            role: row.role as StudioRole,
            studioName: row.studios?.name ?? undefined,
            studioHandle: row.studios?.handle ?? undefined,
            locationName: row.locations?.name ?? null
        })
    );

    return memberships;
}

export async function assertStudioAdmin(userId: string, studioId: string) {
    const { data, error } = await supabaseAdmin
        .from("studio_memberships")
        .select("role")
        .eq("studio_id", studioId)
        .eq("user_id", userId)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

    if (error || !data) {
        throw new Error("Not authorized for this studio");
    }

    const allowedRoles: StudioRole[] = ["owner", "admin"];
    if (!allowedRoles.includes(data.role as StudioRole)) {
        throw new Error("Insufficient permissions");
    }

    return data.role as StudioRole;
}
