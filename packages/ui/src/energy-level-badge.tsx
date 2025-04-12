import React from "react";
import { EnergyLevel } from "@adhd/schema";
import { cn } from "./tailwind-merge";

interface EnergyLevelBadgeProps {
  level: EnergyLevel | null;
  className?: string;
}

const energyLevelConfig = {
  [EnergyLevel.HIGH]: {
    label: "Hohe Energie",
    className: "bg-indigo-100 text-indigo-800 border-indigo-300",
    icon: "⚡️" 
  },
  [EnergyLevel.MEDIUM]: {
    label: "Mittlere Energie",
    className: "bg-blue-100 text-blue-800 border-blue-300",
    icon: "⚙️"
  },
  [EnergyLevel.LOW]: {
    label: "Niedrige Energie",
    className: "bg-teal-100 text-teal-800 border-teal-300",
    icon: "🧘"
  },
};

export function EnergyLevelBadge({ level, className }: EnergyLevelBadgeProps) {
  if (!level) return null;

  const config = energyLevelConfig[level];
  
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