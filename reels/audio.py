"""Synthesize a Reel soundtrack: a quiet music bed + sound effects timed to reel.html.

Everything is generated here (sine/noise synthesis), so there is nothing to license.
The mood follows the Halloween build-up level from theme.js:
  light (0, 1, 2, 'after'): warm lo-fi chords
  dusk (3): minor chords + music box
  night (4, 5): minor, walking bass, music box, theremin swoops
  climax (6): organ chords, heavier bass, theremin melody, tolling bell

usage: python3 audio.py --level 3 --options 5 --solve 20 --total 23 --out file.wav
"""
import argparse
import wave

import numpy as np

SR = 44100
BPM = 96
BEAT = 60 / BPM


def release(sig, ms=12):
    # short fade at the very end so no sound stops mid-wave (that cut is an audible click)
    n = min(len(sig), int(SR * ms / 1000))
    if n > 1:
        sig = sig.copy(); sig[-n:] *= np.linspace(1, 0, n)
    return sig


def tone(freq, dur, harmonics=((1, 1.0),), decay=3.0, attack=0.005):
    t = np.arange(int(dur * SR)) / SR
    # skip partials above ~16 kHz: they only add harsh fizz on phone speakers
    sig = sum(a * np.sin(2 * np.pi * freq * h * t) for h, a in harmonics if freq * h < 16000)
    env = np.minimum(1, t / attack) * np.exp(-decay * t)
    return release(sig * env)


def glide(f0, f1, dur, vib=0.0, vib_rate=6.0):
    t = np.arange(int(dur * SR)) / SR
    f = f0 + (f1 - f0) * (t / dur) + vib * np.sin(2 * np.pi * vib_rate * t)
    return release(np.sin(2 * np.pi * np.cumsum(f) / SR))


def noise(dur, seed=0):
    return np.random.default_rng(seed).uniform(-1, 1, int(dur * SR))


def lowpass(x, a):
    y = np.empty_like(x); acc = 0.0
    for i, v in enumerate(x):
        acc += a * (v - acc); y[i] = acc
    return y


def midi(n):
    return 440 * 2 ** ((n - 69) / 12)


class Mix:
    def __init__(self, total):
        self.buf = np.zeros((int(total * SR) + SR, 2))

    def add(self, sig, at, gain=1.0, pan=0.0):
        i = int(at * SR)
        if i >= len(self.buf):
            return
        sig = sig[: len(self.buf) - i] * gain
        self.buf[i:i + len(sig), 0] += sig * (1 - max(0, pan))
        self.buf[i:i + len(sig), 1] += sig * (1 + min(0, pan))


def music(mx, level, total, solve):
    mood = 'light' if level in (0, 1, 2, 'after') else 'dusk' if level == 3 else 'climax' if level == 6 else 'night'
    if mood == 'light':
        chords = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]]   # Fmaj7 Em7 Dm7 Cmaj7
        roots = [41, 40, 38, 36]
    else:
        chords = [[57, 60, 64], [53, 57, 60], [50, 53, 57], [52, 56, 59]]                  # Am F Dm E
        roots = [45, 41, 38, 40]
    keys = (((1, 1.0), (2, 0.35), (3, 0.12)) if mood != 'climax'
            else ((1, 1.0), (2, 0.6), (3, 0.45), (4, 0.25), (6, 0.15)))                     # organ-ish on the climax
    bar = 4 * BEAT
    gain = {'light': 0.11, 'dusk': 0.11, 'night': 0.12, 'climax': 0.13}[mood]
    t = 0.0
    while t < solve:
        ci = int(t / bar) % 4
        for n in chords[ci]:                         # chord, re-struck every 2 beats
            for k in (0, 2):
                mx.add(tone(midi(n), 2 * BEAT, keys, decay=1.6), t + k * BEAT, gain * 0.5, pan=(n % 3 - 1) * 0.3)
        # bass
        if mood in ('night', 'climax'):
            walk = [0, 7, 12, 7]
            for k in range(4):
                mx.add(tone(midi(roots[ci] - 12 + walk[k]), BEAT, ((1, 1.0), (2, 0.4)), decay=4), t + k * BEAT, gain * 1.1)
        else:
            mx.add(tone(midi(roots[ci] - 12), 2 * BEAT, ((1, 1.0), (2, 0.3)), decay=1.5), t, gain * 1.0)
            mx.add(tone(midi(roots[ci] - 12), 2 * BEAT, ((1, 1.0), (2, 0.3)), decay=1.5), t + 2 * BEAT, gain * 0.8)
        # music box arpeggio on darker days
        if mood != 'light':
            arp = chords[ci] + [chords[ci][1] + 12]
            for k in range(8):
                mx.add(tone(midi(arp[k % len(arp)] + 24), 0.5, ((1, 1.0), (4.2, 0.2)), decay=6), t + k * BEAT / 2,
                       gain * 0.35, pan=0.4 if k % 2 else -0.4)
        # drums: soft kick + hats; hats double in the last 5 s
        for k in range(4):
            bt = t + k * BEAT
            if bt >= solve:
                break
            if k in (0, 2):
                mx.add(glide(110, 45, 0.18) * np.exp(-np.arange(int(0.18 * SR)) / SR * 18), bt, gain * 1.6)
            hats = 4 if solve - bt <= 5 else 2
            for h in range(hats):
                # soft, rounded hat: band-limited noise with a quick fade-in/out (no raw white-noise hiss)
                hn = noise(0.04, seed=int(bt * 100) + h)
                hn = lowpass(hn - lowpass(hn, 0.25), 0.5) * np.hanning(len(hn))
                mx.add(hn, bt + h * BEAT / hats, gain * 0.28)
        t += bar
    # theremin swoops at night / melody on the climax
    if mood in ('night', 'climax'):
        phrase = [(1.0, 69, 72, 1.6), (5.0, 76, 72, 1.8), (9.0, 69, 77, 1.6), (13.0, 76, 68, 2.2)]
        for at, a, b, d in phrase:
            env = np.sin(np.linspace(0, np.pi, int(d * SR)))
            mx.add(glide(midi(a), midi(b), d, vib=6, vib_rate=5.5) * env, at, 0.05 if mood == 'night' else 0.075)
    return mood


