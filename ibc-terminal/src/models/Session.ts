/**
 * Session.ts
 * ----------
 * Defines MongoDB models and interfaces for user sessions in the IBC Terminal research platform.
 * Used for tracking session state, puzzle progress, and conversation history for each participant.
 */

import { ObjectId, Db } from "mongodb"; // Import Db type for better typing

// Define the structure for the state of a single puzzle
export interface PuzzleState {
  discovered: boolean; // Has the player interacted with the puzzle context (e.g., examined object)?
  solved: boolean; // Has the puzzle been successfully solved?
  attempts: number; // How many attempts (conventional or unconventional) related to the puzzle object?
  firstDiscoveredAt?: Date; // Timestamp when the puzzle context was first discovered/interacted with.
  solvedAt?: Date; // Timestamp when the puzzle was solved.
}

/**
 * Represents a user session data structure in MongoDB.
 */
export interface SessionData {
  _id?: ObjectId;
  deviceId: string;
  worldId: number;
  variant: "A" | "B";
  // History uses the structure expected by the Gemini API
  history: {
    role: "user" | "model"; // Use specific roles
    parts: { text: string }[];
  }[];
  startTime: Date;
  lastActiveTime: Date;
  // Use a Record type for puzzleStates with string keys (puzzleId) and PuzzleState values
  puzzleStates: Record<string, PuzzleState>;
  completedObjectives: string[]; // Track completed main objectives by name/description
  isComplete?: boolean; // Flag to mark session completion
}

/**
 * Creates a new session for a participant in a given world and variant.
 * @param db - MongoDB Db instance
 * @param deviceId - The device/session ID
 * @param worldId - The world index
 * @param variant - The experimental/control variant
 * @returns The created SessionData object with _id
 */
export const createSession = async (
  db: Db, // Use Db type
  deviceId: string,
  worldId: number,
  variant: "A" | "B"
): Promise<SessionData> => {
  const newSessionData: Omit<SessionData, "_id"> = {
    // Use Omit for clarity
    deviceId,
    worldId,
    variant,
    history: [], // Start with empty history
    startTime: new Date(),
    lastActiveTime: new Date(),
    puzzleStates: {}, // Initialize as empty object
    completedObjectives: [],
    isComplete: false,
  };

  const result = await db
    .collection<Omit<SessionData, "_id">>("sessions")
    .insertOne(newSessionData);

  // Check if insert succeeded (optional but good practice)
  if (!result.insertedId) {
    throw new Error("Failed to insert new session into database.");
  }

  return {
    ...newSessionData,
    _id: result.insertedId,
  };
};

/**
 * Retrieves an existing active session or creates a new one if none exists for the specific world/variant.
 * @param db - MongoDB Db instance
 * @param deviceId - The device/session ID
 * @param worldId - The world index
 * @param variant - The experimental/control variant
 * @returns The SessionData object
 */
export const getOrCreateSession = async (
  db: Db, // Use Db type
  deviceId: string,
  worldId: number,
  variant: "A" | "B"
): Promise<SessionData> => {
  // Try to find an existing *incomplete* session for this specific combination
  const existingSession = await db
    .collection<SessionData>("sessions") // Use SessionData type with collection
    .findOne({ deviceId, worldId, variant, isComplete: { $ne: true } }); // Look for incomplete sessions

  if (existingSession) {
    // Update last active time on the found session
    await db
      .collection<SessionData>("sessions")
      .updateOne(
        { _id: existingSession._id },
        { $set: { lastActiveTime: new Date() } }
      );
    console.log(
      `Found existing session ${existingSession._id} for device ${deviceId}, world ${worldId}`
    );
    return existingSession;
  }

  // No active session found for this world/variant, create a new one
  console.log(
    `No active session found for device ${deviceId}, world ${worldId}. Creating new session.`
  );
  return createSession(db, deviceId, worldId, variant);
};

/**
 * Appends a message to the session's conversation history.
 * @param db - MongoDB Db instance
 * @param sessionId - The ObjectId of the session
 * @param message - The message object { role: 'user'|'model', parts: [{ text: string }] }
 */
export const updateSessionHistory = async (
  db: Db, // Use Db type
  sessionId: ObjectId,
  message: { role: "user" | "model"; parts: { text: string }[] } // Use specific roles
): Promise<void> => {
  const result = await db.collection<SessionData>("sessions").updateOne(
    { _id: sessionId },
    {
      // Use $push correctly typed for the history array
      $push: { history: message },
      $set: { lastActiveTime: new Date() },
    }
  );
  if (result.modifiedCount === 0) {
    console.warn(
      `Session history update failed for session ID: ${sessionId}. Session not found?`
    );
  }
};

/**
 * Updates the state of a specific puzzle within a session using dot notation.
 * Merges the provided update object with the existing state or creates it if it doesn't exist.
 * @param db - MongoDB Db instance
 * @param sessionId - The ObjectId of the session
 * @param puzzleId - The puzzle identifier string (e.g., "sliding-door")
 * @param update - Partial PuzzleState object with fields to update/set
 */
export const updatePuzzleState = async (
  db: Db, // Use Db type
  sessionId: ObjectId,
  puzzleId: string,
  update: Partial<PuzzleState> // Use Partial<PuzzleState> for type safety
): Promise<void> => {
  // Use dot notation to update specific fields within the nested puzzle state object
  const updateFields: Record<string, any> = {};
  for (const key in update) {
    // Type assertion needed here because key is string, but we know it corresponds to PuzzleState keys
    updateFields[`puzzleStates.${puzzleId}.${key}`] =
      update[key as keyof PuzzleState];
  }
  // Also update the last active time
  updateFields["lastActiveTime"] = new Date();

  const result = await db.collection<SessionData>("sessions").updateOne(
    { _id: sessionId },
    {
      // Use $set with dot notation for nested updates
      $set: updateFields,
    }
  );
  if (result.modifiedCount === 0 && result.matchedCount === 0) {
    console.warn(
      `Puzzle state update failed for session ID: ${sessionId}, puzzle ID: ${puzzleId}. Session not found?`
    );
  } else if (result.modifiedCount === 0 && result.matchedCount > 0) {
    // This might happen if the state being set is identical to the existing state. Usually not an error.
    // console.log(`Puzzle state for session ID: ${sessionId}, puzzle ID: ${puzzleId} was already up-to-date.`);
  }
};

/**
 * Retrieves all sessions (typically for analysis or admin purposes) for a given device, sorted by start time descending.
 * @param db - MongoDB Db instance
 * @param deviceId - The device/session ID
 * @returns Array of SessionData objects
 */
export const getAllDeviceSessions = async (
  // Renamed for clarity
  db: Db, // Use Db type
  deviceId: string
): Promise<SessionData[]> => {
  return db
    .collection<SessionData>("sessions") // Use SessionData type
    .find({ deviceId })
    .sort({ startTime: -1 }) // Latest sessions first
    .toArray();
};

/**
 * Marks a session as complete.
 * @param db - MongoDB Db instance
 * @param sessionId - The ObjectId of the session
 */
export const markSessionComplete = async (
  db: Db,
  sessionId: ObjectId
): Promise<void> => {
  await db.collection<SessionData>("sessions").updateOne(
    { _id: sessionId },
    {
      $set: { isComplete: true, lastActiveTime: new Date() },
    }
  );
  console.log(`Session ${sessionId} marked as complete.`);
};
