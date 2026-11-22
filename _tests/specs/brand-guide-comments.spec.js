// How the owner comments on the brand guide: tap a line, write, save, come back later.
const { test, expect } = require('@playwright/test');

const PAGE = '/brand-guide/';
// Only the guide itself, not the copies of a line quoted inside the comment sheets.
const guide = (page) => page.locator('main');
const editor = (page) => page.getByRole('dialog', { name: 'Your comment' });
const commentBox = (page) => editor(page).getByRole('textbox', { name: 'Comment', exact: true });

test.beforeEach(async ({ page }) => {
  await page.goto(PAGE);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('tapping a line opens the comment sheet quoting that line', async ({ page }) => {
  const line = guide(page).getByText('Don\'t redraw, recolour or crop the mascot.');
  await line.click();
  const sheet = page.getByRole('dialog', { name: 'Your comment' });
  await expect(sheet).toBeVisible();
  await expect(sheet).toContainText('Logo');
  await expect(sheet).toContainText('Don\'t redraw, recolour or crop the mascot.');
  await expect(commentBox(page)).toBeFocused();
});

async function comment(page, lineText, text) {
  await guide(page).getByText(lineText).first().click();
  const sheet = page.getByRole('dialog', { name: 'Your comment' });
  await commentBox(page).fill(text);
  await sheet.getByRole('button', { name: 'Save' }).click();
  await expect(sheet).toBeHidden();
}

const dock = (page) => page.locator('.dock');

test('a saved comment appears under its line and the counter goes up', async ({ page }) => {
  await expect(dock(page)).toContainText('No comments yet');
  await comment(page, 'Don\'t redraw, recolour or crop the mascot.', 'Mascot could be bigger');
  const line = guide(page).getByRole('listitem').filter({ hasText: 'Don\'t redraw, recolour or crop the mascot.' });
  await expect(line).toContainText('Your comment');
  await expect(line).toContainText('Mascot could be bigger');
  await expect(dock(page)).toContainText('1 comment');
});

test('comments are still there after the page is reopened', async ({ page }) => {
  await comment(page, 'Don\'t redraw, recolour or crop the mascot.', 'Mascot could be bigger');
  await page.reload();
  await expect(guide(page).getByRole('listitem').filter({ hasText: 'Don\'t redraw' })).toContainText('Mascot could be bigger');
  await expect(dock(page)).toContainText('1 comment');
});

test('"Agree" on an empty comment saves straight away', async ({ page }) => {
  await guide(page).getByText('Short sentences. One idea each.', { exact: true }).click();
  await page.getByRole('button', { name: 'Agree', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Your comment' })).toBeHidden();
  await expect(guide(page).getByRole('listitem').filter({ hasText: 'Short sentences.' })).toContainText('Agree.');
});

test('a quick reply is added to text already typed', async ({ page }) => {
  await guide(page).getByText('Short sentences. One idea each.', { exact: true }).click();
  const box = commentBox(page);
  await box.fill('Mostly fine.');
  await page.getByRole('button', { name: 'Change this' }).click();
  await expect(box).toHaveValue('Mostly fine. Please change this: ');
  await expect(page.getByRole('dialog', { name: 'Your comment' })).toBeVisible();
});

test('a comment can be edited and deleted', async ({ page }) => {
  await comment(page, 'Don\'t redraw, recolour or crop the mascot.', 'First thought');
  await comment(page, 'Don\'t redraw, recolour or crop the mascot.', 'Second thought');
  const line = guide(page).getByRole('listitem').filter({ hasText: 'Don\'t redraw' });
  await expect(line).toContainText('Second thought');
  await expect(line).not.toContainText('First thought');

  await line.click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(line).not.toContainText('Your comment');
  await expect(dock(page)).toContainText('No comments yet');
});

test('cancel closes the sheet without saving', async ({ page }) => {
  await guide(page).getByText('Short sentences. One idea each.', { exact: true }).click();
  await commentBox(page).fill('Never mind');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(guide(page).getByRole('listitem').filter({ hasText: 'Short sentences.' })).not.toContainText('Never mind');
  await expect(dock(page)).toContainText('No comments yet');
});

test('lines can be opened with the keyboard', async ({ page }) => {
  await guide(page).getByText('Short sentences. One idea each.', { exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Your comment' })).toBeVisible();
});
