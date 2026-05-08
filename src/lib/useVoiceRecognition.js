import { useEffect, useRef, useState } from 'react';

export function useVoiceRecognition(wakeWord, onWakeWordDetected) {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!wakeWord || !wakeWord.trim()) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.language = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase().trim();
        if (event.results[i].isFinal) {
          if (transcript.includes(wakeWord.toLowerCase())) {
            onWakeWordDetected();
            // Restart to avoid multiple triggers
            recognition.stop();
            recognition.start();
          }
        } else {
          interimTranscript += transcript + ' ';
        }
      }
    };

    recognition.onerror = (event) => {
      setError(event.error);
      if (event.error === 'no-speech') {
        // Restart on silence
        setTimeout(() => {
          try {
            recognition.start();
          } catch (_) {}
        }, 1000);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Restart listening if it ended unexpectedly
      try {
        recognition.start();
      } catch (_) {}
    };

    // Start listening
    try {
      recognition.start();
    } catch (_) {}

    return () => {
      try {
        recognition.stop();
      } catch (_) {}
    };
  }, [wakeWord, onWakeWordDetected]);

  return { isListening, error };
}