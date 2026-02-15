"use client";

import { useEffect, useState } from "react";
import { cn } from "./utils";

interface PageLoadingProgressProps {
    isLoading: boolean;
    className?: string;
}

/**
 * A sleek, modern top-of-page loading progress indicator.
 * Shows an animated bar that fills and completes smoothly when loading finishes.
 */
export function PageLoadingProgress({ isLoading, className }: PageLoadingProgressProps) {
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isLoading) {
            setIsVisible(true);
            setProgress(0);

            // Simulate progress while loading (starts fast, slows down)
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) return prev;
                    const step = prev < 30 ? 8 : prev < 60 ? 4 : 2;
                    return Math.min(prev + step, 90);
                });
            }, 150);

            return () => clearInterval(interval);
        } else {
            // Complete the bar and fade out
            setProgress(100);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setProgress(0);
            }, 400);

            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    if (!isVisible) return null;

    return (
        <div
            className={cn(
                "fixed left-0 top-0 z-[100] h-0.5 w-full overflow-hidden",
                "bg-muted/30 transition-opacity duration-300",
                !isLoading && "opacity-0",
                className
            )}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Loading"
        >
            <div
                className="h-full bg-gradient-to-r from-primary via-primary/90 to-amber-600/90 transition-[width] duration-150 ease-out"
                style={{ width: `${progress}%` }}
            />
            <div
                className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent"
                style={{ width: "40%" }}
            />
        </div>
    );
}
