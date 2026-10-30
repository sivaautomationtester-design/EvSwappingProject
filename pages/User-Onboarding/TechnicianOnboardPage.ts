import { expect, Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

export class TechnicianPage extends BasePage {

  // ============================================================
  // Navigation
  // ============================================================

  private readonly userManagementLink: Locator;
  private readonly technicianMenu: Locator;
  private readonly onboardButton: Locator;

  // ============================================================
  // Contact Details
  // ============================================================

  private readonly addContactDetailsButton: Locator;
  private readonly phoneNumberInput: Locator;
  private readonly submitPhoneButton: Locator;
  private readonly submitNameButton: Locator;
  

  // ============================================================
  // Name
  // ============================================================

  private readonly addNameButton: Locator;
  private readonly nameInput: Locator;
  

  // ============================================================
  // Badge Number
  // ============================================================

  private readonly addBadgeNumberButton: Locator;
  private readonly badgeNumberInput: Locator;
  private readonly submitButton: Locator;

  // ============================================================
  // Address
  // ============================================================

  private readonly pincodeInput: Locator;
  private readonly countryDropdown: Locator;
  private readonly stateDropdown: Locator;
  private readonly cityDropdown: Locator;
  private readonly addressInput: Locator;
  private readonly addButton: Locator;

  // ============================================================
  // Common
  // ============================================================

  private readonly nextButton: Locator;
  private readonly yesSubmitButton: Locator;
  private readonly okButton: Locator;

  // ============================================================
  // View
  // ============================================================

  private readonly viewButton: Locator;
  private readonly viewAndVerifyButton: Locator;
  private readonly technicianManagementText: Locator;

  // ============================================================
  // Edit
  // ============================================================

  private readonly editButton: Locator;
  private readonly editStateDropdown: Locator;
  private readonly editCityDropdown: Locator;
  private readonly addPincodeButton: Locator;
  private readonly selectPincodeText: Locator;
  private readonly pincodePanel: Locator;
  private readonly applyButton: Locator;
  private readonly overlayBackdrop: Locator;

  // ============================================================
  // Constructor
  // ============================================================

  constructor(page: Page) {

    super(page);

    // ============================================================
    // Navigation
    // ============================================================

    this.userManagementLink = page.getByRole('link', {
      name: 'User Management'
    });

    this.technicianMenu = page.getByRole('link', {
      name: 'Technician'
    });

    this.onboardButton = page.getByRole('button', {
      name: 'Onboard Technician'
    });

    // ============================================================
    // Contact Details
    // ============================================================

    this.addContactDetailsButton = page.getByRole('button', {
      name: 'Add contact details'
    });

    this.phoneNumberInput = page.getByRole('textbox', {
      name: 'Enter phone number'
    });

    this.submitPhoneButton = page.getByRole('button', {
      name: 'Submit Phone No'
    });

    // ============================================================
    // Name
    // ============================================================

    this.addNameButton = page.getByRole('button', {
      name: 'Add name'
    });

    this.nameInput = page.getByRole('textbox', {
      name: 'Enter the name'
    });

    // ============================================================
    // Badge Number
    // ============================================================

    this.addBadgeNumberButton = page.getByRole('button', {
      name: 'Add badge number'
    });

    this.badgeNumberInput = page.getByRole('textbox', {
      name: 'add badge number'
    });

    this.submitNameButton = page.getByRole('button', {
      name: 'Submit Name'
    });

    // this.submitNameButton = page.getByRole('button', {
    //   name: 'Submit Phone No'
    // });

     

    this.submitButton = page.getByRole('button', {
    name: 'Submit',
    exact: true
    });

    // ============================================================
    // Address
    // ============================================================

    this.pincodeInput = page.getByRole('textbox', {
      name: /digit pincode/i
    });

    this.countryDropdown = page.getByLabel('Country');

    this.stateDropdown = page.getByLabel('State');

    this.cityDropdown = page.getByLabel('City', {
      exact: true
    });

    this.addressInput = page.getByRole('textbox', {
      name: 'House number, street, area'
    });

    this.addButton = page.getByRole('button', {
      name: 'Add',
      exact: true
    });

    // ============================================================
    // Common
    // ============================================================

    this.nextButton = page.getByRole('button', {
      name: 'Next'
    });

    this.yesSubmitButton = page.getByRole('button', {
      name: 'Yes submit'
    });

    this.okButton = page.getByRole('button', {
      name: 'Ok'
    });

    // ============================================================
    // View
    // ============================================================

    this.viewButton = page.getByRole('img', {
      name: 'view'
    });

    this.viewAndVerifyButton = page
      .getByRole('main')
      .getByText('View and verify');

    this.technicianManagementText = page.getByText(
      'Technician management'
    );

    // ============================================================
    // Edit
    // ============================================================

    this.editButton = page.getByRole('img', {
      name: 'edit'
    });

    this.editStateDropdown = page
      .getByRole('combobox')
      .nth(3);

    this.editCityDropdown = page.getByRole('combobox', {
      name: 'Select city'
    });

    this.addPincodeButton = page.getByRole('button', {
      name: 'Add pincode'
    });

    this.selectPincodeText = page.getByText(
      'Select pincode'
    );

    // The open pincode list; mat-select ids change between runs
    this.pincodePanel = page.locator(
      '.mat-mdc-select-panel'
    ).filter({ visible: true });

    this.applyButton = page.getByRole('button', {
      name: 'Apply'
    });

    this.overlayBackdrop = page.locator(
      '.cdk-overlay-backdrop'
    );
  }

  // ============================================================
  // NAVIGATE TO TECHNICIAN
  // ============================================================

  async navigateToTechnician(): Promise<void> {

    await expect(
      this.userManagementLink
    ).toBeVisible({
      timeout: 10000
    });

    await this.userManagementLink.click();

    await expect(
      this.technicianMenu
    ).toBeVisible({
      timeout: 10000
    });

    await this.technicianMenu.click();

    await expect(
      this.onboardButton
    ).toBeVisible({
      timeout: 15000
    });

    console.log('✅ Technician page opened');
  }

  // ============================================================
  // OPEN TECHNICIAN ONBOARDING
  // ============================================================

  async openTechnicianOnboarding(): Promise<void> {

    await this.onboardButton.click();

    await expect(
      this.addContactDetailsButton
    ).toBeVisible({
      timeout: 10000
    });

    console.log('✅ Technician onboarding opened');
  }

  // ============================================================
  // ADD CONTACT DETAILS
  // ============================================================

  async addContactDetails(
    phoneNumber: string
  ): Promise<void> {

    await this.addContactDetailsButton.click();

    await this.phoneNumberInput.fill(
      phoneNumber
    );

    await this.submitPhoneButton.click();
  }

  // ============================================================
  // ADD NAME
  // ============================================================

  async addTechnicianName(
    technicianName: string
  ): Promise<void> {

    await this.addNameButton.click();

    await this.nameInput.fill(
      technicianName
    );

    await this.submitNameButton.click();
  }

  // ============================================================
  // ADD BADGE NUMBER
  // ============================================================

  async addBadgeNumber(
    badgeNumber: string
  ): Promise<void> {

    await this.addBadgeNumberButton.click();

    await this.badgeNumberInput.fill(
      badgeNumber
    );

    await this.submitButton.click();
  }

  // ============================================================
  // ADD ADDRESS
  // ============================================================

  async addAddress(
    pincode: string,
    country: string,
    state: string,
    city: string,
    address: string
  ): Promise<void> {

    await this.pincodeInput.fill(
      pincode
    );

    //await this.pincodeInput.press('Tab');

    await this.countryDropdown.selectOption(
      country
    );

    await this.stateDropdown.selectOption(
      state
    );

    await this.cityDropdown.selectOption(
      city
    );

    await this.addressInput.fill(
      address
    );

    //await this.addButton.click();
  }

  // ============================================================
  // CREATE TECHNICIAN
  // ============================================================

  async createTechnician(
    phoneNumber: string,
    technicianName: string,
    badgeNumber: string,
    pincode: string,
    country: string,
    state: string,
    city: string,
    address: string
  ): Promise<void> {

    // 1. Navigate to Technician
    await this.navigateToTechnician();

    // 2. Open Technician Onboarding
    await this.openTechnicianOnboarding();

    // 3. Add Contact Details
    await this.addContactDetails(
      phoneNumber
    );

    // 4. Add Name
    await this.addTechnicianName(
      technicianName
    );

    // 5. Add Badge Number
    await this.addBadgeNumber(
      badgeNumber
    );

    // 6. Add Address
    await this.addAddress(
      pincode,
      country,
      state,
      city,
      address
    );

    console.log(
      `✅ Technician details entered: ${technicianName}`
    );

    //await this.page.pause();
  }

  // ============================================================
  // SUBMIT TECHNICIAN
  // ============================================================

  async submitTechnician(): Promise<void> {

    // 1. Next
    await this.nextButton.click();

    // 2. Submit
    await this.submitButton.click();

    // 3. Confirmation
    await this.yesSubmitButton.click();

    console.log(
      '✅ Technician submission completed'
    );
  }

  // ============================================================
  // VERIFY TECHNICIAN CREATED
  // ============================================================

  async verifyTechnicianCreated(): Promise<void> {

    await expect(
      this.page.locator('html')
    ).toContainText(
      'Technician has been successfully onboarded.',
      {
        timeout: 15000
      }
    );

    console.log(
      '✅ Technician successfully onboarded'
    );

    await this.okButton.click();
  }

  // ============================================================
  // VIEW TECHNICIAN
  // ============================================================

  async viewTechnician(): Promise<void> {

    await expect(
      this.viewButton.first()
    ).toBeVisible({
      timeout: 10000
    });

    await this.viewButton.first().click();

    await expect(
      this.viewAndVerifyButton
    ).toBeVisible({
      timeout: 10000
    });

    await this.viewAndVerifyButton.click();

    console.log(
      '✅ Technician details opened'
    );
  }

  // ============================================================
  // EDIT TECHNICIAN
  // ============================================================

  async editTechnician(
    state: string,
    city: string
  ): Promise<void> {

    await this.technicianManagementText.click();

    await expect(
      this.editButton.first()
    ).toBeVisible({
      timeout: 10000
    });

    await this.editButton.first().click();

    // ----------------------------------------------------------
    // State
    // ----------------------------------------------------------

    // The city list only loads when the state changes. If the
    // technician already has this state, pick another one first.
    const currentState = (
      await this.editStateDropdown.locator('option:checked').innerText()
    ).trim();

    if (currentState === state) {

      const otherState = (
        await this.editStateDropdown.locator('option:not([disabled])').allInnerTexts()
      ).map(name => name.trim()).find(name => name !== state);

      if (otherState) {
        await this.editStateDropdown.selectOption(
          otherState
        );
      }
    }

    // Match this state's request: the other state's one may
    // still be on its way
    const citiesLoaded = this.page.waitForResponse(
      response =>
        response.url().includes('/api/getOperatingRegions') &&
        decodeURIComponent(response.url()).includes(`states=${state}`),
      { timeout: 15000 }
    );

    await this.editStateDropdown.selectOption(
      state
    );

    await citiesLoaded;

    // ----------------------------------------------------------
    // City
    // ----------------------------------------------------------

    await this.editCityDropdown.click();

    await this.page.getByText(
      city,
      { exact: true }
    ).click();

    // ----------------------------------------------------------
    // Close overlay
    // ----------------------------------------------------------

    // City is a multi-select and stays open after the pick. Close
    // it by clicking outside (Escape closes it without loading the
    // city's pincodes) and wait, or the next click only closes it.
    const listOpen = await this.overlayBackdrop
      .waitFor({ state: 'visible', timeout: 2000 })
      .then(() => true, () => false);

    if (listOpen) {
      await this.overlayBackdrop.click();
    }

    await expect(
      this.overlayBackdrop
    ).toBeHidden({
      timeout: 10000
    });

    // No pincode: the update goes straight to Next → Submit → Yes
    console.log(
      `✅ Technician details updated: ${state}, ${city}`
    );
  }

  // ============================================================
  // SUBMIT TECHNICIAN UPDATE
  // ============================================================

  async submitTechnicianUpdate(): Promise<void> {

    // 1. Next
    await this.nextButton.click();

    // 2. Submit
    await this.submitButton.click();

    // 3. Confirmation
    await this.yesSubmitButton.click();

    // 4. Verify
    await expect(
      this.page.locator('html')
    ).toContainText(
      'Technician has been updated successfully.',
      {
        timeout: 15000
      }
    );

    console.log(
      '✅ Technician successfully updated'
    );

    await this.okButton.click();
  }
}