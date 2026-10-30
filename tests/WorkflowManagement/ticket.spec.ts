import { test } from '../../fixtures/baseFixtures';
import { generateRandomLetters } from '../../utils/testdata';
import { TicketData } from '../../pages/WorkflowManagement/TicketPage';

test.describe.serial('Workflow Management - Tickets', () => {

  // ============================================================
  // TEST DATA
  // Ticket IDs are created by the app and set during the run
  // ============================================================

  const randomLetters = generateRandomLetters(5);

  const technicianName = 'fransadmins';

  const ticket: TicketData = {
    category: 'Hardware',
    subCategory: 'Battery',
    issue: 'Battery draining fast',
    assetId: 'Batdraining0001',
    description: `Ticket${randomLetters} battery draining fast`,
    location: 'mg road'
  };

  // Assigned from the ticket detail page
  let ticketId: string;

  // Assigned with the "Assign tickets" quick action
  let bulkTicketId: string;

  console.log('==========================================');
  console.log('TICKET TEST DATA');
  console.log('==========================================');
  console.log(`Description : ${ticket.description}`);
  console.log(`Technician  : ${technicianName}`);
  console.log('==========================================');


  // ============================================================
  // CREATE TICKET
  // ============================================================

  test('Create Ticket', async ({ ticketPage }) => {

    console.log('');
    console.log('==========================================');
    console.log('CREATE TICKET');
    console.log('==========================================');

    ticketId = await ticketPage.createTicket(
      ticket
    );

    await ticketPage.findTicket(
      ticketId,
      'Open'
    );

    console.log('✅ Create Ticket completed');
  });


  // ============================================================
  // ASSIGN TICKET
  // ============================================================

  test('Assign Ticket', async ({ ticketPage }) => {

    console.log('');
    console.log('==========================================');
    console.log('ASSIGN TICKET');
    console.log('==========================================');

    await ticketPage.assignTicket(
      ticketId,
      technicianName
    );

    await ticketPage.findTicket(
      ticketId,
      'In Progress'
    );

    console.log('✅ Assign Ticket completed');
  });


  // ============================================================
  // CLOSE TICKET
  // ============================================================

  test('Close Ticket', async ({ ticketPage }) => {

    console.log('');
    console.log('==========================================');
    console.log('CLOSE TICKET');
    console.log('==========================================');

    await ticketPage.closeTicket(
      ticketId,
      `${ticket.description} resolved`
    );

    await ticketPage.findTicket(
      ticketId,
      'Closed'
    );

    console.log('✅ Close Ticket completed');
  });


  // ============================================================
  // BULK ASSIGN TICKET
  // ============================================================

  test('Bulk Assign Ticket', async ({ ticketPage }) => {

    console.log('');
    console.log('==========================================');
    console.log('BULK ASSIGN TICKET');
    console.log('==========================================');

    bulkTicketId = await ticketPage.createTicket(
      ticket
    );

    await ticketPage.bulkAssignTickets(
      [bulkTicketId],
      technicianName
    );

    await ticketPage.findTicket(
      bulkTicketId,
      'In Progress'
    );

    console.log('✅ Bulk Assign Ticket completed');
  });


  // ============================================================
  // CLOSE BULK ASSIGNED TICKET
  // ============================================================

  test('Close Bulk Assigned Ticket', async ({ ticketPage }) => {

    console.log('');
    console.log('==========================================');
    console.log('CLOSE BULK ASSIGNED TICKET');
    console.log('==========================================');

    await ticketPage.closeTicket(
      bulkTicketId,
      `${ticket.description} resolved`
    );

    await ticketPage.findTicket(
      bulkTicketId,
      'Closed'
    );

    console.log('✅ Close Bulk Assigned Ticket completed');
  });

});
