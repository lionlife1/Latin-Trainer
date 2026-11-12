import type { Lesson } from './types';
import { lesson as forms_bootcamp } from './forms_bootcamp';
import { lesson as independent_uses } from './independent_uses';
import { lesson as purpose_result_indirect } from './purpose_result_indirect';
import { lesson as sequence_of_tenses } from './sequence_of_tenses';

export const LESSONS: Record<string, Lesson> = {
  forms_bootcamp,
  sequence_of_tenses,
  independent_uses,
  purpose_result_indirect,
};

export function lessonFor(moduleId: string): Lesson | undefined {
  return LESSONS[moduleId];
}
