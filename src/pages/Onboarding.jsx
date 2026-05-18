import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Building2, Users, DollarSign, FileText, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const STEPS = [
  { id: 'welcome',  title: 'Welcome to Tenurly' },
  { id: 'property', title: 'Add your first property' },
  { id: 'done',     title: "You're all set!" },
];

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [property, setProperty] = useState({ name: '', address: '', city: '', state: '', postcode: '' });

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  const handleSaveProperty = async () => {
    if (!property.name || !property.address) return;
    setSaving(true);
    await base44.entities.Property.create({ ...property, landlord_id: user.id });
    setSaving(false);
    setStep(2);
  };

  const handleSkipProperty = () => setStep(2);

  const handleFinish = () => navigate('/');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex flex-col items-center justify-center px-4 py-12">

      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <div className="w-9 h-9 rounded-xl bg-[#0f1f3d] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="1" y="6" width="16" height="11" rx="1.5" stroke="white" strokeWidth="1.5"/>
            <path d="M5 6V4.5a4 4 0 0 1 8 0V6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="9" cy="11.5" r="1.5" fill="white"/>
          </svg>
        </div>
        <span className="text-xl font-bold text-[#0f1f3d]">Tenurly</span>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className={`rounded-full transition-all ${i === step ? 'w-6 h-2 bg-[#0f1f3d]' : i < step ? 'w-2 h-2 bg-[#0d9e7e]' : 'w-2 h-2 bg-slate-200'}`} />
        ))}
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8">

        {/* ── STEP 0: Welcome ── */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0f1f3d] mb-2">Welcome, {firstName}! 👋</h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                Tenurly helps you manage your rental properties without an agent. Let's get you set up in under 2 minutes.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { icon: Building2, color: 'bg-blue-50 text-blue-600', title: 'Add your properties & rooms', desc: 'Track every property you manage in one place.' },
                { icon: Users, color: 'bg-teal-50 text-teal-600', title: 'Invite your tenants', desc: 'Tenants get a free account to view rent & lodge repairs.' },
                { icon: DollarSign, color: 'bg-emerald-50 text-emerald-600', title: 'Track rent automatically', desc: "Never chase a payment again — get notified when it's due." },
                { icon: FileText, color: 'bg-violet-50 text-violet-600', title: 'Store documents securely', desc: 'Leases, bond receipts, condition reports — all in one place.' },
              ].map(({ icon: Icon, color, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0f1f3d]">{title}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full h-11 bg-[#0f1f3d] hover:bg-[#1a3460] gap-2" onClick={() => setStep(1)}>
              Get started <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* ── STEP 1: Add property ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl font-bold text-[#0f1f3d] mb-1">Add your first property</h1>
              <p className="text-sm text-slate-500">You can add more properties later.</p>
            </div>
            <div className="space-y-3">
              <div>
                <Label>Property name <span className="text-red-400">*</span></Label>
                <Input
                  placeholder="e.g. 12 Maple St"
                  value={property.name}
                  onChange={e => setProperty({ ...property, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Street address <span className="text-red-400">*</span></Label>
                <Input
                  placeholder="e.g. 12 Maple Street"
                  value={property.address}
                  onChange={e => setProperty({ ...property, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <Label>City</Label>
                  <Input placeholder="Brisbane" value={property.city} onChange={e => setProperty({ ...property, city: e.target.value })} />
                </div>
                <div>
                  <Label>State</Label>
                  <Input placeholder="QLD" value={property.state} onChange={e => setProperty({ ...property, state: e.target.value })} />
                </div>
                <div>
                  <Label>Postcode</Label>
                  <Input placeholder="4000" value={property.postcode} onChange={e => setProperty({ ...property, postcode: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="space-y-2 pt-1">
              <Button
                className="w-full bg-[#0f1f3d] hover:bg-[#1a3460] gap-2"
                onClick={handleSaveProperty}
                disabled={!property.name || !property.address || saving}
              >
                {saving ? 'Saving…' : <>Save property <ArrowRight className="w-4 h-4" /></>}
              </Button>
              <button onClick={handleSkipProperty} className="w-full text-sm text-slate-400 hover:text-slate-600 py-1 transition-colors">
                Skip for now →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Done ── */}
        {step === 2 && (
          <div className="text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-emerald-600" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0f1f3d] mb-2">You're ready to go!</h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                Your Tenurly account is set up. Head to your dashboard to add rooms, invite tenants, and start tracking rent.
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Next steps</p>
              {[
                'Add rooms to your property',
                'Invite your first tenant',
                'Set up rent tracking',
              ].map(s => (
                <div key={s} className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0d9e7e]" />
                  {s}
                </div>
              ))}
            </div>
            <Button className="w-full h-11 bg-[#0d9e7e] hover:bg-[#0b8a6e] gap-2" onClick={handleFinish}>
              Go to my dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}