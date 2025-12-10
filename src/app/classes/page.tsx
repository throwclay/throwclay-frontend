import { useAppContext } from "@/app/context/AppContext";
import { ArtistClasses } from "@/components/ArtistClasses";
import { ClassesManagement } from "@/components/ClassesManagement";

export default function Classes() {
    const context = useAppContext();

    return context.currentUser?.activeMode === "studio" && context.currentStudio ? (
        <ClassesManagement />
    ) : (
        <ArtistClasses />
    );
}
