import { expect, Page, Locator} from '@playwright/test';
import { BasePage } from '../base.page';
import { getCurrentDate } from '../../utils/testdata';


export class VtsPage extends BasePage {

  // ============================================================
  // Navigation
  // ============================================================

  private readonly assetManagementMenu: Locator;
  private readonly manufacturerYearDropdown: Locator;
  private readonly vtsMenu: Locator;
  private readonly onboardButton: Locator;

  // ============================================================
  // Create VTS
  // ============================================================

  private readonly oemDropdown: Locator;
  private readonly deviceComplianceDropdown: Locator;
  private readonly vtsTypeDropdown: Locator;
  private readonly vtsModelDropdown: Locator;
  private readonly vtsVariantDropdown: Locator;

  private readonly imeiInput: Locator;
  private readonly msisdnInput: Locator;
  private readonly imsiInput: Locator;

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
  private readonly vtsDetailsModal: Locator; 

  // ============================================================
  // Edit
  // ============================================================

  private readonly editButton: Locator;
  private readonly purchaseDate: Locator;
  private readonly updateButton: Locator;
  private readonly cancelButton: Locator;
  private readonly invalidSelectionAlert: Locator;

  // ============================================================
  // Delete
  // ============================================================

  private readonly deleteConfirmButton: Locator;
  private readonly toastMessage: Locator;

  constructor(page: Page) {
    super(page);

    // ------------------------------------------------------------
    // Navigation
    // ------------------------------------------------------------
    //  this.assetManagementLink = this.page.locator(
    //   'a.nav-link[href*="/asset-management/onboarding"]'
    // );

     this.assetManagementMenu = page.getByRole('link', {
       name: /Asset Management/
     }).first();

     this.manufacturerYearDropdown = page.locator(
      'select[formcontrolname="manufacturerYear"]'
      );

     this.vtsDetailsModal = page.locator('#iotModal');

    this.vtsMenu = page.locator('a').filter({
      hasText: 'VTS'
    });

    this.onboardButton = page.getByRole('button', {
      name: 'VTS Device Onboard'
    });

    // ------------------------------------------------------------
    // Create
    // ------------------------------------------------------------

    this.oemDropdown = page.getByLabel('OEM Name*');

    this.deviceComplianceDropdown = page.getByLabel(
      'Device Compliance*'
    );

    this.vtsTypeDropdown = page.getByLabel(
      'VTS Type*'
    );

    this.vtsModelDropdown = page.getByLabel(
      'VTS Model*'
    );

    this.vtsVariantDropdown = page.getByLabel(
      'VTS Variant*'
    );

    // this.imeiInput = page.getByRole('textbox', {
    //   name: 'VTS IMEI Number**'
    // });

    this.imeiInput = page.getByPlaceholder('Enter Device IMEI');

    this.msisdnInput = page.getByRole('textbox', {
      name: 'MSISDN'
    });

    this.imsiInput = page.getByRole('textbox', {
      name: 'IMSI'
    });

    this.uploadButton = page.getByRole('button', {
      name: 'Upload'
    });

    // ------------------------------------------------------------
    // Common
    // ------------------------------------------------------------

    this.successMessage = page.getByText(
      'VTS Device has been onboarded successfully!'
    );

    this.okButton = page.getByRole('button', {
      name: 'Ok'
    });

    // ------------------------------------------------------------
    // View
    // ------------------------------------------------------------

    this.viewButton = page.getByRole('img', {
      name: 'view'
    });

    // ------------------------------------------------------------
    // Edit
    // ------------------------------------------------------------

    this.editButton = page.getByRole('img', {
      name: 'edit'
    });

    this.purchaseDate = page.getByPlaceholder("DD/MM/YYYY");

    this.updateButton = page.getByRole('button', {
      name: 'Update'
    });

    this.cancelButton = page.getByRole('button', {
      name: 'Cancel'
    });

    this.invalidSelectionAlert = page.getByRole('alert');

    // ------------------------------------------------------------
    // Delete
    // ------------------------------------------------------------

    this.deleteConfirmButton = page.getByRole('button', {
      name: 'Yes'
    });

    this.toastMessage = page.locator('#toast-container');
  }


  // ============================================================
  // NAVIGATE TO VTS
  // ============================================================

  async navigateToVts(): Promise<void> {

    await expect(
      this.assetManagementMenu
    ).toBeVisible({
      timeout: 15000
    });

    await this.assetManagementMenu.click();

    await expect(
      this.vtsMenu
    ).toBeVisible({
      timeout: 10000
    });

    await this.vtsMenu.click();

    await expect(
      this.onboardButton
    ).toBeVisible({
      timeout: 15000
    });

    console.log('✅ VTS page opened');
  }


  // ============================================================
  // CREATE VTS
  // ============================================================

