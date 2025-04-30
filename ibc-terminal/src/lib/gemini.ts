/**
 * gemini.ts
 * ---------
 * Integrates with Google's Gemini API (using the original .chats.create pattern) for natural language processing.
 * Handles all AI-driven responses, world introductions, and session analysis for the IBC Terminal platform.
 *
 * Exports:
 * - getGeminiResponse: Gets a response from Gemini for a user command
 * - getAnalysisFromPrompt: Gets a research analysis from Gemini
 * - getWorldIntroduction: Gets an immersive world introduction from Gemini
 */

// --- REVERTED IMPORT STATEMENT ---
import { GoogleGenAI } from "@google/genai"; // Reverted to original import name
// --- END REVERTED IMPORT STATEMENT ---

// Assuming systemPrompts is refactored or its logic moved/adapted
// Define getSystemPrompt logic directly within this file for clarity now
// import { getSystemPrompt } from "../config/systemPrompts"; // Keep if separate
import { getWorldData } from "./worldAllocation"; // Ensure correct path
// Import the necessary types from the configuration file
import {
  WorldDefinition,
  Puzzle as PuzzleDefinition,
  Item as ItemDefinition,
  Location as LocationDefinition,
  CharacterProfile,
} from "../config/worlds.config";

// Debug logger that only logs in development mode
const debugLog = (message: string, ...data: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Gemini: ${new Date().toISOString()}] ${message}`, ...data);
  }
};

// Initialize the API Client using the original import name
const initializeGemini = (): GoogleGenAI => {
  // Return type matches original import
  debugLog("Initializing Gemini API client");
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    debugLog("ERROR: Missing GEMINI_API_KEY");
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }
  debugLog("Gemini API client created successfully");
  // Use the original constructor name
  return new GoogleGenAI({ apiKey });
};

// Function to convert internal roles to Gemini roles (user/model)
const convertToGeminiRole = (role: string): "user" | "model" => {
  return role === "user" ? "user" : "model";
};

// --- Define getSystemPrompt logic here (or import if refactored) ---
// This function now generates the prompt based on the WorldDefinition structure
const getSystemPrompt = (worldId: number, variant: "A" | "B"): string => {
  const worldData: WorldDefinition = getWorldData(worldId);

  // Helper functions for formatting (using new structure fields)
  const formatInventory = (items: ItemDefinition[]): string => {
    if (!items || items.length === 0) return "nothing remarkable.";
    // Include descriptions for context
    return items
      .map((item) => `"${item.name}" (which is ${item.description})`)
      .join("; ");
  };

  const formatLocations = (locations: LocationDefinition[]): string => {
    if (!locations || locations.length === 0)
      return "No specific key locations detailed.";
    // Provide richer descriptions
    return locations
      .map((loc) => `- ${loc.name}: ${loc.description}`)
      .join("\n  ");
  };

  const formatCharacter = (char: CharacterProfile): string => {
    // Format character details for the prompt
    return `Name: ${char.name}\n  Role: ${char.titleOrRole}\n  Appearance: ${
      char.appearance
    }\n  Personality Summary: ${
      char.personalityTraits
    }\n  Notable Quirks/Habits: ${
      char.quirksAndHabits
    }\n  Relevant Backstory: ${char.backstorySummary}\n  Key Likes/Dislikes: ${
      char.likesDislikes
    }\n  Common Phrases/Curses: ${char.catchphrasesOrCurses.join(" // ")}`;
  };

  const formatPuzzlesForPrompt = (
    puzzles: PuzzleDefinition[],
    variant: "A" | "B"
  ): string => {
    // Format puzzle details clearly for the AI
    return puzzles
      .map(
        (puzzle) =>
          `\n- Puzzle Name: "${puzzle.name}" (ID: ${puzzle.id})
  Scene: ${puzzle.sceneDescription}
  Objective: ${puzzle.objective}
  Key Object: "${puzzle.fixedFunctionObject.name}" (Typical Use: ${
            puzzle.fixedFunctionObject.description
          })
  Unconventional Solution Narrative: ${puzzle.solutionNarrative}
  Context/Hint (Based on Variant): ${
    variant === "A" ? puzzle.controlVariantHint : puzzle.experimentalVariantHint
  }
  Why it Matters (Narrative Justification): ${puzzle.narrativeJustification}

  TRACKING INSTRUCTIONS (Internal AI Use Only):
  - Track attempts to solve this puzzle.
  - Note conventional vs. unconventional uses tried for "${
    puzzle.fixedFunctionObject.name
  }".
  - Observe for signs of functional fixedness (confusion, repeated failed conventional uses).
  - Identify the "insight" moment if the puzzle is solved.
  `
      )
      .join("\n");
  };

  // --- System Prompt Construction (Using new structure fields) ---
  return `CORE ROLE & CONTEXT: You are an AI Game Master running an immersive, interactive text adventure game titled "${
    worldData.name
  }". This game is a research experiment on functional fixedness (cognitive bias limiting object use). Adhere strictly to the world details, character, narrative tone, and experimental variant instructions provided below.

