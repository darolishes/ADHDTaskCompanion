
interface ProgressSectionProps {
  completedSteps: number;
  totalSteps: number;
}

export function ProgressSection({ completedSteps, totalSteps }: ProgressSectionProps) {
  const progressPercentage = (completedSteps / totalSteps) * 100;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm text-gray-500 mb-1">
        <span>Progress</span>
        <span>{completedSteps}/{totalSteps} steps</span>
      </div>
      <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-secondary rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}
