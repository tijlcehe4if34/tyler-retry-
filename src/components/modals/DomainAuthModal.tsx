import React, { useState } from 'react';
import { ShieldAlert, Copy, Check, ExternalLink, X, ArrowRight, RefreshCw, Globe } from 'lucide-react';
import firebaseConfig from '../../../firebase-applet-config.json';
import { sound } from '../../lib/sound';

interface DomainAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
}

export const DomainAuthModal: React.FC<DomainAuthModalProps> = ({ isOpen, onClose, onRetry }) => {
  const [copied, setCopied] = useState(false);
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const projectId = firebaseConfig.projectId || 'mimetic-nomad-nwjrd';
  const consoleUrl = `https://console.firebase.google.com/project/${projectId}/authentication/settings`;

  if (!isOpen) return null;

  const handleCopy = () => {
    sound.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentHostname);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3.5 pr-8">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                FIREBASE AUTH SETUP
              </span>
            </div>
            <h2 className="text-lg font-bold text-white">Authorize Domain for Google Login</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Firebase Authentication protects against unauthorized sign-in origins. To enable Google Sign-In, add this preview domain to your Firebase Authorized Domains list.
            </p>
          </div>
        </div>

        {/* Step 1: Copy Domain */}
        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              1. Copy your application domain
            </span>
            {copied && (
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5" /> Copied!
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={currentHostname}
              className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-200 select-all focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Step 2: Open Firebase Console & Add Domain */}
        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
          <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
            2. Add domain in Firebase Console
          </span>
          <div className="space-y-1.5 text-xs text-zinc-400">
            <p className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                1
              </span>
              Click the button below to open your project's Auth Settings.
            </p>
            <p className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                2
              </span>
              Scroll down to the <strong>Authorized domains</strong> section and click <strong>Add domain</strong>.
            </p>
            <p className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                3
              </span>
              Paste the copied domain and click <strong>Save</strong>.
            </p>
          </div>

          <a
            href={consoleUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
          >
            <span>Open Firebase Auth Settings</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onRetry();
            }}
            className="px-4 py-2 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-98"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Google Login</span>
          </button>
        </div>
      </div>
    </div>
  );
};
