import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { TaskWithSteps } from '@/types';
import { formatTime } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface TaskDetailDialogProps {
  task: TaskWithSteps | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailDialog({ task, isOpen, onOpenChange }: TaskDetailDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleCompleteStep = async (stepId: number, completed: boolean) => {
    if (!task) return;
    
    try {
      setIsLoading(true);
      
      await apiRequest('PATCH', `/api/task-steps/${stepId}`, { 
        completed 
      });
      
      // Update cache 
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', task.id] });
      
      toast({
        title: completed ? "Schritt abgeschlossen" : "Schritt wiedereröffnet",
        description: completed ? "Gut gemacht!" : "Du kannst es erneut versuchen.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error updating step:', error);
      toast({
        title: "Fehler",
        description: "Der Schritt konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCompleteTask = async () => {
    if (!task) return;
    
    try {
      setIsLoading(true);
      
      await apiRequest('PATCH', `/api/tasks/${task.id}`, { 
        completed: true 
      });
      
      // Update all tasks cache and close dialog
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      onOpenChange(false);
      
      toast({
        title: "Aufgabe abgeschlossen! 🎉",
        description: "Du hast diese Aufgabe erfolgreich erledigt.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "Fehler",
        description: "Die Aufgabe konnte nicht abgeschlossen werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!task) return null;

  const allStepsCompleted = task.steps.every(step => step.completed);
  const totalSteps = task.steps.length;
  const completedStepsCount = task.steps.filter(step => step.completed).length;
  const progress = Math.round((completedStepsCount / totalSteps) * 100);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">{task.title}</DialogTitle>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
            <span>{completedStepsCount}/{totalSteps} Schritte</span>
            <span>{progress}% erledigt</span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto -mx-6 px-6 py-2">
          {/* Task description */}
          {task.description && (
            <div className="mb-4">
              <p className="text-sm text-card-foreground">{task.description}</p>
            </div>
          )}
          
          {/* Task metadata */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center rounded-full bg-muted px-2 py-1 text-xs">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatTime(task.estimatedDuration || 0)}
            </div>
            
            <div className="flex items-center rounded-full bg-muted px-2 py-1 text-xs">
              <span className="capitalize">{task.priority} Priorität</span>
            </div>
            
            {task.energyLevel && (
              <div className="flex items-center rounded-full bg-muted px-2 py-1 text-xs">
                <span className="capitalize">{task.energyLevel} Energie</span>
              </div>
            )}
          </div>
          
          <Separator className="my-2" />
          
          {/* Task steps */}
          <div className="py-2">
            <h3 className="text-sm font-medium mb-2">Schritte</h3>
            <ul className="space-y-2">
              {task.steps.map((step, index) => (
                <li key={step.id} className="flex items-start gap-2 p-2 rounded hover:bg-muted/40 transition-colors">
                  <button
                    disabled={isLoading}
                    onClick={() => handleCompleteStep(step.id, !step.completed)}
                    className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      step.completed 
                        ? 'border-primary bg-primary text-primary-foreground' 
                        : 'border-muted-foreground'
                    }`}
                  >
                    {step.completed && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <p className={`text-sm ${step.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {step.description}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(step.estimatedDuration || 0)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <DialogFooter className="flex items-center justify-between">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
          >
            Schließen
          </Button>
          
          <div className="flex gap-2">
            <Button
              onClick={handleCompleteTask}
              disabled={isLoading}
              variant="default"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
              ) : null}
              Als erledigt markieren
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}