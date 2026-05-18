import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, LogIn, UserPlus, Lock } from 'lucide-react';

const Logo = () => (
  <div className="flex items-center gap-2 justify-center mb-8">
    <div className="w-9 h-9 rounded-xl bg-[#0f1f3d] flex items-center justify-center">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="6" width="16" height="11" rx="1.5" stroke="white" strokeWidth="1.5"/>
        <path d="M5 6V4.5a4 4 0 0 1 8 0V6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="9" cy="11.5" r="1.5" fill="white"/>
      </svg>
    </div>
    <span className="text-xl font-bold text-[#0f1f3d]">Landlordly</span>
  </div>
);

export default function AcceptInvite() {
  const { user, isLoadingAuth, addRole } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [invite, setInvite] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const code = new URLSearchParams(window.location.search).get('code');

  useEffect(() => {
    if (!code) { setStatus('error'); setErrorMsg('No invite code found in URL.'); return; }
    if (isLoadingAuth) return;
    if (!user) { setStatus('auth_required'); return; }
    loadInvite();
  }, [code, user, isLoadingAuth]);

  const loadInvite = async () => {
    setStatus('loading');
    const results = await base44.entities.Invite.filter({ code });
    if (!results.length) { setStatus('error'); setErrorMsg('This invite link has expired or already been used.'); return; }
    const inv = results[0];
    if (inv.status === 'accepted') { setStatus('error'); setErrorMsg('This invite link has expired or already been used.'); return; }
    if (inv.status === 'expired') { setStatus('error'); setErrorMsg('This invite link has expired or already been used.'); return; }
    setInvite(inv);
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

  const wrap = (children) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/30 flex flex-col items-center justify-center px-4 py-12">
      <Logo />
      <Card className="max-w-sm w-full p-8">{children}</Card>
    </div>
  );

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (status === 'auth_required') {
    const returnUrl = window.location.href;
    return wrap(
      <div className="text-center space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1f3d]">You've been invited to Landlordly</h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Landlordly connects you with your landlord. You'll use it to view your rent, lodge repairs, and access your documents.
          </p>
        </div>
        <div className="bg-[#e8f7f3] rounded-2xl p-4 text-sm text-left space-y-2">
          {[
            'See your rent status and payment history',
            'Submit and track maintenance requests',
            'Download your lease and important documents',
            'Message your landlord directly',
          ].map(item => (
            <div key={item} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0d9e7e] mt-0.5 shrink-0" />
              <span className="text-slate-700">{item}</span>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <Button className="w-full h-12 text-base font-semibold gap-2 bg-[#0f1f3d] hover:bg-[#1a3460]" onClick={() => base44.auth.redirectToLogin(returnUrl)}>
            <UserPlus className="w-4 h-4" /> Create my account
          </Button>
          <Button variant="outline" className="w-full gap-2" onClick={() => base44.auth.redirectToLogin(returnUrl)}>
            <LogIn className="w-4 h-4" /> I already have an account — Sign in
          </Button>
        </div>
        <div className="flex items-center gap-2 justify-center text-xs text-slate-400">
          <Lock className="w-3 h-3" />
          <span>Your data is private. Only you and your landlord can see your tenancy information.</span>
        </div>
      </div>
    );
  }

  if (status === 'accepted') return wrap(
    <div className="text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
      </div>
      <h1 className="text-xl font-bold text-[#0f1f3d]">You're in!</h1>
      <p className="text-sm text-slate-500">Your tenancy has been activated. Welcome to your new home.</p>
      <Button className="w-full bg-[#0d9e7e] hover:bg-[#0b8a6e] gap-2" onClick={() => navigate('/')}>
        Go to my dashboard →
      </Button>
    </div>
  );

  if (status === 'rejected') return wrap(
    <div className="text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
        <XCircle className="w-8 h-8 text-red-500" />
      </div>
      <h1 className="text-xl font-bold text-[#0f1f3d]">Invite declined</h1>
      <p className="text-sm text-slate-500">You've declined this tenancy invite.</p>
      <Button variant="outline" className="w-full" onClick={() => navigate('/')}>Go to home</Button>
    </div>
  );

  if (status === 'error') return wrap(
    <div className="text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
        <XCircle className="w-8 h-8 text-red-500" />
      </div>
      <h1 className="text-xl font-bold text-[#0f1f3d]">This link isn't valid</h1>
      <p className="text-sm text-slate-500">{errorMsg}</p>
      <p className="text-xs text-slate-400">Contact your landlord for a new invite link.</p>
      <Button variant="outline" className="w-full" onClick={() => base44.auth.redirectToLogin('/')}>Sign in to your existing account →</Button>
    </div>
  );

  // found
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/30 flex flex-col items-center justify-center px-4 py-12">
      <Logo />
      <Card className="max-w-sm w-full p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-[#0f1f3d]">You've been invited to Landlordly</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Your landlord has set up your tenancy. Accept below to get access to your rent history, repairs, and documents.
          </p>
        </div>

        <div className="bg-[#e8f7f3] rounded-2xl p-4 text-sm space-y-2">
          {[
            'See your rent status and payment history',
            'Submit and track maintenance requests',
            'Download your lease and important documents',
            'Message your landlord directly',
          ].map(item => (
            <div key={item} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0d9e7e] mt-0.5 shrink-0" />
              <span className="text-slate-700">{item}</span>
            </div>
          ))}
        </div>

        <div className="bg-muted/60 rounded-2xl p-3 text-sm flex justify-between">
          <span className="text-slate-500">Invited email</span>
          <span className="font-medium text-[#0f1f3d]">{invite?.tenant_email}</span>
        </div>

        <div className="space-y-2">
          <Button
            className="w-full h-12 text-base font-semibold gap-2 bg-[#0d9e7e] hover:bg-[#0b8a6e]"
            onClick={handleAccept}
            disabled={status === 'accepting'}
          >
            {status === 'accepting' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Accept & set up my account
          </Button>
          <Button variant="ghost" className="w-full text-slate-400 text-sm" onClick={handleReject} disabled={status === 'accepting'}>
            Decline invite
          </Button>
        </div>

        <div className="flex items-center gap-2 justify-center text-xs text-slate-400">
          <Lock className="w-3 h-3" />
          <span>Your data is private. Only you and your landlord can see your tenancy information.</span>
        </div>
      </Card>
    </div>
  );
}