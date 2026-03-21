import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import LandlordDashboard from './LandlordDashboard';
import TenantDashboard from './TenantDashboard';

export default function RoleRouter() {
  const { user } = useAuth();
  if (user?.role === 'landlord') return <LandlordDashboard />;
  return <TenantDashboard />;
}