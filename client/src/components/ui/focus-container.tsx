import React from "react";
import { motion } from "framer-motion";
import "./focus-container.css";

interface FocusContainerProps {
  children: React.ReactNode;
  active: boolean;
}

export function FocusContainer({ children, active }: FocusContainerProps) {
  return (
    <motion.div
      className={`focus-mode-container relative overflow-hidden ${active ? "focus-mode-active" : ""}`}
      animate={{
        backgroundColor: active ? "var(--bg-focus)" : "var(--bg-default)",
      }}
      transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
    >
      <motion.div
        className="focus-content"
        animate={{
          scale: active ? 0.98 : 1,
          filter: active ? "blur(0px)" : "blur(0px)",
        }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>

      {active && (
        <motion.div
          className="focus-mode-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.div>
  );
}
