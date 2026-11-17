# Phone/tablet recheck of F10-F12 (grid card layout, label beside input, right/wrong marks)

Dir: /private/tmp/claude-502/-Users-aarav--claude-spares-spare-NgRusD/00b03b64-35d6-4682-97e9-52c2e39a3f3c/scratchpad/phone-check/
Harness: index.html, main.tsx, harness.css, vite.config.ts (imports real src and real global/classroom/app.css, no repo files touched), run.cjs (measure + shots), lab.cjs (label metrics), measurements.json.
Screenshots: shot-{375,390,640,641,900,901,950,1024}.png (full page); crop-{375,641,900,950,1024}-<section>.png.
Sections: syn-empty, syn-long (Test, filled "amavissemus"), syn-fb (mixed right/wrong), noun-empty/fb, adj-long (every cell "pulcherrimarum"), adj-fb (mixed), pp-long/fb (cognoscere), parse-v-empty/fb, parse-n-fb, rev-{syn,adj,noun,pp,parse,parse-n}.
Wrappers as in phone-check.md (.screen.active > .drill-body > QuestionCard + item; Review in .page > ol > li.card). git status clean at end; vite on 5391 stopped.

## Measurements (page h-scroll was none at every width; 0 elements past the viewport; 0 console errors)
| width | 6-col adj practice | adj inputs px | adj clipped | adj Review | 4-col principal parts | pp clipped | 2-col syn/noun |
|---|---|---|---|---|---|---|---|
| 375 | cards | 235 (214 w/ mark) | 0 | cards | cards | 0 | cards |
| 390 | cards | 250 (229) | 0 | cards | cards | 0 | cards |
| 640 | cards | 500 (479) | 0 | cards | cards | 0 | cards |
| 641 | cards | 501 (480) | 0 | cards | table, input 97-117 | 2 of 3 w/ marks (97px) | table |
| 900 | cards | 540 (519) | 0 | cards | table, 110-130 | 1 | table |
| 901 | TABLE | 74-77 (56 w/ mark) | 30/30 | table (819px, fits) | table 110-130 | 1 | table |
| 950 | TABLE | 74-77 (56) | 30/30 | table 868, fits | same | 1 | table |
| 1024 | TABLE | 74-77 (56) | 30/30 | table 942, fits | same | 1 | table |
Input height 38 everywhere, Check button 42, parse options 38: no tap target under 36. Table width is 648 at every width >= 901 because .drill-body is capped at 680px (global.css:159); the viewport width does not help.
Cards: label (td::before, 12.8px, flex-basis 70.4px) widest label text "Passive" 45px, "Singular" 49px, "Principal parts" is a row header not a label; nothing wraps. Cell input starts at x=86 inside the card and fills 235px at 375 (214-216 when a mark is present). Given cell and dash cell are display:flex with the same label-left layout.

## Answers
1. F10 PARTIAL/FAIL. Cards through 900, table at 901+: yes, exactly. No page h-scroll at any width and the wide Review is free of h-scroll at 641-800 (cards, 559px wide table not used). Clipped input text: none through 900, but at 901-1024 the 6-column practice table has inputs of 74-77px (56px once feedback marks are shown) and ALL 30 filled cells clip ("pulcherrimarum" shows "pulch"; screenshot crop-950-adj-fb.png: every cell reads "pulch"/"amab"). Same as the original defect, just moved to 901+. The breakpoint is the wrong variable: the squeeze depends on the 680px .drill-body, not on the viewport, so no viewport breakpoint can fix it. Also 4-column principal parts still clip at 641-1024 (97-110px inputs, "cognoscer" cut), not addressed by F10 because data-wide needs > 4 columns.
2. F11 PASS. At 375 the label sits left (70px basis), input fills the rest of the row (235px), vertically centred, rows 50px tall; labels M sg./F pl./Passive/Singular all single-line, small grey 12.8px but readable (crop-375-adj-fb.png, crop-375-syn-fb.png). Long answers ("pulcherrimarum") stay inside the input; the wrong-answer correct form wraps beneath at the input column, not under the label (the correct form is indented to the input, fine). Review at 375: label left, answer + mark, correct line under, no overflow (tdOvf 0). Slight nit: the correct-form line is not aligned with the label gutter but with the input, which is the better choice.
3. F12 PASS for visibility/names, with one caveat. Green check and red cross are visible next to every graded grid cell in practice feedback and in review (adj 30, syn 31, noun 11, pp 3 marks counted), each `span.grid-mark role="img" aria-label="Correct"|"Incorrect"` (0 without a name). Parse fields show a "check Right" / "cross Wrong" pill (mark aria-hidden, text "Right"/"Wrong" read by AT) in practice and in review. No mark is clipped or overflows its cell in any width. Caveat: in the 901+ 6-col table the mark takes 18px+gap from a 74px input and leaves 56px (defect 1). Marks themselves do not overflow.
4. No new broken layout in narrow 4-col grids, given cells, dash cells or noun grids (all card layout <=640, label left, no overflow). Only new effect is the mark shrinking the table inputs (defect 1) and principal parts at 641-1024 (defect 2).

