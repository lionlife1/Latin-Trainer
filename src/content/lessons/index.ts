import type { Lesson } from './types';
import { lesson as case_uses } from './case_uses';
import { lesson as conditionals } from './conditionals';
import { lesson as cum_clauses } from './cum_clauses';
import { lesson as fear_clauses } from './fear_clauses';
import { lesson as forms_bootcamp } from './forms_bootcamp';
import { lesson as gerund_gerundive } from './gerund_gerundive';
import { lesson as independent_uses } from './independent_uses';
import { lesson as indirect_question } from './indirect_question';
import { lesson as indirect_statement } from './indirect_statement';
import { lesson as participles_ablative_absolute } from './participles_ablative_absolute';
import { lesson as purpose_result_indirect } from './purpose_result_indirect';
import { lesson as quin_clauses } from './quin_clauses';
import { lesson as relative_subjunctive } from './relative_subjunctive';
import { lesson as sequence_of_tenses } from './sequence_of_tenses';

export const LESSONS: Record<string, Lesson> = {
  forms_bootcamp,
  sequence_of_tenses,
  independent_uses,
  purpose_result_indirect,
  cum_clauses,
  indirect_question,
  fear_clauses,
  conditionals,
  quin_clauses,
  relative_subjunctive,
  participles_ablative_absolute,
  indirect_statement,
  gerund_gerundive,
  case_uses,
};

export function lessonFor(moduleId: string): Lesson | undefined {
  return LESSONS[moduleId];
}
