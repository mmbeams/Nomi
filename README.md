# Nomi - Chrome Extension

A minimal Chrome extension for capturing thoughts and organizing them into actionable calendar events. Designed for easily distracted and ADHD users with a calm, low-pressure interface.

## Features

- **One thought at a time** - No scrolling, no history, minimal cognitive load
- **AI-powered categorization** - Automatically categorizes notes using Gemini AI
- **Instant capture** - Quick note entry with Enter key
- **History view** - Browse and filter notes by category
- **Calm design** - Large white space, soft neutral colors, friendly tone
- **Google Calendar integration** - Convert notes to calendar events (coming soon)

## Setup

### 1. Install Extension Dependencies

```bash
npm install
```

### 2. Setup Backend Server

The backend server handles AI categorization (keeps API keys secure):

```bash
cd server
npm install
npm start
```

The server will run on `http://localhost:3001`

See [server/README.md](server/README.md) for more details.

### 3. Build Extension

```bash
npm run build
```

### 4. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder (not the root folder!)

## Development

### Extension Development (watch mode)

```bash
npm run dev
```

### Backend Development (auto-reload)

```bash
cd server
npm run dev
```

## Project Structure

```
├── src/
│   ├── popup.html          # Extension popup HTML
│   ├── popup.tsx           # React entry point
│   ├── App.tsx             # Main landing component
│   ├── components/
│   │   └── History.tsx     # History view component
│   ├── utils/
│   │   └── storage.ts      # Chrome storage utilities
│   ├── types.ts            # TypeScript types
│   ├── styles.css          # Global styles
│   └── manifest.json       # Chrome extension manifest
├── server/
│   ├── index.js            # Backend server (Gemini API proxy)
│   └── package.json        # Server dependencies
└── dist/                   # Built extension (load this in Chrome)
```

## Screens

1. **Empty State** - Default landing with input field
2. **With Note** - User has entered text, greeting fades
3. **Saved Confirmation** - Note saved with AI category, ready for calendar action
4. **History View** - Browse notes grouped by date, filter by category

## AI Categorization

Notes are automatically categorized using Gemini AI into one of these categories:

- Daily Life
- Todos
- Work
- Dev
- Inspo
- Ideas
- Learning
- Health
- Finance
- Projects

Categories are assigned instantly on save and displayed in the confirmation message. Each category has a consistent color for visual recognition.

## Usage

1. **Save a note**: Type your thought and press ENTER
2. **View history**: Click the Notes icon (top right) to see all saved notes
3. **Filter by category**: Click the category dropdown in history view
4. **Restart**: After saving, press ENTER to start a new note

## Notes

- The backend server must be running for AI categorization to work
- If the backend is unavailable, notes will use a simple keyword-based fallback
- All notes are stored locally in Chrome storage
- The extension works offline (but categorization requires backend)

