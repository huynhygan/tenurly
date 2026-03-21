import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function AppLayout({ role }) {
  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <div className="pb-20">
        <Outlet />
      </div>
      <BottomNav role={role} />
    </div>
  );
}