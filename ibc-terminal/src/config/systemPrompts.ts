/**
 * systemPrompts.ts
 * ----------------
 * Provides prompt generation and session analysis utilities for the IBC Terminal research platform.
 * Used to generate world- and variant-specific system prompts for the AI, and to create detailed research analyses of user sessions.
 *
 * Exports:
 * - getSystemPrompt: Returns the system prompt for a given world and variant
 * - generateSessionAnalysis: Generates a research analysis of a session's interactions and puzzle attempts
 */

import { getWorldData, getVariantDetails } from "../lib/worldAllocation";

/**
 * Generates the system prompt for a specific world and variant for research on functional fixedness.
 * @param worldId - The world index
 * @param variant - The experimental/control variant ("A" | "B")
 * @returns The system prompt string
 */
export const getSystemPrompt = (
  worldId: number,
  variant: "A" | "B"
): string => {
  const worldData = getWorldData(worldId);
  const variantBlock =
    variant === "A" ? worldData.controlVariant : worldData.experimentalVariant;

  return `IMPORTANT: You are running a text adventure game that serves as a research experiment on functional fixedness - the cognitive bias that limits people to using objects only in traditional ways, based on Karl Duncker's classic studies.

WORLD: "${worldData.name}"

CRITICAL INSTRUCTIONS:
1. The player has NO knowledge of this world - you MUST begin by describing the initial scene in rich detail, including the DETAILED WORLD INFORMATION given below.
2. Inform the player that they can type "help" for a list of commands.
3. Set the scene with vivid descriptions of the environment, sounds, smells, etc.
4. Never assume the player knows anything about the world - explain all relevant details
5. Always stay in character as the game narrator - NEVER break the fourth wall
6. NEVER ask the player what game they want to play or offer alternative game options
7. DO NOT respond with meta-commentary or acknowledgment of commands like START_GAME

GAME STRUCTURE:
- This is specifically a "${
    worldData.name
  }" adventure - not any other setting or game
- The game follows classic text adventure mechanics (look, examine, use, take, go, etc.)
- The player starts in the initial location with: ${worldData.startingInventory.join(
    ", "
  )}
- Primary objective: ${worldData.mainObjectives[0]}

DETAILED WORLD INFORMATION:
${worldData.description}

VARIANT-SPECIFIC INTRO:
${variantBlock.intro}

ENVIRONMENT DESCRIPTIONS:
${Object.entries(variantBlock.environmentDescriptions)
  .map(([area, desc]) => `- ${area}: ${desc}`)
  .join("\n")}

EXPECTED PLAYER INTERACTIONS:
- When the player types "look" - Describe the current location in detail
- When the player types "examine [object]" - Provide specific details about that object
- When the player types "inventory" - List what items they're carrying
- When the player uses directional commands (north, south, east, west) - Move them accordingly
- When the player tries to use items - Describe realistic outcomes based on world physics

CRITICAL: YOUR FIRST RESPONSE MUST:
1. Set the scene completely - describe where the player is, what they can see/hear/smell
2. Establish the immediate surroundings with vivid details
3. Hint at the first objective or point of interest
4. End with a subtle prompt for action (e.g., "What will you do?")

FUNCTIONAL FIXEDNESS EXPERIMENT FRAMEWORK:
This experiment follows Karl Duncker's paradigm studying how prior use of an object affects problem-solving:
- Variant A (control): Objects are presented in their traditional context and use (w.p. - without pre-utilization)
- Variant B (experimental): Objects are first used for their conventional purpose, then must be repurposed for a different function (a.p. - after pre-utilization)

PUZZLES AND FUNCTIONAL FIXEDNESS TRACKING:
Each puzzle presents a clear functional fixedness challenge:
${worldData.puzzles
  .map(
    (puzzle) =>
      `\n- "${puzzle.name}": ${puzzle.description}\n  Solution requires using ${
        puzzle.fixedFunctionObject
      } in an unconventional way: ${puzzle.solution}\n  Context to present: ${
        variant === "A" ? puzzle.controlVariant : puzzle.experimentalVariant
      }\n  \n  TRACKING INSTRUCTIONS:\n  - Silently track ANY attempt that could be considered a solution attempt (keep a mental count)\n  - Note all alternative solutions they try before discovering the intended solution\n  - Observe if they express confusion or fixation on the conventional use of ${
        puzzle.fixedFunctionObject
      }\n  - Record the moment of insight when they solve the puzzle, and what triggered this insight\n  - Pay special attention to whether they mention the object's primary function as an obstacle\n`
  )
  .join("\n")}

VARIANT-SPECIFIC INSTRUCTION:
This is variant ${variant}. You must implement the following approach:
${
  variant === "A"
    ? "CONTROL VARIANT: Present objects in their traditional contexts only. DO NOT provide any hints about unconventional uses or examples of objects being repurposed. When describing the fixed function objects, emphasize their conventional properties and purposes. This creates a baseline without any priming for creative use."
    : 'EXPERIMENTAL VARIANT: First establish the conventional use of key objects, then create situations where the player must repurpose them. For objects involved in puzzles, ensure the player uses them first for their conventional purpose before they need to be repurposed - this creates the "after pre-utilization" condition that Duncker studied. Include 2-3 examples of other objects being used in unconventional ways in your descriptions.'
}

