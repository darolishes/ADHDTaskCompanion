import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
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
  GeminiConfig,
  BaseAIConfig,
} from "../../types";
import {
  validatePriority,
  validateEnergyLevel,
  validateCategory,
  createFallbackNLPAnalysis,
  createFallbackFocusSuggestions,
} from "../../utils";

/**
 * Gemini AI Provider implementation
 */
export class GeminiProvider implements AIProvider {
  private genAI: GoogleGenerativeAI;
  private config: GeminiConfig;

  constructor(config: GeminiConfig | string) {
    // Handle both string (apiKey) and config object
    if (typeof config === "string") {
      this.config = {
        apiKey: config,
        modelName: "gemini-1.5-pro",
        temperature: 0.7,
        maxTokens: 2048,
        topP: 0.95,
        frequencyPenalty: 0,
        presencePenalty: 0,
        cacheResults: false,
      };
    } else {
      // Set default values for any missing config options
      this.config = {
        ...{
          modelName: "gemini-1.5-pro",
          temperature: 0.7,
          maxTokens: 2048,
          topP: 0.95,
          frequencyPenalty: 0,
          presencePenalty: 0,
          cacheResults: false,
        },
        ...config,
      };
    }

    // Initialize the Gemini API
    this.genAI = new GoogleGenerativeAI(this.config.apiKey);
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

    // Reinitialize the API if the API key changes
    if (config.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.config.apiKey);
    }
  }

  /**
   * Get safety settings for Gemini
   */
  private getSafetySettings() {
    // Use custom safety settings if provided, otherwise use defaults
    if (this.config.safetySettings) {
      return this.config.safetySettings;
    }

    // Default safety settings
    return [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];
  }

  /**
   * Get generation config for Gemini
   */
  private getGenerationConfig(customTemperature?: number) {
    return {
      temperature: customTemperature ?? this.config.temperature ?? 0.7,
      topK: 32,
      topP: this.config.topP ?? 0.95,
      maxOutputTokens: this.config.maxTokens ?? 2048,
      frequencyPenalty: this.config.frequencyPenalty ?? 0,
      presencePenalty: this.config.presencePenalty ?? 0,
    };
  }

  /**
   * Clean JSON response from Gemini
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
      // Get the Gemini model
      const model = this.genAI.getGenerativeModel({
        model: this.config.modelName ?? "gemini-1.5-pro",
      });

      // Configure safety settings
      const generationConfig = this.getGenerationConfig();
      const safetySettings = this.getSafetySettings();

      const prompt = `
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
      `;

      // Chat with the model
      const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [
          {
            role: "user",
            parts: [
              {
                text: "You are an ADHD coach and task management expert who helps break down tasks into manageable steps.",
              },
            ],
          },
          {
            role: "model",
            parts: [
              {
                text: "I'm ready to help you break down tasks into manageable steps. As an ADHD coach, I understand how important it is to structure complex tasks into concrete, actionable steps.",
              },
            ],
          },
        ],
      });

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const responseText = response.text();

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
      console.error("Gemini API error:", error);

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

    // Here we create a sample focus suggestion for development
    // This avoids many API calls during development
    const uncompletedTasks = tasks.filter((task) => !task.completed);
    if (uncompletedTasks.length > 0) {
      return {
        topTasks: [
          {
            taskId: uncompletedTasks[0].id,
            reason:
              "This task fits well with your current energy level and has high priority.",
          },
        ],
        motivationalMessage: `You have ${uncompletedTasks.length} task(s) on your list. Focus on one thing at a time!`,
      };
    }

    // Remove this block and activate the code below for production
    return {
      topTasks: [
        {
          taskId: uncompletedTasks[0].id,
          reason:
            "This task fits well with your current energy level and has high priority.",
        },
      ],
      motivationalMessage: `You have ${uncompletedTasks.length} task(s) on your list. Focus on one thing at a time!`,
    };

    /* In the production version for the AI query:
    Replace later with real code
    */
    try {
      // Configure the Gemini model
      const model = this.genAI.getGenerativeModel({
        model: this.config.modelName ?? "gemini-1.5-pro",
      });

      const generationConfig = this.getGenerationConfig();
      const safetySettings = this.getSafetySettings();

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

      const prompt = `
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
      `;

      // Chat with the model
      const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [
          {
            role: "user",
            parts: [
              {
                text: "You are an ADHD coach and productivity expert who helps me prioritize my daily tasks.",
              },
            ],
          },
          {
            role: "model",
            parts: [
              {
                text: "I'm here to help you as an ADHD coach to effectively prioritize your tasks. I understand how important it is to find the right focus for your energy and situation.",
              },
            ],
          },
        ],
      });

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const responseText = response.text();

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
      console.error("Gemini API error for focus suggestions:", error);

      // Fallback on API error
      return createFallbackFocusSuggestions(
        tasks.filter((task) => !task.completed)
      );
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
      // Configure Gemini model
      const model = this.genAI.getGenerativeModel({
        model: this.config.modelName ?? "gemini-1.5-pro",
      });

      const generationConfig = this.getGenerationConfig();
      const safetySettings = this.getSafetySettings();

      // Create prompt for the AI
      const prompt = `
        Task title: "${taskTitle}"
        ${taskDescription ? `Description: "${taskDescription}"` : ""}

        Analyze this task and suggest 5 suitable emojis that best represent the content or context of the task.
        The emojis should help the user quickly recognize what the task is about.

        Return ONLY a JSON array with 5 emojis, without additional text or explanations.

        Example:
        ["📝", "📚", "🎓", "📊", "💻"]

        Your answer:
      `;

      // Chat with the model
      const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [
          {
            role: "user",
            parts: [
              {
                text: "You are an expert in categorizing tasks with appropriate emojis.",
              },
            ],
          },
          {
            role: "model",
            parts: [
              {
                text: "I'm ready to analyze any task and suggest suitable emojis that best represent the content or context of the task.",
              },
            ],
          },
        ],
      });

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const responseText = response.text();

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
      console.error("Gemini API error for emoji prediction:", error);
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
      // Configure Gemini model
      const model = this.genAI.getGenerativeModel({
        model: this.config.modelName ?? "gemini-1.5-pro",
      });

      const generationConfig = this.getGenerationConfig(0.1); // Lower temperature for more consistent results
      const safetySettings = this.getSafetySettings();

      // Today's date for date analysis
      const today = new Date();

      // Create prompt for the AI
      const prompt = `
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
      `;

      // Chat with the model
      const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [
          {
            role: "user",
            parts: [
              {
                text: "You are an expert in task management and natural language processing who helps convert unstructured task descriptions into structured data.",
              },
            ],
          },
          {
            role: "model",
            parts: [
              {
                text: "I'm ready to analyze natural language task descriptions and extract structured information from them. I will identify the key details and return them in a consistent format.",
              },
            ],
          },
        ],
      });

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const responseText = response.text();

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
      console.error("Gemini API error for NLP analysis:", error);
      // Fallback on API error
      return createFallbackNLPAnalysis(input);
    }
  }
}
