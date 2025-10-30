# AI Agent Instructions for Phishing Detection System

This document guides AI agents in understanding and working with this phishing detection system codebase.

## Project Overview

- **Purpose**: Web application for identifying potential phishing URLs using multiple detection methods
- **Stack**: TypeScript-based full-stack application (Node.js + React)
- **Core Components**: Frontend URL analyzer UI, Backend detection service
- **External Dependencies**: Google Safe Browsing API, URLhaus API

## Key Directories

```
backend/
  src/
    routes/     # API endpoint handlers
    types/      # TypeScript type definitions
    test/       # Test cases and URLs
frontend/
  src/          # React components and styling
```

## Architecture & Data Flow

1. Frontend (`App.tsx`) sends URL to backend via POST to `/detect`
2. Backend (`detect.ts`) processes URL through multiple stages:
   - External API checks (Google Safe Browsing, URLhaus)
   - WHOIS domain analysis
   - DNS record validation
   - URL pattern heuristics

## Development Environment

### Backend Setup
1. Required environment variables (in `.env`):
   ```
   GOOGLE_SAFE_BROWSING_KEY=your_api_key
   URLHAUS_AUTH_KEY=your_auth_key
   PORT=4000
   ```
2. Install dependencies: `npm install` in `/backend`
3. Start server: `npm run start`

### Frontend Setup
1. Install dependencies: `npm install` in `/frontend`
2. Start dev server: `npm run dev`

## Project Conventions

### API Response Types
- External API responses are typed in `backend/src/types/api.ts`
- Example for Google Safe Browsing:
  ```typescript
  interface GoogleSafeBrowsingResponse {
    matches?: {
      threatType: string;
      platformType: string;
      threat: { url: string };
    }[];
  }
  ```

### Error Handling Pattern
- API errors are logged with context (see `checkGoogleSafeBrowsing` in `detect.ts`)
- Frontend shows user-friendly alerts for connection issues
- Backend returns `null` for failed external API calls instead of throwing

## Common Tasks

1. Adding a new detection method:
   - Add type definitions in `backend/src/types/api.ts`
   - Implement detection function in `backend/src/routes/detect.ts`
   - Update frontend result display in `App.tsx`

2. Modifying URL analysis rules:
   - Locate the relevant detection function in `detect.ts`
   - Update the detection logic
   - Add corresponding display logic in frontend

## Testing

The project includes test URLs in `backend/src/test/testUrls.ts` for validating detection methods.