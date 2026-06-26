---
name: card-news
description: Create Korean Instagram card-news decks (1080×1350) from a topic or manuscript. Writes a content JSON, renders pixel-perfect PNGs via the HTML/CSS + Playwright harness, and builds per-card download pages for one-by-one Instagram upload. Use when the user asks to make/생성/수정 카드뉴스, card news, or 인스타 카드.
---

# Card-news production skill

Turn a topic or manuscript into a finished Korean card-news deck for Instagram,
matching this repo's established style and conventions.

## Workflow (default)

1. **Manuscript first.** If the user gives a topic (not full copy), draft the
   manuscript in chat and get approval BEFORE rendering. Show: cover hook,
   each content card (heading + 2–4 line body), and the outro. Typical deck =
   cover + N content + outro. 5 cards = cover + 3 + outro; 7 = cover + 5 + outro.
2. **Write the content JSON** in `content/<slug>.json` (schema below).
3. **Render**: `CHROMIUM_PATH=… node scripts/render.mjs content/<slug>.json <themeFile> output/<slug>-<theme>`
4. **Verify** by Reading 2–3 output PNGs (cover, a content card, outro). Check
   line breaks, character size/crispness, emphasis restraint.
5. **Download pages**: `node scripts/make-download-pages.mjs output/<slug>-<theme> <themeFile>`
6. **Deliver** with SendUserFile: send the PNG previews, then the
   `NN_download.html` pages. Tell the user to open 01 first and save in order.
7. **Commit & push** the `content/*.json` (and any new theme) to the working
   branch. NOTE: `output/` is gitignored on purpose — renders are regenerated,
   not committed. The delivered files are the deliverable.

## Rendering in this environment

Playwright's browser CDN is blocked, so always pass the pre-installed Chromium:

```bash
CHROMIUM_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome \
  node scripts/render.mjs content/<slug>.json config/theme-light.json output/<slug>-light
```

(`render.mjs` reads `CHROMIUM_PATH` and falls back to the bundled browser if unset.)

## Themes (pick per the content's tone)

| File | Look | Good for |
|------|------|----------|
| `config/theme.json` | dark navy + mint | tech/AI, punchy thought-leadership |
| `config/theme-light.json` | cream + coral | warm, motivational, daily tips (default) |
| `config/theme-white.json` | white + emerald | minimal, tutorials, info |
| `config/theme-cream-navy.json` | cream + ink navy | editorial, trustworthy (matches mascot) |
| `config/theme-cream-teal.json` | cream + forest teal | fresh, calm |
| `config/theme-cream-amber.json` | cream + mustard | warm, retro, energetic |

To offer a theme recommendation, render the cover in 2–3 candidates into the
scratchpad and let the user compare before committing.

## Content schema & house style

```jsonc
{
  "meta": {
    "brand": "www.wylieax.com",
    "contact": "문의 : pyo0700@wylie.co.kr",
    "topic": "주제명",                     // outro badge
    "character": "../assets/poses/01.png"  // default mascot (paths are ../ from content/)
  },
  "slides": [
    { "type": "cover", "badge": "라벨", "title": "줄1\n줄2", "subtitle": "부제",
      "char": { "src": "../assets/poses/01.png", "pos": "br", "h": 460 } },
    { "type": "content", "index": "01", "icon": "🛠️", "heading": "소제목", "body": "줄1\n줄2\n줄3",
      "char": { "src": "../assets/poses/24.png", "pos": "br", "h": 250, "rot": 3 } },
    { "type": "outro", "title": "마무리\n문구", "cta": "행동 유도 한 줄",
      "char": { "src": "../assets/poses/35.png", "pos": "br", "h": 370 } }
  ]
}
```

House rules (learned from prior feedback — follow them):

- **Hand-set line breaks.** `body` is rendered with `white-space: pre-line`, so
  put `\n` where each line should break. Make every line a whole phrase — a
  word must NEVER split awkwardly across lines (e.g. don't strand "준" from
  "만큼만"). Keep each line ≤ ~15 Korean syllables so it doesn't auto-rewrap.
- **흘림체 emphasis, sparingly.** Wrap a phrase in `*…*` to render it in the
  handwriting font + accent color (Nanum Pen Script via `.em-hand`). Use it
  ONLY on the deck's key wording — about one spot on the cover and one on the
  outro (the "question → answer" beats). Do not emphasize on every card.
  Brush style is available via `--handFont: 'HandKR Brush'`.
- **Characters: don't over-enlarge.** Pose art is ~100px native, so keep
  heights modest: cover ~460, content ~250, outro ~370. Alternate `pos`
  bl/br, add small `rot` (±2–3) and `flip` for variety. Pick a pose that fits
  the beat (e.g. 33 = holding heart for "좋아한다면", 08 = sunglasses for
  confidence, 30 = book for learning, 32 = shrug, 35 = waving/energetic).
  Pose contact sheets: `assets/poses/_contact.png` / `_contact_dark.png`.
- **Emoji icon chip** (`icon`) replaces the big faint index on content slides;
  choose an emoji that matches the heading.
- **Body length**: 2–4 short lines. Tighten copy to fit rather than overflow.
- **Footer** brand/contact come from `meta`; leave them on every card.

## Fonts (bundled in repo)

- `assets/fonts/PretendardVariable.woff2` — body/heading (embedded via @font-face).
- `assets/fonts/NanumPenScript-Regular.ttf` — 흘림체 emphasis (default).
- `assets/fonts/NanumBrushScript-Regular.ttf` — alternative brush 흘림체.

## Quick reference (one deck, light theme)

```bash
CHROMIUM=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
CHROMIUM_PATH=$CHROMIUM node scripts/render.mjs content/my-deck.json config/theme-light.json output/my-deck-light
node scripts/make-download-pages.mjs output/my-deck-light config/theme-light.json
# then SendUserFile the PNGs + NN_download.html, commit content/my-deck.json
```
