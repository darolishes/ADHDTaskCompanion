import { useState, FormEvent, useEffect } from 'react';
import { EnergySelector } from '@/components/ui/energy-selector';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { CreateTaskInput } from '@/types';

interface TaskAddFormProps {
  onAddSuccess?: () => void;
}

export function TaskAddForm({ onAddSuccess }: TaskAddFormProps) {
  const [title, setTitle] = useState('');
  const [energyLevel, setEnergyLevel] = useState<string>('medium');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  
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
  
  // Animated entrance
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateIn(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Update input when transcript changes
  useEffect(() => {
    if (transcript) {
      setTitle(transcript);
      setIsExpanded(true);
    }
  }, [transcript]);
  
  const handleInputFocus = () => {
    setIsExpanded(true);
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Task title required",
        description: "Please enter a task description",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const taskData: CreateTaskInput = {
        title: title.trim(),
        energyLevel: energyLevel as "high" | "medium" | "low",
      };
      
      await apiRequest('POST', '/api/tasks', taskData);
      
      // Clear form
      setTitle('');
      setEnergyLevel('medium');
      setIsExpanded(false);
      resetTranscript();
      
      // Show success message
      toast({
        title: "Task added",
        description: "Gemini AI has analyzed and broken down your task",
      });
      
      // Invalidate tasks cache
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      
      // Notify parent component
      if (onAddSuccess) {
        onAddSuccess();
      }
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error adding task",
        description: "There was a problem adding your task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };
  
  return (
    <div 
      className={`transition-all duration-300 ${
        animateIn ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
      }`}
    >
      <form 
        onSubmit={handleSubmit} 
        className="bg-card border border-border rounded-xl shadow-sm transition-all duration-300 ease-in-out overflow-hidden"
      >
        <div className="p-4">
          <div className="relative">
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={handleInputFocus}
              placeholder="What do you need to do?"
              className="w-full p-3 rounded-lg bg-input text-card-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-all"
            />
            
            {supported && (
              <button 
                type="button" 
                onClick={handleVoiceInput}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${
                  isListening 
                    ? 'text-primary bg-primary/10 animate-pulse' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                }`}
                aria-label={isListening ? "Stop recording" : "Record voice input"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="p-4 pt-1">
            <label className="block text-sm font-medium text-foreground mb-2">
              How much energy do you have?
            </label>
            <EnergySelector value={energyLevel} onChange={setEnergyLevel} />
            
            <div className="flex justify-end mt-4">
              <button 
                type="button" 
                onClick={() => setIsExpanded(false)}
                className="px-3 py-1.5 mr-2 border border-border text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              
              <button 
                type="submit" 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center hover:opacity-90 transition-colors disabled:opacity-70"
                disabled={isSubmitting}
              >
                <span>{isSubmitting ? "Processing..." : "Add Task"}</span>
                {isSubmitting ? (
                  <svg className="animate-spin ml-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
      
      {isListening && (
        <div className="text-center mt-2 text-sm text-muted-foreground animate-pulse">
          Listening... speak now
        </div>
      )}
    </div>
  );
}
