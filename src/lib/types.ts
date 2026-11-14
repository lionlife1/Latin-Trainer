interface QuestionBase {
  id: string;
  badge: string;
  prompt: string;
  hint?: string;
  explanation?: string;
}

export interface TypeInQuestion extends QuestionBase {
  type: 'typein';
  answers: string[];
}

export interface MCQuestion extends QuestionBase {
  type: 'mc';
  choices: string[];
  correct: string;
}

export interface GridCell { id: string; given?: string }      // given = shown, not asked
export interface GridRow { label: string; cells: (GridCell | null)[] }  // null = no such form
export interface GridQuestion extends QuestionBase {
  type: 'grid';
  columns: string[];                 // header per column, same length as every row's cells
  rows: GridRow[];
  key: Record<string, string[]>;     // cell id -> accepted forms, for every cell without `given`
}

export interface ParseField { id: string; label: string; options: { value: string; label: string }[] }
export interface ParseQuestion extends QuestionBase {
  type: 'parse';
  fields: ParseField[];
  key: Record<string, string>[];     // every valid parse: field id -> option value
}

export type DrillQuestion = TypeInQuestion | MCQuestion | GridQuestion | ParseQuestion;

/** A student's answer: a string for mc/typein, cell id -> text for grid, field id -> option value for parse. */
export type Given = string | Record<string, string>;

/** A question as a student sees it during a test, before submission. */
export type PublicQuestion =
  | Omit<TypeInQuestion, 'answers' | 'explanation'>
  | Omit<MCQuestion, 'correct' | 'explanation'>
  | Omit<GridQuestion, 'key' | 'explanation'>
  | Omit<ParseQuestion, 'key' | 'explanation'>;

export interface ModuleMeta {
  id: string;
  badge: string;
  title: string;
  tagline: string;
  description: string;
  concepts: string[];
  prerequisites: string[];
  xp_reward: number;
}

export interface ModuleContent extends ModuleMeta {
  questions: DrillQuestion[];
}

export interface EndlessConfig {
  stdAct: boolean;
  stdPass: boolean;
  dep: boolean;
  irr: boolean;
}

export type AssignmentMode = 'practice' | 'test';
