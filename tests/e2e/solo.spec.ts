import { expect, test } from '@playwright/test';

test('solo M0 drill works without a backend', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await page.getByText('Forms Bootcamp').click();
  await page.getByLabel('Session Length:').selectOption('5');
  await page.getByRole('button', { name: /begin session/i }).click();

  for (let i = 0; i < 5; i++) {
    await expect(page.locator('.drill-progress-label')).toHaveText(`${i + 1} / 5`);
    if (await page.locator('.mc-btn').count()) {
      await page.locator('.mc-btn').first().click();
    } else {
      await page.getByPlaceholder(/type your answer/i).fill('amem');
      await page.keyboard.press('Enter');
    }
    await expect(page.locator('.feedback-card')).toBeVisible();
    await page.getByRole('button', { name: /next/i }).click();
  }
  await expect(page.getByText('Session Complete!')).toBeVisible();
  await page.getByRole('button', { name: /module map/i }).click();
  await expect(page.getByText('SELECT MODULE')).toBeVisible();
  expect(errors).toEqual([]);
});

test('endless train generates questions', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /endless train/i }).click();
  await page.getByRole('button', { name: /start grinding/i }).click();
  await expect(page.locator('.drill-progress-label')).toHaveText('ENDLESS MODE');
  await page.getByPlaceholder(/type your answer/i).fill('x');
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: /next/i }).click();
  await expect(page.locator('.q-prompt')).toBeVisible();
});
