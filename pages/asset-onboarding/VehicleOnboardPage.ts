import { expect, Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class VehicleOnboardPage extends BasePage {

  // ============================================================
  // LOCATORS
  // ============================================================

  // Navigation
  private readonly assetManagementMenu;
  private readonly searchInput;
  private readonly vehicleMenu;
  private readonly vehicleOnboardButton;

  // Create Vehicle
  private readonly oemNameDropdown;
  private readonly vehicleTypeDropdown;
  private readonly vehicleNumberInput;
  private readonly vinInput;
  private readonly manufacturerYearDropdown;
  private readonly uploadButton;

  // Success / Confirmation
  private readonly successMessage;
  private readonly okButton;

  // Vehicle table
  private readonly vehicleTableBody;

  // Edit Vehicle
  private readonly editButton;
  private readonly updateButton;

  // Delete Vehicle
  private readonly deleteButton;
  private readonly yesButton;
  private readonly deleteSuccessMessage;

  // Blacklist / Reinstate
  private readonly blacklistVehicleButton;
  private readonly reinstateVehicleButton;
  private readonly selectVehicleLink;
  private readonly vehicleDrawerItems;
  private readonly selectButton;
  private readonly blacklistReasonInput;
  private readonly reinstateReasonInput;
  private readonly submitButton;
  private readonly confirmBlacklistButton;
  private readonly confirmReinstateButton;


  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor(page: Page) {
    super(page);

    // ------------------------------------------------------------
    // Navigation
    // ------------------------------------------------------------

    this.assetManagementMenu = page.getByRole('link', {
      name: /Asset Management/
    }).first();

    this.searchInput = page.getByPlaceholder("Search by Reg No.");

    this.vehicleMenu = page.locator('a').filter({
      hasText: 'Vehicle'
    });

    this.vehicleOnboardButton = page.getByRole('button', {
      name: 'Vehicle Onboard'
    });


    // ------------------------------------------------------------
    // Create Vehicle
    // ------------------------------------------------------------

    this.oemNameDropdown = page.getByLabel('OEM Name*');

    this.vehicleTypeDropdown = page.getByLabel('Vehicle Type*');

    this.vehicleNumberInput = page.getByRole('textbox', {
      name: 'Enter Registration Number'
    });

    this.vinInput = page.getByRole('textbox', {
      name: 'Enter VIN'
    });

    this.manufacturerYearDropdown = page.locator(
  'select[formcontrolname="manufacturerYear"]'
);

    this.uploadButton = page.getByRole('button', {
      name: 'Upload'
    });


    // ------------------------------------------------------------
    // Success / Confirmation
    // ------------------------------------------------------------

    this.successMessage = page.getByRole('paragraph');

    this.okButton = page.getByRole('button', {
      name: 'Ok'
    });


    // ------------------------------------------------------------
    // Vehicle Table
    // ------------------------------------------------------------

    this.vehicleTableBody = page.locator('tbody');


    // ------------------------------------------------------------
    // Edit
    // ------------------------------------------------------------

    this.editButton = page.getByRole('img', {
      name: 'edit'
    });

    this.updateButton = page.getByRole('button', {
      name: 'Update'
    });


    // ------------------------------------------------------------
    // Delete
    // ------------------------------------------------------------

    this.deleteButton = page.getByRole('img', {
      name: 'delete'
    });

    this.yesButton = page.getByRole('button', {
      name: 'Yes'
    });

    this.deleteSuccessMessage = page.getByRole('alert', {
      name: 'Selected asset(s) deleted'
    });


    // ------------------------------------------------------------
    // Blacklist / Reinstate
    // ------------------------------------------------------------

    this.blacklistVehicleButton = page.getByRole('button', {
      name: 'Blacklist vehicle'
    });

    this.reinstateVehicleButton = page.getByRole('button', {
      name: 'Reinstate vehicle'
    });

    this.selectVehicleLink = page.locator('span').filter({
      hasText: 'Select Vehicle'
    });

    // One card per vehicle in the "Select Vehicle" drawer
    this.vehicleDrawerItems = page.locator('.technician-list').filter({
      visible: true
    });

    this.selectButton = page.getByRole('button', {
      name: 'Select',
      exact: true
    });

    this.blacklistReasonInput = page.getByRole('textbox', {
      name: 'Write a reason for Blacklist'
    });

    this.reinstateReasonInput = page.getByRole('textbox', {
      name: 'Write a reason for Reinstate'
    });

    this.submitButton = page.getByRole('button', {
      name: 'Submit',
      exact: true
    });

    this.confirmBlacklistButton = page.getByRole('button', {
      name: 'Yes, Blacklist this vehicle'
    });

    this.confirmReinstateButton = page.getByRole('button', {
      name: 'Yes, Reinstate this vehicle'
    });
  }


  // ============================================================
  // NAVIGATION
  // ============================================================

  async navigateToVehicles(): Promise<void> {

    await expect(
      this.assetManagementMenu
    ).toBeVisible({
      timeout: 15000
    });

    await this.assetManagementMenu.click();

    await expect(
      this.vehicleMenu
    ).toBeVisible({
      timeout: 10000
    });

    await this.vehicleMenu.click();

    await expect(
      this.searchInput
    ).toBeVisible({
      timeout: 15000
    });

    // App keeps old search text across navigation
    await this.clearSearch();

    console.log('✅ Vehicle page opened');
  }


  // ============================================================
  // CLEAR SEARCH
  // "Vehicle Onboard" button is hidden while a search returns
  // no vehicles, so the search must be cleared before onboarding
  // ============================================================

  async clearSearch(): Promise<void> {

    if (await this.searchInput.inputValue()) {

      await this.searchInput.clear();
      await this.searchInput.press('Enter');
    }

    await expect(
      this.vehicleOnboardButton
    ).toBeVisible({
      timeout: 15000
    });
  }


  // ============================================================
// CHECK WHETHER VEHICLE EXISTS
// ============================================================

async vehicleExists(vehicleNumber: string): Promise<boolean> {

  await this.searchInput.fill(vehicleNumber);
  await this.searchInput.press('Enter');
  await this.page.waitForTimeout(500);

  const row = this.vehicleTableBody
    .getByRole('row')
    .filter({
      hasText: vehicleNumber
    });

  // Wait for the search result instead of reading the table too early
  await expect(
    row.or(this.page.getByText('No data available.'))
  ).toBeVisible({
    timeout: 10000
  });

  return await row.count() > 0;
}


// ============================================================
// GET AVAILABLE VEHICLE NUMBER
// ============================================================

async getAvailableVehicleNumber(): Promise<string> {

  for (let i = 1; i <= 9999; i++) {

    const vehicleNumber =
      `TN10BF${String(i).padStart(4, '0')}`;

    const exists =
      await this.vehicleExists(vehicleNumber);

    if (!exists) {

      console.log(
        `✅ Available vehicle number: ${vehicleNumber}`
      );

      // Bring back the "Vehicle Onboard" button
      await this.clearSearch();

      return vehicleNumber;
    }
  }

  throw new Error(
    '❌ No available vehicle registration number found'
  );
}


  // ============================================================
  // CREATE VEHICLE
  // ============================================================

  async createVehicle(
    vehicleNumber: string,
    vinNumber: string
  ): Promise<void> {

    await this.vehicleOnboardButton.click();

    await expect(
      this.oemNameDropdown
    ).toBeVisible({
      timeout: 10000
    });

    // OEM
    await this.oemNameDropdown.selectOption('acme');

    // Vehicle Type
    await this.vehicleTypeDropdown.selectOption('4W');

    // Registration Number
    await this.vehicleNumberInput.fill(vehicleNumber);

    //await this.vehicleNumberInput.press('Tab');

    await this.vinInput.fill(vinNumber);

    // Year
    await this.manufacturerYearDropdown.selectOption('2026');

    // Upload
    await this.uploadButton.click();

    // Success message
    await expect(
      this.successMessage
    ).toContainText(
      'Vehicle has been onboarded successfully.',
      {
        timeout: 15000
      }
    );

    await this.okButton.click();

    console.log(
      `✅ Vehicle created: ${vehicleNumber}`
    );
  }


  // ============================================================
  // EDIT VEHICLE
  // ============================================================

  async editVehicle(
    vehicleNumber: string
  ): Promise<void> {

    // Find the exact vehicle row
    const row = this.vehicleTableBody
      .getByRole('row')
      .filter({
        hasText: vehicleNumber
      });

    await expect(row).toBeVisible({
      timeout: 10000
    });

    console.log(
      `✏️ Editing vehicle: ${vehicleNumber}`
    );

    // Click edit only inside this vehicle row
    await row.getByRole('img', {
      name: 'edit'
    }).click();

    // The form fills in the saved vehicle after it opens and can
    // reset anything chosen before that, so wait for the saved
    // values and pick the year again until Update is enabled
    await expect(
      this.vehicleNumberInput
    ).toHaveValue(vehicleNumber, {
      timeout: 15000
    });

    // Change year from 2026 → 2025
    await expect(async () => {

      await this.manufacturerYearDropdown.selectOption('2025');

      await expect(
        this.updateButton
      ).toBeEnabled({
        timeout: 2000
      });
    }).toPass({
      timeout: 20000
    });

    // Update
    await this.updateButton.click();


    // Verify update
    await expect(
      this.successMessage
    ).toContainText(
      'Vehicle has been updated successfully!',
      {
        timeout: 15000
      }
    );

    console.log(
      `✅ Vehicle updated: ${vehicleNumber}`
    );

    await this.okButton.click();
  }


  // ============================================================
  // DELETE VEHICLE
  // ============================================================

  async deleteVehicle(
    vehicleNumber: string
  ): Promise<void> {

    // Find exact vehicle row
    const row = this.vehicleTableBody
      .getByRole('row')
      .filter({
        hasText: vehicleNumber
      });

    await expect(row).toBeVisible({
      timeout: 10000
    });

    console.log(
      `🗑️ Deleting vehicle: ${vehicleNumber}`
    );

    // Click delete only for this vehicle
    await row.getByRole('img', {
      name: 'delete'
    }).click();

    // Confirm deletion
    await expect(
      this.yesButton
    ).toBeVisible({
      timeout: 10000
    });

    await this.yesButton.click();

    // Verify deletion
    await expect(
      this.deleteSuccessMessage
    ).toContainText(
      'Selected asset(s) deleted successfully',
      {
        timeout: 15000
      }
    );

    console.log(
      `✅ Vehicle deleted: ${vehicleNumber}`
    );
  }


  // ============================================================
  // SELECT VEHICLE IN DRAWER
  // The drawer's "Search by VIN" box does not filter the list,
  // so the card is found by its registration number
  // ============================================================

  private async selectVehicleInDrawer(
    vehicleNumber: string
  ): Promise<void> {

    await this.selectVehicleLink.click();

    const item = this.vehicleDrawerItems.filter({
      has: this.page.getByText(vehicleNumber, {
        exact: true
      })
    });

    await expect(
      item
    ).toHaveCount(1, {
      timeout: 15000
    });

    await item.getByRole('checkbox').check();

    await this.selectButton.click();

    await expect(
      this.selectButton
    ).toBeHidden({
      timeout: 10000
    });
  }


  // ============================================================
  // BLACKLIST VEHICLE
  // ============================================================

  async blacklistVehicle(
    vehicleNumber: string,
    reason: string
  ): Promise<void> {

    await this.blacklistVehicleButton.click();

    await this.selectVehicleInDrawer(
      vehicleNumber
    );

    await this.blacklistReasonInput.fill(
      reason
    );

    await this.submitButton.click();

    await this.confirmBlacklistButton.click();

    await expect(
      this.page.getByRole('alert').filter({
        hasText: 'Vehicle is blacklisted successfully'
      })
    ).toBeVisible({
      timeout: 15000
    });

    console.log(
      `✅ Vehicle blacklisted: ${vehicleNumber}`
    );
  }


  // ============================================================
  // REINSTATE VEHICLE
  // Only blacklisted vehicles are listed in the drawer
  // ============================================================

  async reinstateVehicle(
    vehicleNumber: string,
    reason: string
  ): Promise<void> {

    await this.reinstateVehicleButton.click();

    await this.selectVehicleInDrawer(
      vehicleNumber
    );

    await this.reinstateReasonInput.fill(
      reason
    );

    await this.submitButton.click();

    await this.confirmReinstateButton.click();

    await expect(
      this.page.getByRole('alert').filter({
        hasText: 'Vehicle is re-instated successfully'
      })
    ).toBeVisible({
      timeout: 15000
    });

    console.log(
      `✅ Vehicle reinstated: ${vehicleNumber}`
    );
  }


  // ============================================================
  // VERIFY BLACKLIST STATE
  // The State column shows "Blacklisted" or "--"
  // ============================================================

  async verifyBlacklisted(
    vehicleNumber: string,
    blacklisted: boolean
  ): Promise<void> {

    await expect(
      this.searchInput
    ).toBeVisible({
      timeout: 15000
    });

    await this.searchInput.fill(vehicleNumber);
    await this.searchInput.press('Enter');

    const row = this.vehicleTableBody
      .getByRole('row')
      .filter({
        hasText: vehicleNumber
      });

    await expect(row).toBeVisible({
      timeout: 15000
    });

    if (blacklisted) {
      await expect(row).toContainText('Blacklisted');
    } else {
      await expect(row).not.toContainText('Blacklisted');
    }

    // Bring back the full list for the next step
    await this.clearSearch();

    console.log(
      `✅ Vehicle ${vehicleNumber} blacklisted: ${blacklisted}`
    );
  }
}