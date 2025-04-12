import { Task, PriorityLevel, EnergyLevel, TaskWithSteps } from '@adhd/schema';

/**
 * Bestimmt die Farbe für eine Prioritätsstufe
 */
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case PriorityLevel.HIGH:
      return 'text-red-500 border-red-500';
    case PriorityLevel.MEDIUM:
      return 'text-yellow-500 border-yellow-500';
    case PriorityLevel.LOW:
      return 'text-green-500 border-green-500';
    default:
      return 'text-gray-500 border-gray-500';
  }
}

/**
 * Bestimmt die Farbe für ein Energielevel
 */
export function getEnergyColor(energy: string): string {
  switch (energy) {
    case EnergyLevel.HIGH:
      return 'text-indigo-500 border-indigo-500';
    case EnergyLevel.MEDIUM:
      return 'text-blue-500 border-blue-500';
    case EnergyLevel.LOW:
      return 'text-teal-500 border-teal-500';
    default:
      return 'text-gray-500 border-gray-500';
  }
}

/**
 * Filtert und sortiert Aufgaben nach verschiedenen Kriterien
 */
export function filterAndSortTasks(
  tasks: Task[],
  {
    showCompleted = false,
    priorityFilter = null,
    energyFilter = null,
    sortBy = 'dueDate',
    sortOrder = 'asc',
    categoryFilter = null,
    searchTerm = ''
  }: {
    showCompleted?: boolean;
    priorityFilter?: PriorityLevel | null;
    energyFilter?: EnergyLevel | null;
    sortBy?: 'dueDate' | 'priority' | 'energyLevel' | 'estimatedDuration';
    sortOrder?: 'asc' | 'desc';
    categoryFilter?: string | null;
    searchTerm?: string;
  }
): Task[] {
  // Zuerst filtern
  let filteredTasks = [...tasks];
  
  // Filtere nach Abschlussstatus
  if (!showCompleted) {
    filteredTasks = filteredTasks.filter(task => !task.completed);
  }
  
  // Filtere nach Priorität
  if (priorityFilter) {
    filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
  }
  
  // Filtere nach Energielevel
  if (energyFilter) {
    filteredTasks = filteredTasks.filter(task => task.energyLevel === energyFilter);
  }
  
  // Filtere nach Kategorie
  if (categoryFilter) {
    filteredTasks = filteredTasks.filter(task => task.category === categoryFilter);
  }
  
  // Filtere nach Suchbegriff
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredTasks = filteredTasks.filter(task => 
      task.title.toLowerCase().includes(term) || 
      (task.description && task.description.toLowerCase().includes(term))
    );
  }
  
  // Dann sortieren
  const priorityValues = { 
    [PriorityLevel.HIGH]: 3, 
    [PriorityLevel.MEDIUM]: 2, 
    [PriorityLevel.LOW]: 1 
  };
  
  const energyValues = { 
    [EnergyLevel.HIGH]: 3, 
    [EnergyLevel.MEDIUM]: 2, 
    [EnergyLevel.LOW]: 1 
  };
  
  const sortFunction = (a: Task, b: Task) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    
    switch (sortBy) {
      case 'dueDate':
        // Sortiere Aufgaben ohne Fälligkeitsdatum ans Ende
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        
        return multiplier * (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        
      case 'priority':
        const aPriority = priorityValues[a.priority as keyof typeof priorityValues] || 0;
        const bPriority = priorityValues[b.priority as keyof typeof priorityValues] || 0;
        return multiplier * (bPriority - aPriority); // Hohe Priorität zuerst
        
      case 'energyLevel':
        const aEnergy = a.energyLevel ? energyValues[a.energyLevel as keyof typeof energyValues] : 0;
        const bEnergy = b.energyLevel ? energyValues[b.energyLevel as keyof typeof energyValues] : 0;
        return multiplier * (aEnergy - bEnergy);
        
      case 'estimatedDuration':
        const aDuration = a.estimatedDuration || 0;
        const bDuration = b.estimatedDuration || 0;
        return multiplier * (aDuration - bDuration);
        
      default:
        return 0;
    }
  };
  
  return filteredTasks.sort(sortFunction);
}

/**
 * Berechnet den Fortschritt einer Aufgabe basierend auf abgeschlossenen Schritten
 */
export function calculateTaskProgress(task: TaskWithSteps): number {
  if (!task.steps || task.steps.length === 0) {
    return task.completed ? 100 : 0;
  }
  
  const completedSteps = task.steps.filter(step => step.completed).length;
  return Math.round((completedSteps / task.steps.length) * 100);
}

/**
 * Teilt ein Array in Chunks einer bestimmten Größe
 */
export function splitArray<T>(array: T[], chunkSize: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}