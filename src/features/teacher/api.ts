import { normalize } from '../../lib/grading';
import { lemmaOf } from '../../lib/lexicon';
import { requireSupabase } from '../../lib/supabase';
import type { AssignmentMode, DrillQuestion } from '../../lib/types';
import type { PoolItem, VocabDirection, VocabItem } from '../../lib/vocab';

export interface ClassRow { id: string; name: string; join_code: string; created_at: string }
export interface RosterRow { student_id: string; display_name: string; joined_at: string }
export type AssignmentSource =
  | { kind: 'modules'; moduleIds: string[]; badges?: string[]; types?: ('typein' | 'mc')[] }
  | { kind: 'vocab'; listId: string; directions: VocabDirection[] };
export interface AssignmentRow {
  id: string; class_id: string; title: string; mode: AssignmentMode; source: AssignmentSource;
  question_count: number; due_at: string | null; time_limit_sec: number | null; max_attempts: number | null;
  reveal_answers: boolean; created_at: string;
}
export interface LexiconRow { id: number; owner_id: string | null; headword: string; lemma: string; definition: string; pos: string }
export interface VocabListRow { id: string; name: string; created_at: string }
export interface VocabListItemRow { id: string; lexicon_id: number; definition_override: string | null; position: number; lexicon: LexiconRow }

const sb = () => requireSupabase();
function must<T = unknown>(res: { data: unknown; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

// ---- classes & roster
export const listClasses = async () =>
  must<ClassRow[]>(await sb().from('classes').select('id, name, join_code, created_at').order('created_at'));
export const getClass = async (id: string) =>
  must<ClassRow>(await sb().from('classes').select('id, name, join_code, created_at').eq('id', id).single());
export const createClass = async (name: string) =>
  must<ClassRow>(await sb().from('classes').insert({ name }).select('id, name, join_code, created_at').single());
export const getRoster = async (classId: string) =>
  must<RosterRow[]>(await sb().from('enrollments').select('student_id, display_name, joined_at').eq('class_id', classId).order('display_name'));
export async function removeStudent(classId: string, studentId: string) {
  must(await sb().from('enrollments').delete().eq('class_id', classId).eq('student_id', studentId));
}

// ---- assignments
export const listAssignments = async (classId: string) =>
  must<AssignmentRow[]>(await sb().from('assignments').select('*').eq('class_id', classId).order('created_at', { ascending: false }));
export const getAssignment = async (id: string) =>
  must<AssignmentRow>(await sb().from('assignments').select('*').eq('id', id).single());
export async function deleteAssignment(id: string) {
  must(await sb().from('assignments').delete().eq('id', id));
}

export interface PublishInput {
  classId: string; title: string; mode: AssignmentMode; source: AssignmentSource; questionCount: number;
  dueAt?: string | null; timeLimitSec?: number | null; maxAttempts?: number | null; revealAnswers: boolean;
}

export async function publishAssignment(input: PublishInput, pool: PoolItem[]): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (pool.length === 0) return { ok: false, error: 'The assignment has no questions' };
  const { data, error } = await sb()
    .from('assignments')
    .insert({
      class_id: input.classId, title: input.title, mode: input.mode, source: input.source,
      question_count: input.questionCount, due_at: input.dueAt ?? null, time_limit_sec: input.timeLimitSec ?? null,
      max_attempts: input.maxAttempts ?? null, reveal_answers: input.revealAnswers,
    })
    .select('id')
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? 'Could not create assignment' };
  for (let i = 0; i < pool.length; i += 500) {
    const chunk = pool.slice(i, i + 500).map(p => ({ assignment_id: data.id, item_key: p.item_key, question: p.question }));
    const res = await sb().from('assignment_pool').insert(chunk);
    if (res.error) {
      await sb().from('assignments').delete().eq('id', data.id);
      return { ok: false, error: res.error.message };
    }
  }
  return { ok: true, id: data.id };
}

