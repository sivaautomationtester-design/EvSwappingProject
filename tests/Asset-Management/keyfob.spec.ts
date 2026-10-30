import { test } from '../../fixtures/baseFixtures';
import { uniqueSerial } from '../../test-data/asset.data';

test.describe.configure({ mode: 'serial' });

test.describe('Key Fob Onboarding', () => {

  // Generate ONCE for the complete test flow
  const serialNumber = uniqueSerial('AUTOKEY').slice(0, 20);

  console.log('Key Fob Serial Number:', serialNumber);

  test('Create Key Fob', async ({ keyFobPage }) => {

    await keyFobPage.navigateToKeyFob();

    await keyFobPage.createKeyFob(
      serialNumber
    );
  });


  test('View Key Fob', async ({ keyFobPage }) => {

    await keyFobPage.navigateToKeyFob();

    await keyFobPage.viewKeyFob(
      serialNumber
    );
  });


  test('Delete Key Fob', async ({ keyFobPage }) => {

    await keyFobPage.navigateToKeyFob();

    await keyFobPage.deleteKeyFob(
      serialNumber
    );
  });

});