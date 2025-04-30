/**
 * /api/session/history/route.ts
 * -----------------------------
 * API endpoint for retrieving metadata of all sessions for a specific device
 * in the IBC Terminal research platform. Used for listing past sessions.
 *
 * GET: Accepts deviceId as a query parameter and returns a list of session metadata.
 */

import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { getAllDeviceSessions, SessionData } from "@/models/Session";
import { Db } from "mongodb"; // Import Db type

/**
 * Handles GET requests to fetch metadata for all sessions associated with a device.
 * @param request - Next.js API request object
 * @returns JSON response with an array of session metadata objects or error
 */
export async function GET(request: NextRequest) {
  try {
    // Get deviceId from query params
    const deviceId = request.nextUrl.searchParams.get("deviceId");

    if (!deviceId) {
      console.warn("Session history request missing deviceId parameter.");
      return NextResponse.json(
        { error: "Missing deviceId parameter" },
        { status: 400 }
      );
    }

    // Get MongoDB connection
    const db: Db = await getDatabase();

    // --- FIX for Error 1: Call the correct function ---
    // Get all sessions for the device
    const sessions: SessionData[] = await getAllDeviceSessions(db, deviceId);
    // --- END FIX ---

    console.log(`Found ${sessions.length} sessions for deviceId: ${deviceId}`);

    // Map the full session data to only the necessary metadata for the response
    return NextResponse.json({
      sessions: sessions.map((session: SessionData) => ({
        // --- FIX for Error 2: Explicitly type session ---
        id: session._id, // Keep the session ID
        worldId: session.worldId,
        variant: session.variant,
        startTime: session.startTime,
        lastActiveTime: session.lastActiveTime,
        isComplete: session.isComplete || false, // Include completion status
        // Add other metadata if needed (e.g., puzzle count solved)
      })),
    });
  } catch (error) {
    console.error("Error fetching session history:", error);
    let errorMessage = "Internal server error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { error: `Failed to fetch session history: ${errorMessage}` },
      { status: 500 }
    );
  }
}
