import { useMemo, useState } from 'react';
import {
  DEFAULT_FORMS_CONFIG, defaultFormsPools, type FormsConfig,
} from '../../lib/formsQuestions';
import { wordKey, type FormsAssignmentConfig, type PersonNumber, type SynopsisPart } from '../../lib/formsItems';
import { normalize } from '../../lib/grading';
import { entryOf, meaningOf, type Degree, type MorphWord, type VerbTense, type Voice } from '../../lib/morph';
import { shuffle } from '../../lib/shuffle';
import { FormsFilterGroups } from '../practice/forms/FormsFilterGroups';
import type { StoredFormsConfig } from './api';

interface Props {
  value: FormsAssignmentConfig;
  onChange: (value: FormsAssignmentConfig) => void;
}

type Kind = FormsAssignmentConfig['kind'];

export const DEFAULT_FORMS_ASSIGNMENT: FormsAssignmentConfig = {
  kind: 'synopsis', words: [], personNumber: 'all', parts: ['indicative', 'subjunctive'], giveFirst: false,
};

const KIND_OPTIONS: { value: Kind; label: string }[] = [
  { value: 'synopsis', label: 'Synopsis' },
  { value: 'paradigm', label: 'Chart (declension or conjugation)' },
  { value: 'principalParts', label: 'Principal parts' },
  { value: 'parse', label: 'Parse the form' },
  { value: 'make', label: 'Make the form' },
];

const PARTS: { value: SynopsisPart; label: string }[] = [
  { value: 'indicative', label: 'Indicative' }, { value: 'subjunctive', label: 'Subjunctive' },
  { value: 'imperative', label: 'Imperative' }, { value: 'infinitive', label: 'Infinitives' },
  { value: 'participle', label: 'Participles' },
];
const TENSES: { value: VerbTense; label: string }[] = [
  { value: 'present', label: 'Present' }, { value: 'imperfect', label: 'Imperfect' }, { value: 'future', label: 'Future' },
  { value: 'perfect', label: 'Perfect' }, { value: 'pluperfect', label: 'Pluperfect' }, { value: 'futurePerfect', label: 'Future perfect' },
];
const MOODS: { value: 'indicative' | 'subjunctive'; label: string }[] = [
  { value: 'indicative', label: 'Indicative' }, { value: 'subjunctive', label: 'Subjunctive' },
];
const VOICES: { value: Voice; label: string }[] = [{ value: 'active', label: 'Active' }, { value: 'passive', label: 'Passive' }];
const DEGREES: { value: Degree; label: string }[] = [
  { value: 'positive', label: 'Positive' }, { value: 'comparative', label: 'Comparative' }, { value: 'superlative', label: 'Superlative' },
];

const PERSON_NUMBERS: PersonNumber[] = [1, 2, 3].flatMap(person =>
  (['singular', 'plural'] as const).map(number => ({ person: person as 1 | 2 | 3, number })));
const ORD = { 1: '1st', 2: '2nd', 3: '3rd' } as const;
const pnValue = (p: PersonNumber | 'all') => (p === 'all' ? 'all' : `${p.person}|${p.number}`);

const GIVEN_OPTIONS: { id: string; label: string; value: 'none' | 'first' | number }[] = [
  { id: 'none', label: 'None', value: 'none' },
  { id: 'first', label: 'First form', value: 'first' },
  { id: 'two', label: '2 random forms', value: 2 },
];

function toggle<T>(xs: T[], x: T): T[] {
  return xs.includes(x) ? xs.filter(y => y !== x) : [...xs, x];
}

let allWordsCache: MorphWord[] | undefined;
/** Every built-in word the picker can offer. */
function allWords(): MorphWord[] {
  if (!allWordsCache) {
    const p = defaultFormsPools();
    allWordsCache = [
      ...p.verbs.map(verb => ({ kind: 'verb', verb }) as MorphWord),
      ...p.nouns.map(noun => ({ kind: 'noun', noun }) as MorphWord),
      ...p.adjectives.map(adjective => ({ kind: 'adjective', adjective }) as MorphWord),
      ...p.pronouns.map(pronoun => ({ kind: 'pronoun', pronoun }) as MorphWord),
    ];
  }
  return allWordsCache;
}

