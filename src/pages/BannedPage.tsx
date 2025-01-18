import React from 'react';
import { Ban } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

export const BannedPage = () => {
  const { banReason, banExpiresAt } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl border border-red-500/30 p-8 text-center">
        <div className="bg-red-500/10 rounded-full p-4 mx-auto w-fit mb-6">
          <Ban className="h-12 w-12 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-4">
          Account Suspended
        </h1>
        
        <p className="text-gray-300 mb-6">
          Your account has been suspended {banExpiresAt ? 'temporarily' : 'permanently'}.
        </p>

        {banReason && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-400 mb-2">Reason for suspension:</h2>
            <p className="text-white bg-gray-700/50 rounded-lg p-4">
              {banReason}
            </p>
          </div>
        )}

        {banExpiresAt && (
          <div className="text-sm text-gray-400">
            <p>Your suspension will be lifted in:</p>
            <p className="text-violet-400 font-medium">
              {formatDistanceToNow(new Date(banExpiresAt), { addSuffix: true })}
            </p>
          </div>
        )}

        <div className="mt-8 text-sm text-gray-400">
          <p>
            If you believe this was a mistake, please contact support at{' '}
            <a href="mailto:support@turkivy.com" className="text-violet-400 hover:text-violet-300">
              support@turkivy.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};