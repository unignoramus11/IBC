import { NextRequest, NextResponse } from "next/server";
import { generateSessionAnalysis } from "../../../../config/systemPrompts";
import { getAnalysisFromPrompt } from "../../../../lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { worldId, variant, interactions, puzzleAttempts } =
      await request.json();

    if (!worldId || !variant || !interactions) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 }
      );
    }

    // Generate analysis template
    const analysisTemplate = generateSessionAnalysis(
      worldId,
      variant,
      interactions
    );

    // Extract conversation messages for analysis
    const messages = interactions
      .map((interaction: any) => ({
        role: "user",
        content: interaction.command,
        timestamp: interaction.timestamp,
        metrics: interaction.metrics,
      }))
      .concat(
        interactions.map((interaction: any) => ({
          role: "assistant",
          content: interaction.response,
          timestamp: interaction.timestamp,
        }))
      )
      .sort((a: any, b: any) => a.timestamp - b.timestamp);

    // Calculate additional metrics for analysis
    const totalAttempts = puzzleAttempts.reduce((sum: number, puzzle: any) => sum + puzzle.attemptCount, 0);
    const solvedPuzzles = puzzleAttempts.filter((puzzle: any) => puzzle.solutionFound).length;
    const averageTimeToSolution = puzzleAttempts
      .filter((puzzle: any) => puzzle.timeToSolution)
      .reduce((sum: number, puzzle: any) => sum + puzzle.timeToSolution, 0) / 
      Math.max(1, puzzleAttempts.filter((puzzle: any) => puzzle.timeToSolution).length);
    
    // Extract hesitation data
    const hesitationData = interactions
      .flatMap((interaction: any) => interaction.metrics?.hesitations || [])
      .map((h: any) => ({ duration: h.duration, position: h.position, timestamp: h.timestamp }));
      
    const averageHesitationDuration = hesitationData.length > 0 ?
      hesitationData.reduce((sum: number, h: any) => sum + h.duration, 0) / hesitationData.length : 0;

    // Generate analysis using Gemini API
    const prompt = `
You are analyzing a user session from a functional fixedness experiment in the form of a text adventure game.
The following is the raw conversation between the user and the AI game narrator, along with puzzle attempt data.

${JSON.stringify(messages)}

Puzzle attempts: ${JSON.stringify(puzzleAttempts)}

Additional metrics:
- Total attempts across all puzzles: ${totalAttempts}
- Solved puzzles: ${solvedPuzzles} out of ${puzzleAttempts.length}
- Average time to solution: ${Math.round(averageTimeToSolution / 1000)} seconds
- Total hesitations: ${hesitationData.length}
- Average hesitation duration: ${Math.round(averageHesitationDuration)} ms

Based on this data, please fill in the following analysis template with your observations:
${analysisTemplate}

Your analysis should focus specifically on patterns of functional fixedness - where users struggle to see unconventional uses for objects.
Be specific and reference actual exchanges from the conversation and include detailed metrics about:
1. How many attempts it took before arriving at the correct solution for each puzzle
2. The time between first encounter with a puzzle and its solution
3. Hesitation patterns when attempting to solve puzzles
4. A comparative analysis between puzzles to identify which created the strongest functional fixedness effect
5. If this was variant B, whether the environmental cues seemed to help overcome functional fixedness

Do not include placeholder text like "[High/Medium/Low]" in your final analysis.

IMPORTANT: Structure your analysis clearly with headings and formatted numbers for easy parsing.
`;

    // Generate the analysis with a device ID for the specific session
    const deviceId = interactions[0]?.deviceId || 'unknown';
    const history = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    
    const analysisResult = await getAnalysisFromPrompt(
      deviceId, 
      prompt, 
      worldId, 
      variant as "A" | "B",
      history
    );
    
    const analysisText = analysisResult.text;

    // Extract key metrics from the analysis text for structured storage
    const functionalFixednessMetrics = extractMetricsFromAnalysis(
      analysisText, 
      worldId, 
      variant, 
      interactions, 
      puzzleAttempts,
      hesitationData
    );

    // Create conversation data summary
    const conversationData = {
      fullConversation: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      })),
      totalDuration: messages.length > 1 ? 
        messages[messages.length - 1].timestamp - messages[0].timestamp : 0,
      commandCount: messages.filter((msg: any) => msg.role === 'user').length,
      uniqueCommandTypes: countUniqueCommandTypes(messages.filter((msg: any) => msg.role === 'user')),
      mostFrequentCommands: getTopCommands(messages.filter((msg: any) => msg.role === 'user'))
    };

    // Create enhanced puzzle attempt data with more metrics
    const enhancedPuzzleAttempts = calculateEnhancedPuzzleMetrics(
      puzzleAttempts,
      interactions
    );

    return NextResponse.json({
      analysis: analysisText,
      functionalFixednessMetrics,
      conversationData,
      enhancedPuzzleAttempts
    }, { status: 200 });
  } catch (error) {
    console.error("Error in session analysis:", error);
    return NextResponse.json(
      { error: "Failed to generate session analysis" },
      { status: 500 }
    );
  }
}

