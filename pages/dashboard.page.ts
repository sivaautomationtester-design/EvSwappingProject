import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  private readonly dashboardHeading;

  constructor(page: Page) {
    super(page);

    this.dashboardHeading = page.getByRole(
      'heading',
      {
        name: /dashboard|home/i
      }
    ).first();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.dashboardHeading).toBeVisible();
  }
}