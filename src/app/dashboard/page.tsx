"use client";

import { DashboardMockup } from "@/components/DashboardMockup";
import { StudioDashboard } from "@/components/StudioDashboard";

import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { useAppContext } from "@/app/context/AppContext";

export default function Dasbhoard() {
    const context = useAppContext();

    return (
        <DefaultLayout>
            {context.currentUser?.activeMode === "studio" && context.currentStudio ? (
                <StudioDashboard />
            ) : (
                <DashboardMockup />
            )}
        </DefaultLayout>
    );
}
