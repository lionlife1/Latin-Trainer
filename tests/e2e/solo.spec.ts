import { expect, test } from '@playwright/test';

test('grammar drill from the path, then it shows in recents', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Practice' })).toBeVisible();
  await expect(page.getByText('Your practice sessions will show up here.')).toBeVisible();

  await page.getByRole('link', { name: /grammar/i }).first().click();
  await page.getByRole('link', { name: /forms bootcamp/i }).click();
  await page.getByLabel('Session length').selectOption('5');
  await page.getByRole('button', { name: /start session/i }).click();

  for (let i = 0; i < 5; i++) {
    await expect(page.locator('.drill-progress-label')).toHaveText(`${i + 1} / 5`);
    if (await page.locator('.mc-btn').count()) {
      await page.locator('.mc-btn').first().click();
    } else {
      await page.getByPlaceholder(/type your answer/i).fill('amem');
      await page.keyboard.press('Enter');
    }
    await expect(page.locator('.feedback-card')).toBeVisible();
    await page.getByRole('button', { name: /continue/i }).click();
  }
  await expect(page.getByText('Session complete')).toBeVisible();
  await page.getByRole('button', { name: /back to path/i }).click();
  await expect(page.getByRole('heading', { name: 'Grammar' })).toBeVisible();
  await expect(page.locator('.path-step').first()).toHaveAttribute('data-state', /practiced|complete/);

  await page.getByRole('link', { name: 'Practice' }).first().click();
  await expect(page.getByRole('button', { name: /forms bootcamp/i })).toContainText('Today');
  expect(errors).toEqual([]);
});

test('endless train generates questions and logs the run', async ({ page }) => {
  await page.goto('/#/practice/grammar');
  await page.getByRole('link', { name: /endless train/i }).click();
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page.locator('.drill-progress-label')).toHaveText('Endless · 0 answered');
  await page.getByPlaceholder(/type your answer/i).fill('x');
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: /continue/i }).click();
  await expect(page.locator('.q-prompt')).toBeVisible();
  await page.getByRole('button', { name: /exit session/i }).click();
  await expect(page.getByRole('button', { name: /endless train/i })).toContainText('0/1 correct');
});

test('forms drill from Practice home, then it shows in recents', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await page.getByRole('link', { name: 'Forms' }).click();
  await expect(page.getByRole('heading', { name: 'Forms' })).toBeVisible();
  await page.getByLabel('Nouns', { exact: true }).check();
  await page.getByLabel('Session length').selectOption('10');
  await page.getByRole('button', { name: /start session/i }).click();

  for (let i = 0; i < 10; i++) {
    await expect(page.locator('.drill-progress-label')).toHaveText(`${i + 1} / 10`);
    if (await page.locator('.mc-btn').count()) {
      await page.locator('.mc-btn').first().click();
    } else {
      await page.getByPlaceholder(/type your answer/i).fill('x');
      await page.keyboard.press('Enter');
    }
    await expect(page.locator('.feedback-card')).toBeVisible();
    await page.getByRole('button', { name: /continue/i }).click();
  }
  await expect(page.getByText('Session complete')).toBeVisible();
  await page.getByRole('button', { name: /back to practice/i }).click();
  await expect(page.getByRole('button', { name: /Forms/ })).toContainText('Today');
  expect(errors).toEqual([]);
});

test.describe('module lesson', () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test('read the lesson, no horizontal scroll, back to the intro as Review', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/');
    await page.getByRole('link', { name: /grammar/i }).first().click();
    await page.getByRole('link', { name: /forms bootcamp/i }).click();
    await page.getByRole('button', { name: 'Read the lesson' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'The Four Subjunctive Tenses' })).toBeVisible();
    await expect(page.locator('table.lesson-table').first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await page.getByRole('button', { name: 'Practise this module' }).click();
    await expect(page.getByRole('button', { name: 'Review the lesson' })).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test.describe('phone width', () => {
  test.use({ viewport: { width: 375, height: 812 } });
  for (const path of ['/#/practice', '/#/practice/grammar', '/#/practice/grammar/forms_bootcamp', '/#/practice/forms', '/#/practice/vocab']) {
    test(`no horizontal scroll on ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});
