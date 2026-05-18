import React from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, ArrowRight, Lock, Star, Shield } from 'lucide-react';

/* ─── FONTS ─────────────────────────────────────────── */
// DM Serif Display + DM Sans loaded via Google Fonts in index.html (or inline link)
const serifStyle = { fontFamily: "'DM Serif Display', Georgia, serif" };
const sansStyle  = { fontFamily: "'DM Sans', 'Plus Jakarta Sans', sans-serif" };

/* ─── DATA ─────────────────────────────────────────── */

const landlordFeatures = [
  'Add properties and rooms, track every tenancy',
  'Automated rent ledger and payment reminders',
  'Maintenance request dashboard with job tracking',
  'Expense tracking linked to each property',
  'Lease expiry alerts so you\'re never caught off-guard',
  'Tax-ready financial reports',
  'Documents vault — leases, inspection reports, receipts',
  'Invite tenants in 30 seconds via email',
];

const tenantFeatures = [
  'See your rent status and full payment history',
  'Lodge repair or maintenance requests with photos',
  'Track request status — no more texting into a void',
  'Download your lease and important documents anytime',
  'Chat with your landlord or housemates directly',
  'Receive notifications for important updates',
];

const featureCards = [
  { emoji: '💰', title: 'Rent tracking', desc: "Full ledger of every payment, charge and balance. Know exactly who's paid and who's behind — at a glance." },
  { emoji: '🔧', title: 'Maintenance management', desc: 'Tenants log issues, you track progress. From submitted to resolved — every job has a status and a trail.' },
  { emoji: '📄', title: 'Documents vault', desc: 'Leases, inspections, invoices — stored securely against each property. Accessible by landlord and tenant.' },
  { emoji: '⏰', title: 'Lease expiry alerts', desc: 'Get reminded 60 days before lease end. Never be caught scrambling for a renewal at the last minute.' },
  { emoji: '📊', title: 'Expense & tax reports', desc: 'Track every property expense and download tax-ready summaries when EOFY rolls around.' },
  { emoji: '💬', title: 'Built-in messaging', desc: 'Chat with individual tenants or the whole household. Everything logged — no more lost SMS threads.' },
];

const steps = [
  { n: 1, title: 'Create your account', desc: 'Sign up as a landlord — free, no credit card. Takes about 30 seconds.' },
  { n: 2, title: 'Add your property', desc: 'Enter your property address and rooms. Multi-property portfolios are fully supported.' },
  { n: 3, title: 'Invite your tenant', desc: "Enter their email and hit send. They receive a link, create a free account, and they're connected automatically." },
  { n: 4, title: 'Set up rent tracking', desc: 'Add the weekly or monthly rent amount, start date, and payment schedule. Tenurly starts tracking from day one.' },
  { n: 5, title: "You're managing", desc: 'Your dashboard shows everything — rent status, open maintenance jobs, lease dates, and messages. No property manager required.' },
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
    desc: 'For landlords with a growing portfolio of up to 10 properties.',
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
    desc: 'For serious landlords managing large or complex portfolios.',
    features: ['Unlimited properties', 'Unlimited tenants', 'Everything in Growth', 'Priority support', 'Advanced reporting', 'Trust & entity support', 'Bulk operations'],
    dimmed: [],
    cta: 'Contact us',
  },
];

const stats = [
  { value: '$0', label: 'Agent fees per week. Self-manage and keep it.' },
  { value: '5 min', label: 'Average time to add a property and invite a tenant.' },
  { value: '100%', label: 'Private — your data stays yours. No third-party selling.' },
  { value: '24/7', label: 'Tenants can lodge maintenance requests any time.' },
];

const testimonials = [
  { quote: "Finally something that doesn't feel like it was built for a property management company. It's clean, it works, and my tenants actually use it.", name: 'Michael T.', role: '4 properties · Brisbane QLD' },
  { quote: "I was tracking everything in a spreadsheet. Tenurly took maybe an hour to set up and I haven't touched the spreadsheet since.", name: 'Sarah K.', role: '2 properties · Melbourne VIC' },
  { quote: "As a tenant, I love being able to see my payment history and submit repairs without having to chase anyone down.", name: 'James R.', role: 'Tenant · Sydney NSW' },
];

/* ─── COMPONENTS ────────────────────────────────────── */

