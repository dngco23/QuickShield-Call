import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Loader2, CheckCircle2, AlertTriangle, Volume2, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function VoiceCommandSetup({ onSave, initialPhrase = '' }) {
  const [phrase, setPhrase] = useState(initialPhrase);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recordedPhrase, setRecordedPhrase] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | recording | confirmed | error

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('error');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.language = 'en-US';

    setIsRecording(true);
    setTranscript('');
    setStatus('recording');

    recognition.onstart = () => {
      setStatus('recording');
    };

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setRecordedPhrase(transcript.toLowerCase().trim());
          setTranscript(transcript);
        } else {
          interim += transcript;
        }
      }
      if (interim) setTranscript(interim);
    };

    recognition.onerror = () => {
      setStatus('error');
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (recordedPhrase) {
        setPhrase(recordedPhrase);
        setStatus('confirmed');
      }
    };

    try {
      recognition.start();
    } catch (e) {
      setStatus('error');
      setIsRecording(false);
    }
  };

  const handleSave = async () => {
    if (!phrase.trim()) {
      setStatus('error');
      return;
    }

    setSaving(true);
    try {
      await base44.auth.updateMe({
        voiceCommandPhrase: phrase.trim(),
      });
      onSave?.(phrase.trim());
      setStatus('confirmed');
    } catch (error) {
      console.error('Failed to save voice command:', error);
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border p-5 space-y-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-medium text-foreground">Voice Command Setup</p>
          <p className="text-xs text-muted-foreground mt-1">
            Create a custom voice phrase to trigger SOS and alert contacts hands-free, even with locked phone.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Your Voice Command Phrase</Label>
        <div className="flex gap-2">
          <Input
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder="e.g., 'Help me now', 'Emergency code red'"
            className="bg-muted/50 flex-1"
          />
          <Button
            onClick={startVoiceInput}
            disabled={isRecording}
            variant="outline"
            size="icon"
            className="h-10 w-10 flex-shrink-0"
            title="Record voice command"
          >
            {isRecording ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {isRecording ? '🎤 Listening...' : 'Click mic icon or type your custom emergency phrase'}
        </p>
      </div>

      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={`p-3 rounded-lg text-sm font-body ${
              status === 'confirmed'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            <p className="flex items-center gap-2">
              {status === 'confirmed' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <Volume2 className="w-4 h-4 flex-shrink-0" />
              )}
              {status === 'confirmed' ? 'Phrase set to: ' : 'Heard: '}
              <span className="font-medium">{transcript}</span>
            </p>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200 flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <p>Voice recognition not available. Please type your command.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
        <p className="text-xs text-primary/80 font-body leading-relaxed">
          💡 <span className="font-medium">Tips:</span> Use a 2-4 word phrase like "Help now" or "SOS emergency" for accuracy. This will be active whenever Panic Mode is enabled.
        </p>
      </div>

      <Button
        onClick={handleSave}
        disabled={!phrase.trim() || saving}
        className="w-full bg-primary hover:bg-primary/90"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Voice Command'
        )}
      </Button>
    </motion.div>
  );
}