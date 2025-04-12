import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { InsertTask, InsertTaskStep, EnergyLevel, PriorityLevel } from "@shared/schema";

// Google Gemini API für die Aufgabenanalyse
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyBRNvjqztgTYMrbKcYTmYauLHDRKy-T63Q");

interface TaskBreakdownResponse {
  priority: string;
  estimatedDuration: number;
  description: string;
  steps: {
    description: string;
    estimatedDuration: number;
  }[];
}

export async function analyzeAndBreakdownTask(
  taskTitle: string, 
  energyLevel: EnergyLevel
): Promise<TaskBreakdownResponse> {
  try {
    // Erhalte das Gemini-Modell
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Konfiguriere die Sicherheitseinstellungen
    const generationConfig = {
      temperature: 0.7,
      topK: 32,
      topP: 0.95,
      maxOutputTokens: 2048,
    };
    
    const safetySettings = [
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
    
    // Chat mit dem Modell
    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: [
        {
          role: "user",
          parts: [{ text: "Du bist ein ADHS-Coach und Task-Management-Experte, der hilft, Aufgaben in überschaubare Schritte zu unterteilen." }],
        },
        {
          role: "model",
          parts: [{ text: "Ich bin bereit, dir zu helfen, Aufgaben in überschaubare Schritte zu unterteilen. Als ADHS-Coach verstehe ich, wie wichtig es ist, komplexe Aufgaben in konkrete, umsetzbare Schritte zu gliedern." }],
        },
      ],
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Parse das JSON-Ergebnis
    const parsedResult = JSON.parse(responseText) as TaskBreakdownResponse;
    
    // Validate and sanitize the response
    return {
      priority: validatePriority(parsedResult.priority),
      estimatedDuration: Math.max(1, Math.round(parsedResult.estimatedDuration || 15)),
      description: parsedResult.description || "",
      steps: (parsedResult.steps || []).map(step => ({
        description: step.description,
        estimatedDuration: Math.max(1, Math.round(step.estimatedDuration || 5))
      }))
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
          estimatedDuration: 5
        },
        {
          description: `Continue working on ${taskTitle}`,
          estimatedDuration: 5
        },
        {
          description: `Complete ${taskTitle}`,
          estimatedDuration: 5
        }
      ]
    };
  }
}

function validatePriority(priority: string): PriorityLevel {
  priority = priority.toLowerCase();
  if (priority === PriorityLevel.HIGH) return PriorityLevel.HIGH;
  if (priority === PriorityLevel.LOW) return PriorityLevel.LOW;
  return PriorityLevel.MEDIUM;
}
