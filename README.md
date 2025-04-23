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

1. Randomly assigning participants to one of five immersive adventure worlds
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

- **Next.js** with React and TypeScript for the frontend application
- **MongoDB** for persistent data storage and retrieval
- **Gemini 2.5 API** for dynamic content generation and natural language processing
- **Client-side persistence** via localStorage for session management
- **API Routes** for serverless backend functionality

### Key Components

1. **Terminal Interface** (`Terminal.tsx`, `CommandInput.tsx`, `ResponseDisplay.tsx`)

   - A minimalist, dark-themed terminal emulator
   - Command input with typewriter effect and history navigation
   - Response display with styled text output

2. **Device Identification** (`deviceId.ts`)

   - Generates persistent unique identifiers for each user device
   - Stores IDs in localStorage to maintain user identity across sessions
   - Deterministically allocates world and variant based on device ID

3. **World Allocation** (`worldAllocation.ts`)

   - Maps device IDs to specific adventure worlds and variants
   - Ensures even distribution of participants across experimental conditions
   - Variant A = control condition, Variant B = experimental condition with priming

4. **Data Collection** (`dataCollection.ts`)

   - Tracks detailed user interaction metrics:
     - Keystroke timing and patterns
     - Command corrections and deletions
     - Hesitation duration and position
     - Command length and completion time
   - Temporarily stores metrics in localStorage
   - Uploads data to MongoDB when session completes

5. **Natural Language Processing** (`gemini.ts`)
   - Integrates with Google's Gemini 2.5 API
   - Provides contextually aware responses to user commands
   - Maintains consistent in-world narrative and character

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

Each world contains three such puzzles, carefully designed to test different aspects of functional fixedness while maintaining narrative coherence.

### Worlds and Variants

The application implements five distinct adventure worlds, each with unique themes, objectives, and puzzles:

1. **Neo-Tokyo 2099**: A cyberpunk dystopia with broken technology

   - Puzzles include using a datapad as a physical wedge, an ID chip as a circuit bridge, and an adhesive bandage to lift fingerprints

2. **Forgotten Castle**: A medieval fantasy realm with ancient magic

   - Puzzles include using a dagger as a key, a shield as a bridge, and a torch to reveal hidden air vents

3. **Chronos Station**: An abandoned space station with malfunctioning systems

   - Puzzles include using a food tray as a radiation deflector, an access card to pry open panels, and a holographic display for quantum authentication

4. **Subterranean Nexus**: An underground network of caves and lost civilizations

   - Puzzles include using a water bottle as a light-refracting lens, a metal container as a percussion instrument, and notebook pages folded into load-bearing structures

5. **Ethereal Planes**: A dreamlike dimension where reality is malleable
   - Puzzles include using a mirror to reflect negative energy, an emotion vial to capture memory fragments, and a reality anchor to stabilize a shifting chasm

Each world contains three puzzles specifically designed to test functional fixedness, requiring users to utilize objects in unconventional ways.

### Control vs. Experimental Variants

The critical experimental manipulation occurs in how the world is presented to users:

- **Control Variant (A)**: Objects are presented in their traditional contexts only. For example, a datapad is described purely as a communication device, without hints to alternative uses.

- **Experimental Variant (B)**: Objects are subtly shown being used in unconventional ways similar to the required solutions. For example, users might observe "someone has jammed a thin smartpad under a door down the hallway to keep it from closing" before encountering a puzzle requiring the same solution.

The experiment tests whether these subtle contextual cues help participants overcome functional fixedness and solve puzzles more efficiently.

## Data Collection and Analysis

### Interaction Metrics

The system meticulously tracks and analyzes:

1. **Response Timing**:

   - Time between command prompt and submission
   - Total interaction duration for each puzzle
   - First encounter to solution time for each puzzle
   - Overall session duration

2. **Input Behavior**:

   - All keystrokes with millisecond timestamps
   - Corrections (backspaces and deletions)
   - Hesitations (pauses between typing) with duration and position
   - Command revisions before submission

