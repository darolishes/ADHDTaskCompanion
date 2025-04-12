import { useState, useEffect } from 'react';
import { TaskItem } from '@/components/ui/task-item';
import { Task } from '@/types';
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface TaskListViewProps {
  tasks: Task[];
  isLoading: boolean;
  onFocusTask: (taskId: number) => void;
}

export function TaskListView({ tasks, isLoading, onFocusTask }: TaskListViewProps) {
  const [animateItems, setAnimateItems] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Animate items on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateItems(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle task completion
  const handleCompleteTask = async (taskId: number) => {
    try {
      await apiRequest('PATCH', `/api/tasks/${taskId}`, { completed: true });
      
      // Show success message with confetti effect
      toast({
        title: "Task completed! 🎉",
        description: "Great job! You've completed this task.",
        variant: "default",
      });
      
      // Invalidate cache to refresh tasks
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "Error completing task",
        description: "There was a problem completing your task. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="py-10 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-primary animate-spin"></div>
        <p className="text-muted-foreground animate-pulse">Loading your tasks...</p>
      </div>
    );
  }
  
  return (
    <div className="mb-8">
      {tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <div 
              key={task.id}
              className={`transition-all duration-500 ${
                animateItems 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 75}ms` }}
            >
              <TaskItem 
                task={task}
                onFocus={onFocusTask}
                onComplete={handleCompleteTask}
              />
            </div>
          ))}
        </div>
      ) : (
        <div 
          className={`text-center py-10 rounded-xl border border-border bg-card transition-all duration-500 ${
            animateItems ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className="inline-flex p-4 mb-3 rounded-full bg-muted text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              <polyline points="14 2 14 8 20 8"/>
              <path d="M12 18v-6"/>
              <path d="M8 18v-1"/>
              <path d="M16 18v-3"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">No tasks to show</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Ready to be productive? Add your first task using the form above and our AI will help break it down into manageable steps.
          </p>
          <div className="inline-flex items-center justify-center space-x-2 text-xs text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
            <span>AI-powered task breakdown</span>
          </div>
        </div>
      )}
    </div>
  );
}
