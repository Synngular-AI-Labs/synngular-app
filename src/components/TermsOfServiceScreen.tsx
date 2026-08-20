import React from "react";
import { X } from "lucide-react";

interface TermsOfServiceScreenProps {
  onNavigate: (screen: "signin" | "verify" | "terms" | "privacy") => void;
  returnTo: "signin" | "verify" | "terms" | "privacy";
}

const TermsOfServiceScreen: React.FC<TermsOfServiceScreenProps> = ({ onNavigate, returnTo }) => {
  return (
    <div
      className="flex flex-col min-h-screen w-full"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingLeft: "calc(var(--spacing-horizontal, 1rem) + env(safe-area-inset-left))",
        paddingRight: "calc(var(--spacing-horizontal, 1rem) + env(safe-area-inset-right))"
      }}
    >
      <header
        className="sticky top-0 z-10 w-full bg-background flex items-center justify-between px-6 border-b"
        style={{
          paddingTop: "calc(var(--spacing-base, 1rem) + env(safe-area-inset-top))",
          background: "var(--background)",
          borderColor: "var(--border)"
        }}
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

      <div
        className="overflow-y-auto flex-1 px-4 sm:px-6 py-5"
        style={{
          paddingBottom: "calc(var(--spacing-base, 1.5rem) + env(safe-area-inset-bottom))"
        }}
      >
        <section className="mb-6">
          <h2 className="mb-2 text-sm sm:text-base font-bold" style={{ color: "var(--foreground)" }}>
            1. Agreement Overview
          </h2>
          <p className="leading-7 text-sm sm:text-base" style={{ color: "var(--muted-foreground)" }}>
            These Terms and Conditions ("Terms") govern your use of Synngular's AI-powered backend development platform and services. By using our platform, you agree to comply with and be bound by these terms. Please read them carefully as they contain important information about your rights and obligations.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-sm sm:text-base font-bold" style={{ color: "var(--foreground)" }}>
            2. Acceptance of Terms
          </h2>
          <ul className="list-disc pl-4 sm:pl-5 space-y-2 sm:space-y-3 leading-7 text-sm sm:text-base" style={{ color: "var(--muted-foreground)" }}>
            <li>By accessing and using Synngular's AI-powered backend development platform, you accept and agree to be bound by the terms and provision of this agreement.</li>
            <li>If you do not agree to abide by the above, please do not use this service.</li>
            <li>These Terms of Service may be updated by us from time to time without notice to you.</li>
            <li>Your continued use of the platform following any changes indicates your acceptance of the new terms.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-sm sm:text-base font-bold" style={{ color: "var(--foreground)" }}>
            3. Service Description
          </h2>
          <ul className="list-disc pl-4 sm:pl-5 space-y-2 sm:space-y-3 leading-7 text-sm sm:text-base" style={{ color: "var(--muted-foreground)" }}>
            <li>Synngular provides an AI-powered platform for automated backend development, including but not limited to code generation, testing, deployment, and monitoring services.</li>
            <li>Our AI agents assist in building, maintaining, and scaling backend systems according to user specifications.</li>
            <li>The platform includes features for project management, code collaboration, and automated DevOps processes.</li>
            <li>We reserve the right to modify, suspend, or discontinue any part of our service at any time with reasonable notice.</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="mb-2 text-sm sm:text-base font-bold" style={{ color: "var(--foreground)" }}>
            4. User Accounts and Responsibilities
          </h2>
          <ul className="list-disc pl-4 sm:pl-5 space-y-2 sm:space-y-3 leading-7 text-sm sm:text-base" style={{ color: "var(--muted-foreground)" }}>
            <li>You must create an account to access certain features of our platform. You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You agree to provide accurate, current, and complete information during the registration process and to update such information as necessary.</li>
            <li>You are responsible for all activities that occur under your account and for ensuring that your use of the service complies with all applicable laws and regulations.</li>
            <li>You must notify us immediately of any unauthorized use of your account or any other breach of security.</li>
            <li>We reserve the right to suspend or terminate accounts that violate these terms or engage in suspicious or harmful activities.</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="mb-2 text-sm sm:text-base font-bold" style={{ color: "var(--foreground)" }}>
            5. Acceptable Use Policy
          </h2>
          <ul className="list-disc pl-4 sm:pl-5 space-y-2 sm:space-y-3 leading-7 text-sm sm:text-base" style={{ color: "var(--muted-foreground)" }}>
            <li>You agree not to use our platform for any unlawful purpose or in any way that could damage, disable, or impair our services.</li>
            <li>Prohibited activities include but are not limited to: generating malicious code, attempting to hack or breach security systems, or violating intellectual property rights.</li>
            <li>You may not use our service to create content that is harmful, threatening, abusive, defamatory, or otherwise objectionable.</li>
            <li>Reverse engineering, decompiling, or attempting to extract our proprietary algorithms or AI models is strictly prohibited.</li>
            <li>You agree not to interfere with or disrupt our services or servers connected to our platform.</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="mb-2 text-sm sm:text-base font-bold" style={{ color: "var(--foreground)" }}>
            6. Intellectual Property Rights
          </h2>
          <ul className="list-disc pl-4 sm:pl-5 space-y-2 sm:space-y-3 leading-7 text-sm sm:text-base" style={{ color: "var(--muted-foreground)" }}>
            <li>Synngular owns all intellectual property rights in our platform, including our AI models, algorithms, software, and proprietary technologies.</li>
            <li>You retain ownership of the code and projects you create using our platform, subject to our license to provide the service.</li>
            <li>By using our service, you grant us a license to use, process, and analyze your project data to improve our AI models and services (in anonymized form).</li>
            <li>You represent and warrant that you have all necessary rights to any content, code, or data you upload to our platform.</li>
            <li>We respect intellectual property rights and will respond to valid DMCA takedown notices.</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="mb-2 text-sm sm:text-base font-bold" style={{ color: "var(--foreground)" }}>
            7. Payment Terms and Billing
          </h2>
          <ul className="list-disc pl-4 sm:pl-5 space-y-2 sm:space-y-3 leading-7 text-sm sm:text-base" style={{ color: "var(--muted-foreground)" }}>
            <li>Certain features of our platform require payment of fees. All fees are non-refundable unless explicitly stated otherwise.</li>
            <li>Subscription fees are billed in advance on a monthly or annual basis, depending on your chosen plan.</li>
            <li>You authorize us to charge your designated payment method for all applicable fees and taxes.</li>
            <li>Price changes will be communicated with at least 30 days' notice for existing subscribers.</li>
            <li>Failure to pay fees may result in suspension or termination of your account and access to our services.</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="mb-2 text-sm sm:text-base font-bold" style={{ color: "var(--foreground)" }}>
            8. Data Protection and Privacy
          </h2>
          <ul className="list-disc pl-4 sm:pl-5 space-y-2 sm:space-y-3 leading-7 text-sm sm:text-base" style={{ color: "var(--muted-foreground)" }}>
            <li>Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy.</li>
            <li>We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration, disclosure, or destruction.</li>
            <li>You acknowledge that data transmission over the internet is not completely secure, and we cannot guarantee the security of data during transmission.</li>
            <li>We comply with applicable data protection laws, including GDPR and other regional privacy regulations.</li>
            <li>You have the right to access, correct, or delete your personal data as outlined in our Privacy Policy.</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="mb-2 text-sm sm:text-base font-bold" style={{ color: "var(--foreground)" }}>
            9. Service Availability and Support
          </h2>
          <ul className="list-disc pl-4 sm:pl-5 space-y-2 sm:space-y-3 leading-7 text-sm sm:text-base" style={{ color: "var(--muted-foreground)" }}>
            <li>We strive to maintain high availability of our services but do not guarantee uninterrupted or error-free operation.</li>
            <li>Scheduled maintenance will be announced in advance when possible, though emergency maintenance may occur without notice.</li>
            <li>Support is provided according to your subscription level, with response times varying based on the nature and urgency of the issue.</li>
            <li>We reserve the right to impose usage limits and restrictions to ensure fair use and optimal performance for all users.</li>
            <li>Service level agreements (SLAs) are available for enterprise customers and are defined in separate agreements.</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="mb-2 text-sm sm:text-base font-bold" style={{ color: "var(--foreground)" }}>
            10. Limitation of Liability
          </h2>
          <ul className="list-disc pl-4 sm:pl-5 space-y-2 sm:space-y-3 leading-7 text-sm sm:text-base" style={{ color: "var(--muted-foreground)" }}>
            <li>Our liability to you is limited to the greatest extent permitted by applicable law.</li>
            <li>We shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our service.</li>
            <li>Our total liability for any claims arising from or related to these terms shall not exceed the amount paid by you for our services in the 12 months preceding the claim.</li>
            <li>We do not warrant that our service will be uninterrupted, error-free, or meet your specific requirements.</li>
            <li>You acknowledge that AI-generated code may contain errors and should be reviewed and tested before production use.</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="mb-2 text-sm sm:text-base font-bold" style={{ color: "var(--foreground)" }}>
            11. Beta and Experimental Features
          </h2>
          <ul className="list-disc pl-4 sm:pl-5 space-y-2 sm:space-y-3 leading-7 text-sm sm:text-base" style={{ color: "var(--muted-foreground)" }}>
            <li>Our platform may include beta, experimental, or preview features that are still under development.</li>
            <li>These features are provided 'as is' without warranties and may not work as expected or may change without notice.</li>
            <li>You participate in beta programs at your own risk and agree to provide feedback when requested.</li>
            <li>Beta features may have limited support and different terms of use.</li>
            <li>We may discontinue beta features at any time without liability.</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="mb-2 text-sm sm:text-base font-bold" style={{ color: "var(--foreground)" }}>
            12. Termination
          </h2>
          <ul className="list-disc pl-4 sm:pl-5 space-y-2 sm:space-y-3 leading-7 text-sm sm:text-base" style={{ color: "var(--muted-foreground)" }}>
            <li>You may terminate your account at any time by following the account closure process in your account settings.</li>
            <li>We may suspend or terminate your account immediately if you violate these terms or engage in activities that harm our platform or other users.</li>
            <li>Upon termination, your right to use our services ceases immediately, though certain provisions of these terms will survive termination.</li>
            <li>We will provide reasonable notice before termination except in cases of material breach or legal requirements.</li>
            <li>You remain responsible for all charges incurred prior to termination.</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="mb-2 text-sm sm:text-base font-bold" style={{ color: "var(--foreground)" }}>
            13. Dispute Resolution
          </h2>
          <ul className="list-disc pl-4 sm:pl-5 space-y-2 sm:space-y-3 leading-7 text-sm sm:text-base" style={{ color: "var(--muted-foreground)" }}>
            <li>Any disputes arising from these terms will be resolved through binding arbitration rather than in court, except where prohibited by law.</li>
            <li>The arbitration will be conducted by a neutral arbitrator in accordance with established arbitration rules.</li>
            <li>You agree to waive your right to participate in class action lawsuits or class-wide arbitrations.</li>
            <li>This agreement is governed by the laws of [Jurisdiction], without regard to conflict of law provisions.</li>
            <li>If any provision of these terms is found to be unenforceable, the remaining provisions will continue to be valid and enforceable.</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="mb-2 text-sm sm:text-base font-bold" style={{ color: "var(--foreground)" }}>
            14. Questions About These Terms?
          </h2>
          <ul className="list-disc pl-4 sm:pl-5 space-y-2 sm:space-y-3 leading-7 text-sm sm:text-base" style={{ color: "var(--muted-foreground)" }}>
            <li>If you have any questions about these Terms and Conditions or need clarification on any provisions, please contact our legal team. We're here to help you understand your rights and obligations.</li>
            <li>Contact us:legal@synngular.com</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default TermsOfServiceScreen;
