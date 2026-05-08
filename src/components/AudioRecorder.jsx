import React, { useEffect, useRef } from 'react';
import { useAudioRecorder } from '@/lib/useAudioRecorder';
import { useSafety } from '@/lib/safetyContext.jsx';
import { base44 } from '@/api/base44Client';

export default function AudioRecorder() {
  const { showCall, activeCheckIn, panicModeActive } = useSafety();
  const { startRecording, stopRecording } = useAudioRecorder();
  const recordingStartTimeRef = React.useRef(null);

  useEffect(() => {
    // Start recording when SOS, Fake Call, or Panic Mode is triggered
    if (showCall || panicModeActive) {
      startRecording();
      recordingStartTimeRef.current = Date.now();
    }
  }, [showCall, panicModeActive, startRecording]);

  useEffect(() => {
    // Stop recording and upload when Fake Call is dismissed
    const handleStopAndUpload = async () => {
      const result = await stopRecording();
      if (!result) return;

      try {
        const user = await base44.auth.me();
        const fileRes = await base44.integrations.Core.UploadFile({
          file: result.blob,
        });

        let lat, lng;
        try {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch (_) {}

        const eventType = showCall ? 'fake_call' : 'sos';
        await base44.entities.Recording.create({
          event_type: eventType,
          file_url: fileRes.file_url,
          duration_seconds: result.duration,
          latitude: lat,
          longitude: lng,
          device_info: navigator.userAgent,
        });
      } catch (error) {
        console.error('Failed to upload recording:', error);
      }
    };

    if (!showCall && !panicModeActive && recordingStartTimeRef.current) {
      recordingStartTimeRef.current = null;
      handleStopAndUpload();
    }
  }, [showCall, panicModeActive, stopRecording]);

  // Handle SOS recording
  useEffect(() => {
    if (activeCheckIn) {
      startRecording();
      recordingStartTimeRef.current = Date.now();
    }
  }, [activeCheckIn, startRecording]);

  return null;
}