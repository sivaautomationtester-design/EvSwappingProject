import { test } from '../../fixtures/baseFixtures';
import { uniqueDigits, uniqueSerial } from '../../test-data/asset.data';

test.describe.serial('Battery Onboarding', () => {

  const batterySerial = uniqueSerial('AUTOBAT');
  // IMEI field allows max 17 chars: 1010 + 13-digit ms timestamp.
  // (uniqueSerial('101010') was 20 chars, got cut to 17 and
  // repeated for 10 minutes -> "Entry already exists" on upload)
  const batteryImei = uniqueDigits('1010');

  test('Create Battery', async ({batteryOnboardPage}) => {

    console.log('Battery Serial:', batterySerial);
    console.log('Battery IMEI:', batteryImei);

    await batteryOnboardPage.onboardBattery(
      batterySerial,
      batteryImei
    );

  });

  test('View Battery', async ({batteryOnboardPage}) => {

    await batteryOnboardPage.navigateToBatteryList();

    await batteryOnboardPage.viewBattery(
      batterySerial,
      batteryImei
    );

  });

  test('Edit Battery', async ({batteryOnboardPage}) => {

    await batteryOnboardPage.navigateToBatteryList();

    await batteryOnboardPage.editBattery(
      batterySerial,
      '2024'
    );

  });

  test('Download Battery Template', async ({batteryOnboardPage}) => {

    await batteryOnboardPage.navigateToBatteryList();

    await batteryOnboardPage.downloadTemplate();

  });

  test('Delete Battery', async ({batteryOnboardPage}) => {

    await batteryOnboardPage.navigateToBatteryList();

    await batteryOnboardPage.deleteBattery(
      batterySerial
    );

  });

});
