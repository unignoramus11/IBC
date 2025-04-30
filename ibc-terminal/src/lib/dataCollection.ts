/**
 * dataCollection.ts
 * -----------------
 * Handles all user interaction tracking, session summary, and research data collection for the IBC Terminal research platform.
 * Stores detailed keystroke metrics, puzzle context, and session analytics in localStorage for later upload to the backend.
 * Provides metrics for research on functional fixedness and user problem-solving behavior.
 */

// Import necessary types
import {
  PuzzleAttemptSummary, // Assumes this now includes firstEncounterTime
  FunctionalFixednessMetricsData,
  ConversationData,
  InteractionData as InteractionModelData, // Alias if needed
} from "../models/Interaction";

// Interface for interaction data used within this module
interface InteractionData {
  deviceId: string;
  command: string;
  response?: string;
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
    activePuzzleId?: string;
    isAttemptedSolution: boolean;
    isSolutionSuccess: boolean;
    puzzleName?: string;
    fixedFunctionObject?: string;
    conventionalUse?: boolean;
  };
}

// Interface for session summary data stored locally
interface SessionSummary {
  deviceId: string;
  worldId: number;
  variant: "A" | "B";
  startTime: number;
  endTime: number;
  totalInteractions: number;
  puzzleAttempts: PuzzleAttemptSummary[]; // Uses the imported type
  functionalFixednessAnalysis: string;
  functionalFixednessMetrics?: FunctionalFixednessMetricsData;
  conversationData?: ConversationData;
}

