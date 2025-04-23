import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getOrCreateSession, updateSessionHistory, updatePuzzleState } from '@/models/Session';
import { recordInteraction } from '@/models/Interaction';
import { getGeminiResponse } from '@/lib/gemini';
import { processSpecialCommands } from '@/utils/terminal';
import { getWorldData } from '@/lib/worldAllocation';

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
    if (!session || !session._id) {
      throw new Error("Failed to get or create session");
    }
    
    // Analyze command for puzzle relevance
    const worldData = getWorldData(worldId);
    const puzzleContext = analyzePuzzleContext(command, worldData.puzzles, session.puzzleStates);
    
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
      puzzleContext, // Include the puzzle context
    });
    
    // Add user command to history
    await updateSessionHistory(db, session._id, {
      role: 'user',
      parts: [{ text: command }],
    });
    
    // Get response from Gemini
    // Make sure history starts with a user turn, otherwise Gemini will error
    let history = session.history;
    
    // If history is empty, which shouldn't happen after our initialize fix,
    // but just in case, add the current command as the first message
    if (session.history.length === 0) {
      history = [{ role: 'user', parts: [{ text: command }] }];
    } 
    // If history doesn't start with a user turn, prepend a placeholder user message
    else if (history[0].role !== 'user') {
      history = [
        { role: 'user', parts: [{ text: 'START_GAME' }] },
        ...history
      ];
    }
      
    // Get the complete response from Gemini (non-streaming)
    const responseObj = await getGeminiResponse(
      deviceId,
      command,
      worldId,
      variant,
      history
    );
    
    // Extract the full text response with fallback
    const responseText = responseObj.text || "I'm sorry, I couldn't generate a response. Please try again.";
    
    // Add model response to history
    await updateSessionHistory(db, session._id, {
      role: 'model',
      parts: [{ text: responseText }],
    });
    
    // Analyze response to check for puzzle solution success
    const responseAnalysis = analyzeResponseForSolution(
      command, 
      responseText, 
      worldData.puzzles, 
      puzzleContext?.activePuzzleId
    );
    
    // If this was a solution attempt that succeeded, update puzzle state
    if (responseAnalysis.isSolutionSuccess && puzzleContext?.activePuzzleId) {
      await updatePuzzleState(db, session._id, puzzleContext.activePuzzleId, {
        discovered: true,
        solved: true,
        attempts: (session.puzzleStates?.[puzzleContext.activePuzzleId]?.attempts || 0) + 1,
        solvedAt: new Date(),
        firstDiscoveredAt: session.puzzleStates?.[puzzleContext.activePuzzleId]?.firstDiscoveredAt || new Date()
      });
      
      // Update the puzzle context with solution success
      puzzleContext.isSolutionSuccess = true;
    } 
    // If this was a solution attempt that failed, update attempts count
    else if (puzzleContext?.isAttemptedSolution && puzzleContext?.activePuzzleId) {
      await updatePuzzleState(db, session._id, puzzleContext.activePuzzleId, {
        discovered: true,
        solved: false,
        attempts: (session.puzzleStates?.[puzzleContext.activePuzzleId]?.attempts || 0) + 1,
        firstDiscoveredAt: session.puzzleStates?.[puzzleContext.activePuzzleId]?.firstDiscoveredAt || new Date()
      });
    }
    
    // Update interaction with response time and final puzzle context
    await db.collection('interactions').updateOne(
      { _id: interaction._id },
      { 
        $set: { 
          responseTime: Date.now() - interaction.timestamp.getTime(),
          response: responseText,
          puzzleContext: {
            ...puzzleContext,
            ...responseAnalysis
          }
        } 
      }
    );
    
    // Return the complete response immediately
    return NextResponse.json({ 
      response: responseText,
      complete: true,
      puzzleContext: {
        ...puzzleContext,
        ...responseAnalysis
      }
    });
  } catch (error) {
    console.error('Error processing command:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Interface for puzzle context
interface PuzzleContext {
  activePuzzleId?: string;
  isAttemptedSolution: boolean;
  isSolutionSuccess: boolean;
  puzzleName?: string;
  fixedFunctionObject?: string;
  conventionalUse?: boolean;
  previouslyAttempted?: boolean;
  previouslySolved?: boolean;
}

// Analyze command to detect puzzle relevance
function analyzePuzzleContext(command: string, puzzles: any[], puzzleStates: any): PuzzleContext {
  const lowerCommand = command.toLowerCase();
  
  // Check if this is a "use" command
  const isUseCommand = lowerCommand.startsWith('use ');
  if (!isUseCommand) {
    return {
      isAttemptedSolution: false,
      isSolutionSuccess: false
    };
  }
  
  // Find which puzzle this command might be relevant to
  for (const puzzle of puzzles) {
    // Check if the command mentions the fixed function object
    if (lowerCommand.includes(puzzle.fixedFunctionObject.toLowerCase())) {
      // Check if this is a solution attempt
      const isSolutionAttempt = 
        // Direct solution match
        lowerCommand.includes(puzzle.solution.toLowerCase()) ||
        // Or using the object "as" something else (unconventional use)
        (lowerCommand.includes(' as ') && lowerCommand.includes(puzzle.fixedFunctionObject.toLowerCase()));
      
      return {
        activePuzzleId: puzzle.id,
        isAttemptedSolution: isSolutionAttempt,
        isSolutionSuccess: false, // Will be determined after getting response
        puzzleName: puzzle.name,
        fixedFunctionObject: puzzle.fixedFunctionObject,
        conventionalUse: !isSolutionAttempt,
        previouslyAttempted: puzzleStates?.[puzzle.id]?.attempts > 0,
        previouslySolved: puzzleStates?.[puzzle.id]?.solved
      };
    }
  }
  
  return {
    isAttemptedSolution: false,
    isSolutionSuccess: false
  };
}

// Analyze response to check if a solution was successful
function analyzeResponseForSolution(command: string, response: string, puzzles: any[], activePuzzleId?: string) {
  if (!activePuzzleId) return { isSolutionSuccess: false };
  
  const lowerResponse = response.toLowerCase();
  const lowerCommand = command.toLowerCase();
  
  // Find the active puzzle
  const puzzle = puzzles.find(p => p.id === activePuzzleId);
  if (!puzzle) return { isSolutionSuccess: false };
  
  // Check if command matches solution pattern
  const isCommandMatch = lowerCommand.includes(puzzle.solution.toLowerCase());
  
  // Check if response indicates success
  const successIndicators = [
    'you succeeded',
    'it works',
    'you managed to',
    'successfully',
    'puzzle solved',
    'good thinking',
    'well done',
    'clever solution',
    'innovative use',
    'creative thinking',
    'that worked',
    'you\'ve solved',
    'brilliant idea'
  ];
  
  const hasSuccessIndicator = successIndicators.some(indicator => 
    lowerResponse.includes(indicator.toLowerCase())
  );
  
  // Check for failure indicators
  const failureIndicators = [
    'doesn\'t work',
    'won\'t work',
    'cannot',
    'can\'t',
    'unable to',
    'not possible',
    'try something else',
    'that doesn\'t seem to'
  ];
  
  const hasFailureIndicator = failureIndicators.some(indicator => 
    lowerResponse.includes(indicator.toLowerCase())
  );
  
  // Determine if this was a solution success
  const isSolutionSuccess = isCommandMatch && hasSuccessIndicator && !hasFailureIndicator;
  
  return {
    isSolutionSuccess,
    solutionCommandMatch: isCommandMatch,
    responseIndicatesSuccess: hasSuccessIndicator,
    responseIndicatesFailure: hasFailureIndicator
  };
}