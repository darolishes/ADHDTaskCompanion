import { EnergyLevel, PriorityLevel, CategoryType, Task } from "../schema";

// Response types for task analysis
export interface TaskBreakdownResponse {
  priority: string;
  estimatedDuration: number;
  description: string;
  steps: {
    description: string;
    estimatedDuration: number;
  }[];
}

// Response types for focus suggestions
export interface DailyFocusResponse {
  topTasks: {
    taskId: number;
    reason: string;
  }[];
  motivationalMessage: string;
}

// Response types for NLP analysis
export interface NLPTaskAnalysisResponse {
  title: string;
  description: string | null;
  priority: PriorityLevel;
  energyLevel: EnergyLevel | null;
  dueDate: string | null;
  category: CategoryType;
  estimatedDuration: number | null;
}

// Emoji categories for task types
export const EmojiCategories = {
  WORK: [
    "💼",
    "📊",
    "📈",
    "👔",
    "🖥️",
    "📱",
    "📝",
    "📅",
    "🗓️",
    "📌",
    "📋",
    "📎",
    "📏",
    "✏️",
    "📑",
  ],
  PERSONAL: [
    "🏃",
    "🧘",
    "🎮",
    "📚",
    "🎵",
    "🎬",
    "🎨",
    "🎭",
    "🏠",
    "🛒",
    "🧹",
    "🛁",
    "👕",
    "🍽️",
    "🧠",
  ],
  HEALTH: [
    "🏋️",
    "🥗",
    "🥦",
    "💊",
    "💉",
    "🧘",
    "💆",
    "🧠",
    "❤️",
    "🫀",
    "🦷",
    "👁️",
    "👂",
    "🛌",
    "🚶",
  ],
  FAMILY: [
    "👨‍👩‍👧‍👦",
    "👶",
    "🧒",
    "🧓",
    "🏡",
    "🛋️",
    "🧸",
    "🎁",
    "🎂",
    "🎉",
    "🎪",
    "🎠",
    "🎡",
    "🚗",
    "⛱️",
  ],
  EDUCATION: [
    "📚",
    "🎓",
    "🧠",
    "✍️",
    "📝",
    "📒",
    "📏",
    "🔬",
    "🔭",
    "🧪",
    "🧮",
    "🗣️",
    "🌐",
    "🎭",
    "🖥️",
  ],
  HOBBY: [
    "🎨",
    "🎮",
    "🎬",
    "🎭",
    "🎹",
    "🎸",
    "🥁",
    "🎯",
    "🎲",
    "📸",
    "🏊",
    "🚴",
    "⚽",
    "🎣",
    "🏂",
  ],
  TRAVEL: [
    "✈️",
    "🏝️",
    "🏔️",
    "🏕️",
    "🚗",
    "🚆",
    "🚢",
    "🧳",
    "🗺️",
    "🧭",
    "🔭",
    "🌄",
    "🌅",
    "🏞️",
    "🌐",
  ],
  FINANCE: [
    "💰",
    "💳",
    "💵",
    "📊",
    "📈",
    "💹",
    "🏦",
    "🧾",
    "📄",
    "📂",
    "💼",
    "📱",
    "🔐",
    "📇",
    "🖋️",
  ],
};

// Base configuration for all AI providers
export interface BaseAIConfig {
  apiKey: string;
  temperature?: number; // Controls randomness: lower values are more deterministic
  maxTokens?: number; // Maximum number of tokens to generate
  topP?: number; // Controls diversity via nucleus sampling
  frequencyPenalty?: number; // Penalizes repeated tokens
  presencePenalty?: number; // Penalizes repeated topics
  cacheResults?: boolean; // Whether to cache results
  cacheTTL?: number; // Time to live for cached results in seconds
}

// Gemini-specific configuration
export interface GeminiConfig extends BaseAIConfig {
  modelName?: string; // Default: "gemini-1.5-pro"
  safetySettings?: {
    category: string;
    threshold: string;
  }[];
}

// OpenAI-specific configuration
export interface OpenAIConfig extends BaseAIConfig {
  modelName?: string; // Default: "gpt-4o"
  organization?: string; // OpenAI organization ID
  apiEndpoint?: string; // Custom API endpoint
}

// Provider type
export type AIProviderType = "gemini" | "openai";

// Interface for AI providers
export interface AIProvider {
  // Task analysis and breakdown
  analyzeAndBreakdownTask(
    taskTitle: string,
    energyLevel: EnergyLevel
  ): Promise<TaskBreakdownResponse>;

  // Daily focus suggestions
  getDailyFocusSuggestions(
    tasks: Task[],
    currentEnergyLevel: EnergyLevel
  ): Promise<DailyFocusResponse>;

  // Emoji prediction for tasks
  predictTaskEmoji(
    taskTitle: string,
    taskDescription?: string
  ): Promise<string[]>;

  // Natural language task analysis
  analyzeNaturalLanguageTask(input: string): Promise<NLPTaskAnalysisResponse>;

  // Get the current configuration
  getConfig(): BaseAIConfig;

  // Update the configuration
  updateConfig(config: Partial<BaseAIConfig>): void;
}
