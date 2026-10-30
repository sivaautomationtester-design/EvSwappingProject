import {
  test as base,
  expect,
  Page,
  Browser,
  BrowserContext,
  request as playwrightRequest
} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

import { LoginPage } from '../pages/login.page';
import { waitForAllPopupsToClose } from '../pages/base.page';
import { BatteryOnboardPage } from '../pages/asset-onboarding/BatteryOnboardPage';
import { DashboardPage } from '../pages/dashboard.page';
import { ApiClient } from '../utils/api-client';
import { SwapStationPage } from '../pages/asset-onboarding/SwapStationOnboardPage';
import { SitePage } from '../pages/asset-onboarding/SiteOnboardPage';
import { VehicleOnboardPage } from '../pages/asset-onboarding/VehicleOnboardPage';
import { VtsPage } from '../pages/asset-onboarding/VTSOnboardPage';
import { KeyFobPage } from '../pages/asset-onboarding/KeyfobOnboardPage';
import { env } from '../utils/env';
import { TechnicianPage } from '../pages/User-Onboarding/TechnicianOnboardPage';
import { RolePage } from '../pages/RoleManagement/RolePage';
import { UserPage } from '../pages/RoleManagement/UserPage';
import { CompanyOnboardPage } from '../pages/PartnerManagement/CompanyOnboardPage';
import { ChecklistPage } from '../pages/WorkflowManagement/ChecklistPage';
import { AssetLinkPage } from '../pages/asset-onboarding/AssetLinkPage';
import { TicketPage } from '../pages/WorkflowManagement/TicketPage';
import { DriverPage } from '../pages/User-Onboarding/DriverPage';


type TestFixtures = {

  loginPage: LoginPage;

  apiClient: ApiClient;

  dashboardPage: DashboardPage;

  swapStationPage: SwapStationPage;

  sitePage: SitePage;

  vehiclePage: VehicleOnboardPage;

  vtsPage: VtsPage;

  keyFobPage: KeyFobPage;

  batteryOnboardPage: BatteryOnboardPage;

  technicianPage: TechnicianPage;

  rolePage: RolePage;

  userPage: UserPage;

  companyOnboardPage: CompanyOnboardPage;

  checklistPage: ChecklistPage;

  assetLinkPage: AssetLinkPage;

  ticketPage: TicketPage;

  // Driver page as tenant admin (verify) and as partner admin
  driverPage: DriverPage;

  partnerDriverPage: DriverPage;

  waitForPopups: void;
};


type WorkerFixtures = {

  authenticatedContext: BrowserContext;

  authenticatedPage: Page;

  // Partner admin login, separate from the tenant admin
  partnerContext: BrowserContext;

  partnerPage: Page;
};


// ============================================================
// SAVED LOGIN SESSION
// ACME keeps its auth tokens (AUTH_TOKEN, auth-token, ...) in
// sessionStorage, which storageState() does NOT save. So we save
// cookies via storageState and sessionStorage in our own file,
// and put sessionStorage back with an init script.
// ============================================================

const AUTH_DIR = 'playwright/.auth';

const appOrigin = new URL(env.baseUrl).origin;
const dashboardUrl = `${appOrigin}/#/pages/dashboard/summary-dashboard`;

// Written by company.spec.ts after it onboards a company
export const PARTNER_ACCOUNT_FILE = path.join(AUTH_DIR, 'partner-account.json');


// ============================================================
// LOGIN ACCOUNTS
// Tenant admin (from .env) and partner admin each keep their own
// saved session files
// ============================================================

type LoginAccount = {
  label: string;
  username: string;
  password: string;
  stateFile: string;
  sessionFile: string;
  // Page the account lands on after login
  landingUrl: RegExp;
};

const tenantAccount: LoginAccount = {
  label: 'ACME',
  username: env.app.username,
  password: env.app.password,
  stateFile: path.join(AUTH_DIR, 'acme-state.json'),
  sessionFile: path.join(AUTH_DIR, 'acme-session.json'),
  landingUrl: /#\/pages\/dashboard\//
};

