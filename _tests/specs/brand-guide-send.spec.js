// How the owner sends comments back: review the list, then WhatsApp, share or copy.
const { test, expect } = require('@playwright/test');

const PAGE = '/brand-guide/';
const guide = (page) => page.locator('main');
const review = (page) => page.getByRole('dialog', { name: 'Your comments' });
const sendWa = (page) => review(page).getByRole('button', { name: 'Send on WhatsApp' });
const copyBtn = (page) => review(page).getByRole('button', { name: 'Copy all comments' });
const overall = (page) => review(page).getByRole('textbox', { name: 'Overall comment' });

// WhatsApp itself is not loaded during tests; we only record what would be sent.
async function stubWhatsApp(context) {
  const sent = [];
  await context.route(/https:\/\/(wa\.me|api\.whatsapp\.com)\//, (route) => {
    sent.push(decodeURIComponent(new URL(route.request().url()).searchParams.get('text') || ''));
    route.fulfill({ status: 200, contentType: 'text/html', body: '<title>WhatsApp stub</title>' });
  });
  return sent;
}

async function comment(page, lineText, text) {
  await guide(page).getByText(lineText).first().click();
  const sheet = page.getByRole('dialog', { name: 'Your comment' });
  await sheet.getByRole('textbox', { name: 'Comment', exact: true }).fill(text);
  await sheet.getByRole('button', { name: 'Save' }).click();
  await expect(sheet).toBeHidden();
}

const openReview = (page) => page.getByRole('button', { name: 'Review and send' }).click();

test.beforeEach(async ({ page }) => {
  await page.goto(PAGE);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('with nothing written, the sheet says how to comment and sending is off', async ({ page }) => {
  await openReview(page);
  await expect(review(page)).toContainText('Tap any line in the guide');
  await expect(review(page)).toContainText('or write an overall comment below');
  await expect(sendWa(page)).toBeDisabled();
  await expect(copyBtn(page)).toBeDisabled();
});

test('an overall comment on its own turns sending on', async ({ page }) => {
  await openReview(page);
  await overall(page).fill('Looks good overall');
  await expect(sendWa(page)).toBeEnabled();
  await expect(copyBtn(page)).toBeEnabled();
  await overall(page).fill('   ');
  await expect(sendWa(page)).toBeDisabled();
});

test('Send on WhatsApp opens WhatsApp with the name, overall comment and line comments', async ({ page, context }) => {
  const sent = await stubWhatsApp(context);
  await comment(page, 'Don\'t redraw, recolour or crop the mascot.', 'Mascot could be bigger');
  await openReview(page);
  await overall(page).fill('Happy with the direction');
  await review(page).getByRole('textbox', { name: 'Your name (optional)' }).fill('Derrick');

  const popup = page.waitForEvent('popup');
  await sendWa(page).click();
  await (await popup).waitForLoadState();

  expect(sent).toHaveLength(1);
  expect(sent[0]).toContain('Pawsitive Image brand guide: comments from Derrick');
  expect(sent[0]).toContain('Overall:\nHappy with the direction');
  expect(sent[0]).toContain('[Logo] "Don\'t redraw, recolour or crop the mascot."');
  expect(sent[0]).toContain('> Mascot could be bigger');
});

test('if the browser blocks new windows, WhatsApp opens in the same tab', async ({ page, context }) => {
  const sent = await stubWhatsApp(context);
  await page.addInitScript(() => { window.open = () => null; });
  await page.reload();
  await openReview(page);
  await overall(page).fill('Sent from a strict browser');
  await sendWa(page).click();
  await expect(page).toHaveTitle('WhatsApp stub');
  expect(sent[0]).toContain('Sent from a strict browser');
});

test('nothing is lost after sending: comments are still there on return', async ({ page, context }) => {
  await stubWhatsApp(context);
  await page.addInitScript(() => { window.open = () => null; });
  await page.reload();
  await comment(page, 'Short sentences. One idea each.', 'Agree, keep it short');
  await openReview(page);
  await overall(page).fill('Overall fine');
  await sendWa(page).click();
  await expect(page).toHaveTitle('WhatsApp stub');

  await page.goto(PAGE);
  await expect(page.locator('.dock')).toContainText('1 comment');
  await openReview(page);
  await expect(overall(page)).toHaveValue('Overall fine');
  await expect(review(page)).toContainText('Agree, keep it short');
});

test('Copy all comments puts the same text on the clipboard', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await comment(page, 'Short sentences. One idea each.', 'Agree, keep it short');
  await openReview(page);
  await copyBtn(page).click();
  await expect(page.getByRole('status')).toHaveText('Copied');
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain('[Voice] "Short sentences. One idea each."');
  expect(text).toContain('> Agree, keep it short');
});

test('tapping a comment in the list reopens it for editing', async ({ page }) => {
  await comment(page, 'Short sentences. One idea each.', 'First draft');
  await openReview(page);
  await review(page).getByRole('button', { name: /First draft/ }).click();
  const sheet = page.getByRole('dialog', { name: 'Your comment' });
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole('textbox', { name: 'Comment', exact: true })).toHaveValue('First draft');
});
