// Interface for interaction data
interface InteractionData {
  deviceId: string;
  command: string;
  response: string; // Store the AI's response as well
  metrics: {
    keystrokes: { key: string; timestamp: number }[];
    corrections: number;
    hesitations: { duration: number; position: number; timestamp: number }[];
    inputDuration: number;
    commandLength: number;
  };
  timestamp: number;
  worldId: number;
  variant: "A" | "B";
  puzzleContext?: {
    activePuzzleId?: string; // ID of puzzle being attempted (if any)
    isAttemptedSolution: boolean; // Flagged if this might be a solution attempt
    isSolutionSuccess: boolean; // Flagged if this command solved a puzzle
    puzzleName?: string; // Name of the puzzle
    fixedFunctionObject?: string; // The object with fixed functionality in the puzzle
    conventionalUse?: boolean; // Whether the object was used in a conventional way
  };
}

// Import the PuzzleAttempt interface from the Interaction model 
import { PuzzleAttempt, FunctionalFixednessMetricsData, ConversationData } from '../models/Interaction';

// Interface for session summary data
interface SessionSummary {
  deviceId: string;
  worldId: number;
  variant: "A" | "B";
  startTime: number;
  endTime: number;
  totalInteractions: number;
  puzzleAttempts: PuzzleAttempt[];
  functionalFixednessAnalysis: string; // AI-generated analysis
  functionalFixednessMetrics?: FunctionalFixednessMetricsData;
  conversationData?: ConversationData;
}

