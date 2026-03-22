import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, Home } from 'lucide-react';

export default function AcceptInvite() {
  const { user, addRole } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | found | accepting | accepted | rejected | error
  const [invite, setInvite] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const code = new URLSearchParams(window.location.search).get('code');

  useEffect(() => {
    if (!code) { setStatus('error'); setErrorMsg('No invite code found in URL.'); return; }
    if (!user) return; // wait for auth
    loadInvite();
  }, [code, user]);

  const loadInvite = async () => {
    setStatus('loading');
    const results = await base44.entities.Invite.filter({ code });
    if (!results.length) { setStatus('error'); setErrorMsg('Invite not found or already used.'); return; }
    const inv = results[0];
    if (inv.status === 'accepted') { setStatus('error'); setErrorMsg('This invite has already been accepted.'); return; }
    if (inv.status === 'expired') { setStatus('error'); setErrorMsg('This invite has expired.'); return; }
    setInvite(inv);
    setStatus('found');
  };

  const handleAccept = async () => {
    setStatus('accepting');
    // Link the tenant's user ID to the tenancy
    await base44.entities.Tenancy.update(invite.tenancy_id, {
      tenant_id: user.id,
      status: 'active',
    });
    // Ensure tenant role exists on this user
    await addRole('tenant');
    // Mark invite as accepted
    await base44.entities.Invite.update(invite.id, { status: 'accepted' });
    // Set mode to tenant
    await base44.auth.updateMe({ current_mode: 'tenant' });
    setStatus('accepted');
  };

  const handleReject = async () => {
    await base44.entities.Invite.update(invite.id, { status: 'expired' });
    setStatus('rejected');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === 'accepted') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-sm w-full p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-emerald-50"><CheckCircle2 className="w-10 h-10 text-emerald-600" /></div>
          </div>
          <h1 className="text-xl font-bold">You're in!</h1>
          <p className="text-sm text-muted-foreground">Your tenancy has been activated. Welcome to your new home.</p>
          <Button className="w-full gap-2" onClick={() => navigate('/')}>
            <Home className="w-4 h-4" /> Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-sm w-full p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-red-50"><XCircle className="w-10 h-10 text-red-500" /></div>
          </div>
          <h1 className="text-xl font-bold">Invite declined</h1>
          <p className="text-sm text-muted-foreground">You've declined this tenancy invite.</p>
          <Button variant="outline" className="w-full" onClick={() => navigate('/')}>Go to Home</Button>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-sm w-full p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-red-50"><XCircle className="w-10 h-10 text-red-500" /></div>
          </div>
          <h1 className="text-xl font-bold">Invalid invite</h1>
          <p className="text-sm text-muted-foreground">{errorMsg}</p>
          <Button variant="outline" className="w-full" onClick={() => navigate('/')}>Go to Home</Button>
        </Card>
      </div>
    );
  }

  // status === 'found'
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="max-w-sm w-full p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-accent"><Home className="w-8 h-8 text-primary" /></div>
          </div>
          <h1 className="text-xl font-bold">Tenancy Invite</h1>
          <p className="text-sm text-muted-foreground">
            You've been invited to join a property as a tenant.
          </p>
        </div>
        <div className="bg-muted rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Invited email</span><span className="font-medium">{invite?.tenant_email}</span></div>
        </div>
        <div className="space-y-2">
          <Button className="w-full" onClick={handleAccept} disabled={status === 'accepting'}>
            {status === 'accepting' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            Accept Invite
          </Button>
          <Button variant="outline" className="w-full" onClick={handleReject} disabled={status === 'accepting'}>
            Decline
          </Button>
        </div>
      </Card>
    </div>
  );
}