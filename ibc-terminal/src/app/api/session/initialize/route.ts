/**
 * /api/session/initialize/route.ts
 * --------------------------------
 * API endpoint for initializing a new or returning session in the IBC Terminal research platform.
 * Handles session creation, world introduction retrieval, and initial message setup for research onboarding.
 *
 * POST: Accepts deviceId, worldId, and variant; returns sessionId and initial world introduction message.
 */

import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { getOrCreateSession } from "@/models/Session";
import { getWorldIntroduction } from "@/lib/gemini";

// Function to strip markdown from text
const stripMarkdown = (text: string): string => {
  return (
    text
      // Remove headers
      .replace(/#{1,6}\s+/g, "")
      // Remove bold/italic
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/_(.+?)_/g, "$1")
      // Remove links
      .replace(/\[(.+?)\]\((.+?)\)/g, "$1")
      // Remove blockquotes
      .replace(/^>\s+/gm, "")
      // Remove code blocks and inline code
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`([^`]+)`/g, "$1")
      // Remove horizontal rules
      .replace(/^---$/gm, "")
      // Remove ordered and unordered lists markers
      .replace(/^\s*[\*\-]\s+/gm, "")
      .replace(/^\s*\d+\.\s+/gm, "")
  );
};

/**
 * Handles POST requests to initialize a session and provide the world introduction message.
 * @param request - Next.js API request object
 * @returns JSON response with sessionId and initialMessage or error
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { deviceId, worldId, variant } = await request.json();

    // Validate required fields
    if (!deviceId || worldId === undefined || !variant) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get MongoDB connection
    const db = await getDatabase();

    // Get or create session
    const session = await getOrCreateSession(db, deviceId, worldId, variant);

    // Get world introduction from Gemini or use existing one from history
    let initialMessage;

    if (session.history.length > 0) {
      // Find the first model message in history (was previously 'assistant')
      const modelMessage = session.history.find(
        (msg) => msg.role === "model"
      );
      if (modelMessage?.parts[0]?.text) {
        initialMessage = modelMessage.parts[0].text;
      } else {
        // Fallback if no model message is found
        initialMessage =
          'Welcome back to the adventure. Type "help" for available commands.';
      }
    } else {
      // Get new introduction from Gemini
      try {
        const introMessage = await getWorldIntroduction(worldId, variant);
        // Strip any markdown from the message
        initialMessage = stripMarkdown(
          introMessage || "Welcome to the adventure."
        );

        // Add a placeholder user message first (Gemini requires history to start with user)
        // Then add the model's welcome message - use 'model' role for Gemini compatibility
        await db.collection("sessions").updateOne(
          { _id: session._id },
          {
            $push: {
              history: {
                $each: [
                  {
                    role: "user",
                    parts: [{ text: "START_GAME" }],
                  },
                  {
                    role: "model", // Use 'model' instead of 'assistant' for Gemini
                    parts: [{ text: initialMessage }],
                  },
                ],
              } as any,
            },
          }
        );
      } catch (error) {
        console.error("Error getting world introduction:", error);
        initialMessage =
          'Welcome to the Termature. Type "help" for available commands.';

        // Add the fallback message to history
        await db.collection("sessions").updateOne(
          { _id: session._id },
          {
            $push: {
              history: {
                $each: [
                  {
                    role: "user",
                    parts: [{ text: "START_GAME" }],
                  },
                  {
                    role: "model", // Use 'model' instead of 'assistant' for Gemini
                    parts: [{ text: initialMessage }],
                  },
                ],
              } as any,
            },
          }
        );
      }
    }

    return NextResponse.json({
      sessionId: session._id,
      initialMessage: initialMessage,
    });
  } catch (error) {
    console.error("Error initializing session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
