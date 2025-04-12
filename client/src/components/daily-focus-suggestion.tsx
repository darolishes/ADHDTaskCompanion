import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { TaskWithSteps, EnergyLevel } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getEnergyColor } from "@/lib/utils";

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
      <Card className="w-full mb-6 bg-muted/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Keine Fokusvorschläge verfügbar</CardTitle>
          <CardDescription>
            {data?.motivationalMessage || 'Füge einige Aufgaben hinzu, um Fokusvorschläge zu erhalten.'}
          </CardDescription>
        </CardHeader>
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
                  <Button 
                    size="sm" 
                    onClick={() => onFocusTask(suggestion.taskId)}
                    className="w-full"
                  >
                    Darauf fokussieren
                  </Button>
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