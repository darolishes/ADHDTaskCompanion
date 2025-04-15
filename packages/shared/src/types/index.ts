// Shared types across the application
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
}

// Add more shared types as needed
