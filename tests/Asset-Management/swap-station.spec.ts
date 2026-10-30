import { test } from '../../fixtures/baseFixtures';
import { generateTestId } from '../../utils/testdata';

test.describe.serial('Swap Station Tests', () => {

  let swapStationSerial: string;

  test('Create Swap Station', async ({ swapStationPage }) => {

    const testId = generateTestId();
    swapStationSerial = `SWAP${testId}`;

    console.log(`Creating Swap Station: ${swapStationSerial}`);

    await swapStationPage.navigateToSwapStation();

    await swapStationPage.createSwapStation(
      swapStationSerial
    );
  });

  test('Link Swap Station', async ({ swapStationPage }) => {

    console.log(`Linking Swap Station: ${swapStationSerial}`);

    //await swapStationPage.navigateToSwapStation();

    await swapStationPage.selectSwapStation(
      swapStationSerial
    );

    await swapStationPage.linkFranchise();
  });

  test('Delink Swap Station', async ({ swapStationPage }) => {

    console.log(`Delinking Swap Station: ${swapStationSerial}`);

    //await swapStationPage.navigateToSwapStation();

    await swapStationPage.selectSwapStation(
      swapStationSerial
    );

    await swapStationPage.unlinkFranchise();
  });

  test('View Swap Station', async ({ swapStationPage }) => {

    console.log(`Viewing Swap Station: ${swapStationSerial}`);

    await swapStationPage.navigateToSwapStation();

    await swapStationPage.viewSwapStation(
      swapStationSerial
    );
  });

  test('Delete Swap Station', async ({ swapStationPage }) => {

    console.log(`Deleting Swap Station: ${swapStationSerial}`);

    await swapStationPage.navigateToSwapStation();

    await swapStationPage.deleteSwapStation(
      swapStationSerial
    );
  });

});