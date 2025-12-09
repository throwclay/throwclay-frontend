import { AppProvider } from "@/app/context/AppContext";
import Navigation from "@/components/Navigation";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Throw Clay - Pottery Studio Management Platform",
    description:
        "A comprehensive pottery studio management platform with soft earth tones and minimalist design."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AppProvider>
                    <Navigation />
                    {children}
                    <Toaster richColors position="top-center" />
                </AppProvider>
            </body>
        </html>
    );
}
