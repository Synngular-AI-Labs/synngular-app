import React, { useState, useCallback, useMemo } from "react";
import groupLogo from "../assets/Group.svg";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

/* ── Constants ── */
const ERROR_MSG_EMPTY_EMAIL = "Enter your email id";
const ERROR_MSG_INVALID_EMAIL = "Enter valid Email id";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HEADING_TEXT_SIGNIN = "Sign in to unlock the full potential of synngular";
const LABEL_EMAIL = "Enter your email id";
const PLACEHOLDER_EMAIL = "ben@company.com";
const BUTTON_TEXT_CONTINUE = "Continue with email";
const TEXT_AGREE_PREAMBLE = "By continuing, you agree to our ";
const TEXT_AND = " and ";
const TEXT_TERMS = "Terms of Service";
const TEXT_PRIVACY = "Privacy Policy";
const ALT_LOGO = "Synngular";

/* ── Validation Helper ── */
const validateEmail = (email: string): string | null => {
  if (!email || email.trim() === "") return ERROR_MSG_EMPTY_EMAIL;
  if (!EMAIL_REGEX.test(email)) return ERROR_MSG_INVALID_EMAIL;
  return null;
};

/* ── Button State Helper ── */
const getButtonStyles = (isValid: boolean): React.CSSProperties => {
  if (isValid) {
    return { background: "var(--purple-1000)", color: "var(--grey-100)" };
  }
  return { background: "var(--grey-200)", color: "var(--grey-500)" };
};

/* ── Error Display Helper ── */
const renderEmailError = (errorMsg: string | null): React.ReactNode => {
  if (!errorMsg) return null;
  return (
    <p className="text-sm mt-1 text-[var(--error-600)]">
      {errorMsg}
    </p>
  );
};

interface SignInScreenProps {
  onNavigateToVerify?: () => void;
  onNavigateToTerms?: () => void;
  onNavigateToPrivacy?: () => void;
  setUserEmail: (email: string) => void;
}

const SignInScreen: React.FC<SignInScreenProps> = ({ onNavigateToVerify, onNavigateToTerms, onNavigateToPrivacy, setUserEmail }) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isEmailValid = useMemo(() => EMAIL_REGEX.test(email), [email]);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (touched) {
      setEmailError(validateEmail(value));
    }
  }, [touched]);

  const handleEmailBlur = useCallback(() => {
    setTouched(true);
    setEmailError(validateEmail(email));
  }, [email]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const errorMsg = validateEmail(email);
    setEmailError(errorMsg);
    if (errorMsg) return;
    setIsLoading(true);
    setUserEmail(email);
    console.log("Sign in with:", email);
    setTimeout(() => {
      setIsLoading(false);
      if (onNavigateToVerify) onNavigateToVerify();
    }, 2000);
  }, [email, setUserEmail, onNavigateToVerify]);

  return (
    <div className="w-full min-h-screen flex flex-col pt-[max(env(safe-area-inset-top),2.75rem)] bg-[var(--grey-200)]">
      {/* Container 1: Header Banner */}
      <div
        className="w-full h-56 sm:h-52 flex bg-header-gradient"
      >
        <img
          src={groupLogo}
          alt={ALT_LOGO}
          className="w-full h-[800px] z-20 pointer-events-none"
        />
      </div>

      {/* Container 2: Sign In Form Card */}
      <div
        className="w-full flex-1 rounded-t-[2.5rem] -mt-8 relative z-30 px-6 pt-8 pb-6 flex flex-col gap-6 bg-[var(--grey-100)]"
      >
        {/* Heading */}
        <h1 className="font-semibold text-[var(--font-size-card-title-20)] leading-[var(--line-height-card-title-20)] text-[var(--grey-1000)]">
          {HEADING_TEXT_SIGNIN}
        </h1>

        {/* Form */}
        <div className="w-full flex flex-col gap-4 mt-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
            {/* Email Input */}
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="email" className="text-sm font-medium text-[var(--muted-foreground)]">
                {LABEL_EMAIL}
              </label>
              <Input
                id="email"
                type="email"
                placeholder={PLACEHOLDER_EMAIL}
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                aria-invalid={!!emailError}
                data-invalid={!!emailError}
                style={emailError ? { borderColor: 'var(--error-600)', boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.2)' } : {}}
                required
                className="h-12 w-full bg-[var(--grey-100)] border border-[var(--grey-400)] placeholder:text-[var(--grey-400)] text-[var(--foreground)]"
              />
              {renderEmailError(emailError)}
            </div>

            {/* Continue Button with Dynamic State */}
            <Button
              type="submit"
              disabled={!isEmailValid || isLoading}
              variant={isEmailValid ? "default" : "ghost"}
              size="default"
              className="w-full bg-[var(--grey-200)] border border-[var(--grey-300)]"
              style={getButtonStyles(isEmailValid)}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" style={{ color: 'currentColor' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                BUTTON_TEXT_CONTINUE
              )}
            </Button>
          </form>

          {/* Switch Action */}
          {/* <div className="text-sm text-center text-[var(--muted-foreground)]">
            Don't have an account?{" "}
            <a href="#signup" className="font-medium hover:underline text-[var(--purple-800)]">
              Sign up
            </a>
          </div> */}
        </div>

        {/* Terms & Privacy - pushed to bottom with 32px margin */}
        <div className="mt-auto mb-8 w-full text-center px-4">
          <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
            {TEXT_AGREE_PREAMBLE}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onNavigateToTerms?.();
              }}
              className="hover:underline font-medium text-[var(--purple-800)]"
            >
              {TEXT_TERMS}
            </button>
            {TEXT_AND}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onNavigateToPrivacy?.();
              }}
              className="hover:underline font-medium text-[var(--purple-800)]"
            >
              {TEXT_PRIVACY}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInScreen;