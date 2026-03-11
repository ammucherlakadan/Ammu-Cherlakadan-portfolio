#!/usr/bin/env node
/**
 * resize-images.js — Resizes all portfolio JPEGs to ≤ 2048px, JPEG quality 85
 * Run once before pushing to GitHub:   node resize-images.js
 *
 * Uses macOS built-in `sips` — no npm installs needed.
 * Images are resized in-place (your RAW originals are untouched).
 */

const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const FOLDERS = [
  'images/The Table',
  'images/The Lookbook',
  'images/The Brand',
  'images/The Occasion',
  'images/Me',
];

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.JPG', '.JPEG', '.png', '.PNG']);
const MAX_PX     = 2048;  // longest edge in pixels
const QUALITY    = 85;    // JPEG quality (0–100)

let total = 0, done = 0, errors = 0;

for (const folder of FOLDERS) {
  const folderPath = path.join(__dirname, folder);
  if (!fs.existsSync(folderPath)) {
    console.log(`⚠  Skipping missing folder: ${folder}`);
    continue;
  }

  const files = fs.readdirSync(folderPath)
    .filter(f => IMAGE_EXTS.has(path.extname(f)));

  if (files.length === 0) {
    console.log(`   No images in: ${folder}`);
    continue;
  }

  console.log(`\n── ${folder} (${files.length} images)`);
  total += files.length;

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const before   = (fs.statSync(filePath).size / 1_048_576).toFixed(1);
    process.stdout.write(`   ${file.padEnd(40)} ${before.padStart(5)} MB  →  `);

    try {
      execSync(
        `sips -Z ${MAX_PX} --setProperty formatOptions ${QUALITY} "${filePath}"`,
        { stdio: 'pipe' }
      );
      const after = (fs.statSync(filePath).size / 1_048_576).toFixed(1);
      console.log(`${after.padStart(5)} MB  ✓`);
      done++;
    } catch (e) {
      console.log(`ERROR — ${e.message.trim()}`);
      errors++;
    }
  }
}

const saved = total - done;
console.log(`\n✦  Resized ${done}/${total} images.${errors ? `  Errors: ${errors}` : '  All good!'}`);
console.log('   Run  node build.js  next to regenerate gallery-data.js\n');
