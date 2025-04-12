import React, { useState } from "react";
import { MainLayout } from "../components/ui/main-layout";
import { TaskList } from "../components/ui/task-list";
import { TaskCardProps } from "../components/ui/task-card";
import { FocusMode } from "../components/ui/focus-mode";

// Sample data - in a real app, this would come from API/state management
const sampleTasks: TaskCardProps[] = [
  {
    id: "1",
    title: "Finish project proposal",
    description: "Complete the project proposal with budget and timeline",
    dueDate: "2023-05-15",
    energyLevel: "high",
    completed: false,
  },
  {
    id: "2",
    title: "Schedule team meeting",
    description: "Set up weekly team meeting for project updates",
    dueDate: "2023-05-10",
    energyLevel: "low",
    completed: false,
  },
  {
    id: "3",
    title: "Research new tools",
    description: "Look into productivity tools for task management",
    energyLevel: "medium",
    completed: true,
  },
  {
    id: "4",
    title: "Update documentation",
    description: "Update the project documentation with recent changes",
    dueDate: "2023-05-20",
    energyLevel: "medium",
    completed: false,
  },
];

export function HomePage() {
  const [tasks, setTasks] = useState<TaskCardProps[]>(sampleTasks);
  const [focusTask, setFocusTask] = useState<TaskCardProps | null>(null);

  const handleToggleComplete = (id: string, completed: boolean) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === id ? { ...task, completed } : task))
    );
  };

  const handleReorderTasks = (reorderedTasks: TaskCardProps[]) => {
    setTasks(reorderedTasks);
  };

  const handleStartFocus = (task: TaskCardProps) => {
    setFocusTask(task);
  };

  const handleExitFocus = () => {
    setFocusTask(null);
  };

  const incompleteTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  return (
    <MainLayout>
      {focusTask ? (
        <FocusMode
          task={{ id: focusTask.id, title: focusTask.title }}
          onExit={handleExitFocus}
          onComplete={() => {
            handleToggleComplete(focusTask.id, true);
            setTimeout(handleExitFocus, 1500);
          }}
        />
      ) : (
        <div className="px-4 py-6 sm:px-6 md:px-8">
          <h1 className="text-2xl font-bold mb-6">Your Tasks</h1>

          <div className="space-y-8">
            {incompleteTasks.length > 0 && (
              <div>
                <h2 className="text-lg font-medium mb-3">To Do</h2>
                <TaskList
                  tasks={incompleteTasks}
                  onReorder={handleReorderTasks}
                  onToggleComplete={handleToggleComplete}
                  onEdit={(id) => {
                    const task = tasks.find((t) => t.id === id);
                    if (task) handleStartFocus(task);
                  }}
                />
              </div>
            )}

            {completedTasks.length > 0 && (
              <div>
                <h2 className="text-lg font-medium mb-3">Completed</h2>
                <TaskList
                  tasks={completedTasks}
                  onToggleComplete={handleToggleComplete}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  );
}
