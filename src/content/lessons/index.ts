import type { Lesson } from './types';

export const LESSONS: Record<string, Lesson> = {};

export function lessonFor(moduleId: string): Lesson | undefined {
  return LESSONS[moduleId];
}
