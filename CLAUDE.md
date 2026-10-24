# PATmatrix Instagram content: instructions for Claude

This repo holds the puzzle images for PATmatrix's Instagram (@pat.matrix). PATmatrix is an invite-only beta web app (app.patmatrix.app) for practicing the DAT Perceptual Ability Test (PAT), aimed at predental students. Posts (Reels, carousels, stories) are **rendered in code** in `reels/`, following the look of the owner's Canva templates. Puzzles are already picked and their answers checked. Don't change answers and don't redraw any figure; if the owner changes a question, they supply the verified answer.

## Repo layout
- `week1/`: puzzles #001–#007 (already posted). `qNNN.png` = puzzle composite (stem box + lettered option boxes, 1904×1240, transparent background). `aNNN.png` = answer figure (680×680).
- `week2/`: puzzles **#008–#014** in the same format, plus:
  - `week2/puzzles.json`: day, section, question, rule line, options, **verified answer**, "why it fits" line and a reason each wrong option fails. #012 was changed by the owner to "exactly 4 painted faces" (answer D); `a012.png` still shows the old answer and is not used.
  - `week2/figures/<NNN-section>/`: `stem.png` and `option_X.png` on their own.
- `reels/`: the renderers (see below). Output goes to `reels/out/` (git-ignored); send files to the owner rather than committing them.

## Renderers (`reels/`)
- **Reel:** `node reels/render.mjs 0NN` → `reels/out/reel-0NN.mp4` (23 s, 1080×1920, with soundtrack). `--stills 0,9,17,20.6` writes review PNGs instead. Scene + animation: `reel.html`.
- **Carousel + story:** `node reels/posts.mjs 0NN` → `reels/out/posts/0NN/carousel-1..4.png` (1080×1350) and `story-1..2.png` (1080×1920). Scene: `posts.html`.
- **Shared look:** `theme.js` (brand palette, dotted background, Halloween build-up decorations, logo plate on dark days). **Audio:** `audio.py` synthesizes the music bed + sound effects (no samples, nothing to license); the render loudness-normalises to about -14 LUFS.
- **Assets:** Boxie faces in `reels/assets/boxie/` (cut from the Canva face sheet, body filled white); the owner's vector logo `reels/assets/logo.svg` (`mascot.svg`, `icon.svg` alongside).
- Owner-approved wording that differs from puzzles.json goes in `OVERRIDES` in `render.mjs` (Reels need short lines).
- Show stills/MP4s/PNGs to the owner before treating anything as done. Never post to Instagram.
- The Canva designs in the folder "PATmatrix" (`FAHYdWoKIe8`) are the style reference: carousel template `DAHYd7gNwfg`, examples #001–#007, Reel template `DAHY7KOByoE`. Only touch Canva if the owner asks.

## Reels: never show the answer in the video
A Reel's job is to make viewers comment their answer before they see it. No answer letter, answer figure, "why it fits" or hint anywhere in the video. The Reel's **caption** carries the answer + a short breakdown (owner-approved), below the hook, the comment prompt and a line break so it isn't visible in the feed preview. The pinned comment must not give the answer; it invites people to comment.
One continuous canvas: the puzzle is on screen from 0:00 and never disappears or gets covered; motion lives in the header, the timer lane, Boxie and the bottom bar (the only option motion is an equal lift for every option in turn). Keep text inside the safe zone (nothing important in the bottom ~350 px or the right ~120 px).
1. Solve, 0:00–0:20: pill "DAT <SECTION> CHALLENGE #0NN", "Most people pick wrong." + the question, the rule line, a countdown chip + timer bar that Boxie rides (curious → thinking → panicking in the last 5 s), the stem box, options (5 = 3 + 2 grid at 224 px; 4 = one row of 214 px with a taller stem box), bottom bar "👇 Drop your letter (A–E) before the timer hits 0!" with a rotating second line (pause tip, then the beta line).
2. Time's up, 0:20–0:23: "⏰ TIME'S UP! Comment your answer" badge, Boxie sweating; bottom bar "👇 Answer + breakdown in the caption!" then "Follow @pat.matrix for daily PAT" / the beta line.
Audio (owner-approved): synthesized lo-fi bed + clock ticks (faster in the last 5 s), pops, and a chime/gong at time's up. No voice.

## Carousel (4 slides) and story (2 frames)
Carousel: 1 puzzle (`qNNN.png`, "Comment your answer" / "Swipe for answer"), 2 THE ANSWER (letter, answer figure or answer text, why it fits), 3 COMMON TRAPS (each wrong option + reason), 4 SEE YOU TOMORROW (follow, save, beta line). Story: 1 the puzzle with a clear empty area (y≈1270–1530) for Instagram's Quiz sticker; 2 a next-morning frame "Yesterday's answer is on our page 👉 @pat.matrix" (no answer on the story).

## Halloween build-up (week 2, owner-approved)
Mon 26 Oct → Sat 31 Oct climax → calm Sun 1 Nov. Light theme Mon–Tue with a few bats/cobwebs, dusk Wed, **dark night theme Thu–Sat** (moon, stars, bats, lit pumpkins, ghosts, fog; Saturday adds a witch hat on Boxie and a purple glow), back to light on Sunday with one pumpkin. A countdown label ("🎃 3 days to Halloween") sits in the top band. Puzzle boxes and option cards stay white on every theme so the figures read clearly. Levels live in `DAYS` in `theme.js`.

## Brand rules
- Calls to action: comment your answer · check out @pat.matrix for the answer · follow for the daily puzzle · comment or DM "BETA" for beta access. The beta is invite-only, 18+ and small, so never promise instant access.
- Boxie (the white cube mascot) never speaks; use the face-sheet expressions. Match #001–#007 in colours and the dotted background (font: Liberation Sans Bold as the closest available match). Light theme except the Halloween build-up above.
- Never name competitors. No made-up statistics ("90% get this wrong"). No AI voice, no faces. Music only as the synthesized bed above.
- Captions: first line under 125 characters with the hook. Use natural keywords (DAT Perceptual Ability Test, PAT practice, predental, plus the section name), then 3–5 hashtags such as #datprep #predental #patprep #datstudy #dentalschool.

## Order of work (week 2)
1. Reels, carousels and stories for #008–#014 (renderers above).
2. A Claude doc **"PATmatrix Week 2 — #008–#014"** with, per day: a suggested posting time, carousel caption, Reel caption (with answer + breakdown), a comment to pin, the story Quiz sticker question + 4 choices, and alt text for each image.

## Quality check before saying you're done
Look at every frame/slide. Check that the right puzzle is on the right day and the carousel answer matches `week2/puzzles.json`. Check that **no Reel or story shows or hints at the answer**, nothing is cropped or overlapping, the text is readable on a phone, and no placeholder text is left.
