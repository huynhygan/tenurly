import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import BottomNav from './BottomNav';

export default function RoleLayout() {
  const { currentMode } = useAuth();

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <div className="pb-20">
        <Outlet />
      </div>
      <BottomNav mode={currentMode} />
    </div>
  );
}