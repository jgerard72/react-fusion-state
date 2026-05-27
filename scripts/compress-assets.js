/* eslint-disable */
/**
 * One-shot asset compressor for assets/hero.png and assets/quick-start.png.
 * Re-encodes PNGs with palette quantization + max effort to shrink the README
 * payload that ships to GitHub / npmjs. Run via `node scripts/compress-assets.js`.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const TARGETS = ['hero.png', 'quick-start.png'];

async function compress(file) {
  const inPath = path.join(ASSETS_DIR, file);
  const tmpPath = `${inPath}.tmp`;
  const beforeBytes = fs.statSync(inPath).size;

  const meta = await sharp(inPath).metadata();
  await sharp(inPath)
    .png({
      palette: true,
      quality: 80,
      compressionLevel: 9,
      effort: 10,
    })
    .toFile(tmpPath);

  const afterBytes = fs.statSync(tmpPath).size;
  fs.renameSync(tmpPath, inPath);

  const kb = (b) => (b / 1024).toFixed(0) + ' KB';
  const pct = (((beforeBytes - afterBytes) / beforeBytes) * 100).toFixed(1);
  console.log(
    `${file.padEnd(18)} ${meta.width}x${meta.height}  ${kb(beforeBytes).padStart(8)} -> ${kb(afterBytes).padStart(8)}  (-${pct}%)`,
  );
}

(async () => {
  for (const f of TARGETS) await compress(f);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
