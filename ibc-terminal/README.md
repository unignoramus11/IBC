# IBC Terminal

A Next.js web application with a terminal-like interface that presents users with interactive adventure games. This application serves as a research tool to study functional fixedness - the cognitive bias that limits a person's ability to use an object in a way other than its traditional use.

## Features

- **Terminal Interface**: Authentic command-line adventure game experience with minimalist design
- **Unique Device Identification**: Generates and stores a unique identifier for each device
- **Dynamic World Generation**: Creates 5 distinct adventure worlds allocated based on the device ID
- **History Mechanism**: Allows users to access their conversation history via a pull-down interface
- **Data Collection**: Tracks and stores comprehensive user interaction data
- **Variant Management**: For each adventure world, implements two variants to test functional fixedness

## Tech Stack

- Next.js with React and TypeScript
- MongoDB for data storage
- Gemini 2.5 API for dynamic content generation
- Dark mode only design

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB instance (local or cloud)
- Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Installation

1. Clone the repository

   ```bash
   git clone https://your-repository-url.git
   cd ibc-terminal
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up environment variables

   ```bash
   cp .env.example .env.local
   ```

4. Add your Gemini API key and MongoDB URI to the `.env.local` file

   ```
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   ```

5. Start the development server

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser

## Project Structure

- `src/components/`: UI components including Terminal, CommandInput, ResponseDisplay, and HistoryDrawer
- `src/lib/`: Core utilities for device ID generation, Gemini API integration, and data collection
- `src/models/`: MongoDB data models for Session, Interaction, and WorldVariant
- `src/config/`: Configuration for worlds and system prompts
- `src/utils/`: Helper utilities for terminal behavior and analytics
- `src/app/`: Next.js app directory with pages and API routes

## Research Methodology

This application implements a research framework to study functional fixedness by:

1. Randomly assigning users to one of five adventure worlds
2. Further assigning users to either control (A) or experimental (B) variants
3. Tracking detailed interaction data to measure problem-solving approaches
4. Comparing solution times and approaches between variants

## Adventure Worlds

1. **Neo-Tokyo 2099**: A cyberpunk dystopia with broken technology
2. **Forgotten Castle**: A medieval fantasy realm with ancient magic
3. **Chronos Station**: An abandoned space station with malfunctioning systems
4. **Subterranean Nexus**: An underground network of caves and lost civilizations
5. **Ethereal Planes**: A dreamlike dimension where reality is malleable

## License

[Your license information]

## Contact

[Your contact information]
