import type { Metadata } from "next";
import { AppProvider } from "./context/AppContext";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { Toaster } from "@/components/ui/sonner";

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
                    {children}{" "}
                    <Toaster
                        richColors
                        position="top-center"
                    />
                </AppProvider>
            </body>
        </html>
    );
}
