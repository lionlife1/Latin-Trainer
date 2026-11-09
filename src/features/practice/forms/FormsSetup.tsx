import { useState } from 'react';
import { ChevronLeft } from '../../../components/icons';
import { formsConfigHasQuestions, type FormsConfig } from '../../../lib/formsQuestions';
import type { FormsLength, FormsSettings } from './formsSettings';

interface Props {
  initial: FormsSettings;
  onStart: (s: FormsSettings) => void;
  onBack: () => void;
}

type Option<T> = { value: T; label: string };
type ArrayKey = { [K in keyof FormsConfig]: FormsConfig[K] extends unknown[] ? K : never }[keyof FormsConfig];

const KINDS: Option<FormsConfig['kinds'][number]>[] = [
  { value: 'verbs', label: 'Verbs' }, { value: 'nouns', label: 'Nouns' },
  { value: 'adjectives', label: 'Adjectives' }, { value: 'pronouns', label: 'Pronouns' },
];
const STYLES: Option<FormsConfig['styles'][number]>[] = [
  { value: 'make', label: 'Make the form' }, { value: 'identify', label: 'Identify the form' },
];
const GROUPS: Option<FormsConfig['verbGroups'][number]>[] = [
  { value: '1', label: '1st' }, { value: '2', label: '2nd' }, { value: '3', label: '3rd' }, { value: '3io', label: '3rd -io' },
  { value: '4', label: '4th' }, { value: 'irregular', label: 'Irregular' }, { value: 'deponent', label: 'Deponent' },
];
const MOODS: Option<FormsConfig['moods'][number]>[] = [
  { value: 'indicative', label: 'Indicative' }, { value: 'subjunctive', label: 'Subjunctive' },
  { value: 'imperative', label: 'Imperative' }, { value: 'infinitive', label: 'Infinitive' },
  { value: 'participle', label: 'Participles and gerund' },
];
const TENSES: Option<FormsConfig['tenses'][number]>[] = [
  { value: 'present', label: 'Present' }, { value: 'imperfect', label: 'Imperfect' }, { value: 'future', label: 'Future' },
  { value: 'perfect', label: 'Perfect' }, { value: 'pluperfect', label: 'Pluperfect' }, { value: 'futurePerfect', label: 'Future perfect' },
];
const VOICES: Option<FormsConfig['voices'][number]>[] = [{ value: 'active', label: 'Active' }, { value: 'passive', label: 'Passive' }];
const DECLENSIONS: Option<FormsConfig['declensions'][number]>[] = [
  { value: 1, label: '1st' }, { value: 2, label: '2nd' }, { value: 3, label: '3rd' }, { value: 4, label: '4th' }, { value: 5, label: '5th' },
];
const ADJ_TYPES: Option<FormsConfig['adjTypes'][number]>[] = [
  { value: '12', label: '1st/2nd declension' }, { value: '3', label: '3rd declension' },
];
const DEGREES: Option<FormsConfig['degrees'][number]>[] = [
  { value: 'positive', label: 'Positive' }, { value: 'comparative', label: 'Comparative' }, { value: 'superlative', label: 'Superlative' },
];

export function FormsSetup({ initial, onStart, onBack }: Props) {
  const [config, setConfig] = useState<FormsConfig>(initial.config);
  const [length, setLength] = useState<FormsLength>(initial.length);
  const has = (k: FormsConfig['kinds'][number]) => config.kinds.includes(k);
  const ok = formsConfigHasQuestions(config);

  // Always builds a new config object: the question generator caches eligible words by config identity.
  const toggle = <K extends ArrayKey>(key: K, options: Option<FormsConfig[K][number]>[], value: FormsConfig[K][number]) =>
    setConfig(c => {
      const cur = c[key] as FormsConfig[K][number][];
      const next = options.map(o => o.value).filter(v => (v === value ? !cur.includes(v) : cur.includes(v)));
      return { ...c, [key]: next };
    });

  const group = <K extends ArrayKey>(legend: string, key: K, options: Option<FormsConfig[K][number]>[]) => (
    <fieldset className="intro-config forms-group">
      <legend>{legend}</legend>
      <div className="checkbox-list inline">
        {options.map(o => (
          <label key={String(o.value)}>
            <input
              type="checkbox"
              checked={(config[key] as unknown[]).includes(o.value)}
              onChange={() => toggle(key, options, o.value)}
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );

  return (
    <div className="screen active" style={{ padding: '0 16px' }}>
      <div className="intro-card">
        <button className="btn-back" onClick={onBack}><ChevronLeft size={18} />Practice</button>
        <h1 className="intro-title">Forms</h1>
        <p className="intro-desc">Build any form from its dictionary entry, or name a form you see. Choose what to practice below.</p>
        {group('Practice', 'kinds', KINDS)}
        {group('Question style', 'styles', STYLES)}
        {has('verbs') && group('Conjugation', 'verbGroups', GROUPS)}
        {has('verbs') && group('Mood', 'moods', MOODS)}
        {has('verbs') && group('Tense', 'tenses', TENSES)}
        {has('verbs') && group('Voice', 'voices', VOICES)}
        {has('nouns') && group('Declension', 'declensions', DECLENSIONS)}
        {has('adjectives') && group('Adjective type', 'adjTypes', ADJ_TYPES)}
        {has('adjectives') && group('Degree', 'degrees', DEGREES)}
        <div className="intro-config">
          <label htmlFor="forms-length">Session length</label>
          <select
            id="forms-length"
            className="select"
            value={String(length)}
            onChange={e => setLength(e.target.value === 'endless' ? 'endless' : e.target.value === '20' ? 20 : 10)}
          >
            <option value="10">10 questions</option>
            <option value="20">20 questions</option>
            <option value="endless">Endless</option>
          </select>
        </div>
        {!ok && <p className="form-error">No forms match these settings. Turn on more options.</p>}
        <button className="btn-primary" disabled={!ok} onClick={() => onStart({ config, length })}>Start session</button>
      </div>
    </div>
  );
}
