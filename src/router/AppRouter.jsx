import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminLayout } from '../components/layout/AdminLayout';
import { StudentLayout } from '../components/layout/StudentLayout';
import { useAuth } from '../context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import { PageWrapper } from '../components/common/PageWrapper';

// Lazy-loaded pages — each becomes its own JS chunk, loaded on demand
const LoginPage           = lazy(() => import('../pages/LoginPage'));
const RegisterPage        = lazy(() => import('../pages/RegisterPage'));
const BookShuttlePage     = lazy(() => import('../pages/student/BookShuttlePage'));
const TripHistoryPage     = lazy(() => import('../pages/student/TripHistoryPage'));
const RouteDirectoryPage  = lazy(() => import('../pages/student/RouteDirectoryPage'));
const DashboardPage       = lazy(() => import('../pages/admin/DashboardPage'));
const DriverAvailabilityPage = lazy(() => import('../pages/admin/DriverAvailabilityPage'));
const RouteManagementPage = lazy(() => import('../pages/admin/RouteManagementPage'));
const BookingManagementPage = lazy(() => import('../pages/admin/BookingManagementPage'));

// Minimal inline spinner — shown while a lazy chunk is downloading
function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', width: '100%',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid var(--color-border)',
        borderTopColor: 'var(--color-primary)',
        animation: 'spin 0.6s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'ADMIN'
    ? <Navigate to="/admin/dashboard" replace />
    : <Navigate to="/student/book" replace />;
}

function AnimatedRoutes() {
  const location = useLocation();
  const baseKey = location.pathname.split('/')[1] || 'root';

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={baseKey}>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login"    element={<PageWrapper><LoginPage /></PageWrapper>} />
          <Route path="/register" element={<PageWrapper><RegisterPage /></PageWrapper>} />

          {/* Student routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute requiredRole="STUDENT">
                <PageWrapper>
                  <StudentLayout />
                </PageWrapper>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="book" replace />} />
            <Route path="book"    element={<BookShuttlePage />} />
            <Route path="history" element={<TripHistoryPage />} />
            <Route path="routes"  element={<RouteDirectoryPage />} />
          </Route>

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <PageWrapper>
                  <AdminLayout />
                </PageWrapper>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="drivers"   element={<DriverAvailabilityPage />} />
            <Route path="routes"    element={<RouteManagementPage />} />
            <Route path="bookings"  element={<BookingManagementPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

