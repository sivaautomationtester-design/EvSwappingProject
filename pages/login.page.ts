import { expect, Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { env } from '../utils/env';

export class LoginPage extends BasePage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly getStartedButton: Locator;
  private readonly otpInput: Locator;
  private readonly verifyButton: Locator;



  constructor(page: Page) {
    super(page);

   
    this.usernameInput = page.locator(
      'input[type="email"], input[name="username"], input[id*="username"]'
    ).first();

    this.passwordInput = page.locator(
      'input[type="password"]'
    ).first();

    this.loginButton = page.locator(
      'button[type="submit"]'
    ).first();

    this.getStartedButton = page.locator(
      'button:has-text("Get Started")'
    ).first();

    this.otpInput = page.locator(
      'input[autocomplete="one-time-code"], ' +
      'input[name*="otp" i], ' +
      'input[id*="otp" i], ' +
      'input[placeholder*="otp" i]'
    ).first();

    this.verifyButton = page.locator(
      'button:has-text("Confirm"), ' +
      'button:has-text("Submit"), ' +
      'button[type="submit"]'
    ).first();
  }

  async open(): Promise<void> {
    console.log('🌐 Opening ACME portal...');

    await this.page.goto(env.baseUrl, {
      waitUntil: 'domcontentloaded'
    });

    await this.usernameInput.waitFor({
      state: 'visible',
      timeout: 30000
    });

    console.log('✅ Login page loaded');
  }

  async loginWithCredentials(
    username?: string,
    password?: string
  ): Promise<void> {

    // console.log('Username:', env.app.username);
    // console.log(
    //   'Password:',
    //   env.app.password ? 'FOUND' : 'MISSING'
    // );

    await this.usernameInput.waitFor({
      state: 'visible'
    });

    await this.passwordInput.waitFor({
      state: 'visible'
    });

    await this.fill(
      this.usernameInput,
      username ?? env.app.username
    );

    await this.fill(
      this.passwordInput,
      password ?? env.app.password
    );

    console.log('🔐 Credentials entered');

    await this.loginButton.waitFor({
      state: 'visible'
    });

    await this.loginButton.click();

    console.log('➡️ Login button clicked');

    // Wait for navigation/network processing after Login
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});

    console.log('✅ Initial login processing completed');
  }

  async completeCaptcha(): Promise<void> {

    console.log('');
    console.log('='.repeat(80));
    console.log('MANUAL ACTION REQUIRED');
    console.log('Complete the reCAPTCHA in the browser.');
    console.log('After completing it, resume the Playwright test.');
    console.log('='.repeat(80));

    await this.page.pause();

    console.log('▶️ Playwright resumed after CAPTCHA');
  }

  async clickGetStarted(): Promise<void> {

    console.log('⏳ Waiting for Get Started button...');

    await this.getStartedButton.waitFor({
      state: 'visible',
      timeout: 30000
    });

    await expect(this.getStartedButton).toBeEnabled();

    console.log('➡️ Clicking Get Started');

    await this.getStartedButton.click();

    console.log('✅ Get Started clicked');

    // Wait until OTP field is actually available
    await this.otpInput.waitFor({
      state: 'visible',
      timeout: 30000
    });

    console.log('📱 OTP screen is ready');
  }

  async enterOtp(otp: string): Promise<void> {

    console.log('🔢 Entering OTP');

    await this.otpInput.waitFor({
      state: 'visible',
      timeout: 30000
    });

    await this.fill(this.otpInput, otp);

    console.log('✅ OTP entered');
  }

  async verifyOtp(): Promise<void> {

    console.log('🔐 Verifying OTP');

    await this.verifyButton.waitFor({
      state: 'visible'
    });

    await expect(this.verifyButton).toBeEnabled();

    await this.verifyButton.click();

    console.log('➡️ Verify clicked');
  }

  // Partner accounts can land on a different page than the tenant
  // admin's summary dashboard, so the expected URL can be passed in
  async expectLoginSuccessful(
    landingUrl: RegExp = /#\/pages\/dashboard\/summary-dashboard/
  ): Promise<void> {

    console.log('⏳ Waiting for dashboard...');

    await expect(this.page).toHaveURL(
      landingUrl,
      {
        timeout: 30000
      }
    );

    

    console.log('✅ ACME Portal login successful');
  }

}
