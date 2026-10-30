import { test } from '../../fixtures/baseFixtures';
import { generateTestId } from '../../utils/testdata';

test('Create Site', async ({swapStationPage,sitePage}) => {
 
  
  const testId = generateTestId();

const swapStationSerial =
  `SWAP${testId}`;

const siteName =
  `SITE${testId}`;

 await swapStationPage.navigateToSwapStation();  

await swapStationPage.createSwapStation(
  swapStationSerial
);

await swapStationPage.selectSwapStation(
  swapStationSerial
);

// Links to the latest company and uses it for the site too
const franchisee = await swapStationPage.linkFranchise();

await sitePage.createSite(
  siteName,
  swapStationSerial,
  franchisee
)

});