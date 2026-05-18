import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Building2, KeyRound, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import LandlordDashboard from './LandlordDashboard';
import TenantDashboard from './TenantDashboard';

export default function RoleRouter() {
  const { user } = useAuth();
  useEffect(() => { document.title = 'Get started — Tenurly'; }, []);
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [showTenantInfo, setShowTenantInfo] = useState(false);
  const [saving, setSaving] = useState(false);

  // If user already has a mode set, show the right dashboard directly
  const mode = user?.current_mode || user?.role;
  if (mode === 'tenant') return <TenantDashboard />;
  if (mode === 'admin' || mode === 'landlord') return <LandlordDashboard />;

  const handleContinue = async () => {
    if (!selected) return;
    setSaving(true);
    if (selected === 'landlord') {
      await base44.auth.updateMe({ current_mode: 'landlord' });
      navigate('/');
    } else {
      setShowTenantInfo(true);
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/40 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <div className="w-9 h-9 rounded-xl bg-[#0f1f3d] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="1" y="6" width="16" height="11" rx="1.5" stroke="white" strokeWidth="1.5"/>
            <path d="M5 6V4.5a4 4 0 0 1 8 0V6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="9" cy="11.5" r="1.5" fill="white"/>
          </svg>
        </div>
        <span className="text-xl font-bold text-[#0f1f3d]" style={{ fontFamily: 'serif' }}>Tenurly</span>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8">
          <h1 className="text-2xl font-bold text-[#0f1f3d] text-center mb-2">Welcome — who are you?</h1>
          <p className="text-sm text-slate-500 text-center mb-8">Choose your role to get started.</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Landlord card */}
            <button
              onClick={() => { setSelected('landlord'); setShowTenantInfo(false); }}
              className={`relative rounded-2xl border-2 p-5 text-left transition-all ${
                selected === 'landlord'
                  ? 'border-[#0f1f3d] bg-[#0f1f3d]/5 shadow-md'
                  : 'border-border hover:border-[#0f1f3d]/40 bg-white'
              }`}
            >
              {selected === 'landlord' && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#0f1f3d] flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              )}
              <div className="w-10 h-10 rounded-xl bg-[#0f1f3d]/10 flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5 text-[#0f1f3d]" />
              </div>
              <p className="font-bold text-sm text-[#0f1f3d]">I'm a landlord</p>
              <p className="text-xs text-slate-500 mt-1 leading-snug">I own or manage properties</p>
            </button>

            {/* Tenant card */}
            <button
              onClick={() => { setSelected('tenant'); setShowTenantInfo(true); }}
              className={`relative rounded-2xl border-2 p-5 text-left transition-all ${
                selected === 'tenant'
                  ? 'border-[#0d9e7e] bg-[#0d9e7e]/5 shadow-md'
                  : 'border-border hover:border-[#0d9e7e]/40 bg-white'
              }`}
            >
              {selected === 'tenant' && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#0d9e7e] flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              )}
              <div className="w-10 h-10 rounded-xl bg-[#0d9e7e]/10 flex items-center justify-center mb-3">
                <KeyRound className="w-5 h-5 text-[#0d9e7e]" />
              </div>
              <p className="font-bold text-sm text-[#0f1f3d]">I'm a tenant</p>
              <p className="text-xs text-slate-500 mt-1 leading-snug">I rent a property</p>
            </button>
          </div>

          {/* Tenant info panel */}
          {showTenantInfo && (
            <div className="bg-[#e8f7f3] border border-[#0d9e7e]/20 rounded-2xl p-4 mb-5 text-sm text-slate-700 leading-relaxed">
              <p className="font-semibold text-[#0d9e7e] mb-1">How tenants join</p>
              <p>Tenants can't sign up directly. Your landlord sends you an invite link via email.</p>
              <p className="mt-2">
                If you have an invite link,{' '}
                <a href="/accept-invite" className="text-[#0d9e7e] font-semibold underline underline-offset-2">click here to use it</a>.
              </p>
              <p className="mt-1">Already accepted? Continue below to access your account.</p>
            </div>
          )}

          <button
            onClick={handleContinue}
            disabled={!selected || saving}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all ${
              selected
                ? 'bg-[#0f1f3d] text-white hover:bg-[#1a3460] shadow-md'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {saving ? 'Setting up…' : <>Continue <ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>

        {/* Privacy note */}
        <div className="flex items-start gap-2 mt-5 px-2">
          <Lock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-500">Your data is private and encrypted. We never share your information with agents or advertisers.</p>
        </div>
      </div>
    </div>
  );
}