// Render a PATmatrix Reel to MP4 from week2/puzzles.json + week2/figures.
//   node reels/render.mjs 008                 -> reels/out/reel-008.mp4
//   node reels/render.mjs 008 --stills 0,7,12,18,21   -> PNG stills only (for review)
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Playwright is preinstalled globally here, which ESM imports don't see; require() does.
const { chromium } = createRequire(import.meta.url)('playwright');

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const FPS = 30;
const SOLVE = 20;       // seconds on the clock
const TIMES_UP = 3;     // seconds of the "time's up" end state

const PILL = {
  Keyholes: 'KEYHOLE', 'Top-Front-End': 'TOP-FRONT-END', 'Angle Ranking': 'ANGLE RANKING',
  'Hole Punching': 'HOLE PUNCHING', 'Cube Counting': 'CUBE COUNTING', 'Pattern Folding': 'PATTERN FOLDING',
};
// Owner-approved wording that differs from puzzles.json.
const OVERRIDES = {
  '008': { question: 'Which opening fits?', rule: 'Rotate in 3D to align—then pass straight through.' },
};

function config(num) {
  const data = JSON.parse(readFileSync(join(ROOT, 'week2/puzzles.json'), 'utf8'));
  const p = data.puzzles.find(x => x.number === num);
  if (!p) throw new Error(`No puzzle ${num} in puzzles.json`);
  const ov = OVERRIDES[num] || {};
  const dir = join(ROOT, p.folder);
  const section = p.section.startsWith('Sunday') ? 'SUNDAY' : (PILL[p.section] || p.section.toUpperCase());
  const opts = Array.isArray(p.options)
    ? p.options.map(l => ({ letter: l, image: `file://${dir}/option_${l}.png` }))
    : Object.entries(p.options).map(([l, t]) => ({ letter: l, text: t }));
  const letters = opts.map(o => o.letter);
  return {
    pill: `DAT ${section} CHALLENGE #${num}`,
    hook: 'Most people pick wrong.',
    question: ov.question || p.question,
    rule: ov.rule || p.rule_line,
    stem: `file://${dir}/stem.png`,
    options: opts,
    solve: SOLVE,
    cta: {
      solve: `👇 Drop your letter (${letters[0]}–${letters.at(-1)}) before the timer hits 0!`,
      solveLine2: [
        { at: 0, text: '✋ Tip: press & hold the screen to pause' },
        { at: 6, text: '🔒 Want the beta? Comment or DM "BETA"' },
      ],
      timesUp: '👇 Answer + breakdown in the caption!',
      timesUpLine2: [
        { at: 0, text: 'Follow @pat.matrix for daily PAT' },
        { at: 1.5, text: '🔒 Want the beta? Comment or DM "BETA"' },
      ],
    },
  };
}

async function main() {
  const [num, flag, list] = process.argv.slice(2);
  if (!num) throw new Error('usage: node reels/render.mjs <NNN> [--stills t1,t2,...]');
  const outDir = join(HERE, 'out');
  mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => console.error('page error:', e.message));
  await page.goto(`file://${join(HERE, 'reel.html')}`);
  await page.evaluate(cfg => window.load(cfg), config(num));

  const grab = async t => Buffer.from((await page.evaluate(t => { window.drawFrame(t); return window.frameData(); }, t)).split(',')[1], 'base64');

  if (flag === '--stills') {
    for (const t of list.split(',').map(Number)) {
      const f = join(outDir, `reel-${num}-t${String(t).replace('.', '_')}.png`);
      writeFileSync(f, await grab(t));
      console.log(f);
    }
  } else {
    const file = join(outDir, `reel-${num}.mp4`);
    const total = Math.round((SOLVE + TIMES_UP) * FPS);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error',
      '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
      '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',   // silent track for upload compatibility
      '-shortest', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '64k', '-movflags', '+faststart', file], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = 0; i < total; i++) {
      const buf = await grab(i / FPS);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end();
    await new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`))));
    console.log(file);
  }
  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
