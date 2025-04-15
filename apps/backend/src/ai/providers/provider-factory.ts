import {
  AIProvider,
  AIProviderType,
  BaseAIConfig,
  GeminiConfig,
  OpenAIConfig,
} from "../types";
import { GeminiProvider } from "./gemini/gemini-provider";
import { OpenAIProvider } from "./openai/openai-provider";

/**
 * Factory for creating AI providers
 */
export class AIProviderFactory {
  /**
   * Create a Gemini provider
   */
  static createGeminiProvider(
    configOrApiKey: GeminiConfig | string
  ): AIProvider {
    return new GeminiProvider(configOrApiKey);
  }

  /**
   * Create an OpenAI provider
   */
  static createOpenAIProvider(
    configOrApiKey: OpenAIConfig | string
  ): AIProvider {
    return new OpenAIProvider(configOrApiKey);
  }

  /**
   * Create a provider based on the specified type with a simple API key
   */
  static createProvider(type: AIProviderType, apiKey: string): AIProvider;

  /**
   * Create a provider based on the specified type with a configuration object
   */
  static createProvider(type: AIProviderType, config: BaseAIConfig): AIProvider;

  /**
   * Implementation of createProvider that handles both signatures
   */
  static createProvider(
    type: AIProviderType,
    configOrApiKey: BaseAIConfig | string
  ): AIProvider {
    switch (type) {
      case "gemini":
        return this.createGeminiProvider(configOrApiKey);
      case "openai":
        return this.createOpenAIProvider(configOrApiKey);
      default:
        throw new Error(`Unsupported AI provider type: ${type}`);
    }
  }
}
