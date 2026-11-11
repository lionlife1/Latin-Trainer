const KEY = 'latiniq_lessons_read';

function load(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function hasReadLesson(moduleId: string): boolean {
  return load().includes(moduleId);
}

export function markLessonRead(moduleId: string): void {
  try {
    const list = load();
    if (list.includes(moduleId)) return;
    localStorage.setItem(KEY, JSON.stringify([...list, moduleId]));
  } catch {
    // storage unavailable: nothing is remembered
  }
}
