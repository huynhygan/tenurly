import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Building2, MessageCircle, Bell, User, CreditCard } from 'lucide-react';
import { useTabHistory } from '@/lib/TabHistoryContext';

const landlordTabs = [
  { root: '/',             label: 'Dashboard',  icon: Home },
  { root: '/properties',  label: 'Properties', icon: Building2 },
  { root: '/messages',    label: 'Messages',   icon: MessageCircle },
  { root: '/notifications', label: 'Alerts',   icon: Bell },
  { root: '/settings',    label: 'Profile',    icon: User },
];

const tenantTabs = [
  { root: '/',             label: 'Home',     icon: Home },
  { root: '/rent',         label: 'Payments', icon: CreditCard },
  { root: '/messages',     label: 'Messages', icon: MessageCircle },
  { root: '/notifications', label: 'Alerts',  icon: Bell },
  { root: '/settings',     label: 'Profile',  icon: User },
];

export default function BottomNav({ mode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { getTabPath, resetTab } = useTabHistory();
  const tabs = mode === 'landlord' ? landlordTabs : tenantTabs;

  const handleTabPress = (root) => {
    const currentPath = location.pathname;
    const isActive = root === '/'
      ? currentPath === '/'
      : currentPath.startsWith(root);

    if (isActive) {
      // Tap active tab: reset to root (go home within that tab)
      resetTab(root);
      navigate(root);
    } else {
      // Navigate to last remembered path for this tab
      const remembered = getTabPath(root);
      navigate(remembered);
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto h-16 px-1">
        {tabs.map(({ root, icon: Icon, label }) => {
          const isActive = root === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(root);
          return (
            <button
              key={root}
              onClick={() => handleTabPress(root)}
              className="flex flex-col items-center gap-1 flex-1 py-2"
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-primary/10' : 'active:bg-muted'}`}>
                <Icon
                  className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
              </div>
              <span className={`text-[10px] font-medium transition-colors duration-200 leading-none ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}