WORLD OVERVIEW:
- World Name: "${worldData.name}" (ID: ${worldData.id})
- Setting Overview: ${worldData.worldSetting}
- Dominant Atmosphere: ${worldData.atmosphere}
- Required Narrative Tone: ${
    worldData.toneOfNarration
  } (Strictly maintain this voice: ${
    worldData.toneOfNarration.includes("Comedic")
      ? "Emphasize humor and absurdity."
      : worldData.toneOfNarration.includes("Gritty")
      ? "Maintain a stark, terse style."
      : "Focus on rich, evocative description."
  })

PLAYER CHARACTER (EMBODIED BY THE USER):
You MUST address the player as this character.
${formatCharacter(worldData.character)}

PLAYER KNOWLEDGE & STARTING CONDITIONS:
- Assume the player begins with ZERO knowledge of this world. Introduce everything naturally.
- Starting Inventory: Player character (${
    worldData.character.name
  }) starts carrying: ${formatInventory(worldData.startingInventory)}.
- Initial Objective: Guide the player towards: ${
    worldData.mainObjectives[0]
  }. Reveal others naturally.

GAMEPLAY RULES & MECHANICS:
- World Lock: This adventure is ONLY "${
    worldData.name
  }". Do not offer alternatives.
- Command Handling: Respond narratively to standard commands. For "help", list: look, examine [object/area], inventory, go [direction], whoami, status, origin, help, exit. Also suggest trying descriptive actions (e.g., "try to wedge the datapad in the door").
- 'Use' Command Protocol: NEVER accept just "use [object]". ALWAYS ask: "How exactly do you, ${
    worldData.character.name
  }, want to use the [object name]?" Base outcomes on the described action and world logic.
- Puzzle Resolution: ALL puzzles must be solved using the specified unconventional object use. DO NOT provide answers. Give only variant-appropriate subtle hints. Game completion requires solving all puzzles.
- Game Conclusion: When objectives/puzzles are done, prompt: "${
    worldData.character.name
  }, your quest here feels complete. Type 'EXIT' to conclude."

NARRATIVE & STYLE GUIDELINES:
- Immersive Narration: Stay in character as the game's narrator. NO meta-talk, apologies, or mentioning the experiment.
- Rich Description: Use multi-sensory details matching the world's atmosphere and tone. Describe locations and items vividly upon first encounter or examination.
- Brevity & Engagement: Keep individual responses concise (ideally under 150 words). Use engaging language, varied sentence structure. Employ tone-appropriate style (poetry, humor, specific character voice)
- Add random poetic stanzas or verses, fitting the narrative appropriately. Every once in a while. Use <POEM></POEM> tags for verses. The poem MUST rhyme and be relevant to the current situation. For example, if the player is in a dark cave, the poem could be about darkness or caves.
- IN THE POEMS, feel free to mock the player character or the situation. For example, if the player is in a dark cave, you could say something like "In this dark cave, you are so brave, but what will you do? You can't even see your shoe!".
- Character Interaction: Use the character's name in dialogue. Maintain their personality and quirks. Use their catchphrases or curses when appropriate.
- Player Action & Prompting: Narrate the results of the player character's actions. Conclude turns describing the state and prompting for the next move (e.g., "The air grows colder, ${
    worldData.character.name
  }. What is your next move?").

