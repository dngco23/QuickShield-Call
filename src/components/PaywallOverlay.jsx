import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTrial } from '@/lib/trialContext';

export default function PaywallOverlay({ featureName, onClose }) {
  const { trialInfo, isPro } = useTrial();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: 'monthly', // or 'yearly'
        }),
      });
      const { checkoutUrl } = await response.json();
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Failed to create checkout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9997] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card rounded-2xl p-6 w-full max-w-md shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-display text-lg font-semibold text-foreground">Premium Feature</h2>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            <span className="font-semibold text-foreground">{featureName}</span> is available in Quickshield Pro.
          </p>

          {trialInfo && !trialInfo.isExpired && !isPro && (
            <div className="bg-accent/20 border border-accent/40 rounded-lg p-3 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent-foreground flex-shrink-0" />
              <div className="text-xs">
                <p className="font-medium text-accent-foreground">
                  {trialInfo.daysRemaining} day{trialInfo.daysRemaining !== 1 ? 's' : ''} of free trial left
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3 mb-5">
            <div className="flex items-center gap-2 text-sm text-foreground/80">
              <Zap className="w-4 h-4 text-primary" />
              <span>Voice-triggered SOS</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground/80">
              <Zap className="w-4 h-4 text-primary" />
              <span>Offline maps for your area</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground/80">
              <Zap className="w-4 h-4 text-primary" />
              <span>Encrypted panic messaging</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground/80">
              <Zap className="w-4 h-4 text-primary" />
              <span>Unlimited call recordings</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isLoading ? 'Loading...' : 'Upgrade to Pro'}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Maybe Later
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Cancel anytime. No commitment required.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}