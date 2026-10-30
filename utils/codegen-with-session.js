// ============================================================
// CODEGEN WITH SAVED ACME SESSION
// `playwright codegen --load-storage` only restores cookies and
// localStorage. ACME keeps its auth tokens in sessionStorage, so we
// restore both (same as fixtures/baseFixtures.ts) and open the
// Playwright Inspector via page.pause() — click "Record" to codegen.
//
// Usage: npm run codegen [-- <url-or-hash-path>]
// ============================================================

const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');
require('dotenv').config();

const AUTH_DIR = 'playwright/.auth';
const STATE_FILE = path.join(AUTH_DIR, 'acme-state.json');
const SESSION_FILE = path.join(AUTH_DIR, 'acme-session.json');

(async () => {
  if (!fs.existsSync(STATE_FILE) || !fs.existsSync(SESSION_FILE)) {
    console.error('❌ No saved ACME session. Run a test first to log in and save it.');
    process.exit(1);
  }

  const appOrigin = new URL(process.env.BASE_URL).origin;
  const arg = process.argv[2];
  const startUrl = arg
    ? (arg.startsWith('http') ? arg : `${appOrigin}/${arg.replace(/^\//, '')}`)
    : `${appOrigin}/#/pages/dashboard/summary-dashboard`;

  const savedSession = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    storageState: STATE_FILE,
    viewport: null
  });

  await context.addInitScript(([data, origin]) => {
    if (window.location.origin !== origin) return;
    if (window.sessionStorage.getItem('AUTH_TOKEN')) return;
    for (const [key, value] of Object.entries(data)) {
      window.sessionStorage.setItem(key, value);
    }
  }, [savedSession, appOrigin]);

  const page = await context.newPage();
  await page.goto(startUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });

  console.log('🎬 Inspector open — press "Record" to start generating code.');
  await page.pause();

  await browser.close();
})();
