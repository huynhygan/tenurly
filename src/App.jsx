import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import RoleLayout from './components/RoleLayout';
import RoleRouter from './pages/RoleRouter';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import RoomDetail from './pages/RoomDetail';
import RentLedger from './pages/RentLedger';
import Expenses from './pages/Expenses';
import Documents from './pages/Documents';
import MaintenanceRequests from './pages/MaintenanceRequests';
import MaintenanceDetail from './pages/MaintenanceDetail';
import Messages from './pages/Messages';
import ChatView from './pages/ChatView';
import HouseholdChat from './pages/HouseholdChat';
import Notifications from './pages/Notifications';
import LeaseExpiry from './pages/LeaseExpiry';
import Settings from './pages/Settings';
import TenantRent from './pages/TenantRent';
import TenantRepairs from './pages/TenantRepairs';
import TenantDocuments from './pages/TenantDocuments';
import AcceptInvite from './pages/AcceptInvite';

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
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/accept-invite" element={<AcceptInvite />} />
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
        <Route path="/settings" element={<Settings />} />
        <Route path="/rent" element={<TenantRent />} />
        <Route path="/repairs" element={<TenantRepairs />} />
        <Route path="/documents" element={<TenantDocuments />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <SonnerToaster position="top-center" />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App