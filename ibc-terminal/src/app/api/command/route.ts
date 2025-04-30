/**
 * @file src/app/api/command/route.ts
 * @module api/command
 * @description API route handler for processing user commands within the IBC Terminal.
 * This endpoint receives a command from the client, retrieves or creates the user's session,
 * interacts with the Gemini AI model to get a narrative response based on the command and
 * world context, updates the session history and puzzle states, records the interaction,
 * and returns the AI's response along with puzzle context analysis.
 */

import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb"; // Import ObjectId for database operations
import { getDatabase } from "@/lib/mongodb";
import {
  getOrCreateSession,
  updateSessionHistory,
  updatePuzzleState,
  SessionData,
  PuzzleState,
} from "@/models/Session";
import { recordInteraction, InteractionData } from "@/models/Interaction";
import { getGeminiResponse } from "@/lib/gemini";
import { processSpecialCommands } from "@/utils/terminal";
import { getWorldData } from "@/lib/worldAllocation";
import {
  WorldDefinition,
  Puzzle as PuzzleDefinition,
} from "@/config/worlds.config";

/**
 * Interface defining the structure for analyzing the context of a command
 * in relation to the game's puzzles.
 */
interface PuzzleContext {
  /** The unique identifier of the puzzle the command might be related to. */
  activePuzzleId?: string;
  /** Flag indicating if the command represents an attempt to solve the active puzzle using its unconventional solution. */
  isAttemptedSolution: boolean;
  /** Flag indicating if the AI's response confirms the puzzle was successfully solved by the command. Set after AI response analysis. */
  isSolutionSuccess: boolean;
  /** The name of the active puzzle, if any. */
  puzzleName?: string;
  /** The name of the object central to the active puzzle (the one with fixed function). */
  fixedFunctionObject?: string;
  /** Flag indicating if the command represents an attempt to use the puzzle object in its conventional way. */
  conventionalUse?: boolean;
  /** Flag indicating if the player has previously attempted to solve this puzzle (any attempt). */
  previouslyAttempted?: boolean;
  /** Flag indicating if the player has previously solved this puzzle. */
  previouslySolved?: boolean;
}

