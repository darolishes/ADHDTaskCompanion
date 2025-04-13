import { useState, FormEvent, useEffect } from 'react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { CreateTaskInput, NLPTaskAnalysis } from '@/types';
import { EmojiSelector } from './emoji-selector';

interface TaskAddFormProps {
  onAddSuccess?: () => void;
}

export function TaskAddForm({ onAddSuccess }: TaskAddFormProps) {
  const [title, setTitle] = useState('');
  const [energyLevel, setEnergyLevel] = useState<"high" | "medium" | "low">("medium");
  const [category, setCategory] = useState<"personal" | "work" | "family" | "health">("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nlpAnalysis, setNlpAnalysis] = useState<NLPTaskAnalysis | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [priority, setPriority] = useState<"high" | "medium" | "low" | null>(null);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState<number | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { 
    transcript, 
    isListening, 
    startListening, 
    stopListening, 
    resetTranscript, 
    supported 
  } = useSpeechRecognition();
  
  // Update input when transcript changes
  useEffect(() => {
    if (transcript) {
      setTitle(transcript);
    }
  }, [transcript]);
  
  // Effekt zum Zurücksetzen der NLP-Analyse, wenn sich der Titel ändert
  useEffect(() => {
    if (nlpAnalysis && title !== nlpAnalysis.title) {
      setNlpAnalysis(null);
    }
  }, [title, nlpAnalysis]);
  
  const analyzeTaskWithNLP = async () => {
    if (!title.trim() || title.length < 5) {
      toast({
        title: "Zu kurze Beschreibung",
        description: "Bitte gib eine ausführlichere Beschreibung für die Analyse ein.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsAnalyzing(true);
      
      const response = await apiRequest<NLPTaskAnalysis>(
        'POST', 
        '/api/tasks/analyze-nlp', 
        { input: title.trim() }
      );
      
      if (response) {
        setNlpAnalysis(response);
        
        // Formularfelder mit Analyseergebnissen aktualisieren
        setTitle(response.title || title);
        setDescription(response.description);
        setPriority(response.priority);
        setDueDate(response.dueDate);
        setEstimatedDuration(response.estimatedDuration);
        setCategory(response.category || "personal");
        setEnergyLevel(response.energyLevel || "medium");
        setShowAdvancedOptions(true);
        
        toast({
          title: "Analyse abgeschlossen",
          description: "Deine Aufgabe wurde erfolgreich analysiert. Ergebnisse wurden im Formular eingetragen.",
        });
      }
    } catch (error) {
      console.error('Fehler bei der NLP-Analyse:', error);
      toast({
        title: "Fehler bei der Analyse",
        description: "Die Aufgabe konnte nicht analysiert werden. Bitte versuche es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const determineEnergyFromTitle = (title: string): "high" | "medium" | "low" => {
    const lowEnergyTerms = ['entspannen', 'ausruhen', 'pause', 'leicht', 'einfach', 'ruhig'];
    const highEnergyTerms = ['wichtig', 'dringend', 'sofort', 'kritisch', 'eilig', 'schnell'];
    
    const lowMatch = lowEnergyTerms.some(term => title.toLowerCase().includes(term));
    const highMatch = highEnergyTerms.some(term => title.toLowerCase().includes(term));
    
    if (highMatch) return "high";
    if (lowMatch) return "low";
    return "medium";
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Aufgabentitel erforderlich",
        description: "Bitte gib einen Titel für deine Aufgabe ein",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Wenn ein Emoji ausgewählt wurde, füge es dem Titel hinzu
      const finalTitle = selectedEmoji 
        ? `${selectedEmoji} ${title.trim()}` 
        : title.trim();
      
      // Erstelle die Aufgabendaten mit allen verfügbaren Informationen aus der NLP-Analyse
      const taskData: CreateTaskInput = {
        title: finalTitle,
        // Verwende die NLP-Analyse oder Fallback-Werte
        energyLevel: energyLevel,
        description: description || undefined,
        priority: priority || undefined,
        dueDate: dueDate || undefined,
        category: category,
        estimatedDuration: estimatedDuration || undefined
      };
      
      await apiRequest('POST', '/api/tasks', taskData);
      
      // Formular leeren
      setTitle('');
      setDescription(null);
      setPriority(null);
      setDueDate(null);
      setEstimatedDuration(null);
      setCategory("personal");
      setEnergyLevel("medium");
      resetTranscript();
      setNlpAnalysis(null);
      setShowAdvancedOptions(false);
      
      // Erfolgsmeldung anzeigen
      toast({
        title: "Aufgabe hinzugefügt",
        description: "Die KI analysiert und unterteilt deine Aufgabe",
      });
      
      // Cache aktualisieren
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      
      // Elternkomponente benachrichtigen
      if (onAddSuccess) {
        onAddSuccess();
      }
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Aufgabe:', error);
      toast({
        title: "Fehler",
        description: "Die Aufgabe konnte nicht hinzugefügt werden. Bitte versuche es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && title.trim()) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };
  
  const handleVoiceInput = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };
  
  return (
    <div className="mb-5">
      <div className="relative">
        <form 
          onSubmit={handleSubmit}
          className="flex items-center gap-1"
        >
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Neue Aufgabe hinzufügen..."
            className="w-full h-10 px-3 py-2 rounded-lg bg-card border border-border shadow-sm text-sm placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
            disabled={isSubmitting}
          />
          
          <div className="flex-shrink-0 flex">
            {supported && (
              <button 
                type="button"
                onClick={handleVoiceInput}
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                  isListening 
                    ? 'text-primary bg-primary/10 animate-pulse' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                aria-label={isListening ? "Aufnahme stoppen" : "Diktat starten"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            )}
            
            <button 
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Aufgabe hinzufügen"
            >
              {isSubmitting ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => setCategory("personal")}
            className={`px-3 py-1 rounded-full text-xs ${
              category === "personal" ? "bg-primary text-white" : "bg-muted"
            }`}
          >
            👤 Persönlich
          </button>
          <button
            type="button"
            onClick={() => setCategory("work")}
            className={`px-3 py-1 rounded-full text-xs ${
              category === "work" ? "bg-primary text-white" : "bg-muted"
            }`}
          >
            💼 Arbeit
          </button>
          <button
            type="button"
            onClick={() => setCategory("family")}
            className={`px-3 py-1 rounded-full text-xs ${
              category === "family" ? "bg-primary text-white" : "bg-muted"
            }`}
          >
            👨‍👩‍👧‍👦 Familie
          </button>
          <button
            type="button"
            onClick={() => setCategory("health")}
            className={`px-3 py-1 rounded-full text-xs ${
              category === "health" ? "bg-primary text-white" : "bg-muted"
            }`}
          >
            🏃 Gesundheit
          </button>
        </div>
      </div>
      
      {/* NLP-Analyse Button */}
      {title.trim().length >= 5 && !isAnalyzing && !nlpAnalysis && (
        <div className="mt-3">
          <button
            type="button"
            onClick={analyzeTaskWithNLP}
            className="w-full py-2 bg-muted hover:bg-muted/80 transition-colors text-sm rounded-lg flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
            Mit KI analysieren
          </button>
        </div>
      )}
      
      {/* Loading-Indikator während der Analyse */}
      {isAnalyzing && (
        <div className="mt-3 flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm">Analysiere Aufgabe mit KI...</span>
        </div>
      )}
      
      {/* Erweiterte Optionen nach der Analyse */}
      {showAdvancedOptions && (
        <div className="mt-3 p-3 bg-card rounded-lg border border-border">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Erweiterte Optionen</h3>
            <button
              type="button"
              onClick={() => setShowAdvancedOptions(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18"></path>
                <path d="M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          {/* Beschreibung */}
          {description && (
            <div className="mb-3">
              <label className="text-xs text-muted-foreground">Beschreibung:</label>
              <div className="mt-1 text-sm bg-background/50 p-2 rounded border border-input">
                {description}
              </div>
            </div>
          )}
          
          {/* Priorität */}
          {priority && (
            <div className="mb-3">
              <label className="text-xs text-muted-foreground">Priorität:</label>
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => setPriority("low")}
                  className={`px-3 py-1 rounded-full text-xs ${priority === "low" ? "bg-green-500 text-white" : "bg-muted"}`}
                >
                  Niedrig
                </button>
                <button
                  type="button"
                  onClick={() => setPriority("medium")}
                  className={`px-3 py-1 rounded-full text-xs ${priority === "medium" ? "bg-yellow-500 text-white" : "bg-muted"}`}
                >
                  Mittel
                </button>
                <button
                  type="button"
                  onClick={() => setPriority("high")}
                  className={`px-3 py-1 rounded-full text-xs ${priority === "high" ? "bg-red-500 text-white" : "bg-muted"}`}
                >
                  Hoch
                </button>
              </div>
            </div>
          )}
          
          {/* Fälligkeitsdatum */}
          {dueDate && (
            <div className="mb-3">
              <label className="text-xs text-muted-foreground">Fällig am:</label>
              <div className="mt-1 text-sm font-medium">
                {new Date(dueDate).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          )}
          
          {/* Geschätzte Dauer */}
          {estimatedDuration && (
            <div className="mb-3">
              <label className="text-xs text-muted-foreground">Geschätzte Dauer:</label>
              <div className="mt-1 text-sm font-medium">
                {estimatedDuration} Minuten
              </div>
            </div>
          )}
        </div>
      )}
      
      {isListening && (
        <div className="text-center mt-2 text-xs text-muted-foreground animate-pulse">
          Ich höre zu... Sprich jetzt
        </div>
      )}
      
      {/* Emoji-Selector anzeigen, wenn der Titel lang genug ist */}
      {title.trim().length >= 3 && (
        <div className="mt-3 mb-1">
          <p className="text-xs text-muted-foreground mb-1">
            Wähle ein Emoji für deine Aufgabe:
          </p>
          <EmojiSelector 
            taskTitle={title}
            onSelect={(emoji) => setSelectedEmoji(emoji)}
            className="mt-1 mb-1"
          />
          {selectedEmoji && (
            <div className="flex items-center mt-1">
              <span className="text-xs text-muted-foreground mr-2">Ausgewähltes Emoji:</span>
              <span className="text-lg">{selectedEmoji}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
