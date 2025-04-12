import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface EmojiSelectorProps {
  taskTitle: string;
  taskDescription?: string;
  onSelect: (emoji: string) => void;
  className?: string;
}

export function EmojiSelector({ taskTitle, taskDescription, onSelect, className = '' }: EmojiSelectorProps) {
  const [emojis, setEmojis] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const { toast } = useToast();

  // Standardemojis für den Fall, dass die API fehlschlägt
  const defaultEmojis = ["📝", "✅", "⏰", "🎯", "🔔"];

  // Wenn sich der Aufgabentitel ändert, hole neue Emoji-Vorschläge
  useEffect(() => {
    if (taskTitle.trim().length < 3) {
      // Zu kurze Titel geben oft schlechte Vorschläge
      setEmojis(defaultEmojis);
      return;
    }

    const fetchEmojiSuggestions = async () => {
      try {
        setLoading(true);
        const response = await apiRequest<{ emojis: string[] }>(
          'POST',
          '/api/tasks/emoji-suggestions',
          { title: taskTitle, description: taskDescription }
        );
        
        if (response && response.emojis && response.emojis.length > 0) {
          setEmojis(response.emojis);
        } else {
          setEmojis(defaultEmojis);
        }
      } catch (error) {
        console.error('Fehler beim Abrufen von Emoji-Vorschlägen:', error);
        setEmojis(defaultEmojis);
      } finally {
        setLoading(false);
      }
    };

    // Debounce mit Timeout, um die API nicht bei jedem Tastendruck aufzurufen
    const timer = setTimeout(() => {
      fetchEmojiSuggestions();
    }, 600);

    return () => clearTimeout(timer);
  }, [taskTitle, taskDescription]);

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    onSelect(emoji);
    toast({
      title: "Emoji ausgewählt",
      description: `Du hast ${emoji} als Symbol für deine Aufgabe ausgewählt.`,
      variant: "default",
    });
  };

  if (loading) {
    return (
      <div className={`flex justify-center space-x-2 py-2 ${className}`}>
        <div className="animate-pulse w-6 h-6 rounded-full bg-muted-foreground/20"></div>
        <div className="animate-pulse w-6 h-6 rounded-full bg-muted-foreground/20"></div>
        <div className="animate-pulse w-6 h-6 rounded-full bg-muted-foreground/20"></div>
        <div className="animate-pulse w-6 h-6 rounded-full bg-muted-foreground/20"></div>
        <div className="animate-pulse w-6 h-6 rounded-full bg-muted-foreground/20"></div>
      </div>
    );
  }

  return (
    <div className={`flex justify-center space-x-2 py-2 ${className}`}>
      {emojis.map((emoji, index) => (
        <button
          key={`${emoji}-${index}`}
          type="button"
          onClick={() => handleEmojiSelect(emoji)}
          className={`w-8 h-8 text-lg flex items-center justify-center rounded-full transition-all
            ${selectedEmoji === emoji 
              ? 'bg-primary/15 ring-2 ring-primary' 
              : 'hover:bg-muted'}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}