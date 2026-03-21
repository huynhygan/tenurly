import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AcceptInvite() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const [status, setStatus] = useState('loading');
  const [invite, setInvite] = useState(null);

  useEffect(() => {
    const accept = async () => {
      if (!code || !user) return;
      const invites = await base44.entities.Invite.filter({ code, status: 'pending' });
      if (invites.length === 0) {
        setStatus('invalid');
        return;
      }
      const inv = invites[0];
      setInvite(inv);

      // Update invite
      await base44.entities.Invite.update(inv.id, { status: 'accepted' });

      // Update tenancy with tenant_id
      if (inv.tenancy_id) {
        await base44.entities.Tenancy.update(inv.tenancy_id, { tenant_id: user.id });
      }

      // Set user role
      await base44.auth.updateMe({ role: 'tenant' });

      setStatus('success');
    };
    accept();
  }, [code, user]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="p-8 text-center max-w-sm w-full">
        {status === 'loading' && (
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Accepting invite...</p>
          </div>
        )}
        {status === 'success' && (
          <div className="space-y-3">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
            <h2 className="font-bold text-lg">Welcome!</h2>
            <p className="text-sm text-muted-foreground">Your invite has been accepted. You're now set up as a tenant.</p>
            <Button onClick={() => navigate('/')} className="w-full">Go to Dashboard</Button>
          </div>
        )}
        {status === 'invalid' && (
          <div className="space-y-3">
            <XCircle className="w-8 h-8 text-destructive mx-auto" />
            <h2 className="font-bold text-lg">Invalid Invite</h2>
            <p className="text-sm text-muted-foreground">This invite link is invalid or has already been used.</p>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">Go Home</Button>
          </div>
        )}
      </Card>
    </div>
  );
}