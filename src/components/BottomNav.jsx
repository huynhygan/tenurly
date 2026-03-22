import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Building2, MessageCircle, Bell, User, CreditCard } from 'lucide-react';

const landlordTabs = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/properties', label: 'Properties', icon: Building2 },
  { path: '/messages', label: 'Messages', icon: MessageCircle },
  { path: '/notifications', label: 'Alerts', icon: Bell },
  { path: '/settings', label: 'Profile', icon: User },
];

const tenantTabs = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/rent', label: 'Payments', icon: CreditCard },
  { path: '/messages', label: 'Messages', icon: MessageCircle },
  { path: '/notifications', label: 'Alerts', icon: Bell },
  { path: '/settings', label: 'Profile', icon: User },
];

export default function BottomNav({ mode }) {
  const location = useLocation();
  const tabs = mode === 'landlord' ? landlordTabs : tenantTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16 px-1">
        {tabs.map(({ path, icon: Icon, label }) => {
          const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <Link key={path} to={path} className="flex flex-col items-center gap-1 flex-1 py-2 group">
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-primary/10' : 'group-active:bg-muted'}`}>
                <Icon
                  className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
              </div>
              <span className={`text-[10px] font-medium transition-colors duration-200 leading-none ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}