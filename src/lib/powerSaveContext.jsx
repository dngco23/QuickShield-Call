import React, { createContext, useContext, useState, useEffect } from 'react';
import { useBatteryMonitor } from '@/lib/useBatteryMonitor';

const PowerSaveContext = createContext();

const BATTERY_THRESHOLD = 15;

export function PowerSaveProvider({ children }) {
  const [isPowerSaving, setIsPowerSaving] = useState(false);
  const { battery } = useBatteryMonitor();

  useEffect(() => {
    if (battery !== null) {
      setIsPowerSaving(battery < BATTERY_THRESHOLD);
    }
  }, [battery]);

  return (
    <PowerSaveContext.Provider value={{
      isPowerSaving,
      batteryLevel: battery,
      BATTERY_THRESHOLD,
    }}>
      {children}
    </PowerSaveContext.Provider>
  );
}

export function usePowerSave() {
  return useContext(PowerSaveContext);
}