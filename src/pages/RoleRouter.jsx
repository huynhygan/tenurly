import React from 'react';
import { useAuth } from '@/lib/AuthContext';

const LandlordDashboard = React.lazy(() => import('./LandlordDashboard'));
const TenantDashboard   = React.lazy(() => import('./TenantDashboard'));

export default function RoleRouter() {
  const { currentMode } = useAuth();
  if (currentMode === 'landlord') return <LandlordDashboard />;
  return <TenantDashboard />;
}