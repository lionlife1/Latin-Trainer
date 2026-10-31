import { expect, test, type Page } from '@playwright/test';

// Needs a running Supabase stack with this repo's migrations, seed and edge functions:
//   supabase start && supabase functions serve
//   E2E_SUPABASE=1 VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... npx playwright test classroom
test.skip(!process.env.E2E_SUPABASE, 'set E2E_SUPABASE=1 with a local Supabase stack to run');

const WORDS: Record<string, string> = { 'to love': 'amō', 'to see': 'videō', 'to lead': 'dūcō', girl: 'puella' };

async function addWord(page: Page, search: string, headwordStart: string) {
  await page.getByPlaceholder(/search latin or english/i).fill(search);
  const row = page.locator('li', { hasText: headwordStart }).first();
  await row.getByRole('button', { name: 'Add' }).click();
  await expect(row.getByRole('button', { name: 'Added' })).toBeVisible();
}

test('teacher assigns a vocab test, student takes it, teacher sees results', async ({ browser }) => {
  const stamp = Date.now();
  const teacher = await (await browser.newContext()).newPage();
  teacher.on('dialog', d => d.accept());

  // Teacher signs up and creates a class
  await teacher.goto('/#/teacher/login');
  await teacher.getByRole('button', { name: /create a teacher account/i }).click();
  await teacher.getByLabel(/name students will see/i).fill('Magistra');
  await teacher.getByLabel('Email').fill(`t${stamp}@example.com`);
  await teacher.getByLabel('Password').fill('correct horse battery');
  await teacher.getByRole('button', { name: /create account/i }).click();
  await expect(teacher.getByText('Your classes')).toBeVisible();
  await teacher.getByPlaceholder(/latin iii/i).fill('Latin III');
  await teacher.getByRole('button', { name: 'Create' }).click();
  await teacher.getByRole('link', { name: 'Latin III' }).click();
  const code = (await teacher.getByTestId('join-code').textContent())!.trim();

  // Vocab list with 4 words
  await teacher.getByRole('link', { name: 'Vocab lists' }).click();
  await teacher.getByPlaceholder(/chapter 12/i).fill('Chapter 1');
  await teacher.getByRole('button', { name: 'Create' }).click();
  await addWord(teacher, 'amo', 'amō, amāre');
  await addWord(teacher, 'video', 'videō, vidēre');
  await addWord(teacher, 'duco', 'dūcō, dūcere');
  await addWord(teacher, 'puella', 'puella, puellae');

  // Test assignment: English -> Latin only, 4 questions
  await teacher.getByRole('link', { name: 'Classes' }).click();
  await teacher.getByRole('link', { name: 'Latin III' }).click();
  await teacher.getByRole('link', { name: /new assignment/i }).click();
  await teacher.getByLabel('Title').fill('Vocab quiz 1');
  await teacher.getByLabel(/^test/i).check();
  await teacher.getByLabel('Vocab list').first().check();
  await teacher.getByRole('combobox').selectOption({ label: 'Chapter 1' });
  await teacher.getByLabel(/latin → english/i).uncheck();
  await expect(teacher.getByTestId('pool-size')).toHaveText('Pool: 4 questions');
  await teacher.getByRole('button', { name: /publish assignment/i }).click();
  await expect(teacher.getByText('Vocab quiz 1')).toBeVisible();

  // Student joins and takes the test: 3 right, 1 wrong
  const student = await (await browser.newContext()).newPage();
  student.on('dialog', d => d.accept());
  await student.goto('/#/join');
  await student.getByLabel(/class code/i).fill(code);
  await student.getByLabel(/your name/i).fill(`Marcus${stamp % 1000}`);
  await student.getByLabel(/pin/i).fill('123456');
  await student.getByRole('button', { name: /join class/i }).click();
  await student.getByRole('link', { name: 'Start' }).click();
  await student.getByRole('button', { name: /begin/i }).click();
  for (let i = 0; i < 4; i++) {
    const def = (await student.locator('.q-prompt strong').textContent())!.trim();
    await student.getByPlaceholder(/type your answer/i).fill(def === 'girl' ? 'puer' : WORDS[def]);
    if (i < 3) await student.getByRole('button', { name: /next/i }).click();
  }
  await student.getByRole('button', { name: /submit test/i }).click();
  await expect(student.getByText('3/4')).toBeVisible();

  // Teacher sees the score and the misconception
  await teacher.getByRole('link', { name: 'Gradebook' }).click();
  await expect(teacher.getByRole('link', { name: '3/4' })).toBeVisible();
  await teacher.getByRole('link', { name: 'Vocab quiz 1' }).click();
  await expect(teacher.getByText('puer')).toBeVisible();
});
