import { expect, Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';
import { assetData } from '../../test-data/asset.data';

export class SwapStationPage extends BasePage {

  private readonly swapStationMenu: Locator;
  private readonly onboardButton: Locator;
  private readonly oemDropdown: Locator;
  private readonly modelDropdown: Locator;
  private readonly serialNumberInput: Locator;
  private readonly uploadButton: Locator;
  private readonly successMessage: Locator;
  private readonly okButton: Locator;
  private readonly linkFranchiseButton: Locator;
  private readonly DelinkFranchiseButton: Locator;
  private readonly DelinkConfirmationYesButton: Locator;
  private readonly delinkModal: Locator;
  private readonly delinkNoButton: Locator;
  private readonly delinkYesButton: Locator;
  private readonly yesButton: Locator;
  private readonly searchInput: Locator;
  private readonly swapStationModal: Locator;
  private readonly swapStationModalClose: Locator;

   

  private readonly assetManagementMenu: Locator;

  constructor(page: Page) {
    super(page);

    this.swapStationMenu = page.locator('a').filter({
      hasText: 'Swap Stations'
    });

     this.assetManagementMenu = page.getByRole('link', {
      name: /Asset Management/
    }).first();

    this.onboardButton = page.getByRole('button', {
      name: 'Swap Station Onboard'
    });

    this.oemDropdown = page.getByLabel('OEM Name*');

    this.modelDropdown = page.getByLabel('Swap Station Model');

    this.serialNumberInput = page.getByRole('textbox', {
      name: 'Serial Number*'
    });

    this.uploadButton = page.getByRole('button', {
      name: 'Upload'
    });

    this.successMessage = page.getByRole('paragraph');

    this.okButton = page.getByRole('button', {
      name: 'Ok'
    });

    this.linkFranchiseButton = page.getByRole('button', {
      name: 'Link Franchise'
    });

    this.DelinkFranchiseButton = page.getByRole('button', {
      name: 'Delink Franchise'
    });

    this.DelinkConfirmationYesButton = page.getByText("Yes");


    this.delinkModal = page.locator('.modal-content deleteModal');

    this.delinkNoButton = this.delinkModal.getByRole('button', {
      name: 'No'
    });

    this.yesButton = page.getByRole('button', {
      name: 'Yes'
    });

    this.delinkYesButton = page.locator('#delinkModal button').filter({
  hasText: 'Yes'
});

    this.searchInput = page.getByPlaceholder('Search by Serial No.');

    // "Swap Station Details" Bootstrap modal opened by the view icon
    this.swapStationModal = page.locator('#swapModal');

    this.swapStationModalClose = this.swapStationModal.getByRole('button', {
      name: 'Close'
    });

  }

  async navigateToSwapStation(): Promise<void> {

    await expect(this.assetManagementMenu).toBeVisible({
      timeout: 15000
    });

    await this.assetManagementMenu.click();


    // Master Data menu removed from portal; Swap Stations is reached directly
  // const assetOnboarding = this.page.getByRole('link', {
  //   name: 'Master Data'
  // });
  //
  // await expect(assetOnboarding).toBeVisible({
  //   timeout: 10000
  // });
  //
  // await assetOnboarding.click();

  // Swap Stations
  await expect(this.swapStationMenu).toBeVisible({
    timeout: 10000
  });

  await this.swapStationMenu.click();

  // Swap Station Onboard button
  await expect(this.onboardButton).toBeVisible({
    timeout: 15000
  });

  console.log('✅ Swap Station Onboard page is ready');
  }

  
  
  async createSwapStation(
    serialNumber: string
  ): Promise<void> {

    await this.onboardButton.click();

    await expect(this.oemDropdown).toBeVisible();

    await this.oemDropdown.selectOption(
      assetData.swapStationOem
    );

    await this.modelDropdown.selectOption(
      assetData.swapStationModel
    );

    await this.serialNumberInput.fill(
      serialNumber
    );

    await this.uploadButton.click();

    await expect(this.successMessage).toContainText(
      'Swap station has been onboarded successfully!'
    );

    await this.okButton.click();

    await expect(this.page.locator('tbody'))
      .toContainText(serialNumber);
  }

  async selectSwapStation(
    serialNumber: string
  ): Promise<void> {

    const row = this.page.getByRole('row', {
      name: new RegExp(serialNumber)
    });

    await expect(row).toBeVisible();

    await row.getByRole('checkbox').check();
  }

  // Links the selected swap station to a franchise and returns its
  // name. Without a name it takes the latest company: the list is
  // newest first and only shows the first 20 (its search does not
  // filter), so an older franchise like "newpartner" can't be reached.
  async linkFranchise(
    franchisee?: string
  ): Promise<string> {

    //Checkbox of the Franchisee to show link franchisee option
    await this.linkFranchiseButton.click();

    // One .radio-item per franchise: pick the row, then its radio
    const franchiseItem = franchisee
      ? this.page.locator('.radio-item').filter({
          has: this.page.getByRole('radio', { name: franchisee })
        })
      : this.page.locator('.radio-item').first();

    const franchiseRadio = franchiseItem.getByRole('radio');

    await expect(franchiseRadio).toBeVisible({
      timeout: 15000
    });

    // Names are shown in lowercase, e.g. "companykfzqt"
    const linkedFranchisee = (
      await franchiseItem.innerText()
    ).trim();

    //Click on the radio box of the franchisee
    await franchiseRadio.check();

    await this.page
      .getByRole('button', {
        name: 'Link',
        exact: true
      })
      .click();

    console.log(`✅ Swap Station linked to franchise: ${linkedFranchisee}`);

    return linkedFranchisee;
  }

  

  async unlinkFranchise(
    franchisee: string = assetData.franchisee,
    swapStationSelection: string =
      assetData.swapStationSelection
  ): Promise<void> {

    //Checkbox of the Franchisee to show link franchisee option
    await this.DelinkFranchiseButton.click();

    await this.yesButton.click();


  }

  // Searches by serial and returns that swap station's row
  private async findSwapStationRow(
    serialNumber: string
  ): Promise<Locator> {

    // The app keeps the search text across navigation. Searching
    // the same text again sends no request and the loader overlay
    // never goes away, so only search when the text changes.
    if (await this.searchInput.inputValue() !== serialNumber) {

      await this.searchInput.fill(serialNumber);

      await this.searchInput.press('Enter');
    }

    const row = this.page.locator('tbody').getByRole('row').filter({
      hasText: serialNumber
    });

    await expect(row).toHaveCount(1, {
      timeout: 15000
    });

    return row;
  }

  async viewSwapStation(
    serialNumber: string
  ): Promise<void> {

    const row = await this.findSwapStationRow(serialNumber);

    await row.getByRole('img', { name: 'view' }).click();

    await expect(this.swapStationModal).toBeVisible({
      timeout: 10000
    });

    await expect(this.swapStationModal).toContainText(serialNumber);

    await this.swapStationModalClose.click();

    await expect(this.swapStationModal).toBeHidden({
      timeout: 10000
    });

    console.log(`✅ Swap Station details verified: ${serialNumber}`);
  }

  async deleteSwapStation(
    serialNumber: string
  ): Promise<void> {

    const row = await this.findSwapStationRow(serialNumber);

    await row.getByRole('img', { name: 'delete' }).click();

    // The hidden logout dialog also has a "Yes" button
    await this.page.getByRole('button', {
      name: 'Yes',
      exact: true
    }).filter({ visible: true }).click();

    await expect(
      this.page.getByRole('alert').filter({
        hasText: 'Swap Station deleted successfully'
      })
    ).toBeVisible({
      timeout: 15000
    });

    await expect(row).toHaveCount(0, {
      timeout: 15000
    });

    console.log(`✅ Swap Station deleted: ${serialNumber}`);
  }
}