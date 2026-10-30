import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

export class BatteryOnboardPage extends BasePage{

  // Navigation
  private readonly assetManagementMenu: Locator;
  //private readonly assetOnboardingMenu;
  private readonly batteryTab: Locator;
  private readonly batteryOnboardButton: Locator;

  // Battery Onboard fields
  private readonly oemName: Locator;
  private readonly vehicleCategory: Locator;
  private readonly batterySerialNumber: Locator;
  private readonly batteryImei: Locator;

  // Actions
  private readonly uploadButton: Locator;
  private readonly successDialog: Locator;
  private readonly successMessage: Locator;
  private readonly okButton: Locator;

  // Battery list
  private readonly searchInput: Locator;
  private readonly batteryTableBody: Locator;
  private readonly batteryDetails: Locator;
  private readonly onboardingDetailsTab: Locator;
  private readonly breadcrumbAssetManagement: Locator;
  private readonly manufacturerYearDropdown: Locator;
  private readonly updateButton: Locator;
  private readonly downloadTemplateButton: Locator;

  constructor(page: Page) {
    super(page);

    // Navigation
    this.assetManagementMenu = page.getByRole('link', {
      name: /Asset Management/
    }).first();

    // this.assetOnboardingMenu = page.getByRole('link', {
    //   name: 'Master Data'
    // });

    this.batteryTab = page.locator('#myTab a').filter({
      hasText: 'Battery'
    });

    this.batteryOnboardButton = page.getByRole('button', {
      name: 'Battery Onboard'
    });

    // Fields
    this.oemName = page.getByLabel('OEM Name*');

    this.vehicleCategory = page.getByLabel(
      'Battery Vehicle Category*'
    );

    this.batterySerialNumber = page.getByRole('textbox', {
      name: 'Battery Serial No.'
    });

    this.batteryImei = page.getByRole('textbox', {
      name: 'Battery IMEI'
    });

    // Actions
    this.uploadButton = page.getByRole('button', {
      name: 'Upload'
    });

    // Success is a Bootstrap dialog with an "Ok" button, not a toast
    this.successDialog = page.locator('#uploadSuccessModal');

    this.successMessage = this.successDialog.locator('.success-message');

    this.okButton = this.successDialog.getByRole('button', {
      name: 'Ok'
    });

    // Battery list
    this.searchInput = page.getByPlaceholder('Search by Serial No');

    this.batteryTableBody = page.locator('tbody');

    this.batteryDetails = page.locator('app-view-battery');

    this.onboardingDetailsTab = page.locator('a').filter({
      hasText: 'Onboarding details'
    });

    // "Asset management>Battery" breadcrumb on the details page
    this.breadcrumbAssetManagement = this.batteryDetails.getByText(
      'Asset management',
      { exact: true }
    );

    this.manufacturerYearDropdown = page.locator(
      'select[formcontrolname="manufacturerYear"]'
    );

    this.updateButton = page.getByRole('button', {
      name: 'Update'
    });

    this.downloadTemplateButton = page.getByRole('button', {
      name: 'Download template'
    });
  }

  async navigateToBattery(): Promise<void> {

    await expect(this.assetManagementMenu).toBeVisible({
      timeout: 15000
    });

    await this.assetManagementMenu.click();

    // await expect(this.assetOnboardingMenu).toBeVisible({
    //   timeout: 10000
    // });

    //await this.assetOnboardingMenu.click();

  }
  async navigateToBatteryOnboard(): Promise<void> {

    await expect(this.assetManagementMenu).toBeVisible({
      timeout: 15000
    });

    await this.assetManagementMenu.click();

    // await expect(this.assetOnboardingMenu).toBeVisible({
    //   timeout: 10000
    // });

    //await this.assetOnboardingMenu.click();


    await this.batteryTab.click();

    await this.batteryOnboardButton.click();
  }

  async selectOEM(oem: string): Promise<void> {

    // Selecting OEM loads its spec and auto-fills Battery Type, Model,
    // Capacity... Upload is ignored if clicked before that finishes.
    const specLoaded = this.page.waitForResponse(
      response =>
        response.url().includes(`/api/battery/spec?oemName=${oem}`),
      { timeout: 20000 }
    );

    await this.oemName.selectOption(oem);

    await specLoaded;
  }

  async selectVehicleCategory(category: string): Promise<void> {

    await this.vehicleCategory.selectOption(category);
  }

  async enterBatterySerialNumber(
    serialNumber: string
  ): Promise<void> {

    await this.batterySerialNumber.fill(serialNumber);

    await this.batterySerialNumber.press('Tab');
  }

  async enterBatteryIMEI(
    imei: string
  ): Promise<void> {

    await this.batteryImei.fill(imei);

    await this.batteryImei.press('Tab');
  }

  async clickUpload(): Promise<void> {

    await expect(this.uploadButton).toBeEnabled();

    const uploadResponse = this.page.waitForResponse(
      response =>
        response.url().endsWith('/api/battery') &&
        response.request().method() === 'POST',
      { timeout: 20000 }
    );

    await this.uploadButton.click();

    const response = await uploadResponse;

    expect(
      response.ok(),
      `Battery upload failed: ${response.status()} ${await response.text()}`
    ).toBeTruthy();
  }

