import { expect, test, type Page } from '@playwright/test';

const SET_ID = '11111111-1111-4111-8111-111111111111';
const NOW = '2026-01-01T00:00:00.000Z';

const seed = (page: Page, cards: { latin: string; english: string }[]) =>
  page.addInitScript(({ id, cards, now }) => {
    if (localStorage.getItem('latiniq_vocab_sets')) return;
    const set = {
      id, name: 'Seeded', directions: ['l2e'], newPerDay: 10, createdAt: now, updatedAt: now,
      cards: cards.map((c, i) => ({ id: `c${i}`, ...c })),
    };
    localStorage.setItem('latiniq_vocab_sets', JSON.stringify({ v: 1, sets: [set] }));
  }, { id: SET_ID, cards, now: NOW });

const FOUR = [
  { latin: 'puella', english: 'girl' },
  { latin: 'agricola', english: 'farmer' },
  { latin: 'aqua', english: 'water' },
  { latin: 'nauta', english: 'sailor' },
];

test('make a set, import cards, review them, see it in recents', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await page.getByRole('link', { name: /^vocab/i }).click();
  await page.getByRole('button', { name: 'New set' }).click();
  await page.getByLabel('Set name').fill('Chapter 1');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Edit set' })).toBeVisible();

  await page.getByRole('button', { name: 'Import cards' }).click();
  await page.getByLabel('Cards to import').fill('puella\tgirl\nagricola - farmer\naqua = water\nnauta, sailor');
  await page.getByRole('button', { name: 'Preview' }).click();
  await expect(page.getByText('4 cards ready to add')).toBeVisible();
  await page.getByRole('button', { name: 'Add 4 cards' }).click();
  await expect(page.getByText('Added 4 cards.')).toBeVisible();

  await page.getByRole('link', { name: 'Back to set' }).click();
  await expect(page.locator('.stat').filter({ hasText: 'New' }).locator('.stat-val')).toHaveText('4');
  await page.getByRole('link', { name: /^Review/ }).click();

  const english: Record<string, string> = Object.fromEntries(FOUR.map(c => [c.latin, c.english]));
  for (let i = 0; i < 4; i++) {
    const latin = (await page.locator('.q-prompt .latin-word').first().innerText()).trim();
    await page.getByPlaceholder(/type your answer/i).fill(english[latin]);
    await page.keyboard.press('Enter');
    await expect(page.locator('.feedback-card')).toBeVisible();
    await page.getByRole('button', { name: /continue/i }).click();
  }
  await expect(page.getByText('Session complete')).toBeVisible();
  await expect(page.locator('.c-stat').filter({ hasText: 'Correct' }).locator('.c-stat-val')).toHaveText('4');
  await page.getByRole('button', { name: 'Back to set' }).click();
  await expect(page.locator('.stat').filter({ hasText: 'Due today' }).locator('.stat-val')).toHaveText('0');
  await expect(page.locator('.stat').filter({ hasText: 'Learned' }).locator('.stat-val')).toHaveText('4');

  await page.getByRole('link', { name: 'Practice' }).first().click();
  await expect(page.getByRole('button', { name: /Chapter 1/ })).toContainText('4/4 correct');
  expect(errors).toEqual([]);
});

test('flashcards and learn on a seeded set', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await seed(page, FOUR);

  await page.goto(`/#/practice/vocab/${SET_ID}/flashcards`);
  for (let i = 0; i < 4; i++) {
    await page.getByRole('button', { name: /^Flashcard/ }).click();
    await page.getByRole('button', { name: 'Good' }).click();
  }
  await expect(page.getByText('Session complete')).toBeVisible();

  await page.goto(`/#/practice/vocab/${SET_ID}/learn`);
  for (let i = 0; i < 4; i++) {
    await page.locator('.mc-btn').first().click();
    await page.getByRole('button', { name: /continue/i }).click();
  }
  await expect(page.getByText('Session complete')).toBeVisible();
  expect(errors).toEqual([]);
});

test.describe('phone width', () => {
  test.use({ viewport: { width: 375, height: 812 } });
  const long = [
    ...FOUR,
    { latin: 'circumdo, circumdare, circumdedi, circumdatum', english: 'to put around, surround, enclose' },
  ];
  const base = `/#/practice/vocab/${SET_ID}`;
  for (const path of ['/#/practice/vocab', base, `${base}/edit`, `${base}/flashcards`]) {
    test(`no horizontal scroll on ${path}`, async ({ page }) => {
      await seed(page, long);
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});
