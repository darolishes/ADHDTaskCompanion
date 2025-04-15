import { useState } from "react";
import { formatTime, cn } from "@/lib/utils";
import { Task, TaskWithSteps } from "@/types";
import { TaskDetailDialog } from "@/components/modals/task-detail-dialog";
import { useQuery } from "@tanstack/react-query";

interface TaskItemProps {
  task: Task;
  onFocus: (taskId: number) => void;
  onComplete: (taskId: number) => void;
}

export function TaskItem({ task, onFocus, onComplete }: TaskItemProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch task with steps when opening details dialog
  const { data: taskWithSteps } = useQuery<TaskWithSteps>({
    queryKey: ["/api/tasks", task.id],
    enabled: showDetails,
  });

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dialog from opening
    setIsCompleting(true);

    // Visual feedback before completing
    setTimeout(() => {
      onComplete(task.id);
      setIsCompleting(false);
    }, 300);
  };

  const handleFocus = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFocus(task.id);
  };

  // Priorität als Farbe darstellen
  const priorityColor = {
    high: "bg-red-500",
    medium: "bg-amber-500",
    low: "bg-green-500",
  };

  return (
    <>
      <div
        onClick={() => setShowDetails(true)}
        className="relative group cursor-pointer"
      >
        <div className="task-container-interactive">
          <div className="flex items-center gap-4">
            <button
              onClick={handleComplete}
              className={cn(
                "task-checkbox",
                isCompleting
                  ? "task-checkbox-checked"
                  : "task-checkbox-unchecked"
              )}
              aria-label={`${task.title} als erledigt markieren`}
            >
              {isCompleting && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 text-primary-foreground"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                {/* Farbiger Prioritätsindikator */}
                <div
                  className={cn(
                    "w-2 h-2 rounded-full flex-shrink-0",
                    priorityColor[task.priority as keyof typeof priorityColor]
                  )}
                  aria-hidden="true"
                />

                <h3 className="task-title">{task.title}</h3>
              </div>

              <div className="task-metadata mt-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 mr-1 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="truncate">
                  {formatTime(task.estimatedDuration || 0)}
                </span>
              </div>
            </div>

            <button
              onClick={handleFocus}
              className="focus-btn task-action-button"
              aria-label={`Fokus auf ${task.title}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Aufgabendetails Dialog */}
      <TaskDetailDialog
        task={taskWithSteps || null}
        isOpen={showDetails}
        onOpenChange={setShowDetails}
      />
    </>
  );
}
