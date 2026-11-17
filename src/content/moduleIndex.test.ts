import { describe, it, expect } from 'vitest';
import { MODULES } from './modules';
import { MODULE_INDEX } from './moduleIndex';

describe('MODULE_INDEX', () => {
  it('matches MODULES ids and titles in order', () => {
    expect(MODULE_INDEX).toEqual(MODULES.map(m => ({ id: m.id, title: m.title })));
  });
});
