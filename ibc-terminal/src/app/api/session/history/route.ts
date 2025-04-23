import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getSessionHistory } from '@/models/Session';

export async function GET(request: NextRequest) {
  try {
    // Get deviceId from query params
    const deviceId = request.nextUrl.searchParams.get('deviceId');
    
    if (!deviceId) {
      return NextResponse.json(
        { error: 'Missing deviceId parameter' },
        { status: 400 }
      );
    }
    
    // Get MongoDB connection
    const db = await getDatabase();
    
    // Get session history
    const sessions = await getSessionHistory(db, deviceId);
    
    return NextResponse.json({
      sessions: sessions.map(session => ({
        id: session._id,
        worldId: session.worldId,
        variant: session.variant,
        startTime: session.startTime,
        lastActiveTime: session.lastActiveTime,
      })),
    });
  } catch (error) {
    console.error('Error fetching session history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}