3. **Problem-Solving Patterns**:

   - Command patterns and frequencies
   - Solution attempts categorized by approach
   - Conventional vs. unconventional use attempts
   - Correlation between variant exposure and solution times

4. **Session Information**:
   - Session duration and completion rates
   - World and variant allocation
   - Puzzle completion rate
   - Complete conversation history between user and AI

### Session Analysis

After each session completes, the system generates a comprehensive analysis using advanced AI techniques. This analysis includes:

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

The analysis is stored alongside the raw interaction data in MongoDB, providing researchers with both processed insights and access to the underlying data for custom analyses.

### Analysis Capabilities

The platform implements analytical functions that:

- Calculate average response times across different puzzle types
- Identify patterns in command attempts
- Measure hesitation duration and positions within commands
- Calculate correction rates and frequencies
- Compare solution approaches and times between variants

## Technical Implementation Details

### Device ID and World Allocation

The `generateDeviceId` function creates a persistent identifier stored in localStorage. The `allocateWorld` function uses a deterministic algorithm to assign world and variant based on the device ID:

```typescript
// Allocate world ID (0-4) based on modulo 5
const worldId = idSum % 5;

// Allocate variant (A or B) based on even/odd
const variant = idSum % 2 === 0 ? "A" : "B";
```

This ensures an even distribution across experimental conditions while maintaining consistent assignment for returning users.

### Data Collection Implementation

The data collection infrastructure captures rich interaction metrics:

```typescript
interface InteractionData {
  deviceId: string;
  command: string;
  metrics: {
    keystrokes: { key: string; timestamp: number }[];
    corrections: number;
    hesitations: { duration: number; position: number }[];
    inputDuration: number;
    commandLength: number;
  };
  timestamp: number;
  worldId: number;
  variant: "A" | "B";
}
```

The system temporarily stores interactions in localStorage before uploading them to MongoDB to ensure data is preserved even with intermittent connectivity.

### Gemini Integration and System Prompts

The application leverages Google's Gemini 2.5 API with carefully crafted system prompts that:

1. Establish the narrative framework for each world
2. Specify the variant-specific instructions (control or experimental)
3. Define the puzzles and their solutions
4. Guide the AI to maintain consistent narrative and character

A critical portion of the system prompt that implements the experimental manipulation:

```
VARIANT-SPECIFIC INSTRUCTION:
For variant ${variant}, you must ${variant === 'A'
    ? 'present objects in their traditional contexts and uses only'
    : 'subtly show objects being used in unconventional ways (as needed for puzzles) without explicitly pointing out these uses as solutions'}
```

This instruction ensures that the Gemini model provides the appropriate contextual priming consistent with the experimental condition.

## Research Implications

This application creates a unique opportunity to study functional fixedness in a controlled yet engaging environment. By comparing solution times, approaches, and success rates between control and experimental variants, researchers can:

1. Quantify the effect of contextual priming on overcoming functional fixedness
2. Identify which types of priming are most effective
3. Measure how different narrative contexts influence cognitive flexibility
4. Compare solution patterns across various demographic groups

The rich interaction data collected provides insight not just into whether participants solve puzzles, but into their cognitive processes along the way, as evidenced by hesitation patterns, correction rates, and command sequences.

### MongoDB Integration

The application uses MongoDB to store rich experimental data:

1. **Sessions Collection**:

   - Stores complete session information including participant world assignment
   - Tracks session history with all commands and responses
   - Maintains puzzle state including attempts and completions

2. **Interactions Collection**:

   - Captures detailed interaction data with millisecond-level timing
   - Stores keystroke patterns, hesitations, and corrections
   - Links interactions to specific puzzles and solution attempts

3. **SessionSummaries Collection**:
   - Contains aggregated session metrics
   - Stores AI-generated functional fixedness analysis
   - Provides quick access to experiment outcomes

The database schema is designed for both immediate experimental insight and long-term research data preservation.

