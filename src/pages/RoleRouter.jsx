import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import LandlordDashboard from './LandlordDashboard';
import TenantDashboard from './TenantDashboard';

export default function RoleRouter() {
  const { user } = useAuth();
  const mode = user?.current_mode || user?.role;
  if (mode === 'tenant') return <TenantDashboard />;
  return <LandlordDashboard />;
}