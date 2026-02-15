"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/app/context/AppContext";

/**
 * Wraps the landing page. If the user has an active session, redirects to app home
 * (dashboard or profile) so logged-in users don't see the marketing page.
 */
export function LandingRedirectGuard({ children }: { children: ReactNode }) {
    const router = useRouter();
    const { isInitializing, currentUser } = useAppContext();

    useEffect(() => {
        if (isInitializing) return;
        if (currentUser) {
            const destination =
                currentUser.activeMode === "studio" ? "/dashboard" : "/profile";
            router.replace(destination);
        }
    }, [isInitializing, currentUser, router]);

    if (!isInitializing && currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    return <>{children}</>;
}
