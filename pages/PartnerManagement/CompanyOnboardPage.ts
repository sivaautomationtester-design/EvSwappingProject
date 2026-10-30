import { expect, Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

export class CompanyOnboardPage extends BasePage {

  // ============================================================
  // Navigation
  // ============================================================

  private readonly partnerManagementLink: Locator;
  private readonly addCompanyIcon: Locator;
  private readonly companiesList: Locator;
  private readonly searchCompanyInput: Locator;

  // ============================================================
  // Company Details
  // ============================================================

  private readonly businessRegNoInput: Locator;
  private readonly companyNameInput: Locator;
  private readonly companyTypeDropdown: Locator;
  private readonly pincodeInput: Locator;
  private readonly stateDropdown: Locator;
  private readonly cityDropdown: Locator;
  private readonly addressInput: Locator;

  // ============================================================
  // Services
  // ============================================================

  private readonly addServicesText: Locator;
  private readonly serviceCheckbox: Locator;
  private readonly addFinancialDetailsText: Locator;
  private readonly billingCycleDropdown: Locator;
  private readonly depositAmountInput: Locator;
  private readonly addFleetSizeText: Locator;
  private readonly addStationSizeText: Locator;
  private readonly sizeInput: Locator;

  // ============================================================
  // Admin Details
  // ============================================================

  private readonly addAndVerifyButton: Locator;
  private readonly mobileNumberInput: Locator;
  private readonly emailInput: Locator;
  private readonly addNameButton: Locator;
  private readonly nameInput: Locator;
  private readonly saveButton: Locator;
  private readonly sameAsFleetAdminCheckbox: Locator;

  // ============================================================
  // Common
  // ============================================================

  private readonly submitButton: Locator;
  private readonly nextButton: Locator;

  // ============================================================
  // Onboard
  // ============================================================

  private readonly onboardButton: Locator;
  private readonly confirmOnboardButton: Locator;

  // ============================================================
  // Constructor
  // ============================================================

  constructor(page: Page) {

    super(page);

    // ============================================================
    // Navigation
    // ============================================================

    this.partnerManagementLink = page.getByRole('link', {
      name: 'Partner Management'
    });

    this.addCompanyIcon = page.getByRole('img', {
      name: 'Add company'
    });

    this.companiesList = page.getByRole('main');

    this.searchCompanyInput = page.getByRole('textbox', {
      name: 'Search by business reg no.'
    });

    // ============================================================
    // Company Details
    // ============================================================

    this.businessRegNoInput = page.getByRole('textbox', {
      name: 'digit number'
    });

    this.companyNameInput = page.getByRole('textbox', {
      name: 'Enter company name'
    });

    this.companyTypeDropdown = page.getByRole('combobox').first();

    this.pincodeInput = page.getByRole('textbox', {
      name: '-digit pincode'
    });

    this.stateDropdown = page.getByRole('combobox').nth(2);

    this.cityDropdown = page.getByRole('combobox').nth(3);

    this.addressInput = page.getByRole('textbox', {
      name: 'Enter the registered address'
    });

    // ============================================================
    // Services
    // ============================================================

    this.addServicesText = page.getByText('Add services', {
      exact: true
    });

    this.serviceCheckbox = page.locator('label');

    this.addFinancialDetailsText = page.getByText('Add financial details');

    this.billingCycleDropdown = page.getByRole('combobox');

    this.depositAmountInput = page.getByRole('textbox', {
      name: 'Enter the deposit amount'
    });

    this.addFleetSizeText = page.getByText('Add fleet size');

    this.addStationSizeText = page.getByText('Add station size');

    this.sizeInput = page.getByRole('spinbutton', {
      name: 'Enter a number'
    });

    // ============================================================
    // Admin Details
    // ============================================================

    this.addAndVerifyButton = page.getByRole('button', {
      name: 'Add and verify'
    }).first();

    this.mobileNumberInput = page.getByRole('textbox', {
      name: 'Enter 10-digit mobile number'
    });

    this.emailInput = page.getByRole('textbox', {
      name: 'Enter email id'
    });

    this.addNameButton = page.getByRole('button', {
      name: 'Add name'
    }).first();

    this.nameInput = page.getByRole('textbox', {
      name: 'Enter Name'
    });

    this.saveButton = page.getByRole('button', {
      name: 'Save'
    });

    this.sameAsFleetAdminCheckbox = page.getByText('same as fleet admin');

    // ============================================================
    // Common
    // ============================================================

    this.submitButton = page.getByRole('button', {
      name: 'Submit'
    });

    this.nextButton = page.getByRole('button', {
      name: 'Next'
    });

    // ============================================================
    // Onboard
    // ============================================================

    this.onboardButton = page.getByRole('button', {
      name: 'Onboard',
      exact: true
    });

    this.confirmOnboardButton = page.getByRole('button', {
      name: 'Yes, onboard'
    });
  }

  // ============================================================
  // NAVIGATE TO PARTNER MANAGEMENT
  // ============================================================

  async navigateToPartnerManagement(): Promise<void> {

    await expect(
      this.partnerManagementLink
    ).toBeVisible({
      timeout: 10000
    });

    await this.partnerManagementLink.click();

    await expect(
      this.addCompanyIcon
    ).toBeVisible({
      timeout: 15000
    });

    console.log('✅ Partner Management page opened');
  }

  // ============================================================
  // OPEN ADD COMPANY
  // ============================================================

  async openAddCompany(): Promise<void> {

    await this.addCompanyIcon.click();

    await expect(
      this.businessRegNoInput
    ).toBeVisible({
      timeout: 10000
    });

    console.log('✅ Add company opened');
  }

  // ============================================================
  // ADD COMPANY DETAILS
  // ============================================================

  async addCompanyDetails(
    businessRegNo: string,
    companyName: string,
    companyType: string,
    pincode: string,
    state: string,
    city: string,
    address: string
  ): Promise<void> {

    await this.businessRegNoInput.fill(
      businessRegNo
    );

    await this.submitButton.click();

    await this.companyNameInput.fill(
      companyName
    );

    await this.companyTypeDropdown.selectOption(
      companyType
    );

    await this.pincodeInput.fill(
      pincode
    );

    await this.pincodeInput.press('Tab');

    await this.stateDropdown.selectOption(
      state
    );

    await this.cityDropdown.selectOption(
      city
    );

    await this.addressInput.fill(
      address
    );

    await this.nextButton.click();
  }

  // ============================================================
  // ADD SERVICE
  // ============================================================

  async addService(): Promise<void> {

    await this.addServicesText.click();

    await this.serviceCheckbox.check();

    await this.submitButton.click();
  }

  // ============================================================
  // ADD FINANCIAL DETAILS
  // ============================================================

  async addFinancialDetails(
    billingCycle: string,
    depositAmount: string
  ): Promise<void> {

    await this.addFinancialDetailsText.click();

    await this.billingCycleDropdown.selectOption(
      billingCycle
    );

    await this.depositAmountInput.fill(
      depositAmount
    );

    await this.submitButton.click();
  }

  // ============================================================
  // ADD SIZE (fleet size / station size)
  // ============================================================

  private async addSize(
    addSizeText: Locator,
    size: string
  ): Promise<void> {

    await addSizeText.click();

    await this.sizeInput.fill(
      size
    );

    await this.submitButton.click();
  }

  // ============================================================
  // ADD FLEET SERVICE
  // ============================================================

  async addFleetService(
    billingCycle: string,
    depositAmount: string,
    fleetSize: string
  ): Promise<void> {

    await this.addService();

    await this.addFinancialDetails(
      billingCycle,
      depositAmount
    );

    await this.addSize(
      this.addFleetSizeText,
      fleetSize
    );

    await this.nextButton.click();
  }

  // ============================================================
  // ADD STATION SERVICE
  // ============================================================

  async addStationService(
    billingCycle: string,
    depositAmount: string,
    stationSize: string
  ): Promise<void> {

    await this.addService();

    await this.addFinancialDetails(
      billingCycle,
      depositAmount
    );

    await this.addSize(
      this.addStationSizeText,
      stationSize
    );

    await this.nextButton.click();
  }

  // ============================================================
  // ADD ADMIN DETAILS
  // ============================================================

  async addAdminDetails(
    mobileNumber: string,
    email: string,
    adminName: string
  ): Promise<void> {

    // Mobile
    await this.addAndVerifyButton.click();

    await this.mobileNumberInput.fill(
      mobileNumber
    );

    await this.saveButton.click();

    // Email
    await this.addAndVerifyButton.click();

    await this.emailInput.fill(
      email
    );

    await this.saveButton.click();

    // Name
    await this.addNameButton.click();

    await this.nameInput.fill(
      adminName
    );

    await this.submitButton.click();

    await this.sameAsFleetAdminCheckbox.check();

    await this.nextButton.click();
  }

  // ============================================================
  // ONBOARD COMPANY
  // ============================================================

  async onboardCompany(
    businessRegNo: string,
    companyName: string
  ): Promise<void> {

    await this.onboardButton.click();

    await this.confirmOnboardButton.click();

    await expect(
      this.page.getByRole('alert').filter({
        hasText: 'Company onboarded successfully'
      })
    ).toBeVisible({
      timeout: 15000
    });

    // Wait for success popup to disappear
    await this.waitForPopupsToClose();

    // Verify company in list
    await this.searchCompanyInput.fill(
      businessRegNo
    );

    await expect(
      this.companiesList
    ).toContainText(
      companyName,
      { timeout: 15000 }
    );

    console.log(`✅ Company onboarded: ${companyName}`);
  }
}
