import { test as setup } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { ApiClient } from '../utils/api-client';
import { env } from '../utils/env';

const authFile = 'playwright/.auth/user.json';

setup('Authenticate ACME Portal', async ({ page, request }) => {

  console.log('🌐 Opening ACME Portal...');

  const loginPage = new LoginPage(page);

  // 1. Open portal
  await loginPage.open();

  // 2. Enter username and password
  await loginPage.loginWithCredentials(
    env.app.username,
    env.app.password
  );

  // 3. Complete CAPTCHA manually
  await loginPage.completeCaptcha();

  // 4. Click Get Started
  await loginPage.clickGetStarted();

  // 5. Generate SuperAdmin token
  const apiClient = new ApiClient(request);

  const accessToken =
    await apiClient.generateSuperAdminToken();

  // 6. Get latest OTP
  const otp =
    await apiClient.getOtp(accessToken);

  console.log('🔐 Latest OTP received');

  // 7. Enter OTP
  await loginPage.enterOtp(otp);

  // 8. Verify OTP
  await loginPage.verifyOtp();

  // 9. Verify successful login
  await loginPage.expectLoginSuccessful();

  // 9. Verify successful login
await loginPage.expectLoginSuccessful();

console.log('✅ ACME Portal login successful');

// 10. Save authenticated browser state
const state = await page.context().storageState();

const jsessionId = state.cookies.find(
  cookie => cookie.name === 'JSESSIONID'
);

if (!jsessionId) {
  throw new Error('JSESSIONID cookie was not found');
}

await page.context().addCookies([
  {
    name: 'JSESSIONID',
    value: jsessionId.value,
    domain: new URL(env.baseUrl).hostname,
    path: '/',
    httpOnly: true,
    secure: false,
    sameSite: 'Lax'
  }
]);

await page.context().storageState({
  path: authFile
});

console.log(`💾 Authentication state saved: ${authFile}`);
});