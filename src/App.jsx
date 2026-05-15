import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { SafetyProvider } from '@/lib/safetyContext.jsx';
import { TrialProvider } from '@/lib/trialContext';
import { PowerSaveProvider } from '@/lib/powerSaveContext';
import { Loader2 } from 'lucide-react';
import { useTheme } from '@/lib/useTheme';
import VoiceListener from '@/components/VoiceListener';
import VoiceCommandListener from '@/components/VoiceCommandListener';
import PanicVoiceListener from '@/components/PanicVoiceListener';
import BatteryMonitor from '@/components/BatteryMonitor';
import ZoneMonitor from '@/components/ZoneMonitor';
import PageTransition from '@/components/PageTransition';
import { AnimatePresence } from 'framer-motion';

// Route-based code splitting
const Home = lazy(() => import('@/pages/Home'));
const Journal = lazy(() => import('@/pages/Journal'));
const Insights = lazy(() => import('@/pages/Insights'));
const Settings = lazy(() => import('@/pages/Settings'));
const PanicMode = lazy(() => import('@/pages/PanicMode'));
const EmergencyContacts = lazy(() => import('@/pages/EmergencyContacts'));
const Zones = lazy(() => import('@/pages/Zones'));
const ParentDashboard = lazy(() => import('@/pages/ParentDashboard'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const Login = lazy(() => import('@/pages/Login'));

function ThemeInit() { useTheme(); return null; }

const PageLoader = () => (
  <div id="app_page_loader" className="fixed inset-0 flex items-center justify-center bg-background">
    <Loader2 className="w-8 h-8 text-primary animate-spin" />
  </div>
);

const RequireAuth = ({ children }) => {
  const { isAuthenticated, isLoadingAuth, authChecked } = useAuth();
  const location = useLocation();

  if (isLoadingAuth || !authChecked) {
    return <PageLoader />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
};

const ProtectedShell = ({ children }) => (
  <SafetyProvider>
    <VoiceListener />
    <VoiceCommandListener />
    <PanicVoiceListener />
    <BatteryMonitor />
    <ZoneMonitor />
    {children}
  </SafetyProvider>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait" initial={false}>
        <Routes>
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />

          <Route
            path="/"
            element={
              <RequireAuth>
                <ProtectedShell>
                  <PageTransition><Home /></PageTransition>
                </ProtectedShell>
              </RequireAuth>
            }
          />
          <Route
            path="/journal"
            element={
              <RequireAuth>
                <ProtectedShell>
                  <PageTransition><Journal /></PageTransition>
                </ProtectedShell>
              </RequireAuth>
            }
          />
          <Route
            path="/insights"
            element={
              <RequireAuth>
                <ProtectedShell>
                  <PageTransition><Insights /></PageTransition>
                </ProtectedShell>
              </RequireAuth>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireAuth>
                <ProtectedShell>
                  <PageTransition><Settings /></PageTransition>
                </ProtectedShell>
              </RequireAuth>
            }
          />
          <Route
            path="/emergency-contacts"
            element={
              <RequireAuth>
                <ProtectedShell>
                  <PageTransition direction="push"><EmergencyContacts /></PageTransition>
                </ProtectedShell>
              </RequireAuth>
            }
          />
          <Route
            path="/zones"
            element={
              <RequireAuth>
                <ProtectedShell>
                  <PageTransition><Zones /></PageTransition>
                </ProtectedShell>
              </RequireAuth>
            }
          />
          <Route
            path="/panic"
            element={
              <RequireAuth>
                <ProtectedShell>
                  <PageTransition direction="push"><PanicMode /></PageTransition>
                </ProtectedShell>
              </RequireAuth>
            }
          />
          <Route
            path="/parent-dashboard"
            element={
              <RequireAuth>
                <ProtectedShell>
                  <PageTransition direction="push"><ParentDashboard /></PageTransition>
                </ProtectedShell>
              </RequireAuth>
            }
          />
          <Route
            path="/pricing"
            element={
              <RequireAuth>
                <ProtectedShell>
                  <PageTransition direction="push"><Pricing /></PageTransition>
                </ProtectedShell>
              </RequireAuth>
            }
          />
          <Route
            path="/about"
            element={
              <RequireAuth>
                <ProtectedShell>
                  <PageTransition direction="push"><About /></PageTransition>
                </ProtectedShell>
              </RequireAuth>
            }
          />
          <Route
            path="/contact"
            element={
              <RequireAuth>
                <ProtectedShell>
                  <PageTransition direction="push"><Contact /></PageTransition>
                </ProtectedShell>
              </RequireAuth>
            }
          />
          <Route
            path="/privacy"
            element={
              <RequireAuth>
                <ProtectedShell>
                  <PageTransition direction="push"><PrivacyPolicy /></PageTransition>
                </ProtectedShell>
              </RequireAuth>
            }
          />

          <Route path="*" element={<PageTransition><PageNotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <PowerSaveProvider>
          <TrialProvider>
            <Router>
              <ThemeInit />
              <AppRoutes />
            </Router>
          </TrialProvider>
        </PowerSaveProvider>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
