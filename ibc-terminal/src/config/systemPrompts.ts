/**
 * systemPrompts.ts
 * ----------------
 * Provides prompt generation and session analysis utilities for the IBC Terminal research platform.
 * Used to generate world- and variant-specific system prompts for the AI, and to create detailed research analyses of user sessions.
 */

import {
  getWorldConfig,
  WorldDefinition,
  Puzzle as PuzzleDefinition,
} from "../config/worlds.config"; // Use new config file and structure name

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
  const worldData: WorldDefinition = getWorldConfig(worldId); // Use new function and type

  // --- Helper to format inventory items ---
  const formatInventory = (
    items: { name: string; description: string }[]
  ): string => {
    if (!items || items.length === 0) return "nothing.";
    return items
      .map((item) => `"${item.name}" (${item.description})`)
      .join(", ");
  };

  // --- Helper to format puzzles ---
  const formatPuzzles = (puzzles: PuzzleDefinition[]): string => {
    return puzzles
      .map(
        (puzzle) => `
- Puzzle: "${puzzle.name}"
  Objective: ${puzzle.objective}
  Scene: ${puzzle.sceneDescription}
  Fixed Function Object: "${puzzle.fixedFunctionObject.name}" (${puzzle.fixedFunctionObject.description})
  Solution requires unconventional use: ${puzzle.solutionNarrative}
  Narrative Justification: ${puzzle.narrativeJustification}
  Control Hint: ${puzzle.controlVariantHint}
  Experimental Hint: ${puzzle.experimentalVariantHint}

  TRACKING INSTRUCTIONS:
  - Silently track ANY attempt that could be considered a solution attempt (keep a mental count).
  - Note all alternative solutions they try before discovering the intended solution.
  - Observe if they express confusion or fixation on the conventional use of "${puzzle.fixedFunctionObject.name}".
  - Record the moment of insight when they solve the puzzle, and what triggered this insight.
  - Pay special attention to whether they mention the object's primary function as an obstacle.
`
      )
      .join("\n");
  };

  // --- Build the System Prompt ---
  return `CORE ROLE: You are an AI Game Master running an immersive, interactive text adventure game. This game is part of a research experiment studying functional fixedness, based on Karl Duncker's work. Your primary goal is to provide an engaging narrative experience while adhering strictly to the experiment's parameters for the assigned world and variant.

WORLD CONTEXT:
- World Name: "${worldData.name}"
- Setting: ${worldData.worldSetting}
- Atmosphere: ${worldData.atmosphere}
- Narration Tone: ${worldData.toneOfNarration}

PLAYER CONTEXT:
- Character Assignment: You are narrating the experiences of ${
    worldData.character.name
  }, the ${
    worldData.character.titleOrRole
  }. Refer to the player using this character name (e.g., "You, ${
    worldData.character.name
  }, see...").
- Character Details: Keep ${worldData.character.name}'s profile in mind (${
    worldData.character.personalityTraits
  }; ${worldData.character.quirksAndHabits}).
- Player Knowledge: Assume the player starts with ZERO knowledge of this world, its characters, or its mechanics. Introduce everything naturally through description.
- Starting Inventory: The player begins carrying: ${formatInventory(
    worldData.startingInventory
  )}.

GAME MECHANICS & RULES:
- Game Focus: This is solely the "${
    worldData.name
  }" adventure. Do NOT offer other games or settings.
- Style: Classic text adventure (look, examine, inventory, go, etc.), but responses should be narrative and descriptive, not just lists.
- Core Objective: ${
    worldData.mainObjectives[0]
  } (Reveal others as the plot progresses).
- Player Guidance: If the player seems stuck or types "help", suggest these commands as an unordered list: look [around/object/area], examine [object/area], inventory, go [direction], whoami, status, origin. Also mention they can try describing actions like 'try to pry open the door with the crowbar'. Use this only as action example, nothing else.
- 'Use' Command: Do NOT accept simple commands like 'use [object]'. Prompt the player for HOW they want to use it (e.g., "How do you want to use the crowbar?"). Describe outcomes based on their specific action and world physics/logic.
- Puzzle Solving: All puzzles MUST be solved by the player through creative use of objects as intended in the puzzle definitions below. Do NOT give away solutions or overly direct hints. Subtle environmental clues based on the variant are allowed. The game cannot be completed until all puzzles are solved.
- Ending the Game: Once all main objectives and puzzles are completed, prompt the player to type "EXIT" to conclude the session.

NARRATIVE STYLE GUIDELINES:
- Immersion: Maintain character as the narrator. NO meta-commentary, fourth-wall breaks, or acknowledgement of experiment mechanics.
- Description: Provide rich, multi-sensory details (sights, sounds, smells, textures) for locations and objects. Use the defined \`toneOfNarration\`.
- Pacing & Length: Keep individual responses concise, engaging, and generally under 150 words to maintain player interest. Avoid large walls of text.
- Engagement: Be creative! Use poetic language, metaphors, humor, and occasional short, relevant poems or rhymes (wrapped in <POEM></POEM> tags) to enhance the atmosphere and character voice. You can gently tease or taunt the player character (e.g., Pip or Brenda) in character.
- Player Agency: Describe the results of the player's (character's) actions. End most responses with a description of the current state and a prompt for further action
(e.g., "What do you do now?", "How do you wish to proceed?", etc. generate more). Offer generic options if they seem stuck (e.g., "You could examine your surroundings more closely, check your inventory, or try moving in a different direction.").

WORLD DETAILS FOR NARRATION:
- Key Plot Points (Reveal Gradually):
${worldData.plotPoints
  .map((point, index) => `  ${index + 1}. ${point}`)
  .join("\n")}
- Key Locations:
${worldData.keyLocations
  .map((loc) => `  - ${loc.name}: ${loc.description}`)
  .join("\n")}

FUNCTIONAL FIXEDNESS EXPERIMENT - VARIANT ${variant}:
This experiment tests how players overcome functional fixedness. Adhere strictly to the instructions for Variant ${variant}.

${
  variant === "A"
    ? `CONTROL VARIANT (A) INSTRUCTIONS:
  - Presentation: Introduce puzzle objects emphasizing their CONVENTIONAL function and context (Duncker's w.p. - without pre-utilization).
  - Hints: Provide NO hints or examples related to unconventional object uses. Let the player discover alternative uses solely through experimentation.
  - Descriptions: Focus descriptions on standard uses and properties.
  - Goal: Establish a baseline measure of functional fixedness without priming.`
    : `EXPERIMENTAL VARIANT (B) INSTRUCTIONS:
  - Presentation: Implement Duncker's a.p. (after pre-utilization) condition.
    1. Introduce key puzzle objects (${worldData.puzzles
      .map((p) => `"${p.fixedFunctionObject.name}"`)
      .join(", ")}) first in their CONVENTIONAL context.
    2. Ensure the player USES the object for its NORMAL function (e.g., uses the datapad for info before using it as a wedge).
    3. ONLY THEN present the puzzle requiring the object's UNCONVENTIONAL use.
  - Priming: Subtly weave 2-3 examples of OTHER objects being used unconventionally into environmental descriptions (use the \`experimentalVariantHint\` from puzzle definitions as inspiration, or the examples below). These examples should be ANALOGOUS to the puzzle solutions but NOT direct spoilers.
  - Example Priming Scenarios (Use similar ideas, tailored to the world):
    * An NPC using a tool handle as a lever.
    * An object normally used for containing liquid being used to focus light.
    * A flat object used as a makeshift bridge or platform.
    * A decorative item used to manipulate a small mechanism.
    * A communication device used as a physical tool.
  - Descriptions: Describe physical properties (shape, material, rigidity, reflectivity) that hint at alternative uses without explicitly stating them.
  - Goal: Test if subtle priming and the a.p. condition influence the player's ability to overcome fixedness.`
}

PUZZLE DETAILS & TRACKING FRAMEWORK:
${formatPuzzles(worldData.puzzles)}

INITIAL RESPONSE REQUIREMENT: Your VERY FIRST message must:
1. Use the correct variant's introduction string: "${
    variant === "A"
      ? worldData.controlVariantIntro
      : worldData.experimentalVariantIntro
  }"
