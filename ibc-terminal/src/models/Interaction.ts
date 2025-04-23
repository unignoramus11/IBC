// Interaction.ts - MongoDB model for user interactions

import { ObjectId } from 'mongodb';

export interface Interaction {
  _id?: ObjectId;
  deviceId: string;
  sessionId: ObjectId;
  worldId: number;
  variant: 'A' | 'B';
  command: string;
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
    puzzleId: string;
    isAttempt: boolean;
    isSolution: boolean;
  };
}

// Record a new interaction
export const recordInteraction = async (
  db: any,
  interaction: Omit<Interaction, '_id'>
): Promise<Interaction> => {
  const result = await db.collection('interactions').insertOne({
    ...interaction,
    timestamp: new Date(interaction.timestamp),
  });
  
  return {
    ...interaction,
    _id: result.insertedId,
  };
};

// Update an interaction with response time
export const updateInteractionWithResponse = async (
  db: any,
  interactionId: ObjectId,
  responseTime: number
): Promise<void> => {
  await db.collection('interactions').updateOne(
    { _id: interactionId },
    { $set: { responseTime } }
  );
};

// Get interactions for a device
export const getDeviceInteractions = async (
  db: any,
  deviceId: string,
  limit = 100
): Promise<Interaction[]> => {
  return db.collection('interactions')
    .find({ deviceId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
};

// Get interactions for analysis
export const getInteractionsForAnalysis = async (
  db: any,
  query: any = {},
  limit = 1000
): Promise<Interaction[]> => {
  return db.collection('interactions')
    .find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
};