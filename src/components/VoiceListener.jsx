import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, AlertCircle, ShieldAlert } from 'lucide-react';
import { useVoiceRecognition } from '@/lib/useVoiceRecognition';
import { useSafety } from '@/lib/safetyContext.jsx';
import { useTrial } from '@/lib/trialContext';
import PaywallOverlay from '@/components/PaywallOverlay';

export default function VoiceListener() {
  const { settings, triggerSOS } = useSafety();
  const { hasFeatureAccess } = useTrial();
  const [showPaywall, setShowPaywall] = useState(false);

  const handleWakeWordDetected = () => {
    if (!hasFeatureAccess('voice_detection')) {
      setShowPaywall(true);
      return;
    }
    triggerSOS();
  };

  const { isListening, error } = useVoiceRecognition(
    hasFeatureAccess('voice_detection') ? settings.voiceWakeWord : '',
    handleWakeWordDetected
  );

  const hasPanicWord = !!(settings.panicWakeWord?.trim());
  const hasCallWord = !!(settings.voiceWakeWord?.trim());
  const anyActive = isListening || hasPanicWord;

  useEffect(() => {
    // Request microphone access when any wake word is configured
    const requestMicrophoneAccess = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (_) {}
    };
    if (hasCallWord || hasPanicWord) {
      requestMicrophoneAccess();
    }
  }, [hasCallWord, hasPanicWord]);

  if (!hasCallWord && !hasPanicWord) return null;

  return (
    <>
      {showPaywall && (
        <PaywallOverlay
          featureName="Voice Detection"
          onClose={() => setShowPaywall(false)}
        />
      )}
      <AnimatePresence>
        {(isListening || hasPanicWord) && (
          <motion.div
            key="voice-indicator"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 right-4 z-40 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-body font-medium shadow-lg"
            style={{ background: hasPanicWord ? 'hsl(var(--destructive) / 0.9)' : 'hsl(var(--primary) / 0.9)', color: 'white' }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              {hasPanicWord ? <ShieldAlert className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
            </motion.div>
            <span>{hasPanicWord ? 'Panic listener on' : 'Listening...'}</span>
          </motion.div>
        )}
        {error && error !== 'no-speech' && (
          <motion.div
            key="voice-error"
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
    </>
  );
}