import React, { useState } from "react";
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from "date-fns";
import { MainLayout } from "../components/ui/main-layout";
import { TaskCardProps } from "../components/ui/task-card";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

// Sample data - in a real app, this would come from API/state management
const sampleTasks: TaskCardProps[] = [
  {
    id: "1",
    title: "Finish project proposal",
    description: "Complete the project proposal with budget and timeline",
    dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
    energyLevel: "high",
    completed: false,
  },
  {
    id: "2",
    title: "Schedule team meeting",
    description: "Set up weekly team meeting for project updates",
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    energyLevel: "low",
    completed: false,
  },
  {
    id: "3",
    title: "Research new tools",
    description: "Look into productivity tools for task management",
    dueDate: new Date(),
    energyLevel: "medium",
    completed: true,
  },
  {
    id: "4",
    title: "Update documentation",
    description: "Update the project documentation with recent changes",
    dueDate: new Date(new Date().setDate(new Date().getDate() + 4)),
    energyLevel: "medium",
    completed: false,
  },
];

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"week" | "month">("week");

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handlePreviousWeek = () => {
    setCurrentDate((prevDate) => addDays(prevDate, -7));
  };

  const handleNextWeek = () => {
    setCurrentDate((prevDate) => addDays(prevDate, 7));
  };

  const getTasksForDate = (date: Date) => {
    return sampleTasks.filter((task) => {
      const taskDate =
        task.dueDate instanceof Date
          ? task.dueDate
          : new Date(task.dueDate || "");

      return isSameDay(taskDate, date);
    });
  };

  return (
    <MainLayout>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Calendar</h1>

          <div className="flex items-center space-x-2">
            <button
              className={`px-3 py-1 rounded-full text-sm ${
                view === "week"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
              onClick={() => setView("week")}
            >
              Week
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm ${
                view === "month"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
              onClick={() => setView("month")}
            >
              Month
            </button>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border overflow-hidden mb-8">
          <div className="flex justify-between items-center p-4 border-b border-border">
            <button
              className="p-1 rounded-full hover:bg-muted transition-colors"
              onClick={handlePreviousWeek}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
              <span className="font-medium">
                {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
              </span>
            </div>

            <button
              className="p-1 rounded-full hover:bg-muted transition-colors"
              onClick={handleNextWeek}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 divide-x divide-border border-b border-border bg-muted/50">
            {weekDays.map((day, index) => (
              <div key={index} className="p-2 text-center">
                <div className="text-xs text-muted-foreground mb-1">
                  {format(day, "EEE")}
                </div>
                <div
                  className={`text-sm font-medium h-8 w-8 rounded-full flex items-center justify-center mx-auto ${
                    isSameDay(day, new Date())
                      ? "bg-primary text-primary-foreground"
                      : ""
                  }`}
                >
                  {format(day, "d")}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 divide-x divide-border h-96 overflow-y-auto">
            {weekDays.map((day, index) => {
              const tasksForDay = getTasksForDate(day);

              return (
                <div
                  key={index}
                  className={`p-2 min-h-full ${
                    isSameDay(day, new Date()) ? "bg-primary/5" : ""
                  }`}
                >
                  {tasksForDay.length > 0 ? (
                    <div className="space-y-2">
                      {tasksForDay.map((task) => (
                        <div
                          key={task.id}
                          className={`p-2 rounded-md text-xs border-l-2 ${
                            task.completed
                              ? "bg-muted/50 border-muted-foreground/40 line-through"
                              : `bg-card border-${
                                  task.energyLevel === "high"
                                    ? "red"
                                    : task.energyLevel === "medium"
                                      ? "amber"
                                      : "blue"
                                }-500`
                          }`}
                        >
                          <div className="font-medium truncate">
                            {task.title}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">
                        No tasks
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