${
  variant === "B"
    ? `EXPERIMENTAL VARIANT IMPLEMENTATION:\nFollow these steps for key puzzle objects:\n(the objects being referred to are ${worldData.puzzles
        .map((p) => p.fixedFunctionObject)
        .join(
          ", "
        )})\n1. First introduce the object in its conventional context and have the player use it for its normal purpose\n2. Create a separate problem that requires repurposing the same object\n3. Observe if the player struggles to see beyond the object's established function\n\nExamples of how to subtly show unconventional object uses (include 2-3 of these or similar examples in your descriptions):\n- "A worker has fastened a broken shelf using a bent paperclip as a bracket" (shows repurposing a fastening tool as a structural element)\n- "Someone has wedged a book under a wobbly table leg" (shows repurposing an information object as a physical support)\n- "A small mirror is positioned to redirect light into a dark corner" (shows repurposing a personal object for environmental manipulation)\n- "A currency card used as a scraper to remove something stuck to a surface" (shows repurposing a financial tool as a physical tool)\n- "A decorative pin used to pick a simple lock" (shows repurposing an ornamental object as a tool)\n- "Empty bottles filled with colored liquid to create makeshift light diffusers" (shows repurposing containers as artistic/functional elements)\n- "A broken electronic device's screen used as a reflective surface" (shows repurposing a damaged object in a new way)\n- "A piece of clothing wrapped around a pipe to stop a leak" (shows repurposing protective items for emergency repairs)\n\nIMPORTANT: Create environmental situations that subtly prime the player to think about objects in multiple ways. For each puzzle object, make sure to:\n1. Show the conventional use of the object first (have the player actually use it for its primary function)\n2. Have NPCs or environmental elements demonstrate creativity with similar but different objects\n3. Include descriptive text that emphasizes physical properties of objects that hint at alternative uses\n\nDO NOT use examples that directly solve the puzzles, but rather illustrate the same type of creative thinking by showing analogous object repurposing.`
    : ""
}

COMMANDS:
If a player types "help", list available commands: look, examine [object], take [object], use [object], inventory, go [direction].

SESSION ANALYSIS:
As the player progresses through the game, silently track and analyze:
1. How fixated they seem on conventional object uses (strong/moderate/minimal fixation)
2. How many solution attempts they make before finding the correct answer
3. Whether they show sudden insight moments or gradual realization
4. Their specific alternative solutions and approaches to each puzzle
5. Whether they explicitly mention limitations of thinking about objects in conventional ways
6. For variant B: whether the environmental examples seem to influence their thinking

REMEMBER: The player knows NOTHING about this world. Your descriptions must introduce everything as if for the first time.`;
};

/**
 * Generates a detailed research analysis of a session's problem-solving behavior and functional fixedness.
 * @param worldId - The world index
 * @param variant - The experimental/control variant
 * @param messages - Array of user/AI message objects with metrics
 * @returns The AI-generated analysis string
 */
export const generateSessionAnalysis = (
  worldId: number,
  variant: "A" | "B",
  messages: any[]
): string => {
  const worldData = getWorldData(worldId);

  // Extract player commands and AI responses from messages
  const interactions = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp || Date.now(),
    metrics: msg.metrics || {}, // Include metrics data if available
  }));

  // Extract puzzle-specific interactions
  const puzzleInteractions = worldData.puzzles.map((puzzle) => {
    const relevantMessages = interactions.filter(
      (msg) =>
        msg.content
          ?.toLowerCase()
          .includes(puzzle.fixedFunctionObject.toLowerCase()) ||
        msg.content?.toLowerCase().includes(puzzle.solution.toLowerCase())
    );

    // Find solution moment (if any)
    const solutionMessage = relevantMessages.find(
      (msg) =>
        msg.role === "user" &&
        msg.content?.toLowerCase().includes(puzzle.solution.toLowerCase())
    );

    // Count attempted solutions (best approximation)
    const attemptedSolutions = relevantMessages.filter(
      (msg) =>
        msg.role === "user" &&
        msg.content?.toLowerCase().includes("use") &&
        msg.content
          ?.toLowerCase()
          .includes(puzzle.fixedFunctionObject.toLowerCase())
    );

    // Find conventional use moments
    const conventionalUseMoments = relevantMessages.filter(
      (msg) =>
        msg.role === "user" &&
        msg.content?.toLowerCase().includes("use") &&
        msg.content
          ?.toLowerCase()
          .includes(puzzle.fixedFunctionObject.toLowerCase()) &&
        !msg.content?.toLowerCase().includes(puzzle.solution.toLowerCase())
    );

    // Find moments of hesitation - using metrics if available
    const hesitationMoments = relevantMessages.filter(
      (msg) =>
        msg.role === "user" &&
        msg.metrics?.hesitations?.length > 0 &&
        msg.content
          ?.toLowerCase()
          .includes(puzzle.fixedFunctionObject.toLowerCase())
    );

    const averageHesitation =
      hesitationMoments.length > 0
        ? hesitationMoments.reduce((sum: number, msg: any) => {
            return (
              sum +
              (msg.metrics?.hesitations?.reduce(
                (s: number, h: any) => s + h.duration,
                0
              ) || 0)
            );
          }, 0) / hesitationMoments.length
        : 0;

    return {
      puzzle,
      relevantMessages,
      solutionFound: !!solutionMessage,
      solutionMessage,
      attemptCount: attemptedSolutions.length,
      conventionalUseCount: conventionalUseMoments.length,
      hesitationCount: hesitationMoments.length,
      averageHesitationDuration: averageHesitation,
      firstMention: relevantMessages[0]?.timestamp,
      solutionTime: solutionMessage?.timestamp,
      timeToSolution:
        solutionMessage && relevantMessages[0]
          ? solutionMessage.timestamp - relevantMessages[0].timestamp
          : null,
    };
  });

  // Analyze overall functional fixedness indicators
  const fixednessIndicators = {
    conventionalUseFixation: getFixationLevel(interactions, worldData.puzzles),
    insightMoments: getInsightMoments(interactions, worldData.puzzles),
    problemSolvingApproach: getProblemSolvingApproach(interactions),
  };

  return `
