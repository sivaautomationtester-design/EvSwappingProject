import { test } from '../fixtures/baseFixtures';

test('ACME Portal Login', async ({loginPage, apiClient,}) => {

    await loginPage.open();
    await loginPage.loginWithCredentials();
    await loginPage.completeCaptcha();
    await loginPage.clickGetStarted();
    // OAuth Token
    const accessToken =
      await apiClient.generateSuperAdminToken();
    // Get OTP
    const otp =
      await apiClient.getOtp(accessToken);
    // Enter OTP
    await loginPage.enterOtp(otp);
    // Verify OTP
    await loginPage.verifyOtp();
    // Validate successful login
    await loginPage.expectLoginSuccessful();

  },
);