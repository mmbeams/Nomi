# Icons

Chrome extensions require PNG icon files. Place them here:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

## Quick Setup

SVG placeholder icons have been generated. To convert them to PNG:

1. **Online tool**: Use a service like [CloudConvert](https://cloudconvert.com/svg-to-png) or [Convertio](https://convertio.co/svg-png/)
2. **Command line** (if you have ImageMagick): 
   ```bash
   convert src/icons/icon16.svg -resize 16x16 src/icons/icon16.png
   convert src/icons/icon48.svg -resize 48x48 src/icons/icon48.png
   convert src/icons/icon128.svg -resize 128x128 src/icons/icon128.png
   ```
3. **Design tool**: Open the SVG files in Figma, Sketch, or similar and export as PNG

## Design

The icons feature a simple assistant/eyes design matching the Nomi brand. You can customize them or replace with your own designs.

**Note**: The extension will work without icons, but Chrome will show warnings. Icons are recommended for production.

