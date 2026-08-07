import React, { useState, useEffect } from "react";
import groupLogo from "../assets/Group.svg";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ArrowLeft, CheckCircle, X } from "lucide-react";

const otpRegex = /^\d{6}$/;

const VerifyEmailScreen: React.FC<{
  onNavigate: (screen: "signin" | "home" | "terms" | "privacy") => void;
  userEmail: string;
}> = ({ onNavigate, userEmail }) => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [resendTimer, setResendTimer] = useState(56);

  const isOtpValid = otpRegex.test(otp);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Verifying OTP:", otp);
    setTimeout(() => {
      setIsLoading(false);
      setShowToast(true);
      onNavigate("home");
    }, 2000);
  };

  return (
    <div className="w-full min-h-screen flex flex-col" style={{ background: 'var(--grey-200)' }}>
      {/* Container 1: Header Banner */}
      <div
        className="w-full h-56 sm:h-52 flex"
        style={{ background: 'var(--color-bg-header)' }}
      >
        <img
          src={groupLogo}
          alt="Synngular"
          className="w-full h-[800px] z-20 pointer-events-none"
        />
      </div>

      {/* Container 2: OTP Verification Card */}
      <div
        className="w-full flex-1 rounded-t-[2.5rem] -mt-8 relative z-30 px-6 pt-8 pb-6 flex flex-col gap-6"
        style={{ background: 'var(--grey-100)' }}
      >
        {/* Back Button */}
        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center rounded-md shrink-0"
          style={{ background: 'var(--grey-300)' }}
          onClick={() => onNavigate?.("signin")}
        >
          <ArrowLeft size={18} style={{ color: 'var(--grey-800)' }} />
        </button>

        {/* Heading */}
        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
          Check your email
        </h1>

        {/* Subtitle */}
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          We've sent a 6-digit code to {userEmail || 'your email'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          {/* OTP Input */}
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="otp" className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
              Enter verification code
            </label>
            <Input
              id="otp"
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              maxLength={6}
              className="h-12 placeholder:text-[var(--grey-500)]"
            />
          </div>

          {/* Verify Button */}
          <Button
            type="submit"
            disabled={!isOtpValid || isLoading}
            variant={isOtpValid ? "default" : "ghost"}
            size="default"
            style={
              isOtpValid && !isLoading
                ? { background: 'var(--purple-1000)', color: 'var(--grey-100)' }
                : { background: 'var(--grey-300)', color: 'var(--grey-500)' }
            }
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" style={{ color: 'currentColor' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "Verify Email"
            )}
          </Button>
        </form>

          {/* Resend Text */}
          <div className="text-sm text-center" style={{ color: 'var(--muted-foreground)' }}>
            {resendTimer > 0 ? (
              <>Resend OTP in {resendTimer}s</>
            ) : (
              <span
                onClick={() => setResendTimer(56)}
                className="hover:underline font-medium"
                style={{ color: 'var(--purple-800)', cursor: 'pointer' }}
              >
                Resend OTP
              </span>
            )}
          </div>

          {/* Terms & Privacy */}
          <div className="text-xs text-center leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            By continuing, you agree to our{" "}
            <a
              href="#terms"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("terms");
              }}
              className="hover:underline"
              style={{ color: 'var(--purple-800)', cursor: 'pointer' }}
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#privacy"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("privacy");
              }}
              className="hover:underline"
              style={{ color: 'var(--purple-800)', cursor: 'pointer' }}
            >
              Privacy Policy
            </a>
          </div>

          {/* Success Toast */}
          {showToast && (
            <div
              className="absolute bottom-6 left-6 right-6 flex items-center gap-3 p-4 rounded-xl shadow-lg z-50"
              style={{ background: 'var(--success-100)', border: '1px solid var(--success-700)' }}
            >
              <CheckCircle size={20} style={{ color: 'var(--success-700)' }} />
              <span className="flex-1 text-sm font-medium" style={{ color: 'var(--success-800)' }}>
                Task created successfully
              </span>
              <button
                type="button"
                onClick={() => setShowToast(false)}
                className="shrink-0"
              >
                <X size={16} style={{ color: 'var(--success-700)' }} />
              </button>
            </div>
          )}
      </div>
    </div>
  );
};

export default VerifyEmailScreen;