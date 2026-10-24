// Render a day's carousel (4 PNG slides, 1080x1350) and story (2 PNG frames, 1080x1920).
//   node reels/posts.mjs 008      -> reels/out/posts/008/carousel-1..4.png, story-1..2.png
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const { chromium } = createRequire(import.meta.url)('playwright');
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');

const TAG = { Keyholes: 'KEYHOLES', 'Top-Front-End': 'TOP-FRONT-END', 'Angle Ranking': 'ANGLE RANKING',
  'Hole Punching': 'HOLE PUNCHING', 'Cube Counting': 'CUBE COUNTING', 'Pattern Folding': 'PATTERN FOLDING' };
// answer figures that no longer match puzzles.json (answer drawn as text instead)
const STALE_ANSWER_IMAGE = new Set(['012']);

function config(num) {
  const data = JSON.parse(readFileSync(join(ROOT, 'week2/puzzles.json'), 'utf8'));
  const p = data.puzzles.find(x => x.number === num);
  const dir = join(ROOT, p.folder);
  const opts = Array.isArray(p.options)
    ? p.options.map(l => ({ letter: l, image: `file://${dir}/option_${l}.png` }))
    : Object.entries(p.options).map(([l, t]) => ({ letter: l, text: t }));
  const textAnswer = !Array.isArray(p.options);
  const aImg = join(ROOT, `week2/a${num}.png`);
  return {
    num, nextNum: String(Number(num) + 1).padStart(3, '0'),
    tag: `${p.section.startsWith('Sunday') ? 'SUNDAY CHALLENGE' : (TAG[p.section] || p.section.toUpperCase())} · DAILY PUZZLE #${num}`,
    question: p.question.replace(/^SUNDAY CHALLENGE:\s*/, ''),
    rule: p.rule_line,
    composite: `file://${ROOT}/week2/q${num}.png`,
    options: opts,
    answer: p.answer,
    answerText: textAnswer ? p.options[p.answer] : null,
    answerImage: textAnswer || STALE_ANSWER_IMAGE.has(num) || !existsSync(aImg) ? null : `file://${aImg}`,
    why: p.why_it_fits,
    traps: p.traps,
  };
}

const num = process.argv[2];
if (!num) throw new Error('usage: node reels/posts.mjs <NNN>');
const out = join(HERE, 'out/posts', num);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on('pageerror', e => console.error('page error:', e.message));
await page.goto(`file://${join(HERE, 'posts.html')}`);
await page.evaluate(cfg => window.load(cfg), config(num));
for (const [kind, n] of [['carousel', 4], ['story', 2]]) {
  for (let i = 1; i <= n; i++) {
    const data = await page.evaluate(([k, i]) => window.render(k, i), [kind, i]);
    const f = join(out, `${kind}-${i}.png`);
    writeFileSync(f, Buffer.from(data.split(',')[1], 'base64'));
    console.log(f);
  }
}
await browser.close();