/**
 * Handles POST requests to the /api/command endpoint.
 * Processes a user's command, interacts with the AI, updates game state, and returns the result.
 *
 * @param {NextRequest} request - The incoming Next.js API request object.
 * @returns {Promise<NextResponse>} A promise resolving to the Next.js API response object.
 *                                  Contains the AI's response, completion status, and puzzle context.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestStartTime = Date.now();
  let deviceId: string | undefined; // Define outside try block for logging

  try {
    // --- 1. Parse Request Body ---
    const body = await request.json();
    deviceId = body.deviceId; // Assign for logging
    const { command, worldId, variant, metrics } = body;

    // --- 2. Input Validation ---
    if (!deviceId || !command || worldId === undefined || !variant) {
      console.error("API Error: Missing required fields in /api/command", {
        deviceId: !!deviceId,
        command: !!command,
        worldId: worldId, // Log the actual value
        variant: !!variant,
      });
      return NextResponse.json(
        {
          error:
            "Missing required fields (deviceId, command, worldId, variant)",
        },
        { status: 400 }
      );
    }
    console.log(
      `[API Command] Received command for device ${deviceId}, world ${worldId}, variant ${variant}`
    );

    // --- 3. Handle Special/Meta Commands ---
    // Check for commands handled directly without AI interaction (e.g., "help", "clear")
    const { isSpecialCommand, result } = processSpecialCommands(command);
    if (isSpecialCommand) {
      console.log(`[API Command] Processing special command: "${command}"`);
      // Return the predefined result for the special command
      return NextResponse.json({
        response: result,
        complete: true, // Indicate command processing is complete
        puzzleContext: { isAttemptedSolution: false, isSolutionSuccess: false }, // Default context for special commands
      });
    }

    // --- 4. Database and Session Initialization ---
    const db = await getDatabase();
    const session: SessionData | null = await getOrCreateSession(
      db,
      deviceId,
      worldId,
      variant
    );

    if (!session || !session._id) {
      console.error(
        `API Error: Failed to get or create session for deviceId: ${deviceId}, worldId: ${worldId}`
      );
      // Throw an error to be caught by the main error handler
      throw new Error("Session initialization failed.");
    }
    console.log(
      `[API Command] Session ${session._id} retrieved/created for device ${deviceId}`
    );

    // --- 5. Load World Data & Analyze Puzzle Context ---
    const worldData: WorldDefinition = getWorldData(worldId);
    let puzzleContext: PuzzleContext = analyzePuzzleContext(
      command,
      worldData.puzzles,
      session.puzzleStates || {} // Pass current puzzle states for analysis
    );
    console.log(
      `[API Command] Initial puzzle context analysis:`,
      puzzleContext
    );

    // --- 6. Record Initial Interaction (Before AI Response) ---
    // Prepare interaction data, ensuring correct types (e.g., ObjectId for sessionId)
    const interactionDataForDb: Omit<
      InteractionData,
      "_id" | "response" | "responseTime"
    > = {
      deviceId,
      sessionId: new ObjectId(session._id), // Ensure sessionId is ObjectId
      worldId,
      variant,
      command,
      timestamp: new Date(requestStartTime), // Use consistent start time
      metrics: metrics || {
        // Provide default metrics if missing
        inputDuration: 0,
        keystrokes: [],
        corrections: 0,
        hesitations: [],
        commandLength: command.length,
      },
      puzzleContext, // Include the initial context analysis
    };
    // Record the interaction, getting the inserted document's ID
    const interaction = await recordInteraction(db, interactionDataForDb);
    console.log(
      `[API Command] Interaction ${interaction._id} recorded (pre-response).`
    );

    // --- 7. Update Session History (User Turn) ---
    // Ensure the history entry conforms to the expected structure (role and parts)
    const userHistoryEntry = {
      role: "user" as "user" | "model", // Explicitly type the role
      parts: [{ text: command as string }],
    };
    await updateSessionHistory(db, session._id, userHistoryEntry);

    // --- 8. Prepare History for AI ---
    // Combine existing history with the new user entry
    const historyForAI = [...session.history, userHistoryEntry];

    // --- 9. Get AI Response ---
    console.log(
      `[API Command] Requesting Gemini response for command: "${command.substring(
        0,
        50
      )}..."`
    );
    const aiResponseStartTime = Date.now();
    const responseObj = await getGeminiResponse(
      deviceId,
      command,
      worldId,
      variant,
      historyForAI // Pass the updated history
    );
    const aiResponseEndTime = Date.now();
    console.log(
      `[API Command] Gemini response received (${
        aiResponseEndTime - aiResponseStartTime
      }ms).`
    );

    // Extract the response text, providing a fallback if necessary
    const responseText =
      responseObj.text ||
      "I seem to be at a loss for words. Could you try phrasing that differently?";

    // --- 10. Update Session History (Model Turn) ---
    // Add the AI's response to the session history
    await updateSessionHistory(db, session._id, {
      role: "model", // Explicitly type the role
      parts: [{ text: responseText }],
    });

    // --- 11. Analyze AI Response for Puzzle Solution ---
    // Check if the AI's response indicates success for the active puzzle attempt
    const responseAnalysis = analyzeResponseForSolution(
      command,
      responseText,
      worldData.puzzles,
      puzzleContext?.activePuzzleId // Pass the active puzzle ID identified earlier
    );
    console.log(
      `[API Command] AI response analysis for solution:`,
      responseAnalysis
    );

    // Update the puzzle context with the success status from the analysis
    puzzleContext = {
      ...puzzleContext,
      isSolutionSuccess: responseAnalysis.isSolutionSuccess,
    };

    // --- 12. Update Puzzle State in Database ---
    if (puzzleContext.activePuzzleId) {
      const currentPuzzleState =
        session.puzzleStates?.[puzzleContext.activePuzzleId];
      // Determine if this command constitutes an attempt (conventional or unconventional)
      const isAttempt =
        puzzleContext.isAttemptedSolution || puzzleContext.conventionalUse;
      const newAttempts =
        (currentPuzzleState?.attempts || 0) + (isAttempt ? 1 : 0);

      // Prepare the update data for the puzzle state
      const puzzleUpdateData: Partial<PuzzleState> = {
        discovered: true, // Mark as discovered if interacted with
        // Set firstDiscoveredAt only if it wasn't already set
        firstDiscoveredAt:
          currentPuzzleState?.firstDiscoveredAt ||
          (isAttempt ? new Date() : undefined),
        attempts: newAttempts,
        solved: puzzleContext.isSolutionSuccess, // Update solved status based on analysis
      };

      // Set solvedAt timestamp only if the puzzle is newly solved in this turn
      if (puzzleContext.isSolutionSuccess && !currentPuzzleState?.solved) {
        puzzleUpdateData.solvedAt = new Date();
        console.log(
          `[API Command] Puzzle ${puzzleContext.activePuzzleId} marked as solved.`
        );
      }

      // Perform the database update for the specific puzzle state
      await updatePuzzleState(
        db,
        session._id,
        puzzleContext.activePuzzleId,
        puzzleUpdateData
      );
      console.log(
        `[API Command] Puzzle state updated for ${puzzleContext.activePuzzleId}. Attempts: ${newAttempts}, Solved: ${puzzleContext.isSolutionSuccess}`
      );
    }

    // --- 13. Update Recorded Interaction (with AI Response) ---
    // Add the AI response, response time, and final puzzle context to the interaction record
    const interactionEndTime = Date.now();
    await db.collection<InteractionData>("interactions").updateOne(
      { _id: interaction._id }, // Find the interaction recorded earlier by its ID
      {
        $set: {
          response: responseText,
          // Calculate response time relative to the interaction start
          responseTime: interactionEndTime - interaction.timestamp.getTime(),
          puzzleContext: puzzleContext, // Store the final puzzle context
        },
      }
    );
    console.log(
      `[API Command] Interaction ${interaction._id} updated with response and final context.`
    );

    // --- 14. Return Response to Client ---
    const totalRequestTime = Date.now() - requestStartTime;
    console.log(`[API Command] Request completed in ${totalRequestTime}ms.`);
    return NextResponse.json({
      response: responseText,
      complete: true, // Indicate successful processing
      puzzleContext: puzzleContext, // Send the final puzzle context back to the client
    });
  } catch (error) {
    // --- Error Handling ---
    const errorTimestamp = Date.now();
    console.error(
      `[API Command Error] Device: ${
        deviceId || "Unknown"
      } - Timestamp: ${errorTimestamp}`,
      error
    );
    let errorMessage = "Internal server error processing command.";
    if (error instanceof Error) {
      errorMessage = error.message; // Use specific error message if available
    }
    // Log the detailed error on the server
    console.error(
      `[API Command] Detailed Error: ${
        error instanceof Error ? error.stack : error
      }`
    );

    // Return a generic error response to the client
    return NextResponse.json(
      { error: `Failed to process command: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// =============================================================================
// Helper Functions for Puzzle Logic
// =============================================================================

/**
 * Analyzes the user's command to determine if it relates to a specific puzzle,
 * and if so, whether it's a conventional or unconventional attempt.
 *
 * @param {string} command - The user's command text.
 * @param {PuzzleDefinition[]} puzzles - An array of puzzle definitions for the current world.
 * @param {SessionData['puzzleStates']} puzzleStates - The current state of puzzles for the session.
 * @returns {PuzzleContext} An object containing the analysis results.
 */
