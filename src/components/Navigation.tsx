"use client";

import { usePathname } from "next/navigation";
import { NavigationDashboard } from "./NavigationDashboard";
import NavigationLandpage from "./NavigationLandpage";

const menuVariantMap = {
    "landing-page": <NavigationLandpage />,
    dashboard: <NavigationDashboard />
};

export default function Navigation() {
    const pathname = usePathname();
    const key = pathname === "/" ? "landing-page" : "dashboard";

    return menuVariantMap[key];
}
