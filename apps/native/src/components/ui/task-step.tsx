import { cn } from "@/lib/utils";
import { TaskStep as TaskStepType } from "@/types";

interface TaskStepProps {
  step: TaskStepType;
  index: number;
  isActive: boolean;
  totalSteps: number;
  onComplete?: () => void;
}

export function TaskStep({
  step,
  index,
  isActive,
  totalSteps,
  onComplete,
}: TaskStepProps) {
  const stepStatus = step.completed
    ? "completed"
    : isActive
      ? "current"
      : "upcoming";

  return (
    <li
      className={cn("task-step", `task-step-${stepStatus}`)}
      data-step-status={stepStatus}
    >
      <div
        className={cn(
          "task-step-indicator",
          `task-step-indicator-${stepStatus}`
        )}
      >
        {step.completed ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <span className="text-xs">{index + 1}</span>
        )}
      </div>

      <p
        className={cn(
          "task-step-text",
          step.completed ? "task-step-text-completed" : "",
          isActive && !step.completed ? "task-step-text-current" : ""
        )}
      >
        {step.description}
      </p>
    </li>
  );
}
