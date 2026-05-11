import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, User } from 'lucide-react';
import { useSafety } from '@/lib/safetyContext.jsx';
import { vibrateRinging, vibrateStop } from '@/lib/haptics';

export default function FakeCallOverlay() {
  const { showCall, dismissCall, settings } = useSafety();
  const [callState, setCallState] = useState('ringing'); // ringing | active | ended
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (showCall) {
      setCallState('ringing');
      setTimer(0);
      vibrateRinging();
    } else {
      vibrateStop();
    }
  }, [showCall]);

  useEffect(() => {
    let interval;
    if (callState === 'active') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleAnswer = () => {
    vibrateStop();
    setCallState('active');
  };
  
  const handleDecline = () => {
    vibrateStop();
    setCallState('ended');
    setTimeout(dismissCall, 400);
  };

  const handleEndCall = () => {
    vibrateStop();
    setCallState('ended');
    setTimeout(dismissCall, 400);
  };

  return (
    <AnimatePresence>
      {showCall && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-between px-6"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 64px)', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)' }}
        >
          {/* Caller info */}
          <div className="flex flex-col items-center mt-8">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
              <User className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-foreground text-3xl font-display font-semibold tracking-tight">
              {settings.callerName}
            </h1>
            <p className="text-muted-foreground text-base mt-1 font-body">
              {settings.callerNumber}
            </p>
            <p className="text-muted-foreground text-sm mt-3 font-body">
              {callState === 'ringing' && 'Incoming call...'}
              {callState === 'active' && formatTime(timer)}
              {callState === 'ended' && 'Call ended'}
            </p>
          </div>

          {/* Ringing pulse animation */}
          {callState === 'ringing' && (
            <div className="absolute top-32 left-1/2 -translate-x-1/2">
              <motion.div
                className="w-24 h-24 rounded-full border-2 border-primary/30 absolute"
                animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
              />
              <motion.div
                className="w-24 h-24 rounded-full border-2 border-primary/20 absolute"
                animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="w-full max-w-xs">
            {callState === 'ringing' && (
              <div className="flex justify-between items-center px-4">
                <div className="flex flex-col items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDecline}
                    className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center shadow-lg shadow-destructive/30"
                  >
                    <PhoneOff className="w-7 h-7 text-destructive-foreground" />
                  </motion.button>
                  <span className="text-muted-foreground text-xs font-body">Decline</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    onClick={handleAnswer}
                    className="w-16 h-16 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/30"
                  >
                    <Phone className="w-7 h-7 text-accent-foreground" />
                  </motion.button>
                  <span className="text-muted-foreground text-xs font-body">Accept</span>
                </div>
              </div>
            )}

            {callState === 'active' && (
              <div className="flex justify-center">
                <div className="flex flex-col items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleEndCall}
                    className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center shadow-lg shadow-destructive/30"
                  >
                    <PhoneOff className="w-7 h-7 text-destructive-foreground" />
                  </motion.button>
                  <span className="text-muted-foreground text-xs font-body">End Call</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}