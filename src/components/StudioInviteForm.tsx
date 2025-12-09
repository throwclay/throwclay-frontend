// components/StudioInviteForm.tsx
"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/apis/supabaseClient";
import type { Studio } from "@/types";

interface StudioInviteFormProps {
    currentStudio: Studio;
    onInviteCreated?: (invite: any) => void; // you can type this later
}

export function StudioInviteForm({ currentStudio, onInviteCreated }: StudioInviteFormProps) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<"member" | "manager" | "admin" | "employee">("member");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInvite = async () => {
        if (!email) {
            toast.error("Please enter an email");
            return;
        }

        setIsSubmitting(true);

        try {
            const {
                data: { session }
            } = await supabase.auth.getSession();

            if (!session) {
                toast.error("You must be logged in to send invites");
                setIsSubmitting(false);
                return;
            }

            const res = await fetch(`/api/studios/${currentStudio.id}/invites`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ email, role })
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                console.error("Invite error", err);
                toast.error(err.error || "Failed to send invite");
                setIsSubmitting(false);
                return;
            }

            const data = await res.json();
            toast.success("Invite sent!");

            if (onInviteCreated && data.invite) {
                onInviteCreated(data.invite);
            }

            setEmail("");
        } catch (e) {
            console.error("Invite error", e);
            toast.error("Something went wrong sending the invite");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="invite-email">Invite by email</Label>
                <Input
                    id="invite-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="artist@example.com"
                />
            </div>

            <div>
                <Label>Role</Label>
                <Select
                    value={role}
                    onValueChange={(value) => setRole(value as any)}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="instructor">Instructor</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Button
                onClick={handleInvite}
                disabled={isSubmitting || !email}
                className="w-full"
            >
                {isSubmitting ? "Sending..." : "Send Invite"}
            </Button>
        </div>
    );
}
