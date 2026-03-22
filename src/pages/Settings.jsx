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

        {/* App Mode */}
        <Card className="overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-border">
            <h3 className="text-sm font-semibold">App Mode</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {canSwitch ? 'You have access to both modes. Tap to switch.' : 'Your current access level.'}
            </p>
          </div>

          {/* Landlord option */}
          {hasLandlord && (
            <button
              onClick={() => canSwitch && handleSwitchMode('landlord')}
              disabled={switching || !canSwitch}
              className={`w-full flex items-center gap-4 px-4 py-4 transition-colors ${
                currentMode === 'landlord' ? 'bg-primary/5' : canSwitch ? 'hover:bg-muted/40' : ''
              } ${hasLandlord && hasTenant ? 'border-b border-border' : ''}`}
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                currentMode === 'landlord' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className={`font-semibold ${currentMode === 'landlord' ? 'text-primary' : 'text-foreground'}`}>Landlord Mode</p>
                <p className="text-xs text-muted-foreground">Manage properties, rent & tenants</p>
              </div>
              {currentMode === 'landlord' && (
                <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">Active</span>
              )}
            </button>
          )}

          {/* Tenant option */}
          {hasTenant && (
            <button
              onClick={() => canSwitch && handleSwitchMode('tenant')}
              disabled={switching || !canSwitch}
              className={`w-full flex items-center gap-4 px-4 py-4 transition-colors ${
                currentMode === 'tenant' ? 'bg-primary/5' : canSwitch ? 'hover:bg-muted/40' : ''
              }`}
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                currentMode === 'tenant' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <Home className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className={`font-semibold ${currentMode === 'tenant' ? 'text-primary' : 'text-foreground'}`}>Tenant Mode</p>
                <p className="text-xs text-muted-foreground">View rent, repairs & documents</p>
              </div>
              {currentMode === 'tenant' && (
                <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">Active</span>
              )}
            </button>
          )}
        </Card>

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