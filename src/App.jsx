import React from 'react';
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { TabHistoryProvider } from '@/lib/TabHistoryContext';

import RoleLayout from './components/RoleLayout';

const Landing           = React.lazy(() => import('./pages/Home'));
const RoleRouter        = React.lazy(() => import('./pages/RoleRouter'));
const Properties        = React.lazy(() => import('./pages/Properties'));
const PropertyDetail    = React.lazy(() => import('./pages/PropertyDetail'));
const RoomDetail        = React.lazy(() => import('./pages/RoomDetail'));
const RentLedger        = React.lazy(() => import('./pages/RentLedger'));
const Expenses          = React.lazy(() => import('./pages/Expenses'));
const Documents         = React.lazy(() => import('./pages/Documents'));
const MaintenanceRequests = React.lazy(() => import('./pages/MaintenanceRequests'));
const MaintenanceDetail = React.lazy(() => import('./pages/MaintenanceDetail'));
const Messages          = React.lazy(() => import('./pages/Messages'));
const ChatView          = React.lazy(() => import('./pages/ChatView'));
const HouseholdChat     = React.lazy(() => import('./pages/HouseholdChat'));
const Notifications     = React.lazy(() => import('./pages/Notifications'));
const LeaseExpiry       = React.lazy(() => import('./pages/LeaseExpiry'));
const Settings          = React.lazy(() => import('./pages/Settings'));
const TenantRent        = React.lazy(() => import('./pages/TenantRent'));
const TenantRepairs     = React.lazy(() => import('./pages/TenantRepairs'));
const TenantDocuments   = React.lazy(() => import('./pages/TenantDocuments'));
const AcceptInvite      = React.lazy(() => import('./pages/AcceptInvite'));
const Pricing           = React.lazy(() => import('./pages/Pricing'));
const Reports           = React.lazy(() => import('./pages/Reports'));
const Onboarding        = React.lazy(() => import('./pages/Onboarding'));

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Show landing page instead of hard redirect for unauthenticated visitors
      return (
        <React.Suspense fallback={null}>
          <Routes>
            <Route path="/accept-invite" element={<AcceptInvite />} />
            <Route path="*" element={<Landing />} />
          </Routes>
        </React.Suspense>
      );
    }
  }

  return (
    <React.Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    }>
    <Routes>
      <Route path="/accept-invite" element={<AcceptInvite />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route element={<RoleLayout />}>
        <Route path="/" element={<RoleRouter />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />
        <Route path="/rooms/:id" element={<RoomDetail />} />
        <Route path="/properties/:propertyId/rent-ledger" element={<RentLedger />} />
        <Route path="/properties/:propertyId/expenses" element={<Expenses />} />
        <Route path="/properties/:propertyId/documents" element={<Documents />} />
        <Route path="/maintenance" element={<MaintenanceRequests />} />
        <Route path="/maintenance/:id" element={<MaintenanceDetail />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/chat/:chatId" element={<ChatView />} />
        <Route path="/household-chat/:propertyId" element={<HouseholdChat />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/lease-expiry" element={<LeaseExpiry />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/rent" element={<TenantRent />} />
        <Route path="/repairs" element={<TenantRepairs />} />
        <Route path="/documents" element={<TenantDocuments />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </React.Suspense>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <TabHistoryProvider>
            <AuthenticatedApp />
          </TabHistoryProvider>
        </Router>
        <Toaster />
        <SonnerToaster position="top-center" />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App