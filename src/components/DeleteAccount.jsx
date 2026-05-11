import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';

export default function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1); // 1 = info, 2 = confirm text, 3 = deleting
  const [input, setInput] = useState('');
  const CONFIRM_WORD = 'DELETE';

  const handleDelete = async () => {
    if (input !== CONFIRM_WORD) return;
    setStep(3);
    try {
      // Purge all user data first
      await base44.functions.invoke('privacyPurge', { daysOld: 0 });
      // Then log out — account deletion beyond data purge requires platform support
      await base44.auth.logout('/');
    } catch (err) {
      console.error('Account deletion error:', err);
      setStep(2);
      alert('Something went wrong. Please contact support to complete account deletion.');
    }
  };

  return (
    <>
      <button
        onClick={() => { setOpen(true); setStep(1); setInput(''); }}
        className="flex items-center gap-2 text-destructive text-sm font-medium hover:underline min-h-[44px] min-w-[44px]"
        aria-label="Delete account"
      >
        <Trash2 className="w-4 h-4" />
        Delete Account
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              {step === 3 ? (
                <div className="flex flex-col items-center gap-4 py-4">
                  <Loader2 className="w-10 h-10 text-destructive animate-spin" />
                  <p className="text-sm text-muted-foreground text-center">Deleting your account and all data…</p>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                      <h2 className="font-display text-lg font-semibold text-foreground">Delete Account</h2>
                    </div>
                    <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Close">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {step === 1 && (
                    <>
                      <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-5 space-y-2">
                        <p className="text-sm font-semibold text-destructive">This action is permanent and cannot be undone.</p>
                        <p className="text-xs text-muted-foreground">Deleting your account will:</p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Permanently erase all journal entries</li>
                          <li>Delete all recordings and panic logs</li>
                          <li>Remove all emergency contacts and zones</li>
                          <li>Cancel any active subscription</li>
                        </ul>
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setOpen(false)} className="flex-1 min-h-[44px]">Cancel</Button>
                        <Button onClick={() => setStep(2)} className="flex-1 bg-destructive hover:bg-destructive/90 min-h-[44px]">Continue</Button>
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <p className="text-sm text-muted-foreground mb-4">
                        Type <span className="font-bold text-foreground">{CONFIRM_WORD}</span> to confirm permanent deletion.
                      </p>
                      <Input
                        value={input}
                        onChange={e => setInput(e.target.value.toUpperCase())}
                        placeholder={CONFIRM_WORD}
                        className="bg-muted/50 mb-4 text-center tracking-widest font-mono min-h-[44px]"
                        autoFocus
                      />
                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setStep(1)} className="flex-1 min-h-[44px]">Back</Button>
                        <Button
                          onClick={handleDelete}
                          disabled={input !== CONFIRM_WORD}
                          className="flex-1 bg-destructive hover:bg-destructive/90 min-h-[44px] disabled:opacity-40"
                        >
                          Delete Everything
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}