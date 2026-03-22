import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import BottomNav from './BottomNav';
import ModeSwitcher from './ModeSwitcher';
import PageTransition from './PageTransition';
import { useTabHistory } from '@/lib/TabHistoryContext';

const TAB_ROOTS = ['/', '/properties', '/messages', '/notifications', '/settings', '/rent', '/repairs', '/documents'];

function getTabRoot(path) {
  return TAB_ROOTS
    .filter(r => r === '/' ? path === '/' : path.startsWith(r))
    .sort((a, b) => b.length - a.length)[0] || null;
}

export default function RoleLayout() {
  const { currentMode } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { pushTab, popTab } = useTabHistory();

  // Register every navigation into the appropriate tab stack
  useEffect(() => {
    const path = location.pathname;
    const tabRoot = getTabRoot(path);
    if (tabRoot) pushTab(tabRoot, path + location.search);
  }, [location.pathname, location.search]);

  // Sync browser back button with tab-specific history stack
  useEffect(() => {
    const handlePopState = (e) => {
      const path = location.pathname;
      const tabRoot = getTabRoot(path);
      if (!tabRoot) return;
      const prev = popTab(tabRoot);
      if (prev && prev !== path) {
        e.preventDefault?.();
        navigate(prev, { replace: true });
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location.pathname, popTab, navigate]);

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