function analyzePuzzleContext(
  command: string,
  puzzles: PuzzleDefinition[],
  puzzleStates: SessionData["puzzleStates"] = {} // Default to empty object
): PuzzleContext {
  const lowerCommand = command.toLowerCase().trim();

  // Define action verbs that typically indicate interaction attempts
  const actionVerbs = [
    "use",
    "try",
    "apply",
    "place",
    "insert",
    "hit",
    "tap",
    "wedge",
    "scrape",
    "hook",
    "bridge",
    "focus",
    "reflect",
    "poke",
    "throw",
    "fill",
    "press",
    "fold",
    "get",
    "retrieve",
    "activate",
    "deactivate",
    "open",
    "close",
    "cross",
    "distract",
    "go",
    "move",
    "push",
    "pull",
    "turn",
    "attach",
    "combine",
    "break",
    "cut",
    "lift",
    "drop",
    "give",
    "take",
    "read",
    "climb",
  ];
  // Check if the command starts with an action verb or contains one clearly
  const isActionCommand = actionVerbs.some(
    (verb) =>
      lowerCommand.startsWith(verb + " ") ||
      lowerCommand.includes(" " + verb + " ")
  );

  // --- Check for Non-Action Commands Targeting Puzzle Objects (e.g., "examine") ---
  for (const puzzle of puzzles) {
    const fixedObjectNameLower = puzzle.fixedFunctionObject.name.toLowerCase();
    // Specifically check for "examine" or "look at" followed by the object name
    if (
      (lowerCommand.startsWith("examine ") ||
        lowerCommand.startsWith("look at ")) &&
      lowerCommand.includes(fixedObjectNameLower)
    ) {
      return {
        activePuzzleId: puzzle.id,
        isAttemptedSolution: false, // Examining is not an attempt
        isSolutionSuccess: false,
        puzzleName: puzzle.name,
        fixedFunctionObject: puzzle.fixedFunctionObject.name,
        conventionalUse: false, // Examining is not a use attempt
        previouslyAttempted: (puzzleStates[puzzle.id]?.attempts || 0) > 0,
        previouslySolved: !!puzzleStates[puzzle.id]?.solved,
      };
    }
  }

  // If it's not an examination of a puzzle object AND not an action command, assume it's not puzzle-related.
  if (!isActionCommand) {
    return { isAttemptedSolution: false, isSolutionSuccess: false };
  }

  // --- Check Action Commands Against Puzzles ---
  for (const puzzle of puzzles) {
    const fixedObjectNameLower = puzzle.fixedFunctionObject.name.toLowerCase();

    // Check if the command involves the puzzle's key object
    if (lowerCommand.includes(fixedObjectNameLower)) {
      // Analyze if the action described matches the unconventional solution
      const isUnconventionalAttempt = isCommandMatchingSolution(
        lowerCommand,
        puzzle.solutionNarrative,
        puzzle.fixedFunctionObject.name // Pass object name for context
      );

      // Determine if it's a conventional use attempt:
      // It involves the object, uses an action verb, but doesn't match the unconventional solution pattern.
      const isConventionalAttempt = !isUnconventionalAttempt; // Simplified: any action involving the object that isn't the solution is considered conventional for tracking purposes.

      return {
        activePuzzleId: puzzle.id,
        isAttemptedSolution: isUnconventionalAttempt,
        isSolutionSuccess: false, // Success determined later by AI response
        puzzleName: puzzle.name,
        fixedFunctionObject: puzzle.fixedFunctionObject.name,
        conventionalUse: isConventionalAttempt,
        previouslyAttempted: (puzzleStates[puzzle.id]?.attempts || 0) > 0,
        previouslySolved: !!puzzleStates[puzzle.id]?.solved,
      };
    }
  }

  // If it's an action command but doesn't involve any known puzzle object
  return { isAttemptedSolution: false, isSolutionSuccess: false };
}

