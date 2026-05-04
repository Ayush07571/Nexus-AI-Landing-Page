"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AIToggleProps {
  aiMode: boolean;
  onToggle: () => void;
  className?: string;
}

export function AIToggle({ aiMode, onToggle, className }: AIToggleProps) {
  return (
    <div className={cn("relative group inline-block", className)}>
      <Button
        type="button"
        variant={aiMode ? "default" : "outline"}
        size="sm"
        onClick={onToggle}
        className={cn(
          "gap-2 transition-all duration-300 rounded-xl",
          aiMode 
            ? "bg-linear-to-r from-blue-600 to-purple-600 border-none text-white shadow-lg shadow-blue-500/25" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Sparkles className={cn("w-4 h-4", aiMode && "animate-pulse")} />
        <span className="font-semibold">
          {aiMode ? "AI Mode ON" : "AI Mode"}
        </span>
      </Button>
      
      {/* Subtle Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-[10px] rounded border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-sm">
        Toggle AI content generation
      </div>
    </div>
  );
}