  async createVts(
    imei: string,
    msisdn: string,
    imsi: string
  ): Promise<void> {

    await this.onboardButton.click();

    await expect(
      this.oemDropdown
    ).toBeVisible();

    await this.oemDropdown.selectOption(
      'Acme'
    );

    await this.deviceComplianceDropdown.selectOption(
      'Regular'
    );

    await this.vtsTypeDropdown.selectOption(
      'acme'
    );

    await this.vtsModelDropdown.selectOption(
      'jvt'
    );

    await this.vtsVariantDropdown.selectOption(
      '2270'
    );

    await this.imeiInput.fill(imei);

    await this.msisdnInput.fill(msisdn);

    await this.imsiInput.fill(imsi);

    await this.purchaseDate.fill(getCurrentDate()); 

    await this.uploadButton.click();

    await expect(
      this.successMessage.first()
    ).toBeVisible({
      timeout: 15000
    });

    // Ok button no longer shown after portal update
    if (await this.okButton.isVisible()) {
      await this.okButton.click();
    }

    console.log(`✅ VTS created with IMEI: ${imei}`);
  }


  // ============================================================
  // VIEW VTS
  // ============================================================

  async viewVts(
    imei: string,
    msisdn: string,
    imsi: string
  ): Promise<void> {

    await this.viewButton.first().click();

    await expect(this.vtsDetailsModal).toBeVisible();

  const getValue = (label: string) =>
  this.vtsDetailsModal
    .locator('p.key')
    .filter({ hasText: new RegExp(`^${label}$`) })
    .locator('xpath=following-sibling::p[1]');

  await expect(getValue('IMEI')).toHaveText(imei);
  await expect(getValue('MSISDN')).toHaveText(msisdn);
  await expect(getValue('IMSI')).toHaveText(imsi);

    
  console.log(`✅ VTS details verified: ${imei}`);

  await this.page.getByRole('button', {
      name: 'Close'
    }).click();
  }

  async verifyVTSDetails(
  imei: string,
  msisdn: string,
  imsi: string
) {
  await expect(this.vtsDetailsModal).toBeVisible();

  const getValue = (label: string) =>
    this.vtsDetailsModal
      .locator('p.key')
      .filter({ hasText: label })
      .locator('xpath=following-sibling::p[contains(@class,"value")]');

  await expect(getValue('IMEI')).toHaveText(imei);
  await expect(getValue('MSISDN')).toHaveText(msisdn);
  await expect(getValue('IMSI')).toHaveText(imsi);
}


  // ============================================================
  // EDIT VTS
  // ============================================================

  async editVts(): Promise<void> {

    await this.editButton.first().click();

    // Edit opens as a full page now (previously the #iotModal popup)
    const editHeading = this.page.getByText('Edit VTS Device Details');
    const editComplianceDropdown = this.page.getByLabel('Device Compliance*');
    const editManufacturerYearDropdown = this.page.locator('select[formcontrolname="manufacturerYear"]');
    const editUpdateButton = this.page.getByRole('button', { name: 'Update' });
    const editCancelButton = this.page.getByRole('button', { name: 'Cancel' });
    const editAlert = this.page.getByRole('alert');

    await expect(
      editHeading
    ).toBeVisible({ timeout: 15000 });

    await expect(
      editComplianceDropdown
    ).toBeVisible();

    // Device Compliance is not pre-filled on the edit page any more, so pick
    // an option other than the one used at create ('Regular')
    const complianceOptions = await editComplianceDropdown.locator('option').evaluateAll((elements) =>
      elements
        .map((element) => element.textContent?.trim() ?? '')
        .filter((text) => text && !/^Select\s*/i.test(text) && text !== '---')
    );
    const complianceAltOption = complianceOptions.find((text) => text !== 'Regular') ?? 'Portable';

    console.log(`ℹ️ Device Compliance options: ${complianceOptions.join(', ')}`);

    // The edit form can finish loading after the selections are made and clear
    // them, so re-select until the Update button is enabled
    await expect(async () => {
      await editComplianceDropdown.selectOption({ label: complianceAltOption });

      const currentYear = await editManufacturerYearDropdown.inputValue();
      const nextYear = currentYear === '2025' ? '2026' : '2025';
      await editManufacturerYearDropdown.selectOption(nextYear);

      await expect(editUpdateButton).toBeEnabled({ timeout: 2000 });
    }).toPass({ timeout: 20000 });

    await editUpdateButton.click();

    await expect(
      editAlert
    ).toContainText(
      'VTS Device has been updated successfully'
    );

    console.log(
      '⚠️ VTS Edit validation captured successfully'
    );

    //await editCancelButton.click();
  }


  // ============================================================
  // DELETE VTS
  // ============================================================

  async deleteVts(imei: string): Promise<void> {

    // Filter the list to this run's device before deleting
    await this.page.getByPlaceholder('Search by IMEI').fill(imei);

    const deviceRow = this.page.getByRole('row').filter({
      hasText: imei
    });

    await expect(
      deviceRow
    ).toHaveCount(1, {
      timeout: 15000
    });

    await deviceRow.getByRole('img', {
      name: 'delete'
    }).click();

    // await expect(
    //   this.successMessage
    // ).toContainText(
    //   `Are you sure you want to delete the VTS Device with IMEI ${imei}?`
    // );

    await this.deleteConfirmButton.click();

    await expect(
      this.toastMessage
    ).toContainText(
      'Selected asset(s) deleted successfully',
      {
        timeout: 15000
      }
    );

    console.log(`🗑️ VTS deleted: ${imei}`);
  }
}
