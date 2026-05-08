import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Check, AlertTriangle, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const HOLD_DURATION = 3000; // 3 seconds

export default function SOSButton({ emergencyContact1, emergencyName1, emergencyContact2, emergencyName2 }) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [statusMessage, setStatusMessage] = useState('');

  const holdStart = useRef(null);
  const animFrame = useRef(null);
  const holdTimeout = useRef(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const recordingStartTime = useRef(null);

  const startHold = (e) => {
    e.preventDefault();
    if (status === 'sending' || status === 'sent') return;
    setHolding(true);
    setProgress(0);
    holdStart.current = Date.now();

    const tick = () => {
      const elapsed = Date.now() - holdStart.current;
      const pct = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        animFrame.current = requestAnimationFrame(tick);
      } else {
        triggerSOS();
      }
    };
    animFrame.current = requestAnimationFrame(tick);
  };

  const cancelHold = () => {
    if (status === 'sending' || status === 'sent') return;
    cancelAnimationFrame(animFrame.current);
    setHolding(false);
    setProgress(0);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      recordingStartTime.current = Date.now();

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.start();
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const stopAndUploadRecording = async (latitude, longitude) => {
    return new Promise((resolve) => {
      if (!mediaRecorder.current || mediaRecorder.current.state === 'inactive') {
        resolve(null);
        return;
      }

      mediaRecorder.current.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
          const duration = (Date.now() - recordingStartTime.current) / 1000;

          // Upload file
          const uploadRes = await base44.integrations.Core.UploadFile({
            file: audioBlob,
          });

          // Create recording entity
          await base44.entities.Recording.create({
            event_type: 'sos',
            file_url: uploadRes.file_url,
            duration_seconds: Math.round(duration),
            latitude,
            longitude,
            device_info: navigator.userAgent,
          });

          resolve(uploadRes.file_url);
        } catch (err) {
          console.error('Failed to upload recording:', err);
          resolve(null);
        }
      };

      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    });
  };

  const triggerSOS = async () => {
    cancelAnimationFrame(animFrame.current);
    setHolding(false);
    setProgress(0);
    setStatus('sending');

    if (!emergencyContact1 && !emergencyContact2) {
      setStatus('error');
      setStatusMessage('No emergency contacts set');
      setTimeout(() => { setStatus('idle'); setStatusMessage(''); }, 4000);
      return;
    }

    // Start silent recording
    startRecording();

    // Get GPS location
    let latitude = null;
    let longitude = null;
    let locationText = 'Location unavailable';
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      );
      latitude = pos.coords.latitude;
      longitude = pos.coords.longitude;
      locationText = `https://maps.google.com/?q=${latitude},${longitude}`;
    } catch (_) {}

    try {
      const promises = [];
      if (emergencyContact1) {
        promises.push(base44.functions.invoke('sendSOSSms', {
          to: emergencyContact1,
          message: `🆘 SOS ALERT from your contact! They may need help.\nLocation: ${locationText}`,
        }));
      }
      if (emergencyContact2) {
        promises.push(base44.functions.invoke('sendSOSSms', {
          to: emergencyContact2,
          message: `🆘 SOS ALERT from your contact! They may need help.\nLocation: ${locationText}`,
        }));
      }
      
      await Promise.all(promises);

      // Stop recording and upload after SMS sent
      await stopAndUploadRecording(latitude, longitude);

      const contactCount = (emergencyContact1 ? 1 : 0) + (emergencyContact2 ? 1 : 0);
      setStatus('sent');
      setStatusMessage(`SOS sent to ${contactCount} contact${contactCount > 1 ? 's' : ''}`);
    } catch (err) {
      setStatus('error');
      setStatusMessage('Failed to send SOS. Check settings.');
    }

    // Reset after 4s
    setTimeout(() => {
      setStatus('idle');
      setStatusMessage('');
    }, 4000);
  };

  useEffect(() => () => {
    cancelAnimationFrame(animFrame.current);
    clearTimeout(holdTimeout.current);
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
  }, []);

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Status banner */}
      <AnimatePresence>
        {status !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className={`w-full px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-body font-medium ${
              status === 'sending' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
              status === 'sent' ? 'bg-green-50 text-green-700 border border-green-200' :
              'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {status === 'sending' && <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />}
            {status === 'sent' && <Check className="w-4 h-4 flex-shrink-0" />}
            {status === 'error' && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
            <span>{status === 'sending' ? 'Sending SOS...' : statusMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SOS Hold Button */}
      <div className="relative flex items-center justify-center select-none">
        {/* Pulse rings when idle */}
        {status === 'idle' && !holding && (
          <>
            <motion.div
              className="absolute w-28 h-28 rounded-full bg-red-500/10"
              animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute w-28 h-28 rounded-full bg-red-500/10"
              animate={{ scale: [1, 1.3], opacity: [0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.7 }}
            />
          </>
        )}

        {/* Progress ring SVG */}
        {holding && (
          <svg className="absolute w-28 h-28 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="#fee2e2" strokeWidth="5" />
            <circle
              cx="50" cy="50" r={radius} fill="none"
              stroke="#ef4444" strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.05s linear' }}
            />
          </svg>
        )}

        {/* Button */}
        <motion.button
          onPointerDown={startHold}
          onPointerUp={cancelHold}
          onPointerLeave={cancelHold}
          onContextMenu={(e) => e.preventDefault()}
          animate={holding ? { scale: 0.94 } : { scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className={`w-24 h-24 rounded-full flex flex-col items-center justify-center gap-1 shadow-lg z-10 transition-colors duration-200 ${
            status === 'sent'
              ? 'bg-green-500 shadow-green-300'
              : status === 'error'
              ? 'bg-gray-400'
              : 'bg-red-500 shadow-red-300 active:bg-red-600'
          }`}
        >
          {status === 'sent' ? (
            <Check className="w-8 h-8 text-white" />
          ) : (
            <>
              <ShieldAlert className="w-7 h-7 text-white" />
              <span className="text-white text-xs font-body font-bold tracking-widest">SOS</span>
            </>
          )}
        </motion.button>
      </div>

      <p className="text-xs text-muted-foreground font-body text-center">
        {holding
          ? `Keep holding... ${Math.round(((100 - progress) / 100) * 3)}s`
          : status === 'idle'
          ? 'Hold 3 seconds to send SOS'
          : ''}
      </p>
    </div>
  );
}