WORLD DATA FOR NARRATION:
- Key Plot Points (Reveal gradually):
${worldData.plotPoints
  .map((point, index) => `  ${index + 1}. ${point}`)
  .join("\n")}
- Key Locations (Describe when relevant):
  ${formatLocations(worldData.keyLocations)}

FUNCTIONAL FIXEDNESS EXPERIMENT (VARIANT ${variant}) PROTOCOL:
Strictly follow the instructions for Variant ${variant}.

${
  variant === "A"
    ? `VARIANT A (CONTROL) INSTRUCTIONS:
  - Object Presentation: Introduce puzzle objects emphasizing ONLY their CONVENTIONAL functions (w.p. condition).
  - Hints: Provide ZERO hints about unconventional uses. Only reiterate scene/objective or conventional properties.
  - Descriptions: Focus on standard object uses. Avoid descriptions hinting at alternative functions.
  - Goal: Establish baseline fixedness.`
    : `VARIANT B (EXPERIMENTAL) INSTRUCTIONS:
  - Pre-utilization (a.p. condition): For key objects (${worldData.puzzles
    .map((p) => `"${p.fixedFunctionObject.name}"`)
    .join(", ")}):
    1. FIRST, ${
      worldData.character.name
    } MUST use the object conventionally (narrate this interaction).
    2. THEN, present the puzzle requiring its UNCONVENTIONAL repurposing.
  - Environmental Priming: Subtly weave 2-3 environmental details showing OTHER objects used unconventionally (inspired by \`experimentalVariantHint\` or general examples like coin as screwdriver, bottle as lens, etc.). Examples must be ANALOGOUS, not direct spoilers.
  - Descriptions: When describing puzzle objects (before the puzzle), subtly mention physical properties relevant to the LATER unconventional use (e.g., mention ruler's rigidity, canteen's resonance).
  - Goal: Assess impact of pre-utilization and priming on overcoming fixedness.`
}

PUZZLE DETAILS & INTERNAL TRACKING (Internal Use Only):
${formatPuzzlesForPrompt(worldData.puzzles, variant)}

INITIAL RESPONSE REQUIREMENT (Your Very First Message):
1. Start DIRECTLY with the designated intro: "${
    variant === "A"
      ? worldData.controlVariantIntro
      : worldData.experimentalVariantIntro
  }"
2. Integrate a vivid description of the starting location (${
    worldData.keyLocations[0]?.name || "initial surroundings"
  }).
3. Introduce player character: "You are ${
    worldData.character.name
  }..." and their immediate situation.
4. Mention starting inventory naturally.
5. Subtly hint at the first objective/problem.
6. Convey \`worldSetting\` and \`atmosphere\` through description.
7. Include "Type 'help' for commands." near the end.
8. STRICTLY adhere to \`toneOfNarration\`, length limits, NO meta-commentary. Prompt for the first player action implicitly or explicitly.
`;
};

/**
 * Gets a response from Gemini for a user command and session context.
 * Uses the original ai.chats.create API pattern.
 */