  async verifySuccessfulOnboarding(): Promise<void> {

    await expect(this.successDialog).toBeVisible({
      timeout: 15000
    });

    await expect(this.successMessage).toContainText(
      'Battery has been onboarded successfully!'
    );
  }

  async closeSuccessPopup(): Promise<void> {

    await this.okButton.click();

    // Wait for the dialog to finish closing before the next step
    await expect(this.successDialog).toBeHidden({
      timeout: 10000
    });
  }

  async onboardBattery(
    serialNumber: string,
    imei: string
  ): Promise<void> {

    await this.navigateToBatteryOnboard();

    await this.selectOEM('rne');

    await this.selectVehicleCategory('2 WHEELER');

    await this.enterBatterySerialNumber(serialNumber);

    await this.enterBatteryIMEI(imei);

    await this.clickUpload();

    await this.verifySuccessfulOnboarding();

    await this.closeSuccessPopup();
  }

  // ============================================================
  // BATTERY LIST
  // ============================================================

  async navigateToBatteryList(): Promise<void> {

    await this.navigateToBattery();

    await this.batteryTab.click();

    await expect(this.searchInput).toBeVisible({
      timeout: 15000
    });

    console.log('✅ Battery list opened');
  }

  // Searches by serial and returns that battery's row
  private async findBatteryRow(
    serialNumber: string
  ): Promise<Locator> {

    await this.searchInput.fill(serialNumber);

    await this.searchInput.press('Enter');

    const row = this.batteryTableBody.getByRole('row').filter({
      hasText: serialNumber
    });

    await expect(row).toHaveCount(1, {
      timeout: 15000
    });

    return row;
  }

  // ============================================================
  // VIEW BATTERY
  // ============================================================

  async viewBattery(
    serialNumber: string,
    imei: string
  ): Promise<void> {

    // App bug: details opened from search results show IMEI and
    // specification as "--". A new battery is listed first, so
    // open it from the unfiltered list instead.
    const row = this.batteryTableBody.getByRole('row').filter({
      hasText: serialNumber
    });

    await expect(row).toHaveCount(1, {
      timeout: 15000
    });

    await row.getByRole('img', { name: 'view' }).click();

    await expect(this.batteryDetails).toContainText(serialNumber, {
      timeout: 15000
    });

    await this.onboardingDetailsTab.click();

    await expect(this.batteryDetails).toContainText(imei);

    // Back to the list; the Battery tab stays selected
    await this.breadcrumbAssetManagement.click();

    await expect(this.searchInput).toBeVisible({
      timeout: 15000
    });

    console.log(`✅ Battery details verified: ${serialNumber}`);
  }

  // ============================================================
  // EDIT BATTERY
  // ============================================================

  async editBattery(
    serialNumber: string,
    manufacturerYear: string
  ): Promise<void> {

    const row = await this.findBatteryRow(serialNumber);

    await row.getByRole('img', { name: 'edit' }).click();

    await expect(this.manufacturerYearDropdown).toBeVisible({
      timeout: 15000
    });

    // The form fills in the saved battery after it opens and can
    // reset anything chosen before that. Update stays disabled
    // until the form sees a change, so pick the year again until
    // it is enabled.
    await expect(this.batterySerialNumber).toHaveValue(serialNumber, {
      timeout: 15000
    });

    await expect(async () => {

      await this.manufacturerYearDropdown.selectOption(manufacturerYear);

      await expect(this.updateButton).toBeEnabled({
        timeout: 2000
      });
    }).toPass({
      timeout: 20000
    });

    await this.updateButton.click();

    await expect(
      this.page.getByText('Battery has been updated successfully!')
    ).toBeVisible({
      timeout: 15000
    });

    await this.page.getByRole('button', {
      name: 'Ok'
    }).filter({ visible: true }).click();

    await expect(this.searchInput).toBeVisible({
      timeout: 15000
    });

    console.log(`✅ Battery updated: ${serialNumber}`);
  }

  // ============================================================
  // DELETE BATTERY
  // ============================================================

  async deleteBattery(
    serialNumber: string
  ): Promise<void> {

    const row = await this.findBatteryRow(serialNumber);

    await row.getByRole('img', { name: 'delete' }).click();

    // The hidden logout dialog also has a "Yes" button
    await this.page.getByRole('button', {
      name: 'Yes',
      exact: true
    }).filter({ visible: true }).click();

    await expect(
      this.page.getByRole('alert').filter({
        hasText: 'Selected asset(s) deleted successfully'
      })
    ).toBeVisible({
      timeout: 15000
    });

    await expect(row).toHaveCount(0, {
      timeout: 15000
    });

    console.log(`✅ Battery deleted: ${serialNumber}`);
  }

  // ============================================================
  // DOWNLOAD TEMPLATE
  // ============================================================

  async downloadTemplate(): Promise<string> {

    const downloadPromise = this.page.waitForEvent('download', {
      timeout: 30000
    });

    await this.downloadTemplateButton.click();

    await expect(
      this.page.getByRole('alert').filter({
        hasText: 'Downloading Excel... Please wait'
      })
    ).toBeVisible({
      timeout: 10000
    });

    const download = await downloadPromise;

    const fileName = download.suggestedFilename();

    expect(fileName).toMatch(/\.xlsx?$/);

    console.log(`✅ Battery template downloaded: ${fileName}`);

    return fileName;
  }
}