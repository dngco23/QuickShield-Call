import React, { useEffect, useRef, useState } from 'react';
import { useSafety } from '@/lib/safetyContext.jsx';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const VoiceCommandListener = () => {
  const { triggerCall, startPanic, settings } = useSafety();
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  // Get user settings for custom voice command
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null),
    enabled: true,
  });

  const voiceTriggerWord = user?.voiceCommandTrigger || 'help';

  useEffect(() => {
    // Check browser support for Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech Recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let interimTranscript = '';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i].transcript.toLowerCase().trim();
        
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript + ' ';

          // Check for trigger words
          if (finalTranscriptRef.current.includes('sos') || finalTranscriptRef.current.includes('s.o.s')) {
            handleSOSCommand();
            finalTranscriptRef.current = '';
          } else if (finalTranscriptRef.current.includes('panic')) {
            handlePanicCommand();
            finalTranscriptRef.current = '';
          } else if (finalTranscriptRef.current.includes(voiceTriggerWord)) {
            handleCustomCommand();
            finalTranscriptRef.current = '';
          }
        } else {
          interimTranscript += transcript;
        }
      }
    };

    recognition.onerror = (event) => {
      setError(`Voice recognition error: ${event.error}`);
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Restart listening if it ended unexpectedly
      if (recognitionRef.current && !error) {
        try {
          recognition.start();
        } catch (e) {
          console.error('Failed to restart voice listening:', e);
        }
      }
    };

    // Start listening
    try {
      recognition.start();
    } catch (e) {
      console.error('Failed to start voice recognition:', e);
      setError('Failed to start voice recognition');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error('Error stopping recognition:', e);
        }
      }
    };
  }, [voiceTriggerWord]);

  const handleSOSCommand = () => {
    console.log('SOS command detected');
    window.sosButtonRef?.click();
  };

  const handlePanicCommand = () => {
    console.log('Panic command detected');
    startPanic();
  };

  const handleCustomCommand = () => {
    console.log('Custom voice command detected:', voiceTriggerWord);
    // Default to fake call for custom command
    triggerCall();
  };

  // Silent component - no UI
  return null;
};

export default VoiceCommandListener;