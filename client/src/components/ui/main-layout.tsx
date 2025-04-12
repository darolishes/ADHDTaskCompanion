import React from "react";
import { BottomNav } from "./bottom-nav";
import { QuickAddTask } from "./quick-add-task";

interface MainLayoutProps {
  children: React.ReactNode;
  showQuickAdd?: boolean;
}

export function MainLayout({ children, showQuickAdd = true }: MainLayoutProps) {
  // Mock function for quick add - in a real app, this would connect to your state management
  const handleAddTask = (taskText: string) => {
    console.log("Adding task:", taskText);
    // Would dispatch to state manager or API here
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 pb-20">{children}</main>

      {showQuickAdd && <QuickAddTask onAddTask={handleAddTask} />}

      <BottomNav />
    </div>
  );
}
