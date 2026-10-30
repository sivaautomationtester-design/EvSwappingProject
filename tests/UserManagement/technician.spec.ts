import { test } from '../../fixtures/baseFixtures';
import { generateRandomLetters, generateTestId } from '../../utils/testdata';

test.describe.serial('Technician Management', () => {

  // ============================================================
  // DYNAMIC TEST DATA
  // Generated ONLY ONCE for the complete test flow
  // ============================================================

  const testId = generateTestId();

  //const randomLetters  = generateTestId();
  const randomLetters = generateRandomLetters(5);

  const phoneNumber = `99765${testId.slice(-5)}`;
  const technicianName = `Technician${randomLetters }`;
  const badgeNumber = `99${testId.slice(-13)}`;

  console.log('==========================================');
  console.log('TECHNICIAN TEST DATA');
  console.log('==========================================');
  console.log(`Phone Number : ${phoneNumber}`);
  console.log(`Name         : ${technicianName}`);
  console.log(`Badge Number : ${badgeNumber}`);
  console.log('==========================================');


  // ============================================================
  // CREATE TECHNICIAN
  // ============================================================

  test('Create Technician', async ({ technicianPage }) => {

    console.log('');
    console.log('==========================================');
    console.log('CREATE TECHNICIAN');
    console.log('==========================================');

    await technicianPage.createTechnician(
      phoneNumber,
      technicianName,
      badgeNumber,
      '560062',
      'India',
      'KARNATAKA',
      'BENGALURU URBAN',
      '101, Ganapathipura, Konankunte'
    );

    await technicianPage.submitTechnician();
    
    await technicianPage.verifyTechnicianCreated();

    console.log('✅ Create Technician completed');
  });


  // ============================================================
  // VIEW TECHNICIAN
  // ============================================================

  test('View Technician', async ({ technicianPage }) => {

    console.log('');
    console.log('==========================================');
    console.log('VIEW TECHNICIAN');
    console.log('==========================================');

    await technicianPage.viewTechnician();

    console.log('✅ View Technician completed');
  });


  // ============================================================
  // EDIT TECHNICIAN
  // ============================================================

  test('Edit Technician', async ({ technicianPage }) => {

    console.log('');
    console.log('==========================================');
    console.log('EDIT TECHNICIAN');
    console.log('==========================================');

    await technicianPage.editTechnician(
      'KARNATAKA',
      'BALLARI'
    );

    await technicianPage.submitTechnicianUpdate();

    console.log('✅ Edit Technician completed');
  });

});