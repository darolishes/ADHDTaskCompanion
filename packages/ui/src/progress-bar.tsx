import React from "react";
import { cn } from "./tailwind-merge";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  variant?: "default" | "success" | "warning" | "danger";
  showLabel?: boolean;
  labelPosition?: "inside" | "outside";
  height?: "sm" | "md" | "lg";
}

export function ProgressBar({
  value,
  max = 100,
  className,
  variant = "default",
  showLabel = false,
  labelPosition = "outside",
  height = "md"
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const variantClasses = {
    default: "bg-primary",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500"
  };
  
  const heightClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4"
  };
  
  return (
    <div className={cn("w-full", className)}>
      {showLabel && labelPosition === "outside" && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-muted-foreground">Progress</span>
          <span className="text-xs font-medium">{Math.round(percentage)}%</span>
        </div>
      )}
      
      <div className={cn("w-full bg-muted rounded-full overflow-hidden", heightClasses[height])}>
        <div
          className={cn(
            "transition-all ease-in-out duration-500 rounded-full",
            variantClasses[variant],
            heightClasses[height]
          )}
          style={{ width: `${percentage}%` }}
        >
          {showLabel && labelPosition === "inside" && height === "lg" && (
            <span className="text-xs text-white px-2">{Math.round(percentage)}%</span>
          )}
        </div>
      </div>
    </div>
  );
}