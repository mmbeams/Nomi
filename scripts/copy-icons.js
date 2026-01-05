// Copy icon PNG files to dist if they exist
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcIconsDir = path.join(__dirname, '../src/icons');
const distIconsDir = path.join(__dirname, '../dist/icons');

// Create dist/icons directory if it doesn't exist
if (!fs.existsSync(distIconsDir)) {
  fs.mkdirSync(distIconsDir, { recursive: true });
}

// Copy SVG and PNG files if they exist
const svgSizes = [16, 32];
const pngSizes = [16, 48, 128];
let copied = 0;

// Copy SVG files
svgSizes.forEach(size => {
  const srcFile = path.join(srcIconsDir, `icon${size}.svg`);
  const distFile = path.join(distIconsDir, `icon${size}.svg`);
  
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, distFile);
    copied++;
    console.log(`Copied icon${size}.svg`);
  }
});

// Copy PNG files
pngSizes.forEach(size => {
  const srcFile = path.join(srcIconsDir, `icon${size}.png`);
  const distFile = path.join(distIconsDir, `icon${size}.png`);
  
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, distFile);
    copied++;
    console.log(`Copied icon${size}.png`);
  }
});

if (copied === 0) {
  console.log('No icons found. Extension will work without icons.');
  console.log('To add icons: Add SVG or PNG files in src/icons/');
} else {
  console.log(`\n✓ Copied ${copied} icon file(s) to dist/icons/`);
}




