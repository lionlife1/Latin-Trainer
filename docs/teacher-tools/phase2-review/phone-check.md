# Phone-width check: grid and parse items

Dir: /tmp/claude-0/-home-user-Latin-Trainer/db5ffdd8-df4e-5749-8a03-5dd5a78129fe/scratchpad/phone-check/
Harness: index.html, main.tsx, harness.css, vite.config.ts, run.cjs (measure + screenshots), crops.cjs. Raw numbers: measurements.json.
Screenshots: shot-{375,390,640,641,1024}.png (full page), crop-{375,1024}-*.png (readable sections), overlay-*.png (Feedback overlay).
No repo files changed (git status clean).

## Rendered (real components, real generators, real CSS global.css + classroom.css + app.css)
Wrapper: `.screen.active > .drill-body > QuestionCard + item` (as DrillSession/TestRunner); Review inside `.page > ol > li.card` (as AttemptReview).
(a) synopsis (amo, 1st pl., all parts, 17 rows x Active/Passive, first cell given) empty practice; a2) same in Test state with long forms
(b) noun paradigm puella (sg/pl, vocative, first given); (c) adjective pulcher 6 columns M/F/N sg./pl.; (d) principal parts 4 columns
(e) parse verb amo (5 fields), parse noun puella (2 fields); (f) Practice with result: synopsis, noun grid, parse verb, parse noun, wrong answers mixed in; plus the real Feedback overlay (?overlay=1)
(g) Review: synopsis, adjective, parse verb, parse noun.
Inputs filled with "amavissemus", "pulcherrimarum", etc. (every 3rd cell the correct key).

## Measurements
| width | page h-scroll | overflow elements | inputs h | buttons h | grid layout |
|---|---|---|---|---|---|
| 375 | no (375/375) | 0 | 38 | 38 (parse-option), 42 (Check) | cards: table/tr/td display:block, thead hidden, 1px card border, label (td::before, 12.8px) on every cell |
| 390 | no | 0 | 38 | same | same |
| 640 | no | 0 | 38 | same | same |
| 641 | YES: scrollWidth 792 > 641 | 69 (g2 Review adjective table 751px wide, 26 past right edge; 30 inputs with clipped text) | 38 | same | table, thead visible |
| 1024 | no | 30 clipped inputs (scrollW>clientW), all in (c)/(d) | 38 | same | table |
Input width at <=640: 313 (375), 328 (390), 578 (640). No tap target under 36px anywhere. No console errors.
Parse at 375: every group wraps within the viewport (max option right edge 359 of 375); tense/case groups wrap to 2 rows; no overflow. Parse options are on the same line as the label when they fit, otherwise below it.
At 375, grid in (a) is 17 cards ~188-209px each (~3.3k px tall); long but correct.

## Visual judgement (375 and 1024)
- 375: labels (Active/Passive, M sg.) readable but small and grey (12.8px); given cell is clearly greyed text vs bordered inputs; dash cells show "–" under their label; nothing overlaps. Feedback state: right = green border, wrong = red border plus green "correct form" below; Review: green correct, red strikethrough wrong with green key below. Parse feedback: green/red filled pill plus Right/Wrong tag plus "Correct: x". All distinguishable. Feedback overlay does not hide the last card (drill-body bottom padding clears it).
- 1024: tables clean except the adjective grid (below).

## Defects
1. Adjective (6-column) paradigm input cells clip typed text at every width >= 641 (inputs 62-72px wide inside the 680px .drill-body; "pulchrae" shows as "pulchra", "pulcherrimis" as "pulcherrim"). The student cannot see what they typed or check it. Also affects principal parts (d) at 641-ish (1 input clipped, 113px, long 'cognosc...' forms).
   - Component: src/features/items/GridItem.tsx:68 (`input.grid-input`), table at :60
   - CSS: `.grid-input` (classroom.css:109), `.grid-item th, .grid-item td` padding 6px 8px (:104), container `.drill-body` max-width 680px (global.css:159)
   - Fix: reduce cell padding and input padding / font-size for tables with >=5 columns (e.g. add a class `grid-wide` from `q.columns.length > 4`, `.grid-wide .grid-input{padding:6px 4px;font-size:.95rem}`), and/or raise the card-layout breakpoint for wide grids (apply the one-card-per-row rule at <=900px when columns > 4), or let `.drill-body` grow for grid items.
2. Review of a wide grid causes page-level horizontal scroll at 641px (scrollWidth 792 vs 641): the Review adjective table is 751px in a `.page` card ~560px wide, because `.grid-answer` text cannot wrap and each cell has a correct-form line. Occurs between 641px and about 800px; at 1024 it fits (942). Caveat: my wrong answers are artificially long; but "pulcherrimarum"/"pulcherrimis" are genuine superlative forms, so superlative adjective grids will hit this. Spec says nothing scrolls sideways.
   - Component: src/features/items/GridItem.tsx:156 (GridReview GridTable) and :162 (`span.grid-answer`)
   - CSS: `.grid-item` (classroom.css:103), `@media (max-width: 640px)` card breakpoint (:119)
   - Fix: same as 1 (wider breakpoint for grids with > 4 columns), or wrap the table in a `overflow-x:auto` container as a safety net, or `overflow-wrap:anywhere` on `.grid-answer, .grid-correct`.
3. (Minor, spec deviation) At <=640 the column name is shown above the input (td::before is display:block), not beside it. Legible and tidy, just not "beside". Selector `.grid-item td[data-col]::before` (classroom.css:124). Fix only if "beside" is wanted: make td display:flex with the label as a fixed-width first item; otherwise amend the spec wording.
4. (Minor) Right/wrong in grid inputs is signalled only by a 1px red/green border colour (`.grid-input.correct/.wrong`, classroom.css:113-114); wrong cells do get the green correct form underneath, so it is not ambiguous, but there is no tint or icon for colour-blind users. Optional: use the `--success-tint/--error-tint` backgrounds like `.answer-input.correct/.wrong` (global.css:176-177).

No defects found for: parse group wrapping, tap-target sizes, phone card layout (375/390/640), 640 vs 641 breakpoint switch (card -> table exactly at 641), feedback overlay overlap.

## What the harness could not reproduce
- Real pages' surrounding chrome: app shell/router, topbar contents (timer, score), q-nav strip, "Submit" row, auth/class gates, and the .page wrapper of the real AttemptResult route (I used a bare `.page > ol > li.card`, so the 641px page-scroll in defect 2 should be confirmed in the real route).
- Figtree webfont (no external fonts loaded; system-ui fallback used), so text widths differ slightly from production.
- Real touch input, on-screen keyboard resizing, iOS Safari / Android Chrome rendering and text-size settings (only desktop Chromium emulated at fixed widths).
- Real data: items from live pools (mine came from the real generators with fixed rng and my own synthetic answers); real Review parts from the server.
- Print styles, Practice interaction flow (typing, Enter, focus), dark mode (none in repo).
- Harness-only CSS: `.screen{min-height:0}` so sections stack; nothing else overridden.
Vite server (port 5199) was stopped.
