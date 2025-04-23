/**
 * Interaction.ts
 * --------------
 * Defines MongoDB models and interfaces for user interactions, session summaries, and research metrics in the IBC Terminal platform.
 * Used for storing, retrieving, and analyzing participant behavior and functional fixedness data.
 *
 * Exports:
 * - Interaction, PuzzleAttempt, FunctionalFixednessMetricsData, ConversationData, SessionSummary, FunctionalFixednessMetrics: TypeScript interfaces for research data
 * - recordInteraction, recordSessionSummary, updateInteractionWithResponse, getDeviceInteractions, getDeviceSessionSummaries, getInteractionsForAnalysis, getSessionSummariesForAnalysis: MongoDB access functions
 */

// Interaction.ts - MongoDB model for user interactions

import { ObjectId } from "mongodb";

/**
 * Represents a single user interaction with the terminal, including keystroke metrics and puzzle context.
 */
export interface Interaction {
  _id?: ObjectId;
  deviceId: string;
  sessionId: ObjectId | null;
  worldId: number;
  variant: "A" | "B";
  command: string;
  response?: string; // The AI's response to this command
  timestamp: Date;
  responseTime?: number; // Time it took for model to respond
  metrics: {
    inputDuration: number; // How long it took to type the command
    keystrokes: {
      key: string;
      timestamp: number;
    }[];
    corrections: number; // Number of backspaces/deletes
    hesitations: {
      duration: number; // Duration of pause in ms
      position: number; // Position in the command where hesitation occurred
    }[];
    commandLength: number;
  };
  puzzleContext?: {
    activePuzzleId?: string; // ID of puzzle being attempted
    isAttemptedSolution: boolean; // Flagged if this might be a solution attempt
    isSolutionSuccess: boolean; // Flagged if this command solved a puzzle
  };
}

/**
 * Represents a single puzzle attempt within a session, including solution attempts and hesitation metrics.
 */
export interface PuzzleAttempt {
  puzzleId: string;
  puzzleName?: string;
  fixedFunctionObject?: string;
  attemptCount: number;
  conventionalUseCount?: number; // Times the object was used conventionally
  unconventionalUseCount?: number; // Times the object was used in creative ways
  timeToSolution?: number; // ms from first attempt to solution
  solutionFound: boolean;
  hesitationCount?: number; // Number of hesitations during puzzle attempts
  averageHesitationDuration?: number; // Average hesitation duration
  firstEncounterTime?: Date; // When the object was first encountered
  solvedTime?: Date; // When the puzzle was solved
}

/**
 * Research metrics for functional fixedness, including overall level, hesitation, and approach.
 */
export interface FunctionalFixednessMetricsData {
  overallFixednessLevel: string; // "High", "Moderate", "Low"
  averageHesitationDuration: number; // Average hesitation across all puzzles
  totalHesitations: number; // Total hesitation moments
  problemSolvingApproach: string; // "Methodical", "Balanced", "Trial-and-Error"
  environmentalPrimingEffectiveness?: string; // For variant B only
  experimentQualityScore?: number; // 1-10 assessment of experiment quality
  insightMomentsObserved: number; // Count of apparent insight moments
}

/**
 * Conversation-level data for a session, including full transcript and command statistics.
 */
export interface ConversationData {
  fullConversation: { role: string; content: string; timestamp: number }[]; // Complete conversation history
  totalDuration: number; // Total session duration in ms
  commandCount: number; // Total commands issued
  uniqueCommandTypes: number; // Number of unique command categories
  mostFrequentCommands: string[]; // Top used commands
}

/**
 * Represents a summary of a session, including puzzle attempts and research analysis.
 */
export interface SessionSummary {
  _id?: ObjectId;
  deviceId: string;
  worldId: number;
  variant: "A" | "B";
  startTime: Date;
  endTime: Date;
  totalInteractions: number;
  puzzleAttempts: PuzzleAttempt[];
  functionalFixednessAnalysis: string; // AI-generated analysis
  functionalFixednessMetrics?: FunctionalFixednessMetricsData;
  conversationData?: ConversationData;
  completionTimestamp: Date;
}

/**
 * Detailed functional fixedness metrics for a session or puzzle.
 */
export interface FunctionalFixednessMetrics {
  // Core metrics from Duncker's paradigm
  timeToSolution: number; // Time from puzzle presentation to solution in ms
  solutionAttempts: number; // Number of attempts before successful solution
  conventionalUseReferences: number; // How often user referred to object's conventional use

  // Enhanced cognitive metrics
  fixationScore: number; // 1-10 measure of how fixated user was on conventional use
  insightMoment: string; // Description of what triggered the insight
  creativityPathways: string[]; // Different approaches attempted

  // Object interaction metrics
  objectInteractions: {
    objectName: string;
    conventionalUses: number; // Times used conventionally
    nonConventionalUses: number; // Times used in novel ways
    examinedCount: number; // Times examined before solution
  }[];

  // Control/experimental comparison data
  variantType: "A" | "B"; // Which experimental variant was used
  variantEffectSize?: number; // Calculated difference in performance between variants
}

/**
 * Records a new user interaction in the database.
 * @param db - MongoDB database instance
 * @param interaction - The interaction data (without _id)
 * @returns The inserted Interaction with _id
 */
export const recordInteraction = async (
  db: any,
  interaction: Omit<Interaction, "_id">
): Promise<Interaction> => {
  const result = await db.collection("interactions").insertOne({
    ...interaction,
    timestamp: new Date(interaction.timestamp),
  });

  return {
    ...interaction,
    _id: result.insertedId,
  };
};

/**
 * Records a session summary in the database.
 * @param db - MongoDB database instance
 * @param summary - The session summary data (without _id)
 * @returns The inserted ObjectId
 */
export const recordSessionSummary = async (
  db: any,
  summary: Omit<SessionSummary, "_id">
): Promise<ObjectId> => {
  const result = await db.collection("session_summaries").insertOne(summary);
  return result.insertedId;
};

/**
 * Updates an interaction with the model's response time.
 * @param db - MongoDB database instance
 * @param interactionId - The ObjectId of the interaction
 * @param responseTime - The response time in ms
 */
export const updateInteractionWithResponse = async (
  db: any,
  interactionId: ObjectId,
  responseTime: number
): Promise<void> => {
  await db
    .collection("interactions")
    .updateOne({ _id: interactionId }, { $set: { responseTime } });
};

/**
 * Retrieves recent interactions for a device.
 * @param db - MongoDB database instance
 * @param deviceId - The device/session ID
 * @param limit - Maximum number of interactions to return
 * @returns Array of Interaction objects
 */
export const getDeviceInteractions = async (
  db: any,
  deviceId: string,
  limit = 100
): Promise<Interaction[]> => {
  return db
    .collection("interactions")
    .find({ deviceId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
};

/**
 * Retrieves recent session summaries for a device.
 * @param db - MongoDB database instance
 * @param deviceId - The device/session ID
 * @param limit - Maximum number of summaries to return
 * @returns Array of SessionSummary objects
 */
export const getDeviceSessionSummaries = async (
  db: any,
  deviceId: string,
  limit = 10
): Promise<SessionSummary[]> => {
  return db
    .collection("session_summaries")
    .find({ deviceId })
    .sort({ completionTimestamp: -1 })
    .limit(limit)
    .toArray();
};

/**
 * Retrieves interactions for research analysis based on a query.
 * @param db - MongoDB database instance
 * @param query - MongoDB query object
 * @param limit - Maximum number of interactions to return
 * @returns Array of Interaction objects
 */
export const getInteractionsForAnalysis = async (
  db: any,
  query: any = {},
  limit = 1000
): Promise<Interaction[]> => {
  return db
    .collection("interactions")
    .find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
};

/**
 * Retrieves session summaries for research analysis based on a query.
 * @param db - MongoDB database instance
 * @param query - MongoDB query object
 * @param limit - Maximum number of summaries to return
 * @returns Array of SessionSummary objects
 */
export const getSessionSummariesForAnalysis = async (
  db: any,
  query: any = {},
  limit = 100
): Promise<SessionSummary[]> => {
  return db
    .collection("session_summaries")
    .find(query)
    .sort({ completionTimestamp: -1 })
    .limit(limit)
    .toArray();
};
