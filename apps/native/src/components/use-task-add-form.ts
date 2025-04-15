import { useState, FormEvent, useEffect } from "react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { CreateTaskInput, NLPTaskAnalysis } from "@/types";

export interface UseTaskAddFormProps {
  onAddSuccess?: () => void;
}

export function useTaskAddForm({ onAddSuccess }: UseTaskAddFormProps) {
  // State
  const [title, setTitle] = useState("");
  const [energyLevel, setEnergyLevel] = useState<"high" | "medium" | "low">(
    "medium"
  );
  const [category, setCategory] = useState<
    "personal" | "work" | "family" | "health"
  >("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nlpAnalysis, setNlpAnalysis] = useState<NLPTaskAnalysis | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [priority, setPriority] = useState<"high" | "medium" | "low" | null>(
    null
  );
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState<number | null>(
    null
  );
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Speech recognition
  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    supported,
  } = useSpeechRecognition();

  // Update input when transcript changes
  useEffect(() => {
    if (transcript) {
      setTitle(transcript);
    }
  }, [transcript]);

  // Reset NLP analysis if title changes
  useEffect(() => {
    if (nlpAnalysis && title !== nlpAnalysis.title) {
      setNlpAnalysis(null);
    }
  }, [title, nlpAnalysis]);

  // NLP Analysis handler
  const analyzeTaskWithNLP = async () => {
    if (!title.trim() || title.length < 5) {
      toast({
        title: "Zu kurze Beschreibung",
        description:
          "Bitte gib eine ausführlichere Beschreibung für die Analyse ein.",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsAnalyzing(true);
      const response = await apiRequest<NLPTaskAnalysis>(
        "POST",
        "/api/tasks/analyze-nlp",
        { input: title.trim() }
      );
      if (response) {
        setNlpAnalysis(response);
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
          description:
            "Deine Aufgabe wurde erfolgreich analysiert. Ergebnisse wurden im Formular eingetragen.",
        });
      }
    } catch (error) {
      console.error("Fehler bei der NLP-Analyse:", error);
      toast({
        title: "Fehler bei der Analyse",
        description:
          "Die Aufgabe konnte nicht analysiert werden. Bitte versuche es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Utility for energy detection
  const determineEnergyFromTitle = (
    title: string
  ): "high" | "medium" | "low" => {
    const lowEnergyTerms = [
      "entspannen",
      "ausruhen",
      "pause",
      "leicht",
      "einfach",
      "ruhig",
    ];
    const highEnergyTerms = [
      "wichtig",
      "dringend",
      "sofort",
      "kritisch",
      "eilig",
      "schnell",
    ];
    const lowMatch = lowEnergyTerms.some((term) =>
      title.toLowerCase().includes(term)
    );
    const highMatch = highEnergyTerms.some((term) =>
      title.toLowerCase().includes(term)
    );
    if (highMatch) return "high";
    if (lowMatch) return "low";
    return "medium";
  };

  // Form submit handler
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
      const finalTitle = selectedEmoji
        ? `${selectedEmoji} ${title.trim()}`
        : title.trim();
      const taskData: CreateTaskInput = {
        title: finalTitle,
        energyLevel: energyLevel,
        description: description || undefined,
        priority: priority || undefined,
        dueDate: dueDate || undefined,
        category: category,
        estimatedDuration: estimatedDuration || undefined,
      };
      await apiRequest("POST", "/api/tasks", taskData);
      setTitle("");
      setDescription(null);
      setPriority(null);
      setDueDate(null);
      setEstimatedDuration(null);
      setCategory("personal");
      setEnergyLevel("medium");
      resetTranscript();
      setNlpAnalysis(null);
      setShowAdvancedOptions(false);
      toast({
        title: "Aufgabe hinzugefügt",
        description: "Die KI analysiert und unterteilt deine Aufgabe",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      if (onAddSuccess) {
        onAddSuccess();
      }
    } catch (error) {
      console.error("Fehler beim Hinzufügen der Aufgabe:", error);
      toast({
        title: "Fehler",
        description:
          "Die Aufgabe konnte nicht hinzugefügt werden. Bitte versuche es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keypress handler for Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && title.trim()) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  // Voice input handler
  const handleVoiceInput = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  return {
    // Form state
    title,
    setTitle,
    energyLevel,
    setEnergyLevel,
    category,
    setCategory,
    isSubmitting,
    selectedEmoji,
    setSelectedEmoji,
    isAnalyzing,
    nlpAnalysis,
    description,
    setDescription,
    priority,
    setPriority,
    dueDate,
    setDueDate,
    estimatedDuration,
    setEstimatedDuration,
    showAdvancedOptions,
    setShowAdvancedOptions,

    // Voice state
    transcript,
    isListening,
    supported,

    // Handlers
    handleSubmit,
    handleKeyPress,
    handleVoiceInput,
    analyzeTaskWithNLP,
    determineEnergyFromTitle,
  };
}
