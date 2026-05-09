import { useState, useCallback, useEffect } from 'react';
import { saveJournalEntry, getAllJournalEntries, deleteLocalJournalEntry } from './offlineDB';

export const useOfflineJournal = () => {
  const [localEntries, setLocalEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLocalEntries = useCallback(async () => {
    try {
      const entries = await getAllJournalEntries();
      setLocalEntries(entries);
    } catch (error) {
      console.error('Failed to load local journal entries:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLocalEntries();
  }, [loadLocalEntries]);

  const addEntry = useCallback(async (entry) => {
    try {
      const id = await saveJournalEntry(entry);
      await loadLocalEntries();
      return id;
    } catch (error) {
      console.error('Failed to save journal entry:', error);
      throw error;
    }
  }, [loadLocalEntries]);

  const deleteEntry = useCallback(async (id) => {
    try {
      await deleteLocalJournalEntry(id);
      await loadLocalEntries();
    } catch (error) {
      console.error('Failed to delete journal entry:', error);
      throw error;
    }
  }, [loadLocalEntries]);

  const getSyncedEntries = useCallback(() => {
    return localEntries.filter(e => e.synced);
  }, [localEntries]);

  const getUnsyncedEntries = useCallback(() => {
    return localEntries.filter(e => !e.synced);
  }, [localEntries]);

  return {
    localEntries,
    loading,
    addEntry,
    deleteEntry,
    getSyncedEntries,
    getUnsyncedEntries,
    reload: loadLocalEntries
  };
};