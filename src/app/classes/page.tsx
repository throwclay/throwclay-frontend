import { useAppContext } from "@/app/context/AppContext";
import { ArtistClasses } from "@/components/ArtistClasses";
import { ClassesManagement } from "@/components/ClassesManagement";

import { DefaultLayout } from "@/components/layout/DefaultLayout";

export default function Classes() {
    const context = useAppContext();

    return (
        <DefaultLayout>
            {context.currentUser?.activeMode === "studio" && context.currentStudio ? (
                <ClassesManagement />
            ) : (
                <ArtistClasses />
            )}
        </DefaultLayout>
    );
}
