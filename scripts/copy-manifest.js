// Copy manifest.json to dist
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcManifest = path.join(__dirname, '../src/manifest.json');
const distManifest = path.join(__dirname, '../dist/manifest.json');

if (fs.existsSync(srcManifest)) {
  fs.copyFileSync(srcManifest, distManifest);
  console.log('✓ Copied manifest.json to dist/');
} else {
  console.error('✗ manifest.json not found in src/');
  process.exit(1);
}






