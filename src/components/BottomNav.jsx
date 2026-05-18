import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, BedDouble, CreditCard, Wrench, MoreHorizontal, MessageCircle, User, FileText } from 'lucide-react';
import { useTabHistory } from '@/lib/TabHistoryContext';

const landlordTabs = [
  { root: '/properties',   label: 'Properties',  icon: BedDouble },
  { root: '/maintenance',  label: 'Maintenance', icon: Wrench },
  { root: '/messages',     label: 'Messages',    icon: MessageCircle },
  { root: '/settings',     label: 'Settings',    icon: MoreHorizontal },
];

const tenantTabs = [
  { root: '/rent',       label: 'Rent',      icon: CreditCard },
  { root: '/repairs',    label: 'Repairs',   icon: Wrench },
  { root: '/documents',  label: 'Documents', icon: FileText },
  { root: '/messages',   label: 'Messages',  icon: MessageCircle },
];

export default function BottomNav({ mode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { getTabPath, resetTab } = useTabHistory();
  const tabs = mode === 'landlord' ? landlordTabs : tenantTabs;

  const handleTabPress = (root) => {
    const currentPath = location.pathname;
    const isActive = currentPath.startsWith(root);
    if (isActive) {
      resetTab(root);
      navigate(root);
    } else {
      const remembered = getTabPath(root);
      navigate(remembered);
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-xl border-t border-border/60"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto h-[60px] px-2">
        {tabs.map(({ root, icon: Icon, label }) => {
          const isActive = location.pathname.startsWith(root);
          return (
            <button
              key={root}
              onClick={() => handleTabPress(root)}
              className="flex flex-col items-center gap-1 flex-1 py-2 relative"
            >
              {isActive && (
                <span className="absolute top-1.5 w-5 h-1 rounded-full bg-primary" />
              )}
              <Icon
                className={`w-[22px] h-[22px] mt-2 transition-all duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className={`text-[10px] font-semibold transition-colors duration-200 leading-none ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}