import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, Lock, Home, ArrowRight } from 'lucide-react';

/* ─── SHARED LAYOUT ─────────────────────────────────────── */

function Page({ children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg, #f0fdf9 0%, #f8faff 60%, #fff 100%)' }}>
      {children}
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2 mb-8">
      <div className="w-9 h-9 rounded-xl bg-[#0f1f3d] flex items-center justify-center">
        <Home size={16} className="text-white" />
      </div>
      <span className="text-xl font-bold text-[#0f1f3d]">Tenurly</span>
    </div>
  );
}

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-3xl shadow-lg border border-slate-100 w-full max-w-[480px] p-8 ${className}`}>
      {children}
    </div>
  );
}

const BENEFITS = [
  'See your rent status and full payment history',
  'Submit and track maintenance and repair requests',
  'Download your lease and important documents',
  'Message your landlord directly',
  'Get notified about important updates',
];

function BenefitsList() {
  return (
    <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">What you can do</p>
      {BENEFITS.map(b => (
        <div key={b} className="flex items-start gap-2.5">
          <CheckCircle2 size={15} className="text-[#0d9e7e] mt-0.5 shrink-0" />
          <span className="text-sm text-slate-700">{b}</span>
        </div>
      ))}
    </div>
  );
}

function PrivacyNote() {
  return (
    <div className="flex items-start gap-2 text-xs text-slate-400 leading-relaxed pt-2">
      <Lock size={12} className="mt-0.5 shrink-0 text-[#0d9e7e]" />
      <span>
        <span className="font-semibold text-slate-500">Your data is private.</span>{' '}
        Only you and your landlord can see your tenancy information. Tenurly never shares your data with real estate agents, advertisers, or anyone else.
      </span>
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────── */

export default function AcceptInvite() {
  const { user, isLoadingAuth, addRole } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [invite, setInvite] = useState(null);
  const [property, setProperty] = useState(null);

  const code = new URLSearchParams(window.location.search).get('code');

  useEffect(() => {
    import('@/lib/setPageMeta').then(({ setPageMeta }) => {
      setPageMeta("You've been invited — Tenurly", 'Your landlord has invited you to Tenurly. Create your free account to view your rent, submit repairs, and access your lease documents.', true, '/accept-invite');
    });
  }, []);
  useEffect(() => {
    if (!code) { setStatus('error'); return; }
    if (isLoadingAuth) return;
    if (!user) { setStatus('auth_required'); return; }
    loadInvite();
  }, [code, user, isLoadingAuth]);

  const loadInvite = async () => {
    setStatus('loading');
    const results = await base44.entities.Invite.filter({ code });
    if (!results.length) { setStatus('error'); return; }
    const inv = results[0];
    if (inv.status === 'accepted' || inv.status === 'expired') { setStatus('error'); return; }
    setInvite(inv);

    // Try to load property details for context
    if (inv.property_id) {
      const props = await base44.entities.Property.filter({ id: inv.property_id });
      if (props.length) setProperty(props[0]);
    }

    setStatus('found');
  };

  const handleAccept = async () => {
    setStatus('accepting');
    await base44.entities.Tenancy.update(invite.tenancy_id, { tenant_id: user.id, status: 'active' });
    await addRole('tenant');
    await base44.entities.Invite.update(invite.id, { status: 'accepted' });
    await base44.auth.updateMe({ current_mode: 'tenant' });
    setStatus('accepted');
  };

  const handleReject = async () => {
    await base44.entities.Invite.update(invite.id, { status: 'expired' });
    setStatus('rejected');
  };

  // ── Loading ──
  if (status === 'loading' || isLoadingAuth) {
    return (
      <Page>
        <Logo />
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[#0d9e7e] rounded-full animate-spin" />
      </Page>
    );
  }

  // ── Unauthenticated: show full invite preview + sign-up CTA ──
  if (status === 'auth_required') {
    const returnUrl = window.location.href;
    return (
      <Page>
        <Logo />
        <Card>
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#0d9e7e]/10 flex items-center justify-center mx-auto mb-4">
              <Home size={24} className="text-[#0d9e7e]" />
            </div>
            <h1 className="text-2xl font-bold text-[#0f1f3d] mb-2">You've been invited to Tenurly</h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Your landlord has set up your tenancy. Create your free account to get access.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl px-4 py-3 mb-5 text-sm text-slate-600">
            Tenurly connects you with your landlord so you can manage your tenancy in one place.
          </div>

          <BenefitsList />

          <div className="mt-6 space-y-2.5">
            <button
              onClick={() => base44.auth.redirectToLogin(returnUrl)}
              className="w-full h-12 bg-[#0d9e7e] hover:bg-[#0b8a6e] text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-colors text-sm"
            >
              Create my account <ArrowRight size={16} />
            </button>
            <button
              onClick={() => base44.auth.redirectToLogin(returnUrl)}
              className="w-full h-11 text-sm font-medium text-slate-500 hover:text-[#0f1f3d] transition-colors"
            >
              I already have an account — Sign in
            </button>
          </div>

          <PrivacyNote />
        </Card>
      </Page>
    );
  }

  // ── Invalid / expired invite ──
  if (status === 'error') {
    return (
      <Page>
        <Logo />
        <Card>
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
              <XCircle size={28} className="text-red-400" />
            </div>
            <h1 className="text-xl font-bold text-[#0f1f3d]">This invite link has expired</h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              This link has already been used or is no longer valid. Contact your landlord to request a new invite link.
            </p>
            <button
              onClick={() => base44.auth.redirectToLogin('/')}
              className="text-sm font-semibold text-[#0d9e7e] hover:underline"
            >
              Sign in to your existing account →
            </button>
          </div>
        </Card>
      </Page>
    );
  }

  // ── Accepted ──
  if (status === 'accepted') {
    return (
      <Page>
        <Logo />
        <Card>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <h1 className="text-xl font-bold text-[#0f1f3d]">You're in! Welcome to Tenurly.</h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Your tenancy has been activated. You can now view your rent, submit repairs, and access your documents.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full h-12 bg-[#0d9e7e] hover:bg-[#0b8a6e] text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-colors text-sm"
            >
              Go to my dashboard <ArrowRight size={16} />
            </button>
          </div>
        </Card>
      </Page>
    );
  }

  // ── Rejected ──
  if (status === 'rejected') {
    return (
      <Page>
        <Logo />
        <Card>
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
              <XCircle size={26} className="text-slate-400" />
            </div>
            <h1 className="text-xl font-bold text-[#0f1f3d]">Invite declined</h1>
            <p className="text-sm text-slate-500">You've declined this tenancy invite. Contact your landlord if you change your mind.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm font-semibold text-[#0d9e7e] hover:underline"
            >
              Back to home →
            </button>
          </div>
        </Card>
      </Page>
    );
  }

  // ── Found — signed-in user, ready to accept ──
  const propertyLine = property
    ? `${property.address || property.name}`
    : null;

  return (
    <Page>
      <Logo />
      <Card>
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#0d9e7e]/10 flex items-center justify-center mx-auto mb-4">
            <Home size={24} className="text-[#0d9e7e]" />
          </div>
          <h1 className="text-2xl font-bold text-[#0f1f3d] mb-2">You've been invited to Tenurly</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            {propertyLine
              ? <>Your landlord has added you to <span className="font-semibold text-slate-700">{propertyLine}</span>.</>
              : 'Your landlord has set up your tenancy and invited you to join.'}
          </p>
        </div>

        {/* What is Tenurly */}
        <div className="bg-slate-50 rounded-2xl px-4 py-3 mb-4 text-sm text-slate-600 leading-relaxed">
          Tenurly connects you with your landlord so you can manage your tenancy in one place.
        </div>

        {/* Benefits */}
        <BenefitsList />

        {/* Invited email chip */}
        {invite?.tenant_email && (
          <div className="mt-4 flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-3 text-sm">
            <span className="text-slate-400">Invited email</span>
            <span className="font-semibold text-[#0f1f3d]">{invite.tenant_email}</span>
          </div>
        )}

        {/* CTAs */}
        <div className="mt-5 space-y-2.5">
          <button
            onClick={handleAccept}
            disabled={status === 'accepting'}
            className="w-full h-12 bg-[#0d9e7e] hover:bg-[#0b8a6e] disabled:opacity-60 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-colors text-sm"
          >
            {status === 'accepting'
              ? <><Loader2 size={16} className="animate-spin" /> Setting up your account…</>
              : <>Accept & set up my account <ArrowRight size={16} /></>}
          </button>
          <button
            onClick={handleReject}
            disabled={status === 'accepting'}
            className="w-full h-10 text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            Decline invite
          </button>
        </div>

        <PrivacyNote />
      </Card>
    </Page>
  );
}