import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import {
  Cloud,
  CloudCheck,
  RefreshCw,
  LogOut,
  X,
  ShieldCheck,
  Zap,
  Calendar,
  CheckCircle2,
  Smartphone,
  Laptop,
} from 'lucide-react';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    syncStatus,
    lastSyncTime,
    signInWithGoogle,
    signOutUser,
    flushCloudSync,
  } = useApp();

  const [isManualSyncing, setIsManualSyncing] = useState(false);

  if (!isOpen) return null;

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    try {
      await flushCloudSync();
      setTimeout(() => setIsManualSyncing(false), 600);
    } catch {
      setIsManualSyncing(false);
    }
  };

  const formattedTime = lastSyncTime
    ? lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Just now';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  Cloud Sync & Devices
                </h2>
                <p className="text-xs text-zinc-400">
                  Firebase Cloud persistence & cross-device backup
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Account Status Card */}
          {currentUser ? (
            <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full border border-zinc-700 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white">
                      {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {currentUser.displayName || 'Tyler'}
                    </h4>
                    <p className="text-xs text-zinc-400 font-mono truncate max-w-[200px]">
                      {currentUser.email}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${
                    syncStatus === 'syncing' || isManualSyncing
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : syncStatus === 'error'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      syncStatus === 'syncing' || isManualSyncing
                        ? 'bg-amber-400 animate-pulse'
                        : syncStatus === 'error'
                        ? 'bg-rose-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                  {syncStatus === 'syncing' || isManualSyncing
                    ? 'Syncing...'
                    : syncStatus === 'error'
                    ? 'Sync Warning'
                    : 'Synced'}
                </span>
              </div>

              <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
                <span>Last Cloud Update:</span>
                <span className="font-mono text-zinc-300">{formattedTime}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-indigo-950/20 border border-indigo-500/30 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                Sign in to sync across all your devices
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Log in on your phone, laptop, or tablet. Any change you make will automatically save to Google Firestore and update in real-time on your other screens.
              </p>
              <button
                onClick={async () => {
                  await signInWithGoogle();
                }}
                className="w-full py-2.5 bg-white hover:bg-zinc-100 text-zinc-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Sign In with Google
              </button>
            </div>
          )}

          {/* Feature Pillars */}
          <div className="space-y-2.5">
            <div className="flex items-start gap-3 p-3 bg-zinc-950/50 border border-zinc-800/80 rounded-2xl">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Instant Typing, No Delay</p>
                <p className="text-[11px] text-zinc-400">
                  Input states are saved instantly and optimistically. Firestore writes are debounced in the background with 0 UI lag.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-zinc-950/50 border border-zinc-800/80 rounded-2xl">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 mt-0.5">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Checklist-to-Calendar Automation</p>
                <p className="text-[11px] text-zinc-400">
                  Checking items off in your custom routines and checklists automatically syncs and updates your daily schedule calendar.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-zinc-950/50 border border-zinc-800/80 rounded-2xl">
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 mt-0.5">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Phone & Desktop Continuity</p>
                <p className="text-[11px] text-zinc-400">
                  Real-time Firestore listeners keep your tasks, XP, IB subjects, and study timers synchronized everywhere.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-zinc-800">
            {currentUser ? (
              <>
                <button
                  onClick={signOutUser}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-rose-400 bg-zinc-950 hover:bg-rose-500/10 border border-zinc-800 transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>

                <button
                  onClick={handleManualSync}
                  disabled={isManualSyncing}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isManualSyncing ? 'animate-spin' : ''}`}
                  />
                  {isManualSyncing ? 'Syncing...' : 'Sync Now'}
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
