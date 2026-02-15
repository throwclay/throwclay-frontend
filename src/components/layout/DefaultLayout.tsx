import { MudlyOverlay } from "@/components/mudly/MudlyOverlay";
import { NavigationLandingPage } from "@/components/NavigationLandingPage";
import { NavigationPrimary } from "@/components/NavigationPrimary";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ComponentPropsWithoutRef } from "react";

const navigationMap = {
    landingPage: NavigationLandingPage,
    primary: NavigationPrimary
} satisfies Record<string, React.ComponentType>;

type LayoutProps = ComponentPropsWithoutRef<"div"> & {
    headerType?: keyof typeof navigationMap;
};

export function DefaultLayout(props: LayoutProps) {
    const { headerType = "primary", ...rest } = props;
    const NavigationComponent = navigationMap[headerType];

    return (
        <div {...rest}>
            {/* Header */}
            <NavigationComponent />

            {/* Footer */}
            <main>{props.children}</main>

            {/* Footer */}
            <footer className="bg-muted/50 py-12 border-t">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div
                                    className="w-8 h-8 bg-primary flex items-center justify-center"
                                    style={{ borderRadius: "68% 32% 62% 38% / 55% 48% 52% 45%" }}
                                ></div>
                                <span className="text-xl font-bold">Throw Clay</span>
                            </div>
                            <p className="text-muted-foreground">
                                The complete platform for pottery studios and ceramic artists.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <Link href="/studios">
                                        <Button
                                            variant="link"
                                            className="p-0 h-auto"
                                        >
                                            Find Studios
                                        </Button>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/ceramics">
                                        <Button
                                            variant="link"
                                            className="p-0 h-auto"
                                        >
                                            Ceramics Marketplace
                                        </Button>
                                    </Link>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-foreground"
                                    >
                                        Mobile App
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-foreground"
                                    >
                                        API
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-foreground"
                                    >
                                        About
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-foreground"
                                    >
                                        Blog
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-foreground"
                                    >
                                        Careers
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-foreground"
                                    >
                                        Contact
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Support</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-foreground"
                                    >
                                        Help Center
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-foreground"
                                    >
                                        Privacy Policy
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-foreground"
                                    >
                                        Terms of Service
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-foreground"
                                    >
                                        Status
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
                        <p>&copy; 2024 Throw Clay. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            {/* Mudly AI overlay: bottom-right when logged in (artist or studio mode) */}
            <MudlyOverlay />
        </div>
    );
}
