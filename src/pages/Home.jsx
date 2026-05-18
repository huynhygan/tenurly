import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, HomeIcon, DollarSign, Wrench, Bell, Shield, ArrowRight, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const features = [
  { icon: DollarSign, title: 'Rent tracking', desc: 'Log payments, see who\'s paid and who\'s overdue — at a glance.' },
  { icon: Bell, title: 'Automated reminders', desc: 'Email reminders go out automatically. No more chasing.' },
  { icon: Wrench, title: 'Maintenance requests', desc: 'Tenants lodge repairs in the app. You get notified instantly.' },
  { icon: Shield, title: 'Lease & documents', desc: 'Store lease agreements and bond receipts safely in one place.' },
];

const steps = [
  { n: '1', title: 'Add your property', desc: 'Takes 60 seconds.' },
  { n: '2', title: 'Invite your tenant', desc: 'They get a link by email.' },
  { n: '3', title: 'Everything runs itself', desc: 'Reminders, ledger, repairs.' },
];

const testimonials = [
  { name: 'Sarah M.', role: 'Landlord · 3 properties', quote: 'I used to chase rent by text. Now I just check the app on Monday morning.' },
  { name: 'Jordan K.', role: 'Tenant · Brisbane', quote: 'Way easier than my last landlord\'s spreadsheet. I can see my payment history instantly.' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-jakarta">

      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <HomeIcon size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg text-foreground">Landlordly</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => base44.auth.redirectToLogin('/')}
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            Sign in
          </button>
          <button
            onClick={() => base44.auth.redirectToLogin('/')}
            className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors"
          >
            Get started free
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-16 pb-14 text-center max-w-lg mx-auto">
        <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <Star size={12} className="text-primary" />
          Built for self-managed landlords in Australia
        </div>
        <h1 className="text-4xl font-extrabold text-foreground leading-tight mb-4">
          Manage your rentals<br />
          <span className="text-primary">without the headache</span>
        </h1>
        <p className="text-base text-muted-foreground mb-8 leading-relaxed">
          Track rent, handle repairs, and keep your tenants in the loop — all from one simple app. No agents, no spreadsheets.
        </p>
        <button
          onClick={() => base44.auth.redirectToLogin('/')}
          className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 bg-primary text-white text-base font-bold py-4 rounded-2xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
        >
          Start for free <ArrowRight size={18} />
        </button>
        <p className="text-xs text-muted-foreground mt-3">No credit card required · Free forever for 1 property</p>
      </section>

      {/* Mock phone visual */}
      <section className="px-6 mb-14">
        <div className="max-w-sm mx-auto bg-white rounded-3xl border-2 border-border/50 shadow-2xl overflow-hidden">
          <div className="bg-background px-5 pt-6 pb-4">
            <p className="text-xs text-muted-foreground">Good morning</p>
            <p className="text-xl font-bold text-foreground">Landlordly</p>
          </div>
          <div className="grid grid-cols-2 gap-2 px-5 pb-4">
            {[
              { label: 'Occupied rooms', value: '4 / 6', color: 'text-emerald-600' },
              { label: 'Weekly income', value: '$1,205', color: 'text-foreground' },
              { label: 'Rent overdue', value: '1 room', color: 'text-red-500' },
              { label: 'Open repairs', value: '2', color: 'text-foreground' },
            ].map(s => (
              <div key={s.label} className="bg-secondary/60 rounded-2xl p-3">
                <p className="text-xs text-muted-foreground mb-0.5">{s.label}</p>
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
          <div className="px-5 pb-5">
            <p className="text-sm font-semibold mb-2">Needs attention</p>
            <div className="bg-white rounded-2xl border border-border/40 divide-y divide-border/30 overflow-hidden">
              {[
                { dot: 'bg-red-500', title: 'Room 3 — Jordan M.', sub: '$560 outstanding · 14 days overdue' },
                { dot: 'bg-emerald-500', title: 'Room 1 — Amy L. paid', sub: '$280 received · Today' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${item.dot}`} />
                  <div>
                    <p className="text-xs font-medium text-foreground">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 mb-14 max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-foreground text-center mb-8">Up and running in 3 steps</h2>
        <div className="space-y-4">
          {steps.map(s => (
            <div key={s.n} className="flex items-start gap-4 bg-white rounded-2xl border border-border/40 p-4">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold text-sm">{s.n}</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">{s.title}</p>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 mb-14 max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-foreground text-center mb-8">Everything you actually need</h2>
        <div className="grid grid-cols-2 gap-3">
          {features.map(f => (
            <div key={f.title} className="bg-white rounded-2xl border border-border/40 p-4">
              <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center mb-3">
                <f.icon size={18} className="text-primary" />
              </div>
              <p className="font-semibold text-sm text-foreground mb-1">{f.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 mb-14 max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-foreground text-center mb-8">What people say</h2>
        <div className="space-y-3">
          {testimonials.map(t => (
            <div key={t.name} className="bg-white rounded-2xl border border-border/40 p-5">
              <p className="text-sm text-foreground leading-relaxed mb-4">"{t.quote}"</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{t.name[0]}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-16 max-w-lg mx-auto text-center">
        <div className="bg-primary rounded-3xl p-8">
          <h2 className="text-2xl font-extrabold text-white mb-2">Ready to simplify your rentals?</h2>
          <p className="text-sm text-white/80 mb-6">Join landlords who've ditched the spreadsheets.</p>
          <button
            onClick={() => base44.auth.redirectToLogin('/')}
            className="w-full bg-white text-primary text-base font-bold py-4 rounded-2xl hover:bg-white/90 transition-colors"
          >
            Get started — it's free
          </button>
          <p className="text-xs text-white/60 mt-3">No credit card · 1 property free forever</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 px-6 py-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
            <HomeIcon size={12} className="text-white" />
          </div>
          <span className="font-bold text-foreground">Landlordly</span>
        </div>
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mb-2">
          <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <span>·</span>
          <button onClick={() => base44.auth.redirectToLogin('/')} className="hover:text-foreground transition-colors">Sign in</button>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 Landlordly. Built for Australian self-managed landlords.</p>
      </footer>
    </div>
  );
}