// Extract structured metrics from the analysis text
function extractMetricsFromAnalysis(
  analysis: string,
  worldId: number,
  variant: string,
  interactions: any[],
  puzzleAttempts: any[],
  hesitationData: any[]
) {
  // Default values
  const metrics = {
    overallFixednessLevel: "Moderate",
    averageHesitationDuration: hesitationData.length > 0 ?
      Math.round(hesitationData.reduce((sum, h) => sum + h.duration, 0) / hesitationData.length) : 0,
    totalHesitations: hesitationData.length,
    problemSolvingApproach: "Balanced",
    environmentalPrimingEffectiveness: variant === "B" ? "Moderate" : undefined,
    experimentQualityScore: 7,
    insightMomentsObserved: 0
  };
  
  // Extract overall fixedness level
  const fixednessMatch = analysis.match(/fixedness observed: (High|Moderate|Low)/i);
  if (fixednessMatch) {
    metrics.overallFixednessLevel = fixednessMatch[1];
  }
  
  // Extract problem solving approach
  const approachMatch = analysis.match(/Problem-solving approach: (\w+(-\w+)?)/i);
  if (approachMatch) {
    metrics.problemSolvingApproach = approachMatch[1];
  }
  
  // Extract insight moments count
  const insightMatch = analysis.match(/(\d+)\s+clear moment\(s\) of insight/i);
  if (insightMatch) {
    metrics.insightMomentsObserved = parseInt(insightMatch[1]);
  }
  
  // Extract environmental priming effectiveness (for variant B)
  if (variant === "B") {
    const primingMatch = analysis.match(/environmental cues (were|seemed|appeared) (highly|moderately|slightly|not) effective/i);
    if (primingMatch) {
      const effectivenessLevel = primingMatch[2].toLowerCase();
      if (effectivenessLevel === "highly") {
        metrics.environmentalPrimingEffectiveness = "High";
      } else if (effectivenessLevel === "moderately") {
        metrics.environmentalPrimingEffectiveness = "Moderate";
      } else if (effectivenessLevel === "slightly") {
        metrics.environmentalPrimingEffectiveness = "Low";
      } else {
        metrics.environmentalPrimingEffectiveness = "None";
      }
    }
  }
  
  // Calculate experiment quality score based on various factors
  const solvedRate = puzzleAttempts.filter(p => p.solutionFound).length / Math.max(1, puzzleAttempts.length);
  if (solvedRate === 0) {
    metrics.experimentQualityScore = 4; // Too difficult
  } else if (solvedRate === 1 && puzzleAttempts.every(p => p.attemptCount <= 1)) {
    metrics.experimentQualityScore = 5; // Too easy
  } else if (solvedRate > 0.3 && solvedRate < 0.8) {
    metrics.experimentQualityScore = 8; // Good balance
  }
  
  return metrics;
}

