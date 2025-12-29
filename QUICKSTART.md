# Quick Start Guide

## 1. Start the Backend Server

```bash
cd server
npm install
npm start
```

Keep this terminal running. The server should show:
```
Server running on http://localhost:3001
```

## 2. Build the Extension

In a new terminal:

```bash
npm install
npm run build
```

## 3. Load in Chrome

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder

## 4. Test It!

1. Click the extension icon
2. Type a note: "Pick up package tonight"
3. Press ENTER
4. See it categorized (e.g., "Saved to 'Daily Life'")
5. Click the Notes icon (top right) to view history
6. Use the category dropdown to filter notes

## Troubleshooting

**"Failed to categorize" errors:**
- Make sure the backend server is running on port 3001
- Check the server terminal for errors
- The extension will use a fallback categorization if the backend is down

**Extension won't load:**
- Make sure you selected the `dist` folder, not the root folder
- Rebuild: `npm run build`

**History is empty:**
- Save a few notes first
- Check Chrome DevTools console for errors






