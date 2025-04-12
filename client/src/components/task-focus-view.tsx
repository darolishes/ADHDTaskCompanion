import { useState, useEffect } from 'react';
import { Timer } from '@/components/ui/timer';
import { TaskStep } from '@/components/ui/task-step';
import { TaskCompletedModal } from '@/components/modals/task-completed-modal';
import { TaskWithSteps, ModalState } from '@/types';
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

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
  
  // Find first incomplete step index on initial load
  useEffect(() => {
    const firstIncompleteIndex = task.steps.findIndex(step => !step.completed);
    setCurrentStepIndex(firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0);
  }, [task.steps]);
  
  const totalSteps = task.steps.length;
  const currentStep = task.steps[currentStepIndex];
  const isLastStep = currentStepIndex === totalSteps - 1;
  const allStepsCompleted = task.steps.every(step => step.completed);
  
  // Get estimated duration for current step or default to 5 minutes
  const stepDuration = currentStep?.estimatedDuration || 5;
  
  // Complete the current step
  const completeCurrentStep = async () => {
    if (!currentStep) return;
    
    try {
      // Mark step as completed
      await apiRequest('PATCH', `/api/task-steps/${currentStep.id}`, { completed: true });
      
      // Update local state with optimistic update
      const allCompleted = isLastStep && task.steps.slice(0, currentStepIndex).every(step => step.completed);
      
      setModalState({
        isOpen: true,
        stepCompleted: true,
        taskCompleted: allCompleted,
      });
      
      // If last step, mark task as completed
      if (allCompleted) {
        await apiRequest('PATCH', `/api/tasks/${task.id}`, { completed: true });
        
        // Show completion message
        toast({
          title: "Task Completed!",
          description: "Congratulations on completing your task!",
        });
      }
      
      // Invalidate queries to get fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', task.id] });
    } catch (error) {
      console.error('Error completing step:', error);
      toast({
        title: "Error",
        description: "There was a problem completing the step. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle moving to next step
  const handleNextStep = () => {
    setModalState({ isOpen: false, stepCompleted: false, taskCompleted: false });
    
    if (isLastStep || allStepsCompleted) {
      // Return to task list if all steps are done
      onBack();
    } else {
      // Move to next step
      setCurrentStepIndex(prev => Math.min(prev + 1, totalSteps - 1));
    }
  };
  
  // Handle taking a break
  const handleTakeBreak = () => {
    setModalState({ isOpen: false, stepCompleted: false, taskCompleted: false });
    
    if (modalState.taskCompleted) {
      onBack();
    } else {
      toast({
        title: "Taking a break",
        description: "Good idea! Take 5 minutes to recharge.",
      });
    }
  };
  
  // Close modal without action
  const closeModal = () => {
    setModalState({ isOpen: false, stepCompleted: false, taskCompleted: false });
  };
  
  // Show help options
  const showHelpOptions = () => {
    toast({
      title: "Need some guidance?",
      description: "Try breaking the current step into even smaller tasks, or set a 5-minute timer to just get started.",
    });
  };
  
  // Calculate progress percentage
  const completedSteps = task.steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / totalSteps) * 100;
  
  return (
    <>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Your Focus Task</h2>
        <button 
          onClick={onBack}
          className="text-sm text-gray-500 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>
      
      <div className="bg-white p-5 rounded-xl shadow-sm mb-4">
        <h3 className="text-lg font-medium mb-2">{task.title}</h3>
        
        {/* Timer component */}
        <Timer initialMinutes={stepDuration} />
        
        {/* Current step display */}
        <div className="mb-4 p-3 bg-neutral-100 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Current Step:</p>
          <p className="font-medium">
            {currentStep?.description || "All steps completed"}
          </p>
        </div>
        
        {/* Step progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Progress</span>
            <span>{completedSteps}/{totalSteps} steps</span>
          </div>
          <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-secondary rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex space-x-3">
          <button 
            onClick={completeCurrentStep}
            className="flex-1 py-3 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-opacity-90 transition-all disabled:opacity-70"
            disabled={!currentStep || currentStep.completed || allStepsCompleted}
          >
            Complete Step
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            onClick={showHelpOptions}
            className="p-3 text-gray-600 bg-neutral-200 rounded-lg hover:bg-neutral-300 transition-all"
            aria-label="Need help?"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Subtasks list */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
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
      
      {/* Task completed modal */}
      <TaskCompletedModal
        modalState={modalState}
        onNextStep={handleNextStep}
        onTakeBreak={handleTakeBreak}
        onClose={closeModal}
      />
    </>
  );
}
