import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function SyncStatus({ isOnline, syncing, lastSyncTime, unsyncedCount }) {
  if (isOnline && !syncing && unsyncedCount === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`fixed top-16 left-4 right-4 z-40 px-4 py-3 rounded-lg border flex items-center gap-3 ${
          isOnline
            ? syncing
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'bg-accent/10 border-accent/30 text-accent-foreground'
            : 'bg-destructive/10 border-destructive/30 text-destructive'
        }`}
      >
        {!isOnline && <WifiOff className="w-4 h-4 flex-shrink-0" />}
        {isOnline && !syncing && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
        {isOnline && syncing && <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" />}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            {!isOnline && 'Offline Mode - Data will sync when online'}
            {isOnline && syncing && 'Syncing offline data...'}
            {isOnline && !syncing && unsyncedCount > 0 && `${unsyncedCount} item${unsyncedCount !== 1 ? 's' : ''} synced`}
            {isOnline && !syncing && unsyncedCount === 0 && lastSyncTime && `Synced at ${lastSyncTime.toLocaleTimeString()}`}
          </p>
          {!isOnline && (
            <p className="text-xs opacity-75 mt-0.5">All entries saved locally to IndexedDB</p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}