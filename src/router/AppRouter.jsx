import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminLayout } from '../components/layout/AdminLayout';
import { StudentLayout } from '../components/layout/StudentLayout';
import { useAuth } from '../context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import { PageWrapper } from '../components/common/PageWrapper';

// Standard static imports — bundles everything into one optimized file
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import BookShuttlePage from '../pages/student/BookShuttlePage';
import TripHistoryPage from '../pages/student/TripHistoryPage';
import RouteDirectoryPage from '../pages/student/RouteDirectoryPage';
import DashboardPage from '../pages/admin/DashboardPage';
import DriverAvailabilityPage from '../pages/admin/DriverAvailabilityPage';
import RouteManagementPage from '../pages/admin/RouteManagementPage';
import BookingManagementPage from '../pages/admin/BookingManagementPage';

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
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

