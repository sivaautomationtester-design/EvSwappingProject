export function generateTestId(): string {
  const now = new Date();

  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const DD = String(now.getDate()).padStart(2, '0');
  const YYYY = now.getFullYear();
  const HH = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');

  return `${MM}${DD}${YYYY}${HH}${mm}${ss}${ms}`;
}

export function generateTechnicianData() {

  const testId = generateTestId();

  return {
    phoneNumber: `99765${testId.slice(-5)}`,
    technicianName: `Technician${testId}`,
    badgeNumber: `987698${testId}`,
  };
}

export function getCurrentDate(): string {
  const date = new Date();

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
}

export function generateRandomLetters(length: number = 5): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  let result = '';

  for (let i = 0; i < length; i++) {
    result += letters.charAt(
      Math.floor(Math.random() * letters.length)
    );
  }

  return result;
}