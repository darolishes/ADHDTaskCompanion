import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { TaskFocusView } from '@/components/task-focus-view';
import { formatDate } from '@/lib/utils';
import { FooterNavigation } from '@/components/ui/navigation';
import { TaskWithSteps } from '@/types';

export default function FocusMode() {
  const [location, setLocation] = useLocation();
  
  // Extract task ID from URL
  const taskId = parseInt(location.split('/').pop() || '0');
  
  // Redirect if no task ID
  useEffect(() => {
    if (!taskId) {
      setLocation('/');
    }
  }, [taskId, setLocation]);
  
  // Get task with steps
  const { data: task, isLoading, error } = useQuery<TaskWithSteps>({
    queryKey: ['/api/tasks', taskId],
    enabled: !!taskId,
  });
  
  // Handle back to home
  const handleBack = () => {
    setLocation('/');
  };
  
  return (
    <div className="font-inter bg-neutral-100 min-h-screen pb-24">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-dark">Focus Mode</h1>
          <p className="text-sm text-gray-500">{formatDate(new Date())}</p>
        </div>
        <button className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
          <span className="text-sm font-medium">JD</span>
        </button>
      </header>
      
      {/* Main content */}
      <main className="px-6 pb-24">
        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Loading task...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500">Error loading task. Please try again.</p>
            <button 
              onClick={handleBack}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
            >
              Go Back
            </button>
          </div>
        ) : task ? (
          <TaskFocusView task={task} onBack={handleBack} />
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">Task not found</p>
            <button 
              onClick={handleBack}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
            >
              Go Back
            </button>
          </div>
        )}
      </main>
      
      {/* Footer navigation */}
      <FooterNavigation />
    </div>
  );
}
