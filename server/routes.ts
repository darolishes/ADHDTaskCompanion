import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { analyzeAndBreakdownTask } from "./gemini";
import {
  insertTaskSchema,
  insertTaskStepSchema,
  EnergyLevel,
  PriorityLevel,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // GET all tasks
  app.get("/api/tasks", async (req: Request, res: Response) => {
    try {
      const tasks = await storage.getTasks();
      return res.json(tasks);
    } catch (error) {
      console.error("Error getting tasks:", error);
      return res.status(500).json({ message: "Failed to get tasks" });
    }
  });

  // GET task with steps by ID
  app.get("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }

      const task = await storage.getTaskWithSteps(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      return res.json(task);
    } catch (error) {
      console.error("Error getting task:", error);
      return res.status(500).json({ message: "Failed to get task" });
    }
  });

  // GET filtered tasks by energy level
  app.get("/api/tasks/energy/:level", async (req: Request, res: Response) => {
    try {
      const energyLevel = req.params.level as EnergyLevel;
      
      if (!Object.values(EnergyLevel).includes(energyLevel)) {
        return res.status(400).json({ message: "Invalid energy level" });
      }
      
      const tasks = await storage.getTasksByEnergyLevel(energyLevel);
      return res.json(tasks);
    } catch (error) {
      console.error("Error getting tasks by energy level:", error);
      return res.status(500).json({ message: "Failed to get tasks" });
    }
  });

  // Create a new task with AI breakdown
  app.post("/api/tasks", async (req: Request, res: Response) => {
    try {
      // Validate basic task info
      const taskSchema = z.object({
        title: z.string().min(1, "Task title is required"),
        energyLevel: z.enum([EnergyLevel.LOW, EnergyLevel.MEDIUM, EnergyLevel.HIGH]),
      });

      const validationResult = taskSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid task data", 
          errors: validationResult.error.format() 
        });
      }
      
      const { title, energyLevel } = validationResult.data;

      // Use Google Gemini to analyze and breakdown the task
      const taskAnalysis = await analyzeAndBreakdownTask(title, energyLevel);
      
      // Create the main task
      const newTask = await storage.createTask({
        title,
        description: taskAnalysis.description,
        priority: taskAnalysis.priority as PriorityLevel,
        energyLevel,
        estimatedDuration: taskAnalysis.estimatedDuration,
        completed: false,
        userId: 1, // Default user ID for now
        dueDate: null,
      });

      // Create all task steps
      const steps = [];
      for (let i = 0; i < taskAnalysis.steps.length; i++) {
        const step = taskAnalysis.steps[i];
        const newStep = await storage.createTaskStep({
          taskId: newTask.id,
          description: step.description,
          order: i,
          completed: false,
          estimatedDuration: step.estimatedDuration,
        });
        steps.push(newStep);
      }

      // Return the task with its steps
      return res.status(201).json({
        ...newTask,
        steps,
      });
    } catch (error) {
      console.error("Error creating task:", error);
      return res.status(500).json({ message: "Failed to create task" });
    }
  });

  // Update a task
  app.patch("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }

      // Check if task exists
      const existingTask = await storage.getTask(taskId);
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Validate update fields
      const updateSchema = insertTaskSchema.partial();
      const validationResult = updateSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid update data", 
          errors: validationResult.error.format() 
        });
      }

      // Typkonvertierung für das Update mit explizitem Cast
      const partialTask: Partial<{
        title: string;
        description: string | null;
        priority: PriorityLevel;
        energyLevel: EnergyLevel | null;
        estimatedDuration: number | null;
        completed: boolean;
        userId: number | null;
        dueDate: Date | null;
      }> = {};

      // Kopieren Sie die Daten aus validationResult.data in partialTask mit Typüberprüfung
      if ('title' in validationResult.data) partialTask.title = validationResult.data.title;
      if ('description' in validationResult.data) partialTask.description = validationResult.data.description;
      if ('estimatedDuration' in validationResult.data) partialTask.estimatedDuration = validationResult.data.estimatedDuration;
      if ('completed' in validationResult.data) partialTask.completed = validationResult.data.completed;
      if ('userId' in validationResult.data) partialTask.userId = validationResult.data.userId;
      if ('dueDate' in validationResult.data) partialTask.dueDate = validationResult.data.dueDate;
      
      // Spezielle Behandlung für die enum-Werte
      if ('priority' in validationResult.data && validationResult.data.priority) {
        const priority = validationResult.data.priority.toLowerCase();
        if (Object.values(PriorityLevel).includes(priority as PriorityLevel)) {
          partialTask.priority = priority as PriorityLevel;
        } else {
          return res.status(400).json({ message: "Invalid priority level" });
        }
      }
      
      if ('energyLevel' in validationResult.data && validationResult.data.energyLevel) {
        const energyLevel = validationResult.data.energyLevel.toLowerCase();
        if (Object.values(EnergyLevel).includes(energyLevel as EnergyLevel)) {
          partialTask.energyLevel = energyLevel as EnergyLevel;
        } else {
          return res.status(400).json({ message: "Invalid energy level" });
        }
      }

      // Update the task
      const updatedTask = await storage.updateTask(taskId, partialTask);
      return res.json(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      return res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Delete a task
  app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }

      const deleted = await storage.deleteTask(taskId);
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }

      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting task:", error);
      return res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Update a task step
  app.patch("/api/task-steps/:id", async (req: Request, res: Response) => {
    try {
      const stepId = parseInt(req.params.id);
      if (isNaN(stepId)) {
        return res.status(400).json({ message: "Invalid step ID" });
      }

      // Validate update fields
      const updateSchema = insertTaskStepSchema.partial();
      const validationResult = updateSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid update data", 
          errors: validationResult.error.format() 
        });
      }

      // Update the step
      const updatedStep = await storage.updateTaskStep(stepId, validationResult.data);
      if (!updatedStep) {
        return res.status(404).json({ message: "Task step not found" });
      }

      return res.json(updatedStep);
    } catch (error) {
      console.error("Error updating task step:", error);
      return res.status(500).json({ message: "Failed to update task step" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