function NavBar() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  return (
    <header style={{ background: '#0f1f3d' }} className="sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/">
          <img
            src="https://media.base44.com/images/public/69bf28cc1f96db7603e0839d/6aabd63de_tenurly-logo-reversed.svg"
            alt="Tenurly"
            className="h-6"
          />
        </a>
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-white/60">
          <button onClick={() => scrollTo('features')} className="hover:text-white transition-colors">Features</button>
          <button onClick={() => scrollTo('how-it-works')} className="hover:text-white transition-colors">How it works</button>
          <button onClick={() => scrollTo('pricing')} className="hover:text-white transition-colors">Pricing</button>
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={() => base44.auth.redirectToLogin('/dashboard')}
            className="hidden sm:block text-sm font-medium text-white/60 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
          >
            Sign in
          </button>
          <button
            onClick={() => base44.auth.redirectToLogin('/dashboard')}
            className="text-sm font-semibold bg-[#0d9e7e] text-white px-4 py-2.5 rounded-xl hover:bg-[#0b8a6e] transition-colors"
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
    <section style={{ background: 'linear-gradient(160deg, #0f1f3d 0%, #1a3460 60%, #0d2e4a 100%)' }} className="py-24 md:py-36 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 border border-[#0d9e7e]/50 text-[#0d9e7e] text-xs font-semibold px-4 py-2 rounded-full mb-8 bg-[#0d9e7e]/10">
          Built for self-managed landlords
        </div>
        <h1 className="text-4xl md:text-6xl font-normal text-white leading-tight mb-6" style={serifStyle}>
          Property management that{' '}
          <em className="text-[#0d9e7e]" style={{ fontStyle: 'italic' }}>actually makes sense</em>
        </h1>
        <p className="text-base md:text-lg text-white/60 leading-relaxed mb-10 max-w-2xl mx-auto" style={sansStyle}>
          Track rent, handle maintenance, and stay connected with tenants — without paying a property manager. Everything you need, nothing you don&apos;t.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <button
            onClick={() => base44.auth.redirectToLogin('/dashboard')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0d9e7e] text-white text-base font-semibold px-7 py-4 rounded-2xl hover:bg-[#0b8a6e] transition-colors shadow-lg shadow-[#0d9e7e]/30"
            style={sansStyle}
          >
            Start managing for free <ArrowRight size={18} />
          </button>
          <button
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto text-base font-medium text-white/70 px-7 py-4 rounded-2xl border border-white/20 hover:bg-white/10 hover:text-white transition-colors"
            style={sansStyle}
          >
            See how it works
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/40" style={sansStyle}>
          <span>No credit card required</span>
          <span className="hidden sm:block text-white/20">·</span>
          <span>Free plan available</span>
          <span className="hidden sm:block text-white/20">·</span>
          <span>Cancel anytime</span>
          <span className="hidden sm:block text-white/20">·</span>
          <span>Australian landlords welcome</span>
        </div>
      </div>
    </section>
  );
}

