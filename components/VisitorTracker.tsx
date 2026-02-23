"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function VisitorTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // Generate or get unique visitor ID
        let visitorId = localStorage.getItem("visitor_id");
        if (!visitorId) {
            visitorId = "vis_" + Math.random().toString(36).substring(2, 11);
            localStorage.setItem("visitor_id", visitorId);
        }

        const logVisit = async () => {
            try {
                await fetch("/api/visits/log", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        visitorId,
                        path: pathname,
                    }),
                });
            } catch (error) {
                // Silently fail as tracking shouldn't break the UI
                console.error("Failed to log visit");
            }
        };

        logVisit();
    }, [pathname]);

    return null; // This component doesn't render anything
}
