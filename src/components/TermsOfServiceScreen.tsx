import React from "react";
import { X } from "lucide-react";

interface TermsOfServiceScreenProps {
  onNavigate: (screen: "signin" | "verify" | "terms" | "privacy") => void;
  returnTo: "signin" | "verify" | "terms" | "privacy";
}

const TermsOfServiceScreen: React.FC<TermsOfServiceScreenProps> = ({ onNavigate, returnTo }) => {
  return (
    <div
      className="min-h-screen flex flex-col bg-[var(--grey-100)] pt-[max(env(safe-area-inset-top),2.75rem)] pb-[max(env(safe-area-inset-bottom),2.125rem)]"
    >
      <header
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <h1 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
          Terms of Service
        </h1>
        <button
          type="button"
          onClick={() => onNavigate(returnTo)}
          className="inline-flex items-center justify-center rounded-md p-2"
          style={{ color: "var(--foreground)" }}
          aria-label="Close terms of service"
        >
          <X size={20} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <section className="mb-6">
          <h2 className="mb-3 text-base font-bold" style={{ color: "var(--foreground)" }}>
            1. Heading comes here
          </h2>
          <p className="leading-7" style={{ color: "var(--muted-foreground)" }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-3 text-base font-bold" style={{ color: "var(--foreground)" }}>
            2. Heading comes here
          </h2>
          <p className="leading-7" style={{ color: "var(--muted-foreground)" }}>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-3 text-base font-bold" style={{ color: "var(--foreground)" }}>
            3. Heading comes here
          </h2>
          <p className="leading-7" style={{ color: "var(--muted-foreground)" }}>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfServiceScreen;
