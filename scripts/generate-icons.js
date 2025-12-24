// Simple script to generate placeholder icons
// Run with: node scripts/generate-icons.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple SVG icon (assistant eyes icon)
const createIconSVG = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#FAFAFA" stroke="#000" stroke-width="2" rx="4"/>
  <circle cx="${size * 0.35}" cy="${size * 0.5}" r="${size * 0.1}" fill="#000"/>
  <circle cx="${size * 0.65}" cy="${size * 0.5}" r="${size * 0.1}" fill="#000"/>
  <path d="M ${size * 0.25} ${size * 0.35} Q ${size * 0.5} ${size * 0.25} ${size * 0.75} ${size * 0.35}" 
        stroke="#000" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>`;
};

// For now, we'll create SVG files that can be converted to PNG
// Users can convert these or add their own PNG files
const sizes = [16, 48, 128];
const iconsDir = path.join(__dirname, '../src/icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

sizes.forEach(size => {
  const svg = createIconSVG(size);
  const svgPath = path.join(iconsDir, `icon${size}.svg`);
  fs.writeFileSync(svgPath, svg);
  console.log(`Created ${svgPath}`);
});

console.log('\nNote: These are SVG placeholders. For Chrome extensions, you need PNG files.');
console.log('You can:');
console.log('1. Convert these SVGs to PNG using an online tool or ImageMagick');
console.log('2. Replace them with your own custom icons');
console.log('3. Use any 16x16, 48x48, and 128x128 PNG images');

