"use client";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardMockup } from "@/components/DashboardMockup";
import { StudioDashboard } from "@/components/StudioDashboard";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { useAppContext } from "@/app/context/AppContext";

export default function Dasbhoard() {
    const context = useAppContext();

    return (
        <RequireAuth
            fallback={
                <DefaultLayout>
                    <div className="min-h-screen flex items-center justify-center">
                        <p className="text-muted-foreground">Loading...</p>
                    </div>
                </DefaultLayout>
            }
        >
            <DefaultLayout>
                {context.currentUser?.activeMode === "studio" && context.currentStudio ? (
                    <StudioDashboard />
                ) : (
                    <DashboardMockup />
                )}
            </DefaultLayout>
        </RequireAuth>
    );
}
