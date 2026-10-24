// Shared look for Reels, carousels and stories: brand palette, dotted background,
// and the Halloween build-up (Mon 26 Oct -> climax Sat 31 Oct -> calm Sun 1 Nov).
// Decorations only ever go in the free zones a canvas passes in, never over the puzzle.

const BRAND = {
  navy: '#1d2b4f', yellow: '#f2b705', magenta: '#b4236e', teal: '#0f7b6c', mint: '#d6ebe6',
  white: '#ffffff', cream: '#fbefc2', pumpkin: '#f28c28', glow: '#ffd36b',
};
const FONT = '"Liberation Sans", Arial, Helvetica, "Noto Color Emoji", sans-serif';

const LIGHT = { dark: false, bg: '#eef2f0', dot: '#c9d4cf', ink: BRAND.navy, sub: '#4a5878', pill: BRAND.yellow,
  panel: BRAND.navy, panelInk: BRAND.white, panelInk2: BRAND.yellow, track: '#c9d4cf', glowBg: null };
const DUSK = { ...LIGHT, bg: '#e4e0ec', dot: '#cbc3da', pill: BRAND.pumpkin };
const NIGHT = { dark: true, bg: '#182041', dot: '#27315a', ink: '#f6f2e6', sub: '#b9c0d8', pill: BRAND.pumpkin,
  panel: '#0d1430', panelInk: BRAND.white, panelInk2: BRAND.pumpkin, track: '#2e3a66', glowBg: null };
const CLIMAX = { ...NIGHT, bg: '#0f1329', dot: '#20284a', glowBg: '#3a2366' };

// level: 0 plain, 1-6 build-up, 'after' for the day after Halloween
const DAYS = {
  '008': { level: 1, pal: LIGHT,  label: '🎃 5 days to Halloween', bats: 1 },
  '009': { level: 2, pal: LIGHT,  label: '🎃 4 days to Halloween', bats: 2, cobweb: true },
  '010': { level: 3, pal: DUSK,   label: '🎃 3 days to Halloween', bats: 3, cobweb: true, pumpkins: 1 },
  '011': { level: 4, pal: NIGHT,  label: '🌙 2 days to Halloween', bats: 3, cobweb: true, moon: 1, stars: true, pumpkins: 1, lit: true },
  '012': { level: 5, pal: NIGHT,  label: '👻 Halloween is TOMORROW', bats: 5, cobweb: true, moon: 1, stars: true, fog: true, pumpkins: 2, lit: true, ghosts: 1 },
  '013': { level: 6, pal: CLIMAX, label: '🎃 HAPPY HALLOWEEN 🎃', bats: 9, cobweb: true, moon: 1.4, stars: true, fog: true, pumpkins: 3, lit: true, ghosts: 2, hat: true },
  '014': { level: 'after', pal: LIGHT, label: '', bats: 0, pumpkins: 1 },
};
function themeFor(num) { return { num, ...(DAYS[num] || { level: 0, pal: LIGHT, label: '', bats: 0 }) }; }

// ---------- small drawing helpers ----------
function rrectPath(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function rand(seed) { let s = seed * 9301 + 49297; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); }

