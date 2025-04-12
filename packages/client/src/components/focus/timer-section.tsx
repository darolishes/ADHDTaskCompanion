
import { Timer } from '@/components/ui/timer';

interface TimerSectionProps {
  stepDuration: number;
  stepDescription: string;
}

export function TimerSection({ stepDuration, stepDescription }: TimerSectionProps) {
  return (
    <div className="mb-4">
      <Timer initialMinutes={stepDuration} />
      <div className="mb-4 p-3 bg-neutral-100 rounded-lg">
        <p className="text-sm text-gray-500 mb-1">Current Step:</p>
        <p className="font-medium">{stepDescription || "All steps completed"}</p>
      </div>
    </div>
  );
}
