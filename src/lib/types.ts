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

export type DrillQuestion = TypeInQuestion | MCQuestion;

/** A question as a student sees it during a test, before submission. */
export type PublicQuestion =
  | Omit<TypeInQuestion, 'answers' | 'explanation'>
  | Omit<MCQuestion, 'correct' | 'explanation'>;

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