function TwoSidesSection() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#0d9e7e] mb-3" style={sansStyle}>Two sides, one platform</p>
          <h2 className="text-2xl md:text-4xl font-normal text-[#0f1f3d]" style={serifStyle}>Are you a landlord or a tenant?</h2>
          <p className="text-slate-500 mt-3 text-sm max-w-lg mx-auto" style={sansStyle}>Tenurly works for both sides of a tenancy — your role determines what you see.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Landlord */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-[#0f1f3d] px-7 py-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-1" style={sansStyle}>For Landlords</p>
              <h3 className="text-xl font-normal text-white" style={serifStyle}>You're in control</h3>
              <p className="text-white/50 text-sm mt-1.5" style={sansStyle}>Manage your properties, invite tenants, and keep everything organised — without an agent eating into your returns.</p>
            </div>
            <div className="bg-white p-7">
              <ul className="space-y-2.5 mb-7">
                {landlordFeatures.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700" style={sansStyle}>
                    <CheckCircle2 size={15} className="text-[#0d9e7e] mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => base44.auth.redirectToLogin('/dashboard')}
                className="w-full py-3 rounded-xl bg-[#0f1f3d] text-white text-sm font-semibold hover:bg-[#1a3460] transition-colors"
                style={sansStyle}
              >
                Set up your properties →
              </button>
            </div>
          </div>

          {/* Tenant */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-[#0d9e7e] px-7 py-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-1" style={sansStyle}>For Tenants</p>
              <h3 className="text-xl font-normal text-white" style={serifStyle}>Everything you need, at a glance</h3>
              <p className="text-white/70 text-sm mt-1.5" style={sansStyle}>Your landlord invited you to Tenurly. Here&apos;s what you get — a simple, clear view of your tenancy.</p>
            </div>
            <div className="bg-white p-7">
              <ul className="space-y-2.5 mb-7">
                {tenantFeatures.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700" style={sansStyle}>
                    <CheckCircle2 size={15} className="text-[#0d9e7e] mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/accept-invite"
                className="block w-full py-3 rounded-xl border-2 border-[#0d9e7e] text-[#0d9e7e] text-sm font-semibold text-center hover:bg-[#0d9e7e]/5 transition-colors"
                style={sansStyle}
              >
                Access your tenancy →
              </Link>
            </div>
          </div>
        </div>

        {/* Tenant explainer */}
        <div className="bg-[#e8f7f3] border border-[#0d9e7e]/20 rounded-2xl p-6 flex items-start gap-4">
          <span className="text-2xl shrink-0">🔑</span>
          <div>
            <p className="font-semibold text-[#0f1f3d] mb-1" style={sansStyle}>Tenants — how do I sign up?</p>
            <p className="text-sm text-slate-600 leading-relaxed" style={sansStyle}>
              You don&apos;t sign up directly. Your landlord sends you an invite link via email. Clicking it creates your account and connects you to your tenancy automatically. Your data is private — only you and your landlord can see it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-6" style={{ background: '#f8faff' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#0d9e7e] mb-3" style={sansStyle}>What's included</p>
          <h2 className="text-2xl md:text-4xl font-normal text-[#0f1f3d]" style={serifStyle}>Everything self-managed landlords need</h2>
          <p className="text-slate-500 mt-3 text-sm max-w-lg mx-auto" style={sansStyle}>No bloat. No features you&apos;ll never use. Just the core stuff that saves you time and avoids headaches.</p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {featureCards.map(f => (
            <div key={f.title} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4">{f.emoji}</div>
              <p className="font-semibold text-[#0f1f3d] mb-2" style={sansStyle}>{f.title}</p>
              <p className="text-sm text-slate-500 leading-relaxed" style={sansStyle}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 px-6 bg-white">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#0d9e7e] mb-3" style={sansStyle}>Getting started</p>
          <h2 className="text-2xl md:text-4xl font-normal text-[#0f1f3d]" style={serifStyle}>Up and running in minutes</h2>
          <p className="text-slate-500 mt-3 text-sm" style={sansStyle}>Setting up takes less time than a call to a property manager.</p>
        </div>
        <div className="relative">
          <div className="absolute left-5 top-10 bottom-10 w-0.5 bg-slate-100 hidden sm:block" />
          <div className="space-y-4">
            {steps.map(s => (
              <div key={s.n} className="flex items-start gap-5">
                <div className="w-10 h-10 rounded-full bg-[#0f1f3d] flex items-center justify-center text-white font-bold text-sm shrink-0 relative z-10" style={sansStyle}>
                  {s.n}
                </div>
                <div className="bg-slate-50 rounded-2xl p-5 flex-1 border border-slate-100">
                  <p className="font-semibold text-[#0f1f3d] mb-1" style={sansStyle}>{s.title}</p>
                  <p className="text-sm text-slate-500" style={sansStyle}>{s.desc}</p>
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
    <section id="pricing" className="py-20 px-6 bg-[#0f1f3d]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3" style={sansStyle}>Simple pricing</p>
          <h2 className="text-2xl md:text-4xl font-normal text-white" style={serifStyle}>Pay for what you manage</h2>
          <p className="text-white/50 mt-3 text-sm" style={sansStyle}>Start free. Scale as your portfolio grows. Tenants are always free.</p>
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
                  <span className="bg-[#0d9e7e] text-white text-xs font-semibold px-4 py-1 rounded-full whitespace-nowrap" style={sansStyle}>
                    {plan.badge}
                  </span>
                </div>
              )}
              <div className={plan.badge ? 'pt-2' : ''}>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2" style={sansStyle}>{plan.name}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-3xl font-bold text-white" style={serifStyle}>{plan.price}</span>
                  <span className="text-white/40 text-sm mb-1" style={sansStyle}>{plan.priceSub}</span>
                </div>
                <p className="text-white/50 text-xs leading-relaxed" style={sansStyle}>{plan.desc}</p>
              </div>
              <div className="h-px bg-white/10" />
              <ul className="flex flex-col gap-2 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-white/75" style={sansStyle}>
                    <CheckCircle2 size={13} className="text-[#0d9e7e] shrink-0" />
                    {f}
                  </li>
                ))}
                {plan.dimmed?.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-white/20" style={sansStyle}>
                    <CheckCircle2 size={13} className="text-white/15 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => base44.auth.redirectToLogin('/dashboard')}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                  plan.featured
                    ? 'bg-[#0d9e7e] text-white hover:bg-[#0b8a6e]'
                    : 'bg-transparent text-white border border-white/20 hover:bg-white/10'
                }`}
                style={sansStyle}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
        <div className="text-center bg-white/6 rounded-2xl py-4 px-6">
          <p className="text-white/60 text-sm" style={sansStyle}>
            <span className="text-[#0d9e7e] font-semibold">Tenants are always free</span> — your tenants never pay to use Tenurly.
          </p>
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#0d9e7e] mb-3" style={sansStyle}>Why landlords choose us</p>
          <h2 className="text-2xl md:text-4xl font-normal text-[#0f1f3d]" style={serifStyle}>Built by landlords, for landlords</h2>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {stats.map(s => (
            <div key={s.label} className="text-center bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <p className="text-2xl md:text-3xl font-bold text-[#0f1f3d] mb-2" style={serifStyle}>{s.value}</p>
              <p className="text-xs text-slate-500 leading-relaxed" style={sansStyle}>{s.label}</p>
            </div>
          ))}
        </div>
        {/* Testimonials */}
        <div className="grid sm:grid-cols-3 gap-5">
          {testimonials.map(t => (
            <div key={t.name} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed mb-5" style={sansStyle}>"{t.quote}"</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#0d9e7e]/15 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[#0d9e7e]">{t.name[0]}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#0f1f3d]" style={sansStyle}>{t.name}</p>
                  <p className="text-[11px] text-slate-400" style={sansStyle}>{t.role}</p>
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
    <section style={{ background: 'linear-gradient(160deg, #0f1f3d 0%, #1a3460 60%, #0d2e4a 100%)' }} className="py-24 px-6 text-center">
      <div className="max-w-lg mx-auto">
        <h2 className="text-3xl md:text-5xl font-normal text-white mb-4" style={serifStyle}>
          Ready to self-manage, properly?
        </h2>
        <p className="text-white/50 mb-10 text-base" style={sansStyle}>
          Join landlords who&apos;ve ditched the spreadsheets and the agent fees. Your first property is free, forever.
        </p>
        <button
          onClick={() => base44.auth.redirectToLogin('/dashboard')}
          className="inline-flex items-center justify-center gap-2 bg-[#0d9e7e] text-white text-base font-semibold px-8 py-4 rounded-2xl hover:bg-[#0b8a6e] transition-colors shadow-lg shadow-[#0d9e7e]/30 mb-8"
          style={sansStyle}
        >
          Get started — it's free <ArrowRight size={18} />
        </button>
        <div className="flex items-start justify-center gap-2 text-xs text-white/30 max-w-sm mx-auto" style={sansStyle}>
          <Lock size={13} className="mt-0.5 shrink-0" />
          <span>Your data is private and encrypted. We don&apos;t sell to agents, advertisers, or anyone else. Your tenant information is yours.</span>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0a1628] px-6 py-10 border-t border-white/10">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div>
            <img
              src="https://media.base44.com/images/public/69bf28cc1f96db7603e0839d/6aabd63de_tenurly-logo-reversed.svg"
              alt="Tenurly"
              className="h-6 mb-3"
            />
            <p className="text-white/40 text-sm max-w-xs leading-relaxed" style={sansStyle}>
              Smart, simple property management for self-managed landlords across Australia.
            </p>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm text-white/40" style={sansStyle}>
            <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">Pricing</button>
            <button onClick={() => base44.auth.redirectToLogin('/')} className="hover:text-white transition-colors">Dashboard</button>
            <Link to="/accept-invite" className="hover:text-white transition-colors">Tenant access</Link>
            <button onClick={() => base44.auth.redirectToLogin('/settings')} className="hover:text-white transition-colors">Settings</button>
          </nav>
        </div>
        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-white/20 text-xs" style={sansStyle}>© 2025 Tenurly. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

/* ─── PAGE ─────────────────────────────────────────── */

export default function Home() {
  React.useEffect(() => { document.title = 'Tenurly — Self-Managed Property, Sorted'; }, []);
  return (
    <div className="min-h-screen">
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap"
        rel="stylesheet"
      />
      <NavBar />
      <HeroSection />
      <TwoSidesSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TrustSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}