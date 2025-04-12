import { useState, FormEvent, useEffect } from 'react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { CreateTaskInput } from '@/types';
import { EmojiSelector } from './emoji-selector';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from '@/lib/utils';

interface TaskAddFormProps {
  onAddSuccess?: () => void;
}

export function TaskAddForm({ onAddSuccess }: TaskAddFormProps) {
  const [title, setTitle] = useState('');
  const [energyLevel, setEnergyLevel] = useState<"high" | "medium" | "low">("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [category, setCategory] = useState<"personal" | "work" | "family" | "health">("personal");
  const [showAdvanced, setShowAdvanced] = useState(false);
  
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
      
      // Automatisch Energielevel aus dem Titel ableiten
      const detectedEnergy = determineEnergyFromTitle(title);
      
      // Wenn ein Emoji ausgewählt wurde, füge es dem Titel hinzu
      const finalTitle = selectedEmoji 
        ? `${selectedEmoji} ${title.trim()}` 
        : title.trim();
      
      const taskData: CreateTaskInput = {
        title: finalTitle,
        energyLevel: showAdvanced ? energyLevel : detectedEnergy,
        description: description || undefined,
        priority: showAdvanced ? priority : undefined,
        dueDate: dueDate || undefined,
        category: showAdvanced ? category : undefined
      };
      
      await apiRequest('POST', '/api/tasks', taskData);
      
      // Formular leeren
      setTitle('');
      setDescription('');
      setDueDate(null);
      setPriority('medium');
      setEnergyLevel('medium');
      setCategory('personal');
      setSelectedEmoji('');
      setShowAdvanced(false);
      resetTranscript();
      
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
      </div>
      
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

      {/* Toggle für erweiterte Optionen */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-xs text-muted-foreground hover:text-foreground mt-2 flex items-center gap-1"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={`h-3 w-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
        {showAdvanced ? "Weniger Optionen" : "Mehr Optionen"}
      </button>

      {/* Erweiterte Optionen */}
      {showAdvanced && (
        <div className="mt-3 space-y-3 text-sm animate-in fade-in-50 duration-300">
          {/* Beschreibung */}
          <div>
            <label htmlFor="description" className="text-xs text-muted-foreground block mb-1">
              Beschreibung
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-card border border-border shadow-sm text-sm placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all h-20 resize-none"
              placeholder="Kurze Beschreibung der Aufgabe..."
            />
          </div>

          {/* Reihe mit Priorität und Energielevel */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="priority" className="text-xs text-muted-foreground block mb-1">
                Priorität
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as "high" | "medium" | "low")}
                className="w-full px-3 py-2 h-10 rounded-lg bg-card border border-border shadow-sm text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
              >
                <option value="low">Niedrig</option>
                <option value="medium">Mittel</option>
                <option value="high">Hoch</option>
              </select>
            </div>
            <div>
              <label htmlFor="energyLevel" className="text-xs text-muted-foreground block mb-1">
                Energiestufe
              </label>
              <select
                id="energyLevel"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(e.target.value as "high" | "medium" | "low")}
                className="w-full px-3 py-2 h-10 rounded-lg bg-card border border-border shadow-sm text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
              >
                <option value="low">Niedrig</option>
                <option value="medium">Mittel</option>
                <option value="high">Hoch</option>
              </select>
            </div>
          </div>

          {/* Reihe mit Fälligkeitsdatum und Kategorie */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Fälligkeitsdatum
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "w-full flex h-10 items-center justify-start rounded-lg bg-card border border-border px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    {dueDate ? format(dueDate, "dd.MM.yyyy") : "Datum auswählen"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate as any}
                    onSelect={(date) => setDueDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label htmlFor="category" className="text-xs text-muted-foreground block mb-1">
                Kategorie
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as "personal" | "work" | "family" | "health")}
                className="w-full px-3 py-2 h-10 rounded-lg bg-card border border-border shadow-sm text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
              >
                <option value="personal">Persönlich</option>
                <option value="work">Arbeit</option>
                <option value="family">Familie</option>
                <option value="health">Gesundheit</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
