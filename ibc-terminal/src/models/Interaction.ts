/**
 * Interaction.ts
 * --------------
 * Defines MongoDB models and interfaces for user interactions, session summaries, and research metrics
 * in the IBC Terminal platform. Used for storing, retrieving, and analyzing participant behavior
 * and functional fixedness data.
 */

import { ObjectId, Db } from "mongodb"; // Import Db type

// --- Core Interaction Data ---

// Reusing PuzzleContext interface defined in route.ts (or define similarly here)
// Ensure this structure matches what's saved from the route logic
interface PuzzleContext {
  activePuzzleId?: string;
  isAttemptedSolution: boolean;
  isSolutionSuccess: boolean;
  puzzleName?: string;
  fixedFunctionObject?: string;
  conventionalUse?: boolean;
  previouslyAttempted?: boolean;
  previouslySolved?: boolean;
}

/**
 * Represents a single user interaction event data structure in MongoDB.
 */
export interface InteractionData {
  _id?: ObjectId;
  deviceId: string;
  sessionId: ObjectId | null;
  worldId: number;
  variant: "A" | "B";
  command: string;
  response?: string; // AI response text
  timestamp: Date; // When the command was received by the server
  responseTime?: number; // Time (ms) from command received to response sent back
  // Detailed metrics captured from the client
  metrics: {
    inputDuration: number; // Time (ms) user took to type command
    keystrokes: {
      key: string;
      timestamp: number; // Relative timestamp or absolute? Decide based on analysis needs
    }[];
    corrections: number; // Count of backspace/delete uses
    hesitations: {
      duration: number; // Duration (ms) of pause > threshold
      position: number; // Character index in command string where pause occurred
    }[];
    commandLength: number;
  };
  // Context about puzzle relevance determined during command processing
  puzzleContext?: PuzzleContext;
}

// --- Session Summary and Analysis Data Structures ---
// These structures are primarily for post-session analysis/summarization

/**
 * Represents summarized data for a single puzzle's attempts within a completed session.
 */
export interface PuzzleAttemptSummary {
  puzzleId: string; // From PuzzleDefinition.id
  puzzleName?: string; // From PuzzleDefinition.name
  fixedFunctionObject?: string; // From PuzzleDefinition.fixedFunctionObject.name
  attemptCount: number; // Total attempts related to this puzzle object
  conventionalUseCount?: number; // Attempts deemed conventional
  unconventionalUseCount?: number; // Attempts deemed unconventional (incl. success)
  timeToSolutionMs?: number; // Time from first relevant interaction to solution (ms)
  solutionFound: boolean;
  hesitationCount?: number; // Total hesitations recorded during interactions for this puzzle
  averageHesitationDurationMs?: number; // Average duration of hesitations
  firstInteractionTime?: Date; // Timestamp of first interaction related to puzzle
  firstEncounterTime?: Date; // Timestamp of first encounter with puzzle context
  solvedTime?: Date; // Timestamp of successful solution
}

/**
 * Placeholder for aggregated/derived functional fixedness metrics for a session.
 */
export interface FunctionalFixednessMetricsData {
  overallFixednessLevel: "High" | "Moderate" | "Low" | "N/A"; // Categorical assessment
  averageHesitationDurationMs?: number;
  totalHesitations?: number;
  problemSolvingApproach?:
    | "Methodical"
    | "Balanced"
    | "Trial-and-Error"
    | "N/A"; // Style assessment
  environmentalPrimingEffectiveness?:
    | "High"
    | "Moderate"
    | "Low"
    | "N/A"
    | "Not Applicable"; // Variant B only
  insightMomentsObserved?: number;
  // Add other relevant derived metrics
}

/**
 * Placeholder for aggregated conversation data for a session.
 */
export interface ConversationData {
  // Example fields - tailor to your analysis needs
  fullConversation?: { role: string; content: string; timestamp: number }[]; // Consider storage limits
  totalDurationMs: number;
  commandCount: number;
  uniqueCommands?: string[];
  // Potentially sentiment analysis, topic modeling results, etc.
}

/**
 * Represents a summarized record of a completed session for analysis purposes.
 */
export interface SessionSummaryData {
  _id?: ObjectId;
  deviceId: string;
  sessionId: ObjectId; // Link back to the original SessionData
  worldId: number;
  variant: "A" | "B";
  startTime: Date;
  endTime: Date; // When the session was marked complete or timed out
  totalDurationMs: number; // Calculated duration
  totalInteractions: number; // Count of user commands
  puzzleAttemptSummaries: PuzzleAttemptSummary[]; // Array of summaries for each puzzle
  functionalFixednessAnalysis?: string; // AI-generated textual analysis (optional)
  functionalFixednessMetrics?: FunctionalFixednessMetricsData; // Calculated metrics (optional)
  conversationData?: ConversationData; // Aggregated conversation stats (optional)
  completionStatus: "Completed" | "Abandoned" | "Error"; // How the session ended
}

