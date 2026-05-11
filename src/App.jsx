import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
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

function ThemeInit() { useTheme(); return null; }

const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <Loader2 className="w-8 h-8 text-primary animate-spin" />
  </div>
);

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-body">Loading...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else {
      navigateToLogin();
      return null;
    }
  }

  return (
    <SafetyProvider>
      <VoiceListener />
      <VoiceCommandListener />
      <PanicVoiceListener />
      <BatteryMonitor />
      <ZoneMonitor />
      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait" initial={false}>
          <Routes>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/journal" element={<PageTransition><Journal /></PageTransition>} />
            <Route path="/insights" element={<PageTransition><Insights /></PageTransition>} />
            <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
            <Route path="/emergency-contacts" element={<PageTransition direction="push"><EmergencyContacts /></PageTransition>} />
            <Route path="/zones" element={<PageTransition><Zones /></PageTransition>} />
            <Route path="/panic" element={<PageTransition direction="push"><PanicMode /></PageTransition>} />
            <Route path="/parent-dashboard" element={<PageTransition direction="push"><ParentDashboard /></PageTransition>} />
            <Route path="/pricing" element={<PageTransition direction="push"><Pricing /></PageTransition>} />
            <Route path="/about" element={<PageTransition direction="push"><About /></PageTransition>} />
            <Route path="/contact" element={<PageTransition direction="push"><Contact /></PageTransition>} />
            <Route path="*" element={<PageTransition><PageNotFound /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </SafetyProvider>
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
              <AuthenticatedApp />
            </Router>
          </TrialProvider>
        </PowerSaveProvider>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;