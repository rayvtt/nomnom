#!/usr/bin/env node
// Cloudflare Pages build shim — NOT the real Expo CLI.
// The Pages project "nomnom" runs:
//   cd mobile && npm install && npx expo export --platform web --clear
// with output dir mobile/dist. On branches that don't contain the Expo app,
// this stand-in answers `expo export` by copying the static site into
// mobile/dist. Root-level functions/ (e.g. /api/parse) are still compiled by Pages.
const fs = require('fs');
const path = require('path');

if (process.argv[2] !== 'export') {
  console.error('nomnom-static-build: only `expo export` is supported');
  process.exit(1);
}
const root = path.resolve(process.cwd(), '..');
const dist = path.resolve(process.cwd(), 'dist');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
for (const item of ['index.html', 'log', '_headers']) {
  const src = path.join(root, item);
  if (fs.existsSync(src)) {
    fs.cpSync(src, path.join(dist, item), { recursive: true });
    console.log('copied', item);
  }
}
console.log('static site exported to', dist);
