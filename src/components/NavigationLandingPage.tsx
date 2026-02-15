import { Button } from "@/components/ui/button";
import Link from "next/link";

export function NavigationLandingPage() {
    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center space-x-3">
                        <div
                            className="w-8 h-8 bg-primary flex items-center justify-center"
                            style={{ borderRadius: "68% 32% 62% 38% / 55% 48% 52% 45%" }}
                        ></div>
                        <span className="text-xl font-bold">Throw Clay</span>
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/studios">
                            <Button variant="ghost">Find Studios</Button>
                        </Link>
                        <Link href="/ceramics">
                            <Button variant="ghost">Ceramics Marketplace</Button>
                        </Link>
                        <Link href="/login">
                            <Button variant="outline">Sign In</Button>
                        </Link>
                        <Link href="/login?mode=signup">
                            <Button>Get Started</Button>
                        </Link>
                    </div>
                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <Link href="/login">
                            <Button variant="outline">Sign In</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
