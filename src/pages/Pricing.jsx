import React, { useState } from 'react';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    priceSub: 'forever',
    desc: 'For landlords just getting started with 1 property.',
    features: ['1 property', 'Up to 3 tenants', 'Rent ledger & tracking', 'Maintenance requests', 'Document storage'],
    dimmed: ['Financial reports', 'Priority support'],
    cta: 'Get started free',
    ctaStyle: 'outline',
  },
  {
    name: 'Growth',
    price: '$19',
    priceSub: '/ month',
    desc: 'For landlords with a growing portfolio of up to 10 properties.',
    features: ['Up to 10 properties', 'Unlimited tenants', 'Rent ledger & tracking', 'Maintenance requests', 'Document storage', 'Financial reports & tax export', 'Lease expiry alerts'],
    dimmed: [],
    cta: 'Start free 14-day trial',
    ctaStyle: 'teal',
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
    ctaStyle: 'outline',
  },
];

const faqs = [
  { q: 'Is there a free trial?', a: 'Yes — Growth and Portfolio plans include a 14-day free trial. No credit card required to start.' },
  { q: 'Can I manage multiple properties?', a: 'Yes — the Growth plan supports up to 10 properties. Portfolio is unlimited.' },
  { q: 'What if I cancel?', a: 'You can cancel anytime. Your data is retained for 90 days after cancellation.' },
  { q: 'Do my tenants need to pay?', a: 'Never. Tenants use Tenurly completely free.' },
  { q: 'Is my data secure?', a: 'Yes — all data is encrypted and private. We never share your information with real estate agents, advertisers, or any third parties.' },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 py-4">
      <button className="w-full flex items-center justify-between text-left gap-4" onClick={() => setOpen(!open)}>
        <span className="text-[#0f1f3d] font-semibold text-sm">{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
      </button>
      {open && <p className="text-slate-500 text-sm mt-2.5 leading-relaxed">{a}</p>}
    </div>
  );
}

function PlanCard({ plan }) {
  return (
    <div className="relative flex flex-col">
      {/* Badge above card */}
      {plan.badge && (
        <div className="flex justify-center mb-3">
          <span className="bg-[#0d9e7e] text-white text-xs font-semibold px-4 py-1 rounded-full">
            {plan.badge}
          </span>
        </div>
      )}
      {/* No badge spacer to keep cards aligned on desktop */}
      {!plan.badge && <div className="mb-3 h-[26px]" />}

      <div className={`flex-1 flex flex-col rounded-2xl p-6 ${
        plan.featured
          ? 'border-2 border-[#0d9e7e] bg-white/10'
          : 'border border-white/10 bg-white/6'
      }`}>
        {/* Plan name */}
        <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">{plan.name}</p>

        {/* Price */}
        <div className="flex items-end gap-1.5 mb-1">
          <span className="text-4xl font-bold text-white leading-none">{plan.price}</span>
          <span className="text-white/40 text-sm mb-1">{plan.priceSub}</span>
        </div>

        {/* Description */}
        <p className="text-white/50 text-xs leading-relaxed mb-5">{plan.desc}</p>

        {/* Divider */}
        <div className="h-px bg-white/10 mb-4" />

        {/* Features */}
        <ul className="flex flex-col gap-2.5 flex-1 mb-6">
          {plan.features.map(f => (
            <li key={f} className="flex items-start gap-2 text-sm text-white/80">
              <Check className="w-4 h-4 text-[#0d9e7e] shrink-0 mt-0.5" strokeWidth={2.5} />
              <span>{f}</span>
            </li>
          ))}
          {plan.dimmed.map(f => (
            <li key={f} className="flex items-start gap-2 text-sm text-white/25">
              <X className="w-4 h-4 text-white/20 shrink-0 mt-0.5" strokeWidth={2} />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={() => base44.auth.redirectToLogin('/')}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
            plan.ctaStyle === 'teal'
              ? 'bg-[#0d9e7e] text-white hover:bg-[#0b8a6e]'
              : 'bg-transparent text-white border border-white/25 hover:bg-white/8'
          }`}
        >
          {plan.cta}
        </button>
      </div>
    </div>
  );
}

export default function Pricing() {
  return (
    <div className="min-h-screen font-jakarta">

      {/* ── NAVY SECTION ───────────────────────────────── */}
      <div className="bg-[#0f1f3d] px-4 pt-16 pb-14">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Simple pricing</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Pay for what you manage</h1>
            <p className="text-white/55 text-sm sm:text-base">Start free. Scale as your portfolio grows. Tenants are always free.</p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {plans.map(plan => <PlanCard key={plan.name} plan={plan} />)}
          </div>

          {/* Tenant note */}
          <p className="text-center text-white/60 text-sm mt-8">
            <span className="text-[#0d9e7e] font-semibold">Tenants are always free</span> — your tenants never pay anything to use Tenurly.
          </p>
        </div>
      </div>

      {/* ── WHITE FAQ SECTION ──────────────────────────── */}
      <div className="bg-white px-4 py-14">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[#0f1f3d] text-center mb-8">Frequently asked questions</h2>
          {faqs.map(f => <FaqItem key={f.q} {...f} />)}
        </div>
      </div>

    </div>
  );
}