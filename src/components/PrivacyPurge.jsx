import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PrivacyPurge({ privacyPurgePin, privacyPurgeDays }) {
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isPurging, setIsPurging] = useState(false);

  const handleImmediatePurge = async () => {
    if (!privacyPurgePin) {
      setPinError('No PIN set');
      return;
    }

    if (pinInput !== privacyPurgePin) {
      setPinError('Incorrect PIN');
      setPinInput('');
      return;
    }

    setIsPurging(true);
    try {
      await base44.functions.invoke('privacyPurge', {
        action: 'purge',
        daysOld: 0,
      });
      setShowPinEntry(false);
      setPinInput('');
      setPinError('');
      alert('All messaging and recording logs have been securely deleted.');
    } catch (error) {
      setPinError('Purge failed: ' + error.message);
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-t border-border/50 pt-5">
        <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider mb-4">Privacy Purge</p>
        <p className="text-xs text-muted-foreground font-body mb-4">
          Automatically delete all Panic Mode logs after {privacyPurgeDays || 30} days or purge immediately with PIN.
        </p>

        <AnimatePresence>
          {showPinEntry ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 bg-destructive/5 border border-destructive/20 rounded-lg p-3"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-xs text-destructive font-body">
                  This will permanently delete all messaging and recording logs.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Enter PIN</Label>
                <Input
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError('');
                  }}
                  placeholder="••••"
                  maxLength={6}
                  className="bg-muted/50 text-center tracking-widest text-lg"
                  disabled={isPurging}
                />
                {pinError && <p className="text-xs text-destructive">{pinError}</p>}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setShowPinEntry(false);
                    setPinInput('');
                    setPinError('');
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8"
                  disabled={isPurging}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImmediatePurge}
                  size="sm"
                  className="flex-1 bg-destructive hover:bg-destructive/90 h-8"
                  disabled={isPurging || !pinInput}
                >
                  {isPurging ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowPinEntry(true)}
              disabled={!privacyPurgePin}
              className="w-full py-2 px-3 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs font-body font-medium"
            >
              <Lock className="w-3 h-3" />
              Purge Now (PIN Required)
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}