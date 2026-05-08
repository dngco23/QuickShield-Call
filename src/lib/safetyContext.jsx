import React, { createContext, useContext, useState, useCallback } from 'react';

const SafetyContext = createContext();

const DEFAULT_SETTINGS = {
  callerName: "Mom",
  callerNumber: "+1 (555) 012-3456",
  triggerWord: "lavender",
  callDelay: 3,
  autoDeclineSeconds: 0,
  emergencyContactName: "",
  emergencyContactNumber: "",
  voiceWakeWord: "",
};

export function SafetyProvider({ children }) {
  const [showCall, setShowCall] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('_ws');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  const [activeCheckIn, setActiveCheckIn] = useState(null);

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
    }}>
      {children}
    </SafetyContext.Provider>
  );
}

export function useSafety() {
  return useContext(SafetyContext);
}