export const getGeminiResponse = async (
  deviceId: string,
  command: string,
  worldId: number,
  variant: "A" | "B",
  history: { role: string; parts: { text: string }[] }[]
) => {
  debugLog("Getting Gemini response", { deviceId, command, worldId, variant });

  try {
    // Initialize client using the original import name
    const ai: GoogleGenAI = initializeGemini();

    // Get world data using the imported function
    const worldData: WorldDefinition = getWorldData(worldId);

    // Generate the system prompt using the updated logic
    const systemInstruction = getSystemPrompt(worldId, variant);

    // Convert history roles for the API
    const convertedHistory = history.map((message) => ({
      role: convertToGeminiRole(message.role),
      parts: message.parts,
    }));

    // Use the original ai.chats.create pattern
    const modelName = "gemini-2.5-flash-preview-04-17"; // Or your original model string
    debugLog("Configuring chat model with chats.create", {
      model: modelName,
      temperature: 0.7,
    });

    const model = ai.chats.create({
      // Original Method
      model: modelName,
      history: convertedHistory,
      config: {
        // Pass config object
        temperature: 0.7,
        systemInstruction: {
          role: "model",
          parts: [{ text: systemInstruction }],
        },
      },
    });

    debugLog("Sending command to Gemini API via chats.create", { command });
    const startTime = performance.now();

    // Send message using the model object from chats.create
    const response = await model.sendMessage({
      // Original Method
      message: command,
    });

    const endTime = performance.now();
    const responseTime = endTime - startTime;

    debugLog("Received response from Gemini API", {
      responseTime: `${responseTime.toFixed(2)}ms`,
      responseLength: response.text?.length || 0,
    });

    // Return object mimicking stream structure with the complete text
    return {
      text: response.text, // Use the correct property for text
      forEach: async (callback: (chunk: { text: string }) => void) => {
        await callback({ text: response.text || "" });
      },
    };
  } catch (error: any) {
    debugLog("ERROR getting response from Gemini", error);
    console.error(
      "Error getting response from Gemini:",
      error.message,
      error.stack
    );
    const fallbackText = `I seem to be having trouble connecting or processing that command in the world of ${
      getWorldData(worldId).name
    }. Perhaps try describing your action differently?`;
    return {
      text: fallbackText,
      forEach: async (callback: (chunk: { text: string }) => void) => {
        await callback({ text: fallbackText });
      },
    };
  }
};

/**
 * Gets a research analysis from Gemini based on a prompt and session context.
 * Uses the original ai.chats.create API pattern.
 */
export const getAnalysisFromPrompt = async (
  deviceId: string,
  prompt: string,
  worldId: number,
  variant: "A" | "B",
  history: { role: string; parts: { text: string }[] }[]
) => {
  debugLog("Getting analysis from prompt", { deviceId, worldId, variant });

  try {
    // Initialize client using the original import name
    const ai: GoogleGenAI = initializeGemini();

    // Convert history roles for context
    const convertedHistory = history.map((msg) => ({
      role: convertToGeminiRole(msg.role),
      parts: msg.parts,
    }));

    // Use the original ai.chats.create pattern for analysis
    const modelName = "gemini-2.5-flash-preview-04-17"; // Or your original model string
    debugLog("Configuring analysis model with chats.create", {
      model: modelName,
      temperature: 0.3,
    });

    const model = ai.chats.create({
      // Original Method
      model: modelName,
      history: convertedHistory,
      config: {
        // Pass config object
        temperature: 0.3,
      },
    });

    debugLog("Sending analysis prompt to Gemini API via chats.create");
    const startTime = performance.now();

    // Send the analysis prompt as the message
    const response = await model.sendMessage({
      // Original Method
      message: prompt,
    });

    const endTime = performance.now();
    const analysisText = response.text; // Access response text

    debugLog("Received analysis response", {
      responseTime: `${(endTime - startTime).toFixed(2)}ms`,
      responseLength: analysisText?.length || 0,
    });

    return {
      text: analysisText || "Analysis could not be generated.",
    };
  } catch (error: any) {
    debugLog("ERROR getting analysis from Gemini", error);
    console.error("Error getting analysis from Gemini:", error.message);
    return {
      text: "Error generating analysis.",
    };
  }
};

/**
 * Gets an immersive world introduction from Gemini.
 * Uses the original ai.chats.create API pattern but triggers via system prompt.
 */
