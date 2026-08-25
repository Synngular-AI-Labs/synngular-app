import React from "react";

interface TermsOfServiceScreenProps {
  onNavigate: (screen: "signin" | "verify" | "terms" | "privacy") => void;
  returnTo: "signin" | "verify" | "terms" | "privacy";
}

const TermsOfServiceScreen: React.FC<TermsOfServiceScreenProps> = ({ onNavigate, returnTo }) => {
  return (
    <div
      className="flex flex-col min-h-screen w-full"
      style={{
        background: "var(--background)",
        paddingLeft: "var(--safe-left)",
        paddingRight: "var(--safe-right)"
      }}
    >
      <header
        className="sticky top-0 z-10 w-full h-[3.25rem] flex items-center px-4 sm:px-6 border-b backdrop-blur-sm"
        style={{
          paddingTop: "calc(var(--spacing-base, 0.5rem) + var(--safe-top))",
          paddingBottom: "var(--spacing-base, 0.5rem)",
          background: "var(--background)",
          borderColor: "var(--border)"
        }}
      >
        <h1 className="text-[20px] leading-[30px] font-semibold flex-1" style={{ color: "var(--foreground)" }}>
          Terms of Service
        </h1>
        <button
          type="button"
          onClick={() => onNavigate(returnTo)}
          className="inline-flex items-center justify-center rounded-full w-8 h-8 flex-shrink-0"
          style={{ color: "var(--foreground)" }}
          aria-label="Close terms of service"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
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
            1. Agreement Overview
          </h2>
          <p className="text-[14px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>
            By accessing or using the Synngular platform, you agree to be bound by these Terms of Service. These terms govern your use of our AI-powered backend development platform and its related services. Please read them carefully. If you do not agree with any part of these terms, you must not use our services.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-[16px] leading-[24px] font-semibold" style={{ color: "var(--foreground)" }}>
            2. Acceptable Use
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[14px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>
            <li>You agree to use our platform only for lawful purposes and in accordance with these terms.</li>
            <li>You must not use our services to generate, distribute, or facilitate illegal content, harmful code, or unauthorized access to systems.</li>
            <li>You are responsible for ensuring your AI-generated code meets applicable legal, security, and quality standards.</li>
            <li>You must not attempt to reverse engineer, decompile, or extract source code from our platform.</li>
            <li>You agree not to use automated tools or scripts to access our platform in ways that exceed the stated usage limits.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-[16px] leading-[24px] font-semibold" style={{ color: "var(--foreground)" }}>
            3. User Accounts and Security
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[14px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>
            <li>You must create an account to access certain features of our platform. You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You agree to notify us immediately of any unauthorized access or security breach.</li>
            <li>We reserve the right to suspend or terminate accounts that violate these terms or engage in suspicious activity.</li>
            <li>You may not share your account credentials or allow others to access your account.</li>
            <li>You are responsible for all activities that occur under your account.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-[16px] leading-[24px] font-semibold" style={{ color: "var(--foreground)" }}>
            4. Intellectual Property Rights
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[14px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>
            <li>Our platform, including its design, text, graphics, logos, and software, is protected by intellectual property laws.</li>
            <li>You retain ownership of the code and projects you create using our platform, subject to your chosen open-source licenses.</li>
            <li>We grant you a limited, non-exclusive, non-transferable license to use our platform for your development needs.</li>
            <li>You may not reproduce, modify, or distribute our proprietary tools, templates, or platform components without explicit permission.</li>
            <li>You agree to respect the intellectual property rights of others and not infringe on third-party rights through your use of our services.</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="mb-2 text-[16px] leading-[24px] font-semibold" style={{ color: "var(--foreground)" }}>
            5. Service Availability and Modifications
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[14px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>
            <li>We aim to provide reliable access to our platform but do not guarantee uninterrupted or error-free service.</li>
            <li>We may modify, suspend, or discontinue parts of our service with or without notice to maintain, upgrade, or improve our platform.</li>
            <li>We reserve the right to update these terms at any time. Continued use of our services constitutes acceptance of modified terms.</li>
            <li>We will notify users of significant changes through email or platform announcements.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-[16px] leading-[24px] font-semibold" style={{ color: "var(--foreground)" }}>
            6. AI-Generated Content and Responsibility
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[14px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>
            <li>You are solely responsible for reviewing, testing, and validating any AI-generated code before deploying it to production.</li>
            <li>Our AI agents may generate code that contains errors, vulnerabilities, or performance issues. You must ensure generated code meets your project's quality standards.</li>
            <li>You are responsible for obtaining necessary licenses, permissions, and compliance approvals for your AI-generated content.</li>
            <li>You agree not to use our AI services to generate content that violates intellectual property rights, privacy laws, or applicable regulations.</li>
            <li>You maintain full responsibility for the legal compliance and ethical use of AI-generated code in your projects.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-[16px] leading-[24px] font-semibold" style={{ color: "var(--foreground)" }}>
            7. Third-Party Integrations and AI Providers
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[14px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>
            <li>Our platform integrates with third-party services and allows you to connect your own LLM providers for AI agent functionality.</li>
            <li>Your use of third-party integrations is subject to the terms and conditions of those respective providers.</li>
            <li>We are not responsible for the availability, accuracy, or security of third-party services you connect to our platform.</li>
            <li>Bring Your Own LLM (BYO LLM): Users are responsible for configuring and connecting their preferred AI provider. Synngular does not provide, host, own, or operate any Large Language Models.</li>
            <li>Data transmitted to your connected LLM provider is subject to that provider's terms, privacy policy, and data handling practices.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-[16px] leading-[24px] font-semibold" style={{ color: "var(--foreground)" }}>
            8. Limitation of Liability
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[14px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>
            <li>To the maximum extent permitted by law, Synngular shall not be liable for any indirect, incidental, special, consequential, or punitive damages.</li>
            <li>We are not liable for damages resulting from your use of AI-generated code, including data loss, business interruption, or security breaches.</li>
            <li>Our liability shall not exceed the amount you paid us in the 12 months preceding the claim, if applicable.</li>
            <li>We are not responsible for delays, errors, or failures caused by third-party services, internet connectivity, or user equipment.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-[16px] leading-[24px] font-semibold" style={{ color: "var(--foreground)" }}>
            9. Data Processing and Third-Party Services
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[14px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>
            <li>We use third-party services for essential platform operations, analytics, and service improvement.</li>
            <li>Data transmitted to these services is governed by their respective privacy policies and terms.</li>
            <li>We ensure third-party providers meet industry-standard security and data protection requirements.</li>
            <li>You acknowledge that certain data processing occurs through these trusted third-party providers.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-[16px] leading-[24px] font-semibold" style={{ color: "var(--foreground)" }}>
            10. Indemnification
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[14px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>
            <li>You agree to indemnify and hold harmless Synngular, its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of our services.</li>
            <li>This includes liability for your violation of these terms, infringement of third-party rights, or misuse of AI-generated content.</li>
            <li>You agree to cooperate in our defense of any such claims and cover reasonable legal costs.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-[16px] leading-[24px] font-semibold" style={{ color: "var(--foreground)" }}>
            11. Beta and Experimental Features
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[14px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>
            <li>Our platform may include beta, experimental, or preview features that are still under development.</li>
            <li>These features are provided 'as is' without warranties and may not work as expected or may change without notice.</li>
            <li>You participate in beta programs at your own risk and agree to provide feedback when requested.</li>
            <li>Beta features may have limited support and different terms of use.</li>
            <li>We may discontinue beta features at any time without liability.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-[16px] leading-[24px] font-semibold" style={{ color: "var(--foreground)" }}>
            12. Termination
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[14px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>
            <li>You may terminate your account at any time by following the account closure process in your account settings.</li>
            <li>We may suspend or terminate your account immediately if you violate these terms or engage in activities that harm our platform or other users.</li>
            <li>Upon termination, your right to use our services ceases immediately, though certain provisions of these terms will survive termination.</li>
            <li>We will provide reasonable notice before termination except in cases of material breach or legal requirements.</li>
            <li>You remain responsible for all charges incurred prior to termination.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-[16px] leading-[24px] font-semibold" style={{ color: "var(--foreground)" }}>
            13. Dispute Resolution
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[14px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>
            <li>Any disputes arising from these terms will be resolved through binding arbitration rather than in court, except where prohibited by law.</li>
            <li>The arbitration will be conducted by a neutral arbitrator in accordance with established arbitration rules.</li>
            <li>You agree to waive your right to participate in class action lawsuits or class-wide arbitrations.</li>
            <li>This agreement is governed by the laws of [Jurisdiction], without regard to conflict of law provisions.</li>
            <li>If any provision of these terms is found to be unenforceable, the remaining provisions will continue to be valid and enforceable.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-[16px] leading-[24px] font-semibold" style={{ color: "var(--foreground)" }}>
            14. Questions About These Terms?
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[14px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>
            <li>If you have any questions about these Terms and Conditions or need clarification on any provisions, please contact our legal team. We're here to help you understand your rights and obligations.</li>
            <li>Contact us: legal@synngular.com</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default TermsOfServiceScreen;
