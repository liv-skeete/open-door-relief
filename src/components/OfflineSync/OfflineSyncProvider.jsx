import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { 
  collection, addDoc, updateDoc, doc, serverTimestamp, 
  getFirestore, setDoc, writeBatch
} from "firebase/firestore";
import { 
  getPendingUploads, deletePendingUpload, 
  STORES, saveItem, getAllItems, clearStore 
} from "../../utils/offlineStorage";
import { toast } from "react-toastify";

// Create context
const OfflineSyncContext = createContext();

export const useOfflineSync = () => useContext(OfflineSyncContext);

function OfflineSyncProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  console.log("OfflineSyncProvider: isOnline =", isOnline);
  console.log("OfflineSyncProvider: setIsOnline =", setIsOnline);
  console.log("OfflineSyncProvider: navigator.onLine =", navigator.onLine);
  
  const auth = getAuth();
  const db = getFirestore();
  
  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("You're back online!");
      syncData();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("You're offline. Changes will be saved locally.");
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check pending uploads count
    updatePendingCount();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Update pending count
  const updatePendingCount = async () => {
    try {
      const pendingUploads = await getPendingUploads();
      setPendingCount(pendingUploads.length);
    } catch (error) {
      console.error("Error getting pending count:", error);
    }
  };
  
  // Sync data when online
  const syncData = async () => {
    if (!isOnline || isSyncing || !auth.currentUser) return;
    
    setIsSyncing(true);
    
    try {
      const pendingUploads = await getPendingUploads();
      
      if (pendingUploads.length === 0) {
        setIsSyncing(false);
        return;
      }
      
      toast.info(`Syncing ${pendingUploads.length} pending items...`);
      
      // Process in batches of 10
      const batches = [];
      for (let i = 0; i < pendingUploads.length; i += 10) {
        batches.push(pendingUploads.slice(i, i + 10));
      }
      
      for (const batch of batches) {
        await Promise.all(batch.map(async (upload) => {
          try {
            await processPendingUpload(upload);
            await deletePendingUpload(upload.id);
          } catch (error) {
            console.error(`Error processing upload ${upload.id}:`, error);
            
            // Update attempt count
            const updatedUpload = {
              ...upload,
              attempts: (upload.attempts || 0) + 1,
              lastError: error.message
            };
            
            // If too many attempts, mark as failed
            if (updatedUpload.attempts >= 5) {
              updatedUpload.status = 'failed';
            }
            
            await saveItem(STORES.PENDING_UPLOADS, updatedUpload);
          }
        }));
      }
      
      await updatePendingCount();
      
      toast.success("Sync completed successfully!");
    } catch (error) {
      console.error("Error syncing data:", error);
      toast.error("Error syncing data. Will try again later.");
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Process a single pending upload
  const processPendingUpload = async (upload) => {
    const { type, data } = upload;
    
    switch (type) {
      case 'request':
        return processRequest(data);
      case 'pledge':
        return processPledge(data);
      case 'message':
        return processMessage(data);
      case 'user':
        return processUserData(data);
      default:
        throw new Error(`Unknown upload type: ${type}`);
    }
  };
  
  // Process a request
  const processRequest = async (data) => {
    const { id, ...requestData } = data;
    
    // If it has a Firebase ID, update it
    if (!id.startsWith('local_')) {
      await updateDoc(doc(db, "requests", id), {
        ...requestData,
        lastUpdated: serverTimestamp()
      });
      return id;
    }
    
    // Otherwise create a new one
    const docRef = await addDoc(collection(db, "requests"), {
      ...requestData,
      userId: auth.currentUser.uid,
      timestamp: serverTimestamp()
    });
    
    return docRef.id;
  };
  
  // Process a pledge
  const processPledge = async (data) => {
    const { id, ...pledgeData } = data;
    
    // If it has a Firebase ID, update it
    if (!id.startsWith('local_')) {
      await updateDoc(doc(db, "pledges", id), {
        ...pledgeData,
        lastUpdated: serverTimestamp()
      });
      return id;
    }
    
    // Otherwise create a new one
    const docRef = await addDoc(collection(db, "pledges"), {
      ...pledgeData,
      userId: auth.currentUser.uid,
      timestamp: serverTimestamp()
    });
    
    return docRef.id;
  };
  
  // Process a message
  const processMessage = async (data) => {
    const { conversationId, text } = data;
    
    const docRef = await addDoc(collection(db, "conversations", conversationId, "messages"), {
      text,
      senderId: auth.currentUser.uid,
      timestamp: serverTimestamp()
    });
    
    // Update conversation with last message
    await updateDoc(doc(db, "conversations", conversationId), {
      lastMessage: text,
      lastMessageTimestamp: serverTimestamp(),
      lastMessageSenderId: auth.currentUser.uid
    });
    
    return docRef.id;
  };
  
  // Process user data
  const processUserData = async (data) => {
    await setDoc(doc(db, "users", auth.currentUser.uid), data, { merge: true });
    return auth.currentUser.uid;
  };
  
  // Save data for offline use
  const saveForOffline = async (type, data) => {
    try {
      // Save to IndexedDB
      await saveItem(
        type === 'request' ? STORES.REQUESTS : 
        type === 'pledge' ? STORES.PLEDGES : 
        type === 'message' ? STORES.MESSAGES : 
        STORES.USER_DATA, 
        data
      );
      
      // If offline, add to pending uploads
      if (!isOnline) {
        await addPendingUpload(type, data);
        await updatePendingCount();
        return { success: true, offline: true, id: data.id };
      }
      
      return { success: true, offline: false };
    } catch (error) {
      console.error(`Error saving ${type} offline:`, error);
      return { success: false, error: error.message };
    }
  };
  
  // Force sync
  const forceSync = async () => {
    if (!isOnline) {
      toast.warning("You're offline. Please connect to the internet to sync.");
      return;
    }
    
    await syncData();
  };
  
  // Clear offline data
  const clearOfflineData = async () => {
    try {
      await clearStore(STORES.REQUESTS);
      await clearStore(STORES.PLEDGES);
      await clearStore(STORES.MESSAGES);
      await clearStore(STORES.PENDING_UPLOADS);
      await updatePendingCount();
      toast.success("Offline data cleared successfully");
    } catch (error) {
      console.error("Error clearing offline data:", error);
      toast.error("Error clearing offline data");
    }
  };
  
  // Context value
  const value = {
    isOnline,
    isSyncing,
    pendingCount,
    saveForOffline,
    forceSync,
    clearOfflineData
  };
  
  return (
    <OfflineSyncContext.Provider value={value}>
      {children}
      {pendingCount > 0 && isOnline && !isSyncing && (
        <div className="sync-notification" onClick={forceSync}>
          <span>{pendingCount} item{pendingCount !== 1 ? 's' : ''} pending sync</span>
          <button>Sync Now</button>
        </div>
      )}
      {isSyncing && (
        <div className="sync-indicator">
          <div className="sync-spinner"></div>
          <span>Syncing data...</span>
        </div>
      )}
    </OfflineSyncContext.Provider>
  );
}

export default OfflineSyncProvider;
