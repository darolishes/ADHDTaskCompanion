import React, { useState } from "react";
import { Plus, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QuickAddTaskProps {
  onAddTask: (taskText: string) => void;
}

export function QuickAddTask({ onAddTask }: QuickAddTaskProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [taskText, setTaskText] = useState("");
  const [isListening, setIsListening] = useState(false);

  const handleAddTask = () => {
    if (taskText.trim()) {
      onAddTask(taskText);
      setTaskText("");
      setIsExpanded(false);
    }
  };

  const toggleVoiceInput = () => {
    if (!isListening) {
      if (
        "SpeechRecognition" in window ||
        "webkitSpeechRecognition" in window
      ) {
        setIsListening(true);

        // This is a simulation - in a real app, you'd use the Web Speech API
        setTimeout(() => {
          setIsListening(false);
          setTaskText("Voice input task example");
        }, 1500);
      } else {
        // Show notification that browser doesn't support speech recognition
        console.log("Speech recognition not supported in this browser");
      }
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            className="flex items-center bg-card p-2 rounded-full shadow-lg"
            initial={{ opacity: 0, y: 20, width: 60 }}
            animate={{ opacity: 1, y: 0, width: 300 }}
            exit={{ opacity: 0, y: 20, width: 60 }}
            transition={{ duration: 0.2 }}
          >
            <input
              type="text"
              className="flex-1 bg-transparent border-none focus:outline-none px-3 text-foreground"
              placeholder="Add a task..."
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              autoFocus
            />

            <motion.button
              className={`p-2 rounded-full mr-1 ${isListening ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
              onClick={toggleVoiceInput}
              whileTap={{ scale: 0.9 }}
            >
              <Mic className="h-5 w-5" />
            </motion.button>

            <motion.button
              className="p-2 rounded-full bg-primary text-primary-foreground"
              onClick={handleAddTask}
              whileTap={{ scale: 0.9 }}
              disabled={!taskText.trim()}
            >
              <Plus className="h-5 w-5" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.button
            className="p-4 rounded-full bg-primary text-primary-foreground shadow-lg"
            onClick={() => setIsExpanded(true)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Plus className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
