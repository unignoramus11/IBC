// Interface for interaction data
interface InteractionData {
  deviceId: string;
  command: string;
  metrics: {
    keystrokes: { key: string; timestamp: number }[];
    corrections: number;
    hesitations: { duration: number; position: number }[];
    inputDuration: number;
    commandLength: number;
  };
  timestamp: number;
  worldId: number;
  variant: 'A' | 'B';
}

// Track user interaction with the terminal
export const trackUserInteraction = async (data: InteractionData) => {
  try {
    // Send data to backend API
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    // Don't interrupt user experience if tracking fails
    console.error('Error tracking user interaction:', error);
  }
};

// Calculate metrics from raw interaction data
export const calculateMetrics = (interactions: InteractionData[]) => {
  if (interactions.length === 0) return null;

  return {
    averageResponseTime: calculateAverageResponseTime(interactions),
    commandPatterns: identifyCommandPatterns(interactions),
    hesitationAnalysis: analyzeHesitations(interactions),
    correctionRate: calculateCorrectionRate(interactions),
    puzzleSolutionRate: analyzePuzzleSolutions(interactions),
  };
};

// Helper functions for metrics calculation

const calculateAverageResponseTime = (interactions: InteractionData[]) => {
  const responseTimes = interactions.map(i => i.metrics.inputDuration);
  const validTimes = responseTimes.filter(time => time > 0);
  
  if (validTimes.length === 0) return 0;
  
  return validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length;
};

const identifyCommandPatterns = (interactions: InteractionData[]) => {
  // Basic implementation - count command frequencies
  const commandCounts: Record<string, number> = {};
  
  interactions.forEach(interaction => {
    const cmd = interaction.command.toLowerCase().trim();
    commandCounts[cmd] = (commandCounts[cmd] || 0) + 1;
  });
  
  return Object.entries(commandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // Top 10 commands
};

const analyzeHesitations = (interactions: InteractionData[]) => {
  // Analyze where users hesitate most frequently
  let allHesitations: { duration: number; position: number }[] = [];
  
  interactions.forEach(interaction => {
    allHesitations = [...allHesitations, ...interaction.metrics.hesitations];
  });
  
  // Group hesitations by position in command (as percentage of total length)
  const positionGroups: Record<string, number[]> = {};
  
  allHesitations.forEach(h => {
    const interaction = interactions.find(i => 
      i.timestamp <= h.timestamp && (i.timestamp + i.metrics.inputDuration) >= h.timestamp
    );
    
    if (!interaction) return;
    
    const relativePosition = Math.floor((h.position / interaction.metrics.commandLength) * 10) * 10;
    const bucket = `${relativePosition}-${relativePosition + 10}%`;
    
    if (!positionGroups[bucket]) {
      positionGroups[bucket] = [];
    }
    
    positionGroups[bucket].push(h.duration);
  });
  
  // Calculate average duration for each position group
  return Object.entries(positionGroups).map(([position, durations]) => ({
    position,
    averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
    count: durations.length,
  }));
};

const calculateCorrectionRate = (interactions: InteractionData[]) => {
  const totalCommands = interactions.length;
  const commandsWithCorrections = interactions.filter(i => i.metrics.corrections > 0).length;
  
  return (commandsWithCorrections / totalCommands) * 100;
};

const analyzePuzzleSolutions = (interactions: InteractionData[]) => {
  // This would require knowing which commands represent puzzle solutions
  // Simplified implementation for now
  return {
    // This would be calculated based on predefined solution commands
    // and tracking which users successfully completed puzzles
    solutionAttempts: interactions.length,
    uniqueApproaches: identifyCommandPatterns(interactions).length,
  };
};