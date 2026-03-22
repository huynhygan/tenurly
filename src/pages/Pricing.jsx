import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started',
    features: [
      '1 property',
      'Up to 3 tenants',
      'Rent tracking',
      'Manual payment logging',
      'Basic reminders',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 19,
    description: 'Everything you need to manage professionally',
    badge: 'Most Popular',
    features: [
      'Up to 10 properties',
      'Unlimited tenants',
      'Rent reminders & notifications',
      'Payment tracking & confirmation',
      'Lease expiry tracking',
      'Document storage',
      'Maintenance requests',
      'Messaging & group chat',
      'Dashboard analytics',
    ],
    cta: 'Upgrade to Pro',
    highlighted: true,
  },
  {
    name: 'Scale',
    price: 49,
    description: 'For serious property managers',
    features: [
      'Unlimited properties',
      'Advanced analytics',
      'Export reports',
      'Automation tools',
      'Priority support',
    ],
    cta: 'Upgrade to Scale',
    highlighted: false,
  },
];

function PlanCard({ plan }) {
  return (
    <div
      className={`relative rounded-2xl p-6 flex flex-col gap-4 transition-all
        ${plan.highlighted
          ? 'bg-white border-2 border-primary shadow-xl shadow-primary/10 scale-[1.02]'
          : 'bg-white border border-border shadow-sm'
        }`}
    >
      {plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full shadow">
            {plan.badge}
          </span>
        </div>
      )}

      <div className={plan.badge ? 'pt-2' : ''}>
        <p className={`text-sm font-semibold uppercase tracking-wider ${plan.highlighted ? 'text-primary' : 'text-muted-foreground'}`}>
          {plan.name}
        </p>
        <div className="flex items-end gap-1 mt-1">
          <span className="text-4xl font-bold text-foreground">${plan.price}</span>
          <span className="text-muted-foreground text-sm mb-1.5">/month</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
      </div>

      <div className="h-px bg-border" />

      <ul className="flex flex-col gap-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-3 text-sm text-foreground">
            <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center
              ${plan.highlighted ? 'bg-primary/10' : 'bg-muted'}`}>
              <Check className={`w-3 h-3 ${plan.highlighted ? 'text-primary' : 'text-muted-foreground'}`} strokeWidth={2.5} />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <Button
        className={`w-full mt-2 rounded-xl h-11 font-semibold text-sm
          ${plan.highlighted
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
      >
        {plan.cta}
      </Button>
    </div>
  );
}

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-foreground leading-tight">
            Simple, transparent pricing
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Start free. Upgrade anytime.
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-5 pb-10">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground pb-6">
          No contracts. Cancel anytime. Prices in AUD.
        </p>
      </div>
    </div>
  );
}