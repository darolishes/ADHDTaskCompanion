import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TaskWithSteps, EnergyLevel } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle2, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getEnergyColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DailyFocusSuggestionProps {
  currentEnergyLevel: EnergyLevel;
  onFocusTask: (taskId: number) => void;
}

interface FocusSuggestion {
  taskId: number;
  reason: string;
  task: TaskWithSteps | null;
}

interface FocusResponse {
  topTasks: FocusSuggestion[];
  motivationalMessage: string;
}

export function DailyFocusSuggestion({ currentEnergyLevel, onFocusTask }: DailyFocusSuggestionProps) {
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, isError, error } = useQuery<FocusResponse>({
    queryKey: ['/api/focus/daily', currentEnergyLevel],
    queryFn: async () => {
      const response = await fetch(`/api/focus/daily?energyLevel=${currentEnergyLevel}`);
      if (!response.ok) {
        throw new Error('Failed to fetch daily focus suggestions');
      }
      return response.json();
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 15, // 15 Minuten Frische
  });

  if (isLoading) {
    return (
      <Card className="w-full mb-6 bg-accent/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Tägliche Fokusvorschläge werden geladen...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="w-full mb-6 bg-destructive/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Fehler beim Laden der Fokusvorschläge
          </CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : 'Unbekannter Fehler'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!data || data.topTasks.length === 0) {
    return (
      <Card className="w-full mb-6 bg-accent/10 border-dashed">
        <CardHeader className="pb-2 text-center">
          <CardTitle className="text-xl flex items-center justify-center gap-2">
            <span className="text-2xl">✨</span>
            Zeit für neue Abenteuer
          </CardTitle>
          <CardDescription className="text-center">
            "Der beste Weg, die Zukunft vorherzusagen, ist sie zu gestalten."
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center pb-4">
          <Button
            variant="outline" 
            size="sm"
            onClick={() => window.location.hash = '#add-task'}
          >
            Neue Aufgabe erstellen
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full mb-6 bg-accent/30 border-accent/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Dein Tagesfokus
        </CardTitle>
        <CardDescription>
          {data.motivationalMessage}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <ul className="space-y-3">
          {data.topTasks.slice(0, expanded ? undefined : 1).map((suggestion) => (
            <li key={suggestion.taskId} className="bg-background rounded-lg p-3 shadow-sm">
              {suggestion.task ? (
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium">{suggestion.task.title}</h3>
                    <Badge variant="outline" 
                      className={`${getEnergyColor(suggestion.task.energyLevel || "medium")}`}>
                      {suggestion.task.energyLevel}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{suggestion.reason}</p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => onFocusTask(suggestion.taskId)}
                      className="flex-1"
                    >
                      Details anzeigen
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-none"
                      onClick={async () => {
                        try {
                          const result = await apiRequest('PATCH', `/api/tasks/${suggestion.taskId}/focus`, {});
                          
                          // Benachrichtigung anzeigen
                          toast({
                            title: result.inFocus ? "Aufgabe fokussiert" : "Fokus entfernt",
                            description: result.inFocus 
                              ? "Die Aufgabe wurde in den Fokus gesetzt." 
                              : "Die Aufgabe wurde aus dem Fokus entfernt.",
                          });
                          
                          // Daten aktualisieren
                          queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
                          queryClient.invalidateQueries({ queryKey: ['/api/focus/tasks'] });
                        } catch (error) {
                          console.error('Fehler beim Ändern des Fokus-Status:', error);
                          toast({
                            title: "Fehler",
                            description: "Der Fokus-Status konnte nicht geändert werden.",
                            variant: "destructive",
                          });
                        }
                      }}
                      title={suggestion.task?.inFocus ? "Fokus entfernen" : "Zu Fokus hinzufügen"}
                    >
                      <Star className={`h-4 w-4 ${suggestion.task?.inFocus ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aufgabe nicht gefunden</p>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
      {data.topTasks.length > 1 && (
        <CardFooter>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="w-full text-xs"
          >
            {expanded ? 'Weniger anzeigen' : `${data.topTasks.length - 1} weitere Vorschläge anzeigen`}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}