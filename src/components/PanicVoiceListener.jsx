import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSafety } from '@/lib/safetyContext.jsx';

/**
 * Runs silently in the background.
 * Listens continuously for the configured panicWakeWord and navigates
 * to /panic when detected. Restarts automatically on end/error.
 */
export default function PanicVoiceListener() {
  const { settings, triggerPanic, panicNavigateRef } = useSafety();
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const restartRef = useRef(null);
  const activeRef = useRef(false);
  const wakeLockRef = useRef(null);

  // Register the navigate function so triggerPanic can use it
  useEffect(() => {
    panicNavigateRef.current = navigate;
  }, [navigate, panicNavigateRef]);

  useEffect(() => {
    const panicWord = settings.panicWakeWord?.trim().toLowerCase();
    if (!panicWord) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    // Request wake lock so the device screen stays on for background listening
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch (_) {}
    };
    requestWakeLock();

    // Re-acquire wake lock if released (e.g. screen turned off then on)
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && 'wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        } catch (_) {}
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const start = () => {
      if (activeRef.current) return;
      try {
        recognitionRef.current.start();
        activeRef.current = true;
      } catch (_) {}
    };

    const scheduleRestart = (delay = 1000) => {
      clearTimeout(restartRef.current);
      restartRef.current = setTimeout(start, delay);
    };

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      activeRef.current = true;
    };

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase().trim();
        if (transcript.includes(panicWord)) {
          // Trigger immediately — don't wait for isFinal for faster response
          triggerPanic();
          activeRef.current = false;
          try { recognition.stop(); } catch (_) {}
          scheduleRestart(2000);
          return;
        }
      }
    };

    recognition.onerror = (event) => {
      activeRef.current = false;
      if (event.error !== 'aborted') {
        scheduleRestart(1500);
      }
    };

    recognition.onend = () => {
      activeRef.current = false;
      scheduleRestart(800);
    };

    start();

    return () => {
      clearTimeout(restartRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      activeRef.current = false;
      try { recognition.stop(); } catch (_) {}
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [settings.panicWakeWord, triggerPanic]);

  return null; // invisible background component
}