// Debug logger
const debugLog = (message: string, ...data: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[DataCollection: ${new Date().toISOString()}] ${message}`,
      ...data
    );
  }
};

// Local storage keys
const LOCAL_STORAGE_KEY = "ibc_terminal_interactions";
const SESSION_SUMMARY_KEY = "ibc_terminal_session_summary";

// Track user interaction
export const trackUserInteraction = async (data: InteractionData) => {
  const interactionToStore: InteractionData = {
    ...data,
    response: data.response || "",
  };
  debugLog("Tracking user interaction", {
    /* ... snip ... */
  });
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    const interactions: InteractionData[] = storedData
      ? JSON.parse(storedData)
      : [];
    if (
      !interactions.some(
        (i) =>
          i.deviceId === interactionToStore.deviceId &&
          i.timestamp === interactionToStore.timestamp
      )
    ) {
      interactions.push(interactionToStore);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(interactions));
      debugLog("Interaction stored locally successfully", {
        newCount: interactions.length,
      });
      if (
        interactionToStore.puzzleContext?.isSolutionSuccess ||
        interactionToStore.puzzleContext?.activePuzzleId
      ) {
        // Update summary also on first encounter of a puzzle context
        await updateSessionPuzzleSummary(interactionToStore);
      }
    } else {
      debugLog("Duplicate interaction timestamp detected, skipping store.", {
        /* ... snip ... */
      });
    }
  } catch (error) {
    debugLog("ERROR storing user interaction", error);
  }
};

// Update interaction
export const updateInteraction = async (
  deviceId: string,
  timestamp: number,
  response: string,
  puzzleContext?: InteractionData["puzzleContext"]
) => {
  debugLog("Updating interaction with response/context", {
    /* ... snip ... */
  });
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!storedData) return;
    const interactions: InteractionData[] = JSON.parse(storedData);
    const interactionIndex = interactions.findIndex(
      (i) => i.deviceId === deviceId && i.timestamp === timestamp
    );
    if (interactionIndex === -1) {
      debugLog("Interaction not found for update", { deviceId, timestamp });
      return;
    }
    interactions[interactionIndex].response = response;
    if (puzzleContext) {
      interactions[interactionIndex].puzzleContext = puzzleContext;
      // Update summary if this update confirms puzzle success or first encounter
      if (puzzleContext.isSolutionSuccess || puzzleContext.activePuzzleId) {
        await updateSessionPuzzleSummary(interactions[interactionIndex]);
      }
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(interactions));
    debugLog("Interaction updated successfully in localStorage", {
      index: interactionIndex,
    });
  } catch (error) {
    debugLog("ERROR updating interaction", error);
  }
};

// Update session puzzle summary
const updateSessionPuzzleSummary = async (interactionData: InteractionData) => {
  const puzzleId = interactionData.puzzleContext?.activePuzzleId;
  if (!puzzleId) return;
  debugLog(`Updating session summary related to puzzle: ${puzzleId}`);
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    const summaryData = localStorage.getItem(SESSION_SUMMARY_KEY);
    let summary: SessionSummary;
    if (summaryData) {
      summary = JSON.parse(summaryData);
    } else {
      debugLog(
        "Initializing new session summary in localStorage for puzzle update."
      );
      summary = {
        deviceId: interactionData.deviceId,
        worldId: interactionData.worldId,
        variant: interactionData.variant,
        startTime: interactionData.timestamp,
        endTime: interactionData.timestamp,
        totalInteractions: 0,
        puzzleAttempts: [],
        functionalFixednessAnalysis: "",
      };
    }
    summary.endTime = Math.max(summary.endTime, interactionData.timestamp);
    let puzzleAttempt = summary.puzzleAttempts.find(
      (p) => p.puzzleId === puzzleId
    );
    if (!puzzleAttempt) {
      debugLog(`Creating new puzzle summary entry for ${puzzleId}`);
      puzzleAttempt = {
        puzzleId: puzzleId,
        puzzleName: interactionData.puzzleContext?.puzzleName,
        fixedFunctionObject: interactionData.puzzleContext?.fixedFunctionObject,
        attemptCount: 0,
        solutionFound: false,
        // firstEncounterTime will be set below
      };
      summary.puzzleAttempts.push(puzzleAttempt);
    } else {
      debugLog(`Found existing puzzle summary entry for ${puzzleId}`);
    }

    // --- FIX: Use correct interface field ---
    // Set first encounter time if not already set and if we don't have it yet
    if (!puzzleAttempt.firstEncounterTime) {
      const storedInteractionsRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedInteractionsRaw) {
        const interactions: InteractionData[] = JSON.parse(
          storedInteractionsRaw
        );
        const firstInteraction = interactions
          .filter((i) => i.puzzleContext?.activePuzzleId === puzzleId)
          .sort((a, b) => a.timestamp - b.timestamp)[0]; // Find the earliest
        if (firstInteraction) {
          puzzleAttempt.firstEncounterTime = new Date(
            firstInteraction.timestamp
          );
          debugLog(
            `Set firstEncounterTime for ${puzzleId} to ${puzzleAttempt.firstEncounterTime.toISOString()}`
          );
        }
      }
    }
    // --- END FIX ---

    // Mark as solved if the interaction context says so
    if (interactionData.puzzleContext?.isSolutionSuccess) {
      puzzleAttempt.solutionFound = true;
      puzzleAttempt.solvedTime = new Date(interactionData.timestamp);
      debugLog(
        `Marked puzzle ${puzzleId} as solved at ${puzzleAttempt.solvedTime.toISOString()}`
      );
    }

    localStorage.setItem(SESSION_SUMMARY_KEY, JSON.stringify(summary));
    debugLog(`Session summary updated for puzzle ${puzzleId}`);
  } catch (error) {
    debugLog("ERROR updating session summary in localStorage", error);
  }
};

// --- TYPE FIX for puzzleStatsMap values ---
// Define the type for the intermediate calculation map
type PuzzleStatsIntermediate = Partial<PuzzleAttemptSummary> & {
  interactions: InteractionData[];
  totalHesitationDuration?: number; // Add the missing field here
};
// --- END TYPE FIX ---

// Generate session analysis
export const generateSessionAnalysis = async (): Promise<string | null> => {
  debugLog("Generating session analysis from localStorage data...");
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    const summaryData = localStorage.getItem(SESSION_SUMMARY_KEY);
    if (!storedData || !summaryData) return null;
    const interactions: InteractionData[] = JSON.parse(storedData);
    const summary: SessionSummary = JSON.parse(summaryData);
    if (interactions.length === 0) return null;

    // --- Use the corrected type for the map ---
    const puzzleStatsMap: Record<string, PuzzleStatsIntermediate> = {};
    // ---

    interactions.forEach((interaction) => {
      const puzzleId = interaction.puzzleContext?.activePuzzleId;
      if (puzzleId) {
        if (!puzzleStatsMap[puzzleId]) {
          puzzleStatsMap[puzzleId] = {
            puzzleId: puzzleId,
            puzzleName: interaction.puzzleContext?.puzzleName,
            fixedFunctionObject: interaction.puzzleContext?.fixedFunctionObject,
            interactions: [],
            attemptCount: 0,
            conventionalUseCount: 0,
            unconventionalUseCount: 0,
            hesitationCount: 0,
            // --- FIX: Initialize the missing field ---
            totalHesitationDuration: 0,
            // --- END FIX ---
            solutionFound: false,
          };
        }
        const stats = puzzleStatsMap[puzzleId];
        stats.interactions.push(interaction);
        if (
          interaction.puzzleContext?.isAttemptedSolution ||
          interaction.puzzleContext?.conventionalUse
        ) {
          stats.attemptCount = (stats.attemptCount || 0) + 1;
          if (interaction.puzzleContext?.conventionalUse)
            stats.conventionalUseCount = (stats.conventionalUseCount || 0) + 1;
          if (interaction.puzzleContext?.isAttemptedSolution)
            stats.unconventionalUseCount =
              (stats.unconventionalUseCount || 0) + 1;
        }
        const hesitations = interaction.metrics?.hesitations || [];
        stats.hesitationCount =
          (stats.hesitationCount || 0) + hesitations.length;
        // --- FIX: Use the correct field name ---
        stats.totalHesitationDuration =
          (stats.totalHesitationDuration || 0) +
          hesitations.reduce((sum, h) => sum + h.duration, 0);
        // --- END FIX ---
        if (interaction.puzzleContext?.isSolutionSuccess) {
          stats.solutionFound = true;
          stats.solvedTime = new Date(interaction.timestamp);
        }
      }
    });

    const finalPuzzleSummaries: PuzzleAttemptSummary[] = Object.values(
      puzzleStatsMap
    ).map((stats) => {
      const firstInteraction = stats.interactions!.reduce((earliest, current) =>
        current.timestamp < earliest.timestamp ? current : earliest
      );
      // --- FIX: Use correct field name for Date conversion ---
      const firstInteractionTime = new Date(firstInteraction.timestamp);
      // --- END FIX ---
      let timeToSolutionMs: number | undefined = undefined;
      if (stats.solutionFound && stats.solvedTime) {
        timeToSolutionMs =
          stats.solvedTime.getTime() - firstInteractionTime.getTime();
      }
      return {
        puzzleId: stats.puzzleId!,
        puzzleName: stats.puzzleName,
        fixedFunctionObject: stats.fixedFunctionObject,
        attemptCount: stats.attemptCount || 0,
        conventionalUseCount: stats.conventionalUseCount || 0,
        unconventionalUseCount: stats.unconventionalUseCount || 0,
        timeToSolutionMs: timeToSolutionMs,
        solutionFound: stats.solutionFound || false,
        hesitationCount: stats.hesitationCount || 0,
        // --- FIX: Use the correct field name for calculation ---
        averageHesitationDurationMs:
          (stats.hesitationCount || 0) > 0
            ? (stats.totalHesitationDuration || 0) / stats.hesitationCount!
            : 0,
        // --- FIX: Use correct field name for assignment ---
        firstEncounterTime: firstInteractionTime,
        // --- END FIX ---
        solvedTime: stats.solvedTime,
      };
    });

    summary.puzzleAttempts = finalPuzzleSummaries;
    summary.totalInteractions = interactions.length;

    debugLog("Sending session data for AI analysis", {
      /* ... snip ... */
    });
    const analysisResponse = await fetch("/api/session/analyze", {
      /* ... snip ... */
    });

    if (analysisResponse.ok) {
      const analysisResult = await analysisResponse.json();
      debugLog("Received AI analysis result", {
        /* ... snip ... */
      });
      summary.functionalFixednessAnalysis =
        analysisResult.analysis || "Analysis failed.";
      summary.functionalFixednessMetrics =
        analysisResult.functionalFixednessMetrics;
      summary.conversationData = analysisResult.conversationData;
      localStorage.setItem(SESSION_SUMMARY_KEY, JSON.stringify(summary));
      debugLog("Session summary updated with AI analysis.");
      return summary.functionalFixednessAnalysis;
    } else {
      const errorText = await analysisResponse.text();
      debugLog("Failed to get AI analysis from backend", {
        /* ... snip ... */
      });
      return `Analysis generation failed: ${errorText}`;
    }
  } catch (error) {
    debugLog("ERROR generating session analysis", error);
    return null;
  }
};

// Upload stored interactions
export const uploadStoredInteractions = async (): Promise<boolean> => {
  debugLog("Attempting to upload stored data...");
  try {
    if (typeof window === "undefined" || !window.localStorage) return false;
    await generateSessionAnalysis(); // Update summary before upload
    const storedInteractions = localStorage.getItem(LOCAL_STORAGE_KEY);
    const storedSummary = localStorage.getItem(SESSION_SUMMARY_KEY);
    if (!storedInteractions && !storedSummary) return true;
    const interactions: InteractionData[] = storedInteractions
      ? JSON.parse(storedInteractions)
      : [];
    const sessionSummary: SessionSummary | null = storedSummary
      ? JSON.parse(storedSummary)
      : null;
    if (interactions.length === 0 && !sessionSummary) return true;
    debugLog("Sending data to backend /api/analytics/track", {
      /* ... snip ... */
    });
    const response = await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interactions, sessionSummary }),
    });
    debugLog("Upload API response status:", response.status);
    if (response.ok) {
      const result = await response.json();
      debugLog("Upload successful", result);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem(SESSION_SUMMARY_KEY);
      debugLog("localStorage cleared after successful upload.");
      return true;
    } else {
      const errorText = await response.text();
      debugLog("Upload failed", { status: response.status, errorText });
      return false;
    }
  } catch (error) {
    debugLog("ERROR during uploadStoredInteractions", error);
    return false;
  }
};

// --- Metrics Calculation (Example Implementations) ---
/**
 * Calculates various research metrics from a list of user interactions.
 * @param interactions - Array of InteractionData
 * @returns Object containing calculated metrics or null if no interactions.
 */
export const calculateMetrics = (interactions: InteractionData[]) => {
  debugLog("Calculating metrics from interactions", {
    interactionCount: interactions.length,
  });
  if (!interactions || interactions.length === 0) return null;

  const totalDurationMs =
    interactions.length > 1
      ? interactions[interactions.length - 1].timestamp -
        interactions[0].timestamp
      : 0;
  const totalHesitations = interactions.reduce(
    (sum, i) => sum + (i.metrics?.hesitations?.length || 0),
    0
  );
  // --- FIX: Use the corrected calculation logic for average hesitation ---
  const totalHesitationDurationMs = interactions.reduce(
    (sum, i) =>
      sum + (i.metrics?.hesitations?.reduce((s, h) => s + h.duration, 0) || 0),
    0
  );
  const averageHesitationDurationMs =
    totalHesitations > 0 ? totalHesitationDurationMs / totalHesitations : 0;
  // --- END FIX ---
  const totalCorrections = interactions.reduce(
    (sum, i) => sum + (i.metrics?.corrections || 0),
    0
  );
  const totalKeystrokes = interactions.reduce(
    (sum, i) => sum + (i.metrics?.keystrokes?.length || 0),
    0
  );

  const useCount = interactions.filter((i) =>
    i.command.toLowerCase().startsWith("use ")
  ).length;
  const examineCount = interactions.filter((i) =>
    i.command.toLowerCase().startsWith("examine ")
  ).length;
  let problemSolvingApproach = "Balanced";
  if (examineCount > useCount * 1.5 && useCount > 0)
    problemSolvingApproach = "Methodical"; // Avoid divide by zero if useCount is 0
  if (useCount > examineCount * 1.5 && examineCount > 0)
    problemSolvingApproach = "Trial-and-Error"; // Avoid divide by zero

  const puzzleMetrics = calculateFunctionalFixednessMetrics(interactions);

  const metrics = {
    totalInteractions: interactions.length,
    totalDurationMs: totalDurationMs,
    totalHesitations: totalHesitations,
    averageHesitationDurationMs: averageHesitationDurationMs,
    totalCorrections: totalCorrections,
    totalKeystrokes: totalKeystrokes,
    problemSolvingApproach: problemSolvingApproach,
    puzzleMetrics: puzzleMetrics,
  };
  debugLog("Metrics calculation complete", metrics);
  return metrics;
};

// Helper to calculate puzzle-specific fixedness metrics
const calculateFunctionalFixednessMetrics = (
  interactions: InteractionData[]
): PuzzleAttemptSummary[] => {
  // --- Use the corrected type for the map ---
  const puzzleStatsMap: Record<string, PuzzleStatsIntermediate> = {};
  // ---

  interactions.forEach((interaction) => {
    const puzzleId = interaction.puzzleContext?.activePuzzleId;
    if (puzzleId) {
      if (!puzzleStatsMap[puzzleId]) {
        puzzleStatsMap[puzzleId] = {
          puzzleId: puzzleId,
          puzzleName: interaction.puzzleContext?.puzzleName,
          fixedFunctionObject: interaction.puzzleContext?.fixedFunctionObject,
          interactions: [],
          attemptCount: 0,
          conventionalUseCount: 0,
          unconventionalUseCount: 0,
          hesitationCount: 0,
          // --- FIX: Initialize the missing field ---
          totalHesitationDuration: 0,
          // --- END FIX ---
          solutionFound: false,
        };
      }
      const stats = puzzleStatsMap[puzzleId];
      stats.interactions.push(interaction);
      if (
        interaction.puzzleContext?.isAttemptedSolution ||
        interaction.puzzleContext?.conventionalUse
      ) {
        stats.attemptCount = (stats.attemptCount || 0) + 1;
        if (interaction.puzzleContext?.conventionalUse)
          stats.conventionalUseCount = (stats.conventionalUseCount || 0) + 1;
        if (interaction.puzzleContext?.isAttemptedSolution)
          stats.unconventionalUseCount =
            (stats.unconventionalUseCount || 0) + 1;
      }
      const hesitations = interaction.metrics?.hesitations || [];
      stats.hesitationCount = (stats.hesitationCount || 0) + hesitations.length;
      // --- FIX: Use the correct field name ---
      stats.totalHesitationDuration =
        (stats.totalHesitationDuration || 0) +
        hesitations.reduce((sum, h) => sum + h.duration, 0);
      // --- END FIX ---
      if (interaction.puzzleContext?.isSolutionSuccess) {
        stats.solutionFound = true;
        stats.solvedTime = new Date(interaction.timestamp);
      }
    }
  });

  return Object.values(puzzleStatsMap).map((stats) => {
    const firstInteraction = stats.interactions!.reduce((earliest, current) =>
      current.timestamp < earliest.timestamp ? current : earliest
    );
    const firstInteractionTime = new Date(firstInteraction.timestamp);
    let timeToSolutionMs: number | undefined = undefined;
    if (stats.solutionFound && stats.solvedTime) {
      timeToSolutionMs =
        stats.solvedTime.getTime() - firstInteractionTime.getTime();
    }
    return {
      puzzleId: stats.puzzleId!,
      puzzleName: stats.puzzleName,
      fixedFunctionObject: stats.fixedFunctionObject,
      attemptCount: stats.attemptCount || 0,
      conventionalUseCount: stats.conventionalUseCount || 0,
      unconventionalUseCount: stats.unconventionalUseCount || 0,
      timeToSolutionMs: timeToSolutionMs,
      solutionFound: stats.solutionFound || false,
      hesitationCount: stats.hesitationCount || 0,
      // --- FIX: Use the correct field name for calculation ---
      averageHesitationDurationMs:
        (stats.hesitationCount || 0) > 0
          ? (stats.totalHesitationDuration || 0) / stats.hesitationCount!
          : 0,
      // --- FIX: Use correct field name for assignment ---
      firstEncounterTime: firstInteractionTime, // Assuming PuzzleAttemptSummary has this
      // --- END FIX ---
      solvedTime: stats.solvedTime,
    };
  });
};
