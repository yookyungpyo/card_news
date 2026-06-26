// Per-card download pages — one self-contained HTML per rendered PNG.
// Each page shows a single card; clicking it (or the button) saves that PNG.
// The image is embedded as a base64 data URI, so the file works offline and
// can be shared as-is. Intended for uploading a carousel to Instagram one by
// one.
//
// Usage:
//   node scripts/make-download-pages.mjs <outDir> [themeFile]
//   node scripts/make-download-pages.mjs output/my-deck config/theme-light.json
//
// - <outDir>   : a directory containing NN_*.png cards (the render.mjs output)
// - [themeFile]: optional; its colors.primary is used as the accent color.
//                Defaults to coral (#ff5a5f).
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

async function main() {
  const outDir = process.argv[2];
  if (!outDir) throw new Error('Usage: node scripts/make-download-pages.mjs <outDir> [themeFile]');
  const themeArg = process.argv[3];

  let accent = '#ff5a5f';
  if (themeArg) {
    try {
      const theme = JSON.parse(await readFile(themeArg, 'utf-8'));
      if (theme?.colors?.primary) accent = theme.colors.primary;
    } catch { /* keep default accent */ }
  }

  const entries = (await readdir(outDir))
    .filter((f) => /^\d+_.*\.png$/i.test(f))
    .sort();
  if (!entries.length) throw new Error(`No NN_*.png cards found in ${outDir}`);

  const deck = path.basename(path.resolve(outDir));
  const total = entries.length;
  const pad = String(total).padStart(2, '0');

  for (let i = 0; i < entries.length; i++) {
    const f = entries[i];
    const nn = String(i + 1).padStart(2, '0');
    const b64 = (await readFile(path.join(outDir, f))).toString('base64');
    const uri = `data:image/png;base64,${b64}`;
    const dl = `${deck}-${f}`;
    const isFirst = i === 0;
    const isLast = i === entries.length - 1;
    const lab = isFirst ? `${i + 1} · 표지` : isLast ? `${i + 1} · 마무리` : String(i + 1);
    const html = `<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>카드 ${lab} — 다운로드</title>
<style>
  :root { --accent:${accent}; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:18px; padding:36px 18px; background:#fbf7f2;
    font-family:'Pretendard','Malgun Gothic','Noto Sans KR',sans-serif; color:#1c1a19; }
  .num { font-size:13px; font-weight:800; color:var(--accent); letter-spacing:1px; }
  .card { display:block; line-height:0; border-radius:16px; overflow:hidden; cursor:pointer;
    box-shadow:0 14px 36px rgba(0,0,0,0.16); transition:transform .18s ease, box-shadow .18s ease; }
  .card:hover { transform:translateY(-4px); box-shadow:0 22px 52px rgba(0,0,0,0.24); }
  .card:active { transform:translateY(0); }
  .card img { display:block; width:min(88vw,420px); height:auto; }
  .btn { display:inline-flex; align-items:center; gap:8px; text-decoration:none; font-size:15px;
    font-weight:800; color:#fff; background:var(--accent); padding:13px 24px; border-radius:999px; }
  .sub { font-size:13px; color:#6b6460; }
</style></head><body>
  <span class="num">CARD ${nn} / ${pad}</span>
  <a class="card" href="${uri}" download="${dl}" title="클릭하면 저장됩니다"><img src="${uri}" alt="카드 ${lab}"></a>
  <a class="btn" href="${uri}" download="${dl}">⬇ 이 카드 저장</a>
  <p class="sub">카드를 누르면 PNG가 저장됩니다 · www.wylieax.com</p>
</body></html>
`;
    const outFile = path.join(outDir, `${nn}_download.html`);
    await writeFile(outFile, html, 'utf-8');
    console.log(`  ✓ ${path.relative(process.cwd(), outFile)}`);
  }
  console.log(`\nDone. ${total} download pages -> ${outDir} (accent ${accent})`);
}

main().catch((e) => { console.error('make-download-pages failed:', e.message); process.exit(1); });
