import { EnergyLevel, PriorityLevel, CategoryType, Task } from '@adhd/schema';

// Response-Typen für die Task-Analyse
export interface TaskBreakdownResponse {
  priority: string;
  estimatedDuration: number;
  description: string;
  steps: {
    description: string;
    estimatedDuration: number;
  }[];
}

// Response-Typen für Fokus-Vorschläge
export interface DailyFocusResponse {
  topTasks: {
    taskId: number;
    reason: string;
  }[];
  motivationalMessage: string;
}

// Response-Typen für NLP-Analyse
export interface NLPTaskAnalysisResponse {
  title: string;
  description: string | null;
  priority: PriorityLevel;
  energyLevel: EnergyLevel | null;
  dueDate: string | null;
  category: CategoryType;
  estimatedDuration: number | null;
}

// Emoji-Kategorien für Aufgabentypen
export const EmojiCategories = {
  WORK: ["💼", "📊", "📈", "👔", "🖥️", "📱", "📝", "📅", "🗓️", "📌", "📋", "📎", "📏", "✏️", "📑"],
  PERSONAL: ["🏃", "🧘", "🎮", "📚", "🎵", "🎬", "🎨", "🎭", "🏠", "🛒", "🧹", "🛁", "👕", "🍽️", "🧠"],
  HEALTH: ["🏋️", "🥗", "🥦", "💊", "💉", "🧘", "💆", "🧠", "❤️", "🫀", "🦷", "👁️", "👂", "🛌", "🚶"],
  FAMILY: ["👨‍👩‍👧‍👦", "👶", "🧒", "🧓", "🏡", "🛋️", "🧸", "🎁", "🎂", "🎉", "🎪", "🎠", "🎡", "🚗", "⛱️"],
  EDUCATION: ["📚", "🎓", "🧠", "✍️", "📝", "📒", "📏", "🔬", "🔭", "🧪", "🧮", "🗣️", "🌐", "🎭", "🖥️"],
  HOBBY: ["🎨", "🎮", "🎬", "🎭", "🎹", "🎸", "🥁", "🎯", "🎲", "📸", "🏊", "🚴", "⚽", "🎣", "🏂"],
  TRAVEL: ["✈️", "🏝️", "🏔️", "🏕️", "🚗", "🚆", "🚢", "🧳", "🗺️", "🧭", "🔭", "🌄", "🌅", "🏞️", "🌐"],
  FINANCE: ["💰", "💳", "💵", "📊", "📈", "💹", "🏦", "🧾", "📄", "📂", "💼", "📱", "🔐", "📇", "🖋️"],
};