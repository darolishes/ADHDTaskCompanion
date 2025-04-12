import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Energy level enum
export const EnergyLevel = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

export type EnergyLevel = typeof EnergyLevel[keyof typeof EnergyLevel];

// Priority level enum
export const PriorityLevel = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

export type PriorityLevel = typeof PriorityLevel[keyof typeof PriorityLevel];

// Task table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull().$type<PriorityLevel>(),
  energyLevel: text("energyLevel").$type<EnergyLevel>(),
  estimatedDuration: integer("estimatedDuration"), // in minutes
  completed: boolean("completed").notNull().default(false),
  userId: integer("userId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  dueDate: timestamp("dueDate"),
});

// Task steps table
export const taskSteps = pgTable("taskSteps", {
  id: serial("id").primaryKey(),
  taskId: integer("taskId").notNull(),
  description: text("description").notNull(),
  order: integer("order").notNull(),
  completed: boolean("completed").notNull().default(false),
  estimatedDuration: integer("estimatedDuration"), // in minutes
});

// Insert schemas
export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const insertTaskStepSchema = createInsertSchema(taskSteps).omit({
  id: true,
});

// Response schemas with additional fields from AI processing
export const taskWithStepsSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  priority: z.enum([PriorityLevel.LOW, PriorityLevel.MEDIUM, PriorityLevel.HIGH]),
  energyLevel: z.enum([EnergyLevel.LOW, EnergyLevel.MEDIUM, EnergyLevel.HIGH]).nullable(),
  estimatedDuration: z.number().nullable(),
  completed: z.boolean(),
  userId: z.number().nullable(),
  createdAt: z.date(),
  dueDate: z.date().nullable(),
  steps: z.array(z.object({
    id: z.number(), 
    taskId: z.number(),
    description: z.string(),
    order: z.number(),
    completed: z.boolean(),
    estimatedDuration: z.number().nullable(),
  })),
});

// Export types
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTaskStep = z.infer<typeof insertTaskStepSchema>;
export type TaskStep = typeof taskSteps.$inferSelect;
export type TaskWithSteps = z.infer<typeof taskWithStepsSchema>;
