import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import {
  InsertTask,
  InsertTaskStep,
  EnergyLevel,
  PriorityLevel,
  Task,
  CategoryType,
} from "@focus-flow/shared";

// Emoji-Kategorien für Aufgabentypen
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

// Google Gemini API für die Aufgabenanalyse
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || "AIzaSyBRNvjqztgTYMrbKcYTmYauLHDRKy-T63Q"
);

interface DailyFocusResponse {
  topTasks: {
    taskId: number;
    reason: string;
  }[];
  motivationalMessage: string;
}

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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

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
          parts: [
            {
              text: "Du bist ein ADHS-Coach und Task-Management-Experte, der hilft, Aufgaben in überschaubare Schritte zu unterteilen.",
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: "Ich bin bereit, dir zu helfen, Aufgaben in überschaubare Schritte zu unterteilen. Als ADHS-Coach verstehe ich, wie wichtig es ist, komplexe Aufgaben in konkrete, umsetzbare Schritte zu gliedern.",
            },
          ],
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
      estimatedDuration: Math.max(
        1,
        Math.round(parsedResult.estimatedDuration || 15)
      ),
      description: parsedResult.description || "",
      steps: (parsedResult.steps || []).map((step) => ({
        description: step.description,
        estimatedDuration: Math.max(1, Math.round(step.estimatedDuration || 5)),
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

export async function getDailyFocusSuggestions(
  tasks: Task[],
  currentEnergyLevel: EnergyLevel
): Promise<DailyFocusResponse> {
  // Fallback bei leerer Aufgabenliste oder wenn alle Aufgaben erledigt sind
  if (!tasks.length || tasks.every((task) => task.completed)) {
    return {
      topTasks: [],
      motivationalMessage:
        "Keine offenen Aufgaben vorhanden. Zeit, etwas Neues zu planen!",
    };
  }

  // Hier erstellen wir einen Beispiel-Fokusvorschlag für die Entwicklung
  // Dadurch vermeiden wir viele API-Aufrufe während der Entwicklung
  const uncompletedTasks = tasks.filter((task) => !task.completed);
  if (uncompletedTasks.length > 0) {
    return {
      topTasks: [
        {
          taskId: uncompletedTasks[0].id,
          reason:
            "Diese Aufgabe passt gut zu deinem aktuellen Energielevel und hat eine hohe Priorität.",
        },
      ],
      motivationalMessage: `Du hast ${uncompletedTasks.length} Aufgabe(n) auf deiner Liste. Fokussiere dich auf eine Sache nach der anderen!`,
    };
  }

  // Entferne diesen Block und aktiviere den Code unten für Produktion
  return {
    topTasks: [
      {
        taskId: uncompletedTasks[0].id,
        reason:
          "Diese Aufgabe passt gut zu deinem aktuellen Energielevel und hat eine hohe Priorität.",
      },
    ],
    motivationalMessage: `Du hast ${uncompletedTasks.length} Aufgabe(n) auf deiner Liste. Fokussiere dich auf eine Sache nach der anderen!`,
  };

  /* In der Produktionsversion für die KI-Abfrage:
  Später durch echten Code ersetzen
  */
  try {
    // Konfiguriere das Gemini-Modell
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

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

    // Bereite Aufgabendaten für die KI vor
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
      Ich brauche Hilfe bei der Auswahl der TOP 3 Aufgaben, auf die ich mich heute konzentrieren sollte.
      Mein aktuelles Energielevel ist: ${currentEnergyLevel}.
      Heute ist der: ${new Date().toISOString().split("T")[0]}.

      Hier sind meine unerledigten Aufgaben (im JSON-Format):
      ${JSON.stringify(taskData)}

      Bitte wähle die 3 wichtigsten Aufgaben aus, auf die ich mich heute konzentrieren sollte, basierend auf:
      1. Priorität (hohe Priorität sollte generell bevorzugt werden)
      2. Passend zu meinem Energielevel (Aufgaben sollten zu meinem aktuellen Energielevel passen)
      3. Fälligkeitsdaten (bald fällige Aufgaben sollten priorisiert werden)
      4. Geschätzte Dauer (berücksichtige, was realistisch heute zu schaffen ist)

      Für jede empfohlene Aufgabe gib bitte einen kurzen Grund an, warum sie ausgewählt wurde.
      Füge auch eine kurze, motivierende Nachricht für meinen Tag hinzu.

      Antworte NUR mit einem validen JSON-Objekt in diesem Format:
      {
        "topTasks": [
          {
            "taskId": number,
            "reason": "kurze Erklärung, warum diese Aufgabe ausgewählt wurde"
          }
        ],
        "motivationalMessage": "kurze, ermutigende Nachricht"
      }

      Schließe maximal 3 Aufgaben ein, oder weniger, wenn weniger verfügbar sind.
    `;

    // Chat mit dem Modell
    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: [
        {
          role: "user",
          parts: [
            {
              text: "Du bist ein ADHS-Coach und Produktivitätsexperte, der mir hilft, meine täglichen Aufgaben zu priorisieren.",
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: "Ich bin hier, um dir als ADHS-Coach zu helfen, deine Aufgaben effektiv zu priorisieren. Ich verstehe, wie wichtig es ist, den richtigen Fokus für deine Energie und Situation zu finden.",
            },
          ],
        },
      ],
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const responseText = response.text();

    // Parse das JSON-Ergebnis
    try {
      const parsedResult = JSON.parse(responseText) as DailyFocusResponse;

      // Validiere die Antwort
      return {
        topTasks: parsedResult.topTasks || [],
        motivationalMessage:
          parsedResult.motivationalMessage || "Du schaffst das heute!",
      };
    } catch (parseError) {
      console.error("Fehler beim Parsen der JSON-Antwort:", parseError);
      // Fallback
      return createFallbackFocusSuggestions(uncompletedTasks);
    }
  } catch (error) {
    console.error("Gemini API Fehler bei Fokusvorschlägen:", error);

    // Fallback bei API-Fehler
    return createFallbackFocusSuggestions(
      tasks.filter((task) => !task.completed)
    );
  }
}

function createFallbackFocusSuggestions(tasks: Task[]): DailyFocusResponse {
  // Sortiere nach Priorität (high > medium > low)
  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityValues = { high: 3, medium: 2, low: 1 };
    return (
      priorityValues[b.priority as keyof typeof priorityValues] -
      priorityValues[a.priority as keyof typeof priorityValues]
    );
  });

  // Wähle die Top 3 Aufgaben (oder weniger, wenn weniger verfügbar sind)
  const topTasks = sortedTasks.slice(0, 3).map((task) => ({
    taskId: task.id,
    reason: `Diese Aufgabe hat ${task.priority} Priorität.`,
  }));

  return {
    topTasks,
    motivationalMessage: "Konzentriere dich auf eine Aufgabe nach der anderen!",
  };
}

// Emoji-Vorhersage für Aufgaben basierend auf Aufgabentitel und Beschreibung
export async function predictTaskEmoji(
  taskTitle: string,
  taskDescription: string = ""
): Promise<string[]> {
  try {
    // Gemini-Modell konfigurieren
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const generationConfig = {
      temperature: 0.7,
      topK: 32,
      topP: 0.95,
      maxOutputTokens: 1024,
    };

    // Standard-Sicherheitseinstellungen verwenden
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

    // Prompt für die KI erstellen
    const prompt = `
      Aufgabentitel: "${taskTitle}"
      ${taskDescription ? `Beschreibung: "${taskDescription}"` : ""}

      Analysiere diese Aufgabe und schlage 5 passende Emojis vor, die den Inhalt oder Kontext der Aufgabe am besten repräsentieren.
      Die Emojis sollten dem Nutzer helfen, schnell zu erkennen, worum es bei der Aufgabe geht.

      Gib NUR ein JSON-Array mit 5 Emojis zurück, ohne zusätzlichen Text oder Erklärungen.

      Beispiel:
      ["📝", "📚", "🎓", "📊", "💻"]

      Deine Antwort:
    `;

    // Chat mit dem Modell
    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: [
        {
          role: "user",
          parts: [
            {
              text: "Du bist ein Experte für die Kategorisierung von Aufgaben mit passenden Emojis.",
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: "Ich bin bereit, jede Aufgabe zu analysieren und passende Emojis vorzuschlagen, die den Inhalt oder Kontext der Aufgabe am besten repräsentieren.",
            },
          ],
        },
      ],
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const responseText = response.text();

    // Parse das JSON-Ergebnis
    try {
      // Manchmal kann die KI zusätzlichen Text zurückgeben, daher versuchen wir, alles außer dem JSON-Array zu entfernen
      let cleanedResponse = responseText.trim();
      // Wenn die Antwort mit ``` beginnt und endet (Markdown-Codeblock), entfernen wir diese
      if (
        cleanedResponse.startsWith("```") &&
        cleanedResponse.endsWith("```")
      ) {
        cleanedResponse = cleanedResponse.slice(3, -3).trim();
        // Wenn nach dem Entfernen der ``` noch "json" am Anfang steht, entfernen wir auch das
        if (cleanedResponse.startsWith("json")) {
          cleanedResponse = cleanedResponse.slice(4).trim();
        }
      }

      const parsedEmojis = JSON.parse(cleanedResponse) as string[];

      // Stelle sicher, dass wir genau 5 Emojis haben
      const emojis = parsedEmojis.slice(0, 5);

      // Falls wir weniger als 5 Emojis haben, fülle mit allgemeinen Emojis auf
      while (emojis.length < 5) {
        const defaultEmojis = ["📝", "✅", "⏰", "🔔", "📌"];
        emojis.push(defaultEmojis[emojis.length]);
      }

      return emojis;
    } catch (parseError) {
      console.error("Fehler beim Parsen der Emoji-Antwort:", parseError);
      // Fallback bei Parsing-Fehler
      return ["📝", "✅", "⏰", "🔔", "📌"];
    }
  } catch (error) {
    console.error("Gemini API Fehler bei Emoji-Vorhersage:", error);
    // Fallback bei API-Fehler
    return ["📝", "✅", "⏰", "🔔", "📌"];
  }
}

// Interface für die Antwort der NLP-Analyse
export interface NLPTaskAnalysisResponse {
  title: string;
  description: string | null;
  priority: PriorityLevel;
  energyLevel: EnergyLevel | null;
  dueDate: string | null;
  category: CategoryType;
  estimatedDuration: number | null;
}

// Analysiert eine natürlichsprachliche Aufgabeneingabe und extrahiert strukturierte Informationen
export async function analyzeNaturalLanguageTask(
  input: string
): Promise<NLPTaskAnalysisResponse> {
  try {
    // Gemini-Modell konfigurieren
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const generationConfig = {
      temperature: 0.3, // Niedrigere Temperatur für konstantere Ergebnisse
      topK: 32,
      topP: 0.95,
      maxOutputTokens: 1024,
    };

    // Standard-Sicherheitseinstellungen
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

    // Prompt für die NLP-Analyse
    const prompt = `
      Analysiere den folgenden natürlichsprachlichen Text, der eine Aufgabe beschreibt:

      "${input}"

      Extrahiere die folgenden Informationen:

      1. Einen klaren, prägnanten Titel für die Aufgabe (max. 50 Zeichen)
      2. Eine kurze Beschreibung, falls vorhanden (oder null)
      3. Die Priorität der Aufgabe (high, medium, low)
      4. Das Energielevel, das für die Aufgabe benötigt wird (high, medium, low oder null wenn nicht erwähnt)
      5. Das Fälligkeitsdatum (im ISO-Format YYYY-MM-DD oder null wenn nicht erwähnt)
      6. Die Kategorie (personal, work, family, health)
      7. Die geschätzte Dauer in Minuten (oder null wenn nicht erwähnt)

      Berücksichtige folgende Hinweise:
      - Achte auf zeitliche Ausdrücke wie "morgen", "nächste Woche", "am Freitag" usw. und konvertiere sie in konkrete Daten
      - Suche nach Begriffen, die auf Priorität hinweisen (z.B. "dringend", "wichtig", "irgendwann")
      - Suche nach Begriffen, die auf Energielevel hinweisen (z.B. "anstrengend", "einfach", "komplex")
      - Kategorisiere die Aufgabe basierend auf ihrem Kontext (z.B. "E-Mails" → work, "Einkaufen" → personal)

      Gib deine Antwort AUSSCHLIESSLICH als JSON-Objekt zurück in diesem Format:
      {
        "title": "Aufgabentitel",
        "description": "Beschreibung oder null",
        "priority": "high|medium|low",
        "energyLevel": "high|medium|low|null",
        "dueDate": "YYYY-MM-DD|null",
        "category": "personal|work|family|health",
        "estimatedDuration": number|null
      }

      Heute ist der ${new Date().toISOString().split("T")[0]}.
    `;

    // Chat mit dem Modell
    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: [
        {
          role: "user",
          parts: [
            {
              text: "Ich werde dir Aufgabenbeschreibungen in natürlicher Sprache geben. Du sollst sie analysieren und in strukturierte Daten umwandeln.",
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: "Ich bin bereit, deine Aufgabenbeschreibungen zu analysieren und in strukturierte Daten umzuwandeln. Ich werde alle wichtigen Informationen extrahieren und als JSON zurückgeben.",
            },
          ],
        },
      ],
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const responseText = response.text();

    // JSON-Antwort parsen
    try {
      // Bereinigen der Antwort, falls sie in Markdown-Codeblöcken ist
      let cleanedResponse = responseText.trim();
      if (
        cleanedResponse.startsWith("```") &&
        cleanedResponse.endsWith("```")
      ) {
        cleanedResponse = cleanedResponse.slice(3, -3).trim();
        if (cleanedResponse.startsWith("json")) {
          cleanedResponse = cleanedResponse.slice(4).trim();
        }
      }

      const parsedResult = JSON.parse(
        cleanedResponse
      ) as NLPTaskAnalysisResponse;

      // Validiere und bereinige die Ergebnisse
      return {
        title: parsedResult.title || input.substring(0, 50),
        description: parsedResult.description,
        priority: validatePriority(parsedResult.priority),
        energyLevel: validateEnergyLevel(parsedResult.energyLevel),
        dueDate: parsedResult.dueDate || null,
        category: validateCategory(parsedResult.category),
        estimatedDuration:
          parsedResult.estimatedDuration !== null
            ? Math.max(1, Math.round(parsedResult.estimatedDuration))
            : null,
      };
    } catch (parseError) {
      console.error("Fehler beim Parsen der NLP-Analyse:", parseError);
      // Fallback bei Parsing-Fehler
      return createFallbackNLPAnalysis(input);
    }
  } catch (error) {
    console.error("Gemini API Fehler bei NLP-Analyse:", error);
    // Fallback bei API-Fehler
    return createFallbackNLPAnalysis(input);
  }
}

// Erstellt eine Fallback-Analyse wenn die API fehlschlägt
function createFallbackNLPAnalysis(input: string): NLPTaskAnalysisResponse {
  return {
    title: input.substring(0, 50), // Nimm die ersten 50 Zeichen als Titel
    description: null,
    priority: PriorityLevel.MEDIUM,
    energyLevel: EnergyLevel.MEDIUM,
    dueDate: null,
    category: CategoryType.PERSONAL,
    estimatedDuration: null,
  };
}

function validatePriority(priority: string): PriorityLevel {
  priority = priority?.toLowerCase() || "";
  if (priority === PriorityLevel.HIGH) return PriorityLevel.HIGH;
  if (priority === PriorityLevel.LOW) return PriorityLevel.LOW;
  return PriorityLevel.MEDIUM;
}

function validateEnergyLevel(energyLevel: string | null): EnergyLevel | null {
  if (!energyLevel) return null;
  energyLevel = energyLevel.toLowerCase();
  if (energyLevel === EnergyLevel.HIGH) return EnergyLevel.HIGH;
  if (energyLevel === EnergyLevel.LOW) return EnergyLevel.LOW;
  if (energyLevel === EnergyLevel.MEDIUM) return EnergyLevel.MEDIUM;
  return null;
}

function validateCategory(category: string): CategoryType {
  category = category?.toLowerCase() || "";
  if (category === CategoryType.WORK) return CategoryType.WORK;
  if (category === CategoryType.FAMILY) return CategoryType.FAMILY;
  if (category === CategoryType.HEALTH) return CategoryType.HEALTH;
  return CategoryType.PERSONAL;
}
