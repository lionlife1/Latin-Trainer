import type { FormsConfig } from '../../../lib/formsQuestions';

interface Props {
  config: FormsConfig;
  onChange: (config: FormsConfig) => void;
  /** The "Question style" group is for solo practice; the assignment builder leaves it out. */
  showStyles?: boolean;
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

/** The filter checkbox groups shared by the Forms practice setup and the assignment builder. */
export function FormsFilterGroups({ config, onChange, showStyles = true }: Props) {
  const has = (k: FormsConfig['kinds'][number]) => config.kinds.includes(k);

  // Always builds a new config object: the question generator caches eligible words by config identity.
  const toggle = <K extends ArrayKey>(key: K, options: Option<FormsConfig[K][number]>[], value: FormsConfig[K][number]) => {
    const cur = config[key] as FormsConfig[K][number][];
    const next = options.map(o => o.value).filter(v => (v === value ? !cur.includes(v) : cur.includes(v)));
    onChange({ ...config, [key]: next });
  };

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
    <>
      {group('Practice', 'kinds', KINDS)}
      {showStyles && group('Question style', 'styles', STYLES)}
      {has('verbs') && group('Conjugation', 'verbGroups', GROUPS)}
      {has('verbs') && group('Mood', 'moods', MOODS)}
      {has('verbs') && group('Tense', 'tenses', TENSES)}
      {has('verbs') && group('Voice', 'voices', VOICES)}
      {has('nouns') && group('Declension', 'declensions', DECLENSIONS)}
      {has('adjectives') && group('Adjective type', 'adjTypes', ADJ_TYPES)}
      {has('adjectives') && group('Degree', 'degrees', DEGREES)}
    </>
  );
}
