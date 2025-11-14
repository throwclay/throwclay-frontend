import type { Metadata } from "next";
import { AppProvider } from "./context/AppContext";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { Navigation } from "@/components/Navigation";
import clsx from "clsx";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Throw Clay - Pottery Studio Management Platform",
    description:
        "A comprehensive pottery studio management platform with soft earth tones and minimalist design.",
};

export default function RootLayout(props: React.PropsWithChildren) {
    return (
        <html lang="en">
            <body className={clsx(inter.className, "flex flex-col min-h-screen")}>
                <AppProvider>
                    <Navigation />
                    {props.children}
                </AppProvider>
            </body>
        </html>
    );
}
