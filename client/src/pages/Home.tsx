import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { formatDate, getRandomQuote } from '@/lib/utils';
import { FooterNavigation } from '@/components/ui/navigation';
import { TaskAddForm } from '@/components/task-add-form';
import { TaskListView } from '@/components/task-list-view';
import { CalendarView } from '@/components/calendar-view';
import { Task, TaskWithSteps } from '@/types';
import { TaskFocusView } from '@/components/task-focus-view';

export default function Home() {
  const [location, setLocation] = useLocation();
  const [focusTaskId, setFocusTaskId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  
  // Get all tasks
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
    staleTime: 10000, // Refresh every 10 seconds
  });
  
  // Get focused task with steps if needed
  const { data: focusTask, isLoading: isLoadingFocusTask } = useQuery<TaskWithSteps>({
    queryKey: ['/api/tasks', focusTaskId],
    enabled: focusTaskId !== null,
  });
  
  // Handle task focus
  const handleFocusTask = (taskId: number) => {
    setFocusTaskId(taskId);
  };
  
  // Handle back to task list
  const handleBackToTasks = () => {
    setFocusTaskId(null);
    
    // Refresh tasks list
    queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
  };
  
  // Check if we're in focus mode
  const isFocusMode = focusTaskId !== null && focusTask;
  
  return (
    <div className="font-inter bg-neutral-100 min-h-screen pb-24">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-dark">Focus Flow</h1>
          <p className="text-sm text-gray-500">{formatDate(new Date())}</p>
        </div>
        <button className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
          <span className="text-sm font-medium">JD</span>
        </button>
      </header>
      
      {/* Main content */}
      <main className="px-6 pb-24">
        {!isFocusMode && (
          <div className="mb-8 py-4 px-5 bg-white rounded-xl shadow-sm animate-[fadeIn_0.3s_ease-in-out]">
            <p className="text-gray-600 italic text-sm">
              "{getRandomQuote()}"
            </p>
            <p className="text-gray-500 text-xs mt-1">— Focus Flow</p>
          </div>
        )}
        
        {!isFocusMode && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3">What do you need to do?</h2>
            <TaskAddForm onAddSuccess={() => queryClient.invalidateQueries({ queryKey: ['/api/tasks'] })} />
          </section>
        )}
        
        {isFocusMode && focusTask ? (
          <section className="mb-8">
            <TaskFocusView
              task={focusTask}
              onBack={handleBackToTasks}
            />
          </section>
        ) : (
          <section>
            <TaskListView
              tasks={tasks.filter(task => !task.completed)}
              isLoading={isLoading}
              onFocusTask={handleFocusTask}
            />
            
            <CalendarView tasks={tasks} />
          </section>
        )}
      </main>
      
      {/* Footer navigation */}
      <FooterNavigation />
    </div>
  );
}
