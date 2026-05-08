import { useRef, useCallback, useState } from 'react';

export function useAudioRecorder() {
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const chunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const duration = Math.round(mediaRecorderRef.current.duration || 0);
        
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        
        if (audioContextRef.current?.state !== 'closed') {
          audioContextRef.current?.close();
        }

        setIsRecording(false);
        resolve({ blob, duration });
      };

      mediaRecorderRef.current.stop();
    });
  }, []);

  return { startRecording, stopRecording, isRecording };
}