// Count the types of commands used
function countUniqueCommandTypes(userMessages: any[]): number {
  const commandTypes = new Set<string>();
  
  userMessages.forEach((msg: any) => {
    const command = msg.content.toLowerCase().trim();
    
    // Categorize commands
    if (command.startsWith("look")) commandTypes.add("look");
    if (command.startsWith("examine")) commandTypes.add("examine");
    if (command.startsWith("use")) commandTypes.add("use");
    if (command.startsWith("take")) commandTypes.add("take");
    if (command.startsWith("go")) commandTypes.add("movement");
    if (command.startsWith("inventory")) commandTypes.add("inventory");
    if (command.startsWith("help")) commandTypes.add("help");
    
    // Add directions as a movement type
    ["north", "south", "east", "west", "up", "down"].forEach((dir: string) => {
      if (command === dir) commandTypes.add("movement");
    });
  });
  
  return commandTypes.size;
}

// Get the most frequently used commands
function getTopCommands(userMessages: any[], limit = 3): string[] {
  const commandCounts: {[key: string]: number} = {};
  
  userMessages.forEach((msg: any) => {
    const command = msg.content.toLowerCase().trim();
    const commandType = command.split(" ")[0]; // Get first word
    
    commandCounts[commandType] = (commandCounts[commandType] || 0) + 1;
  });
  
  return Object.entries(commandCounts)
    .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
    .slice(0, limit)
    .map(([cmd]: [string, number]) => cmd);
}

// Calculate enhanced metrics for each puzzle attempt
function calculateEnhancedPuzzleMetrics(puzzleAttempts: any[], interactions: any[]): any[] {
  return puzzleAttempts.map((attempt: any) => {
    const puzzleId = attempt.puzzleId;
    
    // Find all interactions related to this puzzle
    const puzzleInteractions = interactions.filter((interaction: any) => 
      interaction.puzzleContext?.activePuzzleId === puzzleId
    );
    
    // Count conventional use attempts
    const conventionalUseCount = puzzleInteractions.filter((interaction: any) => 
      interaction.puzzleContext?.conventionalUse === true
    ).length;
    
    // Count unconventional use attempts
    const unconventionalUseCount = puzzleInteractions.filter((interaction: any) => 
      interaction.puzzleContext?.isAttemptedSolution === true
    ).length;
    
    // Calculate hesitation metrics
    const hesitations = puzzleInteractions.flatMap((interaction: any) => 
      interaction.metrics?.hesitations || []
    );
    
    const hesitationCount = hesitations.length;
    const averageHesitationDuration = hesitationCount > 0 
      ? hesitations.reduce((sum: number, h: any) => sum + h.duration, 0) / hesitationCount
      : 0;
    
    // Find first encounter time
    const firstEncounter = puzzleInteractions.length > 0 
      ? new Date(Math.min(...puzzleInteractions.map((i: any) => i.timestamp)))
      : undefined;
    
    // Find solved time if applicable
    const solvedInteraction = puzzleInteractions.find((interaction: any) => 
      interaction.puzzleContext?.isSolutionSuccess === true
    );
    const solvedTime = solvedInteraction ? new Date(solvedInteraction.timestamp) : undefined;
    
    // Find puzzle name and object if available
    const puzzleName = puzzleInteractions.length > 0 
      ? puzzleInteractions[0].puzzleContext?.puzzleName
      : undefined;
      
    const fixedFunctionObject = puzzleInteractions.length > 0 
      ? puzzleInteractions[0].puzzleContext?.fixedFunctionObject
      : undefined;
    
    return {
      ...attempt,
      puzzleName,
      fixedFunctionObject,
      conventionalUseCount,
      unconventionalUseCount,
      hesitationCount,
      averageHesitationDuration,
      firstEncounterTime: firstEncounter,
      solvedTime
    };
  });
}
