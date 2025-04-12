import React from "react";
import { motion } from "framer-motion";
import { MoreVertical, Clock, Zap } from "lucide-react";
import { TaskCheckbox } from "./task-checkbox";

export interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date | string;
  energyLevel?: "low" | "medium" | "high";
  completed?: boolean;
  onToggleComplete?: (id: string, completed: boolean) => void;
  onEdit?: (id: string) => void;
}

export function TaskCard({
  id,
  title,
  description,
  dueDate,
  energyLevel = "medium",
  completed = false,
  onToggleComplete,
  onEdit,
}: TaskCardProps) {
  const formattedDate = dueDate
    ? typeof dueDate === "string"
      ? dueDate
      : dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;

  const energyColors = {
    low: "bg-blue-100 text-blue-700",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-red-100 text-red-700",
  };

  const handleToggleComplete = (checked: boolean) => {
    if (onToggleComplete) {
      onToggleComplete(id, checked);
    }
  };

  return (
    <motion.div
      className={`
        group relative rounded-lg border border-border bg-card p-4 shadow-sm
        hover:shadow-md transition-all duration-200
        sm:p-5
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <div className="flex items-start gap-3">
        <TaskCheckbox checked={completed} onChange={handleToggleComplete} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h3
              className={`font-medium text-foreground ${completed ? "line-through text-muted-foreground" : ""}`}
            >
              {title}
            </h3>

            <button
              className="p-1 -mt-1 -mr-1 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-muted"
              onClick={() => onEdit && onEdit(id)}
            >
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {description && (
            <p
              className={`mt-1 text-sm ${completed ? "line-through text-muted-foreground" : "text-muted-foreground"}`}
            >
              {description}
            </p>
          )}

          <div className="flex flex-wrap items-center mt-2 gap-2">
            {energyLevel && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${energyColors[energyLevel]}`}
              >
                <Zap className="h-3 w-3 mr-1" />
                {energyLevel.charAt(0).toUpperCase() +
                  energyLevel.slice(1)}{" "}
                energy
              </span>
            )}

            {formattedDate && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {formattedDate}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
