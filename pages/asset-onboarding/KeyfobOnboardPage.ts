import { expect, Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

export class KeyFobPage extends BasePage {

  // ============================================================
  // Navigation
  // ============================================================
  private readonly assetManagementLink: Locator;
  private readonly keyFobMenu: Locator;
  private readonly onboardButton: Locator;

  // ============================================================
  // Create
  // ============================================================

  private readonly oemDropdown: Locator;
  private readonly serialNumberInput: Locator;
  private readonly modelDropdown: Locator;
  private readonly variantDropdown: Locator;
  private readonly uploadButton: Locator;

  // ============================================================
  // Common
  // ============================================================

  private readonly successMessage: Locator;
  private readonly okButton: Locator;

  // ============================================================
  // View
  // ============================================================

  private readonly viewButton: Locator;
  private readonly keyFobModal: Locator;
  private readonly closeButton: Locator;

  // ============================================================
  // Delete
  // ============================================================

  private readonly deleteButton: Locator;
  private readonly deleteConfirmButton: Locator;
  private readonly toastMessage: Locator;

  constructor(page: Page) {
    super(page);

    // ============================================================
    // Navigation
    // ============================================================

    

    // "Asset Onboarding" links to the same page, so take the parent menu
    this.assetManagementLink = page.getByRole('link', {
      name: /Asset Management/
    }).first();
    
    this.keyFobMenu = page.locator('a').filter({
      hasText: 'Key Fob'
    });

    this.onboardButton = page.getByRole('button', {
      name: 'Key Fob Onboard'
    });

    // ============================================================
    // Create
    // ============================================================

    this.oemDropdown = page.getByLabel(
      'OEM Name*'
    );

    this.serialNumberInput = page.getByRole('textbox', {
      name: 'Unique Serial No.*'
    });

    this.modelDropdown = page.getByLabel(
      'Key Fob Model*'
    );

    this.variantDropdown = page.getByLabel(
      'Key Fob Variant*'
    );

    this.uploadButton = page.getByRole('button', {
      name: 'Upload'
    });

    // ============================================================
    // Common
    // ============================================================

    this.successMessage = page.getByRole('paragraph');

    this.okButton = page.getByRole('button', {
      name: 'Ok'
    });

    // ============================================================
    // View
    // ============================================================

    this.viewButton = page.getByRole('img', {
      name: 'view'
    });

    this.keyFobModal = page.locator(
      '#keyfobModal'
    );

    this.closeButton = page.getByRole('button', {
      name: 'Close'
    });

    // ============================================================
    // Delete
    // ============================================================

    this.deleteButton = page.getByRole('img', {
      name: 'delete'
    });

    this.deleteConfirmButton = page.getByRole('button', {
      name: 'Yes'
    });

    this.toastMessage = page.locator(
      '#toast-container'
    );
  }


  // ============================================================
  // NAVIGATE TO KEY FOB
  // ============================================================

  async navigateToAssetManagement(): Promise<void> {
  await expect(this.assetManagementLink).toBeVisible();
  await this.assetManagementLink.click();
}

  async navigateToKeyFob(): Promise<void> {

    // The Key Fob tab is only on the Assets page; a test that runs
    // first in a fresh browser starts on the dashboard
    if (!(await this.keyFobMenu.isVisible())) {
      await this.navigateToAssetManagement();
    }

    await expect(
      this.keyFobMenu
    ).toBeVisible({
      timeout: 10000
    });

    await this.keyFobMenu.click();

    await expect(
      this.onboardButton
    ).toBeVisible({
      timeout: 15000
    });

    console.log('✅ Key Fob page opened');
  }


  // ============================================================
  // CREATE KEY FOB
  // ============================================================

  async createKeyFob(
    serialNumber: string
  ): Promise<void> {

    await this.onboardButton.click();

    await expect(
      this.oemDropdown
    ).toBeVisible({
      timeout: 10000
    });

    await this.oemDropdown.selectOption(
      'Acme'
    );

    await this.serialNumberInput.fill(
      serialNumber
    );

    await this.modelDropdown.selectOption(
      'SAMPLEMODEL'
    );

    await this.variantDropdown.selectOption(
      'ALPHA'
    );

    await this.uploadButton.click();

    await expect(
      this.successMessage
    ).toContainText(
      'Key fob has been onboarded successfully!',
      {
        timeout: 15000
      }
    );

    await this.okButton.click();

    // await expect(
    //   this.page.getByRole('cell', {
    //     description: serialNumber,
    //     exact: true
    //   })
    // ).toContainText(serialNumber);

    // console.log(
    //   `✅ Key Fob created: ${serialNumber}`
    // );
  }


  // ============================================================
  // VIEW KEY FOB
  // ============================================================

  async viewKeyFob(
    serialNumber: string
  ): Promise<void> {

    await this.viewButton.first().click();

    await expect(
      this.keyFobModal
    ).toBeVisible({
      timeout: 10000
    });

    await expect(
      this.keyFobModal
    ).toContainText(
      serialNumber
    );

    await expect(
      this.keyFobModal
    ).toContainText(
      'acme'
    );

    console.log(
      `✅ Key Fob details verified: ${serialNumber}`
    );

    await this.closeButton.click();
  }


  // ============================================================
  // DELETE KEY FOB
  // ============================================================

  async deleteKeyFob(
    serialNumber: string
  ): Promise<void> {

    const row = this.page.getByRole('row', {
      name: new RegExp(serialNumber)
    });

    await expect(
      row
    ).toBeVisible({
      timeout: 10000
    });

    await row.getByRole('checkbox').check();

    await this.deleteButton.first().click();

    await expect(
      this.deleteConfirmButton
    ).toBeVisible();

    await this.deleteConfirmButton.click();

    await expect(
      this.toastMessage
    ).toContainText(
      'Selected asset(s) deleted successfully',
      {
        timeout: 15000
      }
    );

    console.log(
      `🗑️ Key Fob deleted: ${serialNumber}`
    );
  }
}