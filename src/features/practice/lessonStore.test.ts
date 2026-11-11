import { hasReadLesson, markLessonRead } from './lessonStore';

const KEY = 'latiniq_lessons_read';
beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe('lessonStore', () => {
  it('round trips', () => {
    expect(hasReadLesson('m1')).toBe(false);
    markLessonRead('m1');
    expect(hasReadLesson('m1')).toBe(true);
    expect(hasReadLesson('m2')).toBe(false);
  });
  it('dedupes writes', () => {
    markLessonRead('m1');
    markLessonRead('m1');
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual(['m1']);
  });
  it('treats corrupt JSON as empty', () => {
    localStorage.setItem(KEY, '{nope');
    expect(hasReadLesson('m1')).toBe(false);
    markLessonRead('m1');
    expect(hasReadLesson('m1')).toBe(true);
  });
  it('treats a non-array as empty', () => {
    localStorage.setItem(KEY, JSON.stringify({ m1: true }));
    expect(hasReadLesson('m1')).toBe(false);
  });
  it('skips non-string entries', () => {
    localStorage.setItem(KEY, JSON.stringify(['m1', 4, null, { a: 1 }]));
    expect(hasReadLesson('m1')).toBe(true);
    markLessonRead('m2');
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual(['m1', 'm2']);
  });
  it('does not throw when setItem throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('full'); });
    expect(() => markLessonRead('m1')).not.toThrow();
  });
  it('does not throw when getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(hasReadLesson('m1')).toBe(false);
  });
});
