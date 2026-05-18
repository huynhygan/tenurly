import React from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  HomeIcon, KeyRound, CheckCircle2, ArrowRight, DollarSign, Wrench,
  FileText, Clock, BarChart3, MessageSquare, ChevronDown, Lock, Star
} from 'lucide-react';

/* ─── DATA ─────────────────────────────────────────── */

const landlordFeatures = [
  'Add properties and rooms, track every tenancy',
  'Automated rent ledger and payment reminders',
  'Maintenance request dashboard with job tracking',
  'Expense tracking linked to each property',
  'Lease expiry alerts',
  'Tax-ready financial reports',
  'Documents vault',
  'Invite tenants in 30 seconds via email',
];

const tenantFeatures = [
  'See your rent status and full payment history',
  'Lodge repair requests with photos',
  'Track request status in real time',
  'Download your lease and documents anytime',
  'Chat with your landlord directly',
];

const featureCards = [
  { emoji: '💰', title: 'Rent tracking', desc: 'Full ledger of every payment, charge and balance.' },
  { emoji: '🔧', title: 'Maintenance management', desc: 'Tenants log issues, you track progress. Every job has a status trail.' },
  { emoji: '📄', title: 'Documents vault', desc: 'Leases, inspections, invoices stored against each property.' },
  { emoji: '⏰', title: 'Lease expiry alerts', desc: 'Get reminded 60 days before lease end.' },
  { emoji: '📊', title: 'Expense & tax reports', desc: 'Track every expense and download tax-ready summaries at EOFY.' },
  { emoji: '💬', title: 'Built-in messaging', desc: 'Chat with tenants or the whole household. Everything logged.' },
];

const steps = [
  { n: 1, title: 'Create your account', desc: 'Free, no credit card, 30 seconds.' },
  { n: 2, title: 'Add your property', desc: 'Enter address and rooms.' },
  { n: 3, title: 'Invite your tenant', desc: 'Enter their email — they get a link.' },
  { n: 4, title: 'Set up rent tracking', desc: 'Add amount, start date and schedule.' },
  { n: 5, title: "You're managing", desc: 'Dashboard shows everything at a glance.' },
];

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    priceSub: 'forever',
    desc: 'For landlords just getting started with 1 property.',
    features: ['1 property', 'Up to 3 tenants', 'Rent ledger & tracking', 'Maintenance requests', 'Document storage'],
    dimmed: ['Financial reports', 'Priority support'],
    cta: 'Get started free',
  },
  {
    name: 'Growth',
    price: '$19',
    priceSub: '/ month',
    desc: 'For landlords with a growing portfolio.',
    features: ['Up to 10 properties', 'Unlimited tenants', 'Rent ledger & tracking', 'Maintenance requests', 'Document storage', 'Financial reports & tax export', 'Lease expiry alerts', 'All messaging features'],
    dimmed: [],
    cta: 'Start free 14-day trial',
    featured: true,
    badge: 'Most popular',
  },
  {
    name: 'Portfolio',
    price: '$49',
    priceSub: '/ month',
    desc: 'For serious landlords managing large portfolios.',
    features: ['Unlimited properties', 'Unlimited tenants', 'Everything in Growth', 'Priority support', 'Trust & entity support', 'Bulk operations'],
    dimmed: [],
    cta: 'Contact us',
  },
];

const stats = [
  { value: '$0', label: 'Agent fees' },
  { value: '5 min', label: 'Setup time' },
  { value: '100%', label: 'Private' },
  { value: '24/7', label: 'Tenant access' },
];

const testimonials = [
  { quote: "Finally something that doesn't feel like it was built for a property management company.", name: 'Michael T.', role: '4 properties · Brisbane' },
  { quote: "I was tracking everything in a spreadsheet. Took an hour to set up and I haven't touched it since.", name: 'Sarah K.', role: '2 properties · Melbourne' },
  { quote: "As a tenant I love being able to see my payment history and submit repairs without chasing anyone.", name: 'James R.', role: 'Tenant · Sydney' },
];

/* ─── SUB-COMPONENTS ───────────────────────────────── */