FUNCTIONAL FIXEDNESS RESEARCH ANALYSIS
World: ${worldData.name}
Variant: ${
    variant === "A"
      ? "Control (Without Pre-utilization)"
      : "Experimental (After Pre-utilization)"
  }
Total Interactions: ${interactions.filter((msg) => msg.role === "user").length}
Total Conversation Duration: ${
    interactions.length > 1
      ? formatTimeDifference(
          interactions[0].timestamp,
          interactions[interactions.length - 1].timestamp
        )
      : "N/A"
  }

INDIVIDUAL PUZZLE PERFORMANCE:
${puzzleInteractions
  .map(
    (pi) => `
Puzzle: "${pi.puzzle.name}"
- Solution Required: Using ${pi.puzzle.fixedFunctionObject} as ${
      pi.puzzle.solution.split("Use the ")[1] || pi.puzzle.solution
    }
- Solution Found: ${pi.solutionFound ? "Yes" : "No"}
${
  pi.solutionFound
    ? `- Time to Solution: ${formatTimeDifference(
        pi.firstMention,
        pi.solutionTime
      )}`
    : ""
}
- First Mention to Solution: ${
      pi.timeToSolution
        ? Math.round(pi.timeToSolution / 1000) + " seconds"
        : "Not solved"
    }
- Conventional Use Attempts: ${pi.conventionalUseCount}
- Unconventional Use Attempts: ${pi.attemptCount - pi.conventionalUseCount}
- Total Attempts Before Solution: ${pi.attemptCount}
- Hesitation Indicators: ${pi.hesitationCount} moments
${
  pi.hesitationCount > 0
    ? `- Average Hesitation Duration: ${Math.round(
        pi.averageHesitationDuration
      )}ms`
    : ""
}
- Alternative Approaches: ${getAlternativeApproaches(interactions, pi.puzzle)}
${
  pi.solutionFound
    ? `- Breakthrough Observation: ${getBreakthroughMoment(
        interactions,
        pi.puzzle
      )}`
    : ""
}
`
  )
  .join("\n")}

FUNCTIONAL FIXEDNESS INDICATORS:
- Fixation on conventional uses: ${
    fixednessIndicators.conventionalUseFixation.level
  }
  Evidence: ${fixednessIndicators.conventionalUseFixation.evidence}
- Insight moments: ${
    fixednessIndicators.insightMoments.observed
      ? "Observed"
      : "Not clearly observed"
  }
  ${fixednessIndicators.insightMoments.description}
- Problem-solving approach: ${fixednessIndicators.problemSolvingApproach.style}
  Characteristics: ${fixednessIndicators.problemSolvingApproach.characteristics}
- User behaviors indicating fixedness:
  * ${identifyFixednessPatterns(interactions, worldData.puzzles)}

${
  variant === "B"
    ? `PRIMING EFFECTIVENESS:
- Response to environmental examples: ${getEnvironmentalPrimingResponse(
        interactions,
        worldData.puzzles
      )}
- Evidence of conceptual transfer: ${getConceptualTransferEvidence(
        interactions,
        worldData.puzzles
      )}
- Impact of environmental cues on problem-solving time: ${assessEnvironmentalCueImpact(
        puzzleInteractions
      )}`
    : ""
}

RESEARCH IMPLICATIONS:
- Degree of functional fixedness observed: ${getOverallFixednessLevel(
    puzzleInteractions
  )}
- Key findings: ${getKeyFindings(puzzleInteractions, variant, interactions)}
- Alignment with Duncker's paradigm: ${getDunckerAlignmentAssessment(
    puzzleInteractions,
    variant
  )}
- Hesitation analysis: ${analyzeHesitationPatterns(puzzleInteractions)}
- Comparative puzzle difficulty: ${comparePuzzleDifficulty(puzzleInteractions)}

EXPERIMENT QUALITY ASSESSMENT:
- Strength of functional fixedness effect: ${assessFixednessEffectStrength(
    puzzleInteractions,
    variant
  )}
- Quality of puzzle design: ${assessPuzzleDesignQuality(
    puzzleInteractions,
    worldData.puzzles
  )}
- Suggestions for experimental improvement: ${suggestExperimentalImprovements(
    puzzleInteractions,
    worldData,
    variant
  )}

