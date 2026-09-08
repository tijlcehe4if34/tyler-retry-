import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  Volume2,
  VolumeX,
  Menu,
  Plus,
  Flame,
  Zap,
  Minimize2,
  Sparkles,
  Music,
} from 'lucide-react';
import { QuickAddModal } from './modals/QuickAddModal';
import { ReminderModal } from './modals/ReminderModal';
import { SpotifyPlayer } from './SpotifyPlayer';
import { ActiveTab } from './Navigation';

interface TopHeaderProps {
  onOpenMobileMenu: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenMobileMenu, setActiveTab }) => {
  const {
    state,
    levelInfo,
    updateSettings,
    isFocusMode,
    toggleFocusMode,
    studyTimer,
  } = useApp();

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [isSpotifyOpen, setIsSpotifyOpen] = useState(false);

  const activeRemindersCount = state.reminders.filter((r) => !r.isDismissed).length;

  // Format timer for header badge
  const timerMins = Math.floor(studyTimer.secondsRemaining / 60);
  const timerSecs = studyTimer.secondsRemaining % 60;
  const timerFormatted = `${String(timerMins).padStart(2, '0')}:${String(timerSecs).padStart(2, '0')}`;

  // XP Progress Calculation for Radial Gauge
  const progressPercent = Math.min(100, Math.max(0, levelInfo.progressPercent || 0));
  // SVG circular perimeter: 2 * PI * 14 = 87.96
  const circleRadius = 14;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (circumference * progressPercent) / 100;

  return (
    <>
      <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-3 sm:px-6 md:px-8 bg-zinc-950/70 backdrop-blur shrink-0 z-30 transition-all relative">
        {/* Left Side: Mobile toggle + Level Radial XP Gauge & Streak stats */}
        <div className="flex items-center space-x-3 sm:space-x-5 md:space-x-6">
          {/* Mobile hamburger button */}
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-900 border border-zinc-800"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Current Level with RADIAL PROGRESS BAR */}
          <div
            onClick={() => setActiveTab('rewards')}
            className="flex items-center gap-2.5 p-1.5 pr-3 bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800/90 hover:border-amber-500/40 rounded-2xl cursor-pointer group transition-all shadow-xs"
            title={`Level ${levelInfo.level} — ${levelInfo.currentLevelXp} / ${levelInfo.nextLevelXp} XP (${Math.round(progressPercent)}% to Level ${levelInfo.level + 1})`}
          >
            {/* Radial Progress Gauge Ring */}
            <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background Track */}
                <circle
                  cx="18"
                  cy="18"
                  r={circleRadius}
                  className="stroke-zinc-800"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                {/* Real-time Progress Ring */}
                <circle
                  cx="18"
                  cy="18"
                  r={circleRadius}
                  className="stroke-amber-400 group-hover:stroke-amber-300 transition-all duration-500 drop-shadow-[0_0_6px_rgba(251,191,36,0.35)]"
                  strokeWidth="3.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              {/* Center Level Number */}
              <span className="absolute text-[11px] font-black text-amber-400 font-mono">
                {levelInfo.level}
              </span>
            </div>

            {/* Level Label & Exact XP readout */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-black text-zinc-400 group-hover:text-amber-400 transition-colors tracking-wider">
                  LVL {levelInfo.level}
                </span>
                <span className="text-[9px] font-mono font-bold text-amber-400/90 px-1 py-0.2 rounded-md bg-amber-400/10">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400 font-semibold">
                <span className="text-zinc-200">{levelInfo.currentLevelXp}</span>
                <span className="text-zinc-500">/{levelInfo.nextLevelXp} XP</span>
              </span>
            </div>
          </div>

          <div className="hidden sm:block h-7 w-px bg-zinc-800/80" />

          {/* Streak Indicator */}
          <div
            onClick={() => setActiveTab('discord')}
            className="hidden md:flex flex-col cursor-pointer group"
            title="Streak and Focus Mode"
          >
            <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-500" /> {state.streakCount} Day Streak
            </span>
            <span className="text-xs sm:text-sm font-bold text-orange-500">
              Lock-In Active
            </span>
          </div>
        </div>

        {/* Right Side: Spotify Music, FOCUS MODE TOGGLE, Quick Add, Audio, Reminders & Avatar */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* SPOTIFY STUDY PLAYLIST BUTTON */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsSpotifyOpen(!isSpotifyOpen)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold transition-all border shadow-xs cursor-pointer ${
                isSpotifyOpen
                  ? 'bg-[#1DB954]/20 border-[#1DB954] text-[#1DB954] shadow-[#1DB954]/20'
                  : 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-800 hover:border-[#1DB954]/50 text-zinc-300 hover:text-white'
              }`}
              title="Study Music Playlist (Spotify)"
            >
              <Music className={`w-4 h-4 text-[#1DB954] ${isSpotifyOpen ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline font-mono font-bold">MUSIC</span>
              {/* Little equalizer animation visual */}
              <div className="hidden md:flex items-end gap-0.5 h-3 ml-0.5">
                <span className="w-0.5 h-2 bg-[#1DB954] rounded-full animate-pulse" />
                <span className="w-0.5 h-3 bg-[#1DB954] rounded-full animate-pulse delay-75" />
                <span className="w-0.5 h-1.5 bg-[#1DB954] rounded-full animate-pulse delay-150" />
              </div>
            </motion.button>

            {/* Spotify Popover */}
            {isSpotifyOpen && (
              <SpotifyPlayer
                variant="popover"
                isOpen={isSpotifyOpen}
                onClose={() => setIsSpotifyOpen(false)}
              />
            )}
          </div>

          {/* FOCUS MODE TOGGLE (Large, prominent, easy to press with rich animations) */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => toggleFocusMode()}
            className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer border select-none ${
              isFocusMode
                ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-emerald-500/25 ring-2 ring-emerald-400/40'
                : studyTimer.isActive
                ? 'bg-indigo-950/80 hover:bg-indigo-900 border-indigo-500/60 text-indigo-300 shadow-indigo-900/30'
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700/80 hover:border-indigo-500/50 text-zinc-200'
            }`}
            title="Toggle Distraction-Free Focus Mode (Press 'F')"
          >
            {/* Live Indicator Icon */}
            {isFocusMode ? (
              <>
                <Minimize2 className="w-4 h-4 text-zinc-950 shrink-0" />
                <span className="font-black">FOCUS ON</span>
              </>
            ) : studyTimer.isActive ? (
              <>
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="font-mono text-white font-bold">{timerFormatted}</span>
                <span className="hidden sm:inline text-indigo-300">FOCUS</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">FOCUS MODE</span>
              </>
            )}

            {/* Keyboard shortcut hint */}
            <span
              className={`hidden md:inline-block text-[10px] px-1.5 py-0.5 rounded font-mono ${
                isFocusMode
                  ? 'bg-emerald-600 text-emerald-100'
                  : 'bg-zinc-800/90 text-zinc-400 border border-zinc-700/50'
              }`}
            >
              F
            </span>
          </motion.button>

          {/* Reminders Button */}
          <button
            onClick={() => setIsRemindersOpen(true)}
            className="relative p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 transition-colors"
            title="Reminders"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            {activeRemindersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {activeRemindersCount}
              </span>
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() =>
              updateSettings({
                appearance: {
                  ...state.settings.appearance,
                  soundEnabled: !state.settings.appearance.soundEnabled,
                },
              })
            }
            className="hidden sm:block p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 transition-colors"
            title={state.settings.appearance.soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
          >
            {state.settings.appearance.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-500" />
            )}
          </button>

          {/* + NEW TASK Button */}
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700/60 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">NEW TASK</span>
          </button>

          {/* User Avatar Capsule */}
          <div
            onClick={() => setActiveTab('settings')}
            className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-indigo-400 flex items-center justify-center font-bold text-xs shadow-lg text-white cursor-pointer hover:scale-105 transition-transform shrink-0"
            title={`${state.settings.profile.name} (Click for Settings)`}
          >
            {state.settings.profile.name ? state.settings.profile.name[0].toUpperCase() : 'T'}
          </div>
        </div>
      </header>

      {/* Quick Add Modal */}
      <QuickAddModal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />

      {/* Reminders Modal */}
      <ReminderModal isOpen={isRemindersOpen} onClose={() => setIsRemindersOpen(false)} />
    </>
  );
};
