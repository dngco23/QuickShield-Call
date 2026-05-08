import React, { createContext, useContext, useState, useCallback } from 'react';

const SafetyContext = createContext();

const DEFAULT_SETTINGS = {
  callerName: "Mom",
  callerNumber: "+1 (555) 012-3456",
  triggerWord: "lavender",
  callDelay: 3,
  autoDeclineSeconds: 0,
};

export function SafetyProvider({ children }) {
  const [showCall, setShowCall] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('_ws');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

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

  return (
    <SafetyContext.Provider value={{
      showCall,
      showSettings,
      setShowSettings,
      settings,
      saveSettings,
      triggerCall,
      dismissCall,
    }}>
      {children}
    </SafetyContext.Provider>
  );
}

export function useSafety() {
  return useContext(SafetyContext);
}