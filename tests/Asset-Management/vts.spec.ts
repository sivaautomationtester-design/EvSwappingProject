import { test } from '../../fixtures/baseFixtures';
import { uniqueSerial } from '../../test-data/asset.data';

// Not serial: Edit currently fails on a portal bug, and Delete must still run
// to clean up the device created by this run
test.describe.configure({ mode: 'default' });

test.describe('VTS Device Onboarding', () => {

  // A failed test restarts the worker, which reloads this file. Keep the same
  // number across workers so Delete targets the device Create made.
  const uniqueNumber =
    (process.env.VTS_UNIQUE_NUMBER ??= uniqueSerial(''));

  const vtsData = {
    imei: `11011${uniqueNumber.slice(-12)}`,
    msisdn: `202${uniqueNumber.slice(-12)}`,
    imsi: `303${uniqueNumber.slice(-12)}`,
  };

  console.log('IMEI:', vtsData.imei);
  console.log('MSISDN:', vtsData.msisdn);
  console.log('IMSI:', vtsData.imsi);

  test('Create VTS Device', async ({ vtsPage }) => {

    await vtsPage.navigateToVts();

    await vtsPage.createVts(
      vtsData.imei,
      vtsData.msisdn,
      vtsData.imsi
    );
  });

  test('View VTS Device', async ({ vtsPage }) => {

    await vtsPage.navigateToVts();

    await vtsPage.viewVts(
      vtsData.imei,
      vtsData.msisdn,
      vtsData.imsi
    );
  });

  test('Edit VTS Device - Invalid Selection', async ({ vtsPage }) => {

     await vtsPage.navigateToVts();

     await vtsPage.editVts();
   });

  test('Delete VTS Device', async ({ vtsPage }) => {

    await vtsPage.navigateToVts();

    await vtsPage.deleteVts(vtsData.imei);
  });

});