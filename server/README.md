# Nomi Backend Server

Backend server that proxies requests to the Gemini API for note categorization.

## Setup

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

3. **Server will run on:** `http://localhost:3001`

## API Endpoints

### POST `/api/categorize`

Categorizes a note using Gemini AI.

**Request:**
```json
{
  "note": "Pick up package tonight"
}
```

**Response:**
```json
{
  "category": "Daily Life"
}
```

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

## Environment

The Gemini API key is currently hardcoded in `index.js`. For production, move it to an environment variable:

```bash
export GEMINI_API_KEY=your_key_here
```

Then update `index.js` to use:
```javascript
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
```

## Notes

- The server uses CORS to allow requests from the Chrome extension
- Falls back to "Daily Life" category on errors
- Validates categories against a predefined list