This analysis is based on conversation patterns and may not capture all nuances of the player's thought process. Further qualitative review is recommended.
`;
};

// Helper functions for analysis generation
function getFixationLevel(interactions: any[], puzzles: any[]) {
  // Count conventional use mentions vs. unconventional use attempts
  let conventionalUses = 0;
  let unconventionalUses = 0;

  puzzles.forEach((puzzle) => {
    const puzzleMessages = interactions.filter(
      (msg) =>
        msg.role === "user" &&
        msg.content
          ?.toLowerCase()
          .includes(puzzle.fixedFunctionObject.toLowerCase())
    );

    // Count conventional use messages
    conventionalUses += puzzleMessages.filter(
      (msg) =>
        msg.content?.toLowerCase().includes("use") &&
        !msg.content?.toLowerCase().includes(puzzle.solution.toLowerCase())
    ).length;

    // Count unconventional use attempts
    unconventionalUses += puzzleMessages.filter((msg) =>
      msg.content?.toLowerCase().includes(puzzle.solution.toLowerCase())
    ).length;
  });

  const ratio = conventionalUses / Math.max(1, unconventionalUses);

  if (ratio > 3) {
    return {
      level: "High",
      evidence: `Player focused heavily on conventional uses (${conventionalUses} conventional vs ${unconventionalUses} unconventional attempts)`,
    };
  } else if (ratio > 1.5) {
    return {
      level: "Moderate",
      evidence: `Player showed some fixation on conventional uses before considering alternatives (${conventionalUses} conventional vs ${unconventionalUses} unconventional attempts)`,
    };
  } else {
    return {
      level: "Low",
      evidence: `Player quickly considered unconventional uses (${conventionalUses} conventional vs ${unconventionalUses} unconventional attempts)`,
    };
  }
}

function getInsightMoments(interactions: any[], puzzles: any[]) {
  // Look for sudden shifts in approach after periods of conventional attempts
  const insightPatterns = puzzles.flatMap((puzzle) => {
    const relevantMessages = interactions.filter((msg) =>
      msg.content
        ?.toLowerCase()
        .includes(puzzle.fixedFunctionObject.toLowerCase())
    );

    // Find messages with successful solution
    const solutionMessages = relevantMessages.filter(
      (msg) =>
        msg.role === "user" &&
        msg.content?.toLowerCase().includes(puzzle.solution.toLowerCase())
    );

    if (solutionMessages.length === 0) return [];

    // Find the first solution message
    const firstSolutionMsg = solutionMessages[0];
    const firstSolutionIndex = relevantMessages.findIndex(
      (msg) => msg === firstSolutionMsg
    );

    // If solution came immediately, no insight moment
    if (firstSolutionIndex <= 1) return [];

    // Check for hesitations just before solution
    const preSolutionMsg = relevantMessages[firstSolutionIndex - 1];
    const hasHesitation = preSolutionMsg?.metrics?.hesitations?.length > 0;

    return [
      {
        puzzle: puzzle.name,
        hasInsight: true,
        hasHesitation,
        messagesBefore: firstSolutionIndex,
      },
    ];
  });

  const hasInsightMoments = insightPatterns.length > 0;

  return {
    observed: hasInsightMoments,
    description: hasInsightMoments
      ? `Player showed ${insightPatterns.length} clear moment(s) of insight, often after multiple conventional attempts`
      : "No clear insight moments observed in the conversation",
  };
}

function getProblemSolvingApproach(interactions: any[]) {
  // Analyze command patterns to determine approach
  const exploreCommands = interactions.filter(
    (msg) =>
      msg.role === "user" &&
      (msg.content?.toLowerCase().startsWith("look") ||
        msg.content?.toLowerCase().startsWith("examine") ||
        msg.content?.toLowerCase().startsWith("check"))
  ).length;

  const useCommands = interactions.filter(
    (msg) => msg.role === "user" && msg.content?.toLowerCase().startsWith("use")
  ).length;

  const inspectRatio = exploreCommands / Math.max(1, useCommands);

  if (inspectRatio > 1.5) {
    return {
      style: "Methodical Explorer",
      characteristics:
        "Player carefully examined objects and environment before attempting solutions",
    };
  } else if (inspectRatio > 0.8) {
    return {
      style: "Balanced Approach",
      characteristics: "Player balanced exploration with solution attempts",
    };
  } else {
    return {
      style: "Trial-and-Error",
      characteristics:
        "Player focused on trying solutions with minimal exploration",
    };
  }
}

function getAlternativeApproaches(interactions: any[], puzzle: any) {
  // Extract alternative solution attempts for this puzzle
  const puzzleInteractions = interactions.filter(
    (msg) =>
      msg.role === "user" &&
      msg.content?.toLowerCase().includes("use") &&
      msg.content
        ?.toLowerCase()
        .includes(puzzle.fixedFunctionObject.toLowerCase()) &&
      !msg.content?.toLowerCase().includes(puzzle.solution.toLowerCase())
  );

  if (puzzleInteractions.length === 0) {
    return "No alternative approaches attempted";
  }

  // List unique alternative approaches
  const approaches = [...new Set(puzzleInteractions.map((msg) => msg.content))];

  return approaches.length > 0
    ? `Player tried ${approaches.length} alternative approaches: ${approaches
        .slice(0, 3)
        .join("; ")}${approaches.length > 3 ? "..." : ""}`
    : "No clear alternative approaches observed";
}

function getBreakthroughMoment(interactions: any[], puzzle: any) {
  // Find the message just before the successful solution
  const solutionMsg = interactions.find(
    (msg) =>
      msg.role === "user" &&
      msg.content?.toLowerCase().includes(puzzle.solution.toLowerCase())
  );

  if (!solutionMsg) return "No solution found";

  const solutionIndex = interactions.findIndex((msg) => msg === solutionMsg);
  if (solutionIndex <= 0)
    return "Immediate solution with no clear breakthrough moment";

  // Get the previous few messages
  const prevMessages = interactions
    .slice(Math.max(0, solutionIndex - 5), solutionIndex)
    .filter((msg) => msg.role === "assistant");

  if (prevMessages.length === 0)
    return "No clear breakthrough trigger identified";

  // Look for mentions of physical properties in the assistant messages
  const propertyMentions = prevMessages.some(
    (msg) =>
      msg.content?.toLowerCase().includes("shape") ||
      msg.content?.toLowerCase().includes("material") ||
      msg.content?.toLowerCase().includes("edge") ||
      msg.content?.toLowerCase().includes("surface") ||
      msg.content?.toLowerCase().includes("structure")
  );

  if (propertyMentions) {
    return "Player had a breakthrough after examining the object's physical properties";
  }

  // Check if there were environmental cues
  const environmentalCues = prevMessages.some(
    (msg) =>
      msg.content?.toLowerCase().includes("similar") ||
      msg.content?.toLowerCase().includes("example") ||
      msg.content?.toLowerCase().includes("notice") ||
      msg.content?.toLowerCase().includes("remember")
  );

  if (environmentalCues) {
    return "Player was likely influenced by environmental cues or examples";
  }

  return "Player showed a sudden shift in approach leading to the solution";
}

function getEnvironmentalPrimingResponse(interactions: any[], puzzles: any[]) {
  // Look for responses to environmental examples (variant B specific)
  const primingResponses = interactions.filter(
    (msg) =>
      msg.role === "user" &&
      msg.content?.toLowerCase().includes("like") &&
      (msg.content?.toLowerCase().includes("example") ||
        msg.content?.toLowerCase().includes("similar") ||
        msg.content?.toLowerCase().includes("same way"))
  );

  if (primingResponses.length === 0) {
    return "No explicit references to environmental examples observed";
  }

  const relevantPriming = primingResponses.length;

  return relevantPriming > 0
    ? `Player explicitly referenced environmental examples ${relevantPriming} times, showing influence from priming`
    : "Limited evidence of influence from environmental examples";
}

function getConceptualTransferEvidence(interactions: any[], puzzles: any[]) {
  // Check for transfer of concepts between puzzles
  let transferEvidence = "";
  let transferCount = 0;

  // Look at solution patterns across puzzles
  const solvedPuzzles = puzzles.filter((puzzle) =>
    interactions.some(
      (msg) =>
        msg.role === "user" &&
        msg.content?.toLowerCase().includes(puzzle.solution.toLowerCase())
    )
  );

  if (solvedPuzzles.length <= 1) {
    return "Insufficient data to assess conceptual transfer (fewer than 2 puzzles solved)";
  }

  // Check solution order and timing
  const puzzleSolutions = solvedPuzzles
    .map((puzzle) => {
      const solutionMsg = interactions.find(
        (msg) =>
          msg.role === "user" &&
          msg.content?.toLowerCase().includes(puzzle.solution.toLowerCase())
      );

      return {
        puzzle: puzzle.name,
        timestamp: solutionMsg?.timestamp || 0,
        solution: puzzle.solution,
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);

  if (puzzleSolutions.length >= 2) {
    // Check if time between solutions decreased
    const timeBetweenSolutions = [];
    for (let i = 1; i < puzzleSolutions.length; i++) {
      timeBetweenSolutions.push(
        puzzleSolutions[i].timestamp - puzzleSolutions[i - 1].timestamp
      );
    }

    const decreasingTime =
      timeBetweenSolutions.length >= 2 &&
      timeBetweenSolutions[timeBetweenSolutions.length - 1] <
        timeBetweenSolutions[0];

    if (decreasingTime) {
      transferEvidence +=
        "Decreasing time between puzzle solutions suggests growing transfer of repurposing concepts. ";
      transferCount++;
    }
  }

  return transferCount > 0
    ? transferEvidence
    : "Limited evidence of conceptual transfer between puzzles";
}

function assessEnvironmentalCueImpact(puzzleInteractions: any[]) {
  // Analyze the impact of environmental cues on puzzle solution time
  if (puzzleInteractions.filter((pi) => pi.solutionFound).length === 0) {
    return "No puzzles solved, cannot assess environmental cue impact";
  }

  const solvedPuzzles = puzzleInteractions.filter((pi) => pi.solutionFound);
  const averageAttempts =
    solvedPuzzles.reduce((sum, pi) => sum + pi.attemptCount, 0) /
    solvedPuzzles.length;

  if (averageAttempts < 3) {
    return "Low attempt count suggests environmental cues may have been effective in reducing functional fixedness";
  } else if (averageAttempts < 5) {
    return "Moderate attempt count indicates partial effectiveness of environmental cues";
  } else {
    return "High attempt count despite environmental cues suggests limited effectiveness in this participant";
  }
}

function identifyFixednessPatterns(interactions: any[], puzzles: any[]) {
  // Look for specific patterns indicating functional fixedness
  const patterns = [];

  // Check for repeated conventional use attempts
  puzzles.forEach((puzzle) => {
    const conventionalUses = interactions.filter(
      (msg) =>
        msg.role === "user" &&
        msg.content?.toLowerCase().includes("use") &&
        msg.content
          ?.toLowerCase()
          .includes(puzzle.fixedFunctionObject.toLowerCase()) &&
        !msg.content?.toLowerCase().includes(puzzle.solution.toLowerCase())
    );

    if (conventionalUses.length >= 3) {
      patterns.push(
        `Repeated conventional use attempts with ${puzzle.fixedFunctionObject}`
      );
    }
  });

  // Check for expressions of confusion or limitation
  const confusionMessages = interactions.filter(
    (msg) =>
      msg.role === "user" &&
      (msg.content?.toLowerCase().includes("can't use") ||
        msg.content?.toLowerCase().includes("doesn't work") ||
        msg.content?.toLowerCase().includes("won't work") ||
        msg.content?.toLowerCase().includes("how do i use") ||
        msg.content?.toLowerCase().includes("not working"))
  );

  if (confusionMessages.length > 0) {
    patterns.push(
      "Expressions of confusion or limitation when conventional uses failed"
    );
  }

  // Check for hesitation patterns
  const hesitationBeforeSolutions = puzzles.filter((puzzle) => {
    const solutionMsg = interactions.find(
      (msg) =>
        msg.role === "user" &&
        msg.content?.toLowerCase().includes(puzzle.solution.toLowerCase())
    );

    if (!solutionMsg) return false;

    const solutionIndex = interactions.findIndex((msg) => msg === solutionMsg);
    if (solutionIndex <= 0) return false;

    const preSolutionMsg = interactions[solutionIndex - 1];
    return preSolutionMsg?.metrics?.hesitations?.length > 0;
  });

  if (hesitationBeforeSolutions.length > 0) {
    patterns.push(
      "Hesitation immediately before arriving at unconventional solutions"
    );
  }

  return patterns.length > 0
    ? patterns.join("; ")
    : "No clear fixedness patterns identified";
}

function analyzeHesitationPatterns(puzzleInteractions: any[]) {
  // Analyze where and when hesitations occurred most
  const totalHesitationCount = puzzleInteractions.reduce(
    (sum, pi) => sum + pi.hesitationCount,
    0
  );

  if (totalHesitationCount === 0) {
    return "No significant hesitation patterns detected";
  }

  // Find puzzles with highest hesitation
  const highHesitationPuzzles = puzzleInteractions
    .filter((pi) => pi.hesitationCount > 0)
    .sort((a, b) => b.hesitationCount - a.hesitationCount);

  if (highHesitationPuzzles.length === 0) {
    return "No specific hesitation patterns detected";
  }

  const highestHesitationPuzzle = highHesitationPuzzles[0];

  return `Highest hesitation occurred with ${highestHesitationPuzzle.puzzle.name} (${highestHesitationPuzzle.hesitationCount} moments), suggesting this puzzle created the strongest functional fixedness effect`;
}

function comparePuzzleDifficulty(puzzleInteractions: any[]) {
  // Compare difficulty based on attempts and solution time
  if (puzzleInteractions.filter((pi) => pi.solutionFound).length === 0) {
    return "No puzzles solved, cannot compare difficulty";
  }

  // Rank puzzles by attempt count
  const puzzlesByAttempts = [...puzzleInteractions].sort(
    (a, b) => b.attemptCount - a.attemptCount
  );

  // Rank puzzles by solution time (if available)
  const solvedPuzzles = puzzleInteractions.filter(
    (pi) => pi.timeToSolution !== null
  );
  const puzzlesByTime =
    solvedPuzzles.length > 0
      ? [...solvedPuzzles].sort(
          (a, b) => (b.timeToSolution || 0) - (a.timeToSolution || 0)
        )
      : [];

  let difficultyAnalysis = "";

  if (puzzlesByAttempts.length > 0) {
    difficultyAnalysis += `Most attempt-intensive puzzle: "${puzzlesByAttempts[0].puzzle.name}" (${puzzlesByAttempts[0].attemptCount} attempts). `;
  }

  if (puzzlesByTime.length > 0) {
    difficultyAnalysis += `Most time-consuming puzzle: "${
      puzzlesByTime[0].puzzle.name
    }" (${Math.round(
      (puzzlesByTime[0].timeToSolution || 0) / 1000
    )} seconds). `;
  }

  return difficultyAnalysis || "Insufficient data to compare puzzle difficulty";
}

function assessFixednessEffectStrength(
  puzzleInteractions: any[],
  variant: string
) {
  // Evaluate how strongly functional fixedness affected the participant
  const solvedCount = puzzleInteractions.filter(
    (pi) => pi.solutionFound
  ).length;
  const totalPuzzles = puzzleInteractions.length;
  const averageAttempts =
    puzzleInteractions.reduce((sum, pi) => sum + pi.attemptCount, 0) /
    totalPuzzles;

  // Expected differences between variants
  const variantExpectation =
    variant === "A"
      ? "In control variant A, we expect moderate to high fixedness"
      : "In experimental variant B, we expect environmental cues to reduce fixedness";

  if (solvedCount === 0) {
    return `Very strong fixedness effect - no puzzles solved. ${variantExpectation}`;
  }

  const solutionRate = solvedCount / totalPuzzles;

  if (solutionRate < 0.5 || averageAttempts > 5) {
    return `Strong fixedness effect (${solvedCount}/${totalPuzzles} puzzles solved, avg ${averageAttempts.toFixed(
      1
    )} attempts). ${variantExpectation}`;
  } else if (solutionRate < 1.0 || averageAttempts > 3) {
    return `Moderate fixedness effect (${solvedCount}/${totalPuzzles} puzzles solved, avg ${averageAttempts.toFixed(
      1
    )} attempts). ${variantExpectation}`;
  } else {
    return `Mild fixedness effect (${solvedCount}/${totalPuzzles} puzzles solved, avg ${averageAttempts.toFixed(
      1
    )} attempts). ${variantExpectation}`;
  }
}

function assessPuzzleDesignQuality(puzzleInteractions: any[], puzzles: any[]) {
  // Evaluate the effectiveness of puzzles in testing functional fixedness
  const unsolvedPuzzles = puzzleInteractions.filter((pi) => !pi.solutionFound);
  const instantPuzzles = puzzleInteractions.filter(
    (pi) => pi.solutionFound && pi.attemptCount <= 1
  );
  const goodPuzzles = puzzleInteractions.filter(
    (pi) => pi.solutionFound && pi.attemptCount > 1
  );

  if (unsolvedPuzzles.length === puzzleInteractions.length) {
    return "Puzzles may be too difficult, as none were solved";
  }

  if (instantPuzzles.length === puzzleInteractions.length) {
    return "Puzzles may be too easy, as all were solved immediately";
  }

  let qualityAssessment = "";

  if (unsolvedPuzzles.length > 0) {
    qualityAssessment += `Potentially too difficult: "${unsolvedPuzzles
      .map((pi) => pi.puzzle.name)
      .join('", "')}". `;
  }

  if (instantPuzzles.length > 0) {
    qualityAssessment += `Potentially too obvious: "${instantPuzzles
      .map((pi) => pi.puzzle.name)
      .join('", "')}". `;
  }

  if (goodPuzzles.length > 0) {
    qualityAssessment += `Well-calibrated puzzles: "${goodPuzzles
      .map((pi) => pi.puzzle.name)
      .join('", "')}". `;
  }

  return (
    qualityAssessment || "Insufficient data to assess puzzle design quality"
  );
}

