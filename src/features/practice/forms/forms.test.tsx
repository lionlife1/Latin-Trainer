import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { loadSessions } from '../sessionLog';
import { FormsSetup } from './FormsSetup';
import { DEFAULT_FORMS_SETTINGS, loadFormsSettings, saveFormsSettings } from './formsSettings';
import { logForms } from './FormsRoute';

const KEY = 'latiniq_forms_settings';
const setup = (onStart = vi.fn()) => {
  render(<MemoryRouter><FormsSetup initial={DEFAULT_FORMS_SETTINGS} onStart={onStart} onBack={() => {}} /></MemoryRouter>);
  return onStart;
};

beforeEach(() => localStorage.clear());

describe('formsSettings', () => {
  it('falls back to defaults for corrupt settings', () => {
    localStorage.setItem(KEY, '{nope');
    expect(loadFormsSettings()).toEqual(DEFAULT_FORMS_SETTINGS);
    localStorage.setItem(KEY, JSON.stringify({ config: { kinds: ['spells'], tenses: 7 }, length: 99 }));
    const s = loadFormsSettings();
    expect(s.config.kinds).toEqual(DEFAULT_FORMS_SETTINGS.config.kinds);
    expect(s.config.tenses).toEqual(DEFAULT_FORMS_SETTINGS.config.tenses);
    expect(s.length).toBe(10);
  });

  it('round-trips saved settings', () => {
    const saved = { config: { ...DEFAULT_FORMS_SETTINGS.config, kinds: ['nouns' as const] }, length: 20 as const };
    saveFormsSettings(saved);
    expect(loadFormsSettings()).toEqual(saved);
  });
});

describe('FormsSetup', () => {
  it('shows filters for the checked kinds only', async () => {
    const user = userEvent.setup();
    setup();
    expect(screen.getByText('Conjugation')).toBeInTheDocument();
    expect(screen.queryByText('Declension')).not.toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'Nouns' }));
    expect(screen.getByText('Declension')).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'Verbs' }));
    expect(screen.queryByText('Conjugation')).not.toBeInTheDocument();
  });

  it('disables Start when nothing matches', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('checkbox', { name: 'Verbs' }));
    expect(screen.getByText('No forms match these settings. Turn on more options.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start session' })).toBeDisabled();
    await user.click(screen.getByRole('checkbox', { name: 'Verbs' }));
    expect(screen.getByRole('button', { name: 'Start session' })).toBeEnabled();
    await user.click(screen.getByRole('checkbox', { name: 'Make the form' }));
    await user.click(screen.getByRole('checkbox', { name: 'Identify the form' }));
    expect(screen.getByRole('button', { name: 'Start session' })).toBeDisabled();
  });

  it('starts with the chosen settings', async () => {
    const user = userEvent.setup();
    const onStart = setup();
    await user.click(screen.getByRole('checkbox', { name: 'Nouns' }));
    fireEvent.change(screen.getByLabelText('Session length'), { target: { value: '20' } });
    await user.click(screen.getByRole('button', { name: 'Start session' }));
    const s = onStart.mock.calls[0][0];
    expect(s.config.kinds).toEqual(['verbs', 'nouns']);
    expect(s.length).toBe(20);
  });
});

describe('logForms', () => {
  it('records nothing for an empty run, and a forms session otherwise', () => {
    expect(logForms([])).toBe(false);
    expect(loadSessions()).toEqual([]);
    const q = { id: 'g', type: 'typein' as const, badge: 'B', prompt: '', answers: ['x'] };
    expect(logForms([{ q, given: 'x', correct: true }, { q, given: 'y', correct: false }])).toBe(true);
    expect(loadSessions()[0]).toMatchObject({ kind: 'forms', module_id: null, correct: 1, total: 2, xp: 0 });
  });
});