2. Vividly describe the starting scene based on the world setting and key locations.
3. Clearly establish the player character's identity (${
    worldData.character.name
  }) and immediate situation.
4. Introduce the starting inventory naturally within the description or narrative.
5. Hint at the first main objective or immediate problem.
6. End by prompting the player character for their first action.
7. Strictly adhere to all narrative style guidelines (tone, length, no meta-commentary).
`;
};

// --- Session Analysis Function (Updated Structure References) ---

// Import necessary types from worlds.config.ts if they are not defined locally
// import { WorldDefinition, Puzzle as PuzzleDefinition, Item as ItemDefinition } from "../config/worlds.config";

// Assuming helper functions from the previous response are available here...
// (getFixationLevel, getInsightMoments, getProblemSolvingApproach, etc.)
// They primarily operate on the interaction history and puzzle structure,
// so core logic remains similar, but ensure references to puzzle/object names are correct.

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
  messages: any[] // Consider defining a proper type for messages including metrics
): string => {
  const worldData: WorldDefinition = getWorldConfig(worldId); // Use updated function and type

  const interactions = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp || Date.now(),
    metrics: msg.metrics || {},
  }));

  const puzzleInteractions = worldData.puzzles.map(
    (puzzle: PuzzleDefinition) => {
      // Use imported/defined type
      // Ensure filtering uses the correct object name structure
      const fixedObjectName = puzzle.fixedFunctionObject.name.toLowerCase();
      const solutionIdentifier = puzzle.solutionNarrative.toLowerCase(); // Use narrative as identifier if unique enough, or add dedicated field

      const relevantMessages = interactions.filter(
        (msg) =>
          msg.content?.toLowerCase().includes(fixedObjectName) ||
          msg.content?.toLowerCase().includes(solutionIdentifier) // Adjust if needed
      );

      const solutionMessage = relevantMessages.find(
        (msg) =>
          msg.role === "user" &&
          msg.content?.toLowerCase().includes(solutionIdentifier) // Adjust if needed
      );

      const attemptedSolutions = relevantMessages.filter(
        (msg) =>
          msg.role === "user" &&
          msg.content?.toLowerCase().includes("use") && // Or based on action description
          msg.content?.toLowerCase().includes(fixedObjectName)
      );

      // --- Recalculate conventional vs unconventional attempts based on your logic ---
      // This part is tricky without knowing exactly how solutions are identified in messages.
      // Assuming solutionIdentifier marks the unconventional use attempt:
      const unconventionalAttempts = attemptedSolutions.filter((msg) =>
        msg.content?.toLowerCase().includes(solutionIdentifier)
      ).length;
      const conventionalUseAttempts =
        attemptedSolutions.length - unconventionalAttempts;
      // ---

      const hesitationMoments = relevantMessages.filter(
        (msg) =>
          msg.role === "user" &&
          msg.metrics?.hesitations?.length > 0 &&
          msg.content?.toLowerCase().includes(fixedObjectName)
      );

      // Calculate average hesitation (ensure metrics exist)
      const totalHesitationDuration = hesitationMoments.reduce(
        (sum: number, msg: any) => {
          return (
            sum +
            (msg.metrics?.hesitations?.reduce(
              (s: number, h: any) => s + (h.duration || 0),
              0
            ) || 0)
          );
        },
        0
      );
      const averageHesitation =
        hesitationMoments.length > 0
          ? totalHesitationDuration / hesitationMoments.length
          : 0;

      return {
        puzzle, // Full puzzle definition
        relevantMessages,
        solutionFound: !!solutionMessage,
        solutionMessage,
        attemptCount: attemptedSolutions.length, // Total attempts using the object
        conventionalUseCount: conventionalUseAttempts, // Attempts NOT matching solution narrative
        unconventionalUseCount: unconventionalAttempts, // Attempts matching solution narrative
        hesitationCount: hesitationMoments.length,
        averageHesitationDuration: averageHesitation,
        firstMention: relevantMessages[0]?.timestamp,
        solutionTime: solutionMessage?.timestamp,
        timeToSolution:
          solutionMessage && relevantMessages[0]
            ? solutionMessage.timestamp - relevantMessages[0].timestamp
            : null,
      };
    }
  );

  // --- Call helper analysis functions (assuming they are updated for new structure) ---
  // const fixednessIndicators = getFixationLevel(interactions, worldData.puzzles);
  // ... other helper function calls ...

  // --- Construct the final analysis string ---
  // Ensure all references to worldData and puzzleInteraction fields use the new structure
  // Example adjustment:
  // Instead of: pi.puzzle.fixedFunctionObject
  // Use: pi.puzzle.fixedFunctionObject.name
  // Instead of: pi.puzzle.solution
  // Use: pi.puzzle.solutionNarrative (or a more specific solution keyword if added)

  // NOTE: The analysis string construction needs careful updating
  // based on the exact output desired and how helper functions are adapted.
  // The example below shows how to access the fields, but the full string needs review.

  return `
