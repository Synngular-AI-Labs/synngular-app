import { apiRequest } from "./client";

export interface LoginRequest {
  email: string;
}

export interface LoginResponse {
  message: string;
  email: string;
}

export function requestLoginOtp(email: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email } satisfies LoginRequest),
  });
}

export interface VerifyLoginOtpRequest {
  email: string;
  otp: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface VerifyLoginOtpResponse {
  message: string;
  user: AuthUser;
}

export function verifyLoginOtp(
  email: string,
  otp: string
): Promise<VerifyLoginOtpResponse> {
  return apiRequest<VerifyLoginOtpResponse>("/api/auth/verify-login-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp } satisfies VerifyLoginOtpRequest),
  });
}
