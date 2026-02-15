"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/app/context/AppContext";

/**
 * Wraps protected routes. If the user is not logged in (after init), redirects to login.
 * Use for dashboard, profile, settings, invites, etc.
 */
export function RequireAuth({
    children,
    fallback = null
}: {
    children: ReactNode;
    fallback?: ReactNode;
}) {
    const router = useRouter();
    const { isInitializing, currentUser } = useAppContext();

    useEffect(() => {
        if (isInitializing) return;
        if (!currentUser) {
            router.replace("/login");
        }
    }, [isInitializing, currentUser, router]);

    if (isInitializing) {
        return fallback ?? (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    if (!currentUser) {
        return fallback ?? (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Redirecting to sign in...</p>
            </div>
        );
    }

    return <>{children}</>;
}
