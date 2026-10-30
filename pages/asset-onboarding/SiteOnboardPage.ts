import { expect, Page, Locator} from '@playwright/test';
import { BasePage } from '../base.page';
import { assetData } from '../../test-data/asset.data';

export class SitePage extends BasePage {

  private readonly sitesMenu: Locator;
  private readonly onboardButton: Locator;
  private readonly locationNameInput: Locator;
  private readonly locationTypeDropdown: Locator;
  private readonly franchiseeTypeDropdown: Locator;
  private readonly addLocationButton: Locator;
  private readonly searchLocationInput: Locator;
  private readonly addButton: Locator;
  private readonly nextButton: Locator;
  private readonly selectButton: Locator;
  private readonly submitButton: Locator;
  private readonly createConfirmationButton: Locator;

  constructor(page: Page) {
    super(page);

    this.sitesMenu = page.locator('a').filter({
      hasText: 'Sites'
    });

    this.onboardButton = page.getByRole('button', {
      name: 'Site Onboard'
    });

    this.locationNameInput = page.getByRole('textbox', {
      name: 'Enter location name'
    });

    this.locationTypeDropdown = page.getByRole('combobox').first();
    
    this.franchiseeTypeDropdown = page.getByRole('combobox').nth(1);

    this.addLocationButton = page.getByRole('button', {
      name: 'Add location'
    });

    this.searchLocationInput = page.getByRole('textbox', {
      name: 'Search location'
    });

    this.addButton = page.getByRole('button', {
      name: 'Add',
      exact: true
    });

    this.nextButton = page.getByRole('button', {
      name: 'Next'
    });

    this.selectButton = page.getByRole('button', {
      name: 'Select'
    });

    this.submitButton = page.getByRole('button', {
      name: 'Submit'
    });

    this.createConfirmationButton = page.getByRole('button', {
      name: 'Yes, create'
    });
  }

  async navigateToSites(): Promise<void> {

    await this.sitesMenu.click();

    await expect(this.onboardButton).toBeVisible();
  }

  async openSiteOnboarding(): Promise<void> {

    await this.onboardButton.click();

    await expect(this.locationNameInput).toBeVisible();
  }

  async enterSiteName(siteName: string): Promise<void> {

    await this.locationNameInput.fill(siteName);
  }

  async selectSiteType(): Promise<void> {

    await this.locationTypeDropdown.selectOption(
      assetData.siteType
    );
  }

  

  async selectFranchiseeType(
    franchisee: string = assetData.franchiseeType
  ): Promise<void> {

    // The swap station's link dialog shows names in lowercase, so
    // find this dropdown's option ignoring case
    const options = await this.franchiseeTypeDropdown
      .locator('option')
      .allInnerTexts();

    const option = options
      .map(name => name.trim())
      .find(name => name.toLowerCase() === franchisee.toLowerCase());

    await this.franchiseeTypeDropdown.selectOption(
      option ?? franchisee
    );
  }

  async selectLocation(): Promise<void> {

    await this.addLocationButton.click();

    await this.searchLocationInput.pressSequentially('mg road', {
  delay: 150
});

await this.page.locator('.pac-matched').first().click();


    /*
     * IMPORTANT:
     * Replace this locator with the actual location result
     * once we inspect the DOM.
     */

    

    // await this.page.getByRole('img', {
    //   name: 'Close'
    // }).click();
  }

  async addLocation(): Promise<void> {

    await this.addButton.click();
  }

  async configureSiteTiming(): Promise<void> {

    /*
     * Your recorded script uses:
     *
     * combobox nth(2)
     * combobox nth(5)
     *
     * We should replace these with labels/names after
     * inspecting the actual DOM.
     */

    const comboboxes = this.page.getByRole('combobox');

    await comboboxes.nth(2).selectOption('8: 9');

    await comboboxes.nth(5).selectOption('8: 9');
  }

  async goNext(): Promise<void> {

    await this.nextButton.click();
  }

  // async updateSiteName(siteName: string): Promise<void> {

  //   await this.locationNameInput.fill(siteName);
  // }

  // async selectSiteObjectType(): Promise<void> {

  //   await this.page
  //     .getByRole('combobox')
  //     .nth(1)
  //     .selectOption('4: Object');
  // }

  async selectSwapStation(
    swapStationSerial: string
  ): Promise<void> {

    await this.selectButton.click();

    await expect(
      this.page.locator('mat-drawer').filter({
        hasText: 'Select swap stations'
      })
    ).toBeVisible();

    /*
     * We need to inspect the actual Swap Station
     * selection UI to make this locator stable.
     *
     * This is intentionally not using nth().
     */

    const swapStation = this.page.getByText(
      swapStationSerial,
      { exact: true }
    );

    await expect(swapStation).toBeVisible();

    await swapStation.click();

    await this.submitButton.click();

    await this.nextButton.click();
  }

  async submitSite(): Promise<void> {

    await this.submitButton.first().click();

    await expect(this.createConfirmationButton).toBeVisible();

    await this.createConfirmationButton.click();
  }

  async verifySiteCreated(
    siteName: string
  ): Promise<void> {

    await expect(this.page.locator('html'))
      .toContainText(
        'Site has been onboarded successfully!'
      );

    await this.page.getByRole('button', {
      name: 'Ok'
    }).click();

    await expect(this.page.locator('tbody'))
      .toContainText(siteName);

    console.log('✅ Site has been onboarded successfully');  
  }

  async createSite(
  siteName: string,
  swapStationSerial: string,
  franchisee?: string
): Promise<void> {

  await this.navigateToSites();
  // 1. Open Site Onboarding
  await this.openSiteOnboarding();

  // 2. Enter Site Name
  await this.enterSiteName(siteName);

  // 3. Select Site Type
  await this.selectSiteType();

  //select franchisee
  await this.selectFranchiseeType(franchisee);

  // 4. Select Location
  await this.selectLocation();

  // 5. Add Location
  await this.addLocation();

  // 6. Configure timing
  await this.configureSiteTiming();

  // 7. Next
  await this.goNext();

  // 8. Enter/Update Site Name
  //await this.updateSiteName(siteName);

  // 9. Select object type
  //await this.selectSiteObjectType();

  // 10. Next
  //await this.goNext();

  // 11. Select Swap Station
  await this.selectSwapStation(
    swapStationSerial
  );

  // 12. Next
  //await this.goNext();

  // 13. Submit
  await this.submitSite();

  // 14. Verify creation
  await this.verifySiteCreated(siteName);
}
}