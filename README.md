# Nomi - Chrome Extension

A minimal Chrome extension for capturing thoughts and organizing them into actionable calendar events. Designed for easily distracted and ADHD users with a calm, low-pressure interface.

## Features

- **One thought at a time** - No scrolling, no history, minimal cognitive load
- **Instant capture** - Quick note entry with Enter key
- **Calm design** - Large white space, soft neutral colors, friendly tone
- **Google Calendar integration** - Convert notes to calendar events

## Development

### Setup

```bash
npm install
```

### Build

```bash
npm run build
```

### Development (watch mode)

```bash
npm run dev
```

### Load Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder

## Project Structure

```
src/
  ├── popup.html       # Extension popup HTML
  ├── popup.tsx        # React entry point
  ├── App.tsx          # Main app component
  ├── styles.css       # Global styles
  └── manifest.json    # Chrome extension manifest
```

## Screens

1. **Empty State** - Default landing with input field
2. **With Note** - User has entered text, greeting fades
3. **Saved Confirmation** - Note saved, ready for calendar action

