# src/app

This directory contains the main Next.js application code for the IBC Terminal research platform, including all API endpoints, global styles, and the root layout.

## Structure

- `layout.tsx` — Root layout and metadata for the app
- `page.tsx` — Main entry point for the terminal UI
- `globals.css` — Global styles for the terminal interface
- `manifest.json` — Web app manifest for PWA support
- `api/` — Serverless API routes for command processing, analytics, and session management
- Icon and favicon files for cross-platform branding

## API Routes

- `/api/command` — Processes user commands, manages session state, and generates AI responses
- `/api/analytics/track` — Receives and stores user interaction and session summary data
- `/api/session/initialize` — Initializes a new or returning session and provides the world introduction
- `/api/session/analyze` — Generates a research analysis of a session's data
- `/api/session/history` — Retrieves session history for a device

## Research Context

All API endpoints are documented and designed for reproducible behavioral experiments. The app directory ensures a clean separation between UI, API, and static assets for research transparency and maintainability.
