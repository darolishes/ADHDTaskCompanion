import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums für Aufgabeneigenschaften
export enum EnergyLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export enum PriorityLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export enum CategoryType {
  PERSONAL = "personal",
  WORK = "work",
  FAMILY = "family",
  HEALTH = "health",
}

// Interfaces für die Hauptdatenmodelle
export interface User {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: PriorityLevel;
  energyLevel: EnergyLevel | null;
  estimatedDuration: number | null;
  actualDuration?: number | null;
  completed: boolean;
  completedAt?: Date | null;
  userId: number | null;
  createdAt: Date;
  dueDate: Date | null;
  category?: CategoryType;
  emoji?: string;
  inFocus?: boolean;
}

export interface TaskStep {
  id: number;
  taskId: number;
  description: string;
  order: number;
  completed: boolean;
  completedAt?: Date | null;
  estimatedDuration: number | null;
}

export interface ProductivitySession {
  id: number;
  userId: number | null;
  taskId: number | null;
  startTime: Date;
  endTime?: Date | null;
  duration?: number | null;
  energyLevelBefore?: EnergyLevel | null;
  energyLevelAfter?: EnergyLevel | null;
  interruptions?: number | null;
  productivityScore?: number | null;
  notes?: string | null;
  tags?: string[];
}

export interface ProductivityAnalytic {
  id: number;
  userId: number;
  date: Date;
  totalTasksCompleted: number;
  totalTimeSpent: number; // in minutes
  averageProductivityScore: number | null;
  highEnergyTasksCompleted: number;
  mediumEnergyTasksCompleted: number;
  lowEnergyTasksCompleted: number;
}

export interface TimeBlockPattern {
  id: number;
  userId: number;
  name: string;
  blocks: TimeBlock[];
  isDefault: boolean;
}

export interface TimeBlock {
  id: number;
  timeBlockPatternId: number;
  startTime: string; // Format "HH:MM"
  endTime: string; // Format "HH:MM" 
  activityType: ActivityType;
  energyLevel: EnergyLevel;
}

export enum ActivityType {
  DEEP_WORK = "deep_work",
  SHALLOW_WORK = "shallow_work",
  BREAK = "break",
  MEETING = "meeting",
  EXERCISE = "exercise",
  MEAL = "meal",
  PERSONAL = "personal",
  TRANSIT = "transit",
}

// Schemas für die Validierung von Einfügedaten
export interface InsertUser {
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export interface InsertTask {
  title: string;
  description?: string | null;
  priority: PriorityLevel;
  energyLevel: EnergyLevel | null;
  estimatedDuration?: number | null;
  actualDuration?: number | null;
  completed: boolean;
  completedAt?: Date | null;
  userId?: number | null;
  createdAt?: Date;
  dueDate?: Date | null;
  category?: CategoryType;
  emoji?: string;
  inFocus?: boolean;
}

export interface InsertTaskStep {
  taskId: number;
  description: string;
  order: number;
  completed: boolean;
  completedAt?: Date | null;
  estimatedDuration?: number | null;
}

export interface InsertProductivitySession {
  userId?: number | null;
  taskId?: number | null;
  startTime: Date;
  endTime?: Date | null;
  duration?: number | null;
  energyLevelBefore?: EnergyLevel | null;
  energyLevelAfter?: EnergyLevel | null;
  interruptions?: number | null;
  productivityScore?: number | null;
  notes?: string | null;
  tags?: string[];
}

export interface InsertProductivityAnalytic {
  userId: number;
  date: Date;
  totalTasksCompleted: number;
  totalTimeSpent: number;
  averageProductivityScore: number | null;
  highEnergyTasksCompleted: number;
  mediumEnergyTasksCompleted: number;
  lowEnergyTasksCompleted: number;
}

export interface InsertTimeBlockPattern {
  userId: number;
  name: string;
  blocks: TimeBlock[];
  isDefault: boolean;
}

// Zod-Schemas für Validierung
export const insertUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  passwordHash: z.string(),
  createdAt: z.date().default(() => new Date()),
});

