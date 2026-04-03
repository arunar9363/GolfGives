import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Public pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PricingPage from './pages/PricingPage';
import HowItWorksPage from './pages/HowItWorksPage';
import CharitiesPage from './pages/charity/CharitiesPage';
import CharityDetailPage from './pages/charity/CharityDetailPage';

// Dashboard pages
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import ScoresPage from './pages/dashboard/ScoresPage';
import DrawPage from './pages/dashboard/DrawPage';
import WinningsPage from './pages/dashboard/WinningsPage';
import CharitySelectionPage from './pages/dashboard/CharitySelectionPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import ProofUploadPage from './pages/dashboard/ProofUploadPage';

// Admin pages
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDraws from './pages/admin/AdminDraws';
import AdminCharities from './pages/admin/AdminCharities';
import AdminWinners from './pages/admin/AdminWinners';

// Guards
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <PageLoader />;
  if (user) return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  return children;
};

const PageLoader = () => (
  <div className="min-h-screen bg-dark-900 flex items-center justify-center">
    <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<HomePage />} />
    <Route path="/how-it-works" element={<HowItWorksPage />} />
    <Route path="/pricing" element={<PricingPage />} />
    <Route path="/charities" element={<CharitiesPage />} />
    <Route path="/charities/:slug" element={<CharityDetailPage />} />
    <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
    <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

    {/* Dashboard */}
    <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
      <Route index element={<DashboardOverview />} />
      <Route path="scores" element={<ScoresPage />} />
      <Route path="draw" element={<DrawPage />} />
      <Route path="winnings" element={<WinningsPage />} />
      <Route path="winnings/:winnerId/proof" element={<ProofUploadPage />} />
      <Route path="charity" element={<CharitySelectionPage />} />
      <Route path="settings" element={<ProfilePage />} />
    </Route>

    {/* Admin */}
    <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
      <Route index element={<AdminDashboard />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="draws" element={<AdminDraws />} />
      <Route path="charities" element={<AdminCharities />} />
      <Route path="winners" element={<AdminWinners />} />
    </Route>

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const ThemedToaster = () => {
  const { isDark } = useTheme();
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: isDark
          ? { background: '#1a241a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
          : { background: '#ffffff', color: '#0f1f0f', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' },
        success: { iconTheme: { primary: '#22c55e', secondary: isDark ? '#fff' : '#0f1f0f' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: isDark ? '#fff' : '#0f1f0f' } },
      }}
    />
  );
};

const App = () => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <ThemedToaster />
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;
