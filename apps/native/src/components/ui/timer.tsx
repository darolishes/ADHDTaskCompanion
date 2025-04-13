import { useState, useEffect, useRef } from 'react';
import { TimerState } from '@/types';

interface TimerProps {
  initialMinutes: number;
  onComplete?: () => void;
  autoStart?: boolean;
}

export function Timer({ initialMinutes = 25, onComplete, autoStart = false }: TimerProps) {
  const [state, setState] = useState<TimerState>({
    timeRemaining: initialMinutes * 60, // Convert to seconds
    isRunning: autoStart,
    totalTime: initialMinutes * 60,
    progress: 0
  });
  
  const intervalRef = useRef<number | null>(null);
  
  // Set up or clear interval based on isRunning state
  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = window.setInterval(() => {
        setState(prev => {
          // Calculate new remaining time and progress
          const newTimeRemaining = Math.max(0, prev.timeRemaining - 1);
          const progress = ((prev.totalTime - newTimeRemaining) / prev.totalTime) * 100;
          
          // Check if timer completed
          if (newTimeRemaining === 0) {
            clearInterval(intervalRef.current!);
            if (onComplete) onComplete();
          }
          
          return {
            ...prev,
            timeRemaining: newTimeRemaining,
            progress,
            isRunning: newTimeRemaining > 0 ? prev.isRunning : false
          };
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.isRunning, onComplete]);
  
  // Format time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Timer controls
  const startTimer = () => setState(prev => ({ ...prev, isRunning: true }));
  const pauseTimer = () => setState(prev => ({ ...prev, isRunning: false }));
  const resetTimer = () => {
    setState({
      timeRemaining: initialMinutes * 60,
      isRunning: false,
      totalTime: initialMinutes * 60,
      progress: 0
    });
  };
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-500">Focus Timer</span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-medium">{formatTime(state.timeRemaining)}</span>
          <button 
            onClick={state.isRunning ? pauseTimer : startTimer}
            className="text-gray-500 hover:text-primary transition-colors p-1"
          >
            {state.isRunning ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6M9 9h.01M15 9h.01" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
        <div 
          className="timer-progress h-full bg-primary rounded-full"
          style={{ width: `${state.progress}%` }}
        ></div>
      </div>
    </div>
  );
}
