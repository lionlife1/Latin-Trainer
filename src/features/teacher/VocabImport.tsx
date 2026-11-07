import { useState } from 'react';
import { lemmaOf } from '../../lib/lexicon';
import {
  PARTS_OF_SPEECH, definitionOverride, guessPos, matchImportRow, parseVocabImport, type ImportMatch, type ImportSkip,
} from '../../lib/vocabImport';
import { addCustomWord, addListItem, searchLexicon, type LexiconRow } from './api';
import { LatinField } from './LatinField';

const MAX_LINES = 200;
const SEARCH_LIMIT = 50;
const CONCURRENCY = 4;

type Match = ImportMatch<LexiconRow>;
/** A lexicon id, or what to do instead. */
type Choice = number | 'custom' | 'skip';

interface Props {
  listId: string;
  ownerId: string;
  inList: ReadonlySet<number>;
  nextPos: number;
  onDone: () => void;
}

const defaultChoice = (m: Match): Choice =>
  m.kind === 'matched' ? m.word.id : m.kind === 'ambiguous' ? m.options[0].id : m.kind === 'custom' ? 'custom' : 'skip';
const optionsOf = (m: Match): LexiconRow[] => (m.kind === 'matched' ? [m.word] : m.kind === 'ambiguous' ? m.options : []);
const STATUS: Record<Match['kind'], { label: string; pill: string }> = {
  matched: { label: 'Matched', pill: 'ok' },
  ambiguous: { label: 'Choose', pill: 'warn' },
  custom: { label: 'New word', pill: '' },
  duplicate: { label: 'Already in list', pill: 'bad' },
};

async function mapLimit<T, R>(xs: T[], limit: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(xs.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, xs.length) }, async () => {
    while (next < xs.length) {
      const i = next++;
      out[i] = await fn(xs[i]);
    }
  }));
  return out;
}

