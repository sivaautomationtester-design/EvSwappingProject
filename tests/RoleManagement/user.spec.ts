import { test } from '../../fixtures/baseFixtures';
import { generateRandomLetters, generateTestId } from '../../utils/testdata';

test.describe.serial('User Management', () => {

  // ============================================================
  // DYNAMIC TEST DATA
  // Generated ONLY ONCE for the complete test flow
  // ============================================================

  const testId = generateTestId();
  const randomLetters = generateRandomLetters(5);

  const roleName = `UsersRole${randomLetters}`;
  const phoneNumber = `98688${testId.slice(-5)}`;
  const email = `user${phoneNumber}@example.com`;
  const userName = `User${randomLetters}`;

  console.log('==========================================');
  console.log('USER TEST DATA');
  console.log('==========================================');
  console.log(`Role Name    : ${roleName}`);
  console.log(`Phone Number : ${phoneNumber}`);
  console.log(`Email        : ${email}`);
  console.log(`Name         : ${userName}`);
  console.log('==========================================');


  // ============================================================
  // CREATE ROLE (to assign to the user)
  // ============================================================

  test('Create Role for User', async ({ rolePage }) => {

    console.log('');
    console.log('==========================================');
    console.log('CREATE ROLE FOR USER');
    console.log('==========================================');

    await rolePage.createRole(
      roleName,
      roleName
    );

    console.log('✅ Create Role for User completed');
  });


  // ============================================================
  // CREATE USER
  // ============================================================

  test('Create User', async ({ userPage }) => {

    console.log('');
    console.log('==========================================');
    console.log('CREATE USER');
    console.log('==========================================');

    await userPage.createUser(
      phoneNumber,
      email,
      userName
    );

    console.log('✅ Create User completed');
  });


  // ============================================================
  // ASSIGN ROLE
  // ============================================================

  test('Assign Role to User', async ({ userPage }) => {

    console.log('');
    console.log('==========================================');
    console.log('ASSIGN ROLE TO USER');
    console.log('==========================================');

    await userPage.assignRole(
      roleName
    );

    console.log('✅ Assign Role to User completed');
  });


  // ============================================================
  // UNASSIGN ROLE
  // ============================================================

  test('Unassign Role from User', async ({ userPage }) => {

    console.log('');
    console.log('==========================================');
    console.log('UNASSIGN ROLE FROM USER');
    console.log('==========================================');

    await userPage.unassignRole();

    console.log('✅ Unassign Role from User completed');
  });


  // ============================================================
  // DELETE USER
  // ============================================================

  test('Delete User', async ({ userPage }) => {

    console.log('');
    console.log('==========================================');
    console.log('DELETE USER');
    console.log('==========================================');

    await userPage.deleteUser(
      userName
    );

    console.log('✅ Delete User completed');
  });


  // ============================================================
  // DELETE ROLE (cleanup)
  // ============================================================

  test('Delete Role for User', async ({ rolePage }) => {

    console.log('');
    console.log('==========================================');
    console.log('DELETE ROLE FOR USER');
    console.log('==========================================');

    await rolePage.navigateToRoleManagement();

    await rolePage.deleteRole(
      roleName
    );

    console.log('✅ Delete Role for User completed');
  });

});