/** The small, readable form of a config that is saved on the assignment. */
export function toStoredFormsConfig(c: FormsAssignmentConfig): StoredFormsConfig {
  const store = (ws: MorphWord[]) => ws.map(w => ({ key: wordKey(w), entry: entryOf(w) }));
  switch (c.kind) {
    case 'synopsis': return { ...c, words: store(c.words) };
    case 'paradigm': return { ...c, words: store(c.words) };
    case 'principalParts': return { ...c, words: store(c.words) };
    default: return { ...c, words: c.words ? store(c.words) : undefined };
  }
}

/** Switching kind keeps the chosen words where the new kind can use them. */
function defaultsFor(kind: Kind, words: MorphWord[]): FormsAssignmentConfig {
  switch (kind) {
    case 'synopsis':
      return { ...DEFAULT_FORMS_ASSIGNMENT, kind, words: words.filter(w => w.kind === 'verb') } as FormsAssignmentConfig;
    case 'principalParts':
      return { kind, words: words.filter(w => w.kind === 'verb') };
    case 'paradigm':
      return {
        kind, words, tenses: ['present'], moods: ['indicative'], voices: ['active'], degrees: ['positive'],
        vocative: false, given: 'none',
      };
    default:
      return { kind, filter: { ...DEFAULT_FORMS_CONFIG, styles: ['make'] }, count: 10 };
  }
}

