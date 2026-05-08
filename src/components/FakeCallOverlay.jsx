import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, User } from 'lucide-react';
import { useSafety } from '@/lib/safetyContext.jsx';

export default function FakeCallOverlay() {
  const { showCall, dismissCall, settings } = useSafety();
  const [callState, setCallState] = useState('ringing'); // ringing | active | ended
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (showCall) {
      setCallState('ringing');
      setTimer(0);
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

  const handleAnswer = () => setCallState('active');
  
  const handleDecline = () => {
    setCallState('ended');
    setTimeout(dismissCall, 400);
  };

  const handleEndCall = () => {
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
          className="fixed inset-0 z-[9999] bg-gradient-to-b from-gray-900 via-gray-800 to-black flex flex-col items-center justify-between py-16 px-6"
        >
          {/* Caller info */}
          <div className="flex flex-col items-center mt-8">
            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mb-6">
              <User className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-white text-3xl font-body font-semibold tracking-tight">
              {settings.callerName}
            </h1>
            <p className="text-gray-400 text-base mt-1 font-body">
              {settings.callerNumber}
            </p>
            <p className="text-gray-500 text-sm mt-3 font-body">
              {callState === 'ringing' && 'Incoming call...'}
              {callState === 'active' && formatTime(timer)}
              {callState === 'ended' && 'Call ended'}
            </p>
          </div>

          {/* Ringing pulse animation */}
          {callState === 'ringing' && (
            <div className="absolute top-32 left-1/2 -translate-x-1/2">
              <motion.div
                className="w-24 h-24 rounded-full border-2 border-green-500/30 absolute"
                animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
              />
              <motion.div
                className="w-24 h-24 rounded-full border-2 border-green-500/20 absolute"
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
                    className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30"
                  >
                    <PhoneOff className="w-7 h-7 text-white" />
                  </motion.button>
                  <span className="text-gray-400 text-xs font-body">Decline</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    onClick={handleAnswer}
                    className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30"
                  >
                    <Phone className="w-7 h-7 text-white" />
                  </motion.button>
                  <span className="text-gray-400 text-xs font-body">Accept</span>
                </div>
              </div>
            )}

            {callState === 'active' && (
              <div className="flex justify-center">
                <div className="flex flex-col items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleEndCall}
                    className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30"
                  >
                    <PhoneOff className="w-7 h-7 text-white" />
                  </motion.button>
                  <span className="text-gray-400 text-xs font-body">End Call</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}