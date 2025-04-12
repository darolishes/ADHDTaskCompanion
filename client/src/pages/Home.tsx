import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { formatDate, getRandomQuote } from '@/lib/utils';
import { FooterNavigation } from '@/components/ui/navigation';
import { TaskAddForm } from '@/components/task-add-form';
import { TaskListView } from '@/components/task-list-view';
import { CalendarView } from '@/components/calendar-view';
import { Task, TaskWithSteps } from '@/types';
import { TaskFocusView } from '@/components/task-focus-view';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function Home() {
  const [location, setLocation] = useLocation();
  const [focusTaskId, setFocusTaskId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [animateIn, setAnimateIn] = useState(false);
  const queryClient = useQueryClient();
  
  // Animated entrance
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateIn(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
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
  
  // Filter tasks based on priority
  const filteredTasks = tasks.filter(task => {
    // First filter out completed tasks
    if (task.completed) return false;
    
    // Then apply priority filter if not 'all'
    if (filter !== 'all') {
      return task.priority === filter;
    }
    
    return true;
  });
  
  // Check if we're in focus mode
  const isFocusMode = focusTaskId !== null && focusTask;
  
  return (
    <div className="bg-background text-foreground min-h-screen pb-24 transition-colors duration-300">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex justify-between items-center">
        <div className={`transition-all duration-500 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <h1 className="text-2xl font-semibold">Focus Flow</h1>
          <p className="text-sm text-muted-foreground">{formatDate(new Date())}</p>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <div 
            className={`w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-transform duration-500 ${
              animateIn ? 'scale-100' : 'scale-0'
            }`}
          >
            <span className="text-sm font-medium">JD</span>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="px-6 pb-24 max-w-2xl mx-auto">
        {!isFocusMode && (
          <div 
            className={`mb-8 py-4 px-5 bg-card border border-border rounded-xl shadow-sm transition-all duration-700 ${
              animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <p className="text-card-foreground italic text-sm">
              "{getRandomQuote()}"
            </p>
            <p className="text-muted-foreground text-xs mt-1">— Focus Flow</p>
          </div>
        )}
        
        {!isFocusMode && (
          <section className="mb-8">
            <TaskAddForm onAddSuccess={() => queryClient.invalidateQueries({ queryKey: ['/api/tasks'] })} />
          </section>
        )}
        
        {isFocusMode && focusTask ? (
          <section className="mb-8 transition-all duration-300 ease-in-out">
            <TaskFocusView
              task={focusTask}
              onBack={handleBackToTasks}
            />
          </section>
        ) : (
          <section>
            {!isLoading && tasks.length > 0 && (
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Your Tasks</h2>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      filter === 'all' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    }`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setFilter('high')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      filter === 'high' 
                        ? 'bg-destructive text-destructive-foreground' 
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    }`}
                  >
                    High
                  </button>
                  <button 
                    onClick={() => setFilter('medium')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      filter === 'medium' 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    }`}
                  >
                    Medium
                  </button>
                  <button 
                    onClick={() => setFilter('low')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      filter === 'low' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    }`}
                  >
                    Low
                  </button>
                </div>
              </div>
            )}
            
            <TaskListView
              tasks={filteredTasks}
              isLoading={isLoading}
              onFocusTask={handleFocusTask}
            />
            
            <div className={`mt-8 transition-all duration-1000 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>
              <CalendarView tasks={tasks} />
            </div>
          </section>
        )}
      </main>
      
      {/* Footer navigation */}
      <FooterNavigation />
    </div>
  );
}