function drawThemeBackground(ctx, W, H, th) {
  const p = th.pal;
  ctx.fillStyle = p.bg; ctx.fillRect(0, 0, W, H);
  if (p.glowBg) {
    const g = ctx.createRadialGradient(W * 0.75, H * 0.08, 20, W * 0.6, H * 0.3, H * 0.8);
    g.addColorStop(0, p.glowBg); g.addColorStop(1, 'rgba(15,19,41,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  // the carousel template's dot grid (viewBox 1080 scaled 1.422x, offset -228)
  const s = 1536 / 1080; ctx.fillStyle = p.dot;
  for (let row = 0; (12 + row * 42) * s < H; row++) {
    const y = (12 + row * 42) * s, x0 = row % 2 ? 36 : 12;
    for (let col = 0; x0 + col * 48 < 1080; col++) ctx.fillRect(-228 + (x0 + col * 48) * s, y, 4 * s, 4 * s);
  }
}

function drawBat(ctx, x, y, s, t, col) {
  const f = Math.sin(t * 14) * 0.6 + 0.4;            // wing flap
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col;
  for (const d of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(d * 14, -14 * f - 4, d * 30, -8 * f);
    ctx.quadraticCurveTo(d * 26, 2, d * 22, 4); ctx.quadraticCurveTo(d * 18, 0, d * 14, 6);
    ctx.quadraticCurveTo(d * 9, 2, 0, 6); ctx.closePath(); ctx.fill();
  }
  ctx.beginPath(); ctx.ellipse(0, 2, 5, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-4, -4); ctx.lineTo(-3, -10); ctx.lineTo(-1, -5); ctx.moveTo(4, -4); ctx.lineTo(3, -10); ctx.lineTo(1, -5); ctx.fill();
  ctx.restore();
}

function drawMoon(ctx, x, y, r) {
  const g = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 2.4);
  g.addColorStop(0, 'rgba(255,233,170,0.35)'); g.addColorStop(1, 'rgba(255,233,170,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f7e9b8'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(200,180,120,0.35)';
  for (const [dx, dy, rr] of [[-0.3, -0.2, 0.18], [0.25, 0.15, 0.12], [-0.05, 0.35, 0.09]]) {
    ctx.beginPath(); ctx.arc(x + dx * r, y + dy * r, rr * r, 0, Math.PI * 2); ctx.fill();
  }
}

function drawPumpkin(ctx, x, y, s, lit, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (lit) { const g = ctx.createRadialGradient(0, 0, 10, 0, 0, 90); g.addColorStop(0, 'rgba(255,190,80,0.35)'); g.addColorStop(1, 'rgba(255,190,80,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 90, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#e8781e';
  for (const [dx, rx] of [[-20, 26], [20, 26], [0, 28]]) { ctx.beginPath(); ctx.ellipse(dx, 0, rx, 36, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = '#c45f12'; ctx.lineWidth = 2;
  for (const dx of [-14, 14]) { ctx.beginPath(); ctx.ellipse(dx, 0, 10, 34, 0, 0, Math.PI * 2); ctx.stroke(); }
  ctx.fillStyle = '#3f6b2a'; ctx.fillRect(-4, -46, 8, 14);
  ctx.fillStyle = lit ? (Math.sin(t * 9) > -0.6 ? BRAND.glow : '#ffb84d') : '#7a3d0b';
  ctx.beginPath(); ctx.moveTo(-20, -10); ctx.lineTo(-8, -10); ctx.lineTo(-14, -22); ctx.fill();
  ctx.beginPath(); ctx.moveTo(20, -10); ctx.lineTo(8, -10); ctx.lineTo(14, -22); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-24, 8); ctx.lineTo(-14, 14); ctx.lineTo(-6, 8); ctx.lineTo(0, 16); ctx.lineTo(6, 8); ctx.lineTo(14, 14); ctx.lineTo(24, 8); ctx.lineTo(14, 22); ctx.lineTo(-14, 22); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawGhost(ctx, x, y, s, t) {
  ctx.save(); ctx.translate(x, y + Math.sin(t * 2.2) * 10); ctx.scale(s, s); ctx.globalAlpha = 0.85;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(0, 0, 30, Math.PI, 0); ctx.lineTo(30, 40);
  for (let i = 0; i < 4; i++) { const xx = 30 - (i + 1) * 15; ctx.quadraticCurveTo(xx + 7.5, 40 + (i % 2 ? -8 : 8) * Math.sin(t * 6), xx, 40); }
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = BRAND.navy; ctx.globalAlpha = 1;
  ctx.beginPath(); ctx.arc(-10, -2, 5, 0, Math.PI * 2); ctx.arc(10, -2, 5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawCobweb(ctx, x, y, size, flipX, col) {
  ctx.save(); ctx.translate(x, y); if (flipX) ctx.scale(-1, 1);
  ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.globalAlpha = 0.7;
  const n = 6;
  for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI / 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size); ctx.stroke(); }
  for (let r = size * 0.25; r <= size; r += size * 0.22) {
    ctx.beginPath();
    for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI / 2, px = Math.cos(a) * r, py = Math.sin(a) * r; if (i === 0) ctx.moveTo(px, py); else { const am = ((i - 0.5) / n) * Math.PI / 2; ctx.quadraticCurveTo(Math.cos(am) * r * 0.86, Math.sin(am) * r * 0.86, px, py); } }
    ctx.stroke();
  }
  ctx.restore();
}

// zones: { top:[y0,y1], bottom:[y0,y1], sides:[xL, xR] } — free areas of the given canvas
function drawThemeDecor(ctx, W, H, th, t, zones) {
  const p = th.pal, batCol = p.dark ? '#05070f' : '#2a2f45';
  if (th.stars && zones.top) {
    const r = rand(7);
    for (let i = 0; i < 40; i++) {
      const x = r() * W, y = zones.top[0] + r() * (zones.top[1] - zones.top[0]), tw = 0.5 + 0.5 * Math.sin(t * 3 + i);
      ctx.fillStyle = `rgba(255,248,220,${0.3 + 0.6 * tw})`; ctx.fillRect(x, y, 3, 3);
    }
    if (zones.bottom) { for (let i = 0; i < 25; i++) { const x = r() * W, y = zones.bottom[0] + r() * (zones.bottom[1] - zones.bottom[0]); ctx.fillStyle = 'rgba(255,248,220,0.35)'; ctx.fillRect(x, y, 2, 2); } }
  }
  if (th.moon && zones.top) drawMoon(ctx, W - 150, zones.top[0] + (zones.top[1] - zones.top[0]) * 0.5, 46 * th.moon);
  if (th.cobweb) { drawCobweb(ctx, 0, 0, 150, false, p.dark ? '#c9cfe6' : '#9aa3b5'); drawCobweb(ctx, W, 0, 110, true, p.dark ? '#c9cfe6' : '#9aa3b5'); }
  // bats: loop across the top zone, some dipping along the side margins
  if (th.bats && zones.top) {
    const r = rand(3);
    for (let i = 0; i < th.bats; i++) {
      const sp = 0.05 + r() * 0.05, ph = r(), dir = i % 2 ? 1 : -1;
      const u = (t * sp + ph) % 1, x = dir > 0 ? -60 + u * (W + 120) : W + 60 - u * (W + 120);
      const y = zones.top[0] + 30 + r() * (zones.top[1] - zones.top[0] - 60) + Math.sin(t * 2 + i) * 14;
      drawBat(ctx, x, y, 0.9 + r() * 0.7, t + i, batCol);
    }
    if (zones.bottom && th.bats > 2) {
      for (let i = 0; i < Math.floor(th.bats / 2); i++) {
        const u = (t * 0.06 + i * 0.37) % 1, x = i % 2 ? -60 + u * (W + 120) : W + 60 - u * (W + 120);
        drawBat(ctx, x, zones.bottom[0] + 60 + i * 40 + Math.sin(t * 2.4 + i) * 12, 1.1, t + i * 3, batCol);
      }
    }
  }
  if (th.ghosts && zones.bottom) for (let i = 0; i < th.ghosts; i++) drawGhost(ctx, i ? W - 150 : 150, zones.bottom[0] + 110 + i * 20, 1.2, t + i * 1.7);
  if (th.pumpkins && zones.bottom) {
    const xs = th.pumpkins === 1 ? [W - 130] : th.pumpkins === 2 ? [130, W - 130] : [140, W / 2, W - 140];
    xs.forEach((x, i) => drawPumpkin(ctx, x, zones.bottom[1] - 70, 1.15 - (i === 1 && xs.length === 3 ? 0.15 : 0), th.lit, t + i));
  }
  if (th.fog && zones.bottom) {
    for (let i = 0; i < 6; i++) {
      const x = ((t * 18 + i * 220) % (W + 400)) - 200, y = zones.bottom[1] - 30 - (i % 3) * 25;
      const g = ctx.createRadialGradient(x, y, 10, x, y, 220); g.addColorStop(0, 'rgba(220,225,255,0.18)'); g.addColorStop(1, 'rgba(220,225,255,0)');
      ctx.fillStyle = g; ctx.fillRect(x - 220, y - 220, 440, 440);
    }
  }
}

// Logo sits on a white plate on dark days so the navy wordmark stays readable.
function drawLogo(ctx, logo, x, y, w, h, th) {
  if (th.pal.dark) { ctx.fillStyle = 'rgba(255,255,255,0.95)'; rrectPath(ctx, x - 10, y - 2, w + 20, h + 4, 14); ctx.fill(); }
  ctx.drawImage(logo, x, y, w, h);
}

// Tiny witch hat that sits on Boxie (climax day).
function drawWitchHat(ctx, scale) {
  ctx.save(); ctx.scale(scale, scale);
  ctx.fillStyle = '#2a1846';
  ctx.beginPath(); ctx.ellipse(0, 0, 40, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-22, -2); ctx.lineTo(10, -54); ctx.quadraticCurveTo(18, -60, 26, -50); ctx.lineTo(16, -46); ctx.lineTo(22, -2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = BRAND.pumpkin; ctx.fillRect(-20, -12, 41, 7);
  ctx.restore();
}
