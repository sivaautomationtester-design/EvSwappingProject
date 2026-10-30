import { expect, Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

export type ChecklistData = {
  name: string;
  category: string;
  subCategory: string;
  issue: string;
  assetModel: string;
  parameter: string;
  parameterType: string;
  timeInMins: string;
  status: string;
};

export class ChecklistPage extends BasePage {

  // ============================================================
  // Navigation
  // ============================================================

  private readonly workflowManagementLink: Locator;
  private readonly checklistsLink: Locator;
  private readonly createChecklistIcon: Locator;
  private readonly manageChecklistsText: Locator;

  // ============================================================
  // Checklist Details
  // ============================================================

  private readonly checklistNameInput: Locator;
  private readonly categorySelect: Locator;
  private readonly subCategorySelect: Locator;
  private readonly issueSelect: Locator;
  private readonly assetModelDropdown: Locator;
  private readonly assetModelButton: Locator;

  // ============================================================
  // Parameters
  // ============================================================

  private readonly addParametersButton: Locator;
  private readonly parameterInput: Locator;
  private readonly parameterTypeSelect: Locator;
  private readonly timeInMinsInput: Locator;
  private readonly singleChoiceRadio: Locator;
  private readonly statusInput: Locator;
  private readonly okButton: Locator;

  // ============================================================
  // Status Mapping
  // ============================================================

  private readonly addStatusButton: Locator;
  private readonly statusSelect: Locator;

  // ============================================================
  // Common
  // ============================================================

  private readonly nextButton: Locator;
  private readonly submitButton: Locator;
  private readonly confirmYesButton: Locator;

  // ============================================================
  // View
  // ============================================================

  private readonly checklistDetails: Locator;

  // ============================================================
  // Constructor
  // ============================================================

  constructor(page: Page) {

    super(page);

    // ============================================================
    // Navigation
    // ============================================================

    this.workflowManagementLink = page.getByRole('link', {
      name: /Workflow Management/
    }).first();

    this.checklistsLink = page.getByRole('link', {
      name: 'Checklists'
    });

    // The app labels the "create checklist" icon as "view icon"
    this.createChecklistIcon = page.getByRole('img', {
      name: 'view icon'
    });

    this.manageChecklistsText = page.getByText('Manage Checklists', {
      exact: true
    });

    // ============================================================
    // Checklist Details
    // ============================================================

    this.checklistNameInput = page.getByRole('textbox', {
      name: 'Enter checklist name'
    });

    // Dropdowns have no accessible name, so they are picked by order
    this.categorySelect = page.getByRole('combobox').nth(0);
    this.subCategorySelect = page.getByRole('combobox').nth(1);
    this.issueSelect = page.getByRole('combobox').nth(2);

    // ng-multiselect-dropdown: every model is a checkbox in a list
    this.assetModelDropdown = page.locator(
      'ng-multiselect-dropdown[formcontrolname="assetType"]'
    );

    this.assetModelButton = this.assetModelDropdown.locator('.dropdown-btn');

    // ============================================================
    // Parameters
    // ============================================================

    this.addParametersButton = page.getByRole('button', {
      name: 'Add parameters'
    });

    this.parameterInput = page.getByRole('textbox', {
      name: 'Enter parameter'
    });

    this.parameterTypeSelect = page.getByRole('combobox').nth(3);

    this.timeInMinsInput = page.getByRole('textbox', {
      name: 'Enter Time in mins'
    });

    this.singleChoiceRadio = page.getByRole('radio', {
      name: 'Single Choice'
    });

    this.statusInput = page.getByRole('textbox', {
      name: 'Enter status'
    });

    this.okButton = page.getByRole('button', {
      name: 'OK'
    });

    // ============================================================
    // Status Mapping
    // ============================================================

    this.addStatusButton = page.getByRole('button', {
      name: '+ Add'
    });

    this.statusSelect = page.getByRole('combobox').nth(1);

    // ============================================================
    // Common
    // ============================================================

    this.nextButton = page.getByRole('button', {
      name: 'Next'
    });

    this.submitButton = page.getByRole('button', {
      name: 'Submit'
    });

    this.confirmYesButton = page.getByRole('button', {
      name: 'Yes'
    });

    // ============================================================
    // View
    // ============================================================

    this.checklistDetails = page.locator('app-checklist-detail');
  }

  // ============================================================
  // NAVIGATE TO CHECKLISTS
  // ============================================================

  async navigateToChecklists(): Promise<void> {

    // Clicking the parent menu again would collapse it
    if (!(await this.checklistsLink.isVisible())) {

      await expect(
        this.workflowManagementLink
      ).toBeVisible({
        timeout: 15000
      });

      await this.workflowManagementLink.click();
    }

    await this.checklistsLink.click();

    await expect(
      this.createChecklistIcon
    ).toBeVisible({
      timeout: 15000
    });

    console.log('✅ Checklists page opened');
  }

  // ============================================================
  // ADD CHECKLIST DETAILS
  // ============================================================

  async addChecklistDetails(
    data: ChecklistData
  ): Promise<void> {

    await this.fill(
      this.checklistNameInput,
      data.name
    );

    await this.categorySelect.selectOption(
      data.category
    );

    await this.subCategorySelect.selectOption(
      data.subCategory
    );

    await this.issueSelect.selectOption(
      data.issue
    );

    await this.selectAssetModel(
      data.assetModel
    );
  }

  // ============================================================
  // SELECT ASSET MODEL
  // ============================================================

  async selectAssetModel(
    assetModel: string
  ): Promise<void> {

    // Some models are listed more than once, any of them will do
    const modelItem = this.assetModelDropdown.locator('li').filter({
      has: this.page.getByRole('checkbox', {
        name: assetModel,
        exact: true
      })
    }).first();

    const modelCheckbox = modelItem.getByRole('checkbox');

    await this.assetModelButton.click();

    await expect(
      modelCheckbox
    ).toBeAttached({
      timeout: 10000
    });

    // The library toggles the item on the <li> click, not on the input
    await modelItem.click();

    await expect(
      modelCheckbox
    ).toBeChecked();

    // Close the list so it doesn't cover the parameters section
    await this.assetModelButton.click();

    await expect(
      this.assetModelButton
    ).toContainText(
      assetModel
    );

    console.log(`✅ Asset model selected: ${assetModel}`);
  }

  // ============================================================
  // ADD PARAMETER
  // ============================================================

  async addParameter(
    data: ChecklistData
  ): Promise<void> {

    await this.addParametersButton.click();

    await this.fill(
      this.parameterInput,
      data.parameter
    );

    await this.parameterTypeSelect.selectOption(
      data.parameterType
    );

    await this.timeInMinsInput.fill(
      data.timeInMins
    );

    await this.singleChoiceRadio.check();

    await this.statusInput.fill(
      data.status
    );

    await this.okButton.click();

    await this.submitButton.click();
  }

  // ============================================================
  // MAP STATUS
  // ============================================================

  async mapStatus(
    status: string
  ): Promise<void> {

    await this.addStatusButton.click();

    await this.statusSelect.selectOption(
      status
    );
  }

  // ============================================================
  // SUBMIT CHECKLIST
  // ============================================================

  async submitChecklist(
    successMessage: string
  ): Promise<void> {

    await this.submitButton.click();

    await this.confirmYesButton.click();

    await expect(
      this.page.getByRole('alert').filter({
        hasText: successMessage
      })
    ).toBeVisible({
      timeout: 10000
    });

    // Wait for success popup to disappear
    await this.waitForPopupsToClose(false);
  }

  // ============================================================
  // CHECKLIST CARD
  // ============================================================

  // The app shows checklist names in lowercase, so match ignoring case
  private nameMatcher(
    checklistName: string,
    exact: boolean = true
  ): RegExp {

    const escaped = checklistName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    return new RegExp(exact ? `^\\s*${escaped}\\s*$` : escaped, 'i');
  }

  // Checklists are listed as cards (not a table). Every ancestor
  // of the card also matches, so .last() picks the innermost one.
  private checklistRow(
    checklistName: string
  ): Locator {

    return this.page.locator('main div').filter({
      has: this.page.getByText(this.nameMatcher(checklistName))
    }).filter({
      has: this.page.getByRole('img', { name: 'View' })
    }).last();
  }

  // ============================================================
  // CREATE CHECKLIST
  // ============================================================

  async createChecklist(
    data: ChecklistData
  ): Promise<void> {

    // 1. Navigate to Checklists
    await this.navigateToChecklists();

    // 2. Open Create Checklist
    await this.createChecklistIcon.click();

    // 3. Checklist Details
    await this.addChecklistDetails(
      data
    );

    // 4. Parameters
    await this.addParameter(
      data
    );

    await this.nextButton.click();

    // 5. Status Mapping
    await this.mapStatus(
      data.status
    );

    await this.nextButton.click();

    // 6. Submit
    await this.submitChecklist(
      'Checklist created successfully'
    );

    console.log(`✅ Checklist created: ${data.name}`);
  }

  // ============================================================
  // VIEW CHECKLIST
  // ============================================================

  async viewChecklist(
    checklistName: string
  ): Promise<void> {

    await this.navigateToChecklists();

    await this.checklistRow(checklistName).getByRole('img', {
      name: 'View'
    }).click();

    await expect(
      this.checklistDetails
    ).toContainText(
      this.nameMatcher(checklistName, false),
      { timeout: 10000 }
    );

    await this.manageChecklistsText.click();

    console.log(`✅ Checklist details verified: ${checklistName}`);
  }

  // ============================================================
  // EDIT CHECKLIST
  // ============================================================

  async editChecklist(
    checklistName: string,
    updatedName: string
  ): Promise<void> {

    await this.navigateToChecklists();

    await this.checklistRow(checklistName).getByRole('img', {
      name: 'Edit'
    }).click();

    // The form loads the saved checklist in steps after it opens and
    // can overwrite anything typed before that, so wait for the
    // parameters too and re-type until the new name sticks
    await expect(
      this.checklistNameInput
    ).toHaveValue(
      this.nameMatcher(checklistName),
      { timeout: 15000 }
    );

    await expect(
      this.page.getByText('Parameter 1')
    ).toBeVisible({
      timeout: 15000
    });

    await expect(async () => {

      await this.checklistNameInput.fill(
        updatedName
      );

      await this.page.waitForTimeout(1000);

      await expect(
        this.checklistNameInput
      ).toHaveValue(
        updatedName,
        { timeout: 0 }
      );
    }).toPass({
      timeout: 15000
    });

    // Parameters and status mapping unchanged
    await this.nextButton.click();

    await expect(
      this.addStatusButton
    ).toBeVisible({
      timeout: 10000
    });

    await this.nextButton.click();

    await this.submitChecklist(
      'Checklist updated successfully'
    );

    await expect(
      this.checklistRow(updatedName)
    ).toBeVisible({
      timeout: 15000
    });

    console.log(`✅ Checklist updated: ${updatedName}`);
  }

  // ============================================================
  // DELETE CHECKLIST
  // ============================================================

  async deleteChecklist(
    checklistName: string
  ): Promise<void> {

    await this.navigateToChecklists();

    // Deletes straight away, the app shows no confirmation dialog
    await this.checklistRow(checklistName).getByRole('img', {
      name: 'Delete'
    }).click();

    await expect(
      this.page.getByRole('alert').filter({
        hasText: 'Checklist deleted successfully'
      })
    ).toBeVisible({
      timeout: 10000
    });

    await expect(
      this.checklistRow(checklistName)
    ).toHaveCount(0, {
      timeout: 15000
    });

    // Wait for success popup to disappear
    await this.waitForPopupsToClose(false);

    console.log(`✅ Checklist deleted: ${checklistName}`);
  }
}
