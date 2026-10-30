import { test as base, expect } from '@playwright/test';

import { LoginPage } from '../pages/login.page';
import { SwapStationPage } from '../pages/asset-onboarding/SwapStationOnboardPage';
import { SitePage } from '../pages/asset-onboarding/SiteOnboardPage';
import { ApiClient } from '../utils/api-client';

type Fixtures = {
  loginPage: LoginPage;
  swapStationPage: SwapStationPage;
  sitePage: SitePage;
  apiClient: ApiClient;
  authenticatedPage: void;
};

export const test = base.extend<Fixtures>({

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request));
  },

  authenticatedPage: async ({
    page,
    loginPage,
    apiClient
  }, use) => {

    // ==========================================
    // LOGIN
    // ==========================================

    await loginPage.open();

    await loginPage.loginWithCredentials();

    // Manual CAPTCHA
    await loginPage.completeCaptcha();

    await loginPage.clickGetStarted();

    // ==========================================
    // GET SUPER ADMIN TOKEN
    // ==========================================

    const accessToken =
      await apiClient.generateSuperAdminToken();

    // ==========================================
    // GET OTP
    // ==========================================

    const otp =
      await apiClient.getOtp(accessToken);

    console.log('OTP received');

    // ==========================================
    // ENTER OTP
    // ==========================================

    await loginPage.enterOtp(otp);

    await loginPage.verifyOtp();

    // ==========================================
    // VERIFY LOGIN
    // ==========================================

    await loginPage.expectLoginSuccessful();

    console.log('✅ ACME Portal login successful');

    await use();
  },

  swapStationPage: async ({ page }, use) => {
    await use(new SwapStationPage(page));
  },

  sitePage: async ({ page }, use) => {
    await use(new SitePage(page));
  }
});

export { expect };