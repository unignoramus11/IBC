# IBC Terminal: A Research Platform for Studying Functional Fixedness

## Table of Contents

- [IBC Terminal: A Research Platform for Studying Functional Fixedness](#ibc-terminal-a-research-platform-for-studying-functional-fixedness)
  - [Table of Contents](#table-of-contents)
  - [Executive Summary](#executive-summary)
  - [Project Purpose and Research Question](#project-purpose-and-research-question)
  - [Theoretical Background](#theoretical-background)
    - [Duncker's Paradigm](#dunckers-paradigm)
    - [Extensions in Our Implementation](#extensions-in-our-implementation)
    - [Relevant Literature](#relevant-literature)
  - [Technical Architecture](#technical-architecture)
    - [Core Technology Stack](#core-technology-stack)
    - [Key Components](#key-components)
  - [Experiment Design](#experiment-design)
    - [Puzzle Design Principles](#puzzle-design-principles)
    - [Worlds and Variants](#worlds-and-variants)
    - [Control vs. Experimental Variants](#control-vs-experimental-variants)
  - [Data Collection and Analysis](#data-collection-and-analysis)
    - [Interaction Metrics](#interaction-metrics)
    - [Session Analysis](#session-analysis)
    - [Analysis Capabilities](#analysis-capabilities)
  - [Technical Implementation Details](#technical-implementation-details)
    - [Device ID and World Allocation](#device-id-and-world-allocation)
    - [Data Collection Implementation](#data-collection-implementation)
    - [Gemini Integration and System Prompts](#gemini-integration-and-system-prompts)
  - [Research Implications](#research-implications)
    - [MongoDB Integration](#mongodb-integration)
  - [Setup and Installation](#setup-and-installation)
    - [Prerequisites](#prerequisites)
    - [Configuration](#configuration)
    - [Development Commands](#development-commands)
  - [Usage Guide](#usage-guide)
    - [Player Instructions](#player-instructions)
    - [Researcher Tools](#researcher-tools)
  - [Technical Advantages](#technical-advantages)
  - [Future Directions](#future-directions)
  - [References](#references)

## Executive Summary

IBC Terminal is a sophisticated web application designed as an experimental platform to investigate functional fixedness - a cognitive bias that limits people from recognizing alternative uses for objects beyond their traditional functions. The project implements a terminal-based interactive fiction game experience that presents users with puzzles requiring creative object use, while meticulously tracking user behavior and problem-solving approaches. The application serves as both an engaging game and a powerful research tool that systematically tests how contextual priming influences cognitive flexibility.

## Project Purpose and Research Question

The core research question driving this project is: "How does contextual priming affect participants' ability to overcome functional fixedness in problem-solving tasks?"

The application tests this by:

1. Randomly assigning participants to one of **seven** immersive adventure worlds (including two shorter variants)
2. Further randomizing participants into either a control (A) or experimental (B) variant within each world
3. Presenting both variants with identical puzzles requiring unconventional object use
4. In the experimental variant only, subtly exposing participants to examples of objects being used in non-traditional ways
5. Collecting comprehensive behavioral metrics to compare solution approaches between variants

This controlled experimental design allows researchers to quantify the impact of contextual priming on functional fixedness across diverse fictional environments.

## Theoretical Background

This project builds upon Karl Duncker's pioneering work on functional fixedness from the 1940s. Duncker demonstrated that when people use an object for its intended purpose, they have difficulty recognizing alternative uses for that same object within the same problem-solving context.

Key concepts that inform our experimental design:

### Duncker's Paradigm

- **Pre-utilization effect**: Objects previously used for their conventional function (Function 1) are more difficult to repurpose for an unconventional function (Function 2)
- **Two main conditions**:
  - **w.p. (without pre-utilization)**: The object has not yet been used in the current problem
  - **a.p. (after pre-utilization)**: The object has been used in the problem already, but for a different purpose

### Extensions in Our Implementation

1. **Environmental priming**: We extend Duncker's paradigm by adding environmental cues that demonstrate objects being used in unconventional ways (in variant B)
2. **High-resolution metrics**: Unlike the original studies, we capture detailed behavioral data including hesitation patterns, corrections, and temporal dynamics
3. **Narrative context**: We embed the functional fixedness challenges within coherent narratives that increase engagement while maintaining experimental control
4. **Automated analysis**: We leverage AI to identify patterns in behavior consistent with functional fixedness and its overcoming

### Relevant Literature

- Duncker, K. (1945). "On problem-solving." _Psychological Monographs_, 58(5)
- Adamson, R. E. (1952). "Functional fixedness as related to problem solving." _Journal of Experimental Psychology_, 44(4), 288-291
- McCaffrey, T. (2012). "Innovation relies on the obscure: A key to overcoming the classic functional fixedness problem." _Psychological Science_, 23(3), 215-218
- German, T. P., & Defeyter, M. A. (2000). "Immunity to functional fixedness in young children." _Psychonomic Bulletin & Review_, 7(4), 707-712

## Technical Architecture

### Core Technology Stack

The IBC Terminal is built using:

- **Next.js** (v15.3.1) with React (v19) and TypeScript for the frontend application
- **Tailwind CSS** (v4) for styling
- **MongoDB** (via `mongodb` driver v6.16.0) for persistent data storage and retrieval
- **Google Gemini API** (specifically `gemini-2.5-flash` via `@google/genai` v0.9.0) for dynamic content generation and natural language processing
- **Client-side persistence** via localStorage for session management and temporary data storage
- **Next.js API Routes** for serverless backend functionality
- **UUID** (v11.1.0) for generating persistent device identifiers
- **Vercel Analytics** (`@vercel/analytics` v1.5.0) for optional frontend usage tracking

### Key Components

1. **Terminal Interface** (`Terminal.tsx`, `CommandInput.tsx`, `ResponseDisplay.tsx`)

   - A minimalist, dark-themed terminal emulator
   - Command input with typewriter effect and history navigation
   - Response display with styled text output

2. **Device Identification & Allocation** (`deviceId.ts`, `worldAllocation.ts`)

   - Generates persistent unique identifiers (`uuid`) for each user device
   - Stores IDs in localStorage to maintain user identity across sessions
   - Deterministically allocates world (0-6) and variant (A/B) based on device ID hash

3. **Data Collection** (`dataCollection.ts`)

   - Tracks detailed user interaction metrics:
     - Keystroke timing and patterns
     - Command corrections and deletions
     - Hesitation duration and position
     - Command length and completion time
   - Temporarily stores metrics in localStorage
   - Uploads data to MongoDB via `/api/analytics/track` when session completes or periodically

4. **Natural Language Processing** (`gemini.ts`)

   - Integrates with Google's Gemini API (`gemini-2.5-flash`)
   - Provides contextually aware responses to user commands via `/api/command`
   - Generates world introductions via `/api/session/initialize`
   - Performs session analysis via `/api/session/analyze`
   - Maintains consistent in-world narrative and character using system prompts (`systemPrompts.ts`)

5. **Database Models** (`models/`)
   - Defines Mongoose schemas for `Session`, `Interaction`, and `WorldVariant` collections in MongoDB.

## Experiment Design

### Puzzle Design Principles

Each puzzle in the experimental environment follows specific design principles to ensure valid measurement of functional fixedness:

1. **Dual Functionality**: Each puzzle object has a clear conventional function (F₁) and a required unconventional function (F₂)
2. **Ecological Validity**: The unconventional use is physically plausible and makes sense within the narrative context
3. **Non-obviousness**: The solution requires creative thinking beyond the object's standard use
4. **Measurable Difficulty**: Puzzles are calibrated to be solvable but challenging enough to reveal functional fixedness
5. **Narrative Integration**: The puzzle is embedded naturally in the story rather than presented as an abstract challenge

Example puzzle structure from the Neo-Tokyo environment:

- **Object**: ID Chip
- **Conventional Function (F₁)**: Digital identification and access control
- **Unconventional Function (F₂)**: Metal contacts used to bridge an electrical circuit
- **Control Variant Context**: "The elevator is offline. Nearby, an electrical panel has its cover removed, showing several disconnected circuits. Your ID chip glints in the dim light."
- **Experimental Variant Context**: "The elevator is offline. Nearby, an electrical panel has its cover removed. You notice a maintenance worker across the hall using the metal contacts of their ID card to test electrical continuity between points. Your own ID chip glints in the dim light."

Each world contains two or three such puzzles, carefully designed to test different aspects of functional fixedness while maintaining narrative coherence.

### Worlds and Variants

The application implements **seven** distinct adventure worlds, each with unique themes, objectives, and puzzles (`src/config/worlds.ts`):

1. **Neo-Tokyo 2099**: A cyberpunk dystopia with broken technology
   - Puzzles: Datapad as wedge, ID chip as circuit bridge, bandage for fingerprint lifting
2. **Forgotten Castle**: A medieval fantasy realm with ancient magic
   - Puzzles: Dagger as key, shield as bridge, torch for revealing vents
3. **Chronos Station**: An abandoned space station with malfunctioning systems
   - Puzzles: Food tray as radiation deflector, access card as pry tool, holographic display for quantum auth
4. **Subterranean Nexus**: An underground network of caves and lost civilizations
   - Puzzles: Water bottle as lens, metal container as percussion instrument, notebook pages as structures
5. **Ethereal Planes**: A dreamlike dimension where reality is malleable
   - Puzzles: Mirror to reflect energy, emotion vial for memory capture, reality anchor for stabilization
6. **The Late Night Office (SHORT)**: Locked in an office after hours
   - Puzzles: Paperclip as hook, ruler for button pressing
7. **Server Room Glitch (SHORT)**: Trapped in a server room during a lockdown
   - Puzzles: Ethernet cable as jumper, CD-R as reflector

**Note:** Worlds 5 and 6 ("SHORT" variants) were designed as shorter experiences to accommodate potential time limitations during experiment conduction, allowing participants to complete a session more quickly while still engaging with functional fixedness puzzles.

Each world contains puzzles specifically designed to test functional fixedness, requiring users to utilize objects in unconventional ways.

### Control vs. Experimental Variants

The critical experimental manipulation occurs in how the world is presented to users:

- **Control Variant (A)**: Objects are presented in their traditional contexts only. For example, a datapad is described purely as a communication device, without hints to alternative uses.

- **Experimental Variant (B)**: Objects are subtly shown being used in unconventional ways similar to the required solutions. For example, users might observe "someone has jammed a thin smartpad under a door down the hallway to keep it from closing" before encountering a puzzle requiring the same solution.

The experiment tests whether these subtle contextual cues help participants overcome functional fixedness and solve puzzles more efficiently.

## Data Collection and Analysis

### Interaction Metrics

The system meticulously tracks and analyzes (`src/lib/dataCollection.ts`, `src/models/Interaction.ts`):

1. **Response Timing**:

   - Time between command prompt and submission (`inputDuration`)
   - Total interaction duration for each puzzle
   - First encounter to solution time for each puzzle (`timeToSolution` in SessionSummary)
   - Overall session duration

2. **Input Behavior**:

   - All keystrokes with millisecond timestamps (`keystrokes`)
   - Corrections (backspaces and deletions) (`corrections`)
   - Hesitations (pauses between typing > 1s) with duration and position (`hesitations`)
   - Command revisions before submission

3. **Problem-Solving Patterns**:

   - Command patterns and frequencies
   - Solution attempts categorized by approach (`isAttemptedSolution`, `isSolutionSuccess`)
   - Conventional vs. unconventional use attempts (inferred via AI analysis)
   - Correlation between variant exposure and solution times

4. **Session Information** (`src/models/Session.ts`):
   - Session duration and completion rates
   - World and variant allocation
   - Puzzle state (discovered, attempts, solved, timings)
   - Complete conversation history between user and AI (`conversationData`)

### Session Analysis

After each session completes, the system can generate a comprehensive analysis using the Gemini API (`/api/session/analyze`). This analysis includes:

1. **Functional Fixedness Assessment**:

   - Overall fixedness level (High/Moderate/Low)
   - Evidence of fixation on conventional object uses
   - Identification of insight moments
   - Problem-solving approach classification

2. **Puzzle-Specific Metrics**:

   - Solution time for each puzzle
   - Attempts before solution
   - Conventional vs. unconventional use attempts
   - Hesitation patterns during solution attempts
   - Alternative approaches tried

3. **Experimental Condition Effectiveness**:

   - For variant B: Assessment of environmental priming effectiveness
   - Evidence of conceptual transfer between puzzles
   - Impact of environmental cues on problem-solving

4. **Research Implications**:
   - Alignment with Duncker's paradigm expectations
   - Suggestions for experimental improvements
   - Comparative analysis of puzzle difficulty
   - Quality assessment of experimental design

The analysis is stored alongside the raw interaction data in MongoDB (`session_summaries` collection), providing researchers with both processed insights and access to the underlying data for custom analyses.

### Analysis Capabilities

The platform implements analytical functions that:

- Calculate average response times across different puzzle types
- Identify patterns in command attempts
- Measure hesitation duration and positions within commands
- Calculate correction rates and frequencies
- Compare solution approaches and times between variants (via MongoDB queries and `WorldVariant` aggregates)

## Technical Implementation Details

### Device ID and World Allocation

The `generateDeviceId` function (`src/lib/deviceId.ts`) creates a persistent identifier (UUID v4) stored in localStorage. The `allocateWorld` function (`src/lib/worldAllocation.ts`) uses a deterministic algorithm based on a hash of the device ID to assign world (0-6) and variant (A/B):

```typescript
// Simplified logic from worldAllocation.ts
const hash = simpleHash(deviceId);

// Allocate world ID (0-6) based on modulo 7
const worldId = hash % 7;

// Allocate variant (A or B) based on even/odd of the next digit in hash
const variant = Math.floor(hash / 7) % 2 === 0 ? "A" : "B";
```

This ensures a reasonably balanced distribution across experimental conditions while maintaining consistent assignment for returning users.

### Data Collection Implementation

The data collection infrastructure (`src/lib/dataCollection.ts`) captures rich interaction metrics:

```typescript
// Simplified structure from Interaction.ts
interface InteractionData {
  deviceId: string;
  sessionId: string;
  worldId: number;
  variant: "A" | "B";
  command: string;
  response?: string;
  timestamp: Date;
  metrics: {
    keystrokes: { key: string; timestamp: number }[];
    corrections: number;
    hesitations: { duration: number; position: number }[];
    inputDuration: number;
    commandLength: number;
  };
  puzzleContext?: {
    puzzleId: string;
    isAttemptedSolution: boolean;
    isSolutionSuccess: boolean;
    isConventionalUse: boolean;
  };
}
```

The system temporarily stores interactions in localStorage before uploading them to MongoDB via `/api/analytics/track` to ensure data is preserved even with intermittent connectivity.

### Gemini Integration and System Prompts

The application leverages Google's Gemini API (`gemini-2.5-flash`) with carefully crafted system prompts (`src/config/systemPrompts.ts`) that:

1. Establish the narrative framework for each world
2. Specify the variant-specific instructions (control or experimental)
3. Define the puzzles and their solutions
4. Guide the AI to maintain consistent narrative and character
5. Include strict rules to prevent markdown, fourth-wall breaks, or premature game ending.

A critical portion of the system prompt that implements the experimental manipulation:

```
VARIANT-SPECIFIC INSTRUCTION:
For variant ${variant}, you must ${variant === 'A'
    ? 'present objects in their traditional contexts and uses only. NEVER directly hint towards the solution object to the player. The player should find out which object to use and when themselves. DONOT mention the solution object again and again. Mention it once, and then again ONLY when the user ASKS about it.'
    : 'subtly show objects being used in unconventional ways (as needed for puzzles) without explicitly pointing out these uses as solutions. In the BEGINNING of the game, mention all the solution objects subtly being used in a way similar to the required way in the environment, SUBTLY.'}
```

This instruction ensures that the Gemini model provides the appropriate contextual priming consistent with the experimental condition.

## Research Implications

This application creates a unique opportunity to study functional fixedness in a controlled yet engaging environment. By comparing solution times, approaches, and success rates between control and experimental variants, researchers can:

1. Quantify the effect of contextual priming on overcoming functional fixedness
2. Identify which types of priming are most effective
3. Measure how different narrative contexts influence cognitive flexibility
4. Compare solution patterns across various demographic groups (if collected)

The rich interaction data collected provides insight not just into whether participants solve puzzles, but into their cognitive processes along the way, as evidenced by hesitation patterns, correction rates, and command sequences.

### MongoDB Integration

The application uses MongoDB (`src/lib/mongodb.ts`) to store rich experimental data in the `ibc-terminal` database:

1. **sessions Collection** (`src/models/Session.ts`):

   - Stores complete session information including participant world/variant assignment, start/end times.
   - Tracks session history with all commands and responses (`conversationData`).
   - Maintains puzzle state including discovery, attempts, solution status, and timings (`puzzles`).

2. **interactions Collection** (`src/models/Interaction.ts`):

   - Captures detailed interaction data with millisecond-level timing (`metrics`).
   - Stores keystroke patterns, hesitations, and corrections.
   - Links interactions to specific puzzles and solution attempts (`puzzleContext`).

3. **session_summaries Collection** (Implicitly created by `/api/analytics/track`):

   - Contains aggregated session metrics (duration, interaction count, completion status).
   - Stores AI-generated functional fixedness analysis (`functionalFixednessAnalysis`).
   - Provides quick access to experiment outcomes.

4. **worldVariants Collection** (`src/models/WorldVariant.ts`):
   - Stores aggregated statistics for each world/variant combination (user count, average duration, puzzle solve rates, etc.).

The database schema is designed for both immediate experimental insight and long-term research data preservation.

```javascript
// Simplified MongoDB schema example (Session Summary)
{
  _id: ObjectId("..."),
  deviceId: "user-xyz-123",
  sessionId: "session-abc-456",
  worldId: 2,
  variant: "B",
  startTime: ISODate("2025-04-26T12:34:56Z"),
  endTime: ISODate("2025-04-26T13:15:22Z"),
  totalInteractions: 45,
  completed: true,
  puzzleSummaries: [
    {
      puzzleId: "radiation-barrier",
      attemptCount: 3,
      timeToSolutionMs: 245000, // 4m 5s
      solved: true,
      firstInteractionTime: ISODate("..."),
      solutionTime: ISODate("...")
    }
    // ... other puzzles
  ],
  functionalFixednessAnalysis: "Detailed AI analysis...",
  functionalFixednessMetrics: {
    overallFixednessLevel: "Moderate",
    insightMomentsObserved: 2,
    // ... additional metrics
  }
}
```

## Setup and Installation

### Prerequisites

- Node.js 18.x or later (Project uses v20+)
- npm or yarn
- MongoDB (local instance or MongoDB Atlas connection string)
- Google API Key with access to Gemini models (specifically `gemini-2.5-flash`)

### Configuration

1. Clone the repository: `git clone <repository-url>`
2. Navigate to the `ibc-terminal` directory: `cd ibc-terminal`
3. Create a `.env.local` file in the `ibc-terminal` directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_google_api_key
   ```
4. Install dependencies:
   ```bash
   npm install
   # or
   # yarn install
   ```

### Development Commands

```bash
# Run development server with hot reloading (using Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Usage Guide

### Player Instructions

Players interact with the terminal interface using text commands. The primary commands include:

- `look` / `look around` - Examine the current environment
- `examine [object]` - Investigate a specific item in detail
- `inventory` / `inv` - View currently held items
- `use [object]` - Attempt to use an object conventionally
- `use [object] as [function]` / `use [object] to [action]` - Attempt to use an object in a specific way (essential for puzzles)
- `take [object]` / `get [object]` - Pick up an object
- `go [direction]` / `move [direction]` - Move in a specific direction (e.g., `go north`)
- `help` - Display available commands
- `exit` / `quit` - End the current session

The game narrator (Gemini AI) responds to commands with narrative descriptions and feedback based on the game world and puzzle context.

### Researcher Tools

Researchers can access collected data through:

1. **MongoDB Direct Access**:

   - Connect to the MongoDB database (specified in `MONGODB_URI`) using tools like MongoDB Compass or `mongosh`.
   - Query the `sessions`, `interactions`, `session_summaries`, and `worldVariants` collections in the `ibc-terminal` database.

2. **Data Export Utilities** (Manual/External):

   - Use MongoDB export tools (`mongoexport`) or custom scripts to export data in JSON/CSV formats.
   - Generate comparative reports across participants using external analysis tools (e.g., Python with Pandas, R).

3. **Analysis Dashboard** (Future Development):
   - Potential for a dedicated web interface for real-time visualization of experiment progress, statistical comparisons, and report generation.

## Technical Advantages

The IBC Terminal offers several technical advantages as a research platform:

1. **Scalability**: The web-based implementation allows for large-scale data collection without geographical limitations.
2. **Engagement**: The immersive narrative format maintains participant interest beyond traditional laboratory tasks.
3. **Ecological Validity**: The problem-solving tasks are contextualized within coherent narratives.
4. **Data Richness**: The keystroke-level tracking provides unprecedented granularity in behavior analysis.
5. **Experimental Control**: The automated variant assignment ensures proper randomization across conditions.
6. **Real-time Analysis**: AI-powered session analysis provides immediate research insights.
7. **Extensibility**: Modular design allows for addition of new worlds, puzzles, and experimental conditions.

## Future Directions

Potential extensions of this research platform include:

1. **Multilingual Support**: Implementing the experiment in multiple languages to study cultural variations in functional fixedness.
2. **Enhanced Analytics**: Developing more sophisticated analysis tools for pattern recognition in problem-solving approaches and integrating a researcher dashboard.
3. **Additional Experimental Conditions**: Testing different types and intensities of contextual priming or other cognitive interventions.
4. **Integration with Eye-Tracking**: Adding support for webcam-based eye tracking to study visual attention during problem-solving.
5. **Longitudinal Studies**: Implementing features to track returning participants over time to measure learning effects.
6. **Cross-Cultural Research**: Expanding to international participants to study cultural variations in functional fixedness.
7. **Alternate Cognitive Biases**: Extending the platform to study other cognitive biases beyond functional fixedness.

## References

1. Duncker, K. (1945). On problem-solving. _Psychological Monographs_, 58(5).
2. Adamson, R. E. (1952). Functional fixedness as related to problem solving. _Journal of Experimental Psychology_, 44(4), 288-291.
3. German, T. P., & Defeyter, M. A. (2000). Immunity to functional fixedness in young children. _Psychonomic Bulletin & Review_, 7(4), 707-712.
4. McCaffrey, T. (2012). Innovation relies on the obscure: A key to overcoming the classic functional fixedness problem. _Psychological Science_, 23(3), 215-218.
5. Chrysikou, E. G., & Weisberg, R. W. (2005). Following the wrong footsteps: Fixation effects of pictorial examples in a design problem-solving task. _Journal of Experimental Psychology: Learning, Memory, and Cognition_, 31(5), 1134-1148.
6. Ford, S., & Aggarwal, I. (2022). Creative problem solving: The role of examples, fixation, and incubation. _Annual Review of Psychology_, 73, 373-399.
