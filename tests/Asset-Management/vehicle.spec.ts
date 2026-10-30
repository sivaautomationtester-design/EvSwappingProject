import { test } from '../../fixtures/baseFixtures';
import { uniqueSerial } from '../../test-data/asset.data';

test.describe.configure({ mode: 'serial' });

test.describe('Vehicle Onboarding', () => {

  let vehicleNumber: string;

  const vinNumber = uniqueSerial('Aut').slice(-17);

  test('Create Vehicle', async ({ vehiclePage }) => {

    await vehiclePage.navigateToVehicles();

    // Find an unused registration number
    vehicleNumber =
      await vehiclePage.getAvailableVehicleNumber();

    console.log(
      `🚗 Using vehicle: ${vehicleNumber}`
    );

    await vehiclePage.createVehicle(
      vehicleNumber,
      vinNumber
    );
  });


  test('Edit Vehicle', async ({ vehiclePage }) => {

    await vehiclePage.navigateToVehicles();

    await vehiclePage.editVehicle(
      vehicleNumber
    );
  });


  test('Blacklist Vehicle', async ({ vehiclePage }) => {

    await vehiclePage.navigateToVehicles();

    await vehiclePage.blacklistVehicle(
      vehicleNumber,
      `${vinNumber} blacklisted by automation`
    );

    await vehiclePage.verifyBlacklisted(
      vehicleNumber,
      true
    );
  });


  test('Reinstate Vehicle', async ({ vehiclePage }) => {

    await vehiclePage.navigateToVehicles();

    await vehiclePage.reinstateVehicle(
      vehicleNumber,
      `${vinNumber} reinstated by automation`
    );

    await vehiclePage.verifyBlacklisted(
      vehicleNumber,
      false
    );
  });


  test('Delete Vehicle', async ({ vehiclePage }) => {

    await vehiclePage.navigateToVehicles();

    await vehiclePage.deleteVehicle(
      vehicleNumber
    );
  });

});