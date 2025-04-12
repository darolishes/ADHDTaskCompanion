import { useState } from 'react';
import { formatTime, getPriorityColor, getEnergyColor } from '@/lib/utils';
import { Task } from '@/types';

interface TaskItemProps {
  task: Task;
  onFocus: (taskId: number) => void;
  onComplete: (taskId: number) => void;
}

export function TaskItem({ task, onFocus, onComplete }: TaskItemProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleComplete = () => {
    setIsCompleting(true);
    
    // Visual feedback before completing
    setTimeout(() => {
      onComplete(task.id);
      setIsCompleting(false);
    }, 300);
  };
  
  // Get appropriate colors based on task properties
  const priorityStyles = {
    high: "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-amber-500/10 text-amber-600 border-amber-200",
    low: "bg-green-500/10 text-green-600 border-green-200",
  };
  
  const energyStyles = {
    high: "text-green-600",
    medium: "text-amber-600",
    low: "text-red-600",
  };
  
  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`task-item p-4 rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md ${
          isHovered ? 'scale-[1.01]' : 'scale-100'
        }`}
        data-task-id={task.id}
        data-task-priority={task.priority}
      >
        <div className="flex items-start gap-3">
          <button 
            onClick={handleComplete}
            className={`task-checkbox mt-0.5 w-5 h-5 rounded-full flex-shrink-0 transition-all ${
              isCompleting 
                ? 'scale-90 bg-primary border-0' 
                : 'border-2 border-primary hover:border-primary/80 hover:scale-110'
            }`}
            aria-label={`Mark ${task.title} as complete`}
          >
            {isCompleting && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-primary-foreground p-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          
          <div className="flex-1">
            <div className="flex flex-wrap justify-between items-start gap-2 mb-1.5">
              <h3 className="font-medium text-card-foreground">{task.title}</h3>
              <div className="flex items-center gap-2">
                {task.energyLevel && (
                  <span className={`flex items-center text-xs ${energyStyles[task.energyLevel as keyof typeof energyStyles]}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                    <span className="ml-1">{task.energyLevel} energy</span>
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityStyles[task.priority as keyof typeof priorityStyles]}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              </div>
            </div>
            
            {task.description && (
              <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
            )}
            
            <div className="flex items-center text-xs text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Est. {formatTime(task.estimatedDuration || 0)}</span>
            </div>
          </div>
          
          <button 
            onClick={() => onFocus(task.id)}
            className="focus-btn ml-2 p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            aria-label={`Focus on ${task.title}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
        
        {/* Progress indicator for task with steps */}
        {task.estimatedDuration && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="relative w-full h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-primary rounded-full"
                style={{ width: `${(task.completed ? 100 : 0)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
