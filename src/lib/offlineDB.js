const DB_NAME = 'QuickShieldDB';
const DB_VERSION = 1;

const STORES = {
  journal_entries: 'journal_entries',
  location_data: 'location_data',
  sync_queue: 'sync_queue'
};

let db = null;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Journal entries store
      if (!database.objectStoreNames.contains(STORES.journal_entries)) {
        const store = database.createObjectStore(STORES.journal_entries, { keyPath: 'id', autoIncrement: true });
        store.createIndex('created_date', 'created_date', { unique: false });
        store.createIndex('synced', 'synced', { unique: false });
      }

      // Location data store
      if (!database.objectStoreNames.contains(STORES.location_data)) {
        const store = database.createObjectStore(STORES.location_data, { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('synced', 'synced', { unique: false });
      }

      // Sync queue store
      if (!database.objectStoreNames.contains(STORES.sync_queue)) {
        database.createObjectStore(STORES.sync_queue, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

export const saveJournalEntry = async (entry) => {
  const database = await initDB();
  const transaction = database.transaction([STORES.journal_entries], 'readwrite');
  const store = transaction.objectStore(STORES.journal_entries);

  return new Promise((resolve, reject) => {
    const request = store.add({
      ...entry,
      local_id: Date.now(),
      synced: false,
      created_at: new Date().toISOString()
    });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const getUnsyncedJournalEntries = async () => {
  const database = await initDB();
  const transaction = database.transaction([STORES.journal_entries], 'readonly');
  const store = transaction.objectStore(STORES.journal_entries);
  const index = store.index('synced');

  return new Promise((resolve, reject) => {
    const request = index.getAll(false);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const markJournalAsSynced = async (localId) => {
  const database = await initDB();
  const transaction = database.transaction([STORES.journal_entries], 'readwrite');
  const store = transaction.objectStore(STORES.journal_entries);

  return new Promise((resolve, reject) => {
    const request = store.get(localId);
    request.onsuccess = () => {
      const entry = request.result;
      entry.synced = true;
      const updateRequest = store.put(entry);
      updateRequest.onerror = () => reject(updateRequest.error);
      updateRequest.onsuccess = () => resolve();
    };
    request.onerror = () => reject(request.error);
  });
};

export const saveLocationData = async (location) => {
  const database = await initDB();
  const transaction = database.transaction([STORES.location_data], 'readwrite');
  const store = transaction.objectStore(STORES.location_data);

  return new Promise((resolve, reject) => {
    const request = store.add({
      ...location,
      timestamp: new Date().toISOString(),
      synced: false
    });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const getUnsyncedLocationData = async () => {
  const database = await initDB();
  const transaction = database.transaction([STORES.location_data], 'readonly');
  const store = transaction.objectStore(STORES.location_data);
  const index = store.index('synced');

  return new Promise((resolve, reject) => {
    const request = index.getAll(false);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const markLocationAsSynced = async (localId) => {
  const database = await initDB();
  const transaction = database.transaction([STORES.location_data], 'readwrite');
  const store = transaction.objectStore(STORES.location_data);

  return new Promise((resolve, reject) => {
    const request = store.get(localId);
    request.onsuccess = () => {
      const data = request.result;
      data.synced = true;
      const updateRequest = store.put(data);
      updateRequest.onerror = () => reject(updateRequest.error);
      updateRequest.onsuccess = () => resolve();
    };
    request.onerror = () => reject(request.error);
  });
};

export const getAllJournalEntries = async () => {
  const database = await initDB();
  const transaction = database.transaction([STORES.journal_entries], 'readonly');
  const store = transaction.objectStore(STORES.journal_entries);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const deleteLocalJournalEntry = async (localId) => {
  const database = await initDB();
  const transaction = database.transaction([STORES.journal_entries], 'readwrite');
  const store = transaction.objectStore(STORES.journal_entries);

  return new Promise((resolve, reject) => {
    const request = store.delete(localId);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const clearDatabase = async () => {
  const database = await initDB();
  const transaction = database.transaction(Object.values(STORES), 'readwrite');

  return new Promise((resolve, reject) => {
    let completed = 0;
    Object.values(STORES).forEach((storeName) => {
      const request = transaction.objectStore(storeName).clear();
      request.onsuccess = () => {
        completed++;
        if (completed === Object.values(STORES).length) resolve();
      };
      request.onerror = () => reject(request.error);
    });
  });
};