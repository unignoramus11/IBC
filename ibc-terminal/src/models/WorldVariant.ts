// WorldVariant.ts - MongoDB model for tracking variant performance

import { ObjectId } from 'mongodb';

export interface WorldVariant {
  _id?: ObjectId;
  worldId: number;
  variant: 'A' | 'B';
  totalUsers: number;
  puzzleStats: {
    [puzzleId: string]: {
      discovered: number; // Number of users who discovered this puzzle
      solved: number; // Number of users who solved this puzzle
      averageAttempts: number; // Average number of attempts to solve
      averageSolutionTime: number; // Average time from discovery to solution in ms
    };
  };
  averageSessionDuration: number; // Average session time in ms
  completionRate: number; // Percentage of users who completed all objectives
}

// Initialize or update variant stats
export const updateVariantStats = async (
  db: any,
  worldId: number,
  variant: 'A' | 'B',
  sessionData: any
): Promise<void> => {
  // First, check if stats exist for this variant
  const existingStats = await db.collection('worldVariants')
    .findOne({ worldId, variant });
  
  if (!existingStats) {
    // Create new stats record
    await db.collection('worldVariants').insertOne({
      worldId,
      variant,
      totalUsers: 1,
      puzzleStats: {},
      averageSessionDuration: sessionData.duration,
      completionRate: sessionData.completed ? 100 : 0,
    });
    return;
  }
  
  // Calculate new values
  const newTotalUsers = existingStats.totalUsers + 1;
  const newAvgDuration = (
    (existingStats.averageSessionDuration * existingStats.totalUsers) + 
    sessionData.duration
  ) / newTotalUsers;
  
  const newCompletionRate = (
    (existingStats.completionRate * existingStats.totalUsers / 100) + 
    (sessionData.completed ? 1 : 0)
  ) / newTotalUsers * 100;
  
  // Update existing stats
  await db.collection('worldVariants').updateOne(
    { worldId, variant },
    {
      $set: {
        totalUsers: newTotalUsers,
        averageSessionDuration: newAvgDuration,
        completionRate: newCompletionRate,
      }
    }
  );
  
  // Update puzzle stats (would be more complex in a real implementation)
  for (const [puzzleId, puzzleData] of Object.entries(sessionData.puzzles)) {
    await updatePuzzleStats(db, worldId, variant, puzzleId, puzzleData);
  }
};

// Helper function to update stats for a specific puzzle
const updatePuzzleStats = async (
  db: any,
  worldId: number,
  variant: 'A' | 'B',
  puzzleId: string,
  puzzleData: any
) => {
  const existingStats = await db.collection('worldVariants')
    .findOne({ worldId, variant });
  
  // If puzzle doesn't exist in stats yet
  if (!existingStats.puzzleStats[puzzleId]) {
    await db.collection('worldVariants').updateOne(
      { worldId, variant },
      {
        $set: {
          [`puzzleStats.${puzzleId}`]: {
            discovered: puzzleData.discovered ? 1 : 0,
            solved: puzzleData.solved ? 1 : 0,
            averageAttempts: puzzleData.attempts || 0,
            averageSolutionTime: puzzleData.solutionTime || 0,
          }
        }
      }
    );
    return;
  }
  
  // Update existing puzzle stats
  const currentStats = existingStats.puzzleStats[puzzleId];
  const totalDiscovered = currentStats.discovered + (puzzleData.discovered ? 1 : 0);
  const totalSolved = currentStats.solved + (puzzleData.solved ? 1 : 0);
  
  // Calculate new averages
  const newAvgAttempts = currentStats.solved > 0 
    ? ((currentStats.averageAttempts * currentStats.solved) + (puzzleData.attempts || 0)) / 
      (currentStats.solved + (puzzleData.solved ? 1 : 0))
    : puzzleData.attempts || 0;
  
  const newAvgSolutionTime = currentStats.solved > 0
    ? ((currentStats.averageSolutionTime * currentStats.solved) + (puzzleData.solutionTime || 0)) / 
      (currentStats.solved + (puzzleData.solved ? 1 : 0))
    : puzzleData.solutionTime || 0;
  
  // Update the database
  await db.collection('worldVariants').updateOne(
    { worldId, variant },
    {
      $set: {
        [`puzzleStats.${puzzleId}.discovered`]: totalDiscovered,
        [`puzzleStats.${puzzleId}.solved`]: totalSolved,
        [`puzzleStats.${puzzleId}.averageAttempts`]: newAvgAttempts,
        [`puzzleStats.${puzzleId}.averageSolutionTime`]: newAvgSolutionTime,
      }
    }
  );
};

