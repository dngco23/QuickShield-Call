import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { SafetyProvider } from '@/lib/safetyContext.jsx';
import { TrialProvider } from '@/lib/trialContext';
import { PowerSaveProvider } from '@/lib/powerSaveContext';
import Home from '@/pages/Home';
import Journal from '@/pages/Journal';
import Insights from '@/pages/Insights';
import { useState } from 'react';
import Settings from '@/pages/Settings';
import PanicMode from '@/pages/PanicMode';
import EmergencyContacts from '@/pages/EmergencyContacts';
import Zones from '@/pages/Zones';
import ParentDashboard from '@/pages/ParentDashboard';
import Pricing from '@/pages/Pricing';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import VoiceListener from '@/components/VoiceListener';
import VoiceCommandListener from '@/components/VoiceCommandListener';
import BatteryMonitor from '@/components/BatteryMonitor';
import TrialBanner from '@/components/TrialBanner';
import ZoneMonitor from '@/components/ZoneMonitor';

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
      <BatteryMonitor />
      <ZoneMonitor />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/emergency-contacts" element={<EmergencyContacts />} />
        <Route path="/zones" element={<Zones />} />
        <Route path="/panic" element={<PanicMode />} />
        <Route path="/parent-dashboard" element={<ParentDashboard />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
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
              <AuthenticatedApp />
            </Router>
          </TrialProvider>
        </PowerSaveProvider>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App