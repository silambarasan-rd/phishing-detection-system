# 🛡️ Phishing Detection System

A modern web application that helps identify potential phishing URLs using multiple detection methods and external APIs.

## 🎯 Purpose

This application helps users identify potentially malicious URLs by:

- Analyzing URL patterns and characteristics
- Checking against known phishing databases
- Verifying domain registration information
- Validating DNS records
- Detecting brand impersonation attempts

## 🏗️ Technical Architecture

### Backend (TypeScript + Node.js)

- **Framework**: Express.js
- **Key Features**:
  - URL analysis using custom heuristics
  - Integration with Google Safe Browsing API
  - URLhaus malicious URL database integration
  - WHOIS domain registration checks
  - DNS record validation
  - Brand impersonation detection

### Frontend (TypeScript + React)

- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Features**:
  - Real-time URL analysis
  - Detailed threat analysis display
  - Responsive design
  - Clean and intuitive UI

## 🔍 Detection Methods

1. **External API Integration**

   - Google Safe Browsing API for malware and phishing detection
   - URLhaus database for known malicious URLs

2. **URL Pattern Analysis**

   - Length checks
   - Special character detection
   - IP address usage
   - Suspicious TLD detection
   - Domain impersonation checks

3. **Domain Intelligence**

   - WHOIS record analysis
   - Domain age verification
   - DNS record validation
   - Registration details check

## 🛠️ Setup Instructions

### Backend Setup

1. Navigate to backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment:

   - Copy `.env.example` to `.env`
   - Add your Google Safe Browsing API key:

     ```env
     GOOGLE_SAFE_BROWSING_KEY=your_api_key_here
     URLHAUS_AUTH_KEY=your_auth_key_here
     PORT=4000
     ```

4. Start the server:

   ```bash
   npm run start
   ```

### Frontend Setup

1. Navigate to frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

## 🧪 Testing

Run the test suite with sample URLs:

```bash
cd backend
npx ts-node src/test/testUrls.ts
```

## 📚 Dependencies

### Backend Dependencies

- express: Web framework
- cors: Cross-origin resource sharing
- node-fetch: HTTP client
- whois-json: Domain WHOIS lookup
- TypeScript & ts-node: TypeScript support

### Frontend Dependencies

- React + React DOM: UI framework
- Vite: Build tool and dev server
- TailwindCSS: Utility-first CSS framework
- TypeScript: Type safety

## 👥 Credits

Developed by Bargavi B
