import React, { useState } from "react";
import logoAsset from "../assets/logo.png";
import { getSubscriptionStatus, hasActiveSubscription } from "../lib/api/subscription";
import { ApiError } from "../lib/api/client";

// ── Types ────────────────────────────────────────────────────────────────
type Screen = "signin" | "project-select";

interface SubscriptionScreenProps {
  onNavigate: (screen: Screen) => void;
  organizationId: string | null;
}

// ── SubscriptionScreen ────────────────────────────────────────────────────
// The paywall gate: reached when GET /api/subscription/status comes back
// with hasSubscription === false (or a CANCELED status) right after sign-in.
// There's no purchase/checkout API to wire up yet, so this only re-checks
// status (in case the org subscribed elsewhere) and offers a way back to
// sign-in — the actual upgrade flow lives outside the app for now.
const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ onNavigate, organizationId }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = async () => {
    if (!organizationId) {
      setError("No organization found for this account.");
      return;
    }
    setIsChecking(true);
    setError(null);
    try {
      const status = await getSubscriptionStatus(organizationId);
      if (hasActiveSubscription(status)) {
        onNavigate("project-select");
      } else {
        setError("Still no active subscription on this organization.");
      }
    } catch (err) {
      console.error("getSubscriptionStatus failed:", err);
      if (err instanceof ApiError) {
        const body = err.body as { error?: string; details?: string } | undefined;
        setError(body?.details ?? body?.error ?? "Something went wrong");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center bg-[var(--background)] overflow-hidden"
      style={{
        height:  "100dvh",
        padding: "0 clamp(1.25rem, 6vw, 2rem)",
      }}
    >
      <img
        src={logoAsset}
        alt="Logo"
        className="object-contain mx-auto mb-[var(--spacing-16)]"
        style={{ width: "clamp(4rem, 12vw, 6.25rem)", aspectRatio: "1 / 1" }}
      />

      <h1
        className="font-semibold text-center"
        style={{ fontSize: "clamp(1.25rem, 5.5vw, 1.5rem)", lineHeight: 1.4, color: "var(--grey-1000)" }}
      >
        Subscription required
      </h1>

      <p
        className="font-medium text-center mt-2"
        style={{
          fontSize:   "clamp(0.8125rem, 3.6vw, 0.875rem)",
          lineHeight: 1.5,
          color:      "var(--grey-700)",
          maxWidth:   "min(90%, 22rem)",
        }}
      >
        Your organization doesn't have an active subscription. Subscribe to continue using Synngular.
      </p>

      {error && (
        <p
          className="text-center mt-3"
          style={{ fontSize: "0.8125rem", color: "var(--error-600)" }}
        >
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleRefresh}
        disabled={isChecking}
        className="inline-flex w-fit max-w-full items-center justify-center rounded-full bg-[var(--purple-1000)] text-white font-semibold shadow-sm transition-opacity active:opacity-90 touch-manipulation disabled:opacity-60 mt-6"
        style={{
          paddingInline: "clamp(1.25rem, 6vw, 1.75rem)",
          paddingBlock:  "clamp(0.8125rem, 3.4vw, 1rem)",
          fontSize:      "clamp(0.9375rem, 4vw, 1rem)",
        }}
      >
        {isChecking ? "Checking..." : "I've subscribed — refresh"}
      </button>

      <button
        type="button"
        onClick={() => onNavigate("signin")}
        className="font-semibold mt-4 touch-manipulation"
        style={{ fontSize: "0.875rem", color: "var(--purple-1000)" }}
      >
        Sign out
      </button>
    </div>
  );
};

export default SubscriptionScreen;
