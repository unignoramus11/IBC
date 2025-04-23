// Session.ts - MongoDB model for user sessions

import { ObjectId } from 'mongodb';

export interface Session {
  _id?: ObjectId;
  deviceId: string;
  worldId: number;
  variant: 'A' | 'B';
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

// Create a new session
export const createSession = async (
  db: any,
  deviceId: string,
  worldId: number,
  variant: 'A' | 'B'
): Promise<Session> => {
  const session: Omit<Session, '_id'> = {
    deviceId,
    worldId,
    variant,
    history: [],
    startTime: new Date(),
    lastActiveTime: new Date(),
    puzzleStates: {},
    completedObjectives: [],
  };

  const result = await db.collection('sessions').insertOne(session);
  
  return {
    ...session,
    _id: result.insertedId,
  };
};

// Get existing session or create new one
export const getOrCreateSession = async (
  db: any,
  deviceId: string,
  worldId: number,
  variant: 'A' | 'B'
): Promise<Session> => {
  // Try to find existing active session
  const existingSession = await db.collection('sessions')
    .findOne({ deviceId, worldId, variant });
  
  if (existingSession) {
    // Update last active time
    await db.collection('sessions').updateOne(
      { _id: existingSession._id },
      { $set: { lastActiveTime: new Date() } }
    );
    
    return existingSession;
  }
  
  // Create new session if none exists
  return createSession(db, deviceId, worldId, variant);
};

// Update session history
export const updateSessionHistory = async (
  db: any,
  sessionId: ObjectId,
  message: { role: string; parts: { text: string }[] }
): Promise<void> => {
  await db.collection('sessions').updateOne(
    { _id: sessionId },
    { 
      $push: { history: message } as any,
      $set: { lastActiveTime: new Date() }
    }
  );
};

// Update puzzle state
export const updatePuzzleState = async (
  db: any,
  sessionId: ObjectId,
  puzzleId: string,
  update: any
): Promise<void> => {
  const updatePath = `puzzleStates.${puzzleId}`;
  
  await db.collection('sessions').updateOne(
    { _id: sessionId },
    { 
      $set: { [updatePath]: update, lastActiveTime: new Date() }
    }
  );
};

// Get session history
export const getSessionHistory = async (
  db: any,
  deviceId: string
): Promise<Session[]> => {
  return db.collection('sessions')
    .find({ deviceId })
    .sort({ startTime: -1 })
    .toArray();
};