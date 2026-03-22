import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Home } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function ModeSwitcher() {
  const { user, currentMode, switchMode } = useAuth();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);

  const userRoles = user?.roles || [];
  const hasLandlord = userRoles.includes('landlord') || user?.role === 'landlord';
  const hasTenant = userRoles.includes('tenant') || user?.role !== 'landlord';
  const canSwitch = hasLandlord && hasTenant;

  if (!canSwitch) return null;

  const handleSwitch = async (mode) => {
    if (mode === currentMode || switching) return;
    setSwitching(true);
    await switchMode(mode);
    setSwitching(false);
    navigate('/');
  };

  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-lg mx-auto px-4 py-2 flex justify-center">
        <div className="flex items-center bg-muted rounded-xl p-1 gap-1">
          <button
            onClick={() => handleSwitch('landlord')}
            disabled={switching}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentMode === 'landlord'
                ? 'bg-white shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Landlord
          </button>
          <button
            onClick={() => handleSwitch('tenant')}
            disabled={switching}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentMode === 'tenant'
                ? 'bg-white shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            Tenant
          </button>
        </div>
      </div>
    </div>
  );
}