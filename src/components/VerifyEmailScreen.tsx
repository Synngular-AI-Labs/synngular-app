import React, { useState, useEffect, useCallback } from "react";
import groupLogo from "../assets/Group.svg";
import logoWordmark from "../assets/LogoWordmark.svg";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ArrowLeft, CheckCircle, X } from "lucide-react";
import { verifyLoginOtp } from "../lib/api/auth";
import { ApiError } from "../lib/api/client";
import { listOrganizations } from "../lib/api/organization";
import { getSubscriptionStatus, hasActiveSubscription } from "../lib/api/subscription";

/* ── Constants ── */
const ERROR_MSG_EMPTY_OTP = "Enter the 6-digit code";
const ERROR_MSG_INVALID_OTP = "Enter valid 6-digit code";
const OTP_REGEX = /^\d{6}$/;
const HEADING_TEXT_VERIFY = "Check your email";
const SUBTITLE_PREFIX = "We've sent a 6-digit code to ";
const SUBTITLE_FALLBACK = "your email";
const LABEL_OTP = "Enter verification code";
const PLACEHOLDER_OTP = "123456";
const BUTTON_TEXT_CONFIRM = "Confirm OTP";
const TEXT_AGREE_PREAMBLE = "By continuing, you agree to our ";
const TEXT_AND = " and ";
const TEXT_TERMS = "Terms of Service";
const TEXT_PRIVACY = "Privacy Policy";
const ALT_LOGO = "Synngular";
const TOAST_MESSAGE = "Email verified successfully";
const RESEND_TEXT_PREFIX = "Resend OTP in ";
const RESEND_TEXT_SUFFIX = "s";
const RESEND_TEXT_LINK = "Resend OTP";
const RESEND_INITIAL_TIMER = 56;
const MAX_OTP_LENGTH = 6;

/* ── Validation Helper ── */
const validateOtp = (otp: string): string | null => {
  if (!otp || otp.trim() === "") return ERROR_MSG_EMPTY_OTP;
  if (!OTP_REGEX.test(otp)) return ERROR_MSG_INVALID_OTP;
  return null;
};

/* ── Button State Helper ── */
const getButtonStyles = (isValid: boolean, isLoading: boolean): React.CSSProperties => {
  if (isValid && !isLoading) {
    return { background: "var(--purple-1000)", color: "var(--grey-100)" };
  }
  return { background: "var(--grey-200)", color: "var(--grey-500)" };
};

/* ── Error Display Helper ── */
const renderOtpError = (errorMsg: string | null): React.ReactNode => {
  if (!errorMsg) return null;
  return <p className="text-sm mt-1 text-[var(--error-600)]">{errorMsg}</p>;
};

