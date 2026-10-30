import { test } from '../../../fixtures/baseFixtures';
import { uniqueDigits, uniqueNumericId, uniqueSerial } from '../../../test-data/asset.data';
import { AssetLinkData } from '../../../pages/asset-onboarding/AssetLinkPage';

test.describe.configure({ mode: 'serial' });

test.describe('Asset Linking', () => {

  // ============================================================
  // DYNAMIC TEST DATA
  // Generated ONLY ONCE for the complete test flow, same formats
  // as the vehicle / vts / keyfob / battery specs
  // ============================================================

  // Every spec file loads in the same second on a full run, so the
  // second-based serials the vts / keyfob / battery specs use would
  // be identical here. Millisecond-based values keep them apart.
  const uniqueNumber = uniqueNumericId(12);

  // 17 characters, like the vehicle spec's VIN
  const vinNumber = uniqueDigits('AUTL');

  const vts = {
    imei: `11011${uniqueNumber.slice(-12)}`,
    msisdn: `202${uniqueNumber.slice(-12)}`,
    imsi: `303${uniqueNumber.slice(-12)}`,
  };

  const linkData: AssetLinkData = {
    // Set in Create Vehicle: the first unused registration number
    vehicleNumber: '',
    vtsImei: vts.imei,
    keyFobSerial: uniqueDigits('AUTOKEY'),
    batterySerial: uniqueDigits('AUTOBAT'),
  };

  const batteryImei = uniqueDigits('1010');

  console.log('==========================================');
  console.log('ASSET LINK TEST DATA');
  console.log('==========================================');
  console.log(`VTS IMEI       : ${linkData.vtsImei}`);
  console.log(`Key Fob Serial : ${linkData.keyFobSerial}`);
  console.log(`Battery Serial : ${linkData.batterySerial}`);
  console.log('==========================================');


  // ============================================================
  // CREATE ASSETS
  // ============================================================

  test('Create Vehicle', async ({ vehiclePage }) => {

    await vehiclePage.navigateToVehicles();

    linkData.vehicleNumber =
      await vehiclePage.getAvailableVehicleNumber();

    console.log(`🚗 Using vehicle: ${linkData.vehicleNumber}`);

    await vehiclePage.createVehicle(
      linkData.vehicleNumber,
      vinNumber
    );
  });


  test('Create VTS Device', async ({ vtsPage }) => {

    await vtsPage.navigateToVts();

    await vtsPage.createVts(
      vts.imei,
      vts.msisdn,
      vts.imsi
    );
  });


  test('Create Key Fob', async ({ keyFobPage }) => {

    await keyFobPage.navigateToKeyFob();

    await keyFobPage.createKeyFob(
      linkData.keyFobSerial
    );
  });


  test('Create Battery', async ({ batteryOnboardPage }) => {

    await batteryOnboardPage.onboardBattery(
      linkData.batterySerial,
      batteryImei
    );
  });


  // ============================================================
  // LINK ASSETS
  // ============================================================

  test('Link Assets', async ({ assetLinkPage }) => {

    console.log('');
    console.log('==========================================');
    console.log('LINK ASSETS');
    console.log('==========================================');

    await assetLinkPage.linkAssets(
      linkData
    );

    console.log('✅ Link Assets completed');
  });


  // ============================================================
  // VERIFY LINKED PAIR
  // ============================================================

  test('Verify Linked Pair', async ({ assetLinkPage }) => {

    console.log('');
    console.log('==========================================');
    console.log('VERIFY LINKED PAIR');
    console.log('==========================================');

    await assetLinkPage.verifyLinkedPair(
      linkData
    );

    console.log('✅ Verify Linked Pair completed');
  });


  // ============================================================
  // DELETE LINKED PAIR
  // ============================================================

  test('Delete Linked Pair', async ({ assetLinkPage }) => {

    console.log('');
    console.log('==========================================');
    console.log('DELETE LINKED PAIR');
    console.log('==========================================');

    await assetLinkPage.deleteLinkedPair(
      linkData.vehicleNumber
    );

    console.log('✅ Delete Linked Pair completed');
  });

});
