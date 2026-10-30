export interface TokenResponse {
  access_token?: string;
  token?: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
}

export interface OtpResponse {
  createdAt: number;
  otpExpiry: number;
  otp: string;

  availableTenants: {
    tenantName: string;
    roles: {
      name: string;
      id: number;
    }[];
    tenantId: number;
  }[];

  userId: number[];

  selectedTenant: number | null;
  selectedRole: number | null;

  pendingAuthId: string;
  username: string;
  attempts: number;
}