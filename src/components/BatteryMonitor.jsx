import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Battery, AlertTriangle, Loader2 } from 'lucide-react';
import { useBatteryMonitor } from '@/lib/useBatteryMonitor';
import { useSafety } from '@/lib/safetyContext.jsx';
import { base44 } from '@/api/base44Client';

export default function BatteryMonitor() {
  const { panicModeActive, activeCheckIn } = useSafety();
  const [alertSent, setAlertSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [user, setUser] = React.useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (_) {}
    };
    loadUser();
  }, []);

  const handleCriticalBattery = async (level) => {
    const inCrisis = panicModeActive || activeCheckIn;
    if (!inCrisis || !user || alertSent) return;

    setIsSending(true);
    try {
      let latitude, longitude;
      try {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        );
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      } catch (_) {}

      if (latitude && longitude) {
        await base44.functions.invoke('sendLowBatteryAlert', {
          latitude,
          longitude,
          batteryLevel: Math.round(level),
        });
        setAlertSent(true);
      }
    } catch (error) {
      console.error('Failed to send low battery alert:', error);
    } finally {
      setIsSending(false);
    }
  };

  const { batteryLevel, isCharging } = useBatteryMonitor(
    (panicModeActive || activeCheckIn) ? handleCriticalBattery : null
  );

  const inCrisis = panicModeActive || activeCheckIn;
  const showAlert = inCrisis && batteryLevel !== null && batteryLevel < 10 && !isCharging;

  return (
    <AnimatePresence>
      {showAlert && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-16 left-4 right-4 z-40"
        >
          <div className="bg-destructive/95 border border-destructive text-destructive-foreground rounded-lg p-3 flex items-start gap-3 shadow-lg">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Critical Battery Level</p>
              <p className="text-xs opacity-90 mt-1">
                {batteryLevel}% remaining. Alerts sent to emergency contacts with your location.
              </p>
            </div>
            {isSending && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0 mt-0.5" />}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}