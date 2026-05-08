import { useEffect, useRef, useState } from 'react';

export function useBatteryMonitor(onCritical) {
  const [batteryLevel, setBatteryLevel] = useState(null);
  const [isCharging, setIsCharging] = useState(false);
  const alertSentRef = useRef(false);

  useEffect(() => {
    let batteryManager = null;

    const initBatteryMonitoring = async () => {
      try {
        if ('getBattery' in navigator) {
          // Deprecated Battery API fallback
          batteryManager = await navigator.getBattery();
          
          const updateBattery = () => {
            const level = batteryManager.level * 100;
            setBatteryLevel(level);
            setIsCharging(batteryManager.charging);
            
            if (level < 10 && !isCharging && !alertSentRef.current && onCritical) {
              alertSentRef.current = true;
              onCritical(level);
            }
          };

          batteryManager.addEventListener('levelchange', updateBattery);
          batteryManager.addEventListener('chargingchange', updateBattery);
          updateBattery();

          return () => {
            batteryManager.removeEventListener('levelchange', updateBattery);
            batteryManager.removeEventListener('chargingchange', updateBattery);
          };
        } else if ('storage' in navigator) {
          // Battery Status API (modern)
          const battery = await navigator.getBattery?.();
          if (battery) {
            const updateBattery = () => {
              const level = battery.level * 100;
              setBatteryLevel(level);
              setIsCharging(battery.charging);
              
              if (level < 10 && !battery.charging && !alertSentRef.current && onCritical) {
                alertSentRef.current = true;
                onCritical(level);
              }
            };

            battery.addEventListener('levelchange', updateBattery);
            battery.addEventListener('chargingchange', updateBattery);
            updateBattery();

            return () => {
              battery.removeEventListener('levelchange', updateBattery);
              battery.removeEventListener('chargingchange', updateBattery);
            };
          }
        }
      } catch (_) {
        // Battery API not available
      }
    };

    initBatteryMonitoring();
    alertSentRef.current = false;

    return () => {
      alertSentRef.current = false;
    };
  }, [onCritical]);

  return { batteryLevel, isCharging };
}