function suggestExperimentalImprovements(
  puzzleInteractions: any[],
  worldData: any,
  variant: string
) {
  // Suggest improvements based on observed patterns
  const suggestions = [];

  // Check for puzzles that were too easy
  const easyPuzzles = puzzleInteractions.filter(
    (pi) => pi.solutionFound && pi.attemptCount <= 1
  );
  if (easyPuzzles.length > 0) {
    suggestions.push(
      `Increase difficulty of "${easyPuzzles
        .map((pi) => pi.puzzle.name)
        .join('", "')}" by strengthening conventional context`
    );
  }

  // Check for puzzles that were too hard
  const hardPuzzles = puzzleInteractions.filter((pi) => !pi.solutionFound);
  if (hardPuzzles.length > 0) {
    suggestions.push(
      `Consider adding more subtle cues for "${hardPuzzles
        .map((pi) => pi.puzzle.name)
        .join('", "')}" puzzles`
    );
  }

  // Variant-specific suggestions
  if (variant === "B") {
    const lowInfluencedPuzzles = puzzleInteractions.filter(
      (pi) => pi.solutionFound && pi.conventionalUseCount > 2
    );

    if (lowInfluencedPuzzles.length > 0) {
      suggestions.push(
        `Strengthen environmental examples related to "${lowInfluencedPuzzles
          .map((pi) => pi.puzzle.name)
          .join('", "')}" puzzles`
      );
    }
  }

  // General improvements
  const averageHesitation =
    puzzleInteractions.reduce(
      (sum, pi) => sum + pi.averageHesitationDuration,
      0
    ) /
    Math.max(
      1,
      puzzleInteractions.filter((pi) => pi.hesitationCount > 0).length
    );

  if (averageHesitation > 1000) {
    suggestions.push(
      "Consider implementing real-time hesitation tracking to dynamically adjust difficulty"
    );
  }

  return suggestions.length > 0
    ? suggestions.join("; ")
    : "No specific improvement suggestions based on this session data";
}

