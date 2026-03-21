import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Building2, Wrench, MessageCircle, Bell, Receipt, FileText } from 'lucide-react';

const landlordTabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/properties', icon: Building2, label: 'Properties' },
  { path: '/maintenance', icon: Wrench, label: 'Repairs' },
  { path: '/messages', icon: MessageCircle, label: 'Messages' },
  { path: '/notifications', icon: Bell, label: 'Alerts' },
];

const tenantTabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/rent', icon: Receipt, label: 'Rent' },
  { path: '/repairs', icon: Wrench, label: 'Repairs' },
  { path: '/messages', icon: MessageCircle, label: 'Messages' },
  { path: '/notifications', icon: Bell, label: 'Alerts' },
];

export default function BottomNav({ role }) {
  const location = useLocation();
  const tabs = role === 'landlord' ? landlordTabs : tenantTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16 px-2">
        {tabs.map(({ path, icon: Icon, label }) => {
          const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}