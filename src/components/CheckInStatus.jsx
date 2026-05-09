import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function CheckInStatus() {
  const [user, setUser] = useState(null);
  const [lastCheckIn, setLastCheckIn] = useState(null);
  const [logging, setLogging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [checkInInterval, setCheckInInterval] = useState(24);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setLastCheckIn(currentUser.lastCheckInTime ? new Date(currentUser.lastCheckInTime) : null);
        setCheckInInterval(currentUser.checkInIntervalHours || 24);
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    loadUser();
  }, []);

  const handleLogCheckIn = async () => {
    if (!user) return;
    
    setLogging(true);
    try {
      await base44.auth.updateMe({
        lastCheckInTime: new Date().toISOString()
      });
      setLastCheckIn(new Date());
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to log check-in:', error);
      alert('Failed to log check-in');
    } finally {
      setLogging(false);
    }
  };

  if (!user) return null;

  const nextCheckInTime = lastCheckIn 
    ? new Date(lastCheckIn.getTime() + checkInInterval * 60 * 60 * 1000)
    : null;

  const hoursUntilNext = nextCheckInTime
    ? Math.max(0, Math.ceil((nextCheckInTime - new Date()) / (1000 * 60 * 60)))
    : checkInInterval;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border/50 p-5"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-medium text-foreground">Check-In Status</h3>
          </div>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Logged!</span>
            </motion.div>
          )}
        </div>

        {lastCheckIn && (
          <div className="text-xs text-muted-foreground">
            <p>Last check-in: {lastCheckIn.toLocaleString()}</p>
            <p>Next due in: {hoursUntilNext} hour{hoursUntilNext !== 1 ? 's' : ''}</p>
          </div>
        )}

        <Button
          onClick={handleLogCheckIn}
          disabled={logging || showSuccess}
          className="w-full bg-primary hover:bg-primary/90 text-sm"
        >
          {logging ? (
            <>
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              Logging...
            </>
          ) : showSuccess ? (
            <>
              <CheckCircle2 className="w-3 h-3 mr-2" />
              Status Logged
            </>
          ) : (
            'Log Status Now'
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center bg-muted/30 px-2 py-1.5 rounded-lg">
          💡 Regular check-ins alert your emergency contacts that you're safe.
        </p>
      </div>
    </motion.div>
  );
}