```javascript
// Simplified MongoDB schema example
{
  _id: ObjectId("..."),
  deviceId: "user-xyz-123",
  worldId: 2,
  variant: "B",
  startTime: ISODate("2025-04-23T12:34:56Z"),
  endTime: ISODate("2025-04-23T13:15:22Z"),
  puzzleAttempts: [
    {
      puzzleId: "radiation-barrier",
      attemptCount: 3,
      timeToSolution: 245000, // 4m 5s
      solutionFound: true,
      hesitationCount: 12,
      averageHesitationDuration: 1850 // ms
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

- Node.js 18.x or later
- MongoDB (local or Atlas connection)
- Google API Key with access to Gemini 2.5 models

### Configuration

1. Clone the repository
2. Create a `.env.local` file with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_google_api_key
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Development Commands

```bash
# Run development server with hot reloading
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

- `look` - Examine the current environment
- `examine [object]` - Investigate a specific item in detail
- `inventory` - View currently held items
- `use [object]` - Attempt to use an object conventionally
- `use [object] as [function]` - Attempt to use an object in a specific way
- `take [object]` - Pick up an object
- `go [direction]` - Move in a specific direction
- `help` - Display available commands

The game narrator (Gemini AI) responds to commands with narrative descriptions and feedback based on the game world and puzzle context.

### Researcher Tools

Researchers can access collected data through:

1. **MongoDB Direct Access**:

   - Connect to the MongoDB database to query raw data
   - Use MongoDB Compass or similar tools for data visualization

2. **Data Export Utilities**:

   - Export session data in JSON/CSV formats
   - Generate comparative reports across participants

3. **Analysis Dashboard** (future development):
   - Real-time visualization of experiment progress
   - Statistical comparisons between variants
   - Automatic generation of research reports

## Technical Advantages

The IBC Terminal offers several technical advantages as a research platform:

1. **Scalability**: The web-based implementation allows for large-scale data collection without geographical limitations
2. **Engagement**: The immersive narrative format maintains participant interest beyond traditional laboratory tasks
3. **Ecological Validity**: The problem-solving tasks are contextualized within coherent narratives
4. **Data Richness**: The keystroke-level tracking provides unprecedented granularity in behavior analysis
5. **Experimental Control**: The automated variant assignment ensures proper randomization across conditions
6. **Real-time Analysis**: AI-powered analysis provides immediate research insights
7. **Extensibility**: Modular design allows for addition of new worlds, puzzles, and experimental conditions

## Future Directions

Potential extensions of this research platform include:

1. **Multilingual Support**: Implementing the experiment in multiple languages to study cultural variations in functional fixedness
2. **Enhanced Analytics**: Developing more sophisticated analysis tools for pattern recognition in problem-solving approaches
3. **Additional Experimental Conditions**: Testing different types and intensities of contextual priming
4. **Integration with Eye-Tracking**: Adding support for webcam-based eye tracking to study visual attention during problem-solving
5. **Longitudinal Studies**: Implementing features to track returning participants over time to measure learning effects
6. **Cross-Cultural Research**: Expanding to international participants to study cultural variations in functional fixedness
7. **Alternate Cognitive Biases**: Extending the platform to study other cognitive biases beyond functional fixedness

## References

1. Duncker, K. (1945). On problem-solving. _Psychological Monographs_, 58(5).
2. Adamson, R. E. (1952). Functional fixedness as related to problem solving. _Journal of Experimental Psychology_, 44(4), 288-291.
3. German, T. P., & Defeyter, M. A. (2000). Immunity to functional fixedness in young children. _Psychonomic Bulletin & Review_, 7(4), 707-712.
4. McCaffrey, T. (2012). Innovation relies on the obscure: A key to overcoming the classic functional fixedness problem. _Psychological Science_, 23(3), 215-218.
5. Chrysikou, E. G., & Weisberg, R. W. (2005). Following the wrong footsteps: Fixation effects of pictorial examples in a design problem-solving task. _Journal of Experimental Psychology: Learning, Memory, and Cognition_, 31(5), 1134-1148.
6. Ford, S., & Aggarwal, I. (2022). Creative problem solving: The role of examples, fixation, and incubation. _Annual Review of Psychology_, 73, 373-399.
