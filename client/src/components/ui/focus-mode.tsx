import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, PlayCircle, PauseCircle, Timer } from "lucide-react";
import { FocusContainer } from "./focus-container";

interface FocusModeProps {
  task?: {
    id: string;
    title: string;
  };
  initialDuration?: number; // in minutes
  onExit?: () => void;
  onComplete?: () => void;
}

export function FocusMode({
  task,
  initialDuration = 25,
  onExit,
  onComplete,
}: FocusModeProps) {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(initialDuration * 60); // convert to seconds
  const [isPaused, setIsPaused] = useState(true);
  const [showBreakReminder, setShowBreakReminder] = useState(false);

  // Calculate progress percentage
  const progress = 100 - (timeLeft / (initialDuration * 60)) * 100;

  useEffect(() => {
    // Show focus mode active state after component mounts
    const timer = setTimeout(() => {
      setIsActive(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (!isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Time's up
      setShowBreakReminder(true);
      if (onComplete) {
        onComplete();
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPaused, timeLeft, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleTimer = () => {
    setIsPaused((prev) => !prev);
  };

  const handleExit = () => {
    setIsActive(false);
    // Delay the onExit to allow for the animation
    setTimeout(() => {
      if (onExit) onExit();
    }, 300);
  };

  return (
    <FocusContainer active={isActive}>
      <div className="max-w-md mx-auto pt-8 pb-16 px-4 sm:px-6">
        <div className="flex justify-between items-center mb-6">
          <motion.h1
            className="text-2xl font-bold"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Focus Mode
          </motion.h1>

          <motion.button
            className="p-2 rounded-full hover:bg-muted transition-colors"
            onClick={handleExit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="h-5 w-5" />
          </motion.button>
        </div>

        {task && (
          <motion.div
            className="mb-6 p-4 bg-card rounded-lg border border-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="font-medium">Current Task</h2>
            <p className="text-lg font-semibold mt-1">{task.title}</p>
          </motion.div>
        )}

        <motion.div
          className="bg-card rounded-lg border border-border p-6 mb-8 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-4xl font-mono font-bold mb-6">
            {formatTime(timeLeft)}
          </div>

          <div className="relative h-2 bg-muted rounded-full mb-8 overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="flex justify-center gap-4">
            <motion.button
              className="flex items-center justify-center p-3 rounded-full bg-primary text-primary-foreground"
              onClick={toggleTimer}
              whileTap={{ scale: 0.95 }}
            >
              {isPaused ? (
                <PlayCircle className="h-8 w-8" />
              ) : (
                <PauseCircle className="h-8 w-8" />
              )}
            </motion.button>
          </div>
        </motion.div>

        {showBreakReminder && (
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-card p-6 rounded-lg border border-border max-w-md w-full shadow-lg"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <div className="flex justify-center mb-4">
                <Timer className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">
                Time for a break!
              </h3>
              <p className="text-center text-muted-foreground mb-6">
                Great job on your focus session. Take a short break to recharge.
              </p>
              <div className="flex justify-center">
                <motion.button
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                  onClick={() => setShowBreakReminder(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Break
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </FocusContainer>
  );
}
