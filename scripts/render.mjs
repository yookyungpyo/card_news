// Card-news render engine — HTML/CSS template -> PNG via Playwright (Chromium).
// Usage:
//   node scripts/render.mjs <contentFile> [themeFile] [outDir]
// Defaults:
//   contentFile = content/sample.json
//   themeFile   = config/theme.json
//   outDir      = output/<content-basename>
import { chromium } from 'playwright';
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function readJSON(p) {
  return JSON.parse(await readFile(p, 'utf-8'));
}

async function main() {
  const contentArg = process.argv[2] || 'content/sample.json';
  const themeArg = process.argv[3] || 'config/theme.json';

  const contentPath = path.resolve(root, contentArg);
  const themePath = path.resolve(root, themeArg);

  const content = await readJSON(contentPath);
  const theme = await readJSON(themePath);

  const base = path.basename(contentPath).replace(/\.json$/i, '');
  const outDir = process.argv[4]
    ? path.resolve(root, process.argv[4])
    : path.resolve(root, 'output', base);
  await mkdir(outDir, { recursive: true });

  const meta = content.meta || {};
  const slides = content.slides || [];
  if (!slides.length) throw new Error('No slides found in content file.');

  // Resolve each slide's image to a loadable URL. Local paths are resolved
  // relative to the content file's directory and converted to file:// URLs.
  const contentDir = path.dirname(contentPath);
  const resolveImage = (p) => {
    if (!p) return p;
    if (/^(https?:|file:|data:)/i.test(p)) return p;
    return pathToFileURL(path.resolve(contentDir, p)).href;
  };
  for (const s of slides) {
    if (s.image) s.image = resolveImage(s.image);
    if (s.char && s.char.src) s.char.src = resolveImage(s.char.src); // per-slide pose image
  }
  if (meta.character) meta.character = resolveImage(meta.character);

  const templateUrl = pathToFileURL(path.resolve(root, 'templates', 'card.html')).href;
  const scale = theme.scale || 2;

  // Allow pointing at a pre-installed Chromium (e.g. when the Playwright CDN is
  // unreachable). Falls back to Playwright's bundled browser when unset.
  const browser = await chromium.launch(
    process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
  );
  const page = await browser.newPage({
    viewport: { width: theme.width, height: theme.height },
    deviceScaleFactor: scale,
  });
  await page.goto(templateUrl, { waitUntil: 'networkidle' });

  const written = [];
  for (let i = 0; i < slides.length; i++) {
    await page.evaluate(
      ([slide, m, t, nav]) => window.renderSlide(slide, m, t, nav),
      [slides[i], meta, theme, { pos: i + 1, total: slides.length }]
    );
    await page.evaluate(() => document.fonts && document.fonts.ready);
    // wait for any <img> (background photo / top band) to finish loading
    await page.evaluate(() => Promise.all(
      Array.from(document.images).map((img) =>
        img.complete ? null : new Promise((res) => {
          img.addEventListener('load', res);
          img.addEventListener('error', res);
        })
      )
    ));
    const num = String(i + 1).padStart(2, '0');
    const file = path.join(outDir, `${num}_${slides[i].type}.png`);
    await page.screenshot({ path: file });
    written.push(file);
    console.log(`  ✓ ${path.relative(root, file)}`);
  }

  await browser.close();
  console.log(`\nDone. ${written.length} cards -> ${path.relative(root, outDir)} (${theme.width}x${theme.height} @${scale}x)`);
}

main().catch((e) => {
  console.error('Render failed:', e.message);
  process.exit(1);
});
