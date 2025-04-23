/**
 * /api/session/history/route.ts
 * -----------------------------
 * API endpoint for retrieving session history for a device in the IBC Terminal research platform.
 * Used for research review, participant progress tracking, and session management.
 *
 * GET: Accepts deviceId as a query parameter and returns a list of session metadata.
 */

import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { getSessionHistory } from "@/models/Session";

/**
 * Handles GET requests to fetch session history for a device.
 * @param request - Next.js API request object
 * @returns JSON response with session metadata or error
 */
export async function GET(request: NextRequest) {
  try {
    // Get deviceId from query params
    const deviceId = request.nextUrl.searchParams.get("deviceId");

    if (!deviceId) {
      return NextResponse.json(
        { error: "Missing deviceId parameter" },
        { status: 400 }
      );
    }

    // Get MongoDB connection
    const db = await getDatabase();

    // Get session history
    const sessions = await getSessionHistory(db, deviceId);

    return NextResponse.json({
      sessions: sessions.map((session) => ({
        id: session._id,
        worldId: session.worldId,
        variant: session.variant,
        startTime: session.startTime,
        lastActiveTime: session.lastActiveTime,
      })),
    });
  } catch (error) {
    console.error("Error fetching session history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
