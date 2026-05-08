import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getDefaultNumberForCountry } from './countryNumbers';
import { base44 } from '@/api/base44Client';

const SafetyContext = createContext();

const DEFAULT_SETTINGS = {
  callerName: "Mom",
  callerNumber: "+61 2 1234 5678",
  triggerWord: "lavender",
  callDelay: 3,
  autoDeclineSeconds: 0,
  emergencyContact1Name: "",
  emergencyContact1Number: "",
  emergencyContact2Name: "",
  emergencyContact2Number: "",
  voiceWakeWord: "",
  stealthModeType: "calculator",
};

export function SafetyProvider({ children }) {
  const [showCall, setShowCall] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('_ws');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  const [activeCheckIn, setActiveCheckIn] = useState(null);
  const [stealthMode, setStealthMode] = useState(false);
  const [panicModeActive, setPanicModeActive] = useState(false);

  useEffect(() => {
    const syncCountry = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.country) {
          const countryNumber = getDefaultNumberForCountry(user.country);
          setSettings((prev) => ({
            ...prev,
            callerNumber: prev.callerNumber === DEFAULT_SETTINGS.callerNumber
              ? countryNumber
              : prev.callerNumber,
          }));
        }
      } catch (_) {}
    };
    syncCountry();
  }, []);

  const saveSettings = useCallback((newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('_ws', JSON.stringify(newSettings));
  }, []);

  const triggerCall = useCallback(() => {
    const delay = (settings.callDelay || 0) * 1000;
    setTimeout(() => {
      setShowCall(true);
    }, delay);
  }, [settings.callDelay]);

  const dismissCall = useCallback(() => {
    setShowCall(false);
  }, []);

  const startCheckIn = useCallback((durationMinutes = 15) => {
    const now = Date.now();
    let lat, lng;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      });
    }

    setActiveCheckIn({
      startedAt: now,
      expiresAt: now + durationMinutes * 60 * 1000,
      durationMinutes,
      lat,
      lng,
    });
  }, []);

  const cancelCheckIn = useCallback(() => {
    setActiveCheckIn(null);
  }, []);

  const triggerSOS = useCallback(async () => {
    // Start check-in with 0 duration to immediately trigger SOS
    const now = Date.now();
    let lat, lng;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      });
    }

    setActiveCheckIn({
      startedAt: now,
      expiresAt: now,
      durationMinutes: 0,
      lat,
      lng,
      isVoiceTriggered: true,
    });
  }, []);

  return (
    <SafetyContext.Provider value={{
      showCall,
      showSettings,
      setShowSettings,
      settings,
      saveSettings,
      triggerCall,
      dismissCall,
      activeCheckIn,
      startCheckIn,
      cancelCheckIn,
      stealthMode,
      setStealthMode,
      triggerSOS,
      panicModeActive,
      setPanicModeActive,
    }}>
      {children}
    </SafetyContext.Provider>
  );
}

export function useSafety() {
  return useContext(SafetyContext);
}