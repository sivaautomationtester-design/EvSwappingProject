import { expect, Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

export type DriverData = {
  phone: string;
  name: string;
  badgeNumber: string;
  address: string;
  pincode: string;
  state: string;
  city: string;
  country: string;
};

export type DriverSearchField = 'badge' | 'phone' | 'name';

// User Management > Driver.
// Partner admins can onboard, edit and delete drivers; the tenant
// admin only sees them (view / link), so it is used to verify.
export class DriverPage extends BasePage {

  // ============================================================
  // Navigation
  // ============================================================

  private readonly userManagementMenu: Locator;
  private readonly driverMenu: Locator;
  private readonly driverTableBody: Locator;

  // ============================================================
  // Search
  // ============================================================

  private readonly searchFieldToggle: Locator;

  // ============================================================
  // Onboard / Edit Driver
  // ============================================================

  private readonly onboardDriverButton: Locator;
  private readonly fleetNameSelect: Locator;
  private readonly phoneInput: Locator;
  private readonly submitPhoneButton: Locator;
  private readonly nameInput: Locator;
  private readonly submitNameButton: Locator;
  private readonly badgeNumberInput: Locator;
  private readonly addressInput: Locator;
  private readonly pincodeInput: Locator;
  private readonly stateSelect: Locator;
  private readonly citySelect: Locator;
  private readonly countrySelect: Locator;
  private readonly openCalendarButton: Locator;
  private readonly submitButton: Locator;
  private readonly updateButton: Locator;
  private readonly successMessage: Locator;
  private readonly okButton: Locator;

  // ============================================================
  // Constructor
  // ============================================================

  constructor(page: Page) {

    super(page);

    // ============================================================
    // Navigation
    // ============================================================

    this.userManagementMenu = page.getByRole('link', {
      name: /User Management/
    }).first();

    this.driverMenu = page.getByRole('link', {
      name: 'Driver',
      exact: true
    });

    this.driverTableBody = page.locator('tbody');

    // ============================================================
    // Search
    // Shows the current field ("Search by badge"); clicking it
    // lists the other fields
    // ============================================================

    this.searchFieldToggle = page.locator('.search-field-value');

    // ============================================================
    // Onboard / Edit Driver
    // ============================================================

    // "Onboard Driver" while the list is empty, "Driver Onboard"
    // in the toolbar once there are drivers
    this.onboardDriverButton = page.getByRole('button', {
      name: /^\s*(Onboard Driver|Driver Onboard)\s*$/
    }).filter({ visible: true }).first();

    this.fleetNameSelect = page.getByLabel('Fleet Name*');

    this.phoneInput = page.getByRole('textbox', {
      name: 'Enter phone number'
    });

    this.submitPhoneButton = page.getByRole('button', {
      name: 'Submit Phone No'
    });

    this.nameInput = page.getByRole('textbox', {
      name: 'Enter the name'
    });

    this.submitNameButton = page.getByRole('button', {
      name: 'Submit Name'
    });

    this.badgeNumberInput = page.getByRole('textbox', {
      name: 'Enter badge number'
    });

    this.addressInput = page.getByRole('textbox', {
      name: 'Enter Full Address'
    });

    this.pincodeInput = page.getByRole('textbox', {
      name: 'Enter Pincode'
    });

    this.stateSelect = page.getByLabel('State');

    this.citySelect = page.getByLabel('City');

    this.countrySelect = page.locator('#country');

    this.openCalendarButton = page.getByRole('button', {
      name: 'Open calendar'
    });

    this.submitButton = page.getByRole('button', {
      name: 'Submit',
      exact: true
    });

    this.updateButton = page.getByRole('button', {
      name: 'Update'
    });

    // The page also has an empty <p>, so match the message text
    this.successMessage = page.getByRole('paragraph').filter({
      hasText: /successfully/
    });

    this.okButton = page.getByRole('button', {
      name: 'Ok'
    });
  }

  // ============================================================
  // NAVIGATE TO DRIVERS
  // ============================================================

  async navigateToDrivers(): Promise<void> {

    // Clicking an open parent menu again would collapse it
    if (!(await this.driverMenu.isVisible())) {

      await expect(
        this.userManagementMenu
      ).toBeVisible({
        timeout: 15000
      });

      await this.userManagementMenu.click();
    }

    await this.driverMenu.click();

    // The page keeps the last search, and the app skips a search
    // equal to it, so a long-open page (the tenant one) could show
    // stale drivers. Reloading starts it clean.
    await this.page.reload({
      waitUntil: 'domcontentloaded'
    });

    await expect(
      this.searchFieldToggle
    ).toBeVisible({
      timeout: 15000
    });

    console.log('✅ Driver page opened');
  }

  // ============================================================
  // SEARCH DRIVER
  // ============================================================

  async searchDriver(
    field: DriverSearchField,
    value: string
  ): Promise<Locator> {

    const searchInput = this.page.getByRole('textbox', {
      name: `Search by ${field}`
    });

    // Pick the search field unless it is already selected
    if (!(await searchInput.isVisible())) {

      await this.searchFieldToggle.click();

      await this.page.getByText(`Search by ${field}`, {
        exact: true
      }).filter({ visible: true }).last().click();
    }

    // The app sends no request when the text equals its previous
    // search, even across fields (a badge can equal the phone), so
    // the wait is a best effort; callers check the rows with retries
    await this.runSearch(searchInput, value).catch(() => {});

    const row = this.driverTableBody.getByRole('row').filter({
      hasText: value
    });

    console.log(`🔍 Searched driver by ${field}: ${value}`);

    return row;
  }

  // Types the search and waits for the driver list to reload
  private async runSearch(
    searchInput: Locator,
    value: string,
    timeout: number = 5000
  ): Promise<void> {

    const listLoaded = this.page.waitForResponse(
      response =>
        response.url().includes('/api/consumer') &&
        response.request().method() === 'GET',
      { timeout }
    );

    await searchInput.fill(value);

    await searchInput.press('Enter');

    await listLoaded;
  }

  // ============================================================
  // ONBOARD DRIVER (partner admin)
  // ============================================================

  async onboardDriver(
    data: DriverData
  ): Promise<void> {

    await this.onboardDriverButton.click();

    // A partner only sees its own fleet(s); take the first one
    await expect(
      this.fleetNameSelect.locator('option:not([disabled])').first()
    ).toBeAttached({
      timeout: 15000
    });

    const fleetValue = await this.fleetNameSelect
      .locator('option:not([disabled])')
      .first()
      .getAttribute('value');

    await this.fleetNameSelect.selectOption(
      fleetValue ?? { index: 1 }
    );

    // Phone, then name, each confirmed with its own checkbox
    await this.page.getByRole('checkbox').filter({
      visible: true
    }).last().check();

    await this.phoneInput.fill(
      data.phone
    );

    await this.submitPhoneButton.click();

    // The phone is saved once its "Change" link shows; only then
    // tick the Name checkbox (the phone one can still be visible)
    await expect(
      this.page.getByText('Change', { exact: true }).first()
    ).toBeVisible({
      timeout: 15000
    });

    await this.page.getByRole('checkbox', {
      checked: false
    }).filter({
      visible: true
    }).first().check();

    await this.nameInput.fill(
      data.name
    );

    await this.submitNameButton.click();

    await this.badgeNumberInput.fill(
      data.badgeNumber
    );

    await this.addressInput.fill(
      data.address
    );

    await this.pincodeInput.fill(
      data.pincode
    );

    await this.pincodeInput.press('Tab');

    await this.stateSelect.selectOption(
      data.state
    );

    await this.citySelect.selectOption(
      data.city
    );

    await this.countrySelect.selectOption(
      data.country
    );

    await this.selectDateOfBirth();

    await this.submitButton.click();

    await expect(
      this.successMessage
    ).toContainText(
      'Driver added successfully!',
      { timeout: 15000 }
    );

    await this.okButton.click();

    console.log(`✅ Driver onboarded: ${data.name} (${data.phone})`);
  }

  // Date of birth 5 Feb 1980 from the calendar, as recorded
  private async selectDateOfBirth(): Promise<void> {

    await this.openCalendarButton.click();

    await this.page.getByRole('button', {
      name: 'Previous 24 years'
    }).click();

    await this.page.getByRole('button', {
      name: '1980',
      exact: true
    }).click();

    await this.page.getByRole('button', {
      name: '2/1/1980',
      exact: true
    }).click();

    await this.page.getByRole('button', {
      name: '2/5/1980',
      exact: true
    }).click();
  }

  // ============================================================
  // EDIT DRIVER (partner admin)
  // ============================================================

  async editDriver(
    phone: string,
    badgeNumber: string,
    pincode: string
  ): Promise<void> {

    const row = await this.searchDriver(
      'phone',
      phone
    );

    await expect(
      row
    ).toHaveCount(1, {
      timeout: 15000
    });

    await row.getByRole('img', {
      name: 'edit'
    }).click();

    // The form fills in the saved driver after it opens
    await expect(
      this.badgeNumberInput
    ).not.toHaveValue('', {
      timeout: 15000
    });

    await this.badgeNumberInput.fill(
      badgeNumber
    );

    await this.pincodeInput.fill(
      pincode
    );

    await this.updateButton.click();

    await expect(
      this.successMessage
    ).toContainText(
      'Driver updated successfully!',
      { timeout: 15000 }
    );

    await this.okButton.click();

    console.log(`✅ Driver updated: ${phone} → badge ${badgeNumber}`);
  }

  // ============================================================
  // DELETE DRIVER (partner admin)
  // ============================================================

  async deleteDriver(
    phone: string
  ): Promise<void> {

    const row = await this.searchDriver(
      'phone',
      phone
    );

    await expect(
      row
    ).toHaveCount(1, {
      timeout: 15000
    });

    await row.getByRole('img', {
      name: 'delete'
    }).click();

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

    await expect(
      row
    ).toHaveCount(0, {
      timeout: 15000
    });

    console.log(`✅ Driver deleted: ${phone}`);
  }

  // ============================================================
  // VERIFY DRIVER
  // Searches by the given field and checks the row shows every
  // expected value
  // ============================================================

  async verifyDriver(
    field: DriverSearchField,
    value: string,
    expectedValues: string[]
  ): Promise<void> {

    const row = await this.searchDriver(
      field,
      value
    );

    await expect(
      row
    ).toHaveCount(1, {
      timeout: 15000
    });

    for (const expected of expectedValues) {
      await expect(
        row
      ).toContainText(
        expected
      );
    }

    console.log(`✅ Driver verified by ${field}: ${value}`);
  }

  async verifyDriverNotListed(
    phone: string
  ): Promise<void> {

    const row = await this.searchDriver(
      'phone',
      phone
    );

    await expect(
      row
    ).toHaveCount(0, {
      timeout: 15000
    });

    console.log(`✅ Driver not listed: ${phone}`);
  }
}