function getOverallFixednessLevel(puzzleInteractions: any[]) {
  const solvedCount = puzzleInteractions.filter(
    (pi) => pi.solutionFound
  ).length;
  const totalPuzzles = puzzleInteractions.length;
  const averageAttempts =
    puzzleInteractions.reduce((sum, pi) => sum + pi.attemptCount, 0) /
    totalPuzzles;

  // Calculate conventional vs unconventional use ratio
  const conventionalUses = puzzleInteractions.reduce(
    (sum, pi) => sum + pi.conventionalUseCount,
    0
  );
  const unconventionalUses = puzzleInteractions.reduce(
    (sum, pi) => sum + (pi.attemptCount - pi.conventionalUseCount),
    0
  );
  const fixednessRatio = conventionalUses / Math.max(1, unconventionalUses);

  if (
    solvedCount / totalPuzzles < 0.5 ||
    averageAttempts > 5 ||
    fixednessRatio > 3
  ) {
    return "High";
  } else if (
    solvedCount / totalPuzzles < 0.8 ||
    averageAttempts > 3 ||
    fixednessRatio > 1.5
  ) {
    return "Moderate";
  } else {
    return "Low";
  }
}

function getKeyFindings(
  puzzleInteractions: any[],
  variant: string,
  interactions: any[]
) {
  // Generate key findings based on detailed analysis
  const solvedPuzzles = puzzleInteractions.filter((pi) => pi.solutionFound);
  const unsolvedPuzzles = puzzleInteractions.filter((pi) => !pi.solutionFound);

  // Calculate solve rate
  const solveRate =
    solvedPuzzles.length / Math.max(1, puzzleInteractions.length);

  // Calculate average attempts
  const avgAttempts =
    puzzleInteractions.reduce((sum, pi) => sum + pi.attemptCount, 0) /
    Math.max(1, puzzleInteractions.length);

  // Calculate average time to solution
  const avgTimeToSolution =
    solvedPuzzles.length > 0
      ? solvedPuzzles.reduce((sum, pi) => sum + (pi.timeToSolution || 0), 0) /
        solvedPuzzles.length
      : 0;

  let findings = "";

  if (variant === "A") {
    findings += `Control variant showed ${
      solveRate < 0.5 ? "strong" : solveRate < 0.8 ? "moderate" : "mild"
    } functional fixedness, with ${solvedPuzzles.length}/${
      puzzleInteractions.length
    } puzzles solved and avg ${avgAttempts.toFixed(1)} attempts per puzzle. `;

    if (solvedPuzzles.length > 0) {
      findings += `Average solution time of ${Math.round(
        avgTimeToSolution / 1000
      )} seconds indicates ${
        avgTimeToSolution > 180000 ? "significant" : "moderate"
      } difficulty overcoming functional fixedness. `;
    }
  } else {
    // For variant B, compare to expected control outcomes
    const expectedControlRate = 0.4; // Expected solve rate in control condition
    const expectedControlAttempts = 5; // Expected attempts in control condition

    if (
      solveRate > expectedControlRate &&
      avgAttempts < expectedControlAttempts
    ) {
      findings += `Environmental priming appears effective, with higher solve rate (${
        solvedPuzzles.length
      }/${
        puzzleInteractions.length
      }) and lower average attempts (${avgAttempts.toFixed(
        1
      )}) than typically seen in control conditions. `;
    } else {
      findings += `Limited evidence of priming effectiveness, with ${solvedPuzzles.length}/${puzzleInteractions.length} puzzles solved despite environmental examples. `;
    }

    // Check for explicit mentions of examples
    const exampleReferences = interactions.filter(
      (msg) =>
        msg.role === "user" &&
        (msg.content?.toLowerCase().includes("like the") ||
          msg.content?.toLowerCase().includes("similar to") ||
          msg.content?.toLowerCase().includes("same way as"))
    ).length;

    if (exampleReferences > 0) {
      findings += `Player explicitly referenced environmental examples ${exampleReferences} times, suggesting conscious transfer of concepts. `;
    }
  }

  return findings;
}

