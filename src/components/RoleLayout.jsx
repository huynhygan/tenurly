import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import BottomNav from './BottomNav';
import ModeSwitcher from './ModeSwitcher';
import PageTransition from './PageTransition';
import { useTabHistory } from '@/lib/TabHistoryContext';

const TAB_ROOTS = ['/', '/properties', '/messages', '/notifications', '/settings', '/rent', '/repairs', '/documents'];

export default function RoleLayout() {
  const { currentMode } = useAuth();
  const location = useLocation();
  const { pushTab } = useTabHistory();

  // Register every navigation into the appropriate tab stack
  useEffect(() => {
    const path = location.pathname;
    // Find the deepest matching tab root
    const tabRoot = TAB_ROOTS
      .filter(r => r === '/' ? path === '/' : path.startsWith(r))
      .sort((a, b) => b.length - a.length)[0];
    if (tabRoot) pushTab(tabRoot, path + location.search);
  }, [location.pathname, location.search]);

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