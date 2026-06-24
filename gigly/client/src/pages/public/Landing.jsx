import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FilePlus, Users, CheckCircle, Receipt, Briefcase,
  Code2, Palette, Megaphone, PenLine, BarChart2, Video, Smartphone, Cpu,
  Bell, Clock, Star, Mail, BadgeCheck, Scale,
  Building2, Star as StarIcon,
} from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import Button from '../../components/ui/Button';
import { cn } from '../../utils/helpers';

const STATS = [
  { value: '2,400+', label: 'Registered professionals', delta: '↑ 18% this month' },
  { value: '₹1.2Cr', label: 'Total paid to freelancers', delta: '↑ 24% this quarter' },
  { value: '94%', label: 'Contract completion rate', delta: 'Industry avg: 71%' },
  { value: '4.8 ★', label: 'Average platform rating', delta: 'From 1,100+ reviews' },
];

const STEPS = [
  { icon: FilePlus, label: 'Step 1', title: 'Post your job', desc: "Describe the work, set your budget (fixed or hourly), and specify the skills you need. Go live in under 5 minutes." },
  { icon: Users, label: 'Step 2', title: 'Review proposals', desc: 'Freelancers apply with cover letters and bid amounts. Compare profiles, portfolios, and ratings side by side.' },
  { icon: CheckCircle, label: 'Step 3', title: 'Track milestones', desc: 'Break work into milestones. Freelancers submit deliverables. You approve or request changes — with a full audit trail.' },
  { icon: Receipt, label: 'Step 4', title: 'Pay and get invoiced', desc: 'Approve a milestone → invoice auto-generates with 18% GST. Pay securely. Freelancer gets notified instantly.' },
];

const CONTRACT_ROWS = [
  { label: 'Proposal accepted', amount: null, date: 'Dec 3, 2024', status: 'Done', dot: 'bg-green-500', badge: 'badge-green' },
  { label: 'Milestone 1 — Homepage design delivered', amount: '₹18,000', date: 'Dec 10, 2024', status: 'Paid', dot: 'bg-green-500', badge: 'badge-green' },
  { label: 'Milestone 2 — Mobile responsive build', amount: '₹22,000', date: 'Dec 19, 2024', status: 'Under review', dot: 'bg-blue-500', badge: 'badge-blue' },
  { label: 'Milestone 3 — Final QA and deployment', amount: '₹15,000', date: 'Jan 5, 2025', status: 'Upcoming', dot: 'bg-gray-300', badge: 'badge-gray' },
];

const CATEGORIES = [
  { icon: Code2, name: 'Web development', count: 486, slug: 'web-development' },
  { icon: Palette, name: 'UI / UX design', count: 214, slug: 'ui-ux-design' },
  { icon: Megaphone, name: 'Digital marketing', count: 173, slug: 'digital-marketing' },
  { icon: PenLine, name: 'Content writing', count: 291, slug: 'content-writing' },
  { icon: BarChart2, name: 'Data & analytics', count: 98, slug: 'data-analytics' },
  { icon: Video, name: 'Video editing', count: 137, slug: 'video-editing' },
  { icon: Smartphone, name: 'Mobile apps', count: 112, slug: 'mobile-apps' },
  { icon: Cpu, name: 'AI / ML', count: 64, slug: 'ai-ml' },
];

const TESTIMONIALS = [
  {
    quote: "Finally a platform where I don't chase payments. Milestone approval triggers the invoice automatically — I didn't have to send a single follow-up.",
    name: 'Rohan Kapoor', role: 'React developer, Mumbai', badge: 'Freelancer', badgeClass: 'badge-purple', initials: 'RK',
  },
  {
    quote: 'We hired 3 designers in one month. The proposal comparison view saved us hours. The GST invoice downloads are exactly what our accounts team needed.',
    name: 'Priya Shah', role: 'Founder, Surat-based startup', badge: 'Client', badgeClass: 'badge-green', initials: 'PS',
  },
  {
    quote: 'The contract chat keeps everything in one thread. No more lost WhatsApp messages about scope changes. My client and I are always on the same page.',
    name: 'Ananya Mehta', role: 'Brand designer, Ahmedabad', badge: 'Freelancer', badgeClass: 'badge-purple', initials: 'AM',
  },
];

const FEATURES = [
  { icon: Bell, title: 'Real-time notifications', desc: "Get alerted the moment a proposal comes in, a milestone is approved, or a payment lands — no refreshing required." },
  { icon: Clock, title: 'Timesheet logging', desc: 'Hourly contracts include weekly timesheet submission with daily task breakdowns. Client approves, invoice follows automatically.' },
  { icon: Star, title: 'Verified reviews', desc: 'Reviews are only unlocked after a contract completes. Both sides rate each other — clients and freelancers build real reputations.' },
  { icon: Mail, title: 'Transactional emails', desc: 'Every key event — new contract, payment received, password reset — triggers an email so nothing slips through.' },
  { icon: BadgeCheck, title: 'KYC document upload', desc: 'Freelancers upload PAN and Aadhaar for verification. Bank details stored securely for payout management.' },
  { icon: Scale, title: 'Dispute centre', desc: 'When things go wrong, both parties submit evidence. Admin mediates and logs the resolution — full paper trail.' },
];