/**
 * Extracts potential keywords (verbs, unique nouns/adjectives) from a text,
 * focusing on terms relevant to puzzle solutions.
 *
 * @param {string} text - The text to extract keywords from (e.g., solution narrative).
 * @returns {string[]} An array of unique keywords found in the text.
 */
function extractKeywords(text: string): string[] {
  if (!text) return [];
  // Focus on verbs and nouns likely relevant to actions/objects in puzzles
  // This list should be expanded based on the specific types of puzzles used.
  const potentialKeywords = text
    .toLowerCase()
    .match(
      /(wedge|bridge|hook|focus|reflect|tap|press|fold|pry|scrape|jumper|align|sour|pucker|grapple|snag|dampen|heat|shield|lever|beam|lens|prism|frequency|resonance|weight|connect|short|circuit|block|redirect|amplify|cool|insulate|conduct|absorb|transmit|filter|spin|rotate|balance|counterweight|trigger|release|catch|prop|jam|seal|puncture|inflate|deflate|magnetize|demagnetize)/g
    );
  // Return unique keywords found
  return potentialKeywords ? [...new Set(potentialKeywords)] : [];
}

/**
 * Checks if the verb and potentially the object/target in the command
 * align with the core action described in the solution narrative.
 * This is a heuristic approach and may need refinement.
 *
 * @param {string} command - The user's command (lowercase).
 * @param {string} solutionNarrative - The narrative describing the puzzle's solution.
 * @param {string} puzzleObjectName - The name of the puzzle's key object.
 * @returns {boolean} True if the command seems to match the solution's intent, false otherwise.
 */
function isCommandMatchingSolution(
  command: string,
  solutionNarrative: string,
  puzzleObjectName: string
): boolean {
  const commandKeywords = extractKeywords(command);
  const solutionKeywords = extractKeywords(solutionNarrative);
  const lowerPuzzleObjectName = puzzleObjectName.toLowerCase();

  // Basic check: Does the command contain the puzzle object AND at least one keyword from the solution?
  if (
    command.includes(lowerPuzzleObjectName) &&
    commandKeywords.some((ck) => solutionKeywords.includes(ck))
  ) {
    return true;
  }

  // Add more sophisticated checks if needed, e.g., analyzing verb-object pairs,
  // checking for synonyms, or using simple NLP techniques.
  // Example: Check if command verb matches a key verb in the solution narrative.
  const commandVerbMatch = command.match(/^[a-z]+/); // Get first word (potential verb)
  if (commandVerbMatch) {
    const commandVerb = commandVerbMatch[0];
    if (
      solutionNarrative.toLowerCase().includes(` ${commandVerb} `) ||
      solutionNarrative.toLowerCase().startsWith(commandVerb)
    ) {
      // Further check if the object is also present
      if (command.includes(lowerPuzzleObjectName)) {
        // This is a plausible match, but could be refined
        // console.log(`[Debug] Verb match found: ${commandVerb} in command for ${lowerPuzzleObjectName}`);
        // return true; // Uncomment cautiously, keyword match is often better
      }
    }
  }

  return false; // Default to no match
}