// Partner admin: the company admin's email, with the tenant password.
// PARTNER_USERNAME / PARTNER_PASSWORD in .env override it; otherwise
// the latest company onboarded by company.spec.ts is used.
function partnerAccount(): LoginAccount {

  let username = process.env.PARTNER_USERNAME;

  if (!username && fs.existsSync(PARTNER_ACCOUNT_FILE)) {
    username = JSON.parse(
      fs.readFileSync(PARTNER_ACCOUNT_FILE, 'utf-8')
    ).username;
  }

  if (!username) {
    throw new Error(
      'No partner account: run tests/PartnerManagement/company.spec.ts ' +
      'first, or set PARTNER_USERNAME in .env'
    );
  }

  // One session per partner, so a new company does not reuse
  // an older company's login
  const fileId = username.replace(/[^a-zA-Z0-9]/g, '_');

  return {
    label: 'PARTNER',
    username,
    password: process.env.PARTNER_PASSWORD ?? env.app.password,
    stateFile: path.join(AUTH_DIR, `partner-${fileId}-state.json`),
    sessionFile: path.join(AUTH_DIR, `partner-${fileId}-session.json`),
    landingUrl: /#\/pages\//
  };
}


async function restoreSavedSession(
  browser: Browser,
  account: LoginAccount
): Promise<BrowserContext | null> {

  if (!fs.existsSync(account.stateFile) || !fs.existsSync(account.sessionFile)) {
    console.log(`ℹ️ No saved ${account.label} session found`);
    return null;
  }

  console.log(`♻️ Restoring saved ${account.label} session...`);

  const savedSession: Record<string, string> =
    JSON.parse(fs.readFileSync(account.sessionFile, 'utf-8'));

  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    storageState: account.stateFile
  });

  // Runs before the app's scripts on every navigation.
  // Only fills sessionStorage when it is empty, so tokens the
  // app refreshes during the run are not overwritten.
  await context.addInitScript(([data, origin]) => {
    if (window.location.origin !== origin) return;
    if (window.sessionStorage.getItem('AUTH_TOKEN')) return;
    for (const [key, value] of Object.entries(data)) {
      window.sessionStorage.setItem(key, value);
    }
  }, [savedSession, appOrigin] as const);

  const page = await context.newPage();

  await page.goto(
    dashboardUrl,
    {
      waitUntil: 'domcontentloaded',
      timeout: 60_000
    }
  );

  // Give the app's auth guard time to redirect to login if tokens expired
  await page.waitForTimeout(5_000);

  if (account.landingUrl.test(page.url())) {
    console.log(`✅ Saved ${account.label} session is valid`);
    return context;
  }

  console.log(`⚠️ Saved ${account.label} session expired, doing full login`);
  console.log('URL:', page.url());

  await context.close();
  return null;
}


async function fullLogin(
  browser: Browser,
  account: LoginAccount
): Promise<BrowserContext> {

  const context = await browser.newContext({
    ignoreHTTPSErrors: true
  });

  const page = await context.newPage();

  console.log('🌐 Opening ACME Portal...');

  await page.goto(
    env.baseUrl,
    {
      waitUntil: 'domcontentloaded',
      timeout: 60_000
    }
  );

  console.log('🌐 ACME Portal opened');
  console.log('URL:', page.url());

  // ========================================================
  // LOGIN
  // ========================================================

  const loginPage = new LoginPage(page);

  console.log(`🔐 Logging into ACME as ${account.label}: ${account.username}`);

  await loginPage.loginWithCredentials(
    account.username,
    account.password
  );

  // CAPTCHA
  await loginPage.completeCaptcha();

  // Get Started
  await loginPage.clickGetStarted();

  // ========================================================
  // OTP
  // ========================================================

  const authRequest = await playwrightRequest.newContext();

  let otp: string;

  try {
    const apiClient = new ApiClient(authRequest);

    console.log('🔑 Generating SuperAdmin token...');

    const accessToken =
      await apiClient.generateSuperAdminToken();

    console.log('🔐 Getting latest OTP...');

    otp = await apiClient.getOtp(accessToken);
  } finally {
    await authRequest.dispose();
  }

  console.log('✅ OTP received');

  // Enter OTP
  await loginPage.enterOtp(otp);

  // Verify OTP
  await loginPage.verifyOtp();

  // Verify login
  await loginPage.expectLoginSuccessful(account.landingUrl);

  // ========================================================
  // SAVE SESSION FOR NEXT WORKER
  // ========================================================

  const sessionData: Record<string, string> =
    await page.evaluate(() => {
      const out: Record<string, string> = {};
      for (const key of Object.keys(sessionStorage)) {
        out[key] = sessionStorage.getItem(key) ?? '';
      }
      return out;
    });

  fs.mkdirSync(AUTH_DIR, { recursive: true });
  await context.storageState({ path: account.stateFile });
  fs.writeFileSync(account.sessionFile, JSON.stringify(sessionData));

  console.log(`💾 ${account.label} session saved: ${AUTH_DIR}`);

  return context;
}


