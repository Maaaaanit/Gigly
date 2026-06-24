import React from 'react';
import PublicNavbar from '../components/layout/PublicNavbar';

const Section = ({ title, children }) => (
  <section className="mt-10">
    <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
    <div className="space-y-3 text-sm text-gray-600 leading-relaxed">{children}</div>
  </section>
);

const Table = ({ head, rows }) => (
  <div className="overflow-x-auto rounded-xl border border-gray-200 mt-2">
    <table className="w-full text-sm text-left">
      <thead className="bg-gray-50">
        <tr>{head.map(h => <th key={h} className="px-4 py-2.5 font-semibold text-gray-700">{h}</th>)}</tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {rows.map((row, i) => (
          <tr key={i}>{row.map((cell, j) => <td key={j} className="px-4 py-2.5 text-gray-600">{cell}</td>)}</tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mt-2">Effective date: January 1, 2025 · Last updated: January 1, 2025</p>

        <Section title="1. Who We Are">
          <p>Gigly ("we", "our", "us") is a freelance marketplace platform that connects clients with freelancers for project-based work. Our platform is operated from India and is primarily intended for users based in India.</p>
          <p>If you have questions about this policy, contact us at <strong>privacy@gigly.in</strong>.</p>
        </Section>
        <hr className="mt-10 border-gray-100" />

        <Section title="2. What Information We Collect">
          <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">2.1 Information You Provide Directly</h3>
          <p><strong>Account registration:</strong> Full name, email address, password (stored as a bcrypt hash — we never store your plain-text password), role (client or freelancer).</p>
          <p><strong>Freelancer profile (optional, provided by you):</strong> Professional title and bio, skills and category, hourly rate, portfolio links, availability status.</p>
          <p><strong>KYC and payment documents (freelancers only):</strong> PAN card number, Aadhaar number, bank account number, IFSC code, and bank name, uploaded document files.</p>
          <p><strong>Job postings (clients):</strong> Job title, description, required skills, budget range and project duration.</p>
          <p><strong>Proposals and contracts:</strong> Cover letters and bid amounts, milestone titles, amounts, due dates, and submission notes, uploaded deliverable files, timesheet entries (date, hours worked, task descriptions).</p>
          <p><strong>Communications:</strong> Messages sent through contract-scoped chat, dispute evidence files and descriptions, review text and star ratings.</p>

          <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">2.2 Information Collected Automatically</h3>
          <p>When you use Gigly, our servers log: IP address, browser type and version, pages visited and time spent, HTTP request details, and device type.</p>
          <p>We do not use cookies for tracking or advertising. Session authentication is handled via JWT tokens stored in your browser's local storage.</p>

          <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">2.3 Information We Do Not Collect</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>We do not collect or store payment card numbers, UPI IDs, or any raw financial credentials.</li>
            <li>We do not track you across other websites.</li>
            <li>We do not use third-party advertising trackers.</li>
          </ul>
        </Section>
        <hr className="mt-10 border-gray-100" />

        <Section title="3. How We Use Your Information">
          <Table
            head={['Purpose', 'Legal basis']}
            rows={[
              ['Creating and managing your account', 'Contract performance'],
              ['Displaying your profile to potential clients', 'Contract performance'],
              ['Sending transactional emails (new contract, payment received, password reset)', 'Contract performance'],
              ['Generating GST-compliant invoices for approved milestones', 'Legal obligation'],
              ['Enabling real-time contract messaging', 'Contract performance'],
              ['Sending in-app notifications', 'Contract performance'],
              ['Moderating disputes between clients and freelancers', 'Legitimate interest'],
              ['Improving platform performance and fixing bugs', 'Legitimate interest'],
              ['Complying with applicable Indian law', 'Legal obligation'],
            ]}
          />
          <p className="mt-3">We do not use your data for advertising, profiling, or selling to third parties.</p>
        </Section>
        <hr className="mt-10 border-gray-100" />

        <Section title="4. How We Store and Protect Your Information">
          <p><strong>Database:</strong> Your data is stored in MongoDB. Passwords are hashed using bcrypt before storage and are never recoverable in plain text.</p>
          <p><strong>Authentication:</strong> JWTs expire after 7 days. Password reset tokens are single-use and expire within 1 hour.</p>
          <p><strong>File uploads:</strong> Uploaded files (milestone deliverables, KYC documents) are stored on our server.</p>
          <p><strong>Transport:</strong> All data in transit is encrypted via HTTPS/TLS.</p>
          <p><strong>Security measures in place:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Helmet.js HTTP security headers</li>
            <li>CORS restricted to the platform domain</li>
            <li>MongoDB injection sanitization</li>
            <li>XSS input sanitization</li>
            <li>Rate limiting on authentication endpoints (max 10 attempts per 15 minutes)</li>
          </ul>
          <p>No system is perfectly secure. If you believe your account has been compromised, contact us at <strong>security@gigly.in</strong>.</p>
        </Section>
        <hr className="mt-10 border-gray-100" />

        <Section title="5. Who We Share Your Information With">
          <p>We do not sell your personal data. We share information only in these limited cases:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Within the platform:</strong> Your public profile is visible to other users. Your email is never displayed publicly.</li>
            <li><strong>Between contract parties:</strong> When a contract is created, both parties can see each other's names and can message within that contract.</li>
            <li><strong>Reviews:</strong> Completed reviews are publicly visible on freelancer profiles.</li>
            <li><strong>Legal obligations:</strong> We may disclose information if required by Indian law or court order.</li>
            <li><strong>Business transfers:</strong> If Gigly is acquired, your data may transfer. We will notify you before this happens.</li>
          </ul>
        </Section>
        <hr className="mt-10 border-gray-100" />

        <Section title="6. Data Retention">
          <Table
            head={['Data type', 'Retention period']}
            rows={[
              ['Account data', 'Until you delete your account, plus 30 days'],
              ['Contract and invoice records', '7 years (GST compliance under Indian tax law)'],
              ['Messages', 'Duration of contract, then 1 year'],
              ['Uploaded KYC documents', 'Duration of account + 1 year'],
              ['Server logs', '90 days'],
              ['Password reset tokens', '1 hour from issue (auto-expired)'],
            ]}
          />
          <p className="mt-3">We retain invoice and contract data for 7 years because Indian GST regulations require businesses to maintain records of taxable transactions for this period.</p>
        </Section>
        <hr className="mt-10 border-gray-100" />

        <Section title="7. Your Rights">
          <p>You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Access</strong> the personal data we hold about you</li>
            <li><strong>Correct</strong> inaccurate information via your account settings at any time</li>
            <li><strong>Delete</strong> your account — contact us at privacy@gigly.in (invoice records may be retained 7 years per legal obligation)</li>
            <li><strong>Export</strong> a copy of your personal data — email us and we'll provide it within 30 days</li>
            <li><strong>Withdraw consent</strong> for any processing based on consent</li>
          </ul>
          <p>To exercise any right, email <strong>privacy@gigly.in</strong> with the subject line: "Data Request — [your registered email]".</p>
        </Section>
        <hr className="mt-10 border-gray-100" />

        <Section title="8. Children's Privacy">
          <p>Gigly is not intended for users under the age of 18. We do not knowingly collect personal data from minors. If you believe a minor has created an account, contact us at privacy@gigly.in.</p>
        </Section>
        <hr className="mt-10 border-gray-100" />

        <Section title="9. Changes to This Policy">
          <p>We may update this policy from time to time. We will update the "Last updated" date and notify you by email if the changes are significant. Continued use after changes are posted constitutes acceptance.</p>
        </Section>
        <hr className="mt-10 border-gray-100" />

        <Section title="10. Contact Us">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Email:</strong> privacy@gigly.in</li>
            <li><strong>Grievance Officer (Indian IT Rules):</strong> [Your Name], privacy@gigly.in</li>
            <li><strong>Response time:</strong> Within 15 business days</li>
          </ul>
          <p>This Privacy Policy is governed by the laws of India, including the Information Technology Act, 2000 and the IT (Reasonable Security Practices) Rules, 2011.</p>
        </Section>
      </main>
    </div>
  );
}
