import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getOrCreateSession, updateSessionHistory } from '@/models/Session';
import { recordInteraction } from '@/models/Interaction';
import { getGeminiResponse } from '@/lib/gemini';
import { processSpecialCommands } from '@/utils/terminal';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { deviceId, command, worldId, variant, metrics } = await request.json();
    
    // Validate required fields
    if (!deviceId || !command || worldId === undefined || !variant) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Process special commands that don't go to the AI
    const { isSpecialCommand, result } = processSpecialCommands(command);
    if (isSpecialCommand) {
      return NextResponse.json({ response: result });
    }
    
    // Get MongoDB connection
    const db = await getDatabase();
    
    // Get or create session
    const session = await getOrCreateSession(db, deviceId, worldId, variant);
    
    // Record the interaction
    const interaction = await recordInteraction(db, {
      deviceId,
      sessionId: session._id,
      worldId,
      variant,
      command,
      timestamp: new Date(),
      metrics: metrics || {
        inputDuration: 0,
        keystrokes: [],
        corrections: 0,
        hesitations: [],
        commandLength: command.length,
      },
    });
    
    // Add user command to history
    await updateSessionHistory(db, session._id, {
      role: 'user',
      parts: [{ text: command }],
    });
    
    // Get response from Gemini
    const responseStream = await getGeminiResponse(
      deviceId,
      command,
      worldId,
      variant,
      session.history
    );
    
    // Set up streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Process each chunk from the Gemini response
        let responseText = '';
        
        for await (const chunk of responseStream) {
          responseText += chunk.text;
          controller.enqueue(encoder.encode(chunk.text));
        }
        
        // Add assistant response to history
        await updateSessionHistory(db, session._id, {
          role: 'assistant',
          parts: [{ text: responseText }],
        });
        
        // Update interaction with response time
        await db.collection('interactions').updateOne(
          { _id: interaction._id },
          { $set: { responseTime: Date.now() - interaction.timestamp.getTime() } }
        );
        
        controller.close();
      },
      
      async cancel() {
        // Handle cancellation if needed
        console.log('Stream was cancelled by the client');
      }
    });
    
    // Return streaming response
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Error processing command:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}