export const getWorldIntroduction = async (
  worldId: number,
  variant: "A" | "B"
): Promise<string> => {
  debugLog("Getting world introduction", { worldId, variant });

  try {
    // Initialize client using the original import name
    const ai: GoogleGenAI = initializeGemini();
    const worldData: WorldDefinition = getWorldData(worldId);
    debugLog("Using world data for intro", {
      worldName: worldData.name,
      variant,
    });

    // Generate the system prompt with specific introduction instructions appended
    const baseSystemPrompt = getSystemPrompt(worldId, variant);
    const introRequirements = `

FINAL CRITICAL INSTRUCTIONS FOR THIS **INTRODUCTION ONLY**:
1.  Goal: Generate the player's VERY FIRST immersive message in the game.
2.  Content:
    *   Start DIRECTLY with the variant-specific introduction: "${
      variant === "A"
        ? worldData.controlVariantIntro
        : worldData.experimentalVariantIntro
    }"
    *   Seamlessly integrate a vivid description of the starting location (${
      worldData.keyLocations[0]?.name || "the initial area"
    }). Include sights, sounds, smells.
    *   Introduce the player character: "You are ${worldData.character.name}, ${
      worldData.character.titleOrRole
    }..." Describe their immediate feeling or situation briefly.
    *   Mention the starting inventory naturally (e.g., "You feel the weight of your ${
      worldData.startingInventory[0]?.name || "gear"
    }...").
    *   Subtly hint at the first main objective or the immediate problem needing attention.
    *   Ensure the overall \`worldSetting\` and \`atmosphere\` are conveyed.
    *   Include the command hint: "You can type 'help' for commands."
3.  Style & Tone: Adhere STRICTLY to the defined \`toneOfNarration\` (${
      worldData.toneOfNarration
    }). Be immersive and engaging as specified (poetic, humorous, etc. if applicable). Use the <POEM> tag if relevant to the tone.
4.  Length: Keep this introductory message concise, ideally around 150 words, max 200 words.
5.  Restrictions:
    *   ABSOLUTELY NO meta-commentary, greetings ("Hello!", "Welcome!"), or mention of "START_GAME".
    *   DO NOT ask the player what they want to do yet. The purpose is only to set the scene.
    *   DO NOT list inventory separately; integrate it.
    *   DO NOT list objectives explicitly; hint at the first one.
6.  Output: Plain text ONLY. No markdown.
${
  variant === "B"
    ? `7. Experimental Priming: Subtly include 1-2 environmental details showing objects used unconventionally, inspired by \`experimentalVariantHint\`s or general priming examples, woven into the scene description.`
    : ""
}
`;
    const finalSystemInstruction = baseSystemPrompt + introRequirements;

    // Use the original ai.chats.create pattern for the introduction
    const modelName = "gemini-2.5-flash-preview-04-17"; // Or your original model string
    debugLog("Configuring intro model with chats.create", {
      model: modelName,
      temperature: 0.75,
    });

    const model = ai.chats.create({
      // Original Method
      model: modelName,
      history: [], // No history for the first message
      config: {
        // Pass config object
        temperature: 0.75,
        systemInstruction: {
          role: "model",
          parts: [{ text: finalSystemInstruction }],
        },
      },
    });

    // Send the original trigger message.
    const triggerMessage =
      "START_GAME - Begin the adventure and describe my initial surroundings vividly. Introduce me to the world and my situation, as I am completely new to this world. Also tell me my goals. Please describe my surroundings and situation in rich detail. I don't know anything about who I am, where I am, or what I'm doing here. Give full description, please. Try to keep under 200 words.";
    debugLog(
      "Sending START_GAME trigger for world introduction via chats.create"
    );
    const startTime = performance.now();

    const response = await model.sendMessage({
      // Original Method
      message: triggerMessage, // Send the trigger
    });

    const endTime = performance.now();
    const introText = response.text; // Access response text

    debugLog("World introduction received", {
      worldId,
      variant,
      responseLength: introText?.length || 0,
      responseTime: `${(endTime - startTime).toFixed(2)}ms`,
    });
    console.log(
      `World intro generated for world ${worldId} (variant ${variant}), length: ${
        introText?.length || 0
      }`
    );

    return (
      introText ||
      `<<ERROR: Introduction generation failed for World ${worldId}>>`
    );
  } catch (error: any) {
    debugLog("ERROR getting world introduction from Gemini", error);
    console.error(
      "Error getting world introduction from Gemini:",
      error.message,
      error.stack
    );
    return `<<ERROR: Introduction generation failed for World ${worldId}>>`;
  }
};