FUNCTIONAL FIXEDNESS RESEARCH ANALYSIS
World: ${worldData.name} (ID: ${worldData.id})
Variant: ${variant === "A" ? "Control (A)" : "Experimental (B)"}
Player Character: ${worldData.character.name}
Total Interactions: ${interactions.filter((msg) => msg.role === "user").length}
Total Duration: ${formatTimeDifference(
    interactions[0]?.timestamp,
    interactions[interactions.length - 1]?.timestamp
  )}

INDIVIDUAL PUZZLE PERFORMANCE:
${puzzleInteractions
  .map(
    (pi) => `
Puzzle: "${pi.puzzle.name}" (ID: ${pi.puzzle.id})
- Fixed Object: "${pi.puzzle.fixedFunctionObject.name}"
- Unconventional Use Required: ${pi.puzzle.solutionNarrative}
- Solution Found: ${pi.solutionFound ? "Yes" : "No"}
- Time to Solution: ${
      formatTimeDifference(pi.firstMention, pi.solutionTime) || "N/A"
    }
- Conventional Use Attempts: ${pi.conventionalUseCount}
- Unconventional Use Attempts (leading to solution): ${
      pi.unconventionalUseCount
    }
- Total Attempts with Object: ${pi.attemptCount}
- Hesitation Moments: ${
      pi.hesitationCount
    } (${pi.averageHesitationDuration.toFixed(0)}ms avg)
- Alternative Approaches Tried: ${getAlternativeApproaches(
      interactions,
      pi.puzzle
    )}
- Breakthrough Observation: ${
      pi.solutionFound ? getBreakthroughMoment(interactions, pi.puzzle) : "N/A"
    }
`
  )
  .join("\n")}

