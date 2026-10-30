import { test } from '../../fixtures/baseFixtures';
import { generateRandomLetters } from '../../utils/testdata';

test.describe.serial('Role Management', () => {

  // ============================================================
  // DYNAMIC TEST DATA
  // Generated ONLY ONCE for the complete test flow
  // ============================================================

  const randomLetters = generateRandomLetters(5);

  const roleName = `Role${randomLetters}`;
  const description = `${roleName} description`;
  const updatedDescription = `${roleName} updated`;

  console.log('==========================================');
  console.log('ROLE TEST DATA');
  console.log('==========================================');
  console.log(`Role Name    : ${roleName}`);
  console.log('==========================================');


  // ============================================================
  // CREATE ROLE
  // ============================================================

  test('Create Role', async ({ rolePage }) => {

    console.log('');
    console.log('==========================================');
    console.log('CREATE ROLE');
    console.log('==========================================');

    await rolePage.createRole(
      roleName,
      description
    );

    console.log('✅ Create Role completed');
  });


  // ============================================================
  // EDIT ROLE
  // ============================================================

  test('Edit Role', async ({ rolePage }) => {

    console.log('');
    console.log('==========================================');
    console.log('EDIT ROLE');
    console.log('==========================================');

    await rolePage.editRole(
      roleName,
      updatedDescription
    );

    console.log('✅ Edit Role completed');
  });


  // ============================================================
  // VIEW ROLE
  // ============================================================

  test('View Role', async ({ rolePage }) => {

    console.log('');
    console.log('==========================================');
    console.log('VIEW ROLE');
    console.log('==========================================');

    await rolePage.viewRole(
      roleName
    );

    console.log('✅ View Role completed');
  });


  // ============================================================
  // DELETE ROLE
  // ============================================================

  test('Delete Role', async ({ rolePage }) => {

    console.log('');
    console.log('==========================================');
    console.log('DELETE ROLE');
    console.log('==========================================');

    await rolePage.deleteRole(
      roleName
    );

    console.log('✅ Delete Role completed');
  });

});
