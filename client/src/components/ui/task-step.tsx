import { cn } from '@/lib/utils';
import { TaskStep as TaskStepType } from '@/types';

interface TaskStepProps {
  step: TaskStepType;
  index: number;
  isActive: boolean;
  totalSteps: number;
  onComplete?: () => void;
}

export function TaskStep({ step, index, isActive, totalSteps, onComplete }: TaskStepProps) {
  const stepStatus = step.completed 
    ? 'completed' 
    : isActive 
      ? 'current' 
      : 'upcoming';
      
  return (
    <li 
      className={cn(
        "flex items-center p-2 rounded-lg transition-all",
        stepStatus === 'completed' ? "text-gray-400" : "",
        stepStatus === 'current' ? "text-gray-900" : "",
        stepStatus === 'upcoming' ? "text-gray-500" : ""
      )}
      data-step-status={stepStatus}
    >
      <div 
        className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center mr-3",
          stepStatus === 'completed' 
            ? "bg-primary border-0 text-white" 
            : stepStatus === 'current'
              ? "border-2 border-primary" 
              : "border-2 border-gray-300"
        )}
      >
        {step.completed ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <span className="text-xs">{index + 1}</span>
        )}
      </div>
      
      <p className={cn(
        "text-sm flex-1", 
        step.completed ? "line-through text-gray-400" : "",
        isActive && !step.completed ? "font-medium" : ""
      )}>
        {step.description}
      </p>
    </li>
  );
}
