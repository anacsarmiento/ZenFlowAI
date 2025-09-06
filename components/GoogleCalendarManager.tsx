import React from 'react';
import { GoogleIcon } from './Icons';

interface GoogleCalendarManagerProps {
  isSignedIn: boolean;
  isSyncing: boolean;
  error: string;
  onSignIn: () => void;
  onSignOut: () => void;
  onSync: () => void;
}

const GoogleCalendarManager: React.FC<GoogleCalendarManagerProps> = ({
  isSignedIn,
  isSyncing,
  error,
  onSignIn,
  onSignOut,
  onSync
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white/10 rounded-lg">
      {!isSignedIn ? (
        <button
          onClick={onSignIn}
          className="flex items-center justify-center w-full max-w-xs px-4 py-3 bg-white text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--primary-800)] focus:ring-white transition-all transform hover:scale-105"
        >
          <GoogleIcon className="h-6 w-6 mr-3" />
          Connect Google Calendar
        </button>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center justify-center w-full sm:w-auto px-4 py-3 bg-white text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--primary-800)] focus:ring-white transition-all transform hover:scale-105 disabled:bg-gray-200 disabled:cursor-wait disabled:scale-100"
          >
            <GoogleIcon className="h-6 w-6 mr-3" />
            {isSyncing ? 'Syncing...' : "Sync Today's Events"}
          </button>
          <button
            onClick={onSignOut}
            className="text-xs text-white/70 hover:text-white hover:underline focus:outline-none focus:ring-1 focus:ring-white rounded"
          >
            Sign Out
          </button>
        </div>
      )}
      {error && (
        <p className="mt-3 text-sm text-red-300 bg-red-900/50 px-3 py-1 rounded">
          {error}
        </p>
      )}
    </div>
  );
};

export default GoogleCalendarManager;