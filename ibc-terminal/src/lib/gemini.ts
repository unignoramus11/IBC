/**
 * gemini.ts
 * ---------
 * Integrates with Google's Gemini 2.5 API for natural language processing and research analysis.
 * Handles all AI-driven responses, world introductions, and session analysis for the IBC Terminal platform.
 *
 * Exports:
 * - getGeminiResponse: Gets a response from Gemini for a user command
 * - getAnalysisFromPrompt: Gets a research analysis from Gemini
 * - getWorldIntroduction: Gets an immersive world introduction from Gemini
 */

import { GoogleGenAI } from "@google/genai";
import { getSystemPrompt } from "../config/systemPrompts";
import { getWorldData } from "./worldAllocation";

// Debug logger that only logs in development mode
const debugLog = (message: string, ...data: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Gemini] ${message}`, ...data);
  }
};

// Initialize the API
const initializeGemini = () => {
  debugLog("Initializing Gemini API client");
  // Get API key from environment variable
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    debugLog("ERROR: Missing API key in environment variables");
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  debugLog("Gemini API client created successfully");
  return new GoogleGenAI({ apiKey });
};

// Function to convert internal roles to Gemini roles
const convertToGeminiRole = (role: string): "user" | "model" => {
  debugLog("Converting role", { originalRole: role });
  if (role === "user") return "user";
  // Convert all non-user roles (assistant, system) to 'model'
  return "model";
};

/**
 * Gets a response from Gemini for a user command and session context.
 * @param deviceId - The device/session ID
 * @param command - The user command
 * @param worldId - The world index
 * @param variant - The experimental/control variant
 * @param history - The conversation history
 * @returns An object with the response text and a forEach method for streaming compatibility
 */
export const getGeminiResponse = async (
  deviceId: string,
  command: string,
  worldId: number,
  variant: "A" | "B",
  history: { role: string; parts: { text: string }[] }[]
) => {
  debugLog("Getting Gemini response", {
    deviceId,
    command,
    worldId,
    variant,
    historyLength: history.length,
  });

  try {
    const ai = initializeGemini();

    // Convert roles to Gemini's expected format (user/model only)
    const convertedHistory = history.map((message) => ({
      role: convertToGeminiRole(message.role),
      parts: message.parts,
    }));

    debugLog("Converted history", {
      originalLength: history.length,
      convertedLength: convertedHistory.length,
    });

    // Get world data for debugging
    const worldData = getWorldData(worldId);
    debugLog("Using world data", {
      worldName: worldData.name,
      variant,
    });

    // Add explicit instructions to ensure proper behavior
    const systemPrompt = getSystemPrompt(worldId, variant);
    const enhancedPrompt =
      systemPrompt +
      `

