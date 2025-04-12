import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDate } from '@/lib/utils';
import { TaskAddForm } from '@/components/task-add-form';
import { Task, TaskWithSteps } from '@/types';
import { TaskFocusView } from '@/components/task-focus-view';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { DailyFocusSuggestion } from '@/components/daily-focus-suggestion';
import { EnergyLevel } from '@shared/schema';
import { Header } from '@/components/ui/header';
import { CategoryCard } from '@/components/ui/category-card';
import { SideMenu } from '@/components/ui/side-menu';

export default function Home() {
  const [focusTaskId, setFocusTaskId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [currentEnergyLevel, setCurrentEnergyLevel] = useState<EnergyLevel>(EnergyLevel.MEDIUM);
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateIn(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
    staleTime: 10000,
  });

  const { data: focusTask } = useQuery<TaskWithSteps>({
    queryKey: ['/api/tasks', focusTaskId],
    enabled: focusTaskId !== null,
  });

  const handleFocusTask = (taskId: number) => {
    setFocusTaskId(taskId);
  };

  const handleBackToTasks = () => {
    setFocusTaskId(null);
    setSelectedCategory(null);
    queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
  };

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

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
  };

  const uncompletedTasks = tasks.filter(task => !task.completed);
  const tasksByCategory = selectedCategory 
    ? uncompletedTasks.filter(task => task.priority === "medium")
    : uncompletedTasks;

  const isFocusMode = focusTaskId !== null && !!focusTask;
  const isCategoryView = selectedCategory !== null;

  const categories = [
    {
      id: 'personal',
      name: 'Personal',
      count: uncompletedTasks.length,
      color: 'amber',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      id: 'work',
      name: 'Work',
      count: 0,
      color: 'blue',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
          <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
        </svg>
      )
    }
  ];

  return (
    <div className={`min-h-screen ${isFocusMode || isCategoryView ? 'bg-background text-foreground' : 'bg-amber-200 text-black'} transition-colors duration-300`}>
      <Header 
        isFocusMode={isFocusMode}
        isCategoryView={isCategoryView}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        handleBackToTasks={handleBackToTasks}
      />

      <SideMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <main className={isFocusMode || isCategoryView ? "bg-background" : ""}>
        {isFocusMode && focusTask ? (
          <div className="max-w-md mx-auto px-4 pb-24 pt-4">
            <TaskFocusView
              task={focusTask}
              onBack={handleBackToTasks}
            />
          </div>
        ) : isCategoryView ? (
          <div className="max-w-md mx-auto px-4 pb-24 pt-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : tasksByCategory.length > 0 ? (
              <div className="space-y-2">
                {tasksByCategory.map(task => (
                  <div 
                    key={task.id}
                    className="group transition-all duration-300"
                  >
                    <div 
                      className="relative overflow-hidden rounded-lg border border-border bg-card shadow-sm hover:border-primary/20 transition-colors cursor-pointer"
                      onClick={() => handleFocusTask(task.id)}
                    >
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
                ))}
              </div>
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

            <div className="mb-5">
              <TaskAddForm onAddSuccess={() => queryClient.invalidateQueries({ queryKey: ['/api/tasks'] })} />
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto px-4 pb-24">
            <div className={`mb-6 mt-4 transition-all duration-500 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="mb-4">
                <div className="flex justify-start mb-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm">
                    <img 
                      src="https://i.pravatar.cc/300?img=9" 
                      alt="User avatar" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="pl-1">
                  <h1 className="text-xl font-medium">{formatDate(new Date())}</h1>
                  <p className="text-sm">
                    Hi, Steve! Du hast {uncompletedTasks.length} {uncompletedTasks.length === 1 ? 'Aufgabe' : 'Aufgaben'} heute.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pl-1 mb-4">
                {Object.values(EnergyLevel).map((level) => (
                  <button 
                    key={level}
                    onClick={() => setCurrentEnergyLevel(level)}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                      currentEnergyLevel === level
                        ? `bg-${level === EnergyLevel.LOW ? 'red' : level === EnergyLevel.MEDIUM ? 'amber' : 'green'}-100 
                           text-${level === EnergyLevel.LOW ? 'red' : level === EnergyLevel.MEDIUM ? 'amber' : 'green'}-700 
                           border border-${level === EnergyLevel.LOW ? 'red' : level === EnergyLevel.MEDIUM ? 'amber' : 'green'}-300`
                        : 'bg-muted/40 text-muted-foreground border border-transparent'
                    }`}
                  >
                    {level === EnergyLevel.LOW ? 'Niedrige' : level === EnergyLevel.MEDIUM ? 'Mittlere' : 'Hohe'} Energie
                  </button>
                ))}
              </div>
            </div>

            <DailyFocusSuggestion
              currentEnergyLevel={currentEnergyLevel}
              onFocusTask={handleFocusTask}
            />

            <div className="flex-grow"></div>

            <div className={`fixed bottom-24 left-0 right-0 px-4 transition-all duration-500 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="overflow-x-auto pb-4 -mx-4 px-4" style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
                <div className="flex gap-8 pb-6 px-2 justify-start">
                  {categories.map(category => (
                    <CategoryCard
                      key={category.id}
                      {...category}
                      onClick={() => handleSelectCategory(category.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {!isFocusMode && (
        <div className="fixed bottom-6 right-6 z-10">
          <button
            className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
            aria-label="Neue Aufgabe hinzufügen"
            onClick={() => {
              toast({
                title: "Neue Aufgabe",
                description: "Neue Aufgabe hinzufügen wird bald verfügbar sein.",
                variant: "default",
              });
            }}
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