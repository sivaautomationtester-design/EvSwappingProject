import { expect, Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

export class UserPage extends BasePage {

  // ============================================================
  // Navigation
  // ============================================================

  private readonly roleManagementLink: Locator;
  private readonly usersMenu: Locator;
  private readonly createUserIcon: Locator;
  private readonly usersList: Locator;

  // ============================================================
  // User Details
  // ============================================================

  private readonly addPhoneNumberText: Locator;
  private readonly phoneNumberInput: Locator;
  private readonly addEmailText: Locator;
  private readonly emailInput: Locator;
  private readonly addNameText: Locator;
  private readonly nameInput: Locator;

  // ============================================================
  // Common
  // ============================================================

  private readonly submitButton: Locator;
  private readonly nextButton: Locator;
  private readonly roleDrawer: Locator;
  private readonly drawerSubmitButton: Locator;
  private readonly stepSubmitButton: Locator;

  // ============================================================
  // Create
  // ============================================================

  private readonly confirmCreateUserButton: Locator;

  // ============================================================
  // Assign Role
  // ============================================================

  private readonly selectRoleButton: Locator;
  private readonly confirmAssignRoleButton: Locator;

  // ============================================================
  // Unassign Role
  // ============================================================

  private readonly confirmUnassignButton: Locator;

  // ============================================================
  // Delete
  // ============================================================

  private readonly confirmRemoveUserButton: Locator;

  // ============================================================
  // Constructor
  // ============================================================

  constructor(page: Page) {

    super(page);

    // ============================================================
    // Navigation
    // ============================================================

    this.roleManagementLink = page.getByRole('link', {
      name: 'Role Management'
    });

    this.usersMenu = page.getByRole('link', {
      name: 'Users',
      exact: true
    });

    this.createUserIcon = page.getByRole('img', {
      name: 'create user icon'
    });

    this.usersList = page.getByRole('main');

    // ============================================================
    // User Details
    // ============================================================

    this.addPhoneNumberText = page.getByText('Add phone no');

    this.phoneNumberInput = page.getByRole('textbox', {
      name: 'Enter Phone Number'
    });

    this.addEmailText = page.getByText('Add Email address');

    this.emailInput = page.getByRole('textbox', {
      name: 'Enter Email Id'
    });

    this.addNameText = page.getByText('Add name');

    this.nameInput = page.getByRole('textbox', {
      name: 'Enter Name'
    });

    // ============================================================
    // Common
    // ============================================================

    this.submitButton = page.getByRole('button', {
      name: 'Submit'
    });

    this.nextButton = page.getByRole('button', {
      name: 'Next'
    });

    this.roleDrawer = page.locator('mat-drawer');

    this.drawerSubmitButton = this.roleDrawer.getByRole('button', {
      name: 'Submit'
    });

    // Stepper Submit, not the one inside the drawer
    this.stepSubmitButton = page.getByRole('button', {
      name: 'Submit'
    }).and(page.locator('.next-button'));

    // ============================================================
    // Create
    // ============================================================

    this.confirmCreateUserButton = page.getByRole('button', {
      name: 'Yes, create user'
    });

    // ============================================================
    // Assign Role
    // ============================================================

    this.selectRoleButton = page.getByRole('button', {
      name: 'Select role'
    });

    this.confirmAssignRoleButton = page.getByRole('button', {
      name: 'Yes, assign role'
    });

    // ============================================================
    // Unassign Role
    // ============================================================

    this.confirmUnassignButton = page.getByRole('button', {
      name: 'Yes, un-assign'
    });

    // ============================================================
    // Delete
    // ============================================================

    this.confirmRemoveUserButton = page.getByRole('button', {
      name: 'Yes, remove user'
    });
  }

  // ============================================================
  // SUCCESS POPUP
  // ============================================================

  private async expectSuccessPopup(
    message: string
  ): Promise<void> {

    await expect(
      this.page.getByRole('alert').filter({
        hasText: message
      })
    ).toBeVisible({
      timeout: 15000
    });

    // Wait for success popup to disappear
    await this.waitForPopupsToClose();
  }

  // ============================================================
  // NAVIGATE TO USERS
  // ============================================================

  async navigateToUsers(): Promise<void> {

    await expect(
      this.roleManagementLink
    ).toBeVisible({
      timeout: 10000
    });

    await this.roleManagementLink.click();

    await this.usersMenu.click();

    await expect(
      this.createUserIcon
    ).toBeVisible({
      timeout: 15000
    });

    console.log('✅ Users page opened');
  }

  // ============================================================
  // ADD USER DETAILS
  // ============================================================

  async addUserDetails(
    phoneNumber: string,
    email: string,
    userName: string
  ): Promise<void> {

    // Phone
    await this.addPhoneNumberText.click();

    await this.phoneNumberInput.fill(
      phoneNumber
    );

    await this.submitButton.click();

    // Email
    await this.addEmailText.click();

    await this.emailInput.fill(
      email
    );

    await this.submitButton.click();

    // Name
    await this.addNameText.click();

    await this.nameInput.fill(
      userName
    );

    await this.submitButton.click();
  }

  // ============================================================
  // CREATE USER
  // ============================================================

  async createUser(
    phoneNumber: string,
    email: string,
    userName: string
  ): Promise<void> {

    // 1. Navigate to Users
    await this.navigateToUsers();

    // 2. Open Create User
    await this.createUserIcon.click();

    // 3. Add User Details
    await this.addUserDetails(
      phoneNumber,
      email,
      userName
    );

    // 4. Submit
    await this.nextButton.click();

    await this.submitButton.click();

    await this.confirmCreateUserButton.click();

    await this.expectSuccessPopup(
      'User is created successfully'
    );

    await expect(
      this.usersList
    ).toContainText(
      userName,
      { timeout: 15000 }
    );

    console.log(`✅ User created: ${userName}`);
  }

  // ============================================================
  // ASSIGN ROLE
  // ============================================================

  async assignRole(
    roleName: string
  ): Promise<void> {

    await this.page.getByRole('button', {
      name: 'Assign Role'
    }).first().click();

    await this.selectRoleButton.click();

    await this.roleDrawer.getByText(
      roleName.toUpperCase(),
      { exact: true }
    ).click();

    await this.drawerSubmitButton.click();

    await this.nextButton.click();

    await this.stepSubmitButton.click();

    await this.confirmAssignRoleButton.click();

    await this.expectSuccessPopup(
      'Role assigned successfully'
    );

    console.log(`✅ Role assigned: ${roleName}`);
  }

  // ============================================================
  // UNASSIGN ROLE
  // ============================================================

  async unassignRole(): Promise<void> {

    await this.page.getByRole('button', {
      name: 'Unassign Role'
    }).first().click();

    await this.confirmUnassignButton.click();

    await this.expectSuccessPopup(
      'Request is processed successfully'
    );

    console.log('✅ Role unassigned');
  }

  // ============================================================
  // DELETE USER
  // ============================================================

  async deleteUser(
    userName: string
  ): Promise<void> {

    await this.page.getByRole('button', {
      name: 'delete'
    }).first().click();

    await this.confirmRemoveUserButton.click();

    await this.expectSuccessPopup(
      'Request is processed successfully'
    );

    console.log(`✅ User deleted: ${userName}`);
  }
}
