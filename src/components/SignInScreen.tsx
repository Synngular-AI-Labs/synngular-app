import React, { useState } from "react";
import groupLogo from "../assets/Group.svg";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignInScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [touched, setTouched] = useState(false);

  const isEmailValid = emailRegex.test(email);

  const validateEmail = (value: string): boolean => {
    if (!value) return true; // No error when empty (required handles it)
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
    console.log("Sign in with:", email);
  };

  return (
    <div className="w-full min-h-screen bg-card flex flex-col ">
      {/* Container 1: Header Banner */}
      <div
        className="w-full h-56 sm:h-52 flex bg-header-gradient  "
      >
        <img
          src={groupLogo}
          alt="Synngular"
          className="w-full h-[800px] z-20 pointer-events-none"
        />
        {/* <h1 className="absolute text-4xl font-bold text-white z-10 pointer-events-none">Synngular</h1> */}
      </div>

      {/* Container 2: Sign In Form Card */}
      <div className="w-full min-h-[900px] gap-6 bg-white rounded-t-[2.5rem] border-t border-border -mt-8 z-30 px-6 pt-6 pb-6 shadow-2xl flex flex-col">
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
              style={emailError ? { borderColor: '#EF4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.2)' } : {}}
              required
              className="h-12 "
            />
            {emailError && (
              <p className="text-sm mt-1" style={{ color: 'var(--color-error, #EF4444)' }}>
                Enter your email id
              </p>
            )}
          </div>

           {/* Continue Button with Dynamic State */}
           <Button
             type="submit"
             disabled={!isEmailValid}
             variant={isEmailValid ? "default" : "ghost"}
             size="default"
             style={isEmailValid ? { background: 'var(--btn-primary)', color: 'var(--btn-primary-foreground)' } : { background: 'var(--btn-disabled-bg)', color: 'var(--btn-disabled-text)' }}
           >
             Continue with email
           </Button>
        </form>

        {/* Switch Action */}
        <div className="text-sm text-muted-foreground text-center mt-6">
          Don't have an account?{" "}
          <a href="#signup" className="font-medium text-primary hover:underline">
            Sign up
          </a>
        </div>

        {/* Terms & Privacy */}
        <div className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
          By continuing, you agree to our{" "}
          <a href="#terms" className="text-primary hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#privacy" className="text-primary hover:underline">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignInScreen;