/**
 * /api/analytics/track/route.ts
 * ----------------------------
 * API endpoint for uploading user interaction and session summary data for research analytics in the IBC Terminal platform.
 * Accepts both single and batch uploads from the client, storing detailed command, response, and metrics data in MongoDB.
 * Used for research on functional fixedness, problem-solving, and session analysis.
 *
 * POST: Accepts JSON body with either a single interaction or an array of interactions and an optional session summary.
 */

import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
// Import InteractionData type along with the functions
import {
  recordInteraction,
  recordSessionSummary,
  SessionSummaryData,
  InteractionData,
} from "@/models/Interaction";
import { ObjectId } from "mongodb"; // Ensure ObjectId is imported if needed

/**
 * Handles POST requests to store user interactions and session summaries for research analytics.
 * @param request - Next.js API request object
 * @returns JSON response indicating success or error
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body - could be { interactions: [...], sessionSummary: {...} } or a single interaction
    const data = await request.json();

    // Get MongoDB connection
    const db = await getDatabase();

    // Check if it's a batch upload structure
    if (data.interactions && Array.isArray(data.interactions)) {
      // Handle bulk upload from localStorage/client
      const interactions: Partial<InteractionData>[] = data.interactions; // Use Partial initially if structure might vary slightly
      const sessionSummaryInput = data.sessionSummary; // The raw summary data from client

      // Process session summary first if provided
      let sessionId: ObjectId | null = null; // Initialize sessionId as potentially null
      if (sessionSummaryInput) {
        try {
          // Prepare summary data for insertion, ensuring correct types and structure
          // Use Omit to ensure _id isn't passed if present, aligning with function signature
          const summaryDataToRecord: Omit<SessionSummaryData, "_id"> = {
            deviceId: sessionSummaryInput.deviceId,
            // Ensure sessionId from summary input is treated correctly if present (it shouldn't be for a new summary)
            sessionId: new ObjectId(sessionSummaryInput.sessionId), // Link summary to the session it summarizes
            worldId: sessionSummaryInput.worldId,
            variant: sessionSummaryInput.variant,
            startTime: new Date(sessionSummaryInput.startTime),
            endTime: new Date(sessionSummaryInput.endTime),
            totalDurationMs:
              sessionSummaryInput.totalDurationMs ||
              new Date(sessionSummaryInput.endTime).getTime() -
                new Date(sessionSummaryInput.startTime).getTime(),
            totalInteractions:
              sessionSummaryInput.totalInteractions || interactions.length,
            // --- FIX for Error 1: Use correct property name ---
            puzzleAttemptSummaries:
              sessionSummaryInput.puzzleAttemptSummaries || [], // Changed from puzzleAttempts
            // --- End FIX ---
            functionalFixednessAnalysis:
              sessionSummaryInput.functionalFixednessAnalysis || "",
            functionalFixednessMetrics:
              sessionSummaryInput.functionalFixednessMetrics || undefined, // Optional field
            conversationData: sessionSummaryInput.conversationData || undefined, // Optional field
            completionStatus:
              sessionSummaryInput.completionStatus || "Completed", // Default or from input
          };

          // Store the session summary
          const summaryId = await recordSessionSummary(db, summaryDataToRecord);
          // Retrieve the sessionId from the summary data itself for linking interactions
          sessionId = summaryDataToRecord.sessionId; // Get the linked session ID
          console.log(
            `Recorded session summary ${summaryId} linked to session ${sessionId}`
          );
        } catch (err) {
          console.error("Error recording session summary:", err);
          // Decide if interactions should still be recorded if summary fails
          // sessionId remains null here
        }
      } else {
        // If no summary, try to infer sessionId from the first interaction if consistent
        if (interactions.length > 0 && interactions[0].sessionId) {
          // Ensure it's treated as ObjectId | null type safety
          try {
            sessionId = new ObjectId(interactions[0].sessionId);
          } catch (e) {
            console.warn(
              "Invalid sessionId found in first interaction, interactions may not be linked correctly."
            );
            sessionId = null;
          }
        }
        console.log("No session summary provided for batch upload.");
      }

      // Validate the interactions array
      if (interactions.length === 0) {
        console.log("Received empty interactions array.");
        return NextResponse.json({
          success: true,
          count: 0,
          sessionRecorded: !!sessionId,
        });
      }

      // Record each interaction, linking to the session summary's sessionId if available
      let recordedCount = 0;
      for (const interaction of interactions) {
        // Destructure expected fields, provide defaults or handle missing optional fields
        const {
          deviceId,
          command,
          response,
          metrics,
          timestamp,
          worldId,
          variant,
          puzzleContext,
          // Attempt to use the sessionId from the interaction itself if the summary one failed/is missing
          // But prioritize the session summary's sessionId if present
          sessionId: interactionSessionId,
        } = interaction;

        // Basic validation for required fields in an interaction
        if (
          !deviceId ||
          !command ||
          !metrics ||
          !timestamp ||
          worldId === undefined ||
          variant === undefined
        ) {
          console.warn(
            "Skipping invalid interaction in batch due to missing required fields:",
            interaction
          );
          continue;
        }

        try {
          // --- FIX for Errors 2 & 3: Pass the potentially null sessionId ---
          // Ensure InteractionData interface allows sessionId: ObjectId | null
          const interactionToRecord: Omit<InteractionData, "_id"> = {
            deviceId,
            // Use sessionId from summary processing if available, otherwise try the interaction's own sessionId (if exists), else null
            sessionId:
              sessionId ||
              (interactionSessionId
                ? new ObjectId(interactionSessionId)
                : null),
            worldId,
            variant,
            command,
            response: response || undefined, // Ensure response is string or undefined
            timestamp: new Date(timestamp),
            metrics,
            puzzleContext: puzzleContext || {
              isAttemptedSolution: false,
              isSolutionSuccess: false,
            }, // Default if missing
          };
          await recordInteraction(db, interactionToRecord);
          recordedCount++;
          // --- End FIX ---
        } catch (err) {
          console.error("Error recording batch interaction:", err);
          // Continue with next interaction? Or stop? Decide based on requirements.
        }
      }

      console.log(`Recorded ${recordedCount} interactions from batch.`);
      return NextResponse.json({
        success: true,
        count: recordedCount,
        sessionRecorded: !!sessionId, // Indicate if a summary was processed
      });
    } else {
      // Handle single interaction (legacy or specific use case)
      console.log("Processing single interaction track request.");
      const {
        deviceId,
        command,
        metrics,
        timestamp,
        worldId,
        variant,
        response, // Include optional response
        puzzleContext, // Include optional context
        sessionId: singleSessionId, // Allow sessionId to be passed for single tracks too
      } = data;

      // Validate required fields for a single interaction
      if (
        !deviceId ||
        !command ||
        !metrics ||
        !timestamp ||
        worldId === undefined ||
        variant === undefined
      ) {
        console.error(
          "Missing required fields for single interaction track:",
          data
        );
        return NextResponse.json(
          { error: "Missing required fields for single interaction" },
          { status: 400 }
        );
      }

      try {
        // --- FIX for Errors 2 & 3 (also applied here) ---
        const interactionToRecord: Omit<InteractionData, "_id"> = {
          deviceId,
          // Allow sessionId to be null if not provided or invalid
          sessionId: singleSessionId ? new ObjectId(singleSessionId) : null,
          worldId,
          variant,
          command,
          response: response || undefined,
          timestamp: new Date(timestamp),
          metrics,
          puzzleContext: puzzleContext || {
            isAttemptedSolution: false,
            isSolutionSuccess: false,
          },
        };
        await recordInteraction(db, interactionToRecord);
        console.log(`Recorded single interaction for device ${deviceId}`);
        return NextResponse.json({ success: true });
        // --- End FIX ---
      } catch (err) {
        console.error("Error recording single interaction:", err);
        // Return error specifically for the single interaction failure
        return NextResponse.json(
          { success: false, error: "Failed to record interaction" },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error("Error processing /api/analytics/track request:", error);
    // Generic error response
    return NextResponse.json(
      { success: false, error: "Internal server error during tracking" },
      { status: 500 }
    );
  }
}
