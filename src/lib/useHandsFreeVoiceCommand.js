import { useEffect, useRef, useState } from 'react';

export function useHandsFreeVoiceCommand(customPhrase, onCommandDetected) {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const restartTimeoutRef = useRef(null);
  const wakeLockRef = useRef(null);

  useEffect(() => {
    if (!customPhrase || !customPhrase.trim()) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    // Request wake lock to keep screen on for background listening
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch (_) {}
    };
    requestWakeLock();

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.language = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase().trim();
        if (event.results[i].isFinal) {
          // Check if custom phrase is spoken
          if (customPhrase && transcript.includes(customPhrase.toLowerCase())) {
            onCommandDetected(transcript);
            // Restart recognition after command
            clearTimeout(restartTimeoutRef.current);
            try {
              recognition.stop();
              setTimeout(() => {
                try {
                  recognition.start();
                } catch (_) {}
              }, 500);
            } catch (_) {}
          }
        }
      }
    };

    recognition.onerror = (event) => {
      setError(event.error);
      // Restart on errors except for abort
      if (event.error !== 'aborted') {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = setTimeout(() => {
          try {
            recognition.start();
          } catch (_) {}
        }, 1500);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart listening if it ended unexpectedly
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = setTimeout(() => {
        try {
          recognition.start();
        } catch (_) {}
      }, 1000);
    };

    // Start listening
    try {
      recognition.start();
    } catch (_) {}

    return () => {
      clearTimeout(restartTimeoutRef.current);
      try {
        recognition.stop();
      } catch (_) {}
      // Release wake lock
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, [customPhrase, onCommandDetected]);

  return { isListening, error };
}