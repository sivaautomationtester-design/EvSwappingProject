import { expect, Locator, Page } from '@playwright/test';

// Waits until every success/info popup is gone:
// toasts (#toast-container / role=alert), Bootstrap modals with
// their "Ok" button (.modal.show / .modal-backdrop) and Angular
// Material overlays (.cdk-overlay-backdrop).
// Used between test cases so a popup from one test can't block
// the next one.
export async function waitForAllPopupsToClose(
  page: Page,
  timeout: number = 30000,
): Promise<void> {
  // Let a popup triggered by the last action render first
  await page.waitForTimeout(500);

  const popups = page
    .locator([
      '[role="alert"]',
      '#toast-container > *',
      '.modal.show',
      '.modal-backdrop',
      '.cdk-overlay-backdrop',
    ].join(', '))
    .filter({ visible: true });

  await expect(
    popups,
    'Popup still open after test',
  ).toHaveCount(0, { timeout });
}

export abstract class BasePage {
  protected readonly page: Page;

  protected constructor(page: Page) {
    this.page = page;
  }

  protected async click(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
    await expect(locator).toBeEnabled();

    await locator.click();
  }

  protected async fill(
    locator: Locator,
    value: string,
  ): Promise<void> {
    await expect(locator).toBeVisible();

    await locator.fill(value);
  }

  protected async expectVisible(
    locator: Locator,
  ): Promise<void> {
    await expect(locator).toBeVisible();
  }

  // Waits for toast popups to close so they don't overlap the next step.
  // Success popups can render after the page has updated, so by default
  // it first waits for one to appear.
  protected async waitForPopupsToClose(
    expectPopup: boolean = true,
  ): Promise<void> {
    const popups = this.page.getByRole('alert');

    if (expectPopup) {
      await expect(popups.first()).toBeVisible({ timeout: 10000 });
    }

    await expect(popups).toHaveCount(0, { timeout: 30000 });
  }
}