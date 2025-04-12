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
import { useLocation } from 'wouter';

export default function Home() {
  const [focusTaskId, setFocusTaskId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [location, setLocation] = useLocation();
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
    setSelectedCategory(null);
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
  
  // Kategorie auswählen
  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
  };
  
  // Unerledigte Aufgaben filtern
  const uncompletedTasks = tasks.filter(task => !task.completed);
  
  // Aufgaben nach Kategorie filtern
  const tasksByCategory = selectedCategory 
    ? uncompletedTasks.filter(task => task.priority === "medium") // Später nach tatsächlicher Kategorie filtern
    : uncompletedTasks;
  
  // Fokus-Modus oder Kategorieansicht aktiv?
  const isFocusMode = focusTaskId !== null && focusTask;
  const isCategoryView = selectedCategory !== null;
  
  // Mock-Kategorien mit Aufgabenzahlen
  const categories = [
    { id: 'personal', name: 'Persönlich', count: uncompletedTasks.length, color: 'amber', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    )},
    { id: 'work', name: 'Arbeit', count: 0, color: 'blue', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
        <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
      </svg>
    )},
    { id: 'family', name: 'Familie', count: 0, color: 'green', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
      </svg>
    )},
    { id: 'health', name: 'Gesundheit', count: 0, color: 'red', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
      </svg>
    )}
  ];
  
  return (
    <div 
      className={`min-h-screen ${
        isFocusMode || isCategoryView 
          ? 'bg-background text-foreground' 
          : 'bg-amber-200 text-black'
      } transition-colors duration-300`}
    >
      {/* Header */}
      <header className={`sticky top-0 z-20 ${isFocusMode || isCategoryView ? 'bg-background border-b border-border/10' : 'bg-amber-200'}`}>
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          {isFocusMode || isCategoryView ? (
            // Zurück-Button im Fokusmodus oder Kategorieansicht
            <button 
              onClick={handleBackToTasks}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/80 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            // Burger-Menü auf der Startseite
            <button 
              onClick={() => setMenuOpen(true)}
              className="w-8 h-8 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          
          {isFocusMode || isCategoryView ? (
            // Titel im Fokusmodus oder Kategorieansicht
            <h1 className="text-base font-medium">
              {isFocusMode ? 'Fokussiert' : selectedCategory === 'personal' ? 'Persönliche Aufgaben' : 'Arbeitsaufgaben'}
            </h1>
          ) : (
            <div className="flex-1">
              {/* Leer - wird unten platziert */}
            </div>
          )}
          
          {isFocusMode || isCategoryView ? (
            // Drei-Punkt-Menü im Fokusmodus oder Kategorieansicht
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/80 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          ) : (
            // Nur Suche auf der Startseite (kein Avatar)
            <button className="w-8 h-8 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}
        </div>
      </header>
      
      {/* Hauptinhalt */}
      <main className={isFocusMode || isCategoryView ? "bg-background" : ""}>
        {isFocusMode && focusTask ? (
          <div className="max-w-md mx-auto px-4 pb-24 pt-4">
            <TaskFocusView
              task={focusTask}
              onBack={handleBackToTasks}
            />
          </div>
        ) : isCategoryView ? (
          // Kategorieansicht mit Aufgabenliste
          <div className="max-w-md mx-auto px-4 pb-24 pt-4">
            {/* Aufgabenliste */}
            <div className="mb-8">
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
            </div>
            
            {/* Neue Aufgabe-Formular */}
            <div className="mb-5">
              <TaskAddForm onAddSuccess={() => queryClient.invalidateQueries({ queryKey: ['/api/tasks'] })} />
            </div>
          </div>
        ) : (
          // Homescreen mit Kategoriekarten im Hochformat
          <div className="max-w-md mx-auto px-4 pb-24">
            {/* Benutzerprofil und Begrüßung auf der Homepage */}
            <div className={`mb-10 mt-4 transition-all duration-500 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
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
            </div>

            {/* Leerer Bereich für Mittelteil */}
            <div className="flex-grow"></div>
            
            {/* Kategorie-Cards im Hochformat als horizontaler Slider am unteren Rand */}
            <div className={`fixed bottom-12 left-0 right-0 px-4 transition-all duration-500 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="overflow-x-auto">
                <div className="flex gap-6 pb-6 px-2 justify-center">
                  {/* Personal-Karte */}
                  <div 
                    className="flex-shrink-0 w-[250px] h-[280px] bg-white rounded-xl shadow-md overflow-hidden cursor-pointer"
                    onClick={() => handleSelectCategory('personal')}
                  >
                    <div className="p-6 h-full flex flex-col">
                      <div className="flex justify-between items-start mb-5">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="w-8 h-8 flex items-center justify-center text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </span>
                      </div>
                      
                      <div className="mt-auto mb-6">
                        <p className="text-sm font-medium text-gray-500 mb-1">{uncompletedTasks.length} {uncompletedTasks.length === 1 ? 'task' : 'tasks'}</p>
                        <h2 className="text-3xl font-bold">Personal</h2>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${uncompletedTasks.length > 0 ? 24 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Work-Karte */}
                  <div 
                    className="flex-shrink-0 w-[250px] h-[280px] bg-white rounded-xl shadow-md overflow-hidden cursor-pointer"
                    onClick={() => handleSelectCategory('work')}
                  >
                    <div className="p-6 h-full flex flex-col">
                      <div className="flex justify-between items-start mb-5">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                          </svg>
                        </div>
                        <span className="w-8 h-8 flex items-center justify-center text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </span>
                      </div>
                      
                      <div className="mt-auto mb-6">
                        <p className="text-sm font-medium text-gray-500 mb-1">0 tasks</p>
                        <h2 className="text-3xl font-bold">Work</h2>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '0%' }} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Family-Karte */}
                  <div 
                    className="flex-shrink-0 w-[250px] h-[280px] bg-white rounded-xl shadow-md overflow-hidden cursor-pointer"
                    onClick={() => handleSelectCategory('family')}
                  >
                    <div className="p-6 h-full flex flex-col">
                      <div className="flex justify-between items-start mb-5">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                          </svg>
                        </div>
                        <span className="w-8 h-8 flex items-center justify-center text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </span>
                      </div>
                      
                      <div className="mt-auto mb-6">
                        <p className="text-sm font-medium text-gray-500 mb-1">0 tasks</p>
                        <h2 className="text-3xl font-bold">Family</h2>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '0%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
      
      {/* Burger-Menü-Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setMenuOpen(false)}>
          <div className="absolute left-0 top-0 h-full w-[280px] bg-background p-5" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Menü</h2>
              <button 
                onClick={() => setMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/80 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <nav className="space-y-1 mb-8">
              <a 
                href="#" 
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  setMenuOpen(false);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Home</span>
              </a>
              <a 
                href="#" 
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  setMenuOpen(false);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Kalender</span>
              </a>
            </nav>
            
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="flex items-center gap-3 mb-2">
                <img 
                  src="https://i.pravatar.cc/300?img=9" 
                  alt="User avatar" 
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">Steve Doe</p>
                  <p className="text-sm text-muted-foreground">steve@example.com</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <ThemeToggle />
                <button className="text-sm text-muted-foreground">Ausloggen</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
