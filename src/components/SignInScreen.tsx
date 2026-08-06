import React, { useState } from "react";
import groupLogo from "../assets/Group.svg";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SignInScreenProps {
  onNavigateToVerify?: () => void;
}

const SignInScreen: React.FC<SignInScreenProps> = ({ onNavigateToVerify }) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [touched, setTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isEmailValid = emailRegex.test(email);

  const validateEmail = (value: string): boolean => {
    if (!value) return true;
    return emailRegex.test(value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (touched) {
      setEmailError(!validateEmail(value));
    }
  };

  const handleEmailBlur = () => {
    setTouched(true);
    setEmailError(!validateEmail(email));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Sign in with:", email);
    setTimeout(() => {
      setIsLoading(false);
      if (onNavigateToVerify) onNavigateToVerify();
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

      {/* Container 2: Sign In Form Card */}
      <div
        className="w-full flex-1 rounded-t-[2.5rem] -mt-8 relative z-30 px-6 pt-8 pb-6 flex flex-col gap-6"
        style={{ background: 'var(--grey-100)' }}
      >
        {/* Heading */}
        <h1 className="text-2xl font-bold text-foreground">
          Sign in to unlock the full potential of synngular
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          {/* Email Input */}
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
              Enter your email id
            </label>
            <Input
              id="email"
              type="email"
              placeholder="ben@company.com"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              aria-invalid={emailError}
              data-invalid={emailError}
              style={emailError ? { borderColor: 'var(--error-600)', boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.2)' } : {}}
              required
              className="h-12 placeholder:text-[var(--grey-500)]"
            />
            {emailError && (
              <p className="text-sm mt-1" style={{ color: 'var(--error-600)' }}>
                Enter your email id
              </p>
            )}
          </div>

          {/* Continue Button with Dynamic State */}
          <Button
            type="submit"
            disabled={!isEmailValid || isLoading}
            variant={isEmailValid ? "default" : "ghost"}
            size="default"
            style={
              isEmailValid
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
              "Continue with email"
            )}
          </Button>
        </form>

        {/* Switch Action */}
        <div className="text-sm text-muted-foreground text-center mt-6">
          Don't have an account?{" "}
          <a href="#signup" className="font-medium hover:underline" style={{ color: 'var(--purple-800)' }}>
            Sign up
          </a>
        </div>

        {/* Terms & Privacy */}
        <div className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
          By continuing, you agree to our{" "}
          <a href="#terms" className="hover:underline" style={{ color: 'var(--purple-800)' }}>
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#privacy" className="hover:underline" style={{ color: 'var(--purple-800)' }}>
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignInScreen;