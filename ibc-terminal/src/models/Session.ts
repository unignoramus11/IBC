/**
 * Session.ts
 * ----------
 * Defines MongoDB models and interfaces for user sessions in the IBC Terminal research platform.
 * Used for tracking session state, puzzle progress, and conversation history for each participant.
 *
 * Exports:
 * - Session: TypeScript interface for session schema
 * - createSession, getOrCreateSession, updateSessionHistory, updatePuzzleState, getSessionHistory: MongoDB access functions
 */

// Session.ts - MongoDB model for user sessions

import { ObjectId } from "mongodb";

/**
 * Represents a user session, including world, variant, puzzle states, and conversation history.
 */
export interface Session {
  _id?: ObjectId;
  deviceId: string;
  worldId: number;
  variant: "A" | "B";
  history: {
    role: string;
    parts: { text: string }[];
  }[];
  startTime: Date;
  lastActiveTime: Date;
  puzzleStates: {
    [puzzleId: string]: {
      discovered: boolean;
      solved: boolean;
      attempts: number;
      firstDiscoveredAt?: Date;
      solvedAt?: Date;
    };
  };
  completedObjectives: string[];
}

/**
 * Creates a new session for a participant in a given world and variant.
 * @param db - MongoDB database instance
 * @param deviceId - The device/session ID
 * @param worldId - The world index
 * @param variant - The experimental/control variant
 * @returns The created Session object
 */
export const createSession = async (
  db: any,
  deviceId: string,
  worldId: number,
  variant: "A" | "B"
): Promise<Session> => {
  const session: Omit<Session, "_id"> = {
    deviceId,
    worldId,
    variant,
    history: [],
    startTime: new Date(),
    lastActiveTime: new Date(),
    puzzleStates: {},
    completedObjectives: [],
  };

  const result = await db.collection("sessions").insertOne(session);

  return {
    ...session,
    _id: result.insertedId,
  };
};

/**
 * Retrieves an existing session or creates a new one if none exists.
 * @param db - MongoDB database instance
 * @param deviceId - The device/session ID
 * @param worldId - The world index
 * @param variant - The experimental/control variant
 * @returns The Session object
 */
export const getOrCreateSession = async (
  db: any,
  deviceId: string,
  worldId: number,
  variant: "A" | "B"
): Promise<Session> => {
  // Try to find existing active session
  const existingSession = await db
    .collection("sessions")
    .findOne({ deviceId, worldId, variant });

  if (existingSession) {
    // Update last active time
    await db
      .collection("sessions")
      .updateOne(
        { _id: existingSession._id },
        { $set: { lastActiveTime: new Date() } }
      );

    return existingSession;
  }

  // Create new session if none exists
  return createSession(db, deviceId, worldId, variant);
};

/**
 * Appends a message to the session's conversation history.
 * @param db - MongoDB database instance
 * @param sessionId - The ObjectId of the session
 * @param message - The message to append (role and parts)
 */
export const updateSessionHistory = async (
  db: any,
  sessionId: ObjectId,
  message: { role: string; parts: { text: string }[] }
): Promise<void> => {
  await db.collection("sessions").updateOne(
    { _id: sessionId },
    {
      $push: { history: message } as any,
      $set: { lastActiveTime: new Date() },
    }
  );
};

/**
 * Updates the state of a specific puzzle within a session.
 * @param db - MongoDB database instance
 * @param sessionId - The ObjectId of the session
 * @param puzzleId - The puzzle identifier
 * @param update - The update object for the puzzle state
 */
export const updatePuzzleState = async (
  db: any,
  sessionId: ObjectId,
  puzzleId: string,
  update: any
): Promise<void> => {
  const updatePath = `puzzleStates.${puzzleId}`;

  await db.collection("sessions").updateOne(
    { _id: sessionId },
    {
      $set: { [updatePath]: update, lastActiveTime: new Date() },
    }
  );
};

/**
 * Retrieves all sessions for a given device, sorted by start time.
 * @param db - MongoDB database instance
 * @param deviceId - The device/session ID
 * @returns Array of Session objects
 */
export const getSessionHistory = async (
  db: any,
  deviceId: string
): Promise<Session[]> => {
  return db
    .collection("sessions")
    .find({ deviceId })
    .sort({ startTime: -1 })
    .toArray();
};
