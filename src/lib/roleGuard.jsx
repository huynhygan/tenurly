import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

// Landlord-only routes — tenant-mode users get redirected to /
const LANDLORD_ROUTES = ['/properties', '/reports', '/lease-expiry', '/maintenance'];
// Tenant-only routes — landlord-mode users get redirected to /
const TENANT_ROUTES = ['/rent', '/repairs', '/documents'];

export function RouteGuard({ children }) {
  const { currentMode, isLoadingAuth } = useAuth();
  if (isLoadingAuth) return null;

  const path = window.location.pathname;

  const isLandlordRoute = LANDLORD_ROUTES.some(r => path.startsWith(r));
  const isTenantRoute = TENANT_ROUTES.some(r => path.startsWith(r));

  if (isLandlordRoute && currentMode !== 'landlord') return <Navigate to="/" replace />;
  if (isTenantRoute && currentMode !== 'tenant') return <Navigate to="/" replace />;

  return children;
}