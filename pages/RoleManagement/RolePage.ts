import { expect, Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

export class RolePage extends BasePage {

  // ============================================================
  // Navigation
  // ============================================================

  private readonly roleManagementLink: Locator;
  private readonly createRoleIcon: Locator;
  private readonly manageRolesText: Locator;
  private readonly rolesList: Locator;
  private readonly searchRoleInput: Locator;

  // ============================================================
  // Role Details
  // ============================================================

  private readonly roleNameInput: Locator;
  private readonly descriptionInput: Locator;

  // ============================================================
  // Modules
  // ============================================================

  private readonly addModulesText: Locator;
  private readonly editModulesButton: Locator;
  private readonly modulesDrawer: Locator;
  private readonly selectAllCheckbox: Locator;
  private readonly drawerSubmitButton: Locator;
  private readonly drawerCancelButton: Locator;

  // ============================================================
  // Common
  // ============================================================

  private readonly setPermissionsButton: Locator;
  private readonly nextButton: Locator;

  // ============================================================
  // Create
  // ============================================================

  private readonly createRoleButton: Locator;
  private readonly confirmCreateRoleButton: Locator;

  // ============================================================
  // Edit
  // ============================================================

  private readonly updateRoleButton: Locator;
  private readonly saveChangesButton: Locator;

  // ============================================================
  // View
  // ============================================================

  private readonly roleDetails: Locator;

  // ============================================================
  // Delete
  // ============================================================

  private readonly confirmDeleteButton: Locator;

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

    this.createRoleIcon = page.getByRole('img', {
      name: 'Create Role'
    });

    this.manageRolesText = page.getByText('Manage your roles');

    this.rolesList = page.getByRole('main');

    this.searchRoleInput = page.getByRole('textbox', {
      name: 'Search roles by name'
    });

    // ============================================================
    // Role Details
    // ============================================================

    this.roleNameInput = page.getByRole('textbox', {
      name: 'Example: Fleet manager'
    });

    this.descriptionInput = page.getByRole('textbox', {
      name: 'Add a short description to'
    });

    // ============================================================
    // Modules
    // ============================================================

    this.addModulesText = page.getByText('Add modules');

    this.editModulesButton = page.getByRole('button', {
      name: 'Edit modules'
    });

    this.modulesDrawer = page.locator('mat-drawer');

    this.selectAllCheckbox = page.getByRole('checkbox', {
      name: 'Select all'
    });

    this.drawerSubmitButton = page.getByRole('button', {
      name: 'Submit'
    });

    this.drawerCancelButton = this.modulesDrawer.getByRole('button', {
      name: 'Cancel'
    });

    // ============================================================
    // Common
    // ============================================================

    this.setPermissionsButton = page.getByRole('button', {
      name: 'Set Permissions'
    });

    this.nextButton = page.getByRole('button', {
      name: 'Next'
    });

    // ============================================================
    // Create
    // ============================================================

    this.createRoleButton = page.getByRole('button', {
      name: 'Create role',
      exact: true
    });

    this.confirmCreateRoleButton = page.getByRole('button', {
      name: 'Create Role',
      exact: true
    });

    // ============================================================
    // Edit
    // ============================================================

    this.updateRoleButton = page.getByRole('button', {
      name: 'Update role'
    });

    this.saveChangesButton = page.getByRole('button', {
      name: 'Save changes'
    });

    // ============================================================
    // View
    // ============================================================

    this.roleDetails = page.locator('app-view-role-details');

    // ============================================================
    // Delete
    // ============================================================

    this.confirmDeleteButton = page.getByRole('button', {
      name: 'Yes, delete it'
    });
  }

  // ============================================================
  // NAVIGATE TO ROLE MANAGEMENT
  // ============================================================

  async navigateToRoleManagement(): Promise<void> {

    await expect(
      this.roleManagementLink
    ).toBeVisible({
      timeout: 10000
    });

    await this.roleManagementLink.click();

    await expect(
      this.createRoleIcon
    ).toBeVisible({
      timeout: 15000
    });

    // App keeps old search text (e.g. a deleted role from
    // role.spec) across navigation, which hides all roles
    if (await this.searchRoleInput.inputValue()) {
      await this.searchRoleInput.clear();
    }

    console.log('✅ Role Management page opened');
  }

  // ============================================================
  // ADD ROLE DETAILS
  // ============================================================

  async addRoleDetails(
    roleName: string,
    description: string
  ): Promise<void> {

    await this.roleNameInput.fill(
      roleName
    );

    await this.descriptionInput.fill(
      description
    );
  }

  // ============================================================
  // ADD ALL MODULES
  // ============================================================

  async addAllModules(): Promise<void> {

    await this.addModulesText.click();

    await expect(
      this.selectAllCheckbox
    ).toBeVisible({
      timeout: 10000
    });

    await this.selectAllCheckbox.check();

    await this.drawerSubmitButton.click();
  }

  // ============================================================
  // CREATE ROLE
  // ============================================================

  async createRole(
    roleName: string,
    description: string
  ): Promise<void> {

    // 1. Navigate to Role Management
    await this.navigateToRoleManagement();

    // 2. Open Create Role
    await this.createRoleIcon.click();

    // 3. Add Role Details
    await this.addRoleDetails(
      roleName,
      description
    );

    // 4. Add Modules
    await this.addAllModules();

    // 5. Permissions
    await this.setPermissionsButton.click();

    await this.nextButton.click();

    // 6. Submit
    await this.createRoleButton.click();

    await this.confirmCreateRoleButton.click();

    // Wait for success popup to disappear
    await this.waitForPopupsToClose();

    // Search instead of reading the whole list, so a stale
    // filter or pagination can't hide the new role
    await this.searchRole(
      roleName
    );

    console.log(`✅ Role created: ${roleName}`);
  }

  // ============================================================
  // SEARCH ROLE
  // ============================================================

  async searchRole(
    roleName: string
  ): Promise<void> {

    await this.searchRoleInput.fill(
      roleName
    );

    await expect(
      this.rolesList
    ).toContainText(
      roleName.toUpperCase(),
      { timeout: 10000 }
    );
  }

  // ============================================================
  // EDIT ROLE
  // ============================================================

  async editRole(
    roleName: string,
    description: string
  ): Promise<void> {

    await this.searchRole(
      roleName
    );

    await this.page.getByRole('button', {
      name: 'edit'
    }).first().click();

    await this.descriptionInput.fill(
      description
    );

    // Modules unchanged
    await this.editModulesButton.click();

    await this.drawerCancelButton.click();

    await this.setPermissionsButton.click();

    await this.nextButton.click();

    await this.updateRoleButton.click();

    await this.saveChangesButton.click();

    await expect(
      this.rolesList
    ).toContainText(
      description,
      { timeout: 15000 }
    );

    // Wait for success popup to disappear
    await this.waitForPopupsToClose();

    console.log(`✅ Role updated: ${description}`);
  }

  // ============================================================
  // VIEW ROLE
  // ============================================================

  async viewRole(
    roleName: string
  ): Promise<void> {

    await this.searchRole(
      roleName
    );

    await this.page.getByRole('button', {
      name: 'view'
    }).first().click();

    await expect(
      this.roleDetails
    ).toContainText(
      roleName.toUpperCase(),
      { timeout: 10000 }
    );

    // Wait for any open popup to disappear
    await this.waitForPopupsToClose(false);

    await this.manageRolesText.click();

    console.log(`✅ Role details verified: ${roleName}`);
  }

  // ============================================================
  // DELETE ROLE
  // ============================================================

  async deleteRole(
    roleName: string
  ): Promise<void> {

    await this.searchRole(
      roleName
    );

    await this.page.getByRole('button', {
      name: 'delete'
    }).first().click();

    await this.confirmDeleteButton.click();

    await expect(
      this.page.getByRole('alert').filter({
        hasText: `custom role: ${roleName.toUpperCase()} is deleted successfully`
      })
    ).toBeVisible({
      timeout: 10000
    });

    // Wait for success popup to disappear
    await this.waitForPopupsToClose();

    console.log(`✅ Role deleted: ${roleName}`);
  }
}
