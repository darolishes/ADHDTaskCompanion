import { useEffect } from 'react';
import { Confetti } from '@/components/ui/confetti';
import { ModalState } from '@/types';

interface TaskCompletedModalProps {
  modalState: ModalState;
  onNextStep: () => void;
  onTakeBreak: () => void;
  onClose: () => void;
}

export function TaskCompletedModal({ 
  modalState, 
  onNextStep, 
  onTakeBreak, 
  onClose 
}: TaskCompletedModalProps) {
  const { isOpen, stepCompleted, taskCompleted } = modalState;
  
  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Confetti isActive={isOpen} />
      
      <div className="bg-white rounded-xl p-6 w-5/6 max-w-sm animate-[slideUp_0.3s_ease_forwards]">
        <div className="text-center">
          <div className="mb-4 bg-secondary bg-opacity-20 rounded-full p-3 inline-flex">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          
          <h3 className="text-xl font-semibold mb-2">Great job!</h3>
          
          <p className="text-gray-600 mb-6">
            {taskCompleted 
              ? "You've completed the entire task!"
              : "You've completed the current step!"}
          </p>
          
          <div className="space-y-3">
            {!taskCompleted && (
              <button 
                onClick={onNextStep}
                className="w-full py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all"
              >
                Continue to Next Step
              </button>
            )}
            
            <button 
              onClick={onTakeBreak}
              className="w-full py-3 bg-neutral-100 text-gray-700 rounded-lg hover:bg-neutral-200 transition-all"
            >
              {taskCompleted ? "Return to Tasks" : "Take a Short Break"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
