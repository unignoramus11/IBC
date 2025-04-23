import { GoogleGenAI } from '@google/genai';
import { getSystemPrompt } from '../config/systemPrompts';

// Initialize the API
const initializeGemini = () => {
  // Get API key from environment variable
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  return new GoogleGenAI({ apiKey });
};

// Get response from Gemini API
export const getGeminiResponse = async (
  deviceId: string,
  command: string,
  worldId: number,
  variant: 'A' | 'B',
  history: { role: string; parts: { text: string }[] }[]
) => {
  try {
    const ai = initializeGemini();
    const model = ai.chats.create({
      model: 'gemini-2.5-flash',
      system: getSystemPrompt(worldId, variant),
      history: history,
    });

    return await model.sendMessageStream({
      message: command,
    });
  } catch (error) {
    console.error('Error getting response from Gemini:', error);
    throw error;
  }
};

// Get initial world intro from Gemini
export const getWorldIntroduction = async (worldId: number, variant: 'A' | 'B') => {
  try {
    const ai = initializeGemini();
    const model = ai.chats.create({
      model: 'gemini-2.5-flash',
      system: getSystemPrompt(worldId, variant),
    });

    const response = await model.sendMessage({
      message: 'START_GAME',
    });

    return response.text();
  } catch (error) {
    console.error('Error getting world introduction from Gemini:', error);
    throw error;
  }
};