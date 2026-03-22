import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Building2, Home, Trash2, AlertTriangle, ChevronRight, Phone } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Settings() {
  const { user, currentMode, switchMode } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

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
    if (mode === currentMode || switching) return;
    setSwitching(true);
    await switchMode(mode);
    setSwitching(false);
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    setDeleting(true);
    try {
      await base44.entities.User.delete(user.id);
      await base44.auth.logout();
    } catch {
      toast.error('Could not delete account. Please contact support.');
      setDeleting(false);
    }
  };

  const userRoles = user?.roles || [];
  const hasLandlord = userRoles.includes('landlord');
  const hasTenant = userRoles.includes('tenant');
  const canSwitch = hasLandlord && hasTenant;
  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="px-5 pt-6 pb-5">
        <h1 className="text-2xl font-extrabold">Profile</h1>
      </div>

      {/* Avatar card */}
      <div className="px-5 mb-4">
        <div className="bg-white rounded-3xl p-5 border border-border/40 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white text-xl font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-base truncate">{user?.full_name}</p>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary capitalize">
              {currentMode} mode
            </span>
          </div>
        </div>
      </div>

      {/* Mode switch */}
      {canSwitch && (
        <div className="px-5 mb-4">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">Switch mode</h2>
          <div className="bg-white rounded-3xl overflow-hidden border border-border/40 shadow-sm">
            {hasLandlord && (
              <button
                onClick={() => handleSwitchMode('landlord')}
                disabled={switching}
                className={`w-full flex items-center gap-3 px-4 py-4 transition-colors ${currentMode === 'landlord' ? 'bg-primary/5' : 'active:bg-muted/60'} border-b border-border/40`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${currentMode === 'landlord' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm">Landlord</p>
                  <p className="text-xs text-muted-foreground">Manage properties & tenants</p>
                </div>
                {currentMode === 'landlord' ? (
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">Active</span>
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            )}
            {hasTenant && (
              <button
                onClick={() => handleSwitchMode('tenant')}
                disabled={switching}
                className={`w-full flex items-center gap-3 px-4 py-4 transition-colors ${currentMode === 'tenant' ? 'bg-primary/5' : 'active:bg-muted/60'}`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${currentMode === 'tenant' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                  <Home className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm">Tenant</p>
                  <p className="text-xs text-muted-foreground">View rent, repairs & documents</p>
                </div>
                {currentMode === 'tenant' ? (
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">Active</span>
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Contact */}
      <div className="px-5 mb-4">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">Contact</h2>
        <div className="bg-white rounded-3xl p-4 border border-border/40 shadow-sm space-y-3">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Phone number</Label>
            <div className="flex items-center gap-2 mt-1.5">
              <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+61 400 000 000"
                className="border-0 p-0 h-auto shadow-none focus-visible:ring-0 text-sm"
              />
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full rounded-2xl">
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </div>

      {/* Account actions */}
      <div className="px-5 space-y-3">
        <button
          onClick={() => base44.auth.logout()}
          className="w-full bg-white rounded-3xl px-4 py-4 border border-border/40 shadow-sm flex items-center gap-3 active:scale-[0.99] transition-transform"
        >
          <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center">
            <LogOut className="w-5 h-5 text-muted-foreground" />
          </div>
          <span className="font-semibold text-sm">Sign out</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
        </button>

        <button
          onClick={() => setDeleteOpen(true)}
          className="w-full text-center text-xs text-muted-foreground underline underline-offset-2 py-2"
        >
          Delete account
        </button>
      </div>

      {/* Delete dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" /> Delete Account
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <div>
              <Label>Type <span className="font-bold text-foreground">DELETE</span> to confirm</Label>
              <Input
                className="mt-1"
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
              />
            </div>
            <Button
              variant="destructive"
              className="w-full gap-2 rounded-2xl"
              disabled={deleteConfirm !== 'DELETE' || deleting}
              onClick={handleDeleteAccount}
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? 'Deleting...' : 'Permanently Delete Account'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}