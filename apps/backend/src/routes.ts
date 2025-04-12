import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  analyzeAndBreakdownTask,
  getDailyFocusSuggestions,
  predictTaskEmoji,
  analyzeNaturalLanguageTask,
} from "@adhd/ai-helpers";
import {
  insertTaskSchema,
  insertTaskStepSchema,
  insertProductivitySessionSchema,
  insertTimeBlockPatternSchema,
  EnergyLevel,
  PriorityLevel,
  CategoryType,
} from "@adhd/schema";

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
        energyLevel: z.enum([
          EnergyLevel.LOW,
          EnergyLevel.MEDIUM,
          EnergyLevel.HIGH,
        ]),
        description: z.string().optional(),
        priority: z
          .enum([PriorityLevel.LOW, PriorityLevel.MEDIUM, PriorityLevel.HIGH])
          .optional(),
        estimatedDuration: z.number().positive().optional(),
        dueDate: z.string().optional().nullable(),
        category: z
          .enum([
            CategoryType.PERSONAL,
            CategoryType.WORK,
            CategoryType.FAMILY,
            CategoryType.HEALTH,
          ])
          .optional(),
      });

      const validationResult = taskSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid task data",
          errors: validationResult.error.format(),
        });
      }

      const {
        title,
        energyLevel,
        description: userDescription,
        priority: userPriority,
        estimatedDuration: userEstimatedDuration,
        dueDate,
        category,
      } = validationResult.data;

      // Use Google Gemini to analyze and breakdown the task
      const taskAnalysis = await analyzeAndBreakdownTask(title, energyLevel);

      // Create the main task
      const newTask = await storage.createTask({
        title,
        description: userDescription || taskAnalysis.description,
        priority: userPriority || (taskAnalysis.priority as PriorityLevel),
        energyLevel,
        estimatedDuration:
          userEstimatedDuration || taskAnalysis.estimatedDuration,
        completed: false,
        userId: 1, // Default user ID for now
        dueDate: dueDate ? new Date(dueDate) : null,
        category: category || CategoryType.PERSONAL,
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
          errors: validationResult.error.format(),
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
      if ("title" in validationResult.data)
        partialTask.title = validationResult.data.title;
      if ("description" in validationResult.data)
        partialTask.description = validationResult.data.description;
      if ("estimatedDuration" in validationResult.data)
        partialTask.estimatedDuration = validationResult.data.estimatedDuration;
      if ("completed" in validationResult.data)
        partialTask.completed = validationResult.data.completed;
      if ("userId" in validationResult.data)
        partialTask.userId = validationResult.data.userId;
      if ("dueDate" in validationResult.data)
        partialTask.dueDate = validationResult.data.dueDate;

      // Spezielle Behandlung für die enum-Werte
      if (
        "priority" in validationResult.data &&
        validationResult.data.priority
      ) {
        const priority = validationResult.data.priority.toLowerCase();
        if (Object.values(PriorityLevel).includes(priority as PriorityLevel)) {
          partialTask.priority = priority as PriorityLevel;
        } else {
          return res.status(400).json({ message: "Invalid priority level" });
        }
      }

      if (
        "energyLevel" in validationResult.data &&
        validationResult.data.energyLevel
      ) {
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
          errors: validationResult.error.format(),
        });
      }

      // If step is being marked as completed, add completedAt timestamp
      const updateData = { ...validationResult.data };
      if (updateData.completed === true) {
        updateData.completedAt = new Date();
      }

      // Update the step
      const updatedStep = await storage.updateTaskStep(stepId, updateData);
      if (!updatedStep) {
        return res.status(404).json({ message: "Task step not found" });
      }

      // If the step is being marked as completed, check if all steps for this task are completed
      if (updateData.completed === true) {
        const task = await storage.getTaskWithSteps(updatedStep.taskId);
        if (task && task.steps.every((step) => step.completed)) {
          // If all steps are completed, mark the task as completed
          await storage.updateTask(updatedStep.taskId, {
            completed: true,
            completedAt: new Date(),
          });
        }
      }

      return res.json(updatedStep);
    } catch (error) {
      console.error("Error updating task step:", error);
      return res.status(500).json({ message: "Failed to update task step" });
    }
  });

  // ---------- PRODUCTIVITY ANALYTICS ENDPOINTS ----------

  // GET tasks by category
  app.get(
    "/api/tasks/category/:category",
    async (req: Request, res: Response) => {
      try {
        const category = req.params.category as CategoryType;

        if (!Object.values(CategoryType).includes(category)) {
          return res.status(400).json({ message: "Invalid category" });
        }

        const tasks = await storage.getTasksByCategory(category);
        return res.json(tasks);
      } catch (error) {
        console.error("Error getting tasks by category:", error);
        return res.status(500).json({ message: "Failed to get tasks" });
      }
    }
  );

  // Start a productivity session
  app.post(
    "/api/productivity/sessions",
    async (req: Request, res: Response) => {
      try {
        // Validate session data
        const sessionSchema = z.object({
          taskId: z.number().optional(),
          energyLevelBefore: z
            .enum([EnergyLevel.LOW, EnergyLevel.MEDIUM, EnergyLevel.HIGH])
            .optional(),
          tags: z.array(z.string()).optional(),
        });

        const validationResult = sessionSchema.safeParse(req.body);
        if (!validationResult.success) {
          return res.status(400).json({
            message: "Invalid session data",
            errors: validationResult.error.format(),
          });
        }

        const { taskId, energyLevelBefore, tags } = validationResult.data;

        const session = await storage.createProductivitySession({
          userId: 1, // Default user ID for now
          taskId,
          startTime: new Date(),
          energyLevelBefore,
          tags: tags || [],
        });

        return res.status(201).json(session);
      } catch (error) {
        console.error("Error starting productivity session:", error);
        return res
          .status(500)
          .json({ message: "Failed to start productivity session" });
      }
    }
  );

  // End a productivity session
  app.post(
    "/api/productivity/sessions/:id/end",
    async (req: Request, res: Response) => {
      try {
        const sessionId = parseInt(req.params.id);
        if (isNaN(sessionId)) {
          return res.status(400).json({ message: "Invalid session ID" });
        }

        // Validate end session data
        const endSessionSchema = z.object({
          energyLevelAfter: z
            .enum([EnergyLevel.LOW, EnergyLevel.MEDIUM, EnergyLevel.HIGH])
            .optional(),
          interruptions: z.number().min(0).optional(),
          productivityScore: z.number().min(1).max(10).optional(),
          notes: z.string().optional(),
        });

        const validationResult = endSessionSchema.safeParse(req.body);
        if (!validationResult.success) {
          return res.status(400).json({
            message: "Invalid session data",
            errors: validationResult.error.format(),
          });
        }

        // Get the current session
        const session = await storage.getProductivitySession(sessionId);
        if (!session) {
          return res.status(404).json({ message: "Session not found" });
        }

        // If session is already ended
        if (session.endTime) {
          return res.status(400).json({ message: "Session already ended" });
        }

        const { energyLevelAfter, interruptions, productivityScore, notes } =
          validationResult.data;
        const endTime = new Date();

        // Calculate duration in seconds
        const startTime = new Date(session.startTime);
        const duration = Math.floor(
          (endTime.getTime() - startTime.getTime()) / 1000
        );

        // Update the session
        const updatedSession = await storage.updateProductivitySession(
          sessionId,
          {
            endTime,
            duration,
            energyLevelAfter,
            interruptions,
            productivityScore,
            notes,
          }
        );

        // If this session is linked to a task, update the task's actual duration
        if (session.taskId) {
          const task = await storage.getTask(session.taskId);
          if (task) {
            const actualDuration =
              (task.actualDuration || 0) + Math.floor(duration / 60);
            await storage.updateTask(session.taskId, { actualDuration });
          }
        }

        // Generate or update daily analytics
        await storage.updateProductivityAnalytics(session.userId || 1, endTime);

        return res.json(updatedSession);
      } catch (error) {
        console.error("Error ending productivity session:", error);
        return res
          .status(500)
          .json({ message: "Failed to end productivity session" });
      }
    }
  );

  // Emoji-Vorschläge für Aufgaben generieren
  app.post(
    "/api/tasks/emoji-suggestions",
    async (req: Request, res: Response) => {
      try {
        // Validiere die Anfrage
        const requestSchema = z.object({
          title: z.string().min(1, "Task title is required"),
          description: z.string().optional().nullable(),
        });

        const validationResult = requestSchema.safeParse(req.body);
        if (!validationResult.success) {
          return res.status(400).json({
            message: "Invalid request data",
            errors: validationResult.error.format(),
          });
        }

        const { title, description = "" } = validationResult.data;

        // Rufe die Gemini-API für Emoji-Vorhersagen auf
        const emojis = await predictTaskEmoji(title, description || "");

        return res.json({ emojis });
      } catch (error) {
        console.error("Error generating emoji suggestions:", error);
        return res
          .status(500)
          .json({ message: "Failed to generate emoji suggestions" });
      }
    }
  );

  // Fokus für eine Aufgabe setzen oder entfernen
  app.patch("/api/tasks/:id/focus", async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Ungültige Aufgaben-ID" });
      }

      // Prüfen, ob die Aufgabe existiert
      const existingTask = await storage.getTask(taskId);
      if (!existingTask) {
        return res.status(404).json({ message: "Aufgabe nicht gefunden" });
      }

      // Fokus-Status umschalten
      const focusUpdate = {
        inFocus: !existingTask.inFocus,
        focusedAt: !existingTask.inFocus ? new Date() : null,
      };

      // Aufgabe aktualisieren
      const updatedTask = await storage.updateTask(taskId, focusUpdate);

      // Wenn Fokus entfernt wird, Erfolg melden
      if (!focusUpdate.inFocus) {
        return res.json({
          ...updatedTask,
          message: "Fokus wurde entfernt",
        });
      }

      // Wenn Fokus gesetzt wird, alle anderen Aufgaben aus dem Fokus nehmen
      const allTasks = await storage.getTasks();
      const otherFocusedTasks = allTasks.filter(
        (task) => task.id !== taskId && task.inFocus
      );

      // Alle anderen Aufgaben aus dem Fokus nehmen
      for (const task of otherFocusedTasks) {
        await storage.updateTask(task.id, {
          inFocus: false,
          focusedAt: null,
        });
      }

      return res.json({
        ...updatedTask,
        message: "Fokus wurde gesetzt",
      });
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Fokus:", error);
      return res
        .status(500)
        .json({ message: "Fehler beim Aktualisieren des Fokus" });
    }
  });

  // Fokussierte Aufgaben abrufen
  app.get("/api/focus/tasks", async (req: Request, res: Response) => {
    try {
      const allTasks = await storage.getTasks();
      const focusedTasks = await Promise.all(
        allTasks
          .filter((task) => task.inFocus)
          .map(async (task) => {
            // Vollständige Aufgabe mit Schritten abrufen
            const taskWithSteps = await storage.getTaskWithSteps(task.id);
            return taskWithSteps;
          })
      );

      return res.json(focusedTasks);
    } catch (error) {
      console.error("Fehler beim Abrufen fokussierter Aufgaben:", error);
      return res
        .status(500)
        .json({ message: "Fehler beim Abrufen fokussierter Aufgaben" });
    }
  });

  // Get daily focus suggestions
  // Analysiere natürlichsprachliche Aufgabenbeschreibung
  app.post("/api/tasks/analyze-nlp", async (req: Request, res: Response) => {
    try {
      // Validiere die Anfrage
      const requestSchema = z.object({
        input: z
          .string()
          .min(3, "Aufgabenbeschreibung muss mindestens 3 Zeichen lang sein"),
      });

      const validationResult = requestSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Ungültige Anfragedaten",
          errors: validationResult.error.format(),
        });
      }

      const { input } = validationResult.data;

      // Rufe die Gemini-API für NLP-Analyse auf
      const analysis = await analyzeNaturalLanguageTask(input);

      return res.json(analysis);
    } catch (error) {
      console.error("Fehler bei der NLP-Analyse:", error);
      return res
        .status(500)
        .json({ message: "Fehler bei der Analyse der Aufgabenbeschreibung" });
    }
  });

  app.get("/api/focus/daily", async (req: Request, res: Response) => {
    try {
      const energyLevelParam = req.query.energyLevel as EnergyLevel | undefined;
      // Standardmäßig nehmen wir mittlere Energie an, wenn nichts angegeben ist
      const energyLevel = energyLevelParam || EnergyLevel.MEDIUM;

      // Hole alle Aufgaben
      const tasks = await storage.getTasks();

      // Hole KI-Vorschläge für täglichen Fokus
      const focusSuggestions = await getDailyFocusSuggestions(
        tasks,
        energyLevel
      );

      // Ergänze die vollständigen Aufgabeninformationen
      const enrichedSuggestions = {
        ...focusSuggestions,
        topTasks: await Promise.all(
          focusSuggestions.topTasks.map(async (suggestion) => {
            const task = await storage.getTaskWithSteps(suggestion.taskId);
            return {
              ...suggestion,
              task: task || null,
            };
          })
        ),
      };

      res.status(200).json(enrichedSuggestions);
    } catch (error) {
      console.error("Error getting daily focus suggestions:", error);
      res.status(500).json({ error: "Failed to get focus suggestions" });
    }
  });

  // Get productivity analytics
  app.get(
    "/api/productivity/analytics",
    async (req: Request, res: Response) => {
      try {
        const userId = 1; // Default user ID for now

        // Parse timeframe from query params
        let timeframe = (req.query.timeframe as string) || "week";
        if (!["day", "week", "month", "year"].includes(timeframe)) {
          timeframe = "week";
        }

        const analytics = await storage.getProductivityAnalytics(
          userId,
          timeframe
        );

        return res.json(analytics);
      } catch (error) {
        console.error("Error fetching productivity analytics:", error);
        return res
          .status(500)
          .json({ message: "Failed to fetch productivity analytics" });
      }
    }
  );

  // Get time block patterns
  app.get(
    "/api/productivity/time-blocks",
    async (req: Request, res: Response) => {
      try {
        const userId = 1; // Default user ID for now
        const timeBlocks = await storage.getTimeBlockPatterns(userId);

        return res.json(timeBlocks);
      } catch (error) {
        console.error("Error fetching time blocks:", error);
        return res.status(500).json({ message: "Failed to fetch time blocks" });
      }
    }
  );

  // Create a time block pattern
  app.post(
    "/api/productivity/time-blocks",
    async (req: Request, res: Response) => {
      try {
        // Validate time block data
        const timeBlockSchema = z.object({
          name: z.string().min(1, "Name is required"),
          startHour: z.number().min(0).max(23),
          endHour: z.number().min(0).max(23),
          dayOfWeek: z.number().min(0).max(6).optional(),
          energyLevelMatch: z
            .enum([EnergyLevel.LOW, EnergyLevel.MEDIUM, EnergyLevel.HIGH])
            .optional(),
          taskTypes: z
            .array(
              z.enum([
                CategoryType.PERSONAL,
                CategoryType.WORK,
                CategoryType.FAMILY,
                CategoryType.HEALTH,
              ])
            )
            .optional(),
        });

        const validationResult = timeBlockSchema.safeParse(req.body);
        if (!validationResult.success) {
          return res.status(400).json({
            message: "Invalid time block data",
            errors: validationResult.error.format(),
          });
        }

        const {
          name,
          startHour,
          endHour,
          dayOfWeek,
          energyLevelMatch,
          taskTypes,
        } = validationResult.data;

        const timeBlock = await storage.createTimeBlockPattern({
          userId: 1, // Default user ID for now
          name,
          startHour,
          endHour,
          dayOfWeek,
          energyLevelMatch,
          taskTypes: taskTypes || [],
          effectivenessScore: 5, // Default middle score
          timesUsed: 0,
          averageCompletionRate: 0,
          isActive: true,
        });

        return res.status(201).json(timeBlock);
      } catch (error) {
        console.error("Error creating time block pattern:", error);
        return res
          .status(500)
          .json({ message: "Failed to create time block pattern" });
      }
    }
  );

  const httpServer = createServer(app);
  return httpServer;
}
