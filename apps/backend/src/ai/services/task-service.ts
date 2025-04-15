import { EnergyLevel, Task } from "../../schema";
import {
  AIProvider,
  AIProviderType,
  TaskBreakdownResponse,
  DailyFocusResponse,
  NLPTaskAnalysisResponse,
  BaseAIConfig,
  GeminiConfig,
  OpenAIConfig,
} from "../types";
import { AIProviderFactory } from "../providers/provider-factory";

/**
 * Service for AI-powered task operations
 */
export class TaskAIService {
  private provider: AIProvider;
  private currentProviderType: AIProviderType;
  private config: Record<AIProviderType, BaseAIConfig>;

  constructor(
    providerType: AIProviderType = "gemini",
    config?: Partial<BaseAIConfig>
  ) {
    this.currentProviderType = providerType;

    // Initialize configuration storage
    this.config = {
      gemini: this.createDefaultGeminiConfig(),
      openai: this.createDefaultOpenAIConfig(),
    };

    // Apply any provided configuration
    if (config) {
      this.updateConfig(config);
    }

    // Initialize the provider
    this.initializeProvider(providerType);
  }

  /**
   * Create default Gemini configuration
   */
  private createDefaultGeminiConfig(): GeminiConfig {
    return {
      apiKey: process.env.GEMINI_API_KEY || "",
      modelName: "gemini-1.5-pro",
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.95,
      frequencyPenalty: 0,
      presencePenalty: 0,
      cacheResults: false,
    };
  }

  /**
   * Create default OpenAI configuration
   */
  private createDefaultOpenAIConfig(): OpenAIConfig {
    return {
      apiKey: process.env.OPENAI_API_KEY || "",
      modelName: "gpt-4o",
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.95,
      frequencyPenalty: 0,
      presencePenalty: 0,
      cacheResults: false,
      apiEndpoint: "https://api.openai.com/v1/chat/completions",
    };
  }

  /**
   * Initialize the AI provider
   */
  private initializeProvider(providerType: AIProviderType): void {
    // Get the configuration for the specified provider type
    const config = this.config[providerType];

    // Create the provider
    this.provider = AIProviderFactory.createProvider(providerType, config);
  }

  /**
   * Switch to a different AI provider
   */
  public switchProvider(providerType: AIProviderType): void {
    if (providerType !== this.currentProviderType) {
      this.currentProviderType = providerType;
      this.initializeProvider(providerType);
    }
  }

  /**
   * Get the current provider type
   */
  public getProviderType(): AIProviderType {
    return this.currentProviderType;
  }

  /**
   * Get the current configuration for the specified provider type
   */
  public getConfig(providerType?: AIProviderType): BaseAIConfig {
    const type = providerType || this.currentProviderType;
    return { ...this.config[type] };
  }

  /**
   * Update the configuration for the current provider
   */
  public updateConfig(config: Partial<BaseAIConfig>): void {
    // Update the configuration
    this.config[this.currentProviderType] = {
      ...this.config[this.currentProviderType],
      ...config,
    };

    // Reinitialize the provider with the new configuration
    this.initializeProvider(this.currentProviderType);
  }

  /**
   * Update the configuration for a specific provider
   */
  public updateProviderConfig(
    providerType: AIProviderType,
    config: Partial<BaseAIConfig>
  ): void {
    // Update the configuration
    this.config[providerType] = {
      ...this.config[providerType],
      ...config,
    };

    // If this is the current provider, reinitialize it
    if (providerType === this.currentProviderType) {
      this.initializeProvider(this.currentProviderType);
    }
  }

  /**
   * Analyze and break down a task into steps
   */
  async analyzeAndBreakdownTask(
    taskTitle: string,
    energyLevel: EnergyLevel
  ): Promise<TaskBreakdownResponse> {
    return this.provider.analyzeAndBreakdownTask(taskTitle, energyLevel);
  }

  /**
   * Get suggestions for daily focus tasks
   */
  async getDailyFocusSuggestions(
    tasks: Task[],
    currentEnergyLevel: EnergyLevel
  ): Promise<DailyFocusResponse> {
    return this.provider.getDailyFocusSuggestions(tasks, currentEnergyLevel);
  }

  /**
   * Predict emojis for a task
   */
  async predictTaskEmoji(
    taskTitle: string,
    taskDescription?: string
  ): Promise<string[]> {
    return this.provider.predictTaskEmoji(taskTitle, taskDescription);
  }

  /**
   * Analyze a natural language task description
   */
  async analyzeNaturalLanguageTask(
    input: string
  ): Promise<NLPTaskAnalysisResponse> {
    return this.provider.analyzeNaturalLanguageTask(input);
  }
}