const SectionHeader = ({ eyebrow, title, subtitle }) => (
  <div className="text-center max-w-2xl mx-auto mb-12">
    <p className="text-xs font-bold text-primary-600 tracking-widest uppercase mb-3">{eyebrow}</p>
    <h2 className="text-3xl font-bold text-gray-900 mb-3">{title}</h2>
    {subtitle && <p className="text-gray-500">{subtitle}</p>}
  </div>
);

const AVATAR_COLORS = ['bg-primary-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500'];
const AVATAR_INITIALS = ['SK', 'RM', 'TP', 'NV'];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Hero */}
      <section className="pt-24 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Trusted by 2,400+ professionals across India
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-6">
            Hire talent.<br />
            Ship <span className="text-primary-600">faster</span>.<br />
            Pay with confidence.
          </h1>

          <p className="text-lg text-gray-500 max-w-[460px] mx-auto mb-10">
            Gigly brings clients and freelancers together with milestone-based contracts,
            GST-compliant invoicing, and real-time collaboration — all in one place.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            <Link to="/register"><Button size="lg">Post a job — it's free</Button></Link>
            <Link to="/browse"><Button variant="ghost" size="lg"><Briefcase size={18} /> Browse freelancers</Button></Link>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="flex">
              {AVATAR_INITIALS.map((initials, i) => (
                <div key={initials}
                  className={cn('w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white', AVATAR_COLORS[i], i > 0 && '-ml-2')}>
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-400">Joined by 340 freelancers this month · ₹1.2Cr+ paid out</p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-gray-200 bg-gray-25">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">
          {STATS.map(({ value, label, delta }) => (
            <div key={label} className="px-4 py-8 text-center">
              <p className="text-3xl font-extrabold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
              <p className="text-xs font-medium text-green-600 mt-2">{delta}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <SectionHeader eyebrow="How it works" title="From job post to payment in 4 steps"
            subtitle="No email threads. No informal bank transfers. Every step tracked, every rupee accounted for." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {STEPS.map(({ icon: Icon, label, title, desc }) => (
              <div key={label} className="card p-6">
                <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-primary-600" />
                </div>
                <p className="text-xs font-semibold text-gray-400 mb-1">{label}</p>
                <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Contract Preview */}
      <section className="py-20 px-4 bg-gray-25">
        <div className="max-w-3xl mx-auto">
          <SectionHeader eyebrow="Live contract view" title="What a contract looks like inside Gigly"
            subtitle="Every engagement has a single source of truth — no spreadsheets, no WhatsApp threads." />
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">Contract #GIG-2024-0047</p>
              <span className="badge badge-blue">In progress</span>
            </div>
            <div className="divide-y divide-gray-100">
              {CONTRACT_ROWS.map((row) => (
                <div key={row.label} className="flex items-center gap-4 px-5 py-4">
                  <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', row.dot)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{row.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{row.amount ? `${row.amount} · ` : ''}{row.date}</p>
                  </div>
                  <span className={cn('badge flex-shrink-0', row.badge)}>{row.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <SectionHeader eyebrow="Browse by category" title="Find the right expertise"
            subtitle="Every category has verified professionals with real reviews." />
          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.map(({ icon: Icon, name, count, slug }) => (
              <Link key={slug} to={`/browse?category=${slug}`}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <Icon size={16} className="text-primary-600" />
                <span className="text-sm font-medium text-gray-800">{name}</span>
                <span className="text-xs text-gray-400">{count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gray-25">
        <div className="max-w-6xl mx-auto">
          <SectionHeader eyebrow="What people say" title="Real feedback from real engagements" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ quote, name, role, badge, badgeClass, initials }) => (
              <div key={name} className="card p-6 flex flex-col">
                <div className="flex gap-0.5 text-yellow-400 mb-3" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} size={14} fill="currentColor" strokeWidth={0} />)}
                </div>
                <p className="text-sm text-gray-600 flex-1 mb-5">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm flex items-center justify-center flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{name}</p>
                    <p className="text-xs text-gray-400">{role}</p>
                  </div>
                  <span className={cn('badge flex-shrink-0', badgeClass)}>{badge}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 px-4 bg-gray-25">
        <div className="max-w-5xl mx-auto">
          <SectionHeader eyebrow="Platform features" title="Everything in one place" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6">
                <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Which side of the table are you on?</h2>
          <p className="text-gray-500 mb-12">Both get the same transparency, the same audit trail, the same peace of mind.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
            <div className="card p-8">
              <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                <Building2 size={20} className="text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">I need to hire</h3>
              <p className="text-sm text-gray-500 mb-5">Post a job for free and start receiving proposals from verified freelancers within hours.</p>
              <Link to="/register?role=client" className="text-sm font-semibold text-primary-600 hover:text-primary-700">Post a job →</Link>
            </div>
            <div className="card p-8">
              <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                <Briefcase size={20} className="text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">I want to freelance</h3>
              <p className="text-sm text-gray-500 mb-5">Build your profile, apply to projects that match your skills, and get paid on milestone approval.</p>
              <Link to="/register?role=freelancer" className="text-sm font-semibold text-primary-600 hover:text-primary-700">Create your profile →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">© 2024 Gigly. Built for Indian freelancers.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link to="/privacy" className="hover:text-gray-900">Privacy</Link>
            <Link to="/terms" className="hover:text-gray-900">Terms</Link>
            <Link to="/contact" className="hover:text-gray-900">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