// ---- lexicon & vocab lists
const LEX_COLS = 'id, owner_id, headword, lemma, definition, pos';

export async function searchLexicon(q: string, limit = 20): Promise<LexiconRow[]> {
  const term = normalize(q).replace(/[%_\\]/g, '');
  if (!term) return [];
  return must<LexiconRow[]>(
    await sb().from('lexicon').select(LEX_COLS).ilike('search_text', `%${term}%`)
      .order('frequency', { ascending: true, nullsFirst: false }).order('lemma').limit(limit),
  );
}

export async function addCustomWord(w: { headword: string; definition: string; pos: string }, ownerId: string) {
  return must<LexiconRow>(
    await sb().from('lexicon')
      .insert({ owner_id: ownerId, headword: w.headword.trim(), lemma: lemmaOf(w.headword), definition: w.definition.trim(), pos: w.pos })
      .select(LEX_COLS).single(),
  );
}

export const listVocabLists = async () =>
  must<VocabListRow[]>(await sb().from('vocab_lists').select('id, name, created_at').order('created_at', { ascending: false }));
export const createVocabList = async (name: string) =>
  must<VocabListRow>(await sb().from('vocab_lists').insert({ name }).select('id, name, created_at').single());
export async function renameVocabList(id: string, name: string) {
  must(await sb().from('vocab_lists').update({ name }).eq('id', id));
}
export async function deleteVocabList(id: string) {
  must(await sb().from('vocab_lists').delete().eq('id', id));
}
export async function getVocabList(id: string) {
  const list = must<VocabListRow>(await sb().from('vocab_lists').select('id, name, created_at').eq('id', id).single());
  const items = must<VocabListItemRow[]>(
    await sb().from('vocab_list_items').select(`id, lexicon_id, definition_override, position, lexicon(${LEX_COLS})`)
      .eq('list_id', id).order('position'),
  );
  return { list, items };
}
export async function addListItem(listId: string, lexiconId: number, position: number) {
  must(await sb().from('vocab_list_items').insert({ list_id: listId, lexicon_id: lexiconId, position }));
}
export async function updateListItem(itemId: string, definitionOverride: string | null) {
  must(await sb().from('vocab_list_items').update({ definition_override: definitionOverride }).eq('id', itemId));
}
export async function removeListItem(itemId: string) {
  must(await sb().from('vocab_list_items').delete().eq('id', itemId));
}

export const toVocabItem = (r: VocabListItemRow): VocabItem => ({
  itemId: r.id,
  headword: r.lexicon.headword,
  lemma: r.lexicon.lemma,
  definition: r.definition_override?.trim() || r.lexicon.definition,
  pos: r.lexicon.pos,
});

export async function loadVocabItems(listId: string): Promise<VocabItem[]> {
  return (await getVocabList(listId)).items.map(toVocabItem);
}

/** Built-in words used as extra MC distractors for short lists. */
export async function loadFallbackLexicon(): Promise<VocabItem[]> {
  const rows = must<LexiconRow[]>(await sb().from('lexicon').select(LEX_COLS).is('owner_id', null).limit(400));
  return rows.map(r => ({ itemId: `lex${r.id}`, headword: r.headword, lemma: r.lemma, definition: r.definition, pos: r.pos }));
}

// ---- reports (Task 7)
export interface GradebookRow {
  student_id: string; display_name: string; assignment_id: string; best_score: number | null; total: number | null;
  attempts: number; last_submitted_at: string | null; any_late: boolean; latest_attempt_id: string | null;
}
export const gradebook = async (classId: string) =>
  must<GradebookRow[]>(await sb().rpc('gradebook', { p_class_id: classId }));

export interface ItemAnalysisRow {
  pool_id: string; item_key: string; question: DrillQuestion; n: number; pct_correct: number | null;
  top_wrong: { answer: string; count: number }[];
}
export const itemAnalysis = async (assignmentId: string) =>
  must<ItemAnalysisRow[]>(await sb().rpc('item_analysis', { p_assignment_id: assignmentId }));
