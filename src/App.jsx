import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { SafetyProvider } from '@/lib/safetyContext.jsx';
import { TrialProvider } from '@/lib/trialContext';
import Home from '@/pages/Home';
import Settings from '@/pages/Settings';
import PanicMode from '@/pages/PanicMode';
import VoiceListener from '@/components/VoiceListener';
import BatteryMonitor from '@/components/BatteryMonitor';
import TrialBanner from '@/components/TrialBanner';

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
      <BatteryMonitor />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/panic" element={<PanicMode />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </SafetyProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <TrialProvider>
          <Router>
            <AuthenticatedApp />
          </Router>
        </TrialProvider>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App