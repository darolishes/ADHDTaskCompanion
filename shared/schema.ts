import { pgTable, text, serial, integer, boolean, timestamp, json, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
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

// Category type enum
export const CategoryType = {
  PERSONAL: "personal",
  WORK: "work",
  FAMILY: "family",
  HEALTH: "health",
} as const;

export type CategoryType = typeof CategoryType[keyof typeof CategoryType];

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
  completedAt: timestamp("completedAt"),
  category: text("category").$type<CategoryType>().default(CategoryType.PERSONAL),
  actualDuration: integer("actualDuration"), // in minutes
});

// Task steps table
export const taskSteps = pgTable("taskSteps", {
  id: serial("id").primaryKey(),
  taskId: integer("taskId").notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  description: text("description").notNull(),
  order: integer("order").notNull(),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completedAt"),
  estimatedDuration: integer("estimatedDuration"), // in minutes
  actualDuration: integer("actualDuration"), // in minutes
});

// Productivity sessions for tracking work periods
export const productivitySessions = pgTable("productivitySessions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id),
  taskId: integer("taskId").references(() => tasks.id, { onDelete: 'set null' }),
  startTime: timestamp("startTime").notNull().defaultNow(),
  endTime: timestamp("endTime"),
  duration: integer("duration"), // in seconds
  interruptions: integer("interruptions").default(0),
  energyLevelBefore: text("energyLevelBefore").$type<EnergyLevel>(),
  energyLevelAfter: text("energyLevelAfter").$type<EnergyLevel>(),
  productivityScore: integer("productivityScore"), // 1-10 scale
  notes: text("notes"),
  tags: text("tags").array(),
});

// Analytics data for productivity insights
export const productivityAnalytics = pgTable("productivityAnalytics", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  date: date("date").notNull(),
  totalTasksCompleted: integer("totalTasksCompleted").default(0),
  totalStepsCompleted: integer("totalStepsCompleted").default(0),
  totalFocusTime: integer("totalFocusTime").default(0), // in seconds
  mostProductiveHour: integer("mostProductiveHour"), // 0-23 hour of day
  leastProductiveHour: integer("leastProductiveHour"), // 0-23 hour of day
  averageProductivity: integer("averageProductivity"), // 1-10 scale
  dominantEnergyLevel: text("dominantEnergyLevel").$type<EnergyLevel>(),
  interruptionsCount: integer("interruptionsCount").default(0),
  longestFocusStreak: integer("longestFocusStreak"), // in minutes
  overestimationRate: integer("overestimationRate"), // percentage
  metadataJson: json("metadataJson").$type<ProductivityMetadata>(),
});

// Time block patterns to identify productivity patterns
export const timeBlockPatterns = pgTable("timeBlockPatterns", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  name: text("name").notNull(),
  startHour: integer("startHour").notNull(), // 0-23
  endHour: integer("endHour").notNull(), // 0-23
  dayOfWeek: integer("dayOfWeek"), // 0-6, null means any day
  effectivenessScore: integer("effectivenessScore"), // 1-10
  taskTypes: text("taskTypes").$type<CategoryType[]>().array(),
  energyLevelMatch: text("energyLevelMatch").$type<EnergyLevel>(),
  timesUsed: integer("timesUsed").default(0),
  averageCompletionRate: integer("averageCompletionRate"), // percentage
  isActive: boolean("isActive").default(true),
});

// Define relations
export const tasksRelations = relations(tasks, ({ many }) => ({
  steps: many(taskSteps),
  sessions: many(productivitySessions),
}));

export const taskStepsRelations = relations(taskSteps, ({ one }) => ({
  task: one(tasks, {
    fields: [taskSteps.taskId],
    references: [tasks.id],
  }),
}));

