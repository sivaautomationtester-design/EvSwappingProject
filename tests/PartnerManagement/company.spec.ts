import fs from 'node:fs';
import path from 'node:path';
import { test, PARTNER_ACCOUNT_FILE } from '../../fixtures/baseFixtures';
import { generateRandomLetters, generateTestId } from '../../utils/testdata';

test.describe.serial('Partner Management', () => {

  // ============================================================
  // DYNAMIC TEST DATA
  // Generated ONLY ONCE for the complete test flow
  // ============================================================

  const testId = generateTestId();
  const randomLetters = generateRandomLetters(5);

  const businessRegNo = `company99879${testId.slice(-5)}`;
  const companyName = `Company${randomLetters}`;
  const adminMobile = `86875${testId.slice(-5)}`;
  const adminEmail = `com${adminMobile}@example.com`;
  const adminName = `Admin${randomLetters}`;

  console.log('==========================================');
  console.log('COMPANY TEST DATA');
  console.log('==========================================');
  console.log(`Business Reg : ${businessRegNo}`);
  console.log(`Company Name : ${companyName}`);
  console.log(`Admin Mobile : ${adminMobile}`);
  console.log(`Admin Email  : ${adminEmail}`);
  console.log(`Admin Name   : ${adminName}`);
  console.log('==========================================');


  // ============================================================
  // ONBOARD COMPANY
  // ============================================================

  test('Onboard Company', async ({ companyOnboardPage }) => {

    console.log('');
    console.log('==========================================');
    console.log('ONBOARD COMPANY');
    console.log('==========================================');

    // 1. Navigate to Partner Management
    await companyOnboardPage.navigateToPartnerManagement();

    await companyOnboardPage.openAddCompany();

    // 2. Company Details
    await companyOnboardPage.addCompanyDetails(
      businessRegNo,
      companyName,
      'Logistics',
      '560062',
      'KARNATAKA',
      'BENGALURU URBAN',
      'MG Road outer ring road silkboard'
    );

    // 3. Fleet Service
    await companyOnboardPage.addFleetService(
      'MONTHLY',
      '1000',
      '100'
    );

    // 4. Station Service
    await companyOnboardPage.addStationService(
      'MONTHLY',
      '100',
      '100'
    );

    // 5. Admin Details
    await companyOnboardPage.addAdminDetails(
      adminMobile,
      adminEmail,
      adminName
    );

    // 6. Onboard
    await companyOnboardPage.onboardCompany(
      businessRegNo,
      companyName
    );

    // Partner admin login for the driver tests: the company admin's
    // email, with the tenant password
    fs.mkdirSync(path.dirname(PARTNER_ACCOUNT_FILE), { recursive: true });

    fs.writeFileSync(
      PARTNER_ACCOUNT_FILE,
      JSON.stringify({ username: adminEmail, companyName }, null, 2)
    );

    console.log(`💾 Partner account saved: ${adminEmail}`);

    console.log('✅ Onboard Company completed');
  });

});