// Debug logger that only logs in development mode
const debugLog = (message: string, ...data: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[DataCollection] ${message}`, ...data);
  }
};

// Local storage keys
const LOCAL_STORAGE_KEY = "terminal_interactions";
const SESSION_SUMMARY_KEY = "session_summary";

// Track user interaction with the terminal - store locally until session completion
export const trackUserInteraction = async (data: InteractionData) => {
  debugLog("Tracking user interaction", {
    deviceId: data.deviceId,
    command: data.command,
    responseLength: data.response?.length || 0,
    worldId: data.worldId,
    variant: data.variant,
    timestamp: new Date(data.timestamp).toISOString(),
    keystrokeCount: data.metrics.keystrokes.length,
    corrections: data.metrics.corrections,
    hesitations: data.metrics.hesitations.length,
    inputDuration: `${data.metrics.inputDuration}ms`,
    puzzleRelated: data.puzzleContext
      ? `${data.puzzleContext.activePuzzleId} (${
          data.puzzleContext.isAttemptedSolution
            ? "solution attempt"
            : "exploration"
        })`
      : "n/a",
  });

  try {
    // Check for localStorage availability (for SSR safety)
    if (typeof window === "undefined" || !window.localStorage) {
      debugLog("localStorage not available, skipping local storage");
      return;
    }

    // Store data in localStorage first
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    let interactions: InteractionData[] = [];

    if (storedData) {
      try {
        interactions = JSON.parse(storedData);
        debugLog("Retrieved existing stored interactions", {
          count: interactions.length,
        });
      } catch (parseError) {
        debugLog(
          "Error parsing stored interactions, starting fresh",
          parseError
        );
        interactions = [];
      }
    } else {
      debugLog("No stored interactions found, creating new storage");
    }

    // Add new interaction
    interactions.push(data);

    debugLog("Saving updated interactions to localStorage", {
      totalInteractions: interactions.length,
      storageSizeBytes: JSON.stringify(interactions).length,
    });

    // Save back to localStorage
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(interactions));

    // Update session summary if this was a puzzle solution
    if (data.puzzleContext?.isSolutionSuccess) {
      await updateSessionPuzzleSummary(data);
    }

    // Don't send to backend yet - this will happen on session completion
    debugLog("Interaction stored locally successfully");
  } catch (error) {
    // Don't interrupt user experience if tracking fails
    debugLog("ERROR storing user interaction", error);
    console.error("Error storing user interaction:", error);
  }
};

// Update an existing interaction with response and puzzle context
export const updateInteraction = async (
  deviceId: string,
  timestamp: number,
  response: string,
  puzzleContext?: any
) => {
  debugLog("Updating interaction with response", {
    deviceId,
    timestamp: new Date(timestamp).toISOString(),
    responseLength: response.length,
    hasPuzzleContext: !!puzzleContext,
  });

  try {
    // Check for localStorage availability
    if (typeof window === "undefined" || !window.localStorage) {
      debugLog("localStorage not available, skipping update");
      return;
    }

    // Get stored interactions
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!storedData) {
      debugLog("No stored interactions found to update");
      return;
    }

    let interactions: InteractionData[] = [];
    try {
      interactions = JSON.parse(storedData);
    } catch (parseError) {
      debugLog("Error parsing stored interactions for update", parseError);
      return;
    }

    // Find the interaction with matching deviceId and timestamp
    const interactionIndex = interactions.findIndex(
      (i) => i.deviceId === deviceId && i.timestamp === timestamp
    );

    if (interactionIndex === -1) {
      debugLog("Interaction not found for update", { deviceId, timestamp });
      return;
    }

    // Update the interaction
    interactions[interactionIndex].response = response;
    
    // Update puzzle context if provided
    if (puzzleContext) {
      interactions[interactionIndex].puzzleContext = {
        ...interactions[interactionIndex].puzzleContext,
        ...puzzleContext,
      };
      
      // If this solved a puzzle, update session summary
      if (puzzleContext.isSolutionSuccess) {
        await updateSessionPuzzleSummary(interactions[interactionIndex]);
      }
    }

    // Save updated interactions
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(interactions));
    debugLog("Interaction updated successfully");
  } catch (error) {
    debugLog("ERROR updating interaction", error);
    console.error("Error updating interaction:", error);
  }
};

// Update the session summary when a puzzle is solved
const updateSessionPuzzleSummary = async (data: InteractionData) => {
  if (!data.puzzleContext?.activePuzzleId) return;

  try {
    // Get existing session summary
    const summaryData = localStorage.getItem(SESSION_SUMMARY_KEY);
    let summary: SessionSummary;

    if (summaryData) {
      summary = JSON.parse(summaryData);
    } else {
      // Initialize new summary
      summary = {
        deviceId: data.deviceId,
        worldId: data.worldId,
        variant: data.variant,
        startTime: data.timestamp,
        endTime: data.timestamp,
        totalInteractions: 0,
        puzzleAttempts: [],
        functionalFixednessAnalysis: "",
      };
    }

    // Update the end time
    summary.endTime = data.timestamp;

    // Find existing puzzle attempt or create new one
    const existingPuzzleIndex = summary.puzzleAttempts.findIndex(
      (p) => p.puzzleId === data.puzzleContext?.activePuzzleId
    );

    if (existingPuzzleIndex >= 0) {
      // Update existing puzzle
      summary.puzzleAttempts[existingPuzzleIndex].attemptCount += 1;
      summary.puzzleAttempts[existingPuzzleIndex].solutionFound = true;
    } else {
      // Add new puzzle
      summary.puzzleAttempts.push({
        puzzleId: data.puzzleContext.activePuzzleId,
        attemptCount: 1,
        timeToSolution: 0, // Will calculate this later
        solutionFound: true,
      });
    }

    // Save updated summary
    localStorage.setItem(SESSION_SUMMARY_KEY, JSON.stringify(summary));
  } catch (error) {
    debugLog("ERROR updating session summary", error);
  }
};

// Generate session analysis before uploading data
export const generateSessionAnalysis = async (): Promise<string | null> => {
  try {
    // Get all stored interactions to analyze
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!storedData) {
      return null;
    }

    const interactions: InteractionData[] = JSON.parse(storedData);
    if (interactions.length === 0) {
      return null;
    }

    // Get session summary data
    const summaryData = localStorage.getItem(SESSION_SUMMARY_KEY);
    if (!summaryData) {
      return null;
    }

    const summary: SessionSummary = JSON.parse(summaryData);

    // Calculate detailed metrics for each puzzle
    const puzzleInteractions: Record<string, InteractionData[]> = {};

    // Group interactions by puzzle
    interactions.forEach((interaction) => {
      if (interaction.puzzleContext?.activePuzzleId) {
        const puzzleId = interaction.puzzleContext.activePuzzleId;
        if (!puzzleInteractions[puzzleId]) {
          puzzleInteractions[puzzleId] = [];
        }
        puzzleInteractions[puzzleId].push(interaction);
      }
    });

    // Calculate time to solution for each puzzle
    summary.puzzleAttempts.forEach((puzzle) => {
      const puzzleData = puzzleInteractions[puzzle.puzzleId] || [];
      if (puzzleData.length > 0 && puzzle.solutionFound) {
        // Find first attempt and solution timestamps
        const firstAttempt = puzzleData[0].timestamp;
        const solution = puzzleData.find(
          (i) => i.puzzleContext?.isSolutionSuccess
        )?.timestamp;

        if (solution && firstAttempt) {
          puzzle.timeToSolution = solution - firstAttempt;
        }
      }
      
      // Add puzzle metadata if available
      const firstPuzzleInteraction = puzzleData[0];
      if (firstPuzzleInteraction?.puzzleContext) {
        if (firstPuzzleInteraction.puzzleContext.puzzleName) {
          puzzle.puzzleName = firstPuzzleInteraction.puzzleContext.puzzleName;
        }
        if (firstPuzzleInteraction.puzzleContext.fixedFunctionObject) {
          puzzle.fixedFunctionObject = firstPuzzleInteraction.puzzleContext.fixedFunctionObject;
        }
      }
      
      // Count conventional vs unconventional uses
      puzzle.conventionalUseCount = puzzleData.filter(
        i => i.puzzleContext?.conventionalUse === true
      ).length;
      
      puzzle.unconventionalUseCount = puzzleData.filter(
        i => i.puzzleContext?.isAttemptedSolution && !i.puzzleContext?.isSolutionSuccess
      ).length;
      
      // Calculate hesitation metrics
      const hesitations = puzzleData.flatMap(i => i.metrics?.hesitations || []);
      puzzle.hesitationCount = hesitations.length;
      
      if (hesitations.length > 0) {
        puzzle.averageHesitationDuration = hesitations.reduce(
          (sum, h) => sum + h.duration, 0
        ) / hesitations.length;
      }
      
      // Record first encounter and solution times
      if (puzzleData.length > 0) {
        puzzle.firstEncounterTime = new Date(Math.min(...puzzleData.map(i => i.timestamp)));
        
        const solutionInteraction = puzzleData.find(i => i.puzzleContext?.isSolutionSuccess);
        if (solutionInteraction) {
          puzzle.solvedTime = new Date(solutionInteraction.timestamp);
        }
      }
    });

    // Request an AI analysis for this session
    const response = await fetch("/api/session/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        worldId: summary.worldId,
        variant: summary.variant,
        interactions: interactions,
        puzzleAttempts: summary.puzzleAttempts,
      }),
    });

    if (response.ok) {
      const analysisResult = await response.json();
      
      // Store the complete analysis with all data
      summary.functionalFixednessAnalysis = analysisResult.analysis;
      
      // Store additional metrics
      if (analysisResult.functionalFixednessMetrics) {
        summary.functionalFixednessMetrics = analysisResult.functionalFixednessMetrics;
      }
      
      // Store conversation data
      if (analysisResult.conversationData) {
        summary.conversationData = analysisResult.conversationData;
      }
      
      // Update puzzle attempts with enhanced metrics
      if (analysisResult.enhancedPuzzleAttempts) {
        summary.puzzleAttempts = analysisResult.enhancedPuzzleAttempts;
      }

      // Save the updated summary with analysis
      localStorage.setItem(SESSION_SUMMARY_KEY, JSON.stringify(summary));

      return analysisResult.analysis;
    }

    return null;
  } catch (error) {
    debugLog("ERROR generating session analysis", error);
    return null;
  }
};

// Upload all stored interactions to the server
export const uploadStoredInteractions = async (): Promise<boolean> => {
  debugLog("Attempting to upload stored interactions");

  try {
    // Check for localStorage availability (for SSR safety)
    if (typeof window === "undefined" || !window.localStorage) {
      debugLog("localStorage not available, returning early");
      return false;
    }

    // Generate session analysis before upload
    const analysis = await generateSessionAnalysis();
    debugLog("Session analysis generated", { analysisGenerated: !!analysis });

    // Get all stored interactions
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!storedData) {
      debugLog("No stored interactions found to upload");
      return true; // Nothing to upload
    }

    let interactions: InteractionData[];
    try {
      interactions = JSON.parse(storedData);
      debugLog("Retrieved stored interactions for upload", {
        count: interactions.length,
      });
    } catch (parseError) {
      debugLog("ERROR parsing stored interactions for upload", parseError);
      return false;
    }

    if (interactions.length === 0) {
      debugLog("Empty interactions array, nothing to upload");
      return true;
    }

    // Get session summary
    const summaryData = localStorage.getItem(SESSION_SUMMARY_KEY);
    let sessionSummary: SessionSummary | null = null;

    if (summaryData) {
      try {
        sessionSummary = JSON.parse(summaryData);
      } catch (error) {
        debugLog("ERROR parsing session summary", error);
      }
    }

    // Send all interactions to backend API
    debugLog("Sending interactions to backend API", {
      url: "/api/analytics/track",
      interactionCount: interactions.length,
      firstTimestamp: new Date(interactions[0].timestamp).toISOString(),
      lastTimestamp: new Date(
        interactions[interactions.length - 1].timestamp
      ).toISOString(),
      includingSessionSummary: !!sessionSummary,
    });

    const response = await fetch("/api/analytics/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        interactions,
        sessionSummary,
      }),
    });

    debugLog("Upload API response received", {
      status: response.status,
      ok: response.ok,
    });

    if (response.ok) {
      // Clear local storage after successful upload
      debugLog("Upload successful, clearing localStorage");
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem(SESSION_SUMMARY_KEY);
      return true;
    } else {
      const errorText = await response.text();
      debugLog("ERROR uploading interactions, API returned error", {
        status: response.status,
        errorText,
      });
      console.error("Failed to upload interactions:", errorText);
      return false;
    }
  } catch (error) {
    debugLog("ERROR uploading stored interactions", error);
    console.error("Error uploading stored interactions:", error);
    return false;
  }
};

// Calculate metrics from raw interaction data
export const calculateMetrics = (interactions: InteractionData[]) => {
  debugLog("Calculating metrics from interactions", {
    interactionCount: interactions.length,
  });

  if (interactions.length === 0) {
    debugLog("No interactions provided for metric calculation");
    return null;
  }

  const metrics = {
    averageResponseTime: calculateAverageResponseTime(interactions),
    commandPatterns: identifyCommandPatterns(interactions),
    hesitationAnalysis: analyzeHesitations(interactions),
    correctionRate: calculateCorrectionRate(interactions),
    puzzleSolutionMetrics: calculateFunctionalFixednessMetrics(interactions),
    conversationFlow: analyzeConversationFlow(interactions),
  };

  debugLog("Metrics calculation complete", {
    averageResponseTime: `${metrics.averageResponseTime.toFixed(2)}ms`,
    commandPatternCount: metrics.commandPatterns.length,
    hesitationGroups: metrics.hesitationAnalysis.length,
    correctionRate: `${metrics.correctionRate.toFixed(2)}%`,
  });

  return metrics;
};

// Helper functions for metrics calculation

const calculateAverageResponseTime = (interactions: InteractionData[]) => {
  debugLog("Calculating average response time");
  const responseTimes = interactions.map((i) => i.metrics.inputDuration);
  const validTimes = responseTimes.filter((time) => time > 0);

  debugLog("Response time data", {
    totalTimes: responseTimes.length,
    validTimes: validTimes.length,
    invalidTimes: responseTimes.length - validTimes.length,
  });

  if (validTimes.length === 0) return 0;

  const total = validTimes.reduce((sum, time) => sum + time, 0);
  const average = total / validTimes.length;

  debugLog("Response time calculation complete", {
    totalTime: `${total}ms`,
    averageTime: `${average.toFixed(2)}ms`,
    minTime: `${Math.min(...validTimes)}ms`,
    maxTime: `${Math.max(...validTimes)}ms`,
  });

  return average;
};

const identifyCommandPatterns = (interactions: InteractionData[]) => {
  debugLog("Identifying command patterns", {
    interactionCount: interactions.length,
  });

  // Basic implementation - count command frequencies
  const commandCounts: Record<string, number> = {};

  interactions.forEach((interaction) => {
    const cmd = interaction.command.toLowerCase().trim();
    commandCounts[cmd] = (commandCounts[cmd] || 0) + 1;
  });

  const patterns = Object.entries(commandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // Top 10 commands

  debugLog("Command pattern analysis complete", {
    uniqueCommands: Object.keys(commandCounts).length,
    topCommands: patterns.map(([cmd, count]) => `${cmd}: ${count}`).slice(0, 3), // Log top 3
  });

  return patterns;
};

const analyzeHesitations = (interactions: InteractionData[]) => {
  debugLog("Analyzing hesitation patterns");

  // Analyze where users hesitate most frequently
  let allHesitations: { duration: number; position: number; timestamp: number }[] = [];

  interactions.forEach((interaction) => {
    allHesitations = [...allHesitations, ...interaction.metrics.hesitations];
  });

  debugLog("Collected hesitation data", {
    totalHesitations: allHesitations.length,
    interactionsWithHesitations: interactions.filter(
      (i) => i.metrics.hesitations.length > 0
    ).length,
  });

  // Group hesitations by position in command (as percentage of total length)
  const positionGroups: Record<string, number[]> = {};

  allHesitations.forEach((h) => {
    const interaction = interactions.find(
      (i) =>
        i.timestamp <= h.timestamp &&
        i.timestamp + i.metrics.inputDuration >= h.timestamp
    );

    if (!interaction) return;

    const relativePosition =
      Math.floor((h.position / interaction.metrics.commandLength) * 10) * 10;
    const bucket = `${relativePosition}-${relativePosition + 10}%`;

    if (!positionGroups[bucket]) {
      positionGroups[bucket] = [];
    }

    positionGroups[bucket].push(h.duration);
  });

  // Calculate average duration for each position group
  const results = Object.entries(positionGroups).map(
    ([position, durations]) => ({
      position,
      averageDuration:
        durations.reduce((sum, d) => sum + d, 0) / durations.length,
      count: durations.length,
    })
  );

  debugLog("Hesitation analysis complete", {
    positionGroups: Object.keys(positionGroups).length,
    largestGroup: results.sort((a, b) => b.count - a.count)[0],
  });

  return results;
};

const calculateCorrectionRate = (interactions: InteractionData[]) => {
  debugLog("Calculating correction rate");

  const totalCommands = interactions.length;
  const commandsWithCorrections = interactions.filter(
    (i) => i.metrics.corrections > 0
  ).length;
  const totalCorrections = interactions.reduce(
    (sum, i) => sum + i.metrics.corrections,
    0
  );

  const rate = (commandsWithCorrections / totalCommands) * 100;

  debugLog("Correction rate calculation complete", {
    totalCommands,
    commandsWithCorrections,
    totalCorrections,
    rate: `${rate.toFixed(2)}%`,
  });

  return rate;
};

const calculateFunctionalFixednessMetrics = (
  interactions: InteractionData[]
) => {
  debugLog("Calculating functional fixedness metrics");

  // Group interactions by puzzle
  const puzzleInteractions: Record<string, InteractionData[]> = {};

  interactions.forEach((interaction) => {
    if (interaction.puzzleContext?.activePuzzleId) {
      const puzzleId = interaction.puzzleContext.activePuzzleId;
      if (!puzzleInteractions[puzzleId]) {
        puzzleInteractions[puzzleId] = [];
      }
      puzzleInteractions[puzzleId].push(interaction);
    }
  });

  // Analyze each puzzle's solution pattern
  const puzzleMetrics = Object.entries(puzzleInteractions).map(
    ([puzzleId, puzzleData]) => {
      // Find interactions with solution attempts
      const attempts = puzzleData.filter(
        (i) => i.puzzleContext?.isAttemptedSolution
      );
      const successfulAttempt = puzzleData.find(
        (i) => i.puzzleContext?.isSolutionSuccess
      );

      // Calculate time to solution if solved
      let timeToSolution = null;
      if (attempts.length > 0 && successfulAttempt) {
        timeToSolution = successfulAttempt.timestamp - attempts[0].timestamp;
      }

      // Calculate number of incorrect attempts before solution
      const incorrectAttempts = successfulAttempt
        ? attempts.filter((i) => i.timestamp < successfulAttempt.timestamp)
            .length
        : attempts.length;

      // Calculate hesitation patterns during solution attempts
      const attemptHesitations = attempts.reduce(
        (total, i) => total + i.metrics.hesitations.length,
        0
      );

      return {
        puzzleId,
        totalInteractions: puzzleData.length,
        attemptCount: attempts.length,
        solved: !!successfulAttempt,
        timeToSolution,
        incorrectAttempts,
        attemptHesitations,
        averageHesitationsPerAttempt:
          attempts.length > 0 ? attemptHesitations / attempts.length : 0,
      };
    }
  );

  return puzzleMetrics;
};

const analyzePuzzleSolutions = (interactions: InteractionData[]) => {
  debugLog("Analyzing puzzle solutions");

  // This would require knowing which commands represent puzzle solutions
  // Simplified implementation for now
  const result = {
    solutionAttempts: interactions.length,
    uniqueApproaches: identifyCommandPatterns(interactions).length,
  };

  debugLog("Puzzle solution analysis complete", {
    solutionAttempts: result.solutionAttempts,
    uniqueApproaches: result.uniqueApproaches,
  });

  return result;
};

const analyzeConversationFlow = (interactions: InteractionData[]) => {
  debugLog("Analyzing conversation flow");

  // Track semantic themes in commands
  const commandThemes: Record<string, number> = {
    objectExploration: 0, // examine, look at, check
    conventionalUses: 0, // use X for standard purpose
    unconventionalUses: 0, // use X in creative ways
    environmentExploration: 0, // look around, search
  };

  interactions.forEach((interaction) => {
    const cmd = interaction.command.toLowerCase();

    // Simple pattern detection - would be more sophisticated in production
    if (
      cmd.startsWith("examine") ||
      cmd.startsWith("look at") ||
      cmd.startsWith("check")
    ) {
      commandThemes.objectExploration++;
    } else if (cmd.startsWith("use") && cmd.includes(" as ")) {
      commandThemes.unconventionalUses++;
    } else if (cmd.startsWith("use")) {
      commandThemes.conventionalUses++;
    } else if (
      cmd === "look" ||
      cmd.startsWith("search") ||
      cmd.startsWith("explore")
    ) {
      commandThemes.environmentExploration++;
    }
  });

  // Calculate fixation score - higher means more fixated on conventional uses
  const totalUseCommands =
    commandThemes.conventionalUses + commandThemes.unconventionalUses;
  const fixationScore =
    totalUseCommands > 0
      ? (commandThemes.conventionalUses / totalUseCommands) * 100
      : 0;

  return {
    commandThemes,
    fixationScore,
    explorationToUsageRatio:
      commandThemes.objectExploration / (totalUseCommands || 1),
  };
};
