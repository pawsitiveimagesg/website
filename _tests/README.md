# Browser tests

Tests for the review pages: the brand guide (`/brand-guide/`) and the three landing page concepts (`/concepts/`). Each test runs twice, once as a phone (Pixel 7) and once as a desktop, in your installed Google Chrome.

This folder starts with an underscore, so GitHub Pages does not publish it.

## Run

```
cd _tests
npm install
npm test             # against a local copy of the site
npm run test:live    # against https://www.pawsitiveimage.com.sg
```

## What is covered

- **Brand guide, commenting:** tapping a line opens the comment sheet; comments save, show under the line, survive a reload, and can be edited, deleted or cancelled; quick replies; keyboard access.
- **Brand guide, sending:** sending is off with nothing written and on with an overall or line comment; WhatsApp gets the name, overall comment and line comments; WhatsApp still opens when the browser blocks new windows; comments are kept after sending; copy to clipboard.
- **Concepts:** one main heading with the concept's message; marked as a draft and hidden from search; no sideways scrolling at 360 px; every image loads; every booking link goes to the salon's WhatsApp with a message ready; a tappable phone number; a WhatsApp button stays on screen on phones; no words from the brand guide's banned list.
