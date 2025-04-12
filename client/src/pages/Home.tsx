import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDate } from '@/lib/utils';
import { TaskAddForm } from '@/components/task-add-form';
import { Task, TaskWithSteps } from '@/types';
import { TaskFocusView } from '@/components/task-focus-view';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [focusTaskId, setFocusTaskId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('personal');
  const [animateIn, setAnimateIn] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Animation beim Laden
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateIn(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Hole alle Aufgaben
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
    staleTime: 10000,
  });
  
  // Hole fokussierte Aufgabe mit Schritten, wenn nötig
  const { data: focusTask } = useQuery<TaskWithSteps>({
    queryKey: ['/api/tasks', focusTaskId],
    enabled: focusTaskId !== null,
  });
  
  // Aufgaben-Fokus-Handler
  const handleFocusTask = (taskId: number) => {
    setFocusTaskId(taskId);
  };
  
  // Zurück zur Aufgabenliste
  const handleBackToTasks = () => {
    setFocusTaskId(null);
    queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
  };
  
  // Aufgabe als erledigt markieren
  const handleCompleteTask = async (taskId: number) => {
    try {
      await apiRequest('PATCH', `/api/tasks/${taskId}`, { completed: true });
      
      toast({
        title: "Aufgabe erledigt!",
        description: "Gut gemacht!",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "Fehler",
        description: "Die Aufgabe konnte nicht abgeschlossen werden.",
        variant: "destructive",
      });
    }
  };
  
  // Unerledigte Aufgaben filtern
  const uncompletedTasks = tasks.filter(task => !task.completed);
  
  // Fokus-Modus aktiv?
  const isFocusMode = focusTaskId !== null && focusTask;
  
  return (
    <div className={`min-h-screen bg-background text-foreground ${
      isFocusMode ? 'focus-mode-active' : ''
    }`}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <div className={`transition-all duration-500 ${animateIn ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">JD</span>
              </div>
              <div>
                <h1 className="text-sm font-medium">{formatDate(new Date())}</h1>
                <p className="text-xs text-muted-foreground">
                  {uncompletedTasks.length} {uncompletedTasks.length === 1 ? 'Aufgabe' : 'Aufgaben'} zu erledigen
                </p>
              </div>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>
      
      {/* Hauptinhalt */}
      <main className="max-w-md mx-auto px-4 pb-24 pt-2">
        {isFocusMode && focusTask ? (
          <section className="animate-[scale-in_0.3s_ease-out]">
            <TaskFocusView
              task={focusTask}
              onBack={handleBackToTasks}
            />
          </section>
        ) : (
          <>
            {/* Kategorien */}
            <div className={`mb-6 transition-all duration-500 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="grid grid-cols-2 gap-3">
                <div 
                  onClick={() => setActiveCategory('personal')}
                  className={`p-5 rounded-xl border transition-all cursor-pointer ${
                    activeCategory === 'personal' 
                      ? 'bg-primary/5 border-primary/20' 
                      : 'bg-card border-border hover:bg-primary/5'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{uncompletedTasks.length} {uncompletedTasks.length === 1 ? 'Aufgabe' : 'Aufgaben'}</p>
                    <h2 className="text-base font-semibold">Persönlich</h2>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3 h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full"
                      style={{ 
                        width: `${uncompletedTasks.length > 0 
                          ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) 
                          : 0}%` 
                      }}
                    />
                  </div>
                </div>
                
                <div 
                  onClick={() => setActiveCategory('work')}
                  className={`p-5 rounded-xl border transition-all cursor-pointer ${
                    activeCategory === 'work' 
                      ? 'bg-primary/5 border-primary/20' 
                      : 'bg-card border-border hover:bg-primary/5'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                        <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">0 Aufgaben</p>
                    <h2 className="text-base font-semibold">Arbeit</h2>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3 h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '0%' }} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Aufgabenliste der aktiven Kategorie */}
            <div className={`transition-all duration-500 delay-100 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-base font-semibold">
                  {activeCategory === 'personal' ? 'Persönliche Aufgaben' : 'Arbeitsaufgaben'}
                </h2>
                
                {uncompletedTasks.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 px-2 text-xs font-normal text-muted-foreground"
                  >
                    Alle anzeigen
                  </Button>
                )}
              </div>
              
              {/* Aufgaben */}
              <div className="space-y-2 mb-8">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : uncompletedTasks.length > 0 ? (
                  uncompletedTasks.map(task => (
                    <div 
                      key={task.id}
                      className="group transition-all duration-300"
                    >
                      <div className="relative overflow-hidden rounded-lg border border-border bg-card shadow-sm hover:border-primary/20 transition-colors cursor-pointer"
                           onClick={() => handleFocusTask(task.id)}>
                        <div className="p-3 flex items-center gap-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompleteTask(task.id);
                            }}
                            className="w-5 h-5 rounded-full border-2 border-muted-foreground/40 flex-shrink-0 transition-colors hover:border-primary"
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              {/* Prioritätsindikator */}
                              <div 
                                className={`w-2 h-2 rounded-full ${
                                  task.priority === 'high' ? 'bg-red-500' :
                                  task.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                                }`} 
                              />
                              <span className="font-medium text-sm truncate">{task.title}</span>
                            </div>
                            
                            <div className="flex text-xs text-muted-foreground mt-0.5">
                              <span className="truncate">{task.estimatedDuration} min</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-base font-medium mb-1">Keine Aufgaben</h3>
                    <p className="text-sm text-muted-foreground mb-4">Füge eine neue Aufgabe hinzu, um zu beginnen.</p>
                  </div>
                )}
              </div>
              
              {/* Neue Aufgabe-Formular */}
              <div className={`transition-all duration-500 delay-200 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                <TaskAddForm onAddSuccess={() => queryClient.invalidateQueries({ queryKey: ['/api/tasks'] })} />
              </div>
            </div>
          </>
        )}
      </main>
      
      {/* Floating Action Button */}
      {!isFocusMode && (
        <div className="fixed bottom-6 right-6 z-10">
          <button
            className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
            aria-label="Neue Aufgabe hinzufügen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