OVERALL ASSESSMENT:
${
  /* Add calls to updated helper functions here to generate summary metrics */ ""
}
- Functional Fixedness Level: ${getOverallFixednessLevel(puzzleInteractions)}
- Notable Fixedness Patterns: ${identifyFixednessPatterns(
    interactions,
    worldData.puzzles
  )}
${
  variant === "B"
    ? `- Priming Influence: ${getEnvironmentalPrimingResponse(
        interactions,
        worldData.puzzles
      )}`
    : ""
}
- Alignment with Duncker: ${getDunckerAlignmentAssessment(
    puzzleInteractions,
    variant
  )}
- Suggestions: ${suggestExperimentalImprovements(
    puzzleInteractions,
    worldData,
    variant
  )}

(Analysis based on interaction patterns)
`;
};

// --- Helper Function Stubs (Implement or adapt from previous version) ---

// Add implementations for all helper functions used in generateSessionAnalysis
// Ensure they correctly access fields from the new WorldDefinition structure
function formatTimeDifference(
  startTime: number | undefined,
  endTime: number | undefined
): string {
  if (!startTime || !endTime || endTime < startTime) return "N/A";
  const diffMs = endTime - startTime;
  const minutes = Math.floor(diffMs / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

function getAlternativeApproaches(
  interactions: any[],
  puzzle: PuzzleDefinition
): string {
  // Filter messages where the user tried to use the fixed object in a way that doesn't match the solution narrative
  const fixedObjectNameLower = puzzle.fixedFunctionObject.name.toLowerCase();
  const solutionNarrativeLower = puzzle.solutionNarrative.toLowerCase(); // Or a more specific keyword if available

  const alternativeAttempts = interactions.filter(
    (msg) =>
      msg.role === "user" &&
      msg.content?.toLowerCase().includes("use") && // Or better action detection
      msg.content?.toLowerCase().includes(fixedObjectNameLower) &&
      !msg.content?.toLowerCase().includes(solutionNarrativeLower) // Check if it's NOT the solution attempt
  );

  const uniqueAttempts = [
    ...new Set(alternativeAttempts.map((msg) => msg.content)),
  ];

  if (uniqueAttempts.length === 0) return "None observed";
  return `${uniqueAttempts.length} distinct approaches: ${uniqueAttempts
    .slice(0, 3)
    .join("; ")}${uniqueAttempts.length > 3 ? "..." : ""}`;
}

function getBreakthroughMoment(
  interactions: any[],
  puzzle: PuzzleDefinition
): string {
  // Find the message just before the successful solution
  const solutionIdentifier = puzzle.solutionNarrative.toLowerCase(); // Adjust if needed
  const solutionMsgIndex = interactions.findIndex(
    (msg) =>
      msg.role === "user" &&
      msg.content?.toLowerCase().includes(solutionIdentifier)
  );

  if (solutionMsgIndex <= 0) return "Immediate solution or not found";

  const precedingAssistantMsgs = interactions
    .slice(Math.max(0, solutionMsgIndex - 3), solutionMsgIndex) // Look at last few AI messages
    .filter((msg) => msg.role === "assistant" || msg.role === "model"); // Check assistant/model roles

  if (precedingAssistantMsgs.length === 0)
    return "No clear trigger in preceding messages";

  // Simple check for hints (customize based on actual hints)
  const hinted = precedingAssistantMsgs.some(
    (msg) =>
      msg.content
        ?.toLowerCase()
        .includes(puzzle.fixedFunctionObject.name.toLowerCase()) &&
      (msg.content?.toLowerCase().includes("shape") ||
        msg.content?.toLowerCase().includes("material") ||
        msg.content?.toLowerCase().includes("try thinking about") ||
        msg.content?.toLowerCase().includes("what else could"))
  );

  if (hinted)
    return "Likely triggered by AI hint emphasizing object properties or alternative uses.";

  // Check if player examined the object just before
  const precedingUserMsgs = interactions
    .slice(Math.max(0, solutionMsgIndex - 2), solutionMsgIndex)
    .filter((msg) => msg.role === "user");
  const examinedObject = precedingUserMsgs.some(
    (msg) =>
      msg.content?.toLowerCase().startsWith("examine") &&
      msg.content
        ?.toLowerCase()
        .includes(puzzle.fixedFunctionObject.name.toLowerCase())
  );

  if (examinedObject) return "Possibly triggered after examining the object.";

  return "Sudden shift in player strategy observed.";
}

function getOverallFixednessLevel(puzzleInteractions: any[]): string {
  if (puzzleInteractions.length === 0) return "N/A";
  const solvedCount = puzzleInteractions.filter(
    (pi) => pi.solutionFound
  ).length;
  const totalPuzzles = puzzleInteractions.length;
  const avgAttempts =
    puzzleInteractions.reduce((sum, pi) => sum + pi.attemptCount, 0) /
    totalPuzzles;

  if (solvedCount / totalPuzzles < 0.5 || avgAttempts > 5) return "High";
  if (solvedCount / totalPuzzles < 0.8 || avgAttempts > 3) return "Moderate";
  return "Low";
}

function identifyFixednessPatterns(
  interactions: any[],
  puzzles: PuzzleDefinition[]
): string {
  const patterns = [];
  puzzles.forEach((puzzle) => {
    const fixedObjectNameLower = puzzle.fixedFunctionObject.name.toLowerCase();
    const solutionIdentifier = puzzle.solutionNarrative.toLowerCase(); // Adjust if needed

    const conventionalAttempts = interactions.filter(
      (msg) =>
        msg.role === "user" &&
        msg.content?.toLowerCase().includes("use") &&
        msg.content?.toLowerCase().includes(fixedObjectNameLower) &&
        !msg.content?.toLowerCase().includes(solutionIdentifier)
    ).length;

    if (conventionalAttempts >= 3) {
      patterns.push(
        `Repeated conventional use of ${puzzle.fixedFunctionObject.name}`
      );
    }
  });
  const confusionExpr = interactions.filter(
    (msg) =>
      msg.role === "user" &&
      /(can't use|doesn't work|how do i|stuck|not working)/i.test(
        msg.content || ""
      )
  ).length;
  if (confusionExpr > 1) patterns.push("Expressed confusion/stuck");

  return patterns.length > 0
    ? patterns.join("; ")
    : "No specific patterns identified";
}

function getEnvironmentalPrimingResponse(
  interactions: any[],
  puzzles: PuzzleDefinition[]
): string {
  const primingReferences = interactions.filter(
    (msg) =>
      msg.role === "user" &&
      /(like the|similar to|saw.*using|remember seeing)/i.test(
        msg.content || ""
      )
  ).length;
  return primingReferences > 0
    ? `Player referenced environmental examples ${primingReferences} times.`
    : "No clear reference to environmental examples.";
}

function getDunckerAlignmentAssessment(
  puzzleInteractions: any[],
  variant: string
): string {
  if (puzzleInteractions.length === 0) return "N/A";
  const solvedRate =
    puzzleInteractions.filter((pi) => pi.solutionFound).length /
    puzzleInteractions.length;
  const avgAttempts =
    puzzleInteractions.reduce((sum, pi) => sum + pi.attemptCount, 0) /
    puzzleInteractions.length;

  if (variant === "A") {
    return solvedRate < 0.7
      ? `Aligns with Duncker's w.p. condition (fixedness observed, ${Math.round(
          solvedRate * 100
        )}% solve rate).`
      : `Partially aligns; higher solve rate (${Math.round(
          solvedRate * 100
        )}%) than typical w.p.`;
  } else {
    // Variant B
    const conventionalUses = puzzleInteractions.reduce(
      (sum, pi) => sum + pi.conventionalUseCount,
      0
    );
    const unconventionalUses = puzzleInteractions.reduce(
      (sum, pi) => sum + pi.unconventionalUseCount,
      0
    );
    return conventionalUses > unconventionalUses * 1.5
      ? `Aligns with Duncker's a.p. condition (struggle after conventional use observed).`
      : `Suggests priming may have reduced a.p. effect.`;
  }
}

