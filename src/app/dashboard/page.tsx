import { useAppContext } from "@/app/context/AppContext";
import { DashboardMockup } from "@/components/DashboardMockup";
import { StudioDashboard } from "@/components/StudioDashboard";

export default function Dasbhoard() {
    const context = useAppContext();

    return context.currentUser?.activeMode === "studio" && context.currentStudio ? (
        <StudioDashboard />
    ) : (
        <DashboardMockup />
    );
}
