import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { recordInteraction } from '@/models/Interaction';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { deviceId, command, metrics, timestamp, worldId, variant } = await request.json();
    
    // Validate required fields
    if (!deviceId || !command || !metrics || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Get MongoDB connection
    const db = await getDatabase();
    
    // Record the interaction for analytics purposes
    await recordInteraction(db, {
      deviceId,
      sessionId: null, // Will be populated later
      worldId,
      variant,
      command,
      timestamp: new Date(timestamp),
      metrics,
    });
    
    // Return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    // Still return success to avoid interrupting user experience
    return NextResponse.json({ success: true });
  }
}