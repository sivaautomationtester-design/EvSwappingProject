import { expect, Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

export type TicketData = {
  category: string;
  subCategory: string;
  issue: string;
  assetId: string;
  description: string;
  location: string;
};

export type TicketTab = 'Open' | 'In Progress' | 'Closed';

export class TicketPage extends BasePage {

  // ============================================================
  // Navigation
  // ============================================================

  private readonly workflowManagementLink: Locator;
  private readonly ticketsLink: Locator;

  // ============================================================
  // Dashboard
  // ============================================================

  private readonly createTicketIcon: Locator;
  private readonly assignTicketsIcon: Locator;
  private readonly searchTicketInput: Locator;

  // ============================================================
  // Create Ticket
  // ============================================================

  private readonly categorySelect: Locator;
  private readonly subCategorySelect: Locator;
  private readonly issueSelect: Locator;
  private readonly assetIdInput: Locator;
  private readonly descriptionInput: Locator;
  private readonly mapIcon: Locator;
  private readonly searchLocationInput: Locator;
  private readonly locationSuggestion: Locator;
  private readonly addLocationButton: Locator;
  private readonly locationInput: Locator;

  // ============================================================
  // Ticket Detail
  // ============================================================

  private readonly ticketDetail: Locator;
  private readonly assignLink: Locator;
  private readonly closeLink: Locator;
  private readonly closeConfirmButton: Locator;
  private readonly closeDescriptionInput: Locator;

  // ============================================================
  // Technician Selection
  // ============================================================

  private readonly searchTechnicianInput: Locator;
  private readonly selectTechnicianButton: Locator;
  private readonly confirmAssignButton: Locator;

  // ============================================================
  // Bulk Assign
  // ============================================================

  private readonly addTicketButton: Locator;
  private readonly selectTicketsDrawer: Locator;
  private readonly bulkSearchTechnicianInput: Locator;

  // ============================================================
  // Common
  // ============================================================

  private readonly nextButton: Locator;
  private readonly submitButton: Locator;
  private readonly toast: Locator;

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

    this.ticketsLink = page.getByRole('link', {
      name: 'Tickets',
      exact: true
    });

    // ============================================================
    // Dashboard
    // ============================================================

    // The app labels the "Create ticket" quick action as "view icon"
    this.createTicketIcon = page.getByRole('complementary').getByRole('img', {
      name: 'view icon'
    });

    this.assignTicketsIcon = page.getByRole('img', {
      name: 'assign icon',
      exact: true
    });

    // The "Select tickets" drawer has a search box with the same
    // placeholder; the dashboard one comes first
    this.searchTicketInput = page.getByRole('textbox', {
      name: 'Search ticket ID'
    }).first();

    // ============================================================
    // Create Ticket
    // ============================================================

    // Dropdowns have no accessible name, so they are picked by order
    this.categorySelect = page.getByRole('combobox').nth(0);
    this.subCategorySelect = page.getByRole('combobox').nth(1);
    this.issueSelect = page.getByRole('combobox').nth(2);

    this.assetIdInput = page.getByRole('textbox', {
      name: 'Enter asset id'
    });

    this.descriptionInput = page.getByRole('textbox', {
      name: 'Enter Description'
    });

    // Map icon next to the location field
    this.mapIcon = page.locator('#page-content-wrapper svg');

    this.searchLocationInput = page.getByRole('textbox', {
      name: 'Search location'
    });

    // Google Places suggestions
    this.locationSuggestion = page.locator('.pac-item').filter({
      visible: true
    }).first();

    this.addLocationButton = page.getByRole('button', {
      name: 'Add'
    });

    this.locationInput = page.getByRole('textbox', {
      name: 'Pin point your location from map'
    });

    // ============================================================
    // Ticket Detail
    // ============================================================

    this.ticketDetail = page.locator('app-open-ticket');

    this.assignLink = this.ticketDetail.getByText('Assign', {
      exact: true
    });

    this.closeLink = this.ticketDetail.locator('span').filter({
      hasText: /^\s*Close\s*$/
    });

    this.closeConfirmButton = page.getByRole('button', {
      name: 'Close',
      exact: true
    });

    this.closeDescriptionInput = page.getByRole('textbox', {
      name: 'enter description'
    });

    // ============================================================
    // Technician Selection
    // ============================================================

    this.searchTechnicianInput = page.getByRole('textbox', {
      name: 'Search technician name'
    });

    this.selectTechnicianButton = page.getByRole('button', {
      name: 'Select'
    });

    this.confirmAssignButton = page.getByRole('button', {
      name: 'Yes, assign'
    });

    // ============================================================
    // Bulk Assign
    // ============================================================

    this.addTicketButton = page.getByRole('button', {
      name: 'Add ticket'
    });

    // The ticket filter panel uses the same class
    this.selectTicketsDrawer = page.locator('.filter-body').filter({
      hasText: 'Select tickets'
    });

    this.bulkSearchTechnicianInput = page.getByPlaceholder('Search', {
      exact: true
    });

    // ============================================================
    // Common
    // ============================================================

    this.nextButton = page.getByRole('button', {
      name: 'Next'
    });

    this.submitButton = page.getByRole('button', {
      name: 'Submit'
    }).filter({ visible: true });

    this.toast = page.locator('#toast-container');
  }

  // ============================================================
  // NAVIGATE TO TICKETS
  // ============================================================

  async navigateToTickets(): Promise<void> {

    // From a ticket detail page the sidebar link does nothing,
    // only the "Tickets" breadcrumb goes back
    if (await this.ticketDetail.isVisible()) {

      await this.ticketDetail.getByText('Tickets', {
        exact: true
      }).click();

    } else {
      await this.openTicketsFromMenu();
    }

    await expect(
      this.assignTicketsIcon
    ).toBeVisible({
      timeout: 15000
    });

    console.log('✅ Tickets page opened');
  }

  private async openTicketsFromMenu(): Promise<void> {

    // Clicking the parent menu again would collapse it
    if (!(await this.ticketsLink.isVisible())) {

      await expect(
        this.workflowManagementLink
      ).toBeVisible({
        timeout: 15000
      });

      await this.workflowManagementLink.click();
    }

    await this.ticketsLink.click();
  }

  // ============================================================
  // EXPECT TOAST
  // ============================================================

  private async expectToast(
    message: string
  ): Promise<void> {

    await expect(
      this.toast
    ).toContainText(
      message,
      { timeout: 15000 }
    );
  }

  // ============================================================
  // TICKET CARD
  // ============================================================

  // Every ancestor of the card also matches, so .last() picks the
  // innermost one
  private ticketCard(
    ticketId: string
  ): Locator {

    return this.page.locator('main div').filter({
      has: this.page.getByText(ticketId, { exact: true })
    }).filter({
      has: this.page.getByRole('img', { name: 'view icon' })
    }).last();
  }

  // ============================================================
  // SELECT TECHNICIAN
  // Each technician is a radio next to a card with their name
  // ============================================================

  private async selectTechnician(
    searchInput: Locator,
    technicianName: string
  ): Promise<void> {

    await searchInput.fill(
      technicianName
    );

    await searchInput.press('Enter');

    const technicianRow = this.page.locator('.technician-list').filter({
      has: this.page.getByText(technicianName, { exact: true })
    }).first();

    await expect(
      technicianRow
    ).toBeVisible({
      timeout: 10000
    });

    await technicianRow.getByRole('radio').check();
  }

  // ============================================================
  // SELECT LOCATION
  // ============================================================

  private async selectLocation(
    location: string
  ): Promise<void> {

    await this.mapIcon.click();

    await expect(
      this.searchLocationInput
    ).toBeVisible({
      timeout: 10000
    });

    // Google autocomplete only reacts to real typing, and "Add" stays
    // disabled until a suggestion is picked
    await expect(async () => {

      await this.searchLocationInput.clear();

      await this.searchLocationInput.pressSequentially(
        location,
        { delay: 80 }
      );

      await expect(
        this.locationSuggestion
      ).toBeVisible({
        timeout: 5000
      });
    }).toPass({
      timeout: 30000
    });

    await this.locationSuggestion.click();

    await expect(
      this.addLocationButton
    ).toBeEnabled({
      timeout: 10000
    });

    await this.addLocationButton.click();

    await expect(
      this.locationInput
    ).not.toHaveValue('');
  }

  // ============================================================
  // CREATE TICKET
  // Returns the new ticket ID (e.g. T-4FFB277019)
  // ============================================================

  async createTicket(
    data: TicketData
  ): Promise<string> {

    await this.navigateToTickets();

    await this.createTicketIcon.click();

    await expect(
      this.assetIdInput
    ).toBeVisible({
      timeout: 10000
    });

    await this.categorySelect.selectOption(
      data.category
    );

    await this.subCategorySelect.selectOption(
      data.subCategory
    );

    await this.issueSelect.selectOption(
      data.issue
    );

    await this.assetIdInput.fill(
      data.assetId
    );

    await this.descriptionInput.fill(
      data.description
    );

    await this.selectLocation(
      data.location
    );

    // The new ticket ID is only returned by the API
    const createResponse = this.page.waitForResponse(
      response => response.url().includes('/api/create-ticket'),
      { timeout: 30000 }
    );

    await this.submitButton.click();

    const body = await (await createResponse).json();

    expect(
      body.success,
      `Create ticket failed: ${JSON.stringify(body)}`
    ).toBe(true);

    await this.expectToast(
      'Ticket created successfully'
    );

    const ticketId: string = body.ourTicketId;

    console.log(`✅ Ticket created: ${ticketId}`);

    return ticketId;
  }

  // ============================================================
  // FIND TICKET IN TAB
  // ============================================================

  async findTicket(
    ticketId: string,
    tab: TicketTab
  ): Promise<void> {

    // Tabs are only on the dashboard, not on the ticket detail page
    await this.navigateToTickets();

    // A ticket can take a few seconds to move to its new tab after
    // an assign, so search again until it shows
    await expect(async () => {

      await this.page.getByRole('button', {
        name: tab,
        exact: true
      }).click();

      // The search text is kept when switching tabs
      await this.searchTicketInput.fill(
        ticketId
      );

      await this.searchTicketInput.press('Enter');

      await expect(
        this.ticketCard(ticketId)
      ).toBeVisible({
        timeout: 5000
      });
    }).toPass({
      timeout: 30000
    });

    console.log(`✅ Ticket ${ticketId} found in ${tab}`);
  }

  // ============================================================
  // OPEN TICKET
  // ============================================================

  private async openTicket(
    ticketId: string,
    tab: TicketTab
  ): Promise<void> {

    await this.findTicket(
      ticketId,
      tab
    );

    await this.ticketCard(ticketId).getByRole('img', {
      name: 'view icon'
    }).click();

    await expect(
      this.ticketDetail
    ).toContainText(
      `ID - ${ticketId}`,
      { timeout: 10000 }
    );
  }

  // ============================================================
  // ASSIGN TICKET (from ticket detail)
  // ============================================================

  async assignTicket(
    ticketId: string,
    technicianName: string
  ): Promise<void> {

    await this.openTicket(
      ticketId,
      'Open'
    );

    await this.assignLink.click();

    await this.selectTechnician(
      this.searchTechnicianInput,
      technicianName
    );

    await this.selectTechnicianButton.click();

    await this.confirmAssignButton.click();

    await this.expectToast(
      `Assigned ticket to ${technicianName}`
    );

    console.log(`✅ Ticket ${ticketId} assigned to ${technicianName}`);
  }

  // ============================================================
  // BULK ASSIGN TICKETS (Assign tickets quick action)
  // ============================================================

  async bulkAssignTickets(
    ticketIds: string[],
    technicianName: string
  ): Promise<void> {

    await this.navigateToTickets();

    await this.assignTicketsIcon.click();

    await this.addTicketButton.click();

    const drawerSearch = this.selectTicketsDrawer.getByPlaceholder(
      'Search ticket ID'
    );

    for (const ticketId of ticketIds) {

      await drawerSearch.fill(
        ticketId
      );

      await drawerSearch.press('Enter');

      await this.selectTicketsDrawer.locator('.tickets-list').filter({
        hasText: ticketId
      }).getByRole('checkbox').check();
    }

    await this.submitButton.click();

    // The ticket drawer has its own Submit button; wait until it has
    // closed so the technician step's Submit is the only one
    await expect(
      this.selectTicketsDrawer
    ).toBeHidden({
      timeout: 10000
    });

    await this.nextButton.click();

    await this.selectTechnician(
      this.bulkSearchTechnicianInput,
      technicianName
    );

    await this.submitButton.click();

    await this.confirmAssignButton.click();

    await this.expectToast(
      `Assigned ${ticketIds.length} tickets to ${technicianName}`
    );

    console.log(`✅ ${ticketIds.join(', ')} assigned to ${technicianName}`);
  }

  // ============================================================
  // CLOSE TICKET
  // ============================================================

  async closeTicket(
    ticketId: string,
    resolution: string
  ): Promise<void> {

    await this.openTicket(
      ticketId,
      'In Progress'
    );

    await this.closeLink.click();

    await this.closeConfirmButton.click();

    await this.closeDescriptionInput.fill(
      resolution
    );

    await this.submitButton.click();

    await this.expectToast(
      'Ticket closed successfully'
    );

    console.log(`✅ Ticket closed: ${ticketId}`);
  }
}
