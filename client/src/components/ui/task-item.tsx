import { useState } from 'react';
import { formatTime, getPriorityColor } from '@/lib/utils';
import { Task } from '@/types';

interface TaskItemProps {
  task: Task;
  onFocus: (taskId: number) => void;
  onComplete: (taskId: number) => void;
}

export function TaskItem({ task, onFocus, onComplete }: TaskItemProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  
  const handleComplete = () => {
    setIsCompleting(true);
    
    // Visual feedback before completing
    setTimeout(() => {
      onComplete(task.id);
      setIsCompleting(false);
    }, 300);
  };
  
  return (
    <div 
      className="task-item bg-white p-4 rounded-xl shadow-sm animate-[task-enter_0.3s_ease_forwards]"
      data-task-id={task.id}
      data-task-priority={task.priority}
    >
      <div className="flex items-start gap-3">
        <button 
          onClick={handleComplete}
          className={`task-checkbox mt-0.5 w-5 h-5 rounded-full border-2 border-primary flex-shrink-0 transition-all ${
            isCompleting ? 'scale-90 bg-primary' : ''
          }`}
          aria-label={`Mark ${task.title} as complete`}
        />
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-medium">{task.title}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
          
          <div className="flex items-center text-xs text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Est. {formatTime(task.estimatedDuration || 0)}</span>
          </div>
        </div>
        
        <button 
          onClick={() => onFocus(task.id)}
          className="focus-btn ml-2 p-2 text-primary"
          aria-label={`Focus on ${task.title}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
