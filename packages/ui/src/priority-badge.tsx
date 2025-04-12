import React from "react";
import { PriorityLevel } from "@adhd/schema";
import { cn } from "./tailwind-merge";

interface PriorityBadgeProps {
  priority: PriorityLevel;
  className?: string;
}

const priorityConfig = {
  [PriorityLevel.HIGH]: {
    label: "Hohe Priorität",
    className: "bg-red-100 text-red-800 border-red-300",
    icon: "🔴" 
  },
  [PriorityLevel.MEDIUM]: {
    label: "Mittlere Priorität",
    className: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: "🟡"
  },
  [PriorityLevel.LOW]: {
    label: "Niedrige Priorität",
    className: "bg-green-100 text-green-800 border-green-300",
    icon: "🟢"
  },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
}