export function FormsSource({ value, onChange }: Props) {
  const [query, setQuery] = useState('');
  const wordsOf: MorphWord[] = value.kind === 'parse' || value.kind === 'make' ? [] : (value.words as MorphWord[]);
  const verbsOnly = value.kind === 'synopsis' || value.kind === 'principalParts';
  const chosenKeys = new Set(wordsOf.map(wordKey));

  const candidates = useMemo(
    () => allWords().filter(w => !verbsOnly || w.kind === 'verb'),
    [verbsOnly],
  );
  const results = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];
    return candidates
      .filter(w => !chosenKeys.has(wordKey(w)) && (normalize(entryOf(w)).includes(q) || normalize(meaningOf(w)).includes(q)))
      .slice(0, 8);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, candidates, value]);

  const setWords = (words: MorphWord[]) => {
    if (value.kind === 'parse' || value.kind === 'make') return;
    onChange({ ...value, words });
  };
  const addWord = (w: MorphWord) => setWords([...wordsOf, w]);
  const addRandom = () => {
    const free = candidates.filter(w => !chosenKeys.has(wordKey(w)));
    setWords([...wordsOf, ...shuffle(free, Math.random).slice(0, 5)]);
  };

  const hasKind = (k: MorphWord['kind']) => wordsOf.some(w => w.kind === k);

  return (
    <div className="forms-source">
      <label className="field">
        <span>Kind of question</span>
        <select className="select" value={value.kind} onChange={e => onChange(defaultsFor(e.target.value as Kind, wordsOf))}>
          {KIND_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>

      {value.kind !== 'parse' && value.kind !== 'make' && (
        <div className="field">
          <label className="field">
            <span>{verbsOnly ? 'Find a verb' : 'Find a word'}</span>
            <input
              className="input" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Dictionary entry or meaning"
            />
          </label>
          {results.length > 0 && (
            <div className="row">
              {results.map(w => (
                <button
                  key={wordKey(w)} type="button" className="btn-secondary small"
                  onClick={() => { addWord(w); setQuery(''); }}
                >
                  {entryOf(w)}
                </button>
              ))}
            </div>
          )}
          <div className="row">
            {wordsOf.map(w => (
              <span key={wordKey(w)} className="pill">
                {entryOf(w)}{' '}
                <button
                  type="button" className="link" aria-label={`Remove ${entryOf(w)}`}
                  onClick={() => setWords(wordsOf.filter(x => wordKey(x) !== wordKey(w)))}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="row">
            <button type="button" className="btn-secondary small" onClick={addRandom}>Add 5 random</button>
          </div>
        </div>
      )}

      {value.kind === 'synopsis' && (
        <>
          <label className="field">
            <span>Person and number</span>
            <select
              className="select" value={pnValue(value.personNumber)}
              onChange={e => {
                const v = e.target.value;
                const pn = v === 'all' ? 'all' : PERSON_NUMBERS.find(p => pnValue(p) === v)!;
                onChange({ ...value, personNumber: pn });
              }}
            >
              <option value="all">Different for each student</option>
              {PERSON_NUMBERS.map(p => <option key={pnValue(p)} value={pnValue(p)}>{ORD[p.person]} person {p.number}</option>)}
            </select>
          </label>
          <fieldset className="intro-config forms-group">
            <legend>Parts</legend>
            <div className="checkbox-list inline">
              {PARTS.map(p => (
                <label key={p.value}>
                  <input
                    type="checkbox" checked={value.parts.includes(p.value)}
                    onChange={() => onChange({ ...value, parts: toggle(value.parts, p.value) })}
                  />
                  {p.label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="small">
            <input type="checkbox" checked={value.giveFirst} onChange={e => onChange({ ...value, giveFirst: e.target.checked })} />{' '}
            Give the first form
          </label>
        </>
      )}

      {value.kind === 'paradigm' && (
        <>
          {hasKind('verb') && (
            <>
              <fieldset className="intro-config forms-group">
                <legend>Tense</legend>
                <div className="checkbox-list inline">
                  {TENSES.map(o => (
                    <label key={o.value}>
                      <input type="checkbox" checked={value.tenses.includes(o.value)} onChange={() => onChange({ ...value, tenses: toggle(value.tenses, o.value) })} />
                      {o.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="intro-config forms-group">
                <legend>Mood</legend>
                <div className="checkbox-list inline">
                  {MOODS.map(o => (
                    <label key={o.value}>
                      <input type="checkbox" checked={value.moods.includes(o.value)} onChange={() => onChange({ ...value, moods: toggle(value.moods, o.value) })} />
                      {o.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="intro-config forms-group">
                <legend>Voice</legend>
                <div className="checkbox-list inline">
                  {VOICES.map(o => (
                    <label key={o.value}>
                      <input type="checkbox" checked={value.voices.includes(o.value)} onChange={() => onChange({ ...value, voices: toggle(value.voices, o.value) })} />
                      {o.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            </>
          )}
          {hasKind('adjective') && (
            <fieldset className="intro-config forms-group">
              <legend>Degree</legend>
              <div className="checkbox-list inline">
                {DEGREES.map(o => (
                  <label key={o.value}>
                    <input type="checkbox" checked={value.degrees.includes(o.value)} onChange={() => onChange({ ...value, degrees: toggle(value.degrees, o.value) })} />
                    {o.label}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <label className="small">
            <input type="checkbox" checked={value.vocative} onChange={e => onChange({ ...value, vocative: e.target.checked })} />{' '}
            Include the vocative
          </label>
          <fieldset className="intro-config forms-group">
            <legend>Cells given to the student</legend>
            <div className="checkbox-list inline">
              {GIVEN_OPTIONS.map(o => (
                <label key={o.id}>
                  <input
                    type="radio" name="forms-given" checked={value.given === o.value}
                    onChange={() => onChange({ ...value, given: o.value })}
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </fieldset>
        </>
      )}

      {(value.kind === 'parse' || value.kind === 'make') && (
        <>
          <FormsFilterGroups
            config={value.filter}
            showStyles={false}
            onChange={(filter: FormsConfig) => onChange({ ...value, filter })}
          />
          <label className="field">
            <span>Number of questions</span>
            <input
              className="input" type="number" min={1} value={value.count}
              onChange={e => onChange({ ...value, count: Math.max(1, Number(e.target.value) || 1) })}
            />
          </label>
        </>
      )}
    </div>
  );
}
