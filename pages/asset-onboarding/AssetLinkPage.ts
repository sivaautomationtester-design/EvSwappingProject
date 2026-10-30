import { expect, Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

export type AssetLinkData = {
  vehicleNumber: string;
  vtsImei: string;
  keyFobSerial: string;
  batterySerial: string;
};

export class AssetLinkPage extends BasePage {

  // ============================================================
  // Navigation
  // ============================================================

  private readonly assetManagementMenu: Locator;
  private readonly assetLinkingMenu: Locator;
  private readonly linkAssetsMenu: Locator;

  // ============================================================
  // Link Assets Form
  // ============================================================

  private readonly addPairButton: Locator;
  private readonly vehicleSelect: Locator;
  private readonly vtsSelect: Locator;
  private readonly keyFobSelect: Locator;
  private readonly batterySelect: Locator;
  private readonly submitButton: Locator;
  private readonly cancelButton: Locator;
  private readonly okButton: Locator;

  // ============================================================
  // Linked Pairs List
  // ============================================================

  private readonly pairsSearchInput: Locator;
  private readonly pairsTable: Locator;
  private readonly deletePairButton: Locator;

  // ============================================================
  // Constructor
  // ============================================================

  constructor(page: Page) {

    super(page);

    // ============================================================
    // Navigation
    // ============================================================

    this.assetManagementMenu = page.getByRole('link', {
      name: /Asset Management/
    }).first();

    this.assetLinkingMenu = page.getByRole('link', {
      name: /Asset Linking/
    }).first();

    this.linkAssetsMenu = page.getByRole('link', {
      name: 'Link Assets'
    });

    // ============================================================
    // Link Assets Form
    // Angular Material selects, found by their placeholder
    // ============================================================

    // Not a real <button>, only text with an icon
    this.addPairButton = page.getByText('Add Pair', {
      exact: true
    });

    this.vehicleSelect = page.locator(
      'mat-select[placeholder="Select Vehicle Reg No."]'
    );

    this.vtsSelect = page.locator(
      'mat-select[placeholder="Select VTS IMEI No"]'
    );

    this.keyFobSelect = page.locator(
      'mat-select[placeholder="Select Key Fob Serial No"]'
    );

    // Battery selects have no formcontrolname or placeholder, and
    // their accessible name changes to the chosen value. Slots 2-4
    // appear after a key fob is selected; slot 1 is the first one.
    this.batterySelect = page.locator(
      'form mat-select:not([formcontrolname])'
    ).first();

    this.submitButton = page.getByRole('button', {
      name: 'Submit'
    });

    this.cancelButton = page.getByRole('button', {
      name: 'Cancel'
    });

    this.okButton = page.getByRole('button', {
      name: 'Ok',
      exact: true
    });

    // ============================================================
    // Linked Pairs List
    // ============================================================

    this.pairsSearchInput = page.getByRole('textbox', {
      name: 'Search by Reg No.'
    });

    this.pairsTable = page.getByRole('table');

    // Not a real <button>, only text; enabled once a row is checked
    this.deletePairButton = page.getByText('Delete Pair', {
      exact: true
    });
  }

  // ============================================================
  // OPEN ASSET LINKING SUBMENU
  // ============================================================

  private async openAssetLinkingMenu(
    subMenu: Locator
  ): Promise<void> {

    // Clicking an open parent menu again would collapse it
    if (!(await subMenu.isVisible())) {

      if (!(await this.assetLinkingMenu.isVisible())) {

        await expect(
          this.assetManagementMenu
        ).toBeVisible({
          timeout: 15000
        });

        await this.assetManagementMenu.click();
      }

      await this.assetLinkingMenu.click();
    }

    await subMenu.click();
  }

  // ============================================================
  // NAVIGATE TO LINK ASSETS
  // ============================================================

  async navigateToLinkAssets(): Promise<void> {

    await this.navigateToLinkedPairs();

    // The form resets itself when its asset lists finish loading,
    // so anything selected before that is lost
    const listsLoaded = [
      '/api/web/vehicle?availableToLink',
      '/api/device?availableToLink',
      '/api/keyfob?availableToLink',
      '/api/battery?availableToLink'
    ].map(url =>
      this.page.waitForResponse(
        response => response.url().includes(url),
        { timeout: 30000 }
      )
    );

    await this.addPairButton.click();

    await Promise.all(listsLoaded);

    await expect(
      this.vehicleSelect
    ).toBeVisible({
      timeout: 15000
    });

    console.log('✅ Link Assets page opened');
  }

  // ============================================================
  // NAVIGATE TO LINKED PAIRS LIST
  // Newly linked pairs are listed here. View Mapping only shows
  // pairs that are already assigned to a fleet.
  // ============================================================

  async navigateToLinkedPairs(): Promise<void> {

    await this.openAssetLinkingMenu(
      this.linkAssetsMenu
    );

    // Opens either the list of pairs or, sometimes, the pairing
    // form straight away
    await expect(
      this.addPairButton.or(this.vehicleSelect)
    ).toBeVisible({
      timeout: 15000
    });

    if (!(await this.addPairButton.isVisible())) {
      await this.cancelButton.click();
    }

    await expect(
      this.pairsSearchInput
    ).toBeVisible({
      timeout: 15000
    });

    console.log('✅ Linked pairs list opened');
  }

  // ============================================================
  // SELECT FROM DROPDOWN
  // Every dropdown lists only assets that are free to link and
  // has a search box at the top of its option list
  // ============================================================

  private async selectFromDropdown(
    dropdown: Locator,
    value: string
  ): Promise<void> {

    // Use this dropdown's own option list: the previous dropdown's
    // list can still be fading out when this one opens
    const panel = this.page.locator(
      `#${await dropdown.getAttribute('id')}-panel`
    );

    // A click right after the form opens can be ignored while it
    // is still loading, so click again until the list shows
    await expect(async () => {

      if (await dropdown.getAttribute('aria-expanded') !== 'true') {
        await dropdown.click();
      }

      await expect(
        panel
      ).toBeVisible({
        timeout: 2000
      });
    }).toPass({
      timeout: 15000
    });

    await panel.getByPlaceholder('Search').fill(
      value
    );

    // Battery options are shown as "<model> : <serial>"
    const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    await panel.getByRole('option', {
      name: new RegExp(`^\\s*(.+ : )?${escaped}\\s*$`)
    }).first().click();

    await expect(
      dropdown
    ).toContainText(
      value
    );

    console.log(`✅ Selected: ${value}`);
  }

  // ============================================================
  // LINK ASSETS
  // ============================================================

  async linkAssets(
    data: AssetLinkData
  ): Promise<void> {

    await this.navigateToLinkAssets();

    await this.selectFromDropdown(
      this.vehicleSelect,
      data.vehicleNumber
    );

    await this.selectFromDropdown(
      this.vtsSelect,
      data.vtsImei
    );

    await this.selectFromDropdown(
      this.keyFobSelect,
      data.keyFobSerial
    );

    await this.selectFromDropdown(
      this.batterySelect,
      data.batterySerial
    );

    await this.submitButton.click();

    // Success dialog (not a toast)
    await expect(
      this.page.getByText('Pair Updated Successfully')
    ).toBeVisible({
      timeout: 15000
    });

    await this.okButton.click();

    console.log(`✅ Assets linked to vehicle: ${data.vehicleNumber}`);
  }

  // ============================================================
  // VERIFY LINKED PAIR
  // ============================================================

  async verifyLinkedPair(
    data: AssetLinkData
  ): Promise<void> {

    await this.navigateToLinkedPairs();

    await this.pairsSearchInput.fill(
      data.vehicleNumber
    );

    await this.pairsSearchInput.press('Enter');

    const row = this.pairsTable.getByRole('row').filter({
      hasText: data.vehicleNumber
    });

    await expect(
      row
    ).toHaveCount(1, {
      timeout: 15000
    });

    // Long values are cut off in the table, so compare the
    // beginning of each one
    for (const value of [
      data.vtsImei,
      data.keyFobSerial,
      data.batterySerial
    ]) {
      await expect(
        row
      ).toContainText(
        value.slice(0, 10)
      );
    }

    console.log(`✅ Linked pair verified for vehicle: ${data.vehicleNumber}`);
  }

  // ============================================================
  // DELETE LINKED PAIR
  // ============================================================

  async deleteLinkedPair(
    vehicleNumber: string
  ): Promise<void> {

    await this.navigateToLinkedPairs();

    await this.pairsSearchInput.fill(
      vehicleNumber
    );

    await this.pairsSearchInput.press('Enter');

    const row = this.pairsTable.getByRole('row').filter({
      hasText: vehicleNumber
    });

    await expect(
      row
    ).toHaveCount(1, {
      timeout: 15000
    });

    await row.getByRole('checkbox').check();

    await this.deletePairButton.click();

    await expect(
      this.page.getByText('Are you sure you want to delete this asset?')
    ).toBeVisible({
      timeout: 10000
    });

    // The hidden logout dialog also has a "Yes" button
    await this.page.getByRole('button', {
      name: 'Yes',
      exact: true
    }).filter({ visible: true }).click();

    await expect(
      this.page.getByText('Selected asset(s) deleted successfully')
    ).toBeVisible({
      timeout: 15000
    });

    if (await this.okButton.isVisible()) {
      await this.okButton.click();
    }

    await expect(
      row
    ).toHaveCount(0, {
      timeout: 15000
    });

    console.log(`✅ Linked pair deleted for vehicle: ${vehicleNumber}`);
  }
}
