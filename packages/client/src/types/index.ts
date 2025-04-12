import { EnergyLevel, PriorityLevel, CategoryType } from "@focus-flow/shared";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: PriorityLevel;
  energyLevel: EnergyLevel | null;
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
  energyLevel: EnergyLevel;
  description?: string;
  priority?: PriorityLevel;
  estimatedDuration?: number;
  dueDate?: string | Date | null;
  category?: CategoryType;
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

export interface NLPTaskAnalysis {
  title: string;
  description: string | null;
  priority: PriorityLevel;
  energyLevel: EnergyLevel | null;
  dueDate: string | null;
  category: CategoryType;
  estimatedDuration: number | null;
}
