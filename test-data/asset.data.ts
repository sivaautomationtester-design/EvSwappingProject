export const assetData = {
  franchisee: 'newpartner',
  swapStationSelection: 'newpartner',

  swapStationModel: 'GEN 2',
  swapStationOem: 'rne',

  siteType: 'Petrol Pump',
  franchiseeType: 'newpartner',
  siteSwapStation: 'newpartner',

   keyFobOem: 'Acme',
  keyFobModel: 'SAMPLEMODEL',
  keyFobVariant: 'ALPHA',
};

let vehicleSequence = 0;

export function generateVehicleNumber(): string {
  vehicleSequence++;

  return `TN10BF${String(vehicleSequence).padStart(4, '0')}`;
}

export function uniqueSerial(prefix: string): string {
  const now = new Date();

  const timestamp =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0');
    
  return `${prefix}${timestamp}`;
}

export function uniqueNumericId(length: number = 15): string {
  const timestamp = Date.now().toString();

  return timestamp.slice(-length);
}

export function uniqueDigits(prefix: string): string {
  return `${prefix}${Date.now()}`;
}
