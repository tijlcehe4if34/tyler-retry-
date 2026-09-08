import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, ExternalLink, X, ChevronDown, ChevronUp, Sparkles, Volume2 } from 'lucide-react';
import { sound } from '../lib/sound';

export const SPOTIFY_STUDY_PLAYLIST_URL = 'https://open.spotify.com/playlist/1ekvP9yLQ8HaIHieliocSl';
export const SPOTIFY_EMBED_URL = 'https://open.spotify.com/embed/playlist/1ekvP9yLQ8HaIHieliocSl?utm_source=generator&theme=0';

interface SpotifyPlayerProps {
  variant?: 'popover' | 'inline' | 'focus-dock';
  isOpen?: boolean;
  onClose?: () => void;
}

export const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({
  variant = 'popover',
  isOpen = true,
  onClose,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isOpen && variant === 'popover') return null;

  if (variant === 'focus-dock') {
    return (
      <div className="w-full max-w-md bg-zinc-900/90 border border-emerald-500/30 rounded-3xl p-3 sm:p-4 shadow-2xl backdrop-blur-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center text-[#1DB954]">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-white flex items-center gap-1.5">
                <span>Study Music Playlist</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#1DB954]/20 text-[#1DB954] font-mono">
                  SPOTIFY
                </span>
              </p>
              <p className="text-[11px] text-zinc-400">Tyler's Curated Focus Tracks</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs transition-colors"
              title={isExpanded ? 'Collapse player' : 'Expand playlist'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <a
              href={SPOTIFY_STUDY_PLAYLIST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-[#1DB954]/20 hover:bg-[#1DB954]/30 text-[#1DB954] transition-colors"
              title="Open in Spotify app"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Embedded Player */}
        <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-black/40">
          <iframe
            src={SPOTIFY_EMBED_URL}
            width="100%"
            height={isExpanded ? '352' : '152'}
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Study Music Playlist"
            className="w-full rounded-2xl transition-all duration-300"
          />
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-3xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center text-[#1DB954]">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>Study Music Playlist</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1DB954]/20 text-[#1DB954] font-bold font-mono">
                  SPOTIFY
                </span>
              </h3>
              <p className="text-xs text-zinc-400">Lock into your curated study beats</p>
            </div>
          </div>

          <a
            href={SPOTIFY_STUDY_PLAYLIST_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1DB954]/15 hover:bg-[#1DB954]/25 border border-[#1DB954]/30 text-[#1DB954] text-xs font-bold transition-all"
          >
            <span>Open in App</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-black/40">
          <iframe
            src={SPOTIFY_EMBED_URL}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Tyler's Study Music"
            className="w-full rounded-2xl"
          />
        </div>
      </div>
    );
  }

  // Popover mode
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="absolute top-full mt-3 right-0 sm:right-4 w-[calc(100vw-2rem)] sm:w-96 max-w-md bg-zinc-900 border border-zinc-700/80 rounded-3xl p-4 shadow-2xl z-50 space-y-3 backdrop-blur-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center text-[#1DB954]">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-white flex items-center gap-1.5">
                <span>Study Music Player</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#1DB954]/20 text-[#1DB954] font-mono font-bold">
                  SPOTIFY
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <a
              href={SPOTIFY_STUDY_PLAYLIST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-[#1DB954] hover:bg-zinc-800 transition-colors"
              title="Open playlist in Spotify"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            {onClose && (
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Embedded Player */}
        <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-black/60 shadow-inner">
          <iframe
            src={SPOTIFY_EMBED_URL}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Study Music Playlist"
            className="w-full rounded-2xl"
          />
        </div>

        {/* Footer tip */}
        <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono px-1">
          <span className="flex items-center gap-1 text-zinc-400">
            <Sparkles className="w-3 h-3 text-[#1DB954]" />
            IB Study Focus Mix
          </span>
          <span className="text-zinc-500">Auto-synced</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
