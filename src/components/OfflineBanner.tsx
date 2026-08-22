import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function OfflineBanner() {
  const { isOnline, wasOffline } = useOnlineStatus();

  if (isOnline && !wasOffline) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-[100] px-4 py-2 text-center text-sm font-medium transition-all duration-300 ${
      isOnline
        ? 'bg-emerald-500/90 text-white'
        : 'bg-red-500/90 text-white'
    }`}>
      <div className="flex items-center justify-center gap-2">
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span>Connection restored. Data will sync automatically.</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>You are offline. Some features may be unavailable.</span>
          </>
        )}
      </div>
    </div>
  );
}