function getDunckerAlignmentAssessment(
  puzzleInteractions: any[],
  variant: string
) {
  // Assess alignment with Duncker's functional fixedness paradigm
  const solvedRate =
    puzzleInteractions.filter((pi) => pi.solutionFound).length /
    puzzleInteractions.length;
  const avgAttempts =
    puzzleInteractions.reduce((sum, pi) => sum + pi.attemptCount, 0) /
    puzzleInteractions.length;

  // Expected patterns based on Duncker's research
  const expectedVariantA =
    "In control condition (w.p.), participants typically solve fewer problems and require more attempts";
  const expectedVariantB =
    "In experimental condition (a.p.), participants typically struggle more after pre-utilizing objects conventionally";

  if (variant === "A") {
    if (solvedRate < 0.7) {
      return `Results strongly align with Duncker's control condition findings - showing functional fixedness with ${Math.round(
        solvedRate * 100
      )}% solve rate. ${expectedVariantA}`;
    } else {
      return `Results partially align with Duncker's paradigm, though solve rate (${Math.round(
        solvedRate * 100
      )}%) is higher than typical control findings. ${expectedVariantA}`;
    }
  } else {
    // For variant B, we need to assess if environmental examples helped overcome fixedness
    const conventionalUses = puzzleInteractions.reduce(
      (sum, pi) => sum + pi.conventionalUseCount,
      0
    );
    const unconventionalUses = puzzleInteractions.reduce(
      (sum, pi) => sum + (pi.attemptCount - pi.conventionalUseCount),
      0
    );

    if (conventionalUses > unconventionalUses * 2) {
      return `Results align strongly with Duncker's a.p. condition - despite environmental examples, player showed strong fixedness after using objects conventionally. ${expectedVariantB}`;
    } else {
      return `Results show more success than typical in Duncker's a.p. condition, suggesting environmental examples may have partially overcome fixedness. ${expectedVariantB}`;
    }
  }
}

function formatTimeDifference(startTime: number, endTime: number) {
  if (!startTime || !endTime) return "N/A";

  const diffMs = endTime - startTime;
  const minutes = Math.floor(diffMs / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);

  return `${minutes}m ${seconds}s`;
}
