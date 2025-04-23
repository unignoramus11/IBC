import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { recordInteraction, recordSessionSummary } from "@/models/Interaction";

export async function POST(request: NextRequest) {
  try {
    // Parse request body - now could be a single interaction or an array
    const data = await request.json();

    // Get MongoDB connection
    const db = await getDatabase();

    // Check if it's a batch of interactions or a single one
    if (data.interactions && Array.isArray(data.interactions)) {
      // Handle bulk upload from localStorage
      const interactions = data.interactions;
      const sessionSummary = data.sessionSummary;

      // Process session summary first if available
      let sessionId = null;
      if (sessionSummary) {
        try {
          // Store the session summary
          sessionId = await recordSessionSummary(db, {
            deviceId: sessionSummary.deviceId,
            worldId: sessionSummary.worldId,
            variant: sessionSummary.variant,
            startTime: new Date(sessionSummary.startTime),
            endTime: new Date(sessionSummary.endTime),
            totalInteractions:
              sessionSummary.totalInteractions || interactions.length,
            puzzleAttempts: sessionSummary.puzzleAttempts || [],
            functionalFixednessAnalysis:
              sessionSummary.functionalFixednessAnalysis || "",
            completionTimestamp: new Date(),
          });

          console.log(`Recorded session summary with ID: ${sessionId}`);
        } catch (err) {
          console.error("Error recording session summary:", err);
        }
      }

      // Validate the array
      if (interactions.length === 0) {
        return NextResponse.json({ success: true });
      }

      // Record each interaction
      for (const interaction of interactions) {
        const {
          deviceId,
          command,
          response, // new field
          metrics,
          timestamp,
          worldId,
          variant,
          puzzleContext, // new field
        } = interaction;

        // Basic validation
        if (!deviceId || !command || !metrics || !timestamp) {
          console.warn("Skipping invalid interaction in batch");
          continue;
        }

        try {
          await recordInteraction(db, {
            deviceId,
            sessionId, // Now linked to the session summary
            worldId,
            variant,
            command,
            response: response || "", // Store AI response as well
            timestamp: new Date(timestamp),
            metrics,
            puzzleContext,
          });
        } catch (err) {
          console.error("Error recording batch interaction:", err);
          // Continue with next interaction
        }
      }

      return NextResponse.json({
        success: true,
        count: interactions.length,
        sessionRecorded: !!sessionId,
      });
    } else {
      // Handle single interaction (legacy support)
      const { deviceId, command, metrics, timestamp, worldId, variant } = data;

      // Validate required fields
      if (!deviceId || !command || !metrics || !timestamp) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Record the interaction for analytics purposes
      await recordInteraction(db, {
        deviceId,
        sessionId: null, // Will be populated later
        worldId,
        variant,
        command,
        response: data.response || "",
        timestamp: new Date(timestamp),
        metrics,
        puzzleContext: data.puzzleContext,
      });

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("Error tracking analytics:", error);
    // Still return success to avoid interrupting user experience
    return NextResponse.json({ success: true });
  }
}
