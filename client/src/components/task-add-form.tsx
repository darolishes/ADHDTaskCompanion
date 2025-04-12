import { useState, FormEvent } from 'react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  useState(() => {
    if (transcript) {
      setTitle(transcript);
    }
  }, [transcript]);
  
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
      resetTranscript();
      
      // Show success message
      toast({
        title: "Task added",
        description: "Your task has been added successfully",
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
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-sm">
      <div className="mb-3">
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter your task..."
          className="w-full p-3 rounded-lg border border-neutral-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
        />
      </div>
      
      <EnergySelector value={energyLevel} onChange={setEnergyLevel} />
      
      <div className="flex justify-between items-center mt-4">
        {supported && (
          <button 
            type="button" 
            onClick={handleVoiceInput}
            className={`p-2 rounded-full transition-all ${
              isListening ? 'text-primary bg-primary bg-opacity-10' : 'text-gray-500 hover:bg-neutral-100'
            }`}
            aria-label={isListening ? "Stop recording" : "Record voice input"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
        )}
        
        <button 
          type="submit" 
          className="px-4 py-2 bg-primary text-white rounded-lg flex items-center hover:bg-opacity-90 transition-all disabled:opacity-70"
          disabled={isSubmitting}
        >
          <span>{isSubmitting ? "Adding..." : "Add Task"}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </form>
  );
}
