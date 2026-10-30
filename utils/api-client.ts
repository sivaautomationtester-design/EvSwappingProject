import { APIRequestContext } from '@playwright/test';
import { env } from './env';
import {OtpResponse, TokenResponse} from '../types/auth.types';

export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async generateSuperAdminToken(): Promise<string> {
    const params = new URLSearchParams({
      username: env.app.superAdmin.username,
      password: env.app.superAdmin.password,
      grant_type: 'password'
    });

    const response = await this.request.post(
      `${env.app.authUrl}?${params.toString()}`
    );

    if (!response.ok()) {
      throw new Error(
        `OAuth token generation failed. Status: ${response.status()}`
      );
    }

    const body = (await response.json()) as TokenResponse;

    const accessToken = body.access_token ?? body.token;

    if (!accessToken) {
      throw new Error(
        `OAuth response does not contain an access token. Response: ${JSON.stringify(body)}`
      );
    }

    return accessToken;
  }

  async getOtp(accessToken: string): Promise<string> {
  const response = await this.request.post(
    env.app.otpHelperUrl,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      data: {}
    }
  );

  const responseText = await response.text();

  if (!response.ok()) {
    throw new Error(
      `OTP helper API failed. Status: ${response.status()}, Response: ${responseText}`
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new Error(
      `OTP helper returned invalid JSON: ${responseText}`
    );
  }

  // API can return either one record or multiple records
  const records = Array.isArray(parsed)
    ? parsed
    : [parsed];

  const otpRecords: OtpResponse[] = [];

  for (const record of records) {
    try {
      if (typeof record === 'string') {
        otpRecords.push(JSON.parse(record) as OtpResponse);
      } else if (
        typeof record === 'object' &&
        record !== null
      ) {
        otpRecords.push(record as OtpResponse);
      }
    } catch {
      console.warn('⚠️ Skipping invalid OTP record:', record);
    }
  }

  if (otpRecords.length === 0) {
    throw new Error(
      `No valid OTP records found. Response: ${responseText}`
    );
  }

  // Select the newest OTP using createdAt
  const latestOtp = otpRecords.reduce((latest, current) => {
    return Number(current.createdAt ?? 0) >
      Number(latest.createdAt ?? 0)
      ? current
      : latest;
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐Api client OTP records found:', otpRecords.length);
  console.log('🕐Api client Latest createdAt:', latestOtp.createdAt);
  console.log('⏳Api client OTP expiry:', latestOtp.otpExpiry);
  console.log('👤Api client Username:', latestOtp.username);
  console.log('🔑Api client Pending Auth ID:', latestOtp.pendingAuthId);
  console.log('🔢Api client Latest OTP:', latestOtp.otp);
  console.log('🔄Api client Attempts:', latestOtp.attempts);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (!latestOtp.otp) {
    throw new Error(
      `Latest OTP record does not contain OTP. Response: ${responseText}`
    );
  }

  // Make sure OTP has not already expired
  const now = Math.floor(Date.now() / 1000);

  if (
    latestOtp.otpExpiry &&
    Number(latestOtp.otpExpiry) <= now
  ) {
    throw new Error(
      `Latest OTP is already expired. ` +
      `createdAt=${latestOtp.createdAt}, ` +
      `otpExpiry=${latestOtp.otpExpiry}, ` +
      `currentTime=${now}`
    );
  }

  return latestOtp.otp;
}
}