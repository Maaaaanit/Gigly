import React from 'react';
import PublicNavbar from '../components/layout/PublicNavbar';

const Section = ({ title, children }) => (
  <section className="mt-10">
    <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
    <div className="space-y-3 text-sm text-gray-600 leading-relaxed">{children}</div>
  </section>
);

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
        <p className="text-sm text-gray-400 mt-2">Effective date: January 1, 2025 · Last updated: January 1, 2025</p>
        <p className="text-sm text-gray-600 mt-4">Please read these Terms carefully before using Gigly. By creating an account or using the platform, you agree to be bound by these terms.</p>

        <Section title="1. About Gigly">
          <p>Gigly is an online marketplace that connects clients who need work done with freelancers who offer services. Gigly provides the platform tools — for job posting, proposals, contracts, milestones, invoicing, messaging, and dispute resolution. Gigly is not a party to any contract between a client and a freelancer, and is not an employer of any freelancer on the platform.</p>
        </Section>
        <hr className="mt-10 border-gray-100" />

        <Section title="2. Eligibility">
          <p>To use Gigly, you must:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Be at least 18 years of age</li>
            <li>Be legally capable of entering into binding contracts under Indian law</li>
            <li>Not be barred from receiving services under applicable law</li>
            <li>Provide accurate, current, and complete information during registration</li>
          </ul>
        </Section>
        <hr className="mt-10 border-gray-100" />

        <Section title="3. Accounts">
          <p><strong>Registration:</strong> You must register with a valid email and create a password. You are responsible for keeping your credentials confidential. Do not share your account.</p>
          <p><strong>Roles:</strong> You register as either a Client (to post jobs and hire) or a Freelancer (to submit proposals and take on work). Your role determines your permissions on the platform.</p>
          <p><strong>Account termination:</strong> You may delete your account at any time. We may suspend or terminate accounts that violate these Terms, engage in fraud, or abuse other users.</p>
          <p><strong>One account per person:</strong> You may not create multiple accounts to circumvent a suspension or manipulate ratings.</p>
        </Section>
        <hr className="mt-10 border-gray-100" />

        <Section title="4. For Clients">
          <ul className="list-disc pl-5 space-y-1">
            <li>When you post a job, you represent that the work is legal and your budget is genuine.</li>
            <li>When you accept a proposal, you are committing to pay the agreed amount for work completed per defined milestones.</li>
            <li>You agree to review milestone submissions within a reasonable time and may not withhold approval without legitimate grounds.</li>
            <li>You agree not to seek or arrange payment outside the platform for work sourced here.</li>
            <li>Reviews must be honest and based on your actual experience. You may not offer incentives for positive reviews.</li>
          </ul>
        </Section>
        <hr className="mt-10 border-gray-100" />

        <Section title="5. For Freelancers">
          <ul className="list-disc pl-5 space-y-1">
            <li>When you submit a proposal, you represent that you have the skills described and can complete the work in the proposed timeline.</li>
            <li>Once a contract is active, you are committed to delivering work that meets the agreed scope.</li>
            <li>When submitting a milestone, you represent the work is your own (or that you have rights to it) and is ready for review.</li>
            <li>You agree to provide accurate KYC information (PAN, Aadhaar, bank details). Providing false documents violates these Terms.</li>
            <li>Timesheets must accurately reflect hours worked. Inflating hours is considered fraud.</li>
            <li>Gigly does not guarantee a minimum level of work or income.</li>
          </ul>
        </Section>
        <hr className="mt-10 border-gray-100" />

        <Section title="6. Contracts and Payments">
          <p><strong>Contract formation:</strong> A contract is formed when a client accepts a freelancer's proposal.</p>
          <p><strong>Invoices:</strong> When a client approves a milestone, Gigly automatically generates a GST-compliant invoice (18% GST included), numbered GIG-YYYY-####.</p>
          <p><strong>Payment processing:</strong> Payments are processed through the platform's payment system. Gigly is not a bank.</p>
          <p><strong>No off-platform payments:</strong> Clients and freelancers agree not to arrange payment outside Gigly for work sourced through the platform. Doing so voids platform protections and is grounds for suspension.</p>
        </Section>
        <hr className="mt-10 border-gray-100" />

        <Section title="7. Fees">
          <p>Gigly is currently free to use for both clients and freelancers during its launch period. We reserve the right to introduce fees in the future with at least 30 days' notice.</p>
        </Section>
        <hr className="mt-10 border-gray-100" />

        <Section title="8. Disputes">
          <ul className="list-disc pl-5 space-y-1">
            <li>Either party may raise a dispute on an active contract.</li>
            <li>Once raised, Gigly's admin team reviews evidence from both parties.</li>
            <li>Gigly acts as a neutral mediator; our resolution is a platform-level decision. Legal disputes remain subject to the courts under Section 14.</li>
            <li>Raising disputes in bad faith is a violation of these Terms.</li>
          </ul>
        </Section>
        <hr className="mt-10 border-gray-100" />

        <Section title="9. Reviews">
          <p>Reviews are posted after a contract completes. You may not post reviews about someone you did not work with on Gigly, offer incentives for positive reviews, or post reviews that are defamatory or harassing. Reviews are permanent once posted.</p>
        </Section>
        <hr className="mt-10 border-gray-100" />

        <Section title="10. Prohibited Conduct">
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Post illegal, fraudulent, or rights-violating jobs or services</li>
            <li>Distribute malware, spam, or phishing content</li>
            <li>Attempt unauthorized access to other accounts or our systems</li>
            <li>Scrape or crawl the platform without written permission</li>
            <li>Impersonate another person or entity</li>
            <li>Harass, threaten, or abuse other users</li>
            <li>Post defamatory, discriminatory, or sexually explicit content</li>
            <li>Solicit users to move off-platform</li>
          </ul>
        </Section>
        <hr className="mt-10 border-gray-100" />

        <Section title="11. Intellectual Property">
          <p><strong>Your content:</strong> You retain ownership of content you upload. By posting it, you grant Gigly a non-exclusive, royalty-free licence to display it to operate the platform.</p>
          <p><strong>Work product:</strong> Unless otherwise agreed, ownership of work delivered transfers to the client upon full payment for that milestone.</p>
          <p><strong>Gigly's platform:</strong> The Gigly name, logo, and platform code are owned by us. You may not copy or create derivative works from our platform.</p>
        </Section>
        <hr className="mt-10 border-gray-100" />

        <Section title="12. Limitation of Liability">
          <p>To the maximum extent permitted by Indian law:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Gigly is provided "as is" without warranties</li>
            <li>We are not liable for the quality, legality, or completion of work arranged through the platform</li>
            <li>Our total liability is limited to the amount you paid Gigly in fees in the 3 months before the claim</li>
            <li>We are not liable for indirect, incidental, or consequential damages</li>
          </ul>
          <p>Nothing in this section limits liability for fraud, gross negligence, or death/injury caused by our negligence.</p>
        </Section>
        <hr className="mt-10 border-gray-100" />

        <Section title="13. Indemnity">
          <p>You agree to indemnify and hold Gigly harmless from claims, losses, or damages (including legal fees) arising from your use of the platform, violation of these Terms, or violation of third-party rights.</p>
        </Section>
        <hr className="mt-10 border-gray-100" />

        <Section title="14. Governing Law">
          <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in <strong>Gandhinagar, Gujarat, India</strong>.</p>
        </Section>
        <hr className="mt-10 border-gray-100" />

        <Section title="15. Changes to These Terms">
          <p>We may update these Terms. We will notify you by email at least 14 days before changes take effect. Continued use after the effective date constitutes acceptance.</p>
        </Section>
        <hr className="mt-10 border-gray-100" />

        <Section title="16. Contact">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Email:</strong> legal@gigly.in</li>
            <li><strong>Response time:</strong> Within 10 business days</li>
          </ul>
        </Section>
      </main>
    </div>
  );
}