export const insertTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().nullable().optional(),
  priority: z.enum([PriorityLevel.LOW, PriorityLevel.MEDIUM, PriorityLevel.HIGH])
    .default(PriorityLevel.MEDIUM),
  energyLevel: z.enum([EnergyLevel.LOW, EnergyLevel.MEDIUM, EnergyLevel.HIGH]).nullable().optional(),
  estimatedDuration: z.number().positive().nullable().optional(),
  actualDuration: z.number().positive().nullable().optional(),
  completed: z.boolean().default(false),
  completedAt: z.date().nullable().optional(),
  userId: z.number().nullable().optional(),
  createdAt: z.date().default(() => new Date()),
  dueDate: z.date().nullable().optional(),
  category: z.enum([
    CategoryType.PERSONAL, 
    CategoryType.WORK, 
    CategoryType.FAMILY, 
    CategoryType.HEALTH
  ]).default(CategoryType.PERSONAL),
  emoji: z.string().max(4).optional(),
  inFocus: z.boolean().default(false),
});

export const insertTaskStepSchema = z.object({
  taskId: z.number().positive(),
  description: z.string().min(1),
  order: z.number().nonnegative(),
  completed: z.boolean().default(false),
  completedAt: z.date().nullable().optional(),
  estimatedDuration: z.number().positive().nullable().optional(),
});

export const insertProductivitySessionSchema = z.object({
  userId: z.number().nullable().optional(),
  taskId: z.number().nullable().optional(),
  startTime: z.date(),
  endTime: z.date().nullable().optional(),
  duration: z.number().nullable().optional(),
  energyLevelBefore: z.enum([EnergyLevel.LOW, EnergyLevel.MEDIUM, EnergyLevel.HIGH]).nullable().optional(),
  energyLevelAfter: z.enum([EnergyLevel.LOW, EnergyLevel.MEDIUM, EnergyLevel.HIGH]).nullable().optional(),
  interruptions: z.number().nonnegative().nullable().optional(),
  productivityScore: z.number().min(1).max(10).nullable().optional(),
  notes: z.string().nullable().optional(),
  tags: z.array(z.string()).optional().default([]),
});

export const insertProductivityAnalyticSchema = z.object({
  userId: z.number(),
  date: z.date(),
  totalTasksCompleted: z.number().nonnegative(),
  totalTimeSpent: z.number().nonnegative(),
  averageProductivityScore: z.number().min(1).max(10).nullable(),
  highEnergyTasksCompleted: z.number().nonnegative(),
  mediumEnergyTasksCompleted: z.number().nonnegative(),
  lowEnergyTasksCompleted: z.number().nonnegative(),
});

export const insertTimeBlockPatternSchema = z.object({
  userId: z.number(),
  name: z.string().min(1),
  blocks: z.array(z.object({
    id: z.number().optional(),
    timeBlockPatternId: z.number().optional(),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    activityType: z.enum(Object.values(ActivityType) as [string, ...string[]]),
    energyLevel: z.enum([EnergyLevel.LOW, EnergyLevel.MEDIUM, EnergyLevel.HIGH]),
  })),
  isDefault: z.boolean().default(false),
});

// Antworttyp für Produktivitätsanalyse
export interface ProductivityAnalyticsResponse {
  summary: {
    totalTasksCompleted: number;
    totalTimeSpent: number; // in minutes
    averageProductivityScore: number | null;
    mostProductiveTimeOfDay: string | null;
    mostCompletedCategory: string | null;
    energyTrend: {
      highEnergy: number;
      mediumEnergy: number;
      lowEnergy: number;
    };
  };
  dailyStats: Array<{
    date: string;
    tasksCompleted: number;
    timeSpent: number;
    productivityScore: number | null;
  }>;
}

// Interface für TaskWithSteps (zum Abfragen von Aufgaben mit Schritten)
export interface TaskWithSteps extends Task {
  steps: TaskStep[];
}