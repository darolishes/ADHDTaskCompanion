import { useState, useEffect } from "react";
import { TaskStep } from "@/components/ui/task-step";
import { TaskCompletedModal } from "@/components/modals/task-completed-modal";
import { TimerSection } from "@/components/focus/timer-section";
import { ProgressSection } from "@/components/focus/progress-section";
import { ActionButtons } from "@/components/focus/action-buttons";
import { TaskWithSteps, ModalState } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TaskFocusViewProps {
  task: TaskWithSteps;
  onBack: () => void;
}

export function TaskFocusView({ task, onBack }: TaskFocusViewProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    stepCompleted: false,
    taskCompleted: false,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const firstIncompleteIndex = task.steps.findIndex(
      (step) => !step.completed
    );
    setCurrentStepIndex(firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0);
  }, [task.steps]);

  const totalSteps = task.steps.length;
  const currentStep = task.steps[currentStepIndex];
  const isLastStep = currentStepIndex === totalSteps - 1;
  const allStepsCompleted = task.steps.every((step) => step.completed);
  const completedSteps = task.steps.filter((step) => step.completed).length;

  const completeCurrentStep = async () => {
    if (!currentStep) return;

    try {
      await apiRequest("PATCH", `/api/task-steps/${currentStep.id}`, {
        completed: true,
      });

      const allCompleted =
        isLastStep &&
        task.steps.slice(0, currentStepIndex).every((step) => step.completed);

      setModalState({
        isOpen: true,
        stepCompleted: true,
        taskCompleted: allCompleted,
      });

      if (allCompleted) {
        await apiRequest("PATCH", `/api/tasks/${task.id}`, { completed: true });
        toast({
          title: "Task Completed!",
          description: "Congratulations on completing your task!",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", task.id] });
    } catch (error) {
      console.error("Error completing step:", error);
      toast({
        title: "Error",
        description:
          "There was a problem completing the step. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNextStep = () => {
    setModalState({
      isOpen: false,
      stepCompleted: false,
      taskCompleted: false,
    });
    if (isLastStep || allStepsCompleted) {
      onBack();
    } else {
      setCurrentStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
    }
  };

  const handleTakeBreak = () => {
    setModalState({
      isOpen: false,
      stepCompleted: false,
      taskCompleted: false,
    });
    if (modalState.taskCompleted) {
      onBack();
    } else {
      toast({
        title: "Taking a break",
        description: "Good idea! Take 5 minutes to recharge.",
      });
    }
  };

  const showHelpOptions = () => {
    toast({
      title: "Need some guidance?",
      description:
        "Try breaking the current step into even smaller tasks, or set a 5-minute timer to just get started.",
    });
  };

  return (
    <>
      <div className="flex-between mb-3">
        <h2 className="text-lg font-semibold">Your Focus Task</h2>
        <button
          onClick={onBack}
          className="text-sm text-gray-500 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>
      </div>

      <div className="card-base p-5 mb-4">
        <h3 className="text-lg font-medium mb-2">{task.title}</h3>

        <TimerSection
          stepDuration={currentStep?.estimatedDuration || 5}
          stepDescription={currentStep?.description}
        />

        <ProgressSection
          completedSteps={completedSteps}
          totalSteps={totalSteps}
        />

        <ActionButtons
          onComplete={completeCurrentStep}
          onHelp={showHelpOptions}
          disabled={!currentStep || currentStep.completed || allStepsCompleted}
        />
      </div>

      <div className="card-base p-4">
        <h4 className="text-sm font-medium mb-3 text-gray-700">All Steps</h4>
        <ul className="space-y-3">
          {task.steps.map((step, index) => (
            <TaskStep
              key={step.id}
              step={step}
              index={index}
              isActive={index === currentStepIndex}
              totalSteps={totalSteps}
            />
          ))}
        </ul>
      </div>

      <TaskCompletedModal
        modalState={modalState}
        onNextStep={handleNextStep}
        onTakeBreak={handleTakeBreak}
        onClose={() =>
          setModalState({
            isOpen: false,
            stepCompleted: false,
            taskCompleted: false,
          })
        }
      />
    </>
  );
}
