import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
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
    features: ['Up to 10 properties', 'Unlimited tenants', 'Rent ledger & tracking', 'Maintenance requests', 'Document storage', 'Financial reports & tax export', 'Lease expiry alerts', 'All messaging features'],
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
  { q: 'Is there a free trial?', a: 'Yes — Growth and Portfolio plans include a 14-day free trial. No credit card required.' },
  { q: 'Can I manage multiple properties?', a: 'Yes — the Growth plan supports up to 10 properties, Portfolio is unlimited.' },
  { q: 'What if I cancel?', a: 'You can cancel anytime. Your data is retained for 90 days.' },
  { q: 'Do my tenants need to pay?', a: 'Never. Tenants use Landlordly for free.' },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10 py-4">
      <button className="w-full flex items-center justify-between text-left gap-4" onClick={() => setOpen(!open)}>
        <span className="text-white font-medium text-sm">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-white/40 shrink-0" /> : <ChevronDown className="w-4 h-4 text-white/40 shrink-0" />}
      </button>
      {open && <p className="text-white/60 text-sm mt-2 leading-relaxed">{a}</p>}
    </div>
  );
}

export default function Pricing() {
  return (
    <div className="min-h-screen bg-[#0f1f3d] px-4 py-14">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Simple pricing</p>
          <h1 className="text-3xl font-bold text-white mb-3">Pay for what you manage</h1>
          <p className="text-white/55 text-sm">Start free. Scale as your portfolio grows. Tenants are always free.</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-10">
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
                    <Check className="w-3.5 h-3.5 text-[#0d9e7e] shrink-0" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
                {plan.dimmed.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-white/25">
                    <Check className="w-3.5 h-3.5 text-white/20 shrink-0" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => base44.auth.redirectToLogin('/')}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all mt-2 ${
                  plan.ctaStyle === 'teal'
                    ? 'bg-[#0d9e7e] text-white hover:bg-[#0b8a6e]'
                    : 'bg-transparent text-white border border-white/20 hover:bg-white/8'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Tenants note */}
        <div className="text-center mb-10 bg-white/6 rounded-2xl py-4 px-6">
          <p className="text-white/70 text-sm">
            <span className="text-[#0d9e7e] font-semibold">Tenants are always free</span> — your tenants never pay anything to use Landlordly.
          </p>
        </div>

        {/* FAQ */}
        <div className="max-w-lg mx-auto">
          <h2 className="text-white font-bold text-lg mb-2 text-center">Frequently asked questions</h2>
          {faqs.map(f => <FaqItem key={f.q} {...f} />)}
        </div>
      </div>
    </div>
  );
}