export const test = base.extend<TestFixtures, WorkerFixtures>({

  // ============================================================
  // ONE BROWSER CONTEXT FOR THE ENTIRE WORKER
  // ============================================================

  authenticatedContext: [
    async ({ browser }, use) => {

      console.log('');
      console.log('==========================================');
      console.log('🚀 STARTING ACME BROWSER');
      console.log('==========================================');

      const context =
        (await restoreSavedSession(browser, tenantAccount)) ??
        (await fullLogin(browser, tenantAccount));

      const page = context.pages()[0];

      console.log('');
      console.log('==========================================');
      console.log('✅ ACME LOGIN SUCCESSFUL');
      console.log('URL:', page.url());
      console.log('==========================================');
      console.log('');

      // Keep browser alive
      await use(context);

      // Close ONLY after all worker tests finish
      await context.close();

      console.log('🛑 ACME BROWSER CLOSED');
    },

    { scope: 'worker' }
  ],


  // ============================================================
  // ONE PAGE FOR THE ENTIRE WORKER
  // ============================================================

  authenticatedPage: [
    async ({ authenticatedContext }, use) => {

      const pages =
        authenticatedContext.pages();

      const page =
        pages.length > 0
          ? pages[0]
          : await authenticatedContext.newPage();

      console.log(
        '📄 Reusing authenticated page:',
        page.url()
      );

      await use(page);

    },

    { scope: 'worker' }
  ],


  // ============================================================
  // PARTNER ADMIN BROWSER CONTEXT
  // Only started by tests that use a partner fixture
  // ============================================================

  partnerContext: [
    async ({ browser }, use) => {

      const account = partnerAccount();

      console.log('');
      console.log('==========================================');
      console.log(`🚀 STARTING PARTNER BROWSER: ${account.username}`);
      console.log('==========================================');

      const context =
        (await restoreSavedSession(browser, account)) ??
        (await fullLogin(browser, account));

      console.log('✅ PARTNER LOGIN SUCCESSFUL');

      await use(context);

      await context.close();

      console.log('🛑 PARTNER BROWSER CLOSED');
    },

    { scope: 'worker' }
  ],


  partnerPage: [
    async ({ partnerContext }, use) => {

      const pages =
        partnerContext.pages();

      const page =
        pages.length > 0
          ? pages[0]
          : await partnerContext.newPage();

      console.log(
        '📄 Reusing partner page:',
        page.url()
      );

      await use(page);
    },

    { scope: 'worker' }
  ],


  // ============================================================
  // WAIT FOR POPUPS AFTER EVERY TEST (auto)
  // Runs after each test case; the next test starts only when
  // all success popups / modals have closed.
  // ============================================================

  waitForPopups: [
    async ({ authenticatedPage }, use, testInfo) => {

      await use();

      // Failed test -> worker restarts anyway, no need to wait
      if (testInfo.status !== testInfo.expectedStatus) {
        return;
      }

      console.log('⏳ Waiting for popups to close...');

      await waitForAllPopupsToClose(authenticatedPage);

      console.log('✅ No popups open, next test can start');
    },

    { auto: true }
  ],


  // ============================================================
  // LOGIN PAGE
  // ============================================================

  loginPage: async (
    { authenticatedPage },
    use
  ) => {

    const loginPage =
      new LoginPage(authenticatedPage);

    await use(loginPage);
  },


  // ============================================================
  // API CLIENT
  // ============================================================

  apiClient: async (
    { request },
    use
  ) => {

    const apiClient =
      new ApiClient(request);

    await use(apiClient);
  },


  // ============================================================
  // DASHBOARD
  // ============================================================

  dashboardPage: async (
    { authenticatedPage },
    use
  ) => {

    const dashboardPage =
      new DashboardPage(authenticatedPage);

    await use(dashboardPage);
  },


  // ============================================================
  // SWAP STATION
  // ============================================================

  swapStationPage: async (
    { authenticatedPage },
    use
  ) => {

    const swapStationPage =
      new SwapStationPage(authenticatedPage);

    await use(swapStationPage);
  },


  // ============================================================
  // BATTERY
  // ============================================================

  batteryOnboardPage: async (
    { authenticatedPage },
    use
  ) => {

    const batteryOnboardPage =
      new BatteryOnboardPage(authenticatedPage);

    await use(batteryOnboardPage);
  },


  // ============================================================
  // VTS
  // ============================================================

  vtsPage: async (
    { authenticatedPage },
    use
  ) => {

    const vtsPage =
      new VtsPage(authenticatedPage);

    await use(vtsPage);
  },


  // ============================================================
  // SITE
  // ============================================================

  sitePage: async (
    { authenticatedPage },
    use
  ) => {

    const sitePage =
      new SitePage(authenticatedPage);

    await use(sitePage);
  },


  // ============================================================
  // VEHICLE
  // ============================================================

  vehiclePage: async (
    { authenticatedPage },
    use
  ) => {

    const vehiclePage =
      new VehicleOnboardPage(authenticatedPage);

    await use(vehiclePage);
  },

// ============================================================
  // TECHNICIAN ONBOARD
  // ============================================================


  technicianPage: async ({ authenticatedPage }, use) => {
  const technicianPage = new TechnicianPage(authenticatedPage);
  await use(technicianPage);
},

  // ============================================================
  // ROLE MANAGEMENT
  // ============================================================

  rolePage: async (
    { authenticatedPage },
    use
  ) => {

    const rolePage =
      new RolePage(authenticatedPage);

    await use(rolePage);
  },

  // ============================================================
  // USERS
  // ============================================================

  userPage: async (
    { authenticatedPage },
    use
  ) => {

    const userPage =
      new UserPage(authenticatedPage);

    await use(userPage);
  },

  // ============================================================
  // COMPANY ONBOARD
  // ============================================================

  companyOnboardPage: async (
    { authenticatedPage },
    use
  ) => {

    const companyOnboardPage =
      new CompanyOnboardPage(authenticatedPage);

    await use(companyOnboardPage);
  },

  // ============================================================
  // CHECKLISTS
  // ============================================================

  checklistPage: async (
    { authenticatedPage },
    use
  ) => {

    const checklistPage =
      new ChecklistPage(authenticatedPage);

    await use(checklistPage);
  },

  // ============================================================
  // ASSET LINKING
  // ============================================================

  assetLinkPage: async (
    { authenticatedPage },
    use
  ) => {

    const assetLinkPage =
      new AssetLinkPage(authenticatedPage);

    await use(assetLinkPage);
  },

  // ============================================================
  // TICKETS
  // ============================================================

  ticketPage: async (
    { authenticatedPage },
    use
  ) => {

    const ticketPage =
      new TicketPage(authenticatedPage);

    await use(ticketPage);
  },

  // ============================================================
  // DRIVER (tenant admin: verify only)
  // ============================================================

  driverPage: async (
    { authenticatedPage },
    use
  ) => {

    const driverPage =
      new DriverPage(authenticatedPage);

    await use(driverPage);
  },

  // ============================================================
  // DRIVER (partner admin: onboard / edit / delete)
  // ============================================================

  partnerDriverPage: async (
    { partnerPage },
    use
  ) => {

    const partnerDriverPage =
      new DriverPage(partnerPage);

    await use(partnerDriverPage);
  },

  // ============================================================
  // KEY FOB
  // ============================================================

  keyFobPage: async (
    { authenticatedPage },
    use
  ) => {

    const keyFobPage =
      new KeyFobPage(authenticatedPage);

    await use(keyFobPage);
  }

});


export { expect };