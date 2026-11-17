// Lightweight id/title list of MODULES, so eagerly loaded screens don't pull in modules.ts.
// moduleIndex.test.ts keeps this in sync with MODULES.
export const MODULE_INDEX: readonly { id: string; title: string }[] = [
  { id: 'forms_bootcamp', title: 'Forms Bootcamp' },
  { id: 'sequence_of_tenses', title: 'Sequence of Tenses' },
  { id: 'independent_uses', title: 'Independent Subjunctive' },
  { id: 'purpose_result_indirect', title: 'Purpose · Result · Indirect Command' },
  { id: 'cum_clauses', title: 'Cum Clauses' },
  { id: 'indirect_question', title: 'Indirect Question' },
  { id: 'fear_clauses', title: 'Fear Clauses' },
  { id: 'conditionals', title: 'Conditionals' },
  { id: 'quin_clauses', title: 'Quin Clauses' },
  { id: 'relative_subjunctive', title: 'Relative Clause Subjunctive' },
  { id: 'participles_ablative_absolute', title: 'Participles and the Ablative Absolute' },
  { id: 'indirect_statement', title: 'Indirect Statement' },
  { id: 'gerund_gerundive', title: 'Gerund and Gerundive' },
  { id: 'case_uses', title: 'Noun Case Uses' },
];