/**
 * Analyzes the AI's response to determine if it confirms the successful execution
 * of a puzzle solution attempt.
 *
 * @param {string} command - The original user command.
 * @param {string} response - The AI's response text.
 * @param {PuzzleDefinition[]} puzzles - An array of puzzle definitions.
 * @param {string | undefined} activePuzzleId - The ID of the puzzle being attempted.
 * @returns {{ isSolutionSuccess: boolean; solutionCommandMatch?: boolean; responseIndicatesSuccess?: boolean; responseIndicatesFailure?: boolean; }} An object detailing the analysis.
 */
function analyzeResponseForSolution(
  command: string,
  response: string,
  puzzles: PuzzleDefinition[],
  activePuzzleId?: string
): {
  isSolutionSuccess: boolean;
  solutionCommandMatch?: boolean; // Did the command seem like a valid attempt?
  responseIndicatesSuccess?: boolean; // Did the response text contain success words?
  responseIndicatesFailure?: boolean; // Did the response text contain failure words?
} {
  // If no active puzzle ID, or missing command/response, cannot determine success.
  if (!activePuzzleId || !command || !response) {
    return { isSolutionSuccess: false };
  }

  const lowerResponse = response.toLowerCase();
  const lowerCommand = command.toLowerCase();

  // Find the definition of the active puzzle.
  const puzzle = puzzles.find((p) => p.id === activePuzzleId);
  if (!puzzle) {
    console.warn(
      `[analyzeResponseForSolution] Puzzle definition not found for ID: ${activePuzzleId}`
    );
    return { isSolutionSuccess: false };
  }

  // --- Step 1: Check if the command *intended* to solve the puzzle unconventionally ---
  const isCommandIntentMatch = isCommandMatchingSolution(
    lowerCommand,
    puzzle.solutionNarrative,
    puzzle.fixedFunctionObject.name
  );

  // --- Step 2: Check the AI response for explicit success or failure indicators ---
  // More comprehensive lists of indicators
  const successIndicators = [
    "it works",
    "worked",
    "you manage to",
    "successfully",
    "clever",
    "creative",
    "good thinking",
    "well done",
    "that did the trick",
    "you've done it",
    "the way is clear",
    "opens",
    "disables",
    "bypasses",
    "releases",
    "you successfully",
    "the mechanism yields",
    "clicks open",
    "activates",
    "bridge forms",
    "door slides open",
    "power restored",
    "lock disengages",
    "you retrieve the",
    "button depresses",
    "slot accepts",
    "light turns green",
    "access granted",
    "puzzle solved",
    "unlocked",
    "reveals",
    "connects",
    "fits perfectly",
  ];
  const failureIndicators = [
    "doesn't work",
    "won't work",
    "no effect",
    "nothing happens",
    "cannot",
    "can't",
    "unable",
    "fails",
    "seems ineffective",
    "try something else",
    "isn't strong enough",
    "doesn't fit",
    "but nothing changes",
    "remains sealed",
    "still blocked",
    "no reaction",
    "has no effect",
    "futile",
    "pointless",
    "incorrect",
    "wrong",
    "invalid",
    "resists",
    "jammed",
    "stuck",
    "too heavy",
    "too large",
    "too small",
    "access denied",
    "remains locked",
  ];

  // Check if response contains any success indicator (using word boundaries for accuracy)
  const hasSuccessIndicator = successIndicators.some(
    (indicator) => new RegExp(`\b${indicator}\b`, "i").test(lowerResponse) // Case-insensitive check
  );
  // Check if response contains any failure indicator (using word boundaries)
  const hasFailureIndicator = failureIndicators.some(
    (indicator) => new RegExp(`\b${indicator}\b`, "i").test(lowerResponse) // Case-insensitive check
  );

  // --- Step 3: Determine overall success ---
  // Success = Command intended to solve + Response indicates success + Response does NOT indicate failure
  // This helps avoid cases where the AI says "It worked... but then something else went wrong."
  const isSolutionSuccess =
    isCommandIntentMatch && hasSuccessIndicator && !hasFailureIndicator;

  return {
    isSolutionSuccess,
    solutionCommandMatch: isCommandIntentMatch,
    responseIndicatesSuccess: hasSuccessIndicator,
    responseIndicatesFailure: hasFailureIndicator,
  };
}
