// Analytics processing utility

interface KeystrokeMetrics {
  key: string;
  timestamp: number;
}

interface HesitationMetrics {
  duration: number;
  position: number;
}

interface CommandMetrics {
  keystrokes: KeystrokeMetrics[];
  corrections: number;
  hesitations: HesitationMetrics[];
  inputDuration: number;
  commandLength: number;
}

// Analyze typing patterns from command metrics
export const analyzeTypingPatterns = (
  metrics: CommandMetrics
): { 
  typingSpeed: number;
  pauseFrequency: number;
  correctionRate: number;
  patterns: string[];
} => {
  // Calculate typing speed (characters per minute)
  const typingSpeed = metrics.inputDuration > 0 
    ? (metrics.commandLength / (metrics.inputDuration / 1000)) * 60
    : 0;
  
  // Calculate pause frequency (pauses per minute)
  const pauseFrequency = metrics.inputDuration > 0
    ? (metrics.hesitations.length / (metrics.inputDuration / 1000)) * 60
    : 0;
  
  // Calculate correction rate (corrections per character)
  const correctionRate = metrics.commandLength > 0
    ? metrics.corrections / metrics.commandLength
    : 0;
  
  // Identify common keystroke patterns
  const patterns = identifyKeystrokePatterns(metrics.keystrokes);
  
  return {
    typingSpeed,
    pauseFrequency,
    correctionRate,
    patterns,
  };
};

// Identify common patterns in keystrokes
const identifyKeystrokePatterns = (
  keystrokes: KeystrokeMetrics[]
): string[] => {
  if (keystrokes.length < 3) return [];
  
  // Extract just the keys
  const keys = keystrokes.map(k => k.key);
  
  // Simple n-gram analysis for common 3-character sequences
  const trigrams: Record<string, number> = {};
  
  for (let i = 0; i < keys.length - 2; i++) {
    const trigram = keys.slice(i, i + 3).join('');
    trigrams[trigram] = (trigrams[trigram] || 0) + 1;
  }
  
  // Return the top patterns
  return Object.entries(trigrams)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([pattern]) => pattern);
};

// Analyze hesitation patterns
export const analyzeHesitations = (
  hesitations: HesitationMetrics[],
  commandLength: number
): { 
  majorHesitationPoints: number[];
  averageHesitationDuration: number;
} => {
  if (hesitations.length === 0) {
    return {
      majorHesitationPoints: [],
      averageHesitationDuration: 0,
    };
  }
  
  // Calculate relative positions of hesitations (as percentage of command length)
  const relativePositions = hesitations.map(h => 
    Math.floor((h.position / commandLength) * 100)
  );
  
  // Find major hesitation points (positions with multiple hesitations)
  const positionCounts: Record<number, number> = {};
  relativePositions.forEach(pos => {
    positionCounts[pos] = (positionCounts[pos] || 0) + 1;
  });
  
  const majorHesitationPoints = Object.entries(positionCounts)
    .filter(([, count]) => count > 1)
    .map(([pos]) => parseInt(pos, 10));
  
  // Calculate average hesitation duration
  const averageHesitationDuration = hesitations.reduce(
    (sum, h) => sum + h.duration, 
    0
  ) / hesitations.length;
  
  return {
    majorHesitationPoints,
    averageHesitationDuration,
  };
};

// Analyze decision patterns from command history
export const analyzeDecisionPatterns = (
  commandHistory: string[]
): {
  commonCommands: [string, number][];
  commandComplexity: number;
  explorationIndex: number;
} => {
  if (commandHistory.length === 0) {
    return {
      commonCommands: [],
      commandComplexity: 0,
      explorationIndex: 0,
    };
  }
  
  // Count command frequencies
  const commandCounts: Record<string, number> = {};
  commandHistory.forEach(cmd => {
    // Extract the base command (first word)
    const baseCommand = cmd.trim().split(' ')[0].toLowerCase();
    commandCounts[baseCommand] = (commandCounts[baseCommand] || 0) + 1;
  });
  
  // Get most common commands
  const commonCommands = Object.entries(commandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5) as [string, number][];
  
  // Calculate command complexity (average word count)
  const commandComplexity = commandHistory.reduce(
    (sum, cmd) => sum + cmd.trim().split(' ').length,
    0
  ) / commandHistory.length;
  
  // Calculate exploration index (unique commands / total commands)
  const uniqueCommands = new Set(
    commandHistory.map(cmd => cmd.trim().split(' ')[0].toLowerCase())
  ).size;
  const explorationIndex = uniqueCommands / commandHistory.length;
  
  return {
    commonCommands,
    commandComplexity,
    explorationIndex,
  };
};