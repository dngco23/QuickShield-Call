import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, BookOpen, Mic, MicOff, Loader2, Cloud, CloudOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SyncStatus from '@/components/SyncStatus';
import { useOfflineJournal } from '@/lib/useOfflineJournal';
import { useSyncManager } from '@/lib/useSyncManager';
import { initDB } from '@/lib/offlineDB';

export default function Journal() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [newEntry, setNewEntry] = useState('');
  const [mood, setMood] = useState('neutral');
  const [isListening, setIsListening] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const recognitionRef = useRef(null);

  const { localEntries, loading: localLoading, addEntry, getUnsyncedEntries } = useOfflineJournal();
  const { syncing, lastSyncTime, performSync } = useSyncManager();

  const moods = [
    { emoji: '😔', label: 'Low', value: 'low' },
    { emoji: '😐', label: 'Neutral', value: 'neutral' },
    { emoji: '😊', label: 'Good', value: 'good' },
    { emoji: '🤗', label: 'Great', value: 'great' },
  ];

  useEffect(() => {
    initDB().catch(console.error);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setNewEntry((prev) => prev + transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleAddEntry = async () => {
    if (!newEntry.trim()) return;

    try {
      await addEntry({
        content: newEntry,
        mood,
        date: new Date().toISOString().split('T')[0]
      });
      setNewEntry('');
      setMood('neutral');
      setShowForm(false);
    } catch (error) {
      console.error('Failed to add entry:', error);
      alert('Failed to save entry');
    }
  };

  if (localLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const unsyncedCount = getUnsyncedEntries().length;

  return (
    <div className="min-h-screen bg-background pb-20">
      <SyncStatus
        isOnline={isOnline}
        syncing={syncing}
        lastSyncTime={lastSyncTime}
        unsyncedCount={unsyncedCount}
      />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-5 pt-8 pb-6"
      >
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h1 className="font-display text-2xl font-semibold">Journal</h1>
        </div>
        <div className="ml-auto">
          {!isOnline ? (
            <div className="flex items-center gap-1 text-xs text-destructive bg-destructive/10 px-2 py-1 rounded-full">
              <CloudOff className="w-3 h-3" />
              <span>Offline</span>
            </div>
          ) : syncing ? (
            <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Syncing...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-accent-foreground bg-accent/10 px-2 py-1 rounded-full">
              <Cloud className="w-3 h-3" />
              <span>Synced</span>
            </div>
          )}
        </div>
      </motion.div>

      <div className="px-5 space-y-4">
        {!showForm ? (
          <Button
            onClick={() => setShowForm(true)}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Entry
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-4 space-y-3"
          >
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">How are you feeling?</label>
              <div className="flex gap-2">
                {moods.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMood(m.value)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${
                      mood === m.value ? 'bg-primary/20' : 'bg-muted/30'
                    }`}
                  >
                    <span className="text-xl">{m.emoji}</span>
                    <span className="text-xs">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <textarea
                value={newEntry}
                onChange={(e) => setNewEntry(e.target.value)}
                placeholder="Write your thoughts... or tap the microphone to dictate"
                maxLength={500}
                className="w-full h-24 px-3 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={toggleListening}
                  animate={isListening ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                  transition={{ duration: 1, repeat: isListening ? Infinity : 0 }}
                  className={`p-2 rounded-lg transition-all ${
                    isListening
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }`}
                  title="Tap to dictate"
                >
                  {isListening ? (
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>
                      <Mic className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <MicOff className="w-4 h-4" />
                  )}
                </motion.button>
                <span className="text-xs text-muted-foreground font-body">
                  {isListening ? 'Listening...' : 'Tap mic to record'} • {newEntry.length}/500
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAddEntry}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Save Entry
              </Button>
              <Button
                onClick={() => {
                  setShowForm(false);
                  setNewEntry('');
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>

            {!isOnline && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                <p className="text-xs text-destructive font-body">
                  ⚠️ You're offline. Your entry will be saved locally and automatically synced when you're back online.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {localEntries.length > 0 && (
          <div className="space-y-3">
            {localEntries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border border-border p-4 relative"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-muted-foreground">{entry.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {moods.find((m) => m.value === entry.mood)?.emoji || '😐'}
                    </span>
                    {!entry.synced && (
                      <div className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                        <CloudOff className="w-3 h-3" />
                        <span>Pending</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{entry.content}</p>
              </motion.div>
            ))}
          </div>
        )}

        {localEntries.length === 0 && !showForm && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No entries yet. Start journaling to track your thoughts.</p>
          </div>
        )}
      </div>
    </div>
  );
}