function NavBar() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#0f1f3d] flex items-center justify-center">
            <HomeIcon size={15} className="text-white" />
          </div>
          <span className="font-bold text-lg text-[#0f1f3d]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Tenurly</span>
        </div>
        {/* Nav links — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button onClick={() => scrollTo('features')} className="hover:text-[#0f1f3d] transition-colors">Features</button>
          <button onClick={() => scrollTo('how-it-works')} className="hover:text-[#0f1f3d] transition-colors">How it works</button>
          <button onClick={() => scrollTo('pricing')} className="hover:text-[#0f1f3d] transition-colors">Pricing</button>
        </nav>
        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => base44.auth.redirectToLogin('/')}
            className="hidden sm:block text-sm font-medium text-slate-600 hover:text-[#0f1f3d] transition-colors px-3 py-2 rounded-lg hover:bg-slate-50"
          >
            Sign in
          </button>
          <button
            onClick={() => base44.auth.redirectToLogin('/')}
            className="text-sm font-semibold bg-[#0f1f3d] text-white px-4 py-2.5 rounded-xl hover:bg-[#1a3460] transition-colors shadow-sm"
          >
            Get started free
          </button>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section style={{ background: 'linear-gradient(135deg, #f8faff 0%, #e8f7f3 100%)' }} className="py-20 md:py-28 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-white border border-[#0d9e7e]/30 text-[#0d9e7e] text-xs font-semibold px-4 py-2 rounded-full mb-7 shadow-sm">
          <Star size={12} />
          Built for self-managed landlords
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#0f1f3d] leading-tight mb-5" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          Property management that<br className="hidden md:block" /> actually makes sense
        </h1>
        <p className="text-base md:text-lg text-slate-500 leading-relaxed mb-9 max-w-2xl mx-auto">
          Track rent, handle maintenance, and stay connected with tenants — without paying a property manager. Everything you need, nothing you don't.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <button
            onClick={() => base44.auth.redirectToLogin('/')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0d9e7e] text-white text-base font-bold px-7 py-4 rounded-2xl hover:bg-[#0b8a6e] transition-colors shadow-lg shadow-[#0d9e7e]/25"
          >
            Start managing for free <ArrowRight size={18} />
          </button>
          <button
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto text-base font-semibold text-[#0f1f3d] px-7 py-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
          >
            See how it works
          </button>
        </div>
        <p className="text-xs text-slate-400">
          No credit card required · Free plan available · Cancel anytime · Australian landlords welcome
        </p>
      </div>
    </section>
  );
}

function WhoIsThisFor() {
  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-[#0f1f3d] text-center mb-10">Are you a landlord or a tenant?</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Landlord */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-1.5 bg-[#0f1f3d]" />
            <div className="p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#0f1f3d]/10 flex items-center justify-center">
                  <HomeIcon size={18} className="text-[#0f1f3d]" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Landlord</p>
                  <p className="font-bold text-[#0f1f3d] text-lg">You're in control</p>
                </div>
              </div>
              <ul className="space-y-2.5 mb-7">
                {landlordFeatures.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 size={15} className="text-[#0d9e7e] mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => base44.auth.redirectToLogin('/')}
                className="w-full py-3 rounded-xl bg-[#0f1f3d] text-white text-sm font-semibold hover:bg-[#1a3460] transition-colors"
              >
                Set up my properties →
              </button>
            </div>
          </div>

          {/* Tenant */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-1.5 bg-[#0d9e7e]" />
            <div className="p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#0d9e7e]/10 flex items-center justify-center">
                  <KeyRound size={18} className="text-[#0d9e7e]" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tenant</p>
                  <p className="font-bold text-[#0f1f3d] text-lg">Everything at a glance</p>
                </div>
              </div>
              <ul className="space-y-2.5 mb-7">
                {tenantFeatures.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 size={15} className="text-[#0d9e7e] mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/accept-invite"
                className="block w-full py-3 rounded-xl border border-[#0d9e7e] text-[#0d9e7e] text-sm font-semibold text-center hover:bg-[#0d9e7e]/5 transition-colors"
              >
                Accept my invite →
              </Link>
            </div>
          </div>
        </div>

        {/* Tenant explainer */}
        <div className="bg-[#e8f7f3] border border-[#0d9e7e]/20 rounded-2xl p-6 flex items-start gap-4">
          <span className="text-2xl shrink-0">🔑</span>
          <div>
            <p className="font-bold text-[#0f1f3d] mb-1">Tenants — how do I sign up?</p>
            <p className="text-sm text-slate-600 leading-relaxed">
              You don't sign up directly. Your landlord sends you an invite link via email. Clicking it creates your account and connects you to your tenancy automatically. Your data is private — only you and your landlord can see it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="py-16 px-6" style={{ background: '#f8faff' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#0d9e7e] mb-3">What's included</p>
          <h2 className="text-2xl md:text-3xl font-bold text-[#0f1f3d]">Everything self-managed landlords need</h2>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {featureCards.map(f => (
            <div key={f.title} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4">{f.emoji}</div>
              <p className="font-semibold text-[#0f1f3d] mb-1.5">{f.title}</p>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 px-6 bg-white">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0f1f3d]">Up and running in minutes</h2>
        </div>
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-5 top-10 bottom-10 w-0.5 bg-slate-100 hidden sm:block" />
          <div className="space-y-5">
            {steps.map((s, i) => (
              <div key={s.n} className="flex items-start gap-5">
                <div className="w-10 h-10 rounded-full bg-[#0d9e7e] flex items-center justify-center text-white font-bold text-sm shrink-0 relative z-10">
                  {s.n}
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 flex-1 border border-slate-100">
                  <p className="font-semibold text-[#0f1f3d]">{s.title}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="py-16 px-6 bg-[#0f1f3d]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Simple pricing</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Pay for what you manage</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-5 mb-8">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 flex flex-col gap-4 ${
                plan.featured
                  ? 'bg-white/12 border-2 border-[#0d9e7e]'
                  : 'bg-white/6 border border-white/10'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-[#0d9e7e] text-white text-xs font-semibold px-4 py-1 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </span>
                </div>
              )}
              <div className={plan.badge ? 'pt-2' : ''}>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">{plan.name}</p>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-white/40 text-sm mb-1">{plan.priceSub}</span>
                </div>
                <p className="text-white/50 text-xs mt-1 leading-relaxed">{plan.desc}</p>
              </div>
              <div className="h-px bg-white/8" />
              <ul className="flex flex-col gap-2 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-white/75">
                    <CheckCircle2 size={13} className="text-[#0d9e7e] shrink-0" />
                    {f}
                  </li>
                ))}
                {plan.dimmed?.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-white/25">
                    <CheckCircle2 size={13} className="text-white/20 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => base44.auth.redirectToLogin('/')}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all mt-2 ${
                  plan.featured
                    ? 'bg-[#0d9e7e] text-white hover:bg-[#0b8a6e]'
                    : 'bg-transparent text-white border border-white/20 hover:bg-white/8'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
        <div className="text-center bg-white/6 rounded-2xl py-4 px-6">
          <p className="text-white/70 text-sm">
            <span className="text-[#0d9e7e] font-semibold">Tenants are always free</span> — your tenants never pay to use Tenurly.
          </p>
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {stats.map(s => (
            <div key={s.label} className="text-center bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <p className="text-2xl md:text-3xl font-extrabold text-[#0f1f3d] mb-1">{s.value}</p>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
        {/* Testimonials */}
        <h2 className="text-2xl font-bold text-[#0f1f3d] text-center mb-8">What people say</h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {testimonials.map(t => (
            <div key={t.name} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed mb-5">"{t.quote}"</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#0d9e7e]/15 flex items-center justify-center">
                  <span className="text-xs font-bold text-[#0d9e7e]">{t.name[0]}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#0f1f3d]">{t.name}</p>
                  <p className="text-[11px] text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTASection() {
  return (
    <section style={{ background: 'linear-gradient(135deg, #f8faff 0%, #e8f7f3 100%)' }} className="py-20 px-6 text-center">
      <div className="max-w-lg mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f1f3d] mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          Ready to self-manage, properly?
        </h2>
        <p className="text-slate-500 mb-8">Your first property is free, forever.</p>
        <button
          onClick={() => base44.auth.redirectToLogin('/')}
          className="inline-flex items-center justify-center gap-2 bg-[#0d9e7e] text-white text-base font-bold px-8 py-4 rounded-2xl hover:bg-[#0b8a6e] transition-colors shadow-lg shadow-[#0d9e7e]/25 mb-6"
        >
          Get started — it's free <ArrowRight size={18} />
        </button>
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <Lock size={13} />
          <span>Your data is private and encrypted. We never share your information with agents, advertisers, or anyone else.</span>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0f1f3d] px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                <HomeIcon size={13} className="text-white" />
              </div>
              <span className="font-bold text-white text-lg">Tenurly</span>
            </div>
            <p className="text-white/40 text-sm max-w-xs leading-relaxed">
              Smart, simple property management for self-managed landlords across Australia.
            </p>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm text-white/50">
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-white transition-colors"
            >Pricing</button>
            <button
              onClick={() => base44.auth.redirectToLogin('/')}
              className="hover:text-white transition-colors"
            >Dashboard</button>
            <Link to="/accept-invite" className="hover:text-white transition-colors">Tenant access</Link>
            <button
              onClick={() => base44.auth.redirectToLogin('/settings')}
              className="hover:text-white transition-colors"
            >Settings</button>
          </nav>
        </div>
        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-white/30 text-xs">© 2025 Tenurly. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

/* ─── PAGE ─────────────────────────────────────────── */

export default function Home() {
  return (
    <div className="min-h-screen" style={{ fontFamily: 'DM Sans, Plus Jakarta Sans, sans-serif' }}>
      <NavBar />
      <HeroSection />
      <WhoIsThisFor />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TrustSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}