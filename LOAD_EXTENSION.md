# How to Load the Extension in Chrome

## Important: Load from the `dist` folder!

When loading the extension in Chrome, you **must** select the `dist` folder, not the root `Nomi` folder.

## Steps:

1. **Build the extension** (if you haven't already):
   ```bash
   npm run build
   ```

2. **Open Chrome Extensions page**:
   - Go to `chrome://extensions/`
   - Or: Chrome menu → Extensions → Manage Extensions

3. **Enable Developer Mode**:
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the extension**:
   - Click "Load unpacked"
   - **Navigate to and select**: `/Users/moirah/Desktop/Nomi/dist`
   - **NOT** `/Users/moirah/Desktop/Nomi` (the root folder)

5. **Verify**:
   - You should see "Nomi" appear in your extensions list
   - Click the extension icon in the toolbar to open the popup

## Troubleshooting

If you get "Manifest file is missing or unreadable":
- Make sure you selected the `dist` folder, not the root folder
- Verify `dist/manifest.json` exists: `ls -la dist/manifest.json`
- Rebuild if needed: `npm run build`






