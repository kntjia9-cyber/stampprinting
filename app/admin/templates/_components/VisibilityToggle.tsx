"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toggleTemplateVisibility } from "@/app/actions/stamp-templates";

interface VisibilityToggleProps {
    templateId: string;
    initialIsPublic: boolean;
}

export default function VisibilityToggle({ templateId, initialIsPublic }: VisibilityToggleProps) {
    const [isPublic, setIsPublic] = useState(initialIsPublic);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        const newValue = !isPublic;
        setIsPublic(newValue); // Optimistic update
        setIsLoading(true);

        try {
            await toggleTemplateVisibility(templateId, newValue);
        } catch (error) {
            console.error("Failed to toggle visibility:", error);
            setIsPublic(!newValue); // Revert on error
            alert("Failed to update visibility. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isPublic
                ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                : "bg-slate-700/50 text-slate-400 hover:bg-slate-700 border border-slate-600/50"
                }`}
            title={isPublic ? "Publicly Visible" : "Hidden"}
        >
            {isLoading ? (
                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isPublic ? (
                <Eye size={14} />
            ) : (
                <EyeOff size={14} />
            )}
            {isPublic ? "Visible" : "Hidden"}
        </button>
    );
}
