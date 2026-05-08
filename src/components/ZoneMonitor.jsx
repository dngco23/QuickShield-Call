import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const EARTH_RADIUS = 6371000; // meters

function calculateDistance(lat1, lon1, lat2, lon2) {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS * c;
}

export default function ZoneMonitor() {
  const [zones, setZones] = useState([]);
  const [breachedZones, setBreachedZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadZones = async () => {
      try {
        const loadedZones = await base44.entities.Zone.list();
        setZones(loadedZones.filter((z) => z.enabled));
      } catch (error) {
        console.error('Failed to load zones:', error);
      }
      setLoading(false);
    };
    loadZones();
  }, []);

  useEffect(() => {
    if (!zones.length || loading) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const breached = zones.filter((zone) => {
          const distance = calculateDistance(
            latitude,
            longitude,
            zone.latitude,
            zone.longitude
          );
          return distance > (zone.radius_meters || 500);
        });

        setBreachedZones(breached);

        // Play alert sound if zones breached
        if (breached.length > 0) {
          playAlert();
        }
      },
      (error) => console.error('Geolocation error:', error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [zones, loading]);

  const playAlert = () => {
    // Create a simple beep using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  return (
    <AnimatePresence>
      {breachedZones.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-16 left-4 right-4 z-50"
        >
          <div className="bg-destructive/95 border border-destructive text-destructive-foreground rounded-lg p-4 flex items-start gap-3 shadow-lg">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            </motion.div>
            <div className="flex-1">
              <p className="text-sm font-medium">Left Safe Zone</p>
              <p className="text-xs opacity-90 mt-1">
                {breachedZones.map((z) => z.name).join(', ')}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}