export interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: "high" | "medium" | "low";
  energyLevel: "high" | "medium" | "low" | null;
  estimatedDuration: number | null;
  completed: boolean;
  userId: number | null;
  createdAt: string | Date;
  dueDate: string | Date | null;
}

export interface TaskStep {
  id: number;
  taskId: number;
  description: string;
  order: number;
  completed: boolean;
  estimatedDuration: number | null;
}

export interface TaskWithSteps extends Task {
  steps: TaskStep[];
}

export type CreateTaskInput = {
  title: string;
  energyLevel: "high" | "medium" | "low";
  description?: string;
  priority?: "high" | "medium" | "low";
  estimatedDuration?: number;
  dueDate?: string | Date | null;
  category?: "personal" | "work" | "family" | "health";
};

export interface WeekDay {
  name: string;
  date: number;
  isToday: boolean;
}

export interface TimerState {
  timeRemaining: number;
  isRunning: boolean;
  totalTime: number;
  progress: number;
}

export interface ModalState {
  isOpen: boolean;
  stepCompleted: boolean;
  taskCompleted: boolean;
}
