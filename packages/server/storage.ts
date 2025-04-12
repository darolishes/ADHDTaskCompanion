import { 
  users, 
  tasks, 
  taskSteps,
  productivitySessions,
  productivityAnalytics,
  timeBlockPatterns,
  type User, 
  type InsertUser, 
  type Task, 
  type InsertTask, 
  type TaskStep, 
  type InsertTaskStep,
  type TaskWithSteps,
  type EnergyLevel,
  type PriorityLevel,
  type CategoryType,
  type ProductivitySession,
  type InsertProductivitySession,
  type ProductivityAnalytic,
  type InsertProductivityAnalytic,
  type TimeBlockPattern,
  type InsertTimeBlockPattern,
  type ProductivityAnalyticsResponse,
  type ProductivityMetadata,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task operations
  getTasks(): Promise<Task[]>;
  getTasksByEnergyLevel(energyLevel: EnergyLevel): Promise<Task[]>;
  getTasksByPriority(priority: PriorityLevel): Promise<Task[]>;
  getTasksByCategory(category: CategoryType): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  getTaskWithSteps(id: number): Promise<TaskWithSteps | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // TaskStep operations
  getTaskSteps(taskId: number): Promise<TaskStep[]>;
  createTaskStep(taskStep: InsertTaskStep): Promise<TaskStep>;
  updateTaskStep(id: number, taskStep: Partial<TaskStep>): Promise<TaskStep | undefined>;
  deleteTaskStep(id: number): Promise<boolean>;
  
  // Productivity Session operations
  getProductivitySessions(userId: number): Promise<ProductivitySession[]>;
  getProductivitySession(id: number): Promise<ProductivitySession | undefined>;
  createProductivitySession(session: InsertProductivitySession): Promise<ProductivitySession>;
  updateProductivitySession(id: number, session: Partial<ProductivitySession>): Promise<ProductivitySession | undefined>;
  
  // Productivity Analytics operations
  getProductivityAnalytics(userId: number, timeframe: string): Promise<ProductivityAnalyticsResponse>;
  updateProductivityAnalytics(userId: number, date: Date): Promise<void>;
  
  // Time Block Pattern operations
  getTimeBlockPatterns(userId: number): Promise<TimeBlockPattern[]>;
  getTimeBlockPattern(id: number): Promise<TimeBlockPattern | undefined>;
  createTimeBlockPattern(timeBlock: InsertTimeBlockPattern): Promise<TimeBlockPattern>;
  updateTimeBlockPattern(id: number, timeBlock: Partial<TimeBlockPattern>): Promise<TimeBlockPattern | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private taskSteps: Map<number, TaskStep>;
  private productivitySessions: Map<number, ProductivitySession>;
  private productivityAnalytics: Map<number, ProductivityAnalytic>;
  private timeBlockPatterns: Map<number, TimeBlockPattern>;
  private userId: number;
  private taskId: number;
  private taskStepId: number;
  private sessionId: number;
  private analyticsId: number;
  private timeBlockId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.taskSteps = new Map();
    this.productivitySessions = new Map();
    this.productivityAnalytics = new Map();
    this.timeBlockPatterns = new Map();
    this.userId = 1;
    this.taskId = 1;
    this.taskStepId = 1;
    this.sessionId = 1;
    this.analyticsId = 1;
    this.timeBlockId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Task operations
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTasksByEnergyLevel(energyLevel: EnergyLevel): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.energyLevel === energyLevel,
    );
  }

  async getTasksByPriority(priority: PriorityLevel): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.priority === priority,
    );
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTaskWithSteps(id: number): Promise<TaskWithSteps | undefined> {
    const task = this.tasks.get(id);
    
    if (!task) {
      return undefined;
    }
    
    // Get all steps for this task and sort by order
    const steps = Array.from(this.taskSteps.values())
      .filter(step => step.taskId === id)
      .sort((a, b) => a.order - b.order);
    
    return {
      ...task,
      steps,
    };
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskId++;
    const task: Task = { 
      ...insertTask, 
      id, 
      createdAt: new Date() 
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, taskUpdate: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    
    if (!task) {
      return undefined;
    }
    
    const updatedTask = { ...task, ...taskUpdate };
    this.tasks.set(id, updatedTask);
    
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    // Delete all task steps first
    Array.from(this.taskSteps.values())
      .filter(step => step.taskId === id)
      .forEach(step => this.taskSteps.delete(step.id));
    
    // Delete the task
    return this.tasks.delete(id);
  }

  // TaskStep operations
  async getTaskSteps(taskId: number): Promise<TaskStep[]> {
    return Array.from(this.taskSteps.values())
      .filter(step => step.taskId === taskId)
      .sort((a, b) => a.order - b.order);
  }

  async createTaskStep(insertTaskStep: InsertTaskStep): Promise<TaskStep> {
    const id = this.taskStepId++;
    const taskStep: TaskStep = { ...insertTaskStep, id };
    this.taskSteps.set(id, taskStep);
    return taskStep;
  }

  async updateTaskStep(id: number, taskStepUpdate: Partial<TaskStep>): Promise<TaskStep | undefined> {
    const taskStep = this.taskSteps.get(id);
    
    if (!taskStep) {
      return undefined;
    }
    
    const updatedTaskStep = { ...taskStep, ...taskStepUpdate };
    this.taskSteps.set(id, updatedTaskStep);
    
    return updatedTaskStep;
  }

  async deleteTaskStep(id: number): Promise<boolean> {
    return this.taskSteps.delete(id);
  }
}

export const storage = new MemStorage();
