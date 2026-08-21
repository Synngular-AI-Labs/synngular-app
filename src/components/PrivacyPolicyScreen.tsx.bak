import React, { useRef, useEffect } from "react";
import { X } from "lucide-react";

interface PrivacyPolicyScreenProps {
  onNavigate: (screen: "signin" | "verify" | "terms" | "privacy") => void;
  returnTo: "signin" | "verify" | "terms" | "privacy";
}

const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ onNavigate, returnTo }) => {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.getBoundingClientRect().height;
        document.documentElement.style.setProperty("--header-height", height + "px");
      }
    };
    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, []);

  return (
    <div
      className="flex flex-col min-h-screen w-full"
      style={{
        background: "var(--background)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)"
      }}
    >
      <header
        ref={headerRef}
        className="sticky top-0 z-10 w-full flex items-center justify-between px-4 sm:px-6 pb-2 sm:pb-3 border-b backdrop-blur-sm"
        style={{
          paddingTop: "calc(var(--spacing-base, 1rem) + env(safe-area-inset-top))",
          background: "var(--background)",
          borderColor: "var(--border)"
        }}
      >
        <h1 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
          Privacy Policy
        </h1>
        <button
          type="button"
          onClick={() => onNavigate(returnTo)}
          className="inline-flex items-center justify-center rounded-md p-2"
          style={{ color: "var(--foreground)" }}
          aria-label="Close privacy policy"
        >
          <X size={20} />
        </button>
      </header>

      <div
        className="flex-1 overflow-y-auto px-4 sm:px-6"
        style={{
          paddingTop: "var(--spacing-base, 1.25rem)",
          paddingBottom: "calc(var(--spacing-base, 1.5rem) + env(safe-area-inset-bottom))"
        }}
      >
        <section className="mb-6">
          <h2 className="mb-2 text-sm sm:text-base font-bold" style={{ color: "var(--foreground)" }}>
            1. Our Commitment
          </h2>
          <p className="leading-7 text-sm sm:text-base" style={{ color: "var(--muted-foreground)" }}>
            At Synngular, we believe that privacy is a fundamental right. This Privacy Policy explains how we collect, use, protect, and share your personal information when you use our AI-powered backend development platform. We are committed to being transparent about our data practices and giving you control over your information.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-sm sm:text-base font-bold" style={{ color: "var(--foreground)" }}>
            2. Information We Collect
          </h2>
          <ul
            className="list-disc pl-4 sm:pl-5 space-y-2 sm:space-y-3 leading-7 text-sm sm:text-base"
            style={{ color: "var(--muted-foreground)" }}
          >
            <li>Personal Information: When you create an account, contact us, or use our services, we may collect personal information such as your name, email address, company information, and contact details.</li>
            <li>Usage Data: We automatically collect information about how you use our platform, including your interactions with our AI agents, project data, and system logs.</li>
            <li>Technical Information: We collect technical data such as IP addresses, browser type, device information, and system performance metrics to improve our services.</li>
            <li>Project Data: Information about your backend projects, configurations, and generated code is processed by our AI agents to provide our services.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-sm sm:text-base font-bold" style={{ color: "var(--foreground)" }}>
            3. How We Use Your Information
          </h2>
          <ul
            className="list-disc pl-4 sm:pl-5 space-y-2 sm:space-y-3 leading-7 text-sm sm:text-base"
            style={{ color: "var(--muted-foreground)" }}
          >
            <li>Service Provision: To provide, maintain, and improve our AI-powered backend development platform and related services.</li>
            <li>AI Service Processing: We use your data solely to provide and operate our AI-powered features. We do not use your prompts, content, or personal information to train AI models.</li>
            <li>Communication: To send you important updates about our services, security notifications, and respond to your inquiries.</li>
            <li>Analytics: To understand how our platform is used and identify areas for improvement.</li>
            <li>Security: To protect our platform and users from fraud, abuse, and security threats.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-sm sm:text-base font-bold" style={{ color: "var(--foreground)" }}>
            4. Data Sharing and Disclosure
          </h2>
          <ul
            className="list-disc pl-4 sm:pl-5 space-y-2 sm:space-y-3 leading-7 text-sm sm:text-base"
            style={{ color: "var(--muted-foreground)" }}
          >
            <li>We do not sell, rent, or trade your personal information to third parties for their commercial purposes.</li>
            <li>Service Providers: We may share information with trusted third-party service providers who assist us in operating our platform, subject to strict confidentiality agreements.</li>
            <li>Legal Requirements: We may disclose information when required by law, regulation, or court order, or to protect our rights and the safety of our users.</li>
            <li>Business Transfers: In the event of a merger, acquisition, or sale of assets, user information may be transferred as part of the transaction.</li>
            <li>Anonymized Data: We may share aggregated, anonymized data for research, analytics, or industry insights.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-sm sm:text-base font-bold" style={{ color: "var(--foreground)" }}>
            5. Data Security
          </h2>
          <ul
            className="list-disc pl-4 sm:pl-5 space-y-2 sm:space-y-3 leading-7 text-sm sm:text-base"
            style={{ color: "var(--muted-foreground)" }}
          >
            <li>Encryption: All data transmitted to and from our platform is encrypted using industry-standard SSL/TLS protocols.</li>
            <li>Access Controls: We implement strict access controls and authentication mechanisms to protect user data.</li>
            <li>Regular Audits: Our security practices are regularly reviewed and audited by third-party security experts.</li>
            <li>Data Centers: Our data is stored in secure, certified data centers with physical and digital security measures.</li>
            <li>Incident Response: We have comprehensive incident response procedures in place to address any potential security breaches.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-sm sm:text-base font-bold" style={{ color: "var(--foreground)" }}>
            6. Your Rights and Choices
          </h2>
          <ul
            className="list-disc pl-4 sm:pl-5 space-y-2 sm:space-y-3 leading-7 text-sm sm:text-base"
            style={{ color: "var(--muted-foreground)" }}
          >
            <li>Access: You have the right to access the personal information we hold about you.</li>
            <li>Correction: You can request corrections to any inaccurate or incomplete personal information.</li>
            <li>Deletion: You may request deletion of your personal information, subject to certain legal and business requirements.</li>
            <li>Portability: You have the right to receive your data in a portable format and transfer it to another service.</li>
            <li>Opt-out: You can opt out of non-essential communications and certain data processing activities.</li>
            <li>Account Controls: You can manage your privacy settings and data preferences through your account dashboard.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-sm sm:text-base font-bold" style={{ color: "var(--foreground)" }}>
            7. Cookies and Tracking
          </h2>
          <ul
            className="list-disc pl-4 sm:pl-5 space-y-2 sm:space-y-3 leading-7 text-sm sm:text-base"
            style={{ color: "var(--muted-foreground)" }}
          >
            <li>Essential Cookies: We use necessary cookies to ensure our platform functions properly and securely.</li>
            <li>Analytics: We use analytics cookies to understand user behavior and improve our services.</li>
            <li>Performance: Performance cookies help us optimize our platform's speed and functionality.</li>
            <li>Cookie Controls: You can manage cookie preferences through your browser settings.</li>
            <li>Third-party Tracking: We may use third-party analytics and tracking services, subject to their privacy policies.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-sm sm:text-base font-bold" style={{ color: "var(--foreground)" }}>
            8. Data Retention
          </h2>
          <ul
            className="list-disc pl-4 sm:pl-5 space-y-2 sm:space-y-3 leading-7 text-sm sm:text-base"
            style={{ color: "var(--muted-foreground)" }}
          >
            <li>Account Data: We retain your account information for as long as your account is active or as needed to provide services.</li>
            <li>Project Data: Project and code data is retained according to your subscription plan and data retention settings.</li>
            <li>Logs and Analytics: System logs and analytics data are typically retained for up to 2 years for security and improvement purposes.</li>
            <li>Legal Requirements: Some data may be retained longer if required by law or for legitimate business purposes.</li>
            <li>Deletion Requests: Upon account deletion, we will remove your personal data within 30 days, except where retention is legally required.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-sm sm:text-base font-bold" style={{ color: "var(--foreground)" }}>
            9. International Data Transfers
          </h2>
          <ul
            className="list-disc pl-4 sm:pl-5 space-y-2 sm:space-y-3 leading-7 text-sm sm:text-base"
            style={{ color: "var(--muted-foreground)" }}
          >
            <li>Global Infrastructure: Our services may involve processing data in multiple countries where we or our service providers operate.</li>
            <li>Adequate Protections: We ensure appropriate safeguards are in place for international data transfers, including standard contractual clauses.</li>
            <li>Data Localization: For enterprise customers, we offer data localization options to meet specific regional requirements.</li>
            <li>Privacy Frameworks: We comply with applicable international privacy frameworks and regulations.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-sm sm:text-base font-bold" style={{ color: "var(--foreground)" }}>
            10. Children's Privacy
          </h2>
          <ul
            className="list-disc pl-4 sm:pl-5 space-y-2 sm:space-y-3 leading-7 text-sm sm:text-base"
            style={{ color: "var(--muted-foreground)" }}
          >
            <li>Age Restrictions: Our services are not intended for individuals under the age of 13, and we do not knowingly collect personal information from children under 13.</li>
            <li>Parental Consent: If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.</li>
            <li>Teen Users: Users between 13 and 18 should have parental consent before using our services.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-sm sm:text-base font-bold" style={{ color: "var(--foreground)" }}>
            11. Changes to This Policy
          </h2>
          <ul
            className="list-disc pl-4 sm:pl-5 space-y-2 sm:space-y-3 leading-7 text-sm sm:text-base"
            style={{ color: "var(--muted-foreground)" }}
          >
            <li>Policy Updates: We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws.</li>
            <li>Notification: We will notify users of material changes through email or prominent notices on our platform.</li>
            <li>Effective Date: Changes become effective on the date specified in the updated policy.</li>
            <li>Review Frequency: We recommend reviewing this policy periodically to stay informed about our privacy practices.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-sm sm:text-base font-bold" style={{ color: "var(--foreground)" }}>
            12. Third-Party Integrations and AI Providers
          </h2>
          <ul
            className="list-disc pl-4 sm:pl-5 space-y-2 sm:space-y-3 leading-7 text-sm sm:text-base"
            style={{ color: "var(--muted-foreground)" }}
          >
            <li>Our platform enables users to connect third-party applications, services, data sources, and their own Large Language Model (LLM) providers to power user-configured AI agents and workflows.</li>
            <li>Use of Connector Data: Data accessed through third-party integrations is used solely to execute the actions requested by the user through their configured AI agents. Synngular does not read, analyze, mine, retain, or use connector data for any purpose other than facilitating the requested AI workflow.</li>
            <li>Bring Your Own LLM (BYO LLM): Synngular operates on a Bring Your Own LLM (BYO LLM) model. Users are responsible for configuring and connecting their preferred AI provider (such as OpenAI, Anthropic, Google, Azure OpenAI, or other supported providers). Synngular does not provide, host, own, or operate any Large Language Models.</li>
            <li>When a user chooses to connect an external LLM provider: Requests are transmitted only as necessary to fulfill the user's instructions. The collection, processing, storage, retention, and use of data by the selected LLM provider are governed exclusively by the agreement, privacy policy, and terms between the user and that provider. Synngular does not control or assume responsibility for how third-party LLM providers process or retain user data. Users are responsible for reviewing and accepting the privacy and data handling practices of their chosen LLM provider before enabling the integration.</li>
            <li>Data Responsibility: Synngular acts solely as the platform that facilitates communication between your configured AI agents, connected services, and your selected LLM provider. Except as required to deliver the requested functionality, Synngular does not process, retain, or repurpose connector data or AI requests for its own benefit, including for AI training, model improvement, or commercial analytics.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-sm sm:text-base font-bold" style={{ color: "var(--foreground)" }}>
            13. Questions About Your Privacy?
          </h2>
          <ul
            className="list-disc pl-4 sm:pl-5 space-y-2 sm:space-y-3 leading-7 text-sm sm:text-base"
            style={{ color: "var(--muted-foreground)" }}
          >
            <li>If you have any questions about this Privacy Policy or our data practices, please don't hesitate to contact us. We're here to help and ensure your privacy concerns are addressed.</li>
            <li>Contact us: privacy@synngular.com</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyScreen;