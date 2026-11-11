export type LessonBlock =
  | { kind: 'p'; text: string }
  | { kind: 'table'; caption?: string; head: string[]; rows: string[][] }
  | { kind: 'examples'; items: { la: string; en: string; note?: string }[] }
  | { kind: 'tip'; title?: string; text: string };
export interface LessonSection { heading: string; blocks: LessonBlock[] }
export interface Lesson {
  moduleId: string;
  title: string;          // e.g. 'Purpose, Result and Indirect Command'
  summary: string;        // one or two sentences shown under the title
  sections: LessonSection[];
  check: string[];        // question ids from the same module
}
