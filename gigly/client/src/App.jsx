import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/layout/Layout';

// Public pages
import Landing from './pages/public/Landing';
import Browse from './pages/public/Browse';
import Jobs from './pages/public/Jobs';
import JobDetail from './pages/public/JobDetail';
import FreelancerPublicProfile from './pages/public/FreelancerPublicProfile';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import ContactPage from './pages/ContactPage';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Shared
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';

// Freelancer
import FreelancerDashboard from './pages/freelancer/Dashboard';
import FreelancerContracts from './pages/freelancer/Contracts';
import FreelancerProposals from './pages/freelancer/Proposals';
import FreelancerInvoices from './pages/freelancer/Invoices';
import FreelancerProfile from './pages/freelancer/Profile';

// Client
import ClientDashboard from './pages/client/Dashboard';
import ClientJobs from './pages/client/Jobs';
import NewJob from './pages/client/NewJob';
import ClientContracts from './pages/client/Contracts';
import ClientInvoices from './pages/client/Invoices';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminJobs from './pages/admin/Jobs';
import AdminContracts from './pages/admin/Contracts';
import AdminDisputes from './pages/admin/Disputes';
import AdminContactMessages from './pages/admin/ContactMessages';

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-25">
    <div className="text-center">
      <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      <p className="text-sm text-gray-400 font-medium">Loading Gigly...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    const r = { freelancer: '/freelancer/dashboard', client: '/client/dashboard', admin: '/admin/dashboard' };
    return <Navigate to={r[user.role] || '/login'} replace />;
  }
  return <Outlet />;
};

const PublicOnlyRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user) {
    const r = { freelancer: '/freelancer/dashboard', client: '/client/dashboard', admin: '/admin/dashboard' };
    return <Navigate to={r[user.role] || '/'} replace />;
  }
  return <Outlet />;
};

const RoleRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/" replace />;
  const r = { freelancer: '/freelancer/dashboard', client: '/client/dashboard', admin: '/admin/dashboard' };
  return <Navigate to={r[user.role] || '/'} replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/browse" element={<Browse />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/:id" element={<JobDetail />} />
      <Route path="/freelancer/:id" element={<FreelancerPublicProfile />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsOfServicePage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* Auth only */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Dashboard redirect */}
      <Route path="/dashboard" element={<RoleRedirect />} />

      {/* Protected with layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/messages" element={<Messages />} />

          {/* Freelancer */}
          <Route element={<ProtectedRoute roles={['freelancer']} />}>
            <Route path="/freelancer/dashboard" element={<FreelancerDashboard />} />
            <Route path="/freelancer/contracts" element={<FreelancerContracts />} />
            <Route path="/freelancer/proposals" element={<FreelancerProposals />} />
            <Route path="/freelancer/invoices" element={<FreelancerInvoices />} />
            <Route path="/freelancer/profile" element={<FreelancerProfile />} />
          </Route>

          {/* Client */}
          <Route element={<ProtectedRoute roles={['client']} />}>
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/client/jobs" element={<ClientJobs />} />
            <Route path="/client/jobs/new" element={<NewJob />} />
            <Route path="/client/contracts" element={<ClientContracts />} />
            <Route path="/client/invoices" element={<ClientInvoices />} />
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/jobs" element={<AdminJobs />} />
            <Route path="/admin/contracts" element={<AdminContracts />} />
            <Route path="/admin/disputes" element={<AdminDisputes />} />
            <Route path="/admin/messages" element={<AdminContactMessages />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