const VerifyEmailScreen: React.FC<{
  onNavigate: (screen: "signin" | "project-select" | "subscription" | "terms" | "privacy") => void;
  userEmail: string;
  setOrganizationId: (organizationId: string) => void;
  setUserId: (userId: string) => void;
}> = ({ onNavigate, userEmail, setOrganizationId, setUserId }) => {
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_INITIAL_TIMER);

  const isOtpValid = OTP_REGEX.test(otp);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const validationError = validateOtp(otp);
      setOtpError(validationError);
      if (validationError) return;
      setIsLoading(true);
      try {
        const { user } = await verifyLoginOtp(userEmail, otp);
        setUserId(user.id);
        setShowToast(true);

        // The app doesn't support switching organizations yet — until it
        // does, org[2] is used as a stand-in for "the org this account
        // actually works in" (falls back to org[0] for accounts with fewer
        // than 3), per product direction.
        const organizations = await listOrganizations();
        const organization = organizations[2] ?? organizations[0];
        if (!organization) {
          setOtpError("No organization found for this account.");
          return;
        }
        setOrganizationId(organization.id);

        const subscription = await getSubscriptionStatus(organization.id);
        onNavigate(hasActiveSubscription(subscription) ? "project-select" : "subscription");
      } catch (err) {
        console.error("Sign-in flow failed:", err);
        if (err instanceof ApiError) {
          const body = err.body as
            | { error?: string; details?: string }
            | undefined;
          setOtpError(body?.details ?? body?.error ?? "Something went wrong");
        } else {
          setOtpError("Something went wrong. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [otp, userEmail, onNavigate, setOrganizationId, setUserId]
  );

  const handleOtpChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value.replace(/\D/g, '').slice(0, MAX_OTP_LENGTH));
    setOtpError(null);
  }, []);

  const handleResend = useCallback(() => {
    setResendTimer(RESEND_INITIAL_TIMER);
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col bg-[var(--grey-200)]">
      {/* Container 1: Header Banner */}
      <div
        className="w-full h-56 sm:h-52 relative overflow-hidden flex items-center justify-center bg-header-gradient"
        style={{ paddingTop: "var(--safe-top)" }}
      >
        <img
          src={groupLogo}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none"
        />
        <img
          src={logoWordmark}
          alt={ALT_LOGO}
          className="relative z-20 pointer-events-none"
          style={{
            width: "clamp(7.5rem, 32vw, 10rem)",
            height: "auto",
            aspectRatio: "142 / 36",
          }}
        />
      </div>

      {/* Container 2: OTP Verification Card */}
      <div
        className="w-full flex-1 rounded-t-[2.5rem] -mt-8 relative z-30 flex flex-col bg-[var(--grey-100)]"
style={{
  padding: "clamp(1.25rem, 5vw, 2rem)",
  paddingBottom: "max(var(--safe-bottom), clamp(1.25rem, 5vw, 2rem))",
}}
      >
        {/* Back Button */}
        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center rounded-md shrink-0 bg-[var(--grey-300)]"
          onClick={() => onNavigate?.("signin")}
        >
          <ArrowLeft size={18} className="text-[var(--grey-800)]" />
        </button>

        {/* Heading */}
<h1
  className="font-semibold text-[var(--grey-1000)]"
  style={{
    fontFamily: "Inter, sans-serif",
    fontSize: "clamp(1rem, 5vw, 1.25rem)",
    lineHeight: "1.875rem",
    letterSpacing: "0%",
    marginTop: "clamp(0.75rem, 3vw, 1.5rem)",
  }}
>
          {HEADING_TEXT_VERIFY}
        </h1>

        {/* All 4 OTP content elements in flex-col gap-4 mt-6 */}
        <div className="w-full flex flex-col gap-4 mt-6">

          {/* 1. Subtitle â€” REQUIREMENT 3: email span uses text-black (not var(--foreground)) */}
          <p className="text-sm text-[var(--muted-foreground)]">
            {SUBTITLE_PREFIX}
            <span className="font-bold text-[var(--grey-1000)]">{userEmail || SUBTITLE_FALLBACK}</span>
          </p>

          {/* 2. Enter verification code input */}
          <div className="flex flex-col gap-2 w-full">
            <label
              htmlFor="otp"
              className="text-sm font-medium text-[var(--muted-foreground)]"
            >
              {LABEL_OTP}
            </label>
            <Input
              id="otp"
              type="tel"
              placeholder={PLACEHOLDER_OTP}
              value={otp}
              onChange={handleOtpChange}
              aria-invalid={!!otpError}
              data-invalid={!!otpError}
              style={
                otpError
                  ? {
                      borderColor: "var(--error-600)",
                      boxShadow: "0 0 0 3px rgba(239,68,68,0.2)",
                    }
                  : {}
              }
              required
              maxLength={MAX_OTP_LENGTH}
              className="h-12 w-full bg-[var(--grey-100)] border border-[var(--grey-400)] placeholder:text-[var(--grey-400)] text-[var(--foreground)]"
            />
            {renderOtpError(otpError)}
          </div>

          {/* 3. Verify Email button */}
          <Button
            type="submit"
            disabled={!isOtpValid || isLoading}
            variant={isOtpValid ? "default" : "ghost"}
            size="default"
            onClick={handleSubmit}
            className="w-full bg-[var(--grey-200)] border border-[var(--grey-300)]"
            style={getButtonStyles(isOtpValid, isLoading)}
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5"
                style={{ color: 'currentColor' }}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              BUTTON_TEXT_CONFIRM
            )}
          </Button>

          {/* 4. Resend OTP */}
          <div className="text-sm text-center text-[var(--muted-foreground)]">
            {resendTimer > 0 ? (
              <>{RESEND_TEXT_PREFIX}{resendTimer}{RESEND_TEXT_SUFFIX}</>
            ) : (
              <span
                onClick={handleResend}
                className="hover:underline font-medium text-[var(--purple-800)] cursor-pointer"
              >
                {RESEND_TEXT_LINK}
              </span>
            )}
          </div>

        </div>{/* end gap-4 content block */}

        {/* Terms pushed to bottom with mt-auto mb-8 (32px) */}
        <div className="mt-auto w-full text-center">
          <p
    className="leading-relaxed text-[var(--muted-foreground)]"
    style={{ fontSize: "clamp(0.65rem, 3vw, 0.75rem)" }}
  >
            {TEXT_AGREE_PREAMBLE}
            <a
              href="#terms"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("terms");
              }}
              className="hover:underline text-[var(--purple-800)] cursor-pointer"
            >
              {TEXT_TERMS}
            </a>
            {TEXT_AND}
            <a
              href="#privacy"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("privacy");
              }}
              className="hover:underline text-[var(--purple-800)] cursor-pointer"
            >
              {TEXT_PRIVACY}
            </a>
          </p>
        </div>

        {/* Success Toast */}
        {showToast && (
          <div
            className="absolute bottom-8 left-6 right-6 flex items-center gap-3 p-4 rounded-xl shadow-lg z-50 bg-[var(--success-100)] border border-[var(--success-700)]"
          >
            <CheckCircle size={20} className="text-[var(--success-700)]" />
            <span className="flex-1 text-sm font-medium text-[var(--success-800)]">
              {TOAST_MESSAGE}
            </span>
            <button
              type="button"
              onClick={() => setShowToast(false)}
              className="shrink-0"
            >
              <X size={16} className="text-[var(--success-700)]" />
            </button>
          </div>
        )}

      </div>{/* end card */}
    </div>
  );
};

export default VerifyEmailScreen;