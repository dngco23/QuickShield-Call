import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, AlertCircle } from 'lucide-react';
import { useVoiceRecognition } from '@/lib/useVoiceRecognition';
import { useSafety } from '@/lib/safetyContext.jsx';

export default function VoiceListener() {
  const { settings } = useSafety();
  const [hasPermission, setHasPermission] = useState(null);
  const { triggerCall } = useSafety();

  const handleWakeWordDetected = () => {
    triggerCall();
  };

  const { isListening, error } = useVoiceRecognition(settings.voiceWakeWord, handleWakeWordDetected);

  useEffect(() => {
    // Check microphone permission on mount
    const checkPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'microphone' });
        setHasPermission(result.state === 'granted');
      } catch (_) {
        setHasPermission(null);
      }
    };
    checkPermission();
  }, []);

  if (!settings.voiceWakeWord || !settings.voiceWakeWord.trim()) {
    return null;
  }

  return (
    <AnimatePresence>
      {isListening && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-4 right-4 z-40 flex items-center gap-2 bg-primary/90 text-primary-foreground px-3 py-2 rounded-full text-xs font-body font-medium shadow-lg"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Mic className="w-3 h-3" />
          </motion.div>
          <span>Listening...</span>
        </motion.div>
      )}
      {error && error !== 'no-speech' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-4 right-4 z-40 flex items-center gap-2 bg-destructive/90 text-destructive-foreground px-3 py-2 rounded-full text-xs font-body font-medium shadow-lg"
        >
          <AlertCircle className="w-3 h-3" />
          <span>Microphone error</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}