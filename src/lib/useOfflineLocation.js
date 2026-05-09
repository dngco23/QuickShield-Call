import { useState, useEffect, useRef } from 'react';
import { saveLocationData } from './offlineDB';

export const useOfflineLocation = (trackingEnabled = true) => {
  const [location, setLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (!trackingEnabled || !navigator.geolocation) {
      setIsTracking(false);
      return;
    }

    setIsTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const newLocation = { latitude, longitude, accuracy };

        setLocation(newLocation);
        setError(null);

        // Save to IndexedDB automatically
        try {
          await saveLocationData(newLocation);
        } catch (err) {
          console.error('Failed to save location to IndexedDB:', err);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      setIsTracking(false);
    };
  }, [trackingEnabled]);

  return { location, isTracking, error };
};