## Visual judgement
- 375 adj feedback: tidy cards, green/red borders plus check/cross, correct form in green below the wrong one. Parse: readable; Number/Mood rows put the Wrong tag and "Correct: x" on the line below the options when they do not fit, fine.
- 641: principal parts with marks: inputs 97px, "cognoscere" cut to "cognoscer", "cognoscebamur" cut to "cognosceb".
- 950/1024 adj table: unusable, every input shows 4-5 letters. Review table at 1024 is clean (marks included, wraps ok).

## Defects
1. (High) 6-column practice/test table at 901-1024+ is as clipped as before F10 (inputs 56-77px, 30/30 clipped). Cause: data-wide card rule keyed to viewport (classroom.css:131 `@media (max-width: 900px)`), but the table sits in `.drill-body` max-width 680px (global.css:159), so the table is ~648px at every viewport >= 901. Fix: drop the viewport media query for practice/test; apply the card rules for `.grid-item[data-wide]` unconditionally when inside `.drill-body` (e.g. `.drill-body .grid-item[data-wide]` without a media query), keep the table for Review (`.page`, up to 1040px, fits at 901+) and print. Alternative: widen `.drill-body:has(.grid-item[data-wide]) { max-width: 1000px }`.
2. (Medium) 4-column principal-parts grid still clips long forms at 641-1024: 97px at 641, 110px at 900+ (classroom.css:109 `.grid-input` / :103 table in 680px drill-body). Fix: mark the grid wide when it has a single row of long forms (e.g. `data-wide` if columns > 3 in GridItem.tsx:22) or set `.grid-field .grid-input{min-width:9ch}` and let the table scroll; easiest is data-wide threshold `>= 4`.
3. (Low) The mark (`.grid-field` flex, classroom.css:140-143) eats 24px from table inputs; once defect 1 is fixed this only matters for the 4-col grids. Optional: place the mark absolutely inside the input's right padding.

## What the harness could not reproduce
Real route chrome (topbar, q-nav, Submit row, auth), Figtree webfont (system-ui used; widths differ a bit), real touch/on-screen keyboard, iOS Safari/Android rendering and text-size settings, Practice typing/Enter/focus flow, screen-reader output (accessible names checked from DOM only), real data (items from real generators with fixed seed, my synthetic answers; wrong answers artificially long), print, pronoun grids with long column headings (not rendered), harness-only `.screen{min-height:0}`.

## Recheck 2 (uncommitted fix: data-wide >= 4 columns, cards always inside .drill-body, 900px rule only outside it, maxLength 200)
Widths 375, 641, 900, 901, 950, 1024. Raw: measurements2.json; shots r2-shot-*.png, r2-crop-*.png (e.g. r2-crop-1024-pp-fb.png). No page h-scroll, 0 overflowing elements, 0 console errors at any width. Server on 5391 stopped; I changed no repo file (the modified files in git status are the coordinator's).

| width | adj 6-col practice | pp 4-col practice | clipped | syn/noun 2-col practice | Review adj / pp | Review syn / noun (2-col) |
|---|---|---|---|---|---|---|
| 375 | cards, input 235 (214 w/ mark) | cards | 0 | cards | cards | cards |
| 641 | cards 501 | cards 501 | 0 | table | cards | table |
| 900 | cards 540 | cards 540 | 0 | table | cards | table |
| 901 | cards 540 | cards 540 | 0 | table | table 819 | table |
| 950 | cards 540 | cards 540 | 0 | table | table 868 | table |
| 1024 | cards 540 | cards 540 | 0 | table | table 942 | table |

1. PASS: 6-col adjective and 4-col principal parts are cards at every width (practice, feedback, test), 0 clipped inputs ("pulcherrimarum", "cognoscebamur" fully visible), no page h-scroll.
2. PASS: Review of 4/6-col grids is cards through 900 and a table from 901 (819/868/942px), no clipping, no h-scroll (also fine at 641).
3. PASS: 2-col synopsis and noun grids unchanged (cards <=640, table at 641+, inputs 194-245px). 3-col grids not in the item set; same rule path (data-wide absent).
4. PASS: no regression. Label (70px) sits beside the input, rows 50px, marks visible with aria-label, given cell shows label + value, dash cell shows label + "–" (checked in screenshots and lab.cjs layout at 375, same as before). Cosmetic only: at 1024 the 4-col principal parts is a single narrow-looking card list (4 rows) in the 648px column; fine.
No new defects.
