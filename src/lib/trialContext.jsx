import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const TrialContext = createContext();

const TRIAL_DAYS = 7;

export function TrialProvider({ children }) {
  const [trialInfo, setTrialInfo] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrialInfo = async () => {
      try {
        const user = await base44.auth.me();
        
        if (!user) {
          setLoading(false);
          return;
        }

        // Check if user has active subscription
        if (user.stripeCustomerId && user.subscriptionStatus === 'active') {
          setIsPro(true);
          setTrialInfo(null);
        } else if (user.trialStartDate) {
          // Calculate trial remaining days
          const startDate = new Date(user.trialStartDate);
          const expiryDate = new Date(startDate);
          expiryDate.setDate(expiryDate.getDate() + TRIAL_DAYS);
          
          const now = new Date();
          const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
          const isExpired = daysRemaining <= 0;

          setTrialInfo({
            startDate: user.trialStartDate,
            expiryDate: expiryDate.toISOString(),
            daysRemaining: Math.max(0, daysRemaining),
            isExpired,
          });
          
          if (!isExpired) {
            setIsPro(false);
          }
        } else {
          // First time user - start trial
          await startTrial();
        }
      } catch (error) {
        console.error('Failed to load trial info:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrialInfo();
  }, []);

  const startTrial = async () => {
    try {
      const now = new Date();
      await base44.auth.updateMe({
        trialStartDate: now.toISOString(),
      });

      const expiryDate = new Date(now);
      expiryDate.setDate(expiryDate.getDate() + TRIAL_DAYS);

      setTrialInfo({
        startDate: now.toISOString(),
        expiryDate: expiryDate.toISOString(),
        daysRemaining: TRIAL_DAYS,
        isExpired: false,
      });
    } catch (error) {
      console.error('Failed to start trial:', error);
    }
  };

  const hasFeatureAccess = (feature) => {
    // Pro features: voice, offline maps, panic messaging
    const proFeatures = ['voice_detection', 'offline_maps', 'panic_messaging'];
    
    if (!proFeatures.includes(feature)) {
      return true; // Free feature
    }

    return isPro || (trialInfo && !trialInfo.isExpired);
  };

  return (
    <TrialContext.Provider value={{
      trialInfo,
      isPro,
      loading,
      hasFeatureAccess,
      TRIAL_DAYS,
    }}>
      {children}
    </TrialContext.Provider>
  );
}

export function useTrial() {
  return useContext(TrialContext);
}