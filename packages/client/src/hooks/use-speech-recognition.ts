import { useState, useEffect, useCallback } from 'react';

interface SpeechRecognitionState {
  isListening: boolean;
  transcript: string;
  error: string | null;
}

interface SpeechRecognitionHook extends SpeechRecognitionState {
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  supported: boolean;
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [state, setState] = useState<SpeechRecognitionState>({
    isListening: false,
    transcript: '',
    error: null,
  });

  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    // Check if browser supports speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      setRecognition(recognitionInstance);
      setSupported(true);
    }
    
    return () => {
      if (recognition) {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!recognition) return;
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setState(prev => ({ ...prev, transcript }));
    };
    
    recognition.onerror = (event) => {
      setState(prev => ({ 
        ...prev, 
        error: event.error,
        isListening: false 
      }));
    };
    
    recognition.onend = () => {
      setState(prev => ({ ...prev, isListening: false }));
    };
  }, [recognition]);

  const startListening = useCallback(() => {
    if (!recognition) return;
    
    setState(prev => ({ ...prev, isListening: true, error: null }));
    try {
      recognition.start();
    } catch (error) {
      console.error('Speech recognition error:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to start speech recognition',
        isListening: false 
      }));
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (!recognition) return;
    
    recognition.stop();
    setState(prev => ({ ...prev, isListening: false }));
  }, [recognition]);

  const resetTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '', error: null }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
    supported,
  };
}
