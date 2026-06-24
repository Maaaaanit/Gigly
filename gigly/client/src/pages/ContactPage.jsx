import React, { useState } from 'react';
import { Mail, Headphones, ShieldCheck, Scale, AlertTriangle, ChevronDown, CheckCircle, Loader2 } from 'lucide-react';
import PublicNavbar from '../components/layout/PublicNavbar';
import Button from '../components/ui/Button';
import { contactAPI } from '../api';
import { cn } from '../utils/helpers';

const CHANNELS = [
  { icon: Mail, name: 'General enquiries', email: 'hello@gigly.in', desc: 'Questions about how the platform works, partnerships, or anything else.' },
  { icon: Headphones, name: 'Support', email: 'support@gigly.in', desc: 'Login issues, page errors, or platform bugs. Include your registered email.' },
  { icon: ShieldCheck, name: 'Privacy & data', email: 'privacy@gigly.in', desc: 'Data requests, account deletion, or privacy concerns. We respond within 15 business days.' },
  { icon: Scale, name: 'Legal', email: 'legal@gigly.in', desc: 'Notices, takedown requests, or Terms of Service questions.' },
  { icon: AlertTriangle, name: 'Security', email: 'security@gigly.in', desc: 'Vulnerability reports. We acknowledge within 48 hours. Please do not post publicly.' },
];

const RESPONSE_TIMES = [
  ['General questions', 'Within 2 business days'],
  ['Account or platform issues', 'Within 1 business day'],
  ['Security reports', 'Within 48 hours'],
  ['Privacy / data requests', 'Within 15 business days'],
  ['Legal notices', 'Within 5 business days'],
];

const FAQS = [
  { q: "I can't log in to my account.", a: 'First try resetting your password using the "Forgot password" link on the login page. If you don\'t receive the reset email within 5 minutes, check your spam folder. If the problem persists, email support@gigly.in with your registered email address.' },
  { q: "A client hasn't approved my milestone. What do I do?", a: 'Send a message to the client through the contract chat to follow up. If there is no response after 3–5 business days, you can raise a dispute from within the contract page. Our team will review and mediate.' },
  { q: "A freelancer hasn't delivered the work. What are my options?", a: 'First use the contract chat to request an update. If there is no response or the work is significantly delayed, raise a dispute from within the contract page and include any relevant communication as evidence.' },
  { q: 'How do I delete my account?', a: 'Email privacy@gigly.in with the subject "Account Deletion Request" from your registered email. Invoice and contract records may be retained for up to 7 years under Indian GST regulations.' },
  { q: 'I found a bug. How do I report it?', a: 'Use the contact form and select "Bug report". Describe what happened, what you expected, and the steps to reproduce. Screenshots are helpful.' },
  { q: "Can I use Gigly if I'm outside India?", a: 'Gigly is currently designed for the Indian market — invoices use INR and KYC follows Indian regulations. International usage is not currently supported.' },
];

const TOPICS = ['General question', 'Account issue', 'Bug report', 'Billing or payment', 'Dispute resolution', 'Privacy or data request', 'Partnership enquiry', 'Other'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FaqAccordion = () => {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <div className="space-y-2">
      {FAQS.map(({ q, a }, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={q} className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${i}`}
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
            >
              {q}
              <ChevronDown size={16} className={cn('flex-shrink-0 text-gray-400 transition-transform', isOpen && 'rotate-180')} />
            </button>
            {isOpen && (
              <div id={`faq-panel-${i}`} className="px-4 pb-4 text-sm text-gray-500 leading-relaxed">{a}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const initialForm = { name: '', email: '', topic: '', message: '' };

const ContactForm = () => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Please enter your name.';
    if (!EMAIL_RE.test(form.email)) next.email = 'Please enter a valid email address.';
    if (!form.topic) next.topic = 'Please select a topic.';
    if (form.message.trim().length < 20) next.message = 'Message must be at least 20 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('loading');
    try {
      await contactAPI.submit(form);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const reset = () => {
    setForm(initialForm);
    setErrors({});
    setStatus('idle');
  };

  if (status === 'success') {
    return (
      <div className="card p-8 text-center">
        <CheckCircle size={32} className="text-green-500 mx-auto mb-3" />
        <p className="font-semibold text-gray-900">Your message has been sent.</p>
        <p className="text-sm text-gray-500 mt-1.5">We'll get back to you at <strong>{form.email}</strong> within 2 business days.</p>
        <button onClick={reset} className="text-sm font-semibold text-primary-600 hover:text-primary-700 mt-5">Send another message</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4" noValidate>
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
        <input
          id="contact-name"
          type="text"
          placeholder="Full name"
          value={form.name}
          onChange={e => setField('name', e.target.value)}
          className="input"
          aria-invalid={!!errors.name}
        />
        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
        <input
          id="contact-email"
          type="email"
          placeholder="The email address on your Gigly account"
          value={form.email}
          onChange={e => setField('email', e.target.value)}
          className="input"
          aria-invalid={!!errors.email}
        />
        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="contact-topic" className="block text-sm font-medium text-gray-700 mb-1">What's this about?</label>
        <select
          id="contact-topic"
          value={form.topic}
          onChange={e => setField('topic', e.target.value)}
          className="input"
          aria-invalid={!!errors.topic}
        >
          <option value="" disabled>Select a topic</option>
          {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {errors.topic && <p className="text-xs text-red-600 mt-1">{errors.topic}</p>}
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea
          id="contact-message"
          rows={5}
          placeholder="Describe your question or issue in as much detail as you can. For bugs, include the steps that led to it."
          value={form.message}
          onChange={e => setField('message', e.target.value)}
          className="input"
          aria-invalid={!!errors.message}
        />
        {errors.message && <p className="text-xs text-red-600 mt-1">{errors.message}</p>}
      </div>

      <Button type="submit" className="w-full" loading={status === 'loading'} aria-busy={status === 'loading'}>
        {status === 'loading' ? 'Sending...' : 'Send message'}
      </Button>

      {status === 'error' && (
        <p className="text-sm text-red-600 text-center">Something went wrong. Please email us directly at hello@gigly.in.</p>
      )}
    </form>
  );
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="max-w-2xl mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Get in touch</h1>
          <p className="text-gray-500 mt-2">Have a question, a bug to report, or a dispute to raise? We're a small team — we read every message.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left column */}
          <div className="space-y-10">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact channels</h2>
              <div className="space-y-3">
                {CHANNELS.map(({ icon: Icon, name, email, desc }) => (
                  <div key={name} className="card p-4 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-primary-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{name}</p>
                      <p className="text-sm text-primary-600">{email}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Response times</h2>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold text-gray-700">Topic</th>
                      <th className="px-4 py-2.5 font-semibold text-gray-700">Response time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {RESPONSE_TIMES.map(([topic, time]) => (
                      <tr key={topic}>
                        <td className="px-4 py-2.5 text-gray-600">{topic}</td>
                        <td className="px-4 py-2.5 text-gray-600">{time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick answers</h2>
              <FaqAccordion />
            </div>
          </div>

          {/* Right column */}
          <div className="md:sticky md:top-24 self-start">
            <ContactForm />
          </div>
        </div>

        <p className="text-sm text-gray-500 text-center max-w-xl mx-auto mt-16 border-t border-gray-100 pt-10">
          Gigly is in its early launch phase. We're a small team and genuinely care about every person using the platform. If something isn't working, we want to know.
        </p>
      </main>
    </div>
  );
}
