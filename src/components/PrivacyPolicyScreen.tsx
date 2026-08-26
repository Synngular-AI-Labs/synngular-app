import React from "react";

interface PrivacyPolicyScreenProps {
  onNavigate: (screen: "signin" | "verify" | "terms" | "privacy") => void;
  returnTo: "signin" | "verify" | "terms" | "privacy";
}

const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ onNavigate, returnTo }) => {
  return (
    <div
      className="flex flex-col min-h-screen w-full"
      style={{
        background: "var(--background)",
        paddingTop: "max(var(--safe-top), 2.75rem)",
        paddingLeft: "var(--safe-left)",
        paddingRight: "var(--safe-right)"
      }}
    >
      {/*
       * h-[3.25rem] (52px) with items-center vertically centers the 30px
       * line-height title on its own, giving an even 11px above and below
       * the text (52 - 30 = 22, split evenly) without needing any padding
       * of its own — the device's safe-top inset is handled separately by
       * the screen wrapper above, so it can't eat into that split.
       */}
      <header
        className="sticky top-0 z-10 w-full h-[3.25rem] flex items-center gap-2 border-b backdrop-blur-sm"
        style={{
          paddingLeft: "var(--spacing-16)",
          paddingRight: 0,
          paddingTop: 0,
          paddingBottom: 0,
          background: "var(--background)",
          borderColor: "var(--border)"
        }}
      >
        <h1 className="text-[20px] leading-[30px] font-semibold flex-1" style={{ color: "var(--foreground)" }}>
          Privacy Policy
        </h1>
        <button
          type="button"
          onClick={() => onNavigate(returnTo)}
          className="inline-flex items-center justify-center rounded-full w-10 h-10 flex-shrink-0"
          style={{ color: "var(--foreground)" }}
          aria-label="Close privacy policy"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </header>

      <div
        className="flex-1 overflow-y-auto px-4 sm:px-6"
        style={{
          paddingTop: "var(--spacing-base, 1.25rem)",
          paddingBottom: "calc(var(--spacing-base, 1.5rem) + var(--safe-bottom))"
        }}
      >
        <section className="mb-6">
          <h2 className="mb-2 text-[16px] leading-[24px] font-semibold" style={{ color: "var(--foreground)" }}>
            1. Our Commitment
          </h2>
          <p className="text-[14px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>
            At Synngular, we believe that privacy is a fundamental right. This Privacy Policy explains how we collect, use, protect, and share your personal information when you use our AI-powered backend development platform. We are committed to being transparent about our data practices and giving you control over your information.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-[16px] leading-[24px] font-semibold" style={{ color: "var(--foreground)" }}>
            2. Information We Collect
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[14px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>
            <li>Personal Information: When you create an account, contact us, or use our services, we may collect personal information such as your name, email address, company information, and contact details.</li>
            <li>Usage Data: We automatically collect information about how you use our platform, including your interactions with our AI agents, project data, and system logs.</li>
            <li>Technical Information: We collect technical data such as IP addresses, browser type, device information, and system performance metrics to improve our services.</li>
            <li>Project Data: Information about your backend projects, configurations, and generated code is processed by our AI agents to provide our services.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-[16px] leading-[24px] font-semibold" style={{ color: "var(--foreground)" }}>
            3. How We Use Your Information
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[14px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>
            <li>Service Provision: To provide, maintain, and improve our AI-powered backend development platform and related services.</li>
            <li>AI Service Processing: We use your data solely to provide and operate our AI-powered features. We do not use your prompts, content, or personal information to train AI models.</li>
            <li>Communication: To send you important updates about our services, security notifications, and respond to your inquiries.</li>
            <li>Analytics: To understand how our platform is used and identify areas for improvement.</li>
            <li>Security: To protect our platform and users from fraud, abuse, and security threats.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-[16px] leading-[24px] font-semibold" style={{ color: "var(--foreground)" }}>
            4. Data Sharing and Disclosure
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[14px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>
            <li>We do not sell, rent, or trade your personal information to third parties for their commercial purposes.</li>
            <li>Service Providers: We may share information with trusted third-party service providers who assist us in operating our platform, subject to strict confidentiality agreements.</li>
            <li>Legal Requirements: We may disclose information when required by law, regulation, or court order, or to protect our rights and the safety of our users.</li>
            <li>Business Transfers: In the event of a merger, acquisition, or sale of assets, user information may be transferred as part of the transaction.</li>
            <li>Anonymized Data: We may share aggregated, anonymized data for research, analytics, or industry insights.</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="mb-2 text-[16px] leading-[24px] font-semibold" style={{ color: "var(--foreground)" }}>
            5. Data Security
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[14px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>
            <li>We implement industry-standard security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</li>
            <li>Our security measures include encryption, access controls, regular security audits, and employee training on data protection.</li>
            <li>While we strive to protect your personal information, we cannot guarantee its absolute security and encourage you to take precautions to protect your account credentials.</li>
            <li>In the event of a data breach, we will notify affected users as required by applicable law and regulations.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-[16px] leading-[24px] font-semibold" style={{ color: "var(--foreground)" }}>
            6. Data Retention
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[14px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>
            <li>We retain your personal information for as long as your account is active or as needed to provide our services.</li>
            <li>We may retain certain information to resolve disputes, enforce our agreements, or comply with legal obligations.</li>
            <li>When data is no longer needed, we securely delete or anonymize it in accordance with our retention policies.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-[16px] leading-[24px] font-semibold" style={{ color: "var(--foreground)" }}>
            7. Your Rights and Choices
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[14px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>
            <li>Access and Control: You have the right to access, update, or delete your personal information through your account settings.</li>
            <li>Data Portability: You may request a copy of your personal data in a machine-readable format.</li>
            <li>Opt-Out: You can opt out of receiving marketing communications and manage your notification preferences at any time.</li>
            <li>Cookie Management: You can control cookie settings through your browser preferences. Note that disabling cookies may affect certain platform features.</li>
            <li>Restriction of Processing: Under certain circumstances, you may request that we restrict the processing of your personal data.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-[16px] leading-[24px] font-semibold" style={{ color: "var(--foreground)" }}>
            8. Children's Privacy
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[14px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>
            <li>Our platform is not intended for children under 13 years of age.</li>
            <li>We do not knowingly collect personal information from children under 13. If we learn that we have collected data from a child under 13, we will take steps to delete that information promptly.</li>
            <li>Parents or guardians who believe we have data from their child should contact us immediately.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-[16px] leading-[24px] font-semibold" style={{ color: "var(--foreground)" }}>
            9. International Data Transfers
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[14px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>
            <li>Your information may be transferred to and processed in countries other than your country of residence.</li>
            <li>We ensure adequate protections are in place for international data transfers, including standard contractual clauses and data processing agreements.</li>
            <li>By using our platform, you consent to the transfer of your information to other countries.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-[16px] leading-[24px] font-semibold" style={{ color: "var(--foreground)" }}>
            10. California Privacy Rights
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[14px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>
            <li>If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA).</li>
            <li>You have the right to know what personal information we collect, use, or share, and to request deletion of your personal information.</li>
            <li>We do not sell your personal information as defined by the CCPA.</li>
            <li>To exercise your rights, please contact us at privacy@synngular.com.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-[16px] leading-[24px] font-semibold" style={{ color: "var(--foreground)" }}>
            11. Changes to This Privacy Policy
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[14px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>
            <li>Policy Updates: We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws.</li>
            <li>Notification: We will notify users of material changes through email or prominent notices on our platform.</li>
            <li>Effective Date: Changes become effective on the date specified in the updated policy.</li>
            <li>Review Frequency: We recommend reviewing this policy periodically to stay informed about our privacy practices.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-[16px] leading-[24px] font-semibold" style={{ color: "var(--foreground)" }}>
            12. Third-Party Integrations and AI Providers
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[14px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>
            <li>Our platform enables users to connect third-party applications, services, data sources, and their own Large Language Model (LLM) providers to power user-configured AI agents and workflows.</li>
            <li>Use of Connector Data: Data accessed through third-party integrations is used solely to execute the actions requested by the user through their configured AI agents. Synngular does not read, analyze, mine, retain, or use connector data for any purpose other than facilitating the requested AI workflow.</li>
            <li>Bring Your Own LLM (BYO LLM): Synngular operates on a Bring Your Own LLM (BYO LLM) model. Users are responsible for configuring and connecting their preferred AI provider. Synngular does not provide, host, own, or operate any Large Language Models.</li>
            <li>When a user chooses to connect an external LLM provider: Requests are transmitted only as necessary to fulfill the user's instructions. The collection, processing, storage, retention, and use of data by the selected LLM provider are governed exclusively by the agreement, privacy policy, and terms between the user and that provider.</li>
            <li>Data Responsibility: Synngular acts solely as the platform that facilitates communication between your configured AI agents, connected services, and your selected LLM provider. Except as required to deliver the requested functionality, Synngular does not process, retain, or repurpose connector data or AI requests for its own benefit.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-[16px] leading-[24px] font-semibold" style={{ color: "var(--foreground)" }}>
            13. Questions About Your Privacy?
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[14px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>
            <li>If you have any questions about this Privacy Policy or our data practices, please don't hesitate to contact us. We're here to help and ensure your privacy concerns are addressed.</li>
            <li>Contact us: privacy@synngular.com</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyScreen;

