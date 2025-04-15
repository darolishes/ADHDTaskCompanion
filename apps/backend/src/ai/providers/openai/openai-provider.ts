import {
  EnergyLevel,
  PriorityLevel,
  CategoryType,
  Task,
} from "../../../schema";
import {
  AIProvider,
  TaskBreakdownResponse,
  DailyFocusResponse,
  NLPTaskAnalysisResponse,
  OpenAIConfig,
  BaseAIConfig,
} from "../../types";
import {
  validatePriority,
  validateEnergyLevel,
  validateCategory,
  createFallbackNLPAnalysis,
  createFallbackFocusSuggestions,
} from "../../utils";

// OpenAI API types
interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAICompletionChoice {
  index: number;
  message: OpenAIMessage;
  finish_reason: string;
}

interface OpenAICompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAICompletionChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * OpenAI Provider implementation
 */
export class OpenAIProvider implements AIProvider {
  private config: OpenAIConfig;

  constructor(config: OpenAIConfig | string) {
    // Handle both string (apiKey) and config object
    if (typeof config === "string") {
      this.config = {
        apiKey: config,
        modelName: "gpt-4o",
        temperature: 0.7,
        maxTokens: 2048,
        topP: 0.95,
        frequencyPenalty: 0,
        presencePenalty: 0,
        cacheResults: false,
        apiEndpoint: "https://api.openai.com/v1/chat/completions",
      };
    } else {
      // Set default values for any missing config options
      this.config = {
        ...{
          modelName: "gpt-4o",
          temperature: 0.7,
          maxTokens: 2048,
          topP: 0.95,
          frequencyPenalty: 0,
          presencePenalty: 0,
          cacheResults: false,
          apiEndpoint: "https://api.openai.com/v1/chat/completions",
        },
        ...config,
      };
    }
  }

  /**
   * Get the current configuration
   */
  getConfig(): BaseAIConfig {
    return { ...this.config };
  }

  /**
   * Update the configuration
   */
  updateConfig(config: Partial<BaseAIConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Call the OpenAI API with the given messages
   */
  private async callOpenAI(
    messages: OpenAIMessage[],
    customTemperature?: number
  ): Promise<string> {
    try {
      const apiEndpoint =
        this.config.apiEndpoint ?? "https://api.openai.com/v1/chat/completions";
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      };

      // Add organization header if provided
      if (this.config.organization) {
        headers["OpenAI-Organization"] = this.config.organization;
      }

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: this.config.modelName ?? "gpt-4o",
          messages,
          temperature: customTemperature ?? this.config.temperature ?? 0.7,
          max_tokens: this.config.maxTokens ?? 2048,
          top_p: this.config.topP ?? 0.95,
          frequency_penalty: this.config.frequencyPenalty ?? 0,
          presence_penalty: this.config.presencePenalty ?? 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `OpenAI API error: ${response.status} ${JSON.stringify(errorData)}`
        );
      }

      const data = (await response.json()) as OpenAICompletionResponse;
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      throw error;
    }
  }

  /**
   * Clean JSON response from OpenAI
   */
  private cleanJsonResponse(response: string): string {
    let cleanedResponse = response.trim();

    // If the response starts and ends with ``` (Markdown code block), remove them
    if (cleanedResponse.startsWith("```") && cleanedResponse.endsWith("```")) {
      cleanedResponse = cleanedResponse.slice(3, -3).trim();
      // If after removing the ```, "json" is still at the beginning, remove that too
      if (cleanedResponse.startsWith("json")) {
        cleanedResponse = cleanedResponse.slice(4).trim();
      }
    }

    return cleanedResponse;
  }

  /**
   * Analyzes a task and breaks it down into steps
   */
  async analyzeAndBreakdownTask(
    taskTitle: string,
    energyLevel: EnergyLevel
  ): Promise<TaskBreakdownResponse> {
    try {
      const messages: OpenAIMessage[] = [
        {
          role: "system",
          content:
            "You are an ADHD coach and task management expert who helps break down tasks into manageable steps.",
        },
        {
          role: "user",
          content: `
            I need help breaking down a task for someone with ADHD. The task is "${taskTitle}" and the person's current energy level is ${energyLevel}.

            Please analyze this task and:
            1. Determine a priority level (high, medium, or low)
            2. Break it down into 3-5 clear, actionable, sequential steps
            3. Estimate how long the total task will take (in minutes)
            4. Estimate how long each step will take (in minutes)
            5. Provide a brief description for the task

            Return ONLY a JSON object with this structure:
            {
              "priority": "high|medium|low",
              "estimatedDuration": number,
              "description": "brief description of task",
              "steps": [
                {
                  "description": "clear step instruction",
                  "estimatedDuration": number
                }
              ]
            }

            IMPORTANT: Your response must be valid JSON format only, with no additional text.
            Keep the steps concrete, specific, and actionable. If the energy level is low, make the steps even smaller and more manageable.
          `,
        },
      ];

      const responseText = await this.callOpenAI(messages, 0.7);

      // Parse the JSON result
      const parsedResult = JSON.parse(responseText) as TaskBreakdownResponse;

      // Validate and sanitize the response
      return {
        priority: validatePriority(parsedResult.priority),
        estimatedDuration: Math.max(
          1,
          Math.round(parsedResult.estimatedDuration || 15)
        ),
        description: parsedResult.description || "",
        steps: (parsedResult.steps || []).map((step) => ({
          description: step.description,
          estimatedDuration: Math.max(
            1,
            Math.round(step.estimatedDuration || 5)
          ),
        })),
      };
    } catch (error) {
      console.error("OpenAI API error:", error);

      // Return fallback breakdown if API fails
      return {
        priority: PriorityLevel.MEDIUM,
        estimatedDuration: 15,
        description: `Task: ${taskTitle}`,
        steps: [
          {
            description: `First, get started with ${taskTitle}`,
            estimatedDuration: 5,
          },
          {
            description: `Continue working on ${taskTitle}`,
            estimatedDuration: 5,
          },
          {
            description: `Complete ${taskTitle}`,
            estimatedDuration: 5,
          },
        ],
      };
    }
  }

  /**
   * Gets suggestions for daily focus tasks
   */
  async getDailyFocusSuggestions(
    tasks: Task[],
    currentEnergyLevel: EnergyLevel
  ): Promise<DailyFocusResponse> {
    // Fallback if task list is empty or all tasks are completed
    if (!tasks.length || tasks.every((task) => task.completed)) {
      return {
        topTasks: [],
        motivationalMessage:
          "No open tasks available. Time to plan something new!",
      };
    }

    const uncompletedTasks = tasks.filter((task) => !task.completed);

    try {
      // Prepare task data for the AI
      const taskData = uncompletedTasks.map((task: Task) => {
        return {
          id: task.id,
          title: task.title,
          description: task.description || "",
          priority: task.priority,
          energyLevel: task.energyLevel,
          estimatedDuration: task.estimatedDuration || 0,
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
        };
      });

      const messages: OpenAIMessage[] = [
        {
          role: "system",
          content:
            "You are an ADHD coach and productivity expert who helps me prioritize my daily tasks.",
        },
        {
          role: "user",
          content: `
            I need help selecting the TOP 3 tasks I should focus on today.
            My current energy level is: ${currentEnergyLevel}.
            Today is: ${new Date().toISOString().split("T")[0]}.

            Here are my uncompleted tasks (in JSON format):
            ${JSON.stringify(taskData)}

            Please select the 3 most important tasks I should focus on today, based on:
            1. Priority (high priority should generally be preferred)
            2. Matching my energy level (tasks should match my current energy level)
            3. Due dates (tasks due soon should be prioritized)
            4. Estimated duration (consider what's realistically achievable today)

            For each recommended task, please provide a brief reason why it was selected.
            Also include a short, motivational message for my day.

            Reply ONLY with a valid JSON object in this format:
            {
              "topTasks": [
                {
                  "taskId": number,
                  "reason": "brief explanation of why this task was selected"
                }
              ],
              "motivationalMessage": "short, encouraging message"
            }

            Include a maximum of 3 tasks, or fewer if fewer are available.
          `,
        },
      ];

      const responseText = await this.callOpenAI(messages, 0.7);

      // Parse the JSON result
      try {
        const parsedResult = JSON.parse(responseText) as DailyFocusResponse;

        // Validate the response
        return {
          topTasks: parsedResult.topTasks || [],
          motivationalMessage:
            parsedResult.motivationalMessage || "You've got this today!",
        };
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError);
        // Fallback
        return createFallbackFocusSuggestions(uncompletedTasks);
      }
    } catch (error) {
      console.error("OpenAI API error for focus suggestions:", error);

      // Fallback on API error
      return createFallbackFocusSuggestions(uncompletedTasks);
    }
  }

  /**
   * Emoji prediction for tasks based on task title and description
   */
  async predictTaskEmoji(
    taskTitle: string,
    taskDescription: string = ""
  ): Promise<string[]> {
    try {
      const messages: OpenAIMessage[] = [
        {
          role: "system",
          content:
            "You are an expert in categorizing tasks with appropriate emojis.",
        },
        {
          role: "user",
          content: `
            Task title: "${taskTitle}"
            ${taskDescription ? `Description: "${taskDescription}"` : ""}

            Analyze this task and suggest 5 suitable emojis that best represent the content or context of the task.
            The emojis should help the user quickly recognize what the task is about.

            Return ONLY a JSON array with 5 emojis, without additional text or explanations.

            Example:
            ["📝", "📚", "🎓", "📊", "💻"]

            Your answer:
          `,
        },
      ];

      const responseText = await this.callOpenAI(messages, 0.7);

      // Parse the JSON result
      try {
        // Sometimes the AI can return additional text, so we try to remove everything except the JSON array
        const cleanedResponse = this.cleanJsonResponse(responseText);

        const parsedEmojis = JSON.parse(cleanedResponse) as string[];

        // Ensure we have exactly 5 emojis
        const emojis = parsedEmojis.slice(0, 5);

        // If we have fewer than 5 emojis, fill with general emojis
        while (emojis.length < 5) {
          const defaultEmojis = ["📝", "✅", "⏰", "🔔", "📌"];
          emojis.push(defaultEmojis[emojis.length]);
        }

        return emojis;
      } catch (parseError) {
        console.error("Error parsing emoji response:", parseError);
        // Fallback on parsing error
        return ["📝", "✅", "⏰", "🔔", "📌"];
      }
    } catch (error) {
      console.error("OpenAI API error for emoji prediction:", error);
      // Fallback on API error
      return ["📝", "✅", "⏰", "🔔", "📌"];
    }
  }

  /**
   * Analyzes a natural language task description and extracts structured information
   */
  async analyzeNaturalLanguageTask(
    input: string
  ): Promise<NLPTaskAnalysisResponse> {
    try {
      // Today's date for date analysis
      const today = new Date();

      const messages: OpenAIMessage[] = [
        {
          role: "system",
          content:
            "You are an expert in task management and natural language processing who helps convert unstructured task descriptions into structured data.",
        },
        {
          role: "user",
          content: `
            Analyze the following natural language task description and extract structured information from it:

            "${input}"

            Today is ${today.toISOString().split("T")[0]}.
            Extract the following information from the description:

            1. A clear title for the task (short and concise)
            2. A more detailed description (optional, can be null)
            3. The priority of the task (high, medium, low)
            4. The required energy level (high, medium, low, or null if not discernible)
            5. The due date in YYYY-MM-DD format (or null if none specified)
            6. The category of the task (personal, work, family, health)
            7. The estimated duration in minutes (or null if not discernible)

            Return YOUR ANSWER ONLY as a valid JSON object in the following format:
            {
              "title": "Clear task title",
              "description": "More detailed description or null",
              "priority": "high|medium|low",
              "energyLevel": "high|medium|low|null",
              "dueDate": "YYYY-MM-DD|null",
              "category": "personal|work|family|health",
              "estimatedDuration": number|null
            }

            IMPORTANT: Interpret relative time references (like "tomorrow", "next week", "in three days")
            relative to today's date. Today is ${today.toISOString().split("T")[0]}.
            If a task has no clear category, choose the most likely one based on context.
          `,
        },
      ];

      const responseText = await this.callOpenAI(messages, 0.1); // Lower temperature for more consistent results

      // Parse the JSON result
      try {
        // Sometimes the AI can return additional text, so we try to remove everything except the JSON object
        const cleanedResponse = this.cleanJsonResponse(responseText);

        const parsedResult = JSON.parse(
          cleanedResponse
        ) as NLPTaskAnalysisResponse;

        // Validate and sanitize the response
        return {
          title: parsedResult.title || input.substring(0, 50), // Fallback to truncated input
          description: parsedResult.description,
          priority: validatePriority(parsedResult.priority),
          energyLevel: validateEnergyLevel(parsedResult.energyLevel),
          dueDate: parsedResult.dueDate, // Date in YYYY-MM-DD format
          category: validateCategory(parsedResult.category),
          estimatedDuration:
            parsedResult.estimatedDuration !== null
              ? Math.max(1, Math.round(parsedResult.estimatedDuration))
              : null,
        };
      } catch (parseError) {
        console.error("Error parsing NLP analysis:", parseError);
        // Fallback on parsing error
        return createFallbackNLPAnalysis(input);
      }
    } catch (error) {
      console.error("OpenAI API error for NLP analysis:", error);
      // Fallback on API error
      return createFallbackNLPAnalysis(input);
    }
  }
}
