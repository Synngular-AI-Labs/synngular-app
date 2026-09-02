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

export interface UserProfileResponse {
  user: AuthUser;
}

// Resolves from the existing auth_token cookie alone (no OTP) — used on app
// launch to silently restore a session instead of forcing sign-in again every
// time the app process is killed and relaunched. Rejects (ApiError, 401) if
// there's no cookie or it's no longer valid.
export function getUserProfile(): Promise<UserProfileResponse> {
  return apiRequest<UserProfileResponse>("/api/user/profile");
}
