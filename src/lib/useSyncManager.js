import { useEffect, useRef, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import {
  getUnsyncedJournalEntries,
  getUnsyncedLocationData,
  markJournalAsSynced,
  markLocationAsSynced,
  deleteLocalJournalEntry
} from './offlineDB';

export const useSyncManager = () => {
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const syncTimeoutRef = useRef(null);

  const syncJournalEntries = useCallback(async () => {
    try {
      const unsyncedEntries = await getUnsyncedJournalEntries();
      if (unsyncedEntries.length === 0) return;

      for (const entry of unsyncedEntries) {
        try {
          const { local_id, created_at, ...entryData } = entry;
          await base44.entities.JournalEntry.create({
            ...entryData,
            date: entryData.date || new Date().toISOString().split('T')[0]
          });
          await markJournalAsSynced(entry.id);
        } catch (error) {
          console.error('Failed to sync journal entry:', error);
        }
      }
    } catch (error) {
      console.error('Error syncing journal entries:', error);
    }
  }, []);

  const syncLocationData = useCallback(async () => {
    try {
      const unsyncedLocations = await getUnsyncedLocationData();
      if (unsyncedLocations.length === 0) return;

      for (const location of unsyncedLocations) {
        try {
          // Store location data via backend function
          await base44.functions.invoke('storeLocationData', {
            latitude: location.latitude,
            longitude: location.longitude,
            timestamp: location.timestamp,
            accuracy: location.accuracy
          });
          await markLocationAsSynced(location.id);
        } catch (error) {
          console.error('Failed to sync location data:', error);
        }
      }
    } catch (error) {
      console.error('Error syncing location data:', error);
    }
  }, []);

  const performSync = useCallback(async () => {
    if (syncing) return;

    setSyncing(true);
    try {
      await syncJournalEntries();
      await syncLocationData();
      setLastSyncTime(new Date());
    } finally {
      setSyncing(false);
    }
  }, [syncJournalEntries, syncLocationData, syncing]);

  useEffect(() => {
    const handleOnline = async () => {
      console.log('Connection restored, syncing offline data...');
      await performSync();
    };

    const handleOffline = () => {
      console.log('Connection lost, switching to offline mode...');
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic sync every 30 seconds if online
    const startPeriodicSync = () => {
      if (navigator.onLine) {
        syncTimeoutRef.current = setTimeout(() => {
          performSync();
          startPeriodicSync();
        }, 30000);
      }
    };

    startPeriodicSync();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [performSync]);

  return { syncing, lastSyncTime, performSync };
};