import { test } from '../../fixtures/baseFixtures';
import { generateRandomLetters, generateTestId } from '../../utils/testdata';
import { DriverData } from '../../pages/User-Onboarding/DriverPage';

// Partner admin (Fleet admin + Franchisee) manages drivers; every
// change is checked from the tenant admin account as well.
// Partner login: latest company from company.spec.ts (admin email,
// tenant password) unless PARTNER_USERNAME is set in .env.
test.describe.serial('Partner Driver Management', () => {

  // ============================================================
  // DYNAMIC TEST DATA
  // Generated ONLY ONCE for the complete test flow
  // ============================================================

  const testId = generateTestId();
  const randomLetters = generateRandomLetters(5);

  const driver: DriverData = {
    phone: `98${testId.slice(-8)}`,
    name: `Driver${randomLetters}`,
    badgeNumber: `98${testId.slice(-8)}`,
    address: 'Ganapathipura road',
    pincode: '560062',
    state: 'KARNATAKA',
    city: 'BENGALURU URBAN',
    country: 'India'
  };

  const updatedBadgeNumber = `9869${testId.slice(-11)}`;
  const updatedPincode = '560064';

  console.log('==========================================');
  console.log('PARTNER DRIVER TEST DATA');
  console.log('==========================================');
  console.log(`Phone        : ${driver.phone}`);
  console.log(`Name         : ${driver.name}`);
  console.log(`Badge Number : ${driver.badgeNumber}`);
  console.log(`New Badge    : ${updatedBadgeNumber}`);
  console.log('==========================================');


  // ============================================================
  // ONBOARD DRIVER (partner)
  // ============================================================

  test('Partner - Onboard Driver', async ({ partnerDriverPage }) => {

    await partnerDriverPage.navigateToDrivers();

    await partnerDriverPage.onboardDriver(
      driver
    );

    await partnerDriverPage.verifyDriver(
      'phone',
      driver.phone,
      [driver.name, driver.badgeNumber]
    );
  });


  // ============================================================
  // VERIFY IN TENANT ADMIN
  // ============================================================

  test('Tenant - Verify Onboarded Driver', async ({ driverPage }) => {

    await driverPage.navigateToDrivers();

    await driverPage.verifyDriver(
      'phone',
      driver.phone,
      [driver.name, driver.badgeNumber]
    );
  });


  // ============================================================
  // SEARCH DRIVER (partner)
  // ============================================================

  test('Partner - Search Driver', async ({ partnerDriverPage }) => {

    await partnerDriverPage.navigateToDrivers();

    await partnerDriverPage.verifyDriver(
      'badge',
      driver.badgeNumber,
      [driver.phone]
    );

    await partnerDriverPage.verifyDriver(
      'phone',
      driver.phone,
      [driver.name]
    );

    await partnerDriverPage.verifyDriver(
      'name',
      driver.name,
      [driver.phone]
    );
  });


  // ============================================================
  // EDIT DRIVER (partner)
  // ============================================================

  test('Partner - Edit Driver', async ({ partnerDriverPage }) => {

    await partnerDriverPage.navigateToDrivers();

    await partnerDriverPage.editDriver(
      driver.phone,
      updatedBadgeNumber,
      updatedPincode
    );

    await partnerDriverPage.verifyDriver(
      'phone',
      driver.phone,
      [updatedBadgeNumber]
    );
  });


  // ============================================================
  // VERIFY EDIT IN TENANT ADMIN
  // ============================================================

  test('Tenant - Verify Edited Driver', async ({ driverPage }) => {

    await driverPage.navigateToDrivers();

    await driverPage.verifyDriver(
      'phone',
      driver.phone,
      [driver.name, updatedBadgeNumber]
    );
  });


  // ============================================================
  // DELETE DRIVER (partner)
  // ============================================================

  test('Partner - Delete Driver', async ({ partnerDriverPage }) => {

    await partnerDriverPage.navigateToDrivers();

    await partnerDriverPage.deleteDriver(
      driver.phone
    );
  });


  // ============================================================
  // VERIFY DELETE IN TENANT ADMIN
  // ============================================================

  test('Tenant - Verify Deleted Driver', async ({ driverPage }) => {

    await driverPage.navigateToDrivers();

    await driverPage.verifyDriverNotListed(
      driver.phone
    );
  });

});
