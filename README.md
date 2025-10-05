Phishing Detection System (Bargavi)

Backend: Node.js + Express (TypeScript) with Google Safe Browsing & PhishTank integration.
Frontend: React + Vite + TailwindCSS (TypeScript).

Setup:
  1. Backend:
     cd backend
     npm install
     copy .env.example to .env and set GOOGLE_SAFE_BROWSING_KEY and optionally PHISHTANK_API_KEY
     npm run start

  2. Frontend:
     cd frontend
     npm install
     npm run dev

Test:
  - Start backend (port 4000)
  - Start frontend (vite dev)
  - In backend: npx ts-node src/test/testUrls.ts to run sample tests.