CRITICAL RESPONSE REQUIREMENTS:
1. NEVER ask what game the player wants to play
2. NEVER offer alternative game types
3. NEVER use markdown formatting
4. NEVER break character or the fourth wall
5. ALWAYS respond in plain text
6. ALWAYS stay within the "${worldData.name}" world setting
7. ALWAYS respond immediately without asking for clarification about which game
8. RESPOND directly to the player's commands as the immersive game narrator
9. ASK the player to type "EXIT" once the game is complete
${
  worldData.name.endsWith("(SHORT)")
    ? "10. Make this gameplay SHORT, while keeping it fun and engaging. Keep it WITHIN 5 MINUTES"
    : ""
}`;

    debugLog("Created enhanced system prompt", {
      originalLength: systemPrompt.length,
      enhancedLength: enhancedPrompt.length,
    });

    debugLog("Configuring chat model", {
      model: "gemini-2.5-flash-preview-04-17",
      temperature: 0.7,
      historyTokens: convertedHistory.length,
    });

    const model = ai.chats.create({
      model: "gemini-2.5-flash-preview-04-17",
      history: convertedHistory,
      config: {
        temperature: 0.7,
        systemInstruction: enhancedPrompt,
      },
    });

    debugLog("Sending command to Gemini API", { command });
    const startTime = performance.now();

    // Get complete response in one go (no streaming)
    const response = await model.sendMessage({
      message: command,
    });

    const endTime = performance.now();
    const responseTime = endTime - startTime;

    debugLog("Received response from Gemini API", {
      responseTime: `${responseTime.toFixed(2)}ms`,
      responseLength: response.text?.length || 0,
    });

    // Return an object that mimics a stream but is actually just the complete response
    return {
      text: response.text,
      // This function will be called once with the complete text
      // It matches what a stream would get with .forEach
      forEach: async (callback: (chunk: { text: string }) => void) => {
        debugLog("Executing forEach callback with complete response");
        await callback({ text: response.text || "" });
        debugLog("Callback execution complete");
      },
    };
  } catch (error) {
    debugLog("ERROR getting response from Gemini", error);
    console.error("Error getting response from Gemini:", error);
    throw error;
  }
};

/**
 * Gets a research analysis from Gemini based on a prompt and session context.
 * @param deviceId - The device/session ID
 * @param prompt - The analysis prompt
 * @param worldId - The world index
 * @param variant - The experimental/control variant
 * @param history - The conversation history
 * @returns An object with the analysis text
 */
export const getAnalysisFromPrompt = async (
  deviceId: string,
  prompt: string,
  worldId: number,
  variant: "A" | "B",
  history: { role: string; parts: { text: string }[] }[]
) => {
  debugLog("Getting analysis from prompt", {
    deviceId,
    promptLength: prompt.length,
    worldId,
    variant,
    historyLength: history.length,
  });

  try {
    const ai = initializeGemini();

    debugLog("Configuring analysis model", {
      model: "gemini-2.5-flash-preview-04-17",
      temperature: 0.5,
    });

    const model = ai.chats.create({
      model: "gemini-2.5-flash-preview-04-17",
      history: history,
      config: {
        temperature: 0.5,
      },
    });

    // Send the analysis prompt
    const startTime = performance.now();
    const response = await model.sendMessage({
      message: prompt,
    });
    const endTime = performance.now();

    debugLog("Received analysis response", {
      responseTime: `${(endTime - startTime).toFixed(2)}ms`,
      responseLength: response.text?.length || 0,
    });

    return {
      text: response.text || "",
    };
  } catch (error) {
    debugLog("ERROR getting analysis from Gemini", error);
    console.error("Error getting analysis from Gemini:", error);
    throw error;
  }
};

/**
 * Gets an immersive world introduction from Gemini for a given world and variant.
 * @param worldId - The world index
 * @param variant - The experimental/control variant
 * @returns The introduction text for the world
 */
export const getWorldIntroduction = async (
  worldId: number,
  variant: "A" | "B"
) => {
  debugLog("Getting world introduction", { worldId, variant });

  try {
    const ai = initializeGemini();

    // Get world data for debugging
    const worldData = getWorldData(worldId);
    debugLog("Using world data", {
      worldName: worldData.name,
      variant,
    });

    // Add explicit instructions to ensure proper behavior
    const systemPrompt = getSystemPrompt(worldId, variant);
    debugLog("Retrieved system prompt", {
      promptLength: systemPrompt.length,
    });

    const enhancedPrompt =
      systemPrompt +
      `

FINAL CRITICAL INSTRUCTIONS:
1. The player has NEVER seen this world before
2. Start with a RICH, VIVID description of the initial scene, as well as a SUBTLE HINT about the player's situation and goals
3. NEVER refer to the 'START_GAME' command in your response
4. NEVER ask the player what kind of game they want to play
5. NEVER list game options or game types
6. DO act as the narrator/guide for this specific text adventure
7. DO describe the player's initial surroundings in detail
8. REMEMBER this is specifically the "${worldData.name}" world - no other game options
9. ALWAYS begin by informing the player about their current situation, their environment, and their goals WITHOUT telling them the solution.
10. ENSURE the player is made aware of everything in the description "${worldData.description}".`;

    debugLog("Created enhanced system prompt for world intro", {
      originalLength: systemPrompt.length,
      enhancedLength: enhancedPrompt.length,
    });

    debugLog("Configuring chat model for world introduction", {
      model: "gemini-2.5-flash-preview-04-17",
      temperature: 0.7,
    });

    const model = ai.chats.create({
      model: "gemini-2.5-flash-preview-04-17",
      config: {
        temperature: 0.7,
        systemInstruction: enhancedPrompt,
      },
    });

    // First initialize the context with a user message
    debugLog("Sending initialization message to Gemini");
    const initStartTime = performance.now();

    await model.sendMessage({
      message:
        "I'm a new player in this world. Please describe my surroundings and situation in rich detail. I don't know anything about who I am, where I am, or what I'm doing here. Give full description, please.",
    });

    const initEndTime = performance.now();
    debugLog("Initialization message processed", {
      time: `${(initEndTime - initStartTime).toFixed(2)}ms`,
    });

    // Then send the START_GAME command to trigger the game intro
    debugLog("Sending START_GAME command to generate world introduction");
    const startTime = performance.now();

    const response = await model.sendMessage({
      message:
        "START_GAME - Begin the adventure and describe my initial surroundings vividly. Introduce me to the world and my situation, as I am completely new to this world. Also tell me my goals.",
    });

    const endTime = performance.now();
    const responseTime = endTime - startTime;

    // Log the response for debugging
    debugLog("World introduction received", {
      worldId,
      variant,
      responseLength: response.text?.length || 0,
      responseTime: `${responseTime.toFixed(2)}ms`,
    });

    // Also log to console for server-side visibility
    console.log(
      `World intro received for world ${worldId}, length: ${
        response.text?.length || 0
      }`
    );

    return response.text;
  } catch (error) {
    debugLog("ERROR getting world introduction from Gemini", error);
    console.error("Error getting world introduction from Gemini:", error);
    throw error;
  }
};