def sfx(mx, level, n_opts, solve, total, mood):
    # intro whoosh
    w = noise(0.5, 1); w = lowpass(lowpass(w, 0.05), 0.05) * np.sin(np.linspace(0, np.pi, len(w)))
    mx.add(w, 0, 0.6)
    # "scan" blips (options lift in turn at 0.3 s and 8.5 s, 0.22 s apart)
    scale = [72, 74, 76, 79, 81]
    for start in (0.3, 8.5):
        for k in range(n_opts):
            mx.add(tone(midi(scale[k % 5]), 0.35, ((1, 1.0), (4, 0.25)), decay=12), start + k * 0.22 + 0.05, 0.22, pan=-0.5 + k / max(1, n_opts - 1))
    # clock: tick each second, louder and twice per second in the final 5 s
    for s in range(1, int(solve)):
        last = solve - s <= 5
        for half in ((0, 0.5) if last else (0,)):
            f = 1900 if (s * 2 + int(half * 2)) % 2 == 0 else 1500
            mx.add(tone(f, 0.04, ((1, 1.0), (2.7, 0.3)), decay=140), s + half, 0.32 if last else 0.14)
    # thought bubble bloops while thinking (6-15 s, every 1.8 s cycle)
    t = 6.0
    while t < solve - 5:
        for i in range(3):
            mx.add(glide(320 + i * 90, 640 + i * 120, 0.07) * np.hanning(int(0.07 * SR)), t + i * 0.3, 0.07)
        t += 1.8
    # time's up: badge pop + bell/gong + Boxie hop
    T = solve
    mx.add(glide(1100, 260, 0.09) * np.exp(-np.arange(int(0.09 * SR)) / SR * 30), T, 0.45)
    if mood == 'light':
        for i, n in enumerate([84, 88, 91]):
            mx.add(tone(midi(n), 1.6, ((1, 1.0), (2.76, 0.4), (5.4, 0.2)), decay=2.5), T + 0.05 + i * 0.12, 0.28)
    else:
        mx.add(tone(98, 2.8, ((1, 1.0), (2.4, 0.6), (3.9, 0.4), (5.3, 0.2)), decay=1.1), T + 0.02, 0.5)   # gong
        for i, n in enumerate([81, 77, 76] if mood != 'climax' else [81, 80, 77, 76]):
            mx.add(tone(midi(n), 1.6, ((1, 1.0), (2.76, 0.4)), decay=2.2), T + 0.25 + i * 0.16, 0.2)
        if mood == 'climax':                                                                        # extra toll
            mx.add(tone(73.4, 2.5, ((1, 1.0), (2.4, 0.5), (3.9, 0.3)), decay=1.2), T + 1.4, 0.4)
    boing = glide(220, 520, 0.25, vib=40, vib_rate=18) * np.exp(-np.arange(int(0.25 * SR)) / SR * 9)
    mx.add(boing, T + 0.1, 0.18)
    # soft pad under the end card
    for n in ([60, 64, 67] if mood == 'light' else [57, 60, 64]):
        pad = tone(midi(n), total - T, ((1, 1.0), (2, 0.2)), decay=0.6, attack=0.4)
        mx.add(pad, T + 0.3, 0.05)


def reverb(x):
    out = x.copy()
    for d, g in ((0.031, 0.32), (0.047, 0.26), (0.071, 0.2), (0.113, 0.14)):
        k = int(d * SR); out[k:] += x[:-k] * g
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--level', default='0')
    ap.add_argument('--options', type=int, default=5)
    ap.add_argument('--solve', type=float, default=20)
    ap.add_argument('--total', type=float, default=23)
    ap.add_argument('--out', required=True)
    a = ap.parse_args()
    level = a.level if a.level == 'after' else int(a.level)

    mx = Mix(a.total)
    mood = music(mx, level, a.total, a.solve)
    sfx(mx, level, a.options, a.solve, a.total, mood)
    buf = reverb(mx.buf)[: int(a.total * SR)]
    fade = int(0.25 * SR); buf[-fade:] *= np.linspace(1, 0, fade)[:, None]     # clean loop point
    buf /= max(1e-9, np.abs(buf).max()) / 0.9
    buf[:int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))[:, None]          # no click on the first sample
    with wave.open(a.out, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((buf * 32767).astype('<i2').tobytes())


if __name__ == '__main__':
    main()
