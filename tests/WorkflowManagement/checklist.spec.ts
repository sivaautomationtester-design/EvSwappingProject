import { test } from '../../fixtures/baseFixtures';
import { generateRandomLetters } from '../../utils/testdata';
import { ChecklistData } from '../../pages/WorkflowManagement/ChecklistPage';

test.describe.serial('Workflow Management - Checklists', () => {

  // ============================================================
  // DYNAMIC TEST DATA
  // Generated ONLY ONCE for the complete test flow
  // ============================================================

  const randomLetters = generateRandomLetters(5);

  const checklist: ChecklistData = {
    name: `Checklist${randomLetters}`,
    category: 'Hardware',
    subCategory: 'Battery',
    issue: 'Battery draining fast',
    assetModel: 'BATTERY - laptop',
    parameter: `Parameter${randomLetters}`,
    parameterType: 'Visual',
    timeInMins: '10',
    status: 'status'
  };

  const updatedName = `${checklist.name}Updated`;

  console.log('==========================================');
  console.log('CHECKLIST TEST DATA');
  console.log('==========================================');
  console.log(`Checklist Name : ${checklist.name}`);
  console.log(`Updated Name   : ${updatedName}`);
  console.log('==========================================');


  // ============================================================
  // CREATE CHECKLIST
  // ============================================================

  test('Create Checklist', async ({ checklistPage }) => {

    console.log('');
    console.log('==========================================');
    console.log('CREATE CHECKLIST');
    console.log('==========================================');

    await checklistPage.createChecklist(
      checklist
    );

    console.log('✅ Create Checklist completed');
  });


  // ============================================================
  // VIEW CHECKLIST
  // ============================================================

  test('View Checklist', async ({ checklistPage }) => {

    console.log('');
    console.log('==========================================');
    console.log('VIEW CHECKLIST');
    console.log('==========================================');

    await checklistPage.viewChecklist(
      checklist.name
    );

    console.log('✅ View Checklist completed');
  });


  // ============================================================
  // EDIT CHECKLIST
  // ============================================================

  test('Edit Checklist', async ({ checklistPage }) => {

    console.log('');
    console.log('==========================================');
    console.log('EDIT CHECKLIST');
    console.log('==========================================');

    await checklistPage.editChecklist(
      checklist.name,
      updatedName
    );

    console.log('✅ Edit Checklist completed');
  });


  // ============================================================
  // DELETE CHECKLIST
  // ============================================================

  test('Delete Checklist', async ({ checklistPage }) => {

    console.log('');
    console.log('==========================================');
    console.log('DELETE CHECKLIST');
    console.log('==========================================');

    await checklistPage.deleteChecklist(
      updatedName
    );

    console.log('✅ Delete Checklist completed');
  });

});
