// The three landing page concepts: they must work on a phone, book through the salon's
// WhatsApp, and follow the brand guide's word rules.
const { test, expect } = require('@playwright/test');

const SALON_WA = 'https://wa.me/6593851366';
const CONCEPTS = [
  { path: '/concepts/craft/', name: 'Craft', line: 'Hand-scissored grooming, since 2015' },
  { path: '/concepts/care/', name: 'Care', line: 'A groomer stays with your dog, start to finish' },
  { path: '/concepts/finish/', name: 'The Finish', line: 'Finished by hand.' },
];
// From the brand guide's "Don't say" list.
const BANNED = [/fur ?baby/i, /furkid/i, /pawrent/i, /pawfect/i, /\bpamper/i, /\bcheap\b/i, /\bdiscount/i,
  /\bpromo\b/i, /\bdeal\b/i, /% off/i, /best in singapore/i, /no\. ?1/i, /world-class/i, /100% safe/i, /\bcures?\b/i];

// Bring every image into view the way a reader would, including swiping sideways
// through a gallery, so lazy-loaded photos get their chance to load.
async function lookAtEveryImage(page) {
  const imgs = page.locator('img');
  for (let i = 0, n = await imgs.count(); i < n; i++) {
    await imgs.nth(i).scrollIntoViewIfNeeded();
    // A lazy image reports "complete" before it starts downloading, so wait for real pixels.
    await expect.poll(() => imgs.nth(i).evaluate((img) => img.naturalWidth), {
      message: `image ${await imgs.nth(i).getAttribute('src')} did not load`,
    }).toBeGreaterThan(0);
  }
}

test('the index page links to all three concepts', async ({ page }) => {
  await page.goto('/concepts/');
  for (const c of CONCEPTS) {
    const link = page.getByRole('link', { name: new RegExp(`Open concept`) }).filter({ has: page.getByRole('heading', { name: c.name, exact: true }) });
    await expect(link).toHaveAttribute('href', c.path.replace('/concepts/', ''));
  }
  const res = await Promise.all(CONCEPTS.map((c) => page.request.get(c.path)));
  res.forEach((r) => expect(r.status()).toBe(200));
});

for (const c of CONCEPTS) {
  test.describe(`Concept ${c.name}`, () => {
    test.beforeEach(async ({ page }) => { await page.goto(c.path); });

    test('leads with its message in a single main heading', async ({ page }) => {
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.getByRole('heading', { level: 1 })).toContainText(c.line);
    });

    test('is marked as a draft, links back to all three, and is hidden from search', async ({ page }) => {
      await expect(page.getByText(/Concept [ABC] of 3/)).toBeVisible();
      await expect(page.getByRole('link', { name: 'see all three' })).toHaveAttribute('href', '../');
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    });

    test('has no sideways scrolling, even on a small phone', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 740 });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });

    test('every image loads', async ({ page }) => {
      await lookAtEveryImage(page);
      const broken = await page.evaluate(() => [...document.images].filter((i) => i.naturalWidth === 0).map((i) => i.getAttribute('src')));
      expect(broken).toEqual([]);
    });

    test('every booking link goes to the salon\'s WhatsApp with a message ready', async ({ page }) => {
      const hrefs = await page.locator('a[href*="wa.me"]').evaluateAll((as) => as.map((a) => a.href));
      expect(hrefs.length).toBeGreaterThanOrEqual(3);
      for (const h of hrefs) {
        expect(h.startsWith(SALON_WA + '?text=')).toBe(true);
        expect(decodeURIComponent(h)).toContain('Pawsitive Image');
      }
    });

    test('follows the brand guide\'s word rules', async ({ page }) => {
      const text = await page.locator('body').innerText();
      for (const word of BANNED) expect(text, `uses "${word}"`).not.toMatch(word);
    });

    test('keeps a WhatsApp button on screen while reading on a phone, and hides the bar on desktop', async ({ page }, info) => {
      const bar = page.locator('.dock');
      if (info.project.name === 'desktop') {
        await expect(bar).toBeHidden();
        return;
      }
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      const btn = bar.getByRole('link', { name: /Book on WhatsApp/ });
      await expect(btn).toBeInViewport();
      const box = await btn.boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(44); // comfortable thumb target
    });
  });
}

for (const c of CONCEPTS) {
  test(`concept ${c.name} has a tappable phone number on every screen size`, async ({ page }) => {
    await page.goto(c.path);
    const call = page.locator('a[href="tel:+6593851366"]').locator('visible=true');
    await expect(call.first()).toBeVisible();
  });
}

test('the brand guide has no sideways scrolling on a small phone and is hidden from search', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/brand-guide/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});
