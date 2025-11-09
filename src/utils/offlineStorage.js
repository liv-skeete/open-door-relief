/**
 * Offline storage utilities using IndexedDB
 */

// Database name and version
const DB_NAME = 'OpenDoorReliefDB';
const DB_VERSION = 1;

// Store names
const STORES = {
  REQUESTS: 'requests',
  PLEDGES: 'pledges',
  MESSAGES: 'messages',
  PENDING_UPLOADS: 'pendingUploads',
  USER_DATA: 'userData',
  RELIEF_CENTERS: 'reliefCenters'
};

/**
 * Initialize the IndexedDB database
 * @returns {Promise<IDBDatabase>} The database instance
 */
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.REQUESTS)) {
        db.createObjectStore(STORES.REQUESTS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.PLEDGES)) {
        db.createObjectStore(STORES.PLEDGES, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.MESSAGES)) {
        const messagesStore = db.createObjectStore(STORES.MESSAGES, { keyPath: 'id' });
        messagesStore.createIndex('conversationId', 'conversationId', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.PENDING_UPLOADS)) {
        const pendingUploadsStore = db.createObjectStore(STORES.PENDING_UPLOADS, { keyPath: 'id', autoIncrement: true });
        pendingUploadsStore.createIndex('type', 'type', { unique: false });
        pendingUploadsStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
        db.createObjectStore(STORES.USER_DATA, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.RELIEF_CENTERS)) {
        db.createObjectStore(STORES.RELIEF_CENTERS, { keyPath: 'id' });
      }
    };
  });
};

/**
 * Add or update an item in a store
 * @param {string} storeName - The name of the store
 * @param {Object} item - The item to add or update
 * @returns {Promise<string>} The ID of the added/updated item
 */
export const saveItem = async (storeName, item) => {
  const db = await initDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    // Generate an ID if one doesn't exist
    if (!item.id && storeName !== STORES.PENDING_UPLOADS) {
      item.id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    const request = store.put(item);
    
    request.onsuccess = (event) => {
      resolve(request.result);
    };
    
    request.onerror = (event) => {
      console.error(`Error saving to ${storeName}:`, event.target.error);
      reject(event.target.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

/**
 * Get an item from a store by ID
 * @param {string} storeName - The name of the store
 * @param {string} id - The ID of the item to get
 * @returns {Promise<Object>} The requested item
 */
export const getItem = async (storeName, id) => {
  const db = await initDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);
    
    request.onsuccess = (event) => {
      resolve(request.result);
    };
    
    request.onerror = (event) => {
      console.error(`Error getting from ${storeName}:`, event.target.error);
      reject(event.target.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

/**
 * Get all items from a store
 * @param {string} storeName - The name of the store
 * @returns {Promise<Array>} All items in the store
 */
export const getAllItems = async (storeName) => {
  const db = await initDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = (event) => {
      resolve(request.result);
    };
    
    request.onerror = (event) => {
      console.error(`Error getting all from ${storeName}:`, event.target.error);
      reject(event.target.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

/**
 * Delete an item from a store by ID
 * @param {string} storeName - The name of the store
 * @param {string} id - The ID of the item to delete
 * @returns {Promise<void>}
 */
export const deleteItem = async (storeName, id) => {
  const db = await initDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onsuccess = (event) => {
      resolve();
    };
    
    request.onerror = (event) => {
      console.error(`Error deleting from ${storeName}:`, event.target.error);
      reject(event.target.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

/**
 * Get items from a store by index
 * @param {string} storeName - The name of the store
 * @param {string} indexName - The name of the index
 * @param {any} value - The value to search for
 * @returns {Promise<Array>} Matching items
 */
export const getItemsByIndex = async (storeName, indexName, value) => {
  const db = await initDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);
    
    request.onsuccess = (event) => {
      resolve(request.result);
    };
    
    request.onerror = (event) => {
      console.error(`Error getting by index from ${storeName}:`, event.target.error);
      reject(event.target.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

/**
 * Add a pending upload to be synced when online
 * @param {string} type - The type of upload (request, pledge, message)
 * @param {Object} data - The data to upload
 * @returns {Promise<number>} The ID of the pending upload
 */
export const addPendingUpload = async (type, data) => {
  return saveItem(STORES.PENDING_UPLOADS, {
    type,
    data,
    timestamp: Date.now(),
    attempts: 0
  });
};

/**
 * Get all pending uploads
 * @returns {Promise<Array>} All pending uploads
 */
export const getPendingUploads = async () => {
  return getAllItems(STORES.PENDING_UPLOADS);
};

/**
 * Delete a pending upload by ID
 * @param {number} id - The ID of the pending upload
 * @returns {Promise<void>}
 */
export const deletePendingUpload = async (id) => {
  return deleteItem(STORES.PENDING_UPLOADS, id);
};

/**
 * Clear all data from a store
 * @param {string} storeName - The name of the store
 * @returns {Promise<void>}
 */
export const clearStore = async (storeName) => {
  const db = await initDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();
    
    request.onsuccess = (event) => {
      resolve();
    };
    
    request.onerror = (event) => {
      console.error(`Error clearing ${storeName}:`, event.target.error);
      reject(event.target.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Export store names for use in components
export { STORES };
