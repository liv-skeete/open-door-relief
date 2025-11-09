import { useOfflineSync } from "./OfflineSyncProvider";

function OfflineBanner() {
  const { isOnline, pendingCount, forceSync } = useOfflineSync();
  
  if (isOnline) return null;
  
  return (
    <div className="offline-banner">
      You're offline. Your changes will be saved locally and synced when you reconnect.
      {pendingCount > 0 && (
        <span> ({pendingCount} item{pendingCount !== 1 ? 's' : ''} pending)</span>
      )}
    </div>
  );
}

export default OfflineBanner;
