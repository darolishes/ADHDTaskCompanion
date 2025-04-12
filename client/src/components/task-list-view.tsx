import { useState } from 'react';
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
  const [filter, setFilter] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Filter tasks by priority
  const filteredTasks = filter 
    ? tasks.filter(task => task.priority === filter)
    : tasks;
  
  // Handle task completion
  const handleCompleteTask = async (taskId: number) => {
    try {
      await apiRequest('PATCH', `/api/tasks/${taskId}`, { completed: true });
      
      // Show success message
      toast({
        title: "Task completed",
        description: "Well done! You've completed this task.",
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
  
  // Toggle filter
  const toggleFilter = (priority: string) => {
    setFilter(filter === priority ? null : priority);
  };
  
  if (isLoading) {
    return (
      <div className="py-10 text-center">
        <p className="text-gray-500">Loading tasks...</p>
      </div>
    );
  }
  
  return (
    <>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Today's Tasks</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => toggleFilter('high')}
            className={`text-xs px-2 py-1 rounded-full transition-colors ${
              filter === 'high' 
                ? 'bg-red-100 text-urgent'
                : 'bg-neutral-100 text-gray-500'
            }`}
          >
            High
          </button>
          <button 
            onClick={() => toggleFilter('medium')}
            className={`text-xs px-2 py-1 rounded-full transition-colors ${
              filter === 'medium' 
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-neutral-100 text-gray-500'
            }`}
          >
            Medium
          </button>
          <button 
            onClick={() => toggleFilter('low')}
            className={`text-xs px-2 py-1 rounded-full transition-colors ${
              filter === 'low' 
                ? 'bg-green-100 text-green-700'
                : 'bg-neutral-100 text-gray-500'
            }`}
          >
            Low
          </button>
        </div>
      </div>
      
      {filteredTasks.length > 0 ? (
        <div className="space-y-3 mb-6">
          {filteredTasks.map(task => (
            <TaskItem 
              key={task.id}
              task={task}
              onFocus={onFocusTask}
              onComplete={handleCompleteTask}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="inline-block p-3 bg-neutral-100 rounded-full mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-1">
            {filter ? `No ${filter} priority tasks` : "No tasks yet"}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {filter ? `Try changing your filter` : "Add your first task to get started"}
          </p>
          {filter && (
            <button 
              onClick={() => setFilter(null)}
              className="px-4 py-2 bg-neutral-200 text-gray-700 rounded-lg inline-flex items-center hover:bg-neutral-300 transition-all"
            >
              Clear Filter
            </button>
          )}
        </div>
      )}
    </>
  );
}
