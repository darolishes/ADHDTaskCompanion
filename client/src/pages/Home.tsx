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
    <div className={`bg-background text-foreground min-h-screen transition-colors duration-500 
      ${isFocusMode ? 'focus-mode-active' : ''}`}>
      {/* Header with blurred effect on scroll */}
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-background/80 border-b border-border/20">
        <div className="max-w-2xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className={`transition-all duration-500 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <h1 className="text-xl font-semibold">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Focus Flow</span>
            </h1>
            <p className="text-xs text-muted-foreground">{formatDate(new Date())}</p>
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <div 
              className={`w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center shadow-sm transition-transform duration-500 ${
                animateIn ? 'scale-100' : 'scale-0'
              }`}
            >
              <span className="text-sm font-medium">JD</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="px-6 pb-24 pt-6 max-w-2xl mx-auto focus-mode-container">
        {!isFocusMode && (
          <div 
            className={`mb-8 py-4 px-5 bg-card border border-border rounded-xl shadow-sm transition-all duration-700 
              hover:shadow-md hover:border-primary/30 group ${
              animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <p className="text-card-foreground italic text-sm group-hover:text-primary/90 transition-colors">
              "{getRandomQuote()}"
            </p>
            <p className="text-muted-foreground text-xs mt-2 opacity-70">
              — Focus Flow
            </p>
          </div>
        )}
        
        {!isFocusMode && (
          <section className={`mb-8 transition-all duration-700 ${
            animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <TaskAddForm onAddSuccess={() => queryClient.invalidateQueries({ queryKey: ['/api/tasks'] })} />
          </section>
        )}
        
        {isFocusMode && focusTask ? (
          <section className="mb-8 animate-[scale-in_0.3s_ease-out]">
            <TaskFocusView
              task={focusTask}
              onBack={handleBackToTasks}
            />
          </section>
        ) : (
          <section>
            {!isLoading && tasks.length > 0 && (
              <div className={`mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 transition-all duration-700 ${
                animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                <h2 className="text-lg font-semibold">Your Tasks</h2>
                
                {/* Priority filter */}
                <div className="flex w-full sm:w-auto">
                  <div className="flex p-1 bg-muted rounded-lg w-full sm:w-auto">
                    <button 
                      onClick={() => setFilter('all')}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        filter === 'all' 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      All
                    </button>
                    <button 
                      onClick={() => setFilter('high')}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        filter === 'high' 
                          ? 'bg-destructive text-destructive-foreground shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      High
                    </button>
                    <button 
                      onClick={() => setFilter('medium')}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        filter === 'medium' 
                          ? 'bg-amber-500 text-white shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Medium
                    </button>
                    <button 
                      onClick={() => setFilter('low')}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        filter === 'low' 
                          ? 'bg-green-500 text-white shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Low
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <TaskListView
              tasks={filteredTasks}
              isLoading={isLoading}
              onFocusTask={handleFocusTask}
            />
            
            <div className={`mt-10 transition-all duration-1000 delay-300 ${
              animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
            }`}>
              <h2 className="text-lg font-semibold mb-4">Calendar View</h2>
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                <CalendarView tasks={tasks} />
              </div>
            </div>
          </section>
        )}
      </main>
      
      {/* Footer navigation */}
      <FooterNavigation />
    </div>
  );
}