// --- Database Functions ---

/**
 * Records a new user interaction event in the database.
 * @param db - MongoDB Db instance
 * @param interaction - The interaction data (without _id)
 * @returns The inserted InteractionData with _id
 */
export const recordInteraction = async (
  db: Db, // Use Db type
  // Use Omit<InteractionData, '_id'> for the input type
  interaction: Omit<InteractionData, "_id">
): Promise<InteractionData> => {
  // Ensure timestamp is a Date object
  const interactionToInsert = {
    ...interaction,
    timestamp: new Date(interaction.timestamp),
  };
  const result = await db
    .collection<Omit<InteractionData, "_id">>("interactions")
    .insertOne(interactionToInsert);

  if (!result.insertedId) {
    throw new Error("Failed to insert interaction into database.");
  }

  return {
    ...interactionToInsert,
    _id: result.insertedId,
  };
};

/**
 * Records a session summary in the database after a session concludes.
 * @param db - MongoDB Db instance
 * @param summary - The session summary data (without _id)
 * @returns The inserted ObjectId
 */
export const recordSessionSummary = async (
  db: Db, // Use Db type
  summary: Omit<SessionSummaryData, "_id"> // Use Omit and correct type
): Promise<ObjectId> => {
  const result = await db
    .collection<Omit<SessionSummaryData, "_id">>("session_summaries")
    .insertOne(summary);

  if (!result.insertedId) {
    throw new Error("Failed to insert session summary into database.");
  }
  return result.insertedId;
};

// Note: updateInteractionWithResponse was removed as the logic is better handled in the route
// after the AI response is received and analyzed. The route now updates the interaction record
// with response, responseTime, and final puzzleContext.

/**
 * Retrieves recent interactions for a specific device.
 * @param db - MongoDB Db instance
 * @param deviceId - The device ID
 * @param limit - Maximum number of interactions to return
 * @returns Array of InteractionData objects
 */
export const getDeviceInteractions = async (
  db: Db, // Use Db type
  deviceId: string,
  limit = 100
): Promise<InteractionData[]> => {
  return db
    .collection<InteractionData>("interactions") // Use InteractionData type
    .find({ deviceId })
    .sort({ timestamp: -1 }) // Get latest first
    .limit(limit)
    .toArray();
};

/**
 * Retrieves recent session summaries for a specific device.
 * @param db - MongoDB Db instance
 * @param deviceId - The device ID
 * @param limit - Maximum number of summaries to return
 * @returns Array of SessionSummaryData objects
 */
export const getDeviceSessionSummaries = async (
  db: Db, // Use Db type
  deviceId: string,
  limit = 10
): Promise<SessionSummaryData[]> => {
  return db
    .collection<SessionSummaryData>("session_summaries") // Use SessionSummaryData type
    .find({ deviceId })
    .sort({ endTime: -1 }) // Sort by end time, latest first
    .limit(limit)
    .toArray();
};

/**
 * Retrieves interactions for research analysis based on a flexible query.
 * @param db - MongoDB Db instance
 * @param query - MongoDB query object (e.g., { worldId: 5, variant: 'B' })
 * @param limit - Maximum number of interactions
 * @param sort - MongoDB sort object (e.g., { timestamp: 1 })
 * @returns Array of InteractionData objects
 */
export const getInteractionsForAnalysis = async (
  db: Db, // Use Db type
  query: any = {},
  limit = 1000,
  sort: any = { timestamp: 1 } // Default sort: oldest first
): Promise<InteractionData[]> => {
  return db
    .collection<InteractionData>("interactions") // Use InteractionData type
    .find(query)
    .sort(sort)
    .limit(limit)
    .toArray();
};

/**
 * Retrieves session summaries for research analysis based on a flexible query.
 * @param db - MongoDB Db instance
 * @param query - MongoDB query object
 * @param limit - Maximum number of summaries
 * @param sort - MongoDB sort object
 * @returns Array of SessionSummaryData objects
 */
export const getSessionSummariesForAnalysis = async (
  db: Db, // Use Db type
  query: any = {},
  limit = 100,
  sort: any = { endTime: -1 } // Default sort: latest first
): Promise<SessionSummaryData[]> => {
  return db
    .collection<SessionSummaryData>("session_summaries") // Use SessionSummaryData type
    .find(query)
    .sort(sort)
    .limit(limit)
    .toArray();
};
