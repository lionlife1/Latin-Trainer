> **Reviewed 2026-11-14** (review and decisions in `docs/teacher-tools/phase3-spec-review.md`). Waiting for
> the owner to read it before any implementation. Decisions marked *Assumed* are open to change.

# Teacher tools Phase 3: assessments, library, teacher-written items

Written and reviewed 2026-11-14. Source: `docs/teacher-tools/plan.md` (Phase 3, Building blocks, Data model),
`student-integration.md` (Phase 3 row), the Phase 2 spec in `docs/superpowers/archive/specs/`, and the
scope in `docs/superpowers/plans/2026-11-14-teacher-tools-handoff.md` (Step 4, R1 to R10).

**This spec was not brainstormed with the owner.** The scope (R1 to R10, and what is out), the six
decisions under "Decided with the owner" and the plan order were decided with the owner. Everything else was
decided by the author or the review, is marked *Assumed* below, and can be changed.

It builds on the Phase 2 fix wave (F1 to F12 and G1 to G7, commits `4318138` and `11bd88e`): in particular
F1 (the hidden shape's `id` is the pool id), F2 (gradebook best attempt) and F5 (oversized answers rejected).

## Goal

A teacher builds a test, quiz, homework or practice set once, from sections that draw on module questions,
vocab lists, the forms generators and their own questions; previews it; prints it with a key; and assigns it
to a class, where each student can get a different but equally hard version. Students see the sections,
their instructions and their points before, during and after the attempt.

## Decisions made without the owner

1. *Assumed.* Built-in templates (Vocab quiz, Synopsis quiz, Chapter test, Blank) are TypeScript constants.
   A teacher's saved template is an `assessments` row with `is_template = true`. Rejected: seeded template
   rows, which owner-only RLS cannot share.
2. *Assumed.* Save as template keeps the sources as they are (list, words, tag). Rejected: clearing them.
3. *Assumed.* Publishing snapshots the public section metadata (heading, instructions, count, points,
   shuffle, variants) onto a new `assignments.sections` column, which students can already read. Rejected:
   an RPC that reads the live assessment (it would change under students when the teacher edits, and needs a
   new security-definer function).
4. *Assumed.* `assignment_pool` gets `section`, `variant` and `position`. `attempt_items` is unchanged:
   positions stay global, section-major. Rejected: a `section` column on `attempt_items` (duplicates the
   pool).
5. *Assumed.* One variant index per attempt, the same for every variant section, stored on
   `attempts.variant`. The server picks the variant this student has used least, ties at random. Rejected:
   an independent pick per section (print versions A/B/C could not map onto it).
6. *Assumed.* Variants apply only to forms sections. Vocab, module and My-questions sections vary between
   students by random sampling, as today. The teacher picks 2 to 6 variants, default 4. Rejected: variants
   for every source.
7. *Assumed.* No item appears in two variants of a section. If the words cannot fill N variants, N drops to
   what they can fill and the teacher is told. Rejected: reusing items across variants.
8. *Assumed.* Shuffle is per section in the builder, and the assign dialog has one switch that can turn all
   shuffling off. Sections are never reordered. Rejected: shuffling section order.
9. *Assumed.* Every new type keeps its answers in one top-level `key`, as `grid` and `parse` do, so the
   server's `- 'key'` strip and `isRevealed` work unchanged. The authored order never reaches the pool: MC
   choices, the match right column and choice-inline options are shuffled at publish, and part ids are
   positional (`l1`, `r1`, `b1`, `o1`). Rejected: storing the authored order and shuffling only in the
   browser.
10. *Assumed.* The match item uses one layout at every width: each left item has a picker of the right
    column. Rejected for now: tap-left-then-right pairing on wide screens.
11. *Assumed.* A cloze item may have no word bank; students then type each blank. Same grader. Rejected:
    bank only.
12. *Assumed.* Teacher text is plain text. Blanks are written in square brackets (`[ambulat|it]`). Text is
    HTML-escaped at publish. Rejected: Markdown or rich text.
13. *Assumed.* Tags are slugs. The built-in list is a TypeScript constant; a custom tag is any other slug on
    a teacher's item. No tags table, no rename. Rejected: a `tags` table.
14. *Assumed.* Editing an assessment or a My-questions item never changes an assignment already published
    from it (the pool is a snapshot, as today).
15. `AssignmentBuilder` is retired (decided with the owner). Its three content panels become section
    sources; its delivery fields move to the assign dialog. "+ New assignment" on a class opens an assessment
    picker. Rejected: keeping it as a quick path.
16. *Assumed.* An assessment can be printed without assigning it.
17. *Assumed.* Vocab-list words are matched to the built-in pools first and converted from the headword
    only when that fails. Converted words are listed as "check in the preview". A converted verb has a
    passive unless its 4th part is a future participle or missing.
18. *Assumed.* Points: a section has an optional points-per-item. Without it, `mc`, `typein`, `tf` and
    `parse` are worth 1, and `match`, `cloze`, `choice-inline` and `grid` 1 per part.
19. *Assumed.* The kind sets the default mode in the assign dialog: quiz and test → test; homework and
    practice set → practice. The teacher can change it.
20. *Assumed.* The Vocab quiz template has a Matching section.
21. *Assumed.* A vocab section's formats are either directions (`l2e`, `e2l`) or `match5`, not both, so one
    word is never asked twice in a section. Words left over after the sets of 5 are not used; a list of 2 to
    4 words makes one smaller set.
22. *Assumed.* `assignment_sources` is read-only to teachers (select grant only); only the trigger writes it.
    No client reads it in this phase; it keeps old sources for later reports.

## Cut from Phase 3

| Cut | Why | Goes to |
|---|---|---|
| `short` items | Need the grading queue | Phase 4 |
| Passages, `translate`, derivatives library | Need passages, segments and the grading queue | Phase 4 and 5 |
| "Answer N of M" sections | Needs a choose-which UI, server grading of only the chosen items, and print wording. Not cheap | Later |
| Practice → Vocab study sets from assigned lists | Not selected by the owner | `OPEN-WORK.md` section 3 |
| Sharing questions between teachers | Needs a school model and moderation | Later |
| `strictMacrons`, teacher override, accept-for-everyone | Need the grading queue | Phase 4 |
| Accommodations | Per-student settings on the roster | Phase 5 |
| Analysis by tag, item analysis by section or part | `parts` and `section` are stored; the reports are separate work | Phase 5 |
| Tap-to-pair match layout on wide screens | One layout covers phones and desktops | Later |
| Tags and "combine lists" on vocab lists (Phase 1 leftover) | Not in R1 to R10 | Later |

## Data model

One new migration, `supabase/migrations/20261115000001_assessments_and_sections.sql`, after
`20261114000001`. It holds every SQL change in this phase. All of it is additive except one backfill, which
moves old `assignments.source` values into a teacher-only table (below). Until the owner applies
it, later plans may edit it in place (as the Phase 2 fix wave did); after that, changes need a new file.

### New tables

```sql
create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  kind text not null default 'quiz' check (kind in ('quiz', 'test', 'homework', 'practice')),
  instructions text not null default '' check (char_length(instructions) <= 2000),
  sections jsonb not null default '[]'
    check (jsonb_typeof(sections) = 'array' and jsonb_array_length(sections) <= 20
           and octet_length(sections::text) <= 100000),
  is_template boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index assessments_owner_idx on public.assessments (owner_id, updated_at desc);

create table public.teacher_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  item jsonb not null
    check (item ->> 'type' in ('mc', 'typein', 'tf', 'match', 'cloze', 'choice-inline')
           and octet_length(item::text) <= 20000),
  tags text[] not null default '{}'
    check (cardinality(tags) <= 12
           and array_position(tags, null) is null and '' <> all(tags)
           and array_to_string(tags, ' ') ~ '^([a-z0-9][a-z0-9-]{0,39})?( [a-z0-9][a-z0-9-]{0,39})*$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index teacher_items_owner_idx on public.teacher_items (owner_id, updated_at desc);
create index teacher_items_tags_idx on public.teacher_items using gin (tags);
```

A `before update` trigger on both tables calls a new `public.touch_updated_at()` (`set search_path = public`),
which sets `updated_at = now()`.

RLS, the same rule as `vocab_lists` (`20261031000002_rls.sql`):

```sql
alter table public.assessments enable row level security;
alter table public.teacher_items enable row level security;
create policy assessments_all on public.assessments for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid() and public.is_teacher());
create policy teacher_items_all on public.teacher_items for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid() and public.is_teacher());
revoke all on public.assessments, public.teacher_items from anon, authenticated;
grant select, insert, update, delete on public.assessments, public.teacher_items to authenticated;
```

The explicit grants are needed: the `grant select on all tables` in the RLS migration only covered tables
that existed then (`practice_sessions` does the same).

### New columns

```sql
alter table public.assignments
  add column assessment_id uuid references public.assessments (id) on delete set null,
  add column kind text check (kind is null or kind in ('quiz', 'test', 'homework', 'practice')),
  add column instructions text check (instructions is null or char_length(instructions) <= 2000),
  add column sections jsonb
    check (sections is null or (jsonb_typeof(sections) = 'array' and jsonb_array_length(sections) <= 20
                                and octet_length(sections::text) <= 100000)),
  add column settings jsonb not null default '{}' check (jsonb_typeof(settings) = 'object');
create index assignments_assessment_idx on public.assignments (assessment_id);

alter table public.assignment_pool
  add column section smallint check (section is null or section between 0 and 19),
  add column variant smallint check (variant is null or variant between 0 and 5),
  add column position int;
create index assignment_pool_section_idx on public.assignment_pool (assignment_id, section, variant);

alter table public.attempts add column variant smallint;
```

Old rows keep `null` in every new column, and `null` means "the Phase 2 behaviour". Policies on existing
tables are unchanged: students can read every column of `assignments` (and so `sections`, `kind`,
`instructions`), never `assignment_pool`. `assignments.source` stops carrying anything private (next section).

### Closing the assignments.source exposure

Students can select every column of `assignments`, and an old forms assignment's `source` holds each word's
full entry. A column grant would break the deployed teacher pages, which load `select('*')`, between applying
the migration and merging. So the full source moves to a teacher-only table, and `source` keeps only
`{"kind": ...}`:

```sql
create table public.assignment_sources (
  assignment_id uuid primary key references public.assignments (id) on delete cascade,
  source jsonb not null
);
alter table public.assignment_sources enable row level security;
create policy assignment_sources_select on public.assignment_sources for select to authenticated
  using (public.is_class_teacher(public.assignment_class(assignment_id)));
revoke all on public.assignment_sources from anon, authenticated;
grant select on public.assignment_sources to authenticated;

create function public.split_assignment_source() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.source - 'kind' <> '{}'::jsonb then
    insert into assignment_sources (assignment_id, source) values (new.id, new.source)
      on conflict (assignment_id) do update set source = excluded.source;
    update assignments set source = jsonb_build_object('kind', new.source ->> 'kind') where id = new.id;
  end if;
  return null;
end $$;
create trigger assignments_split_source after insert or update of source on public.assignments
  for each row execute function public.split_assignment_source();

-- one-time backfill
insert into public.assignment_sources (assignment_id, source)
  select id, source from public.assignments where source - 'kind' <> '{}'::jsonb;
update public.assignments set source = jsonb_build_object('kind', source ->> 'kind')
  where source - 'kind' <> '{}'::jsonb;
```

It is an `after` trigger because the child row needs the parent to exist. The guard stops it re-firing on its
own update. Old clients keep working: they insert a full source as before, and the trigger moves it. The
backfill is the one deliberate change to old rows.

### JSON shapes (TypeScript, `src/lib/assessment.ts`)

```ts
export type AssessmentKind = 'quiz' | 'test' | 'homework' | 'practice';
export type TeacherItemType = 'mc' | 'typein' | 'tf' | 'match' | 'cloze' | 'choice-inline';

/** assessments.sections[i]: settings and a source, never frozen items. */
export interface Section {
  id: string;                    // short random id, stable within the assessment (React key)
  heading: string;               // <= 120 chars
  instructions: string;          // <= 1000 chars, plain text
  source: SectionSource;
  count: number | null;          // items per attempt; null = every item the source gives
  pointsPerItem: number | null;  // null = each item's default points
  shuffle: boolean;
}

export type VocabFormat = VocabDirection | 'match5';   // match5: matching sets of 5

export type SectionSource =
  | { kind: 'modules'; moduleIds: string[]; badges?: string[]; types?: ('typein' | 'mc')[] }
  | { kind: 'vocab'; listId: string; formats: VocabFormat[] }
  | { kind: 'forms'; config: StoredFormsConfig; wordsFrom?: { listId: string } }
  | { kind: 'teacher'; pick: { itemIds: string[] } | { tag: string; types?: TeacherItemType[] } };

/** assignments.sections[i]: what students may see, snapshotted at publish. */
export interface SectionSnapshot {
  heading: string;
  instructions: string;
  count: number;           // items per attempt, already capped by the section's pool
  points: number | null;   // points per attempt; null when it can differ between students
  shuffle: boolean;        // effective: section.shuffle && settings.shuffle
  variants: number;        // 0 = none, else the assignment's variant count
}

/** assignments.settings: delivery choices not covered by existing columns. */
export interface AssignmentSettings { shuffle: boolean; variants: number } // variants: 0 or 2..6
```

`modules` is today's `AssignmentSource` member unchanged. `vocab` is today's member with `directions`
replaced by `formats`, which adds `match5`. `forms` is today's member plus `wordsFrom`: when set, the
config's `words` are ignored and the words come from that list at publish (R8). `AssignmentSource`
(`src/features/teacher/api.ts`) gains `{ kind: 'assessment' }`, written to `assignments.source` (still
`not null`) for assessment assignments; the trigger leaves it alone. The sources stay on the assessment,
which students cannot read. `PoolItem` (`src/lib/vocab.ts`) gains `section?: number`,
`variant?: number | null` and `position?: number`. For teacher reads, `AssignmentRow` gains `assessment_id`, `kind`, `instructions`, `sections` and `settings`;
`getAssignmentPool` also selects `section`, `variant` and `position`.

### SQL functions

| Function | Change |
|---|---|
| `grade_parts(jsonb, jsonb)` | `create or replace`, same signature: new branches for `tf`, `match`, `cloze`, `choice-inline` (below). Keeps F6's `search_path`. |
| `start_attempt(uuid)` | `create or replace`, same signature. Sectioned path below; `sections is null` runs the Phase 2 body unchanged. |
| `get_attempt_items(uuid)` | Drop and create: returns `(pool_id uuid, "position" int, question jsonb, points numeric, section smallint)`. Body as after F1 (hidden shape strips `answers`, `correct`, `explanation`, `key` and sets `id` to the pool id), plus `p.section`. Grants re-issued. |
| `submit_test`, `record_practice_response_v2`, `finish_practice` | Unchanged. They grade through `grade_parts` and sum `earned`, so the new types work. |
| `gradebook` | Unchanged (F2's version). Scores are attempt totals; sections do not change them. |
| `item_analysis` | Unchanged. `top_wrong` only lists responses with a text `given`, so `tf` gets a list ("true"/"false") and the object types show a percentage only. Variant items appear as separate rows. |

`start_attempt`, sectioned path:

```sql
-- after the enrolment, open-attempt and max_attempts checks, when a.sections is not null:
select max(variant) + 1 into vc from assignment_pool where assignment_id = a.id and variant is not null;
if vc is not null then
  select v into k from generate_series(0, vc - 1) v
  order by (select count(*) from attempts x
            where x.assignment_id = a.id and x.student_id = auth.uid() and x.variant = v), random()
  limit 1;
end if;
insert into attempts (assignment_id, student_id, total, variant) values (a.id, auth.uid(), 0, k) returning id into att;
for s in
  select (e.ord - 1)::int as idx, greatest(coalesce((e.value ->> 'count')::int, 0), 0) as cnt,
         coalesce((e.value ->> 'shuffle')::boolean, true) as shuf
  from jsonb_array_elements(a.sections) with ordinality e(value, ord) order by e.ord
loop
  insert into attempt_items (attempt_id, position, pool_id)
  select att, pos + (row_number() over (order by case when s.shuf then random() end, d.position, d.item_key))::int - 1, d.id
  from (select p.id, p.position, p.item_key from assignment_pool p
        where p.assignment_id = a.id and p.section = s.idx and (p.variant is null or p.variant = k)
        order by random() limit s.cnt) d;
  get diagnostics n = row_count;
  pos := pos + n;
end loop;
if pos = 0 then raise exception 'assignment has no questions' using errcode = 'P0001'; end if;
update attempts set total = (select coalesce(sum(p.points), 0) from attempt_items i
                             join assignment_pool p on p.id = i.pool_id where i.attempt_id = att)
where id = att;
```

So a section with more rows than `count` samples `count` of them; a section without shuffle shows them in
`position` order; positions run across sections in section order. The exception rolls back the attempt row.

`grade_parts`, new branches (the TypeScript `grade` mirrors each line):

```sql
elsif t = 'tf' then
  ok := jsonb_typeof(g) = 'string' and jsonb_typeof(q -> 'key') = 'boolean'
        and lower(btrim(g #>> '{}')) = q ->> 'key';
  parts := jsonb_build_array(jsonb_build_object('id', 'answer', 'ok', coalesce(ok, false)));
elsif t = 'match' then   -- one part per left item, in left order
  parts := (select coalesce(jsonb_agg(jsonb_build_object('id', l.value ->> 'id', 'ok', coalesce(
              is_obj and jsonb_typeof(g -> (l.value ->> 'id')) = 'string'
              and g ->> (l.value ->> 'id') = q -> 'key' ->> (l.value ->> 'id'), false)) order by l.ord), '[]')
            from jsonb_array_elements(coalesce(q -> 'left', '[]')) with ordinality l(value, ord));
elsif t = 'choice-inline' then   -- one part per blank, in blanks order; exact option id, as match
  ... same loop over q -> 'blanks': is_obj and jsonb_typeof(g -> id) = 'string'
      and g ->> id = q -> 'key' ->> id
elsif t = 'cloze' then           -- one part per blank; any accepted answer, as typein
  ... same loop over q -> 'blanks': latin_normalize(g ->> id) <> '' and exists (select 1 from
      jsonb_array_elements_text(<q -> 'key' -> id if an array, else '[]'>) a
      where latin_normalize(a) = latin_normalize(g ->> id))
```

## Item types

Added to `src/lib/types.ts`. Answers live in `key`; the public shape is the question without `key` and
`explanation`. Text fields are HTML (escaped at publish), like `prompt` today.

```ts
export interface TFQuestion extends QuestionBase {
  type: 'tf';
  key: boolean;
}

export interface MatchQuestion extends QuestionBase {
  type: 'match';
  left: { id: string; text: string }[];    // ids l1..ln, authored order
  right: { id: string; text: string }[];   // answers and extra distractors, shuffled at publish; ids r1..rm by shown position
  key: Record<string, string>;             // left id -> right id
}

export interface ClozeQuestion extends QuestionBase {
  type: 'cloze';
  text: string;                            // HTML with {{b1}}, {{b2}} ... where the blanks go
  blanks: { id: string }[];                // b1..bn in text order
  bank: string[];                          // sorted; [] = no bank, students type
  key: Record<string, string[]>;           // blank id -> accepted answers
}

export interface ChoiceInlineQuestion extends QuestionBase {
  type: 'choice-inline';
  text: string;                            // HTML with {{b1}} ... placeholders
  blanks: { id: string; options: { id: string; text: string }[] }[];  // shuffled at publish; ids o1..om by shown position
  key: Record<string, string>;             // blank id -> the correct option id
}

export type DrillQuestion = TypeInQuestion | MCQuestion | GridQuestion | ParseQuestion
  | TFQuestion | MatchQuestion | ClozeQuestion | ChoiceInlineQuestion;
```

`PublicQuestion` gains `Omit<X, 'key' | 'explanation'>` for each. `Given` is unchanged
(`string | Record<string, string>`).

| Type | Given | Parts (ids, order) | Right when | Default points | Print copy | Print key |
|---|---|---|---|---|---|---|
| `tf` | `'true'` or `'false'` | `answer` | given equals `key` | 1 | "True / False" to circle | True or False |
| `match` | left id → right id | left ids, `left` order | the chosen right id is the key's | 1 per left item | left items numbered with a blank, right column lettered A, B, C... | "1 C, 2 A, ..." |
| `cloze` | blank id → text | blank ids, `blanks` order | normalized text is an accepted answer | 1 per blank | text with numbered lines, bank in a box above | numbered answers, alternatives with "/" |
| `choice-inline` | blank id → option id | blank ids, `blanks` order | the chosen option id is the key's | 1 per blank | text with "(superat / superāret)" to circle | the text with the right option in bold |

Blank or missing answers are wrong. A right-column item may be chosen for two left items; each pair is
graded on its own. Right-column texts are unique: `toQuestion` and `buildVocabMatch` merge entries with the
same NFC text, and pairs with the same right text key to the same right id. `match` and `choice-inline`
grade by id, never by text, because `latin_normalize` strips macrons and would grade *puella* for *puellā*;
so options and right entries that differ only in macrons are allowed and graded correctly. Print finds the key option the same way (`print.ts` today matches MC text). `correctDisplay` gains a branch per type (item analysis and practice feedback), and
`isRevealed` needs no change because the answers are under `key`.

**Leaks checked.** Each type is checked against the Phase 2 lesson: `id` becomes the pool id; part and
option ids are positional; the right column, the options and MC choices are shuffled at publish; the cloze
bank is sorted. No visible field depends on which answer is right. This holds in test mode only. In practice
mode `get_attempt_items` delivers every key by design, because `DrillSession` grades in the browser; the
assign dialog says so (below).

### My questions (authoring shape, `src/lib/teacherItems.ts`)

`teacher_items.item` holds what the teacher typed, in plain text:

```ts
interface TeacherItemBase { prompt: string; hint?: string; explanation?: string }
export type TeacherItem = TeacherItemBase & (
  | { type: 'mc'; choices: string[]; correct: number }                    // 2..6 choices
  | { type: 'typein'; answers: string[] }                                 // 1..10
  | { type: 'tf'; answer: boolean }
  | { type: 'match'; pairs: { left: string; right: string }[]; extras: string[] }  // 2..12 pairs, 0..4 extras
  | { type: 'cloze'; text: string; extras: string[]; bank: boolean }      // "Mārcus [ambulat|it] in viā."
  | { type: 'choice-inline'; text: string });                             // "ut inimīcōs [superāret|superat]"
```

- `validateTeacherItem(item): string[]` returns readable errors (empty blank, duplicate option, too many
  pairs). MC is still graded by normalized text, so MC choices that are equal after `normalize` are
  rejected: "Two choices differ only in macrons; use a Choose-the-form question instead." Choice-inline
  options and match entries are graded by id and may differ only in macrons. The editor and publish both
  use it.
- `toQuestion(item, itemKey, rng): DrillQuestion` escapes the text, turns `[a|b]` into `{{bN}}` placeholders
  and `key`, shuffles, and assigns positional ids. In a cloze, all bracketed spellings are accepted; the
  first goes in the bank. In a choice-inline, the first is right and the rest are the wrong options.
- Badge: `MULTIPLE CHOICE`, `TYPE THE ANSWER`, `TRUE OR FALSE`, `MATCHING`, `FILL IN`, `CHOOSE THE FORM`.

## Sections and sources

`resolveAssessment(assessment, settings, deps, rng)` in `src/lib/assessment.ts` is a pure function (data
loaders passed in as `deps`). It returns `{ snapshots: SectionSnapshot[]; rows: PoolItem[]; notes: string[] }`
and is used by preview, print and publish.

| Source | Resolved at publish into |
|---|---|
| `modules` | `shuffleModuleChoices(modulePool(moduleIds, badges, types), rng)`; both move from `AssignmentBuilder.tsx` to `src/lib/assessment.ts` |
| `vocab`, directions | `buildVocabQuestions(listItems, directions, fallback, rng)`, as today |
| `vocab`, `match5` | `buildVocabMatch(listItems, rng)`: random sets of 5 headwords and their definitions as `match` items, key `vocab-match:<sorted item ids>`, 1 point per pair |
| `forms` | words from `fromStoredFormsConfig(config, pools)` (stored words turned back into `MorphWord`s) or from `wordsFrom` (converted, see below), then `buildFormsPool(config, rng, pools, target?)` |
| `teacher`, by hand | each chosen item, through `toQuestion` |
| `teacher`, by tag | every item of the teacher's with that tag (and type, if given), through `toQuestion`; `count` = N |

Rules:

- **Item keys** are prefixed so they stay unique in the pool: `s2|syn|verb:moneo...`, `s3v1|...` for a
  variant, `s4|ti:<uuid>` for a teacher item. The generators' own `item_key === id` stays.
- **Points.** `pointsPerItem` overrides every item's points in the section; otherwise the item's default.
- **Count.** `count` is capped by the section's pool. If a section samples (more rows than `count`) and its
  rows differ in points, the builder warns that students may get different totals; `points` in the
  snapshot is then `null`.
- **Position** is the row's index in the section (and variant), in source order.
- **Shuffle.** `start_attempt` shuffles within a section when the snapshot says so; sections keep their
  order. MC choices are still shuffled in the browser, as now.
- **Variants (R9).** With "Different words for each student" on, each forms section is built as N variant
  sets. The generator is asked for enough items: `buildFormsPool` takes an optional `target`, and the variant
  builder passes the section's `count` × N (without `target`, parse and make draw `count * 3` as today). In a
  section, the section's `count` is used and the config's own `count` is ignored. Variant 0 is `count`
  random items from the generated pool. For each later variant, slot *i* takes an unused item with the same
  signature as variant 0's slot *i*: type, points, and for `grid` the column headers and row labels, for
  `parse` the field ids. A section can fill as many variants as it has complete sets. All forms sections of
  an assignment use the same N: the smallest count among the sections that can fill at least 2. A section
  that cannot fill 2 is published without variants (it samples), and the builder says so for each case
  ("Only 3 versions are possible with these words"; "Synopsis: too few words for versions, students get
  random words"). Variant rows have `variant` 0..N-1; `start_attempt` picks one index per attempt.

### Vocab-list words in forms (R8)

The lexicon carries morphology only in its headword text (`abdō, -ere, -didī, -ditus`; `aciēs, -ēī, f.`;
`accolo, accolere, accolui, accultus`). The built-in `CORE_*` pools are made by `scripts/build-seed.ts`
from Whitaker's DICTLINE stems, which the browser does not have. So conversion has two steps, in
`src/lib/morph/fromHeadword.ts`:

```ts
export type Converted =
  | { ok: true; word: MorphWord; via: 'pool' | 'rules' }
  | { ok: false; reason: string };   // "irregular verb", "no perfect in the entry", "plural-only noun", ...
export function wordFromLexicon(e: { headword: string; lemma: string; pos: string; definition: string },
                                pools?: FormsPools): Converted
```

1. **Pool lookup.** Index the pools by `lemmaKey` of the first principal part (verbs), `nom` (nouns,
   adjectives) and the pronoun entry. The verb pool is `trainerPool()`, whose 136 hand-written verbs have no
   `pp1`, so the first part is taken as `principalParts` and `entryOf` print it: `pp1`, else `firstPart`,
   else `IRREGULAR_PARTS`. When more than one matches (*iacēre* / *iacere*), keep the one whose infinitive or
   genitive ends with the headword's 2nd part, as `coreTrainerVerbs` and `matchHeadword` do in
   `scripts/lexicon/`. *sum, esse, fuī, futūrus* and *amō, -āre* must resolve `via: 'pool'`.
2. **Rules** when the lookup fails:
   - An abbreviated part (`-ere`, `-didī`, `-tris`) is expanded against the first part. If it starts with a
     vowel, it is added to the present stem (verbs: `amō` → `am` + `āvī`) or replaces the nominative from its
     last vowel (nouns, adjectives: `corpus` → `corp` + `oris`). If it starts with a consonant, it replaces
     the base from that consonant's last occurrence (`abd` + `didī` → `abdidī`, `pater` + `tris` → `patris`).
   - Verbs: the 1st part's ending (`ō`, `eō`, `iō`, `or`, `eor`, `ior`) and the infinitive's give the
     conjugation; the 3rd part gives `perf`, the 4th `ppp`; `... sum` makes a deponent; a 4th part in `-ūrus`
     or no 4th part sets `noPassive`. Entries in `esse`, `ferre` or `-eō, -īre` that are not in the pool fail
     ("irregular verb").
   - Nouns: the genitive ending gives the declension (`-ae` 1, `-ī` 2, `-is` 3, `-ūs` 4, `-ēī` 5, with `-eus`
     and `-ius` nominatives kept in the 2nd); the stated gender (`m.`, `f.`, `n.`, two genders = `c`); the
     i-stem rule of A&G §§ 75-76 (parisyllabic `-is`/`-ēs`, neuters in `-e`, `-al`, `-ar`, monosyllables on
     two consonants, `-ns`/`-rs`).
   - Adjectives: three parts with a feminine in `-a` are 1st/2nd; a feminine in `-is` or a neuter in `-e`
     are 3rd (three or two terminations); a genitive in `-is` is 3rd, one termination. Comparison is regular.
   - The meaning is the first sense of the list's definition (a list item's `definition_override` counts as
     the list's definition), clipped as the seed script does: `clipGloss` for nouns and adjectives,
     `shortGloss` for verbs.
3. `lemmaKey` (`scripts/lexicon/compose.ts`), `headwordGenitive` and `headwordGenders`
   (`scripts/lexicon/match.ts`), `firstSense` and `clipGloss` (`scripts/lexicon/gloss.ts`), and `shortGloss`
   (`scripts/lexicon/verbs.ts`) move to `src/lib/headword.ts`; the scripts import them from there.
   `npm run seed` output must not change.

**Coverage**, measured on `supabase/seed-lexicon.sql` with a throwaway script while writing this spec:

| | Core rows | In the pools | Rules alone reproduce the pool entry | Non-core rows with a convertible shape |
|---|---|---|---|---|
| Verbs | 812 | 793 (98%) | 725 of 793 (91%) on conjugation and perfect stem | 5,227 of 5,923 (88%); 580 give no perfect |
| Nouns | 775 | 756 (98%) | 743 of 756 (98%) on declension and stem; i-stem rule agrees on 307 of 309 | 14,263 of 14,462 (99%) |
| Adjectives | 427 | 364 (85%) | 364 of 364 (100%) on declension and stem | 7,390 of 7,390 (100%) |

The verb misses are vowel-stem 1st conjugation (`creō`), `-uō` verbs, compounds of `iaciō` and reduplicated
compound perfects; Plan 3 fixes what it can. A coverage test reads the seed file and pins the numbers
reached then as its thresholds; the table above is a snapshot, not the target. Since core words go through the pool first, a typical textbook list converts almost entirely. What
rules cannot know: intransitive verbs (Whitaker's flag is not in the headword, so they get a passive, the
same known limit as `OPEN-WORK.md` section 2), irregular comparison, defective nouns.

**Report to the teacher**, in the forms panel when a list is chosen: "Chapter 12: 18 of 24 words can be
used. Not used: *fīō, fierī, factus sum* (irregular verb not in the built-in set); *cōpiae, -ārum* (plural
only). 4 words are not verbs, nouns or adjectives. Made from the dictionary entry, so check them in the
preview: *ēvastō*, *leaena*." Words of the wrong kind for the generator (nouns for a synopsis) are counted
as skipped, not as failures.

## Tags

- `src/lib/tags.ts`: `BUILT_IN_TAGS: { slug: string; label: string; group: string }[]`, following the NLE
  syllabus. Groups and slugs: **Nouns and adjectives**: `declensions`, `i-stems`, `adjectives`,
  `comparison`, `adverbs`, `pronouns`, `numerals`. **Verbs**: `principal-parts`, `present-system`,
  `perfect-system`, `passive-voice`, `deponents`, `irregular-verbs`, `imperatives`, `infinitives`,
  `participles`, `gerunds-gerundives`, `subjunctive-forms`. **Case uses**: `nominative-uses`,
  `genitive-uses`, `dative-uses`, `accusative-uses`, `ablative-uses`, `vocative`, `locative`. **Syntax**:
  `ablative-absolute`, `indirect-statement`, `purpose-clause`, `result-clause`, `indirect-command`,
  `indirect-question`, `cum-clause`, `fear-clause`, `conditionals`, `relative-clause`,
  `relative-characteristic`, `quin-clause`, `independent-subjunctive`, `sequence-of-tenses`,
  `passive-periphrastic`. **Vocabulary and culture**: `vocabulary`, `derivatives`, `mottoes-phrases`,
  `abbreviations`, `mythology`, `roman-history`, `roman-life`, `geography`, `reading-comprehension`.
- `toSlug(text)` lowercases, strips macrons, turns spaces into `-`, and drops anything else. "Ch. 18" →
  `ch-18`. The tag picker suggests built-in tags and the teacher's own (`select distinct unnest(tags)` over
  their items), and accepts a new one.
- `MODULE_TAGS: Record<moduleId, string[]>` maps module badges onto built-in tags: M0 `subjunctive-forms`,
  M1 `sequence-of-tenses`, M2 `independent-subjunctive`, M3 `purpose-clause` `result-clause`
  `indirect-command`, M4 `cum-clause`, M5 `indirect-question`, M6 `fear-clause`, M7 `conditionals`, M8
  `quin-clause`, M9 `relative-characteristic`, M10 `participles` `ablative-absolute`, M11
  `indirect-statement` `infinitives`, M12 `gerunds-gerundives` `passive-periphrastic`, M13 the case-use tags.
  In this phase the modules panel shows these tags and can filter the module list by one; analysis by tag
  (Phase 5) will use the same map.

## Teacher UI

Nav (`src/components/ClassroomShell.tsx`): **Classes · Create · Library**.

| Route | Screen |
|---|---|
| `/t/create` | Create home: "Start from" (four built-in templates, then the teacher's templates) and "My assessments" (title, kind, sections, last edited; Edit, Assign, Print, Duplicate, Delete) |
| `/t/create/:assessmentId` | Builder, with tabs Edit and Preview |
| `/t/create/:assessmentId/assign` | Assign dialog; `?class=` preselects a class |
| `/t/create/:assessmentId/print` | Print an assessment that is not assigned |
| `/t/c/:classId/new` | "+ New assignment": pick one of my assessments (→ assign with this class), or create a new one |
| `/t/library` | Library: My questions and Vocab lists |
| `/t/library/questions/new?type=`, `/t/library/questions/:itemId` | My-questions editor |
| `/t/vocab`, `/t/vocab/:listId` | Unchanged URLs, reached from Library |
| `/t/a/:assignmentId/print` | Unchanged URL, now printing sections and variants |

**Builder.** Title, kind (quiz, test, homework, practice set), instructions (plain text area). Then the
sections, each a card: heading, instructions, a source select (Module questions, Vocab list, Forms,
My questions) with its panel, items per attempt, points per item (blank = default), shuffle. Buttons per
section: Up, Down, Duplicate, Delete; "+ Add section" at the end. No drag and drop. A Save button writes the
row; leaving with unsaved changes asks first. Under each section: "Pool: 24 items · 10 per attempt · 10
points", or what is missing ("Choose a vocab list"). "Save as template" copies the row with
`is_template = true`.

**Source panels.** `ModulesSource` and `VocabSource` are extracted from the inline JSX in
`AssignmentBuilder.tsx` as components; `VocabSource` also offers "Matching sets of 5" as a format;
`FormsSource.tsx` is reused and gains "Words from: built-in dictionary / a vocab list" with the report
above. `TeacherItemsSource` offers "Pick questions" (a filterable list of my questions with checkboxes) or
"Random by tag" (tag, optional types, N, and "12 questions have this tag").

**Preview.** Resolves the assessment in the browser with one random draw and shows it grouped by section,
variant A first, with a version switcher (A, B, C...) when there are variants: "Student view" renders each item through the registry's `Test` renderer (answers can be tried, nothing is
saved); "Answer key" renders `PrintKey`. Notes from `resolveAssessment` (unequal points, fewer variants,
unconverted words) appear at the top.

**My questions.** A list with type and tag filters, and "New question" per type. The editor has a live
preview through the registry. Every Latin text field is a `LatinField` (macron buttons).

| Type | Fields |
|---|---|
| `mc` | prompt; 2 to 6 choices with a radio for the right one |
| `typein` | prompt; accepted answers, one per line |
| `tf` | statement; True or False |
| `match` | prompt; rows of left and right (2 to 12); extra right-column words (0 to 4) |
| `cloze` | prompt; text with `[answer|other spelling]` blanks; extra bank words; "Show a word bank" |
| `choice-inline` | prompt; text with `[right|wrong|wrong]` blanks (2 to 4 options) |
| all | hint, explanation, tags |

**Templates** (`src/lib/templates.ts`; the student-facing headings and instructions are written by
`latin-content-writer`):

| Template | Kind | Sections |
|---|---|---|
| Vocab quiz | quiz | Meanings (vocab, L→E, 10); Latin words (vocab, E→L, 5); Matching (vocab, matching, 2 sets of 5) |
| Synopsis quiz | quiz | Synopsis (forms synopsis, person "different for each student", indicative, 1 per attempt) |
| Chapter test | test | Vocabulary (vocab, L→E, 10); Forms (forms paradigm, 2); Parsing (forms parse, 5); Questions (My questions by tag, 5) |
| Blank | quiz | none |

Sources start empty; the builder marks what to fill in. Start-from-template inserts a row and opens it.

**Assign dialog.** Class; mode (default from the kind; under Practice: "Students can see answers as they
go; use Test for graded work."); due date; time limit (test); attempts; reveal
answers (test); "Different words for each student" with a 2 to 6 versions select (shown only when there is a
forms section); "Shuffle question order" (on). It shows the section summary and the warnings the old
builder had (module questions in test mode). Publish runs `resolveAssessment`, then
`publishAssessment(input, snapshots, rows)` in `api.ts`: it inserts the assignment (`assessment_id`, `kind`,
`instructions`, `sections`, `settings`, `source: { kind: 'assessment' }`, `question_count` = the sum of the
section counts) and the pool rows with `section`, `variant` and `position` in chunks of 500, deleting the
assignment if a chunk fails, as `publishAssignment` does today.

**Retired.** `AssignmentBuilder.tsx` and `NewAssignment.tsx` are deleted once the class route shows the
picker; their tests move to the panel and dialog tests. Old assignments are listed, printed and analysed
as before. The class's assignment table shows the kind when there is one.

## Student UI

- **Class** (`MyAssignments.tsx`): the tag shows the kind (Quiz, Test, Homework, Practice set) when the
  assignment has one, otherwise Practice or Test as now. Colour still follows the mode.
- **Intro card** (`RunAssignment.tsx`): the kind as the badge; the instructions; for sectioned work an
  outline ("1. Vocabulary · 10 pts", "2. Synopsis · 12 pts"; "5 questions" when `points` is null) instead of
  the Questions stat; then time limit, attempts and due date as today. `StudentAssignment` selects `kind`,
  `instructions` and `sections`.
- **Test runner** (`TestRunner.tsx`): above the question, the section heading and its instructions (shown on
  the section's first question, collapsed to the heading after). The question grid is split by section, each
  group under its heading, numbers running on. One question per screen stays.
- **Practice** (`DrillSession`): a new optional prop gives the section for each question; a header shows its
  heading and instructions when a new section starts.
- **Result** (`AttemptReview` in `AttemptResult.tsx`): under the total, a per-section line ("Vocabulary
  9/10 · Synopsis 10/12"), summed in the browser from `get_attempt_items` (section, points) and the
  student's responses (`earned`), and the review list grouped under section headings. `AttemptReview` fetches
  `assignments.sections` for the headings. The teacher's attempt detail (`AttemptDetail.tsx`) renders
  `AttemptReview`, so it gets both.
- **New inputs** (registry, `src/features/items/`), each with `Practice`, `Test`, `Review`, `Answer`,
  `PrintCopy`, `PrintKey` and `answered` (none, partial, full):

| Item | Input at 375px and up | Practice feedback | `answerIsHtml` | `showsScore` |
|---|---|---|---|---|
| `tf` | Two large buttons, True and False; keys T and F | As MC | no | no |
| `match` | One row per left item: its text, then a native select of the right column; the right column is also listed below on wide screens | Each row marked right or wrong with the correct match; "4/5 correct" | yes | yes |
| `cloze` | Text with inline blanks; tap a blank, then a bank chip (the next empty blank is selected after); a used chip greys out but stays usable; tapping a filled blank clears it; the bank sticks to the bottom on phones. With no bank, each blank is a small text input | Per blank, with the accepted answer | yes | yes |
| `choice-inline` | The sentence with a small segmented choice at each blank; wraps on phones | Per blank, with the right option | yes | yes |

Marks for right and wrong use a symbol and text as well as colour (F12).

## Print

- `src/lib/print.ts`: `buildPrintVersions` takes sections:
  `(sections: { snapshot: SectionSnapshot; rows: PoolItem[] }[], versions, seed, redraw)` and returns
  `PrintVersion { label; sections: { heading; instructions; points; questions: PrintQuestion[] }[] }`.
  For a variant section, version A prints variant 0, B variant 1, C variant 2 (versions are capped by the
  variant count). Other sections draw once, or per version with `redraw`, as today; they keep their order
  when shuffle is off. A legacy pool (no sections) is one untitled section, so old printouts do not change.
- `PrintAssignment.tsx` becomes a `PrintView` used by both print routes: section headings, instructions and
  points per section on the copy; the key grouped by section; numbering continuous.
- Printing an unassigned assessment resolves it with `seededRng(seed)`, so a reprint matches; the options
  add "Different words on each version" when there is a forms section.

## Backward compatibility and migration safety

- Old assignments have `sections` null. `start_attempt` runs the Phase 2 body for them, `get_attempt_items`
  returns `section` null, print and the student screens show them exactly as now. A SQL test pins this.
- Old clients still work against the new database: inserts without the new columns get nulls and defaults,
  and an extra column in `get_attempt_items` is ignored.
- The new client needs the migration: it selects `kind`, `sections` and `instructions` and writes the pool
  columns. The order is: apply `20261114000001` (Phase 2) and then `20261115000001` to the LatinIQ project
  from the owner's computer, then merge. `main` deploys on every push.
- `get_attempt_items` is dropped and recreated inside the migration transaction, with its grants.
- The one change to old rows is the `assignments.source` backfill: full sources move to
  `assignment_sources` and `source` keeps only `kind`. No client reads `source`, and old clients' inserts are
  split by the trigger, so reverting the client is still safe. Everything else old is left as it was.

## Testing

- **Shared grader cases.** `tests/fixtures/grade-cases.json`: `[{ name, q, given, expect: { right, outOf,
  parts } }]`, covering all eight types (the existing mc, typein, grid and parse rows move here). Vitest
  (`grading.test.ts`) runs `grade` over it. A new `supabase/tests/grade_cases.test.sql` loads the same file
  with `\set cases \`cat tests/fixtures/grade-cases.json\`` (`scripts/test-db.sh` runs from the repo root) and
  checks `grade_parts(c -> 'q', c -> 'given') = c -> 'expect'` for each row. It includes options that differ
  only in macrons (`match` and `choice-inline` grade by id) and a `match` with two left items sharing one
  right text.
- **Vitest**: `toQuestion` and `validateTeacherItem` per type, including that ids and orders do not follow the
  key over many seeds, the MC macron-only rejection and merged right texts; `buildVocabMatch` (sets of 5, keys,
  merged definitions); the bracket parser; `wordFromLexicon` for model words and failure reasons, plus a
  coverage test over the core rows of `seed-lexicon.sql` with pinned thresholds; `resolveAssessment`
  (points, counts, item keys, notes, module choices shuffled); the variant builder (`target`, equal
  signatures, N from the sections that can fill 2, a section left to sampling, no reuse);
  `fromStoredFormsConfig`; pool lookup of hand-written verbs;
  `buildPrintVersions` with sections and variants, and unchanged legacy output; registry components for the
  four types; the builder, the panels, the editor and the assign dialog; intro outline, sectioned grid and
  per-section result.
- **`npm run test:db`**: RLS on `assessments` and `teacher_items` (owner reads and writes; another teacher
  and students see nothing; a student cannot insert); `start_attempt` with sections (counts, section-major
  positions, fixed order without shuffle, sampling with it); variants (one index per attempt, the same in
  every variant section, `attempts.variant` set, a retake gets an unused variant); `get_attempt_items`
  returns `section` and no `key` or answer-bearing `id` for the four new types; `submit_test` and
  `record_practice_response_v2` give partial credit for them; an old-style assignment behaves as before;
  `assignments.source`: after an insert with a full source, and after the backfill, a student's
  `select source from assignments` returns only `{"kind": ...}`, and the class's teacher reads the full
  source from `assignment_sources` (another teacher and students read nothing there).
- `npx tsc -b`, `npm run build`, the solo Playwright suite. `npm run seed` output unchanged after the helper
  move.

## Not verified in this phase

- No cloud session can reach the LatinIQ database. The owner applies the migration and checks the flow once:
  build an assessment from a template, assign it with different words per student, take it as two students
  in test and practice mode, read the results, the gradebook and the attempt detail, and print versions A
  and B.
- The four new inputs at 375px on a real phone (the Phase 2 check used a browser harness).
- Conversion of non-core words is checked by rule and by the coverage test, not by a Latin teacher. Converted
  words are flagged for the teacher to check in the preview.
- The template wording and the built-in tag labels need the owner's eye.

## Decided with the owner

The owner accepted these on 2026-11-14.

1. **"Answer N of M" sections** are out of Phase 3.
2. **Matching from a vocab list** is in: the vocab source's `match5` format, built in Plan 4.
3. **`AssignmentBuilder` is retired**, with no quick path; Blank template plus one section replaces it.
4. **Converted words** are allowed in every mode, flagged for checking in the preview.
5. **Variants** default to 4, with 2 to 6 offered; print uses the first three.
6. **The test-mode warning** shows only for module sections, not for My questions.

## Implementation order

Four plans in `docs/superpowers/plans/`, in this order (chosen by the owner). Each ends green on `npm test`,
`npx tsc -b`, `npm run build` and (Plan 1) `npm run test:db`, and each that touches SQL notes in
`OPEN-WORK.md` what the owner must run.

**Plan 1: Schema, item types and graders (about 10 tasks).** The migration in full: the two tables with
RLS and grants, `touch_updated_at`, the new columns with their checks, `grade_parts`, `start_attempt` and
`get_attempt_items`, with their SQL tests. `assignment_sources`, its trigger and the backfill, with the SQL
test that a student reads only `{"kind": ...}`. The four types in `types.ts`, the TypeScript grader and
`correctDisplay`, and the shared case file used by both graders. Placeholder entries for the four types in
`ITEM_RENDERERS` ("This question type is not available yet"), so `tsc` passes. `TeacherItem`,
`validateTeacherItem`, the bracket parser and `toQuestion`. The client types that read the new columns
(`AttemptItem.section`, `StudentAssignment`, `PoolItem`, `AssignmentRow`) and the `getAssignmentPool`
columns. No UI. `npm run test:db` needs Postgres 16 (`DATABASE_URL` or `PGBIN`); without it the plan stops
before its last task and says so in `OPEN-WORK.md`. Done when both graders pass the same table and every
SQL test above passes.

**Plan 2: Renderers, print and the student side (about 10 tasks).** Registry entries for `tf`,
`choice-inline`, `cloze` and `match` replacing the placeholders (one task each, with phone CSS and tests);
sectioned `buildPrintVersions` and `PrintView`, with legacy output unchanged; kind tag on the Class page;
intro outline; sectioned question grid and section headers in the test runner and practice; per-section
lines and grouped review in `AttemptReview`. Tested with fixture data, so it does not wait for the builder.

**Plan 3: Library (about 8 tasks).** Move the headword helpers and `shortGloss` to `src/lib/headword.ts`
(seed output unchanged); `wordFromLexicon` (pool lookup, verb rules, noun and adjective rules, coverage
test); "Words from a vocab list" with the report in `FormsSource`; `tags.ts`, `MODULE_TAGS` and the tag
picker; the teacher-items API and the My-questions list; the editor for `mc`, `typein`, `tf`, then for
`match`, `cloze`, `choice-inline`; Library in the nav.

**Plan 4: Assessments (about 12 tasks).** Assessments API and the built-in templates (text by
`latin-content-writer`); `ModulesSource`, `VocabSource` and `TeacherItemsSource`; `buildVocabMatch` and the
`match5` format; `resolveAssessment` with `fromStoredFormsConfig` and the `target` option of
`buildFormsPool`; the variant builder; the builder page; the Create home and routes; preview;
`publishAssessment` and the assign dialog; "+ New assignment" as a picker, and `AssignmentBuilder` retired;
printing an assessment and an assignment with variants. Ends with a whole-plan review and the owner's end-to-end check.
