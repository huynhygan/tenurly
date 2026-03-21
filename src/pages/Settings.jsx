import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { User, Phone, LogOut } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageHeader from '@/components/PageHeader';
import { toast } from "sonner";

export default function Settings() {
  const { user } = useAuth();
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.phone) setPhone(user.phone);
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ phone });
    setSaving(false);
    toast.success('Settings saved');
  };

  return (
    <div>
      <PageHeader title="Settings" back />
      <div className="px-4 space-y-4 mt-2">
        <Card className="p-4 space-y-3">
          <h3 className="text-sm font-semibold">Profile</h3>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-accent">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{user?.full_name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground capitalize">Role: {user?.role || 'tenant'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <h3 className="text-sm font-semibold">Contact</h3>
          <div>
            <Label>Phone Number</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+61 400 000 000" />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Card>

        <Button variant="outline" className="w-full gap-2 text-destructive" onClick={() => base44.auth.logout()}>
          <LogOut className="w-4 h-4" />Sign Out
        </Button>
      </div>
    </div>
  );
}