export const productivitySessionsRelations = relations(productivitySessions, ({ one }) => ({
  task: one(tasks, {
    fields: [productivitySessions.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [productivitySessions.userId],
    references: [users.id],
  }),
}));

export const productivityAnalyticsRelations = relations(productivityAnalytics, ({ one }) => ({
  user: one(users, {
    fields: [productivityAnalytics.userId],
    references: [users.id],
  }),
}));

export const timeBlockPatternsRelations = relations(timeBlockPatterns, ({ one }) => ({
  user: one(users, {
    fields: [timeBlockPatterns.userId],
    references: [users.id],
  }),
}));

// Type for productivity metadata JSON
export type ProductivityMetadata = {
  hourlyBreakdown: {
    hour: number;
    tasksCompleted: number;
    focusTime: number;
    productivity: number;
  }[];
  taskCompletionByCategory: {
    category: CategoryType;
    count: number;
    averageDuration: number;
  }[];
  energyLevelDistribution: {
    level: EnergyLevel;
    percentage: number;
  }[];
  weeklyTrend?: {
    day: number; // 0-6
    productivity: number;
    tasksCompleted: number;
  }[];
};

// Insert schemas
export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  completedAt: true,
  actualDuration: true,
});

export const insertTaskStepSchema = createInsertSchema(taskSteps).omit({
  id: true,
  completedAt: true,
  actualDuration: true,
});

export const insertProductivitySessionSchema = createInsertSchema(productivitySessions).omit({
  id: true,
});

export const insertProductivityAnalyticsSchema = createInsertSchema(productivityAnalytics).omit({
  id: true,
});

export const insertTimeBlockPatternSchema = createInsertSchema(timeBlockPatterns).omit({
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
  createdAt: z.date().or(z.string()).transform(date => new Date(date)),
  dueDate: z.date().or(z.string()).nullable().transform(date => date ? new Date(date) : null),
  completedAt: z.date().or(z.string()).nullable().transform(date => date ? new Date(date) : null),
  category: z.enum([CategoryType.PERSONAL, CategoryType.WORK, CategoryType.FAMILY, CategoryType.HEALTH]).default(CategoryType.PERSONAL),
  actualDuration: z.number().nullable(),
  steps: z.array(z.object({
    id: z.number(), 
    taskId: z.number(),
    description: z.string(),
    order: z.number(),
    completed: z.boolean(),
    completedAt: z.date().or(z.string()).nullable().transform(date => date ? new Date(date) : null),
    estimatedDuration: z.number().nullable(),
    actualDuration: z.number().nullable(),
  })),
});

// Productivity analytics schema
export const productivityAnalyticsSchema = z.object({
  dailySummary: z.object({
    date: z.date(),
    tasksCompleted: z.number(),
    focusTime: z.number(), // minutes
    productivity: z.number(), // 1-10
    mostProductiveTime: z.string(), // e.g. "09:00-11:00"
  }),
  weeklyTrends: z.array(z.object({
    day: z.string(), // e.g. "Monday"
    tasksCompleted: z.number(),
    productivity: z.number(),
  })),
  energyInsights: z.object({
    optimalEnergyLevel: z.enum([EnergyLevel.LOW, EnergyLevel.MEDIUM, EnergyLevel.HIGH]),
    bestTimeForHighPriority: z.string(),
    recommendedBreakPattern: z.string(),
  }),
  taskPatterns: z.object({
    overestimationRate: z.number(), // percentage
    mostEfficientCategory: z.enum([CategoryType.PERSONAL, CategoryType.WORK, CategoryType.FAMILY, CategoryType.HEALTH]),
    recommendedTaskSize: z.number(), // minutes
  }),
});

// Export types
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTaskStep = z.infer<typeof insertTaskStepSchema>;
export type TaskStep = typeof taskSteps.$inferSelect;
export type TaskWithSteps = z.infer<typeof taskWithStepsSchema>;
export type ProductivitySession = typeof productivitySessions.$inferSelect;
export type InsertProductivitySession = z.infer<typeof insertProductivitySessionSchema>;
export type ProductivityAnalytic = typeof productivityAnalytics.$inferSelect;
export type InsertProductivityAnalytic = z.infer<typeof insertProductivityAnalyticsSchema>;
export type TimeBlockPattern = typeof timeBlockPatterns.$inferSelect;
export type InsertTimeBlockPattern = z.infer<typeof insertTimeBlockPatternSchema>;
export type ProductivityAnalyticsResponse = z.infer<typeof productivityAnalyticsSchema>;
