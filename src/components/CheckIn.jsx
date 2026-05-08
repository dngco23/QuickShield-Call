import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Clock } from 'lucide-react';
import { useSafety } from '@/lib/safetyContext.jsx';
import { usePowerSave } from '@/lib/powerSaveContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function CheckIn() {
  const { activeCheckIn, cancelCheckIn } = useSafety();
  const { isPowerSaving } = usePowerSave();
  const [timeLeft, setTimeLeft] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!activeCheckIn) {
      setTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, activeCheckIn.expiresAt - now);
      setTimeLeft(Math.ceil(remaining / 1000));

      if (remaining <= 0) {
        clearInterval(interval);
        handleSOSExpiry();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [activeCheckIn]);

  const handleSOSExpiry = async () => {
    if (!user?.emergencyContactNumber) return;
    
    try {
      await base44.functions.invoke('sendSOSSms', {
        to: user.emergencyContactNumber,
        message: `URGENT: ${user.full_name} set a safety check-in timer and did not confirm arrival. Last known location may have GPS data. Please check on them immediately.`,
        lat: activeCheckIn.lat,
        lng: activeCheckIn.lng,
      });
    } catch (error) {
      console.error('Failed to send SOS:', error);
    }
    cancelCheckIn();
  };

  const handleConfirm = () => {
    setConfirming(true);
    setTimeout(() => {
      cancelCheckIn();
      setConfirming(false);
    }, 600);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <AnimatePresence>
      {activeCheckIn && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-24 left-4 right-4 z-40 bg-card border border-primary/30 rounded-2xl p-5 shadow-2xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-foreground">Safety Check-In</h3>
              <button
                onClick={cancelCheckIn}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Time remaining</p>
                <p className="font-display text-3xl font-bold text-foreground">
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </p>
              </div>
            </div>

            <div className="bg-primary/5 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground font-body">
                Confirm you've arrived safely before time runs out
              </p>
            </div>

            <Button
              onClick={handleConfirm}
              disabled={confirming}
              className="w-full bg-primary hover:bg-primary/90 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {confirming ? 'Confirmed ✓' : 'I\'ve Arrived Safely'}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}