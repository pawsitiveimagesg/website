// Runs the site from a local static server (or against BASE_URL, e.g. the live site)
// in installed Google Chrome, emulating a phone and a desktop.
const { defineConfig, devices } = require('@playwright/test');

const live = process.env.BASE_URL;
const PORT = 8766;

module.exports = defineConfig({
  testDir: './specs',
  fullyParallel: true,
  retries: live ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: live || `http://127.0.0.1:${PORT}`,
    channel: 'chrome',
  },
  projects: [
    { name: 'phone', use: { ...devices['Pixel 7'], channel: 'chrome' } },
    { name: 'desktop', use: { viewport: { width: 1280, height: 860 }, channel: 'chrome' } },
  ],
  webServer: live ? undefined : {
    command: `python -I serve.py ${PORT}`,
    url: `http://127.0.0.1:${PORT}/brand-guide/`,
    reuseExistingServer: false,
    stdout: 'ignore',
    stderr: 'ignore',
  },
});