function suggestExperimentalImprovements(
  puzzleInteractions: any[],
  worldData: WorldDefinition,
  variant: string
): string {
  const suggestions = [];
  const easyPuzzles = puzzleInteractions
    .filter((pi) => pi.solutionFound && pi.attemptCount <= 1)
    .map((pi) => pi.puzzle.name);
  const hardPuzzles = puzzleInteractions
    .filter((pi) => !pi.solutionFound)
    .map((pi) => pi.puzzle.name);

  if (easyPuzzles.length > puzzleInteractions.length * 0.5)
    suggestions.push(
      `Increase difficulty/subtlety for puzzles: ${easyPuzzles.join(", ")}.`
    );
  if (hardPuzzles.length > puzzleInteractions.length * 0.5)
    suggestions.push(
      `Consider adding clearer hints or simplifying puzzles: ${hardPuzzles.join(
        ", "
      )}.`
    );
  if (
    variant === "B" &&
    getEnvironmentalPrimingResponse(
      puzzleInteractions.flatMap((pi) => pi.relevantMessages),
      worldData.puzzles
    ).includes("No clear reference")
  ) {
    suggestions.push(
      "Strengthen or increase visibility of environmental priming examples."
    );
  }
  return suggestions.length > 0
    ? suggestions.join(" ")
    : "Current design seems reasonably balanced for this session.";
}

// Old helper functions for analysis generation
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
