import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { User, Phone, LogOut, Building2, Home, ArrowLeftRight } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageHeader from '@/components/PageHeader';
import { toast } from "sonner";

export default function Settings() {
  const { user, currentMode, switchMode } = useAuth();
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (user?.phone) setPhone(user.phone);
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ phone });
    setSaving(false);
    toast.success('Settings saved');
  };

  const handleSwitchMode = async (mode) => {
    if (mode === currentMode) return;
    setSwitching(true);
    await switchMode(mode);
    setSwitching(false);
    toast.success(`Switched to ${mode === 'landlord' ? 'Landlord' : 'Tenant'} view`);
  };

  const userRoles = user?.roles || [];
  const hasLandlord = userRoles.includes('landlord') || user?.role === 'landlord';
  const hasTenant = userRoles.includes('tenant') || user?.role !== 'landlord';
  const canSwitch = hasLandlord && hasTenant;

  return (
    <div>
      <PageHeader title="Settings" back />
      <div className="px-4 space-y-4 mt-2">

        {/* Profile */}
        <Card className="p-4 space-y-3">
          <h3 className="text-sm font-semibold">Profile</h3>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-accent">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{user?.full_name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground capitalize mt-0.5">
                Viewing as: <span className="font-medium text-primary">{currentMode}</span>
              </p>
            </div>
          </div>
        </Card>

        {/* Mode Switcher — only shown if user has both roles */}
        {canSwitch && (
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Switch Mode</h3>
            </div>
            <p className="text-xs text-muted-foreground">You have both landlord and tenant access. Switch how you view the app.</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSwitchMode('landlord')}
                disabled={switching}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  currentMode === 'landlord'
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:bg-muted/40'
                }`}
              >
                <Building2 className={`w-5 h-5 ${currentMode === 'landlord' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-xs font-medium ${currentMode === 'landlord' ? 'text-primary' : 'text-muted-foreground'}`}>
                  Landlord
                </span>
                {currentMode === 'landlord' && (
                  <span className="text-[10px] text-primary font-medium">Active</span>
                )}
              </button>
              <button
                onClick={() => handleSwitchMode('tenant')}
                disabled={switching}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  currentMode === 'tenant'
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:bg-muted/40'
                }`}
              >
                <Home className={`w-5 h-5 ${currentMode === 'tenant' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-xs font-medium ${currentMode === 'tenant' ? 'text-primary' : 'text-muted-foreground'}`}>
                  Tenant
                </span>
                {currentMode === 'tenant' && (
                  <span className="text-[10px] text-primary font-medium">Active</span>
                )}
              </button>
            </div>
          </Card>
        )}

        {/* Contact */}
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
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </div>
    </div>
  );
}