// Get comparison data between variants
export const getVariantComparison = async (
  db: any,
  worldId: number
): Promise<any> => {
  const variantA = await db.collection('worldVariants')
    .findOne({ worldId, variant: 'A' });
  
  const variantB = await db.collection('worldVariants')
    .findOne({ worldId, variant: 'B' });
  
  if (!variantA || !variantB) {
    return { error: 'Insufficient data for comparison' };
  }
  
  // Create comparison object
  return {
    worldId,
    userCounts: {
      variantA: variantA.totalUsers,
      variantB: variantB.totalUsers,
    },
    sessionDuration: {
      variantA: variantA.averageSessionDuration,
      variantB: variantB.averageSessionDuration,
      difference: variantB.averageSessionDuration - variantA.averageSessionDuration,
      percentChange: ((variantB.averageSessionDuration - variantA.averageSessionDuration) / 
        variantA.averageSessionDuration * 100).toFixed(2),
    },
    completionRate: {
      variantA: variantA.completionRate,
      variantB: variantB.completionRate,
      difference: variantB.completionRate - variantA.completionRate,
      percentChange: ((variantB.completionRate - variantA.completionRate) / 
        variantA.completionRate * 100).toFixed(2),
    },
    puzzles: comparePuzzleStats(variantA.puzzleStats, variantB.puzzleStats),
  };
};

// Helper to compare puzzle statistics between variants
const comparePuzzleStats = (
  statsA: any,
  statsB: any
) => {
  const allPuzzleIds = new Set([
    ...Object.keys(statsA),
    ...Object.keys(statsB),
  ]);
  
  const comparison: any = {};
  
  allPuzzleIds.forEach(puzzleId => {
    const puzzleA = statsA[puzzleId] || { discovered: 0, solved: 0, averageAttempts: 0, averageSolutionTime: 0 };
    const puzzleB = statsB[puzzleId] || { discovered: 0, solved: 0, averageAttempts: 0, averageSolutionTime: 0 };
    
    comparison[puzzleId] = {
      discoveryRate: {
        variantA: puzzleA.discovered,
        variantB: puzzleB.discovered,
        difference: puzzleB.discovered - puzzleA.discovered,
      },
      solutionRate: {
        variantA: puzzleA.solved,
        variantB: puzzleB.solved,
        difference: puzzleB.solved - puzzleA.solved,
      },
      attempts: {
        variantA: puzzleA.averageAttempts,
        variantB: puzzleB.averageAttempts,
        difference: puzzleB.averageAttempts - puzzleA.averageAttempts,
        percentChange: puzzleA.averageAttempts > 0 
          ? ((puzzleB.averageAttempts - puzzleA.averageAttempts) / 
            puzzleA.averageAttempts * 100).toFixed(2)
          : 'N/A',
      },
      solutionTime: {
        variantA: puzzleA.averageSolutionTime,
        variantB: puzzleB.averageSolutionTime,
        difference: puzzleB.averageSolutionTime - puzzleA.averageSolutionTime,
        percentChange: puzzleA.averageSolutionTime > 0
          ? ((puzzleB.averageSolutionTime - puzzleA.averageSolutionTime) / 
            puzzleA.averageSolutionTime * 100).toFixed(2)
          : 'N/A',
      },
    };
  });
  
  return comparison;
};