/** Paste "latin<sep>english" lines, review the dictionary matches, then add them all. */
export function VocabImport({ listId, ownerId, inList, nextPos, onDone }: Props) {
  const [text, setText] = useState('');
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [skipped, setSkipped] = useState<ImportSkip[]>([]);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [pos, setPos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const check = async () => {
    const parsed = parseVocabImport(text);
    setMsg(null);
    setErrors([]);
    setSkipped(parsed.skipped);
    if (parsed.rows.length > MAX_LINES) return setErrors([`At most ${MAX_LINES} words at a time; this has ${parsed.rows.length}.`]);
    if (parsed.rows.length === 0) return setErrors(['No words found. Put one word per line: Latin, then a tab, " - ", " = " or comma, then English.']);
    setBusy(true);
    try {
      const ms = await mapLimit(parsed.rows, CONCURRENCY, async row =>
        matchImportRow(row, await searchLexicon(lemmaOf(row.latin), SEARCH_LIMIT), inList));
      setMatches(ms);
      setChoices(ms.map(defaultChoice));
      setPos(ms.map(m => (m.kind === 'custom' ? m.pos : guessPos(m.row.latin))));
    } catch (e) {
      setErrors([e instanceof Error ? e.message : String(e)]);
    } finally {
      setBusy(false);
    }
  };

  const commit = async () => {
    if (!matches) return;
    setBusy(true);
    const errs: string[] = [];
    const added = new Set(inList);
    let position = nextPos;
    let n = 0;
    for (let i = 0; i < matches.length; i++) {
      const { row } = matches[i];
      const choice = choices[i];
      if (choice === 'skip') continue;
      try {
        if (choice === 'custom') {
          const w = await addCustomWord({ headword: row.latin, definition: row.english, pos: pos[i] }, ownerId);
          await addListItem(listId, w.id, position++);
        } else {
          if (added.has(choice)) continue;
          const word = optionsOf(matches[i]).find(o => o.id === choice)!;
          await addListItem(listId, choice, position++, definitionOverride(row.english, word.definition));
          added.add(choice);
        }
        n++;
      } catch (e) {
        errs.push(`Line ${row.line} (${row.latin}): ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    setBusy(false);
    setErrors(errs);
    setMsg(`Added ${n} word${n === 1 ? '' : 's'}.`);
    if (errs.length === 0) {
      setMatches(null);
      setSkipped([]);
      setText('');
    }
    onDone();
  };

  const count = (k: Match['kind']) => matches?.filter(m => m.kind === k).length ?? 0;
  const toAdd = choices.filter(c => c !== 'skip').length;

  return (
    <>
      <p className="muted small">
        One word per line: Latin, then a tab (Quizlet export), " - ", " = " or a comma (CSV), then English.
        Quote a CSV field that has commas. Each word is matched to the dictionary; the English you paste becomes
        the quiz definition when it differs.
      </p>
      {!matches && (
        <>
          <LatinField
            multiline
            block
            shortcut={false}
            aria-label="Words to import"
            rows={6}
            style={{ width: '100%', fontFamily: 'inherit' }}
            placeholder={'puella\tgirl\ncapiō, capere, cēpī, captum - to take\n"rēs, reī, f.",thing'}
            value={text}
            onValueChange={setText}
          />
          <div className="row" style={{ marginTop: 8 }}>
            <button className="btn-secondary" disabled={busy || !text.trim()} onClick={check}>
              {busy ? 'Checking…' : 'Check words'}
            </button>
          </div>
        </>
      )}

      {matches && (
        <>
          <p className="small" data-testid="import-summary">
            {count('matched')} matched · {count('ambiguous')} to choose · {count('custom')} new · {count('duplicate')} already in list
          </p>
          <div className="scroll-x">
            <table className="table">
              <thead><tr><th>Line</th><th>Latin</th><th>English</th><th>Status</th><th>Add as</th></tr></thead>
              <tbody>
                {matches.map((m, i) => (
                  <tr key={m.row.line}>
                    <td className="muted small">{m.row.line}</td>
                    <td>{m.row.latin}</td>
                    <td>{m.row.english}</td>
                    <td><span className={`pill ${STATUS[m.kind].pill}`}>{STATUS[m.kind].label}</span></td>
                    <td>
                      {m.kind === 'duplicate' ? (
                        <span className="muted small">{m.word.headword}</span>
                      ) : (
                        <div className="row">
                          <select
                            className="select"
                            aria-label={`Add ${m.row.latin} as`}
                            value={String(choices[i])}
                            onChange={e => {
                              const v = e.target.value;
                              setChoices(cs => cs.map((c, j) => (j === i ? (v === 'custom' || v === 'skip' ? v : Number(v)) : c)));
                            }}
                          >
                            {optionsOf(m).map(o => <option key={o.id} value={o.id}>{o.headword} ({o.pos}): {o.definition}</option>)}
                            <option value="custom">My own word</option>
                            <option value="skip">Skip</option>
                          </select>
                          {choices[i] === 'custom' && (
                            <select
                              className="select"
                              aria-label={`Part of speech for ${m.row.latin}`}
                              value={pos[i]}
                              onChange={e => setPos(ps => ps.map((p, j) => (j === i ? e.target.value : p)))}
                            >
                              {PARTS_OF_SPEECH.map(p => <option key={p}>{p}</option>)}
                            </select>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            <button className="btn-primary" disabled={busy || toAdd === 0} onClick={commit}>
              {busy ? 'Adding…' : `Add ${toAdd} word${toAdd === 1 ? '' : 's'}`}
            </button>
            <button className="btn-ghost" disabled={busy} onClick={() => { setMatches(null); setMsg(null); }}>Back to edit</button>
          </div>
        </>
      )}

      {skipped.length > 0 && (
        <div className="small" data-testid="import-skipped">
          <p className="muted">Lines not imported:</p>
          <ul>{skipped.map(s => <li key={s.line}>Line {s.line}: {s.reason} <code>{s.text}</code></li>)}</ul>
        </div>
      )}
      {msg && <p className="form-ok">{msg}</p>}
      {errors.map(e => <p key={e} className="form-error small">{e}</p>)}
    </>
  );
}
