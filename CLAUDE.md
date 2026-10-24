# PATmatrix Instagram content: instructions for Claude

This repo holds the puzzle images for PATmatrix's Instagram (@pat.matrix). PATmatrix is an invite-only beta web app (app.patmatrix.app) for practicing the DAT Perceptual Ability Test (PAT), aimed at predental students. You make the posts in the owner's **Canva account** through the Canva connector. Puzzles are already picked and their answers checked. Don't change answers and don't redraw any figure.

## Repo layout
- `week1/`: puzzles #001–#007 (already posted). `qNNN.png` = puzzle composite (stem box + lettered option boxes, 1904×1240, transparent background). `aNNN.png` = answer figure (680×680).
- `week2/`: puzzles **#008–#014** in the same format, plus:
  - `week2/puzzles.json`: day, section, question, rule line, options, **verified answer**, "why it fits" line and a reason each wrong option fails.
  - `week2/figures/<NNN-section>/`: `stem.png` and `option_X.png` on their own, for layouts where the composite doesn't fit (Reels, stories).
- Images reach Canva by URL: the repo is public, so use `upload-asset-from-url` with `https://raw.githubusercontent.com/Blastingskull/Insta-post/main/<path>`. If that fails, stop and ask the owner to drag the `week2` folder into Canva Uploads.

## Canva (work only inside the folder "PATmatrix", id `FAHYdWoKIe8`; don't touch other projects)
- Carousel template: **"PATmatrix Daily Puzzle — TEMPLATE"** `DAHYd7gNwfg`, 1080×1350. Page 1 = puzzle (section tag + "DAILY PUZZLE #00X", question, rule line, figure area, "Comment your answer" / "Swipe for answer"). Page 2 = THE ANSWER (big letter + answer figure `aNNN.png`, Boxie happy, "Why it fits"). Page 3 = COMMON TRAPS (why each wrong option fails). Page 4 = SEE YOU TOMORROW / Follow @pat.matrix / Save this for later. Pages 5–6 = Boxie face sheet + alternate end page, reference only and not posted.
- Finished examples to match exactly: "PATmatrix Daily Puzzle #001"–"#007" in the same folder (3 pages each). Read them first and copy their style and the way `qNNN.png`/`aNNN.png` were placed.
- Reel starting point: `DAHY7KOByoE`, an untouched 1080×1920 resize of the carousel template. Rename it **"PATmatrix Reel — TEMPLATE"** and rework it into the Reel scenes below.
- Show previews and get the owner's OK before every `commit` of a Canva edit. Never post to Instagram.

## Order of work
1. **Reel template first.** Build it from `DAHY7KOByoE`, show previews of every page, and wait for approval.
2. After approval, for each puzzle #008–#014: a **carousel** (copy `DAHYd7gNwfg`, keep pages 1–4, title "PATmatrix Daily Puzzle #0NN — <Section>"), a **Reel** (copy the approved Reel template, title "PATmatrix Reel #0NN — <Section>") and a **story** (title "PATmatrix Story #0NN — <Section>"). Do one day completely, show it, then do the other six.
3. A Claude doc **"PATmatrix Week 2 — #008–#014"** with, per day: a suggested posting time, carousel caption, Reel caption, a comment to pin, the story Quiz sticker question + 4 choices, and alt text for each image.

## Reels: NEVER show the answer
A Reel's job is to make viewers comment their answer before they see it. So no answer letter, no answer figure, no "why it fits" and no hint that gives the answer away anywhere in the Reel video itself. The Reel's **caption** carries the answer + a short breakdown (owner-approved), placed below the hook, the comment prompt and a line break so it isn't visible in the feed preview. The Reel's pinned comment must not give the answer; it invites people to comment their letter.
Silent: no music, no voiceover, no face. Keep text big and inside the safe zone: nothing important in the bottom ~350 px or the right ~120 px. Put the planned seconds in each page's speaker notes. The owner sets page timing and animations in Canva and downloads the MP4.
The approved Reel template ("PATmatrix Reel — TEMPLATE", `DAHY7KOByoE`) is one continuous canvas: the same layout on both pages, so the puzzle is on screen from 0:00 and never disappears. Export pages 1–2 only.
1. Solve, 0:00–0:20: yellow pill "DAT <SECTION> CHALLENGE #0NN" (no seconds, so timer length can be tested in Canva), "Most people pick wrong." + the question, the rule line, a navy timer bar, the stem in the object box with a small curious Boxie in its corner, options from `figures/` (5 options = 3 + 2 grid at 230 px; 4 options = 2 × 2), and a navy bottom bar: "👇 Drop your letter (A–E) before the timer hits 0!" · "🔒 Want the beta? Comment or DM "BETA"".
2. Time's up, 0:20–0:23: same frame, timer empty, Boxie sweating, "⏰ TIME'S UP! Comment your letter" badge; bottom bar "👇 Answer + breakdown in the caption! Follow @pat.matrix for daily PAT." · the beta line.

## Story format (1080×1920)
The puzzle in a compact layout, leaving a clear empty area for Instagram's Quiz sticker, which the owner adds in the app. Plus a next-morning frame: "Yesterday's answer is on our page 👉 @pat.matrix" (the story can point to the carousel, but keep the answer itself on the carousel). Same safe-zone rule.

## Brand rules
- Calls to action: comment your answer · check out @pat.matrix for the answer · follow for the daily puzzle · comment or DM "BETA" for beta access. The beta is invite-only, 18+ and small, so never promise instant access.
- Boxie (the white cube mascot) never speaks; use the expressions on page 5 of the carousel template. Light theme only. Match #001–#007 exactly in fonts, colours and the dotted background.
- Never name competitors. No made-up statistics ("90% get this wrong"). No AI voice, no music, no faces.
- Captions: first line under 125 characters with the hook. Use natural keywords (DAT Perceptual Ability Test, PAT practice, predental, plus the section name), then 3–5 hashtags such as #datprep #predental #patprep #datstudy #dentalschool.
- Sat 31 Oct is Halloween. A light spooky touch on #013 is fine (e.g. Boxie in a tiny witch hat) if it stays on-brand.

## Quality check before saying you're done
Look at every page's thumbnail. Check that the right puzzle is on the right day and the carousel answer matches `week2/puzzles.json`. Check that **no Reel shows or hints at the answer**, nothing is cropped or overlapping, the text is readable on a phone, and no template placeholder like "[why this option fails]" or "#001" is left. Then list every design with its Canva link.
