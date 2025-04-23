import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getOrCreateSession } from '@/models/Session';
import { getWorldIntroduction } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { deviceId, worldId, variant } = await request.json();
    
    // Validate required fields
    if (!deviceId || worldId === undefined || !variant) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Get MongoDB connection
    const db = await getDatabase();
    
    // Get or create session
    const session = await getOrCreateSession(db, deviceId, worldId, variant);
    
    // Get world introduction from Gemini
    let initialMessage;
    try {
      initialMessage = await getWorldIntroduction(worldId, variant);
    } catch (error) {
      console.error('Error getting world introduction:', error);
      initialMessage = 'Welcome to the terminal adventure. Type "help" for available commands.';
    }
    
    // Update session with initial message if needed
    if (session.history.length === 0) {
      await db.collection('sessions').updateOne(
        { _id: session._id },
        { 
          $push: { 
            history: { 
              role: 'assistant', 
              parts: [{ text: initialMessage }] 
            } 
          } 
        }
      );
    }
    
    return NextResponse.json({
      sessionId: session._id,
      initialMessage: initialMessage,
    });
  } catch (error) {
    console.error('Error initializing session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}