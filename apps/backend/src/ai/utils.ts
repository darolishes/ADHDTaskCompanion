import { EnergyLevel, PriorityLevel, CategoryType, Task } from '../schema';
import { NLPTaskAnalysisResponse, DailyFocusResponse } from './types';

/**
 * Validates the priority value
 */
export function validatePriority(priority: string): PriorityLevel {
  const normalizedPriority = priority?.toLowerCase() || '';
  
  if (normalizedPriority === PriorityLevel.HIGH || 
      normalizedPriority === PriorityLevel.MEDIUM || 
      normalizedPriority === PriorityLevel.LOW) {
    return normalizedPriority as PriorityLevel;
  }
  
  return PriorityLevel.MEDIUM; // Default priority
}

/**
 * Validates the energy level value
 */
export function validateEnergyLevel(energyLevel: string | null): EnergyLevel | null {
  if (!energyLevel) return null;
  
  const normalizedEnergyLevel = energyLevel.toLowerCase();
  
  if (normalizedEnergyLevel === EnergyLevel.HIGH || 
      normalizedEnergyLevel === EnergyLevel.MEDIUM || 
      normalizedEnergyLevel === EnergyLevel.LOW) {
    return normalizedEnergyLevel as EnergyLevel;
  }
  
  return null;
}

/**
 * Validates the category value
 */
export function validateCategory(category: string): CategoryType {
  const normalizedCategory = category?.toLowerCase() || '';
  
  if (normalizedCategory === CategoryType.PERSONAL || 
      normalizedCategory === CategoryType.WORK || 
      normalizedCategory === CategoryType.FAMILY || 
      normalizedCategory === CategoryType.HEALTH || 
      normalizedCategory === CategoryType.EDUCATION || 
      normalizedCategory === CategoryType.OTHER) {
    return normalizedCategory as CategoryType;
  }
  
  return CategoryType.OTHER; // Default category
}

/**
 * Creates a fallback for NLP task analysis
 */
export function createFallbackNLPAnalysis(input: string): NLPTaskAnalysisResponse {
  return {
    title: input.length > 50 ? input.substring(0, 50) + "..." : input,
    description: null,
    priority: PriorityLevel.MEDIUM,
    energyLevel: EnergyLevel.MEDIUM,
    dueDate: null,
    category: CategoryType.PERSONAL,
    estimatedDuration: 30, // Default duration of 30 minutes
  };
}

/**
 * Creates a fallback for focus suggestions
 */
export function createFallbackFocusSuggestions(tasks: Task[]): DailyFocusResponse {
  // Sort by priority (high > medium > low)
  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityValues = { high: 3, medium: 2, low: 1 };
    return priorityValues[b.priority as keyof typeof priorityValues] - 
           priorityValues[a.priority as keyof typeof priorityValues];
  });
  
  // Choose the top 3 tasks (or fewer if fewer are available)
  const topTasks = sortedTasks.slice(0, 3).map(task => ({
    taskId: task.id,
    reason: `This task has ${task.priority} priority.`
  }));
  
  return {
    topTasks,
    motivationalMessage: "Focus on one task at a time!"
  };
}
