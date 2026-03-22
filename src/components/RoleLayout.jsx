import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import BottomNav from './BottomNav';
import ModeSwitcher from './ModeSwitcher';
import PageTransition from './PageTransition';

export default function RoleLayout() {
  const { currentMode } = useAuth();

  return (
    <div
      className="min-h-screen bg-background max-w-lg mx-auto relative flex flex-col"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <ModeSwitcher />
      <div className="flex-1 overflow-y-auto pb-20" style={{ paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)' }}>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </div>
      <BottomNav mode={currentMode} />
    </div>
  );
}