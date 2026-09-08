import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { sound } from '../lib/sound';
import { DynamicIcon } from './DynamicIcon';
import { SpotifyPlayer } from './SpotifyPlayer';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Minimize2,
  Sparkles,
  Volume2,
  VolumeX,
  Radio,
  BookOpen,
  ChevronDown,
  CloudRain,
  Waves,
  Feather,
  Music,
} from 'lucide-react';

export const FocusModeTheater: React.FC = () => {
  const {
    state,
    isFocusMode,
    toggleFocusMode,
    studyTimer,
    startStudyTimer,
    pauseStudyTimer,
    resetStudyTimer,
    setStudyTimerDuration,
    setStudySubjectId,
    setStudySessionNotes,
    finishStudySessionEarly,
  } = useApp();

  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const [ambientType, setAmbientType] = useState<'off' | 'brown' | 'rain' | 'binaural'>('off');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.2);
  const [isAmbientMenuOpen, setIsAmbientMenuOpen] = useState(false);
  const [isSpotifyDockOpen, setIsSpotifyDockOpen] = useState(false);

  const selectedSubject =
    state.subjects.find((s) => s.id === studyTimer.selectedSubjectId) ||
    state.subjects[0] || {
      id: 'sub_general',
      name: 'General Study',
      color: '#6366f1',
      icon: 'BookOpen',
    };

  // Keyboard shortcut listeners within theater
  useEffect(() => {
    if (!isFocusMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInput =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement;

      if (e.code === 'Space' && !isInput) {
        e.preventDefault();
        if (studyTimer.isActive) {
          pauseStudyTimer();
        } else {
          startStudyTimer();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode, studyTimer.isActive, startStudyTimer, pauseStudyTimer]);

  // Ambient sound handler
  const handleToggleAmbient = (type: 'off' | 'brown' | 'rain' | 'binaural') => {
    sound.playClick();
    if (type === 'off' || ambientType === type) {
      setAmbientType('off');
      sound.stopAmbientSound();
    } else {
      setAmbientType(type);
      sound.startAmbientSound(type, ambientVolume);
    }
  };

  const handleVolumeChange = (vol: number) => {
    setAmbientVolume(vol);
    sound.setAmbientVolume(vol);
  };

  // Format MM:SS
  const displayMinutes = Math.floor(studyTimer.secondsRemaining / 60);
  const displaySeconds = studyTimer.secondsRemaining % 60;
  const timeFormatted = `${String(displayMinutes).padStart(2, '0')}:${String(
    displaySeconds
  ).padStart(2, '0')}`;

  // Progress calculations
  const progressPercent =
    studyTimer.initialDurationSeconds > 0
      ? Math.round(
          ((studyTimer.initialDurationSeconds - studyTimer.secondsRemaining) /
            studyTimer.initialDurationSeconds) *
            100
        )
      : 0;

  const xpPer25 = state.settings.xpRules.xpPer25MinStudy || 10;
  const estimatedXp = Math.max(
    5,
    Math.round((studyTimer.initialDurationSeconds / (25 * 60)) * xpPer25)
  );

  if (!isFocusMode) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="focus-theater"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl flex flex-col justify-between p-4 sm:p-8 md:p-10 text-white select-none overflow-y-auto"
      >
        {/* Dynamic Atmospheric Breathing Glow */}
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] sm:w-[48rem] sm:h-[48rem] rounded-full blur-[140px] opacity-20 transition-all duration-1000 animate-pulse"
          style={{ backgroundColor: selectedSubject.color || '#6366f1' }}
        />

        {/* TOP BAR: Subject Switcher, Status & Exit Button */}
        <div className="relative z-20 flex items-center justify-between gap-4 max-w-6xl w-full mx-auto">
          {/* Left: Active Subject Selector Pill */}
          <div className="relative">
            <button
              onClick={() => {
                sound.playClick();
                setIsSubjectDropdownOpen(!isSubjectDropdownOpen);
              }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 hover:border-zinc-700 transition-all shadow-lg active:scale-95"
            >
              <div
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: selectedSubject.color }}
              />
              <DynamicIcon
                name={selectedSubject.icon || 'BookOpen'}
                className="w-4 h-4 text-zinc-300"
              />
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                {selectedSubject.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            </button>

            {/* Subject Dropdown Menu */}
            {isSubjectDropdownOpen && (
              <div className="absolute top-full mt-2 left-0 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl p-2 shadow-2xl z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <p className="text-[10px] uppercase font-bold text-zinc-500 px-3 py-1 tracking-wider">
                  Select Subject
                </p>
                {state.subjects.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      sound.playClick();
                      setStudySubjectId(sub.id);
                      setIsSubjectDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                      sub.id === selectedSubject.id
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                    }`}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: sub.color }}
                    />
                    <span className="truncate">{sub.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Center: Live Lock-In Tag */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-zinc-300 font-semibold tracking-wider">
              {studyTimer.isActive ? 'DEEP FOCUS SESSION ACTIVE' : 'FOCUS MODE READY'}
            </span>
          </div>

          {/* Right: Spotify Music, Ambient Sound & Exit Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Spotify Playlist Toggle */}
            <button
              onClick={() => {
                sound.playClick();
                setIsSpotifyDockOpen(!isSpotifyDockOpen);
              }}
              className={`p-2.5 sm:px-3 sm:py-2.5 rounded-2xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                isSpotifyDockOpen
                  ? 'bg-[#1DB954]/20 border-[#1DB954] text-[#1DB954] shadow-md shadow-[#1DB954]/30'
                  : 'bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              title="Tyler's Study Music (Spotify)"
            >
              <Music className="w-4 h-4 text-[#1DB954]" />
              <span className="text-xs font-bold font-mono hidden sm:inline">SPOTIFY</span>
            </button>

            {/* Ambient Sound Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  sound.playClick();
                  setIsAmbientMenuOpen(!isAmbientMenuOpen);
                }}
                className={`p-2.5 rounded-2xl border transition-all flex items-center gap-1.5 ${
                  ambientType !== 'off'
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-950/40'
                    : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title="Ambient Sound Generator"
              >
                {ambientType !== 'off' ? (
                  <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
                <span className="text-xs font-bold hidden sm:inline uppercase">
                  {ambientType === 'off' ? 'Ambient' : ambientType}
                </span>
              </button>

              {/* Ambient Audio Dropdown */}
              {isAmbientMenuOpen && (
                <div className="absolute top-full mt-2 right-0 w-60 bg-zinc-900 border border-zinc-800 rounded-2xl p-3 shadow-2xl z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">
                      Zen Focus Sounds
                    </p>
                    {ambientType !== 'off' && (
                      <button
                        onClick={() => handleToggleAmbient('off')}
                        className="text-[10px] text-rose-400 hover:underline font-bold"
                      >
                        Turn Off
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => handleToggleAmbient('brown')}
                      className={`p-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 border transition-all ${
                        ambientType === 'brown'
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Waves className="w-4 h-4" />
                      <span>Brown</span>
                    </button>
                    <button
                      onClick={() => handleToggleAmbient('rain')}
                      className={`p-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 border transition-all ${
                        ambientType === 'rain'
                          ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <CloudRain className="w-4 h-4" />
                      <span>Rain</span>
                    </button>
                    <button
                      onClick={() => handleToggleAmbient('binaural')}
                      className={`p-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 border transition-all ${
                        ambientType === 'binaural'
                          ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Feather className="w-4 h-4" />
                      <span>Binaural</span>
                    </button>
                  </div>

                  {ambientType !== 'off' && (
                    <div className="space-y-1 pt-1 border-t border-zinc-800">
                      <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                        <span>Volume</span>
                        <span>{Math.round(ambientVolume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="0.8"
                        step="0.05"
                        value={ambientVolume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* EXIT FOCUS MODE BUTTON (Prominent, High tactile feel) */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleFocusMode(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-white text-xs sm:text-sm font-bold tracking-wider uppercase transition-all shadow-xl active:bg-zinc-700 cursor-pointer"
              title="Exit Focus Mode (Esc)"
            >
              <Minimize2 className="w-4 h-4 text-amber-400" />
              <span>Exit Focus</span>
              <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400 font-mono">
                ESC
              </span>
            </motion.button>
          </div>
        </div>

        {/* Floating Spotify Dock when opened in Focus Theater */}
        {isSpotifyDockOpen && (
          <div className="relative z-30 max-w-md w-full mx-auto my-2">
            <SpotifyPlayer
              variant="focus-dock"
              isOpen={isSpotifyDockOpen}
              onClose={() => setIsSpotifyDockOpen(false)}
            />
          </div>
        )}

        {/* CENTERPIECE FOCUS COCKPIT */}
        <div className="relative z-20 flex flex-col items-center justify-center my-auto py-6 sm:py-8 max-w-xl w-full mx-auto text-center space-y-6 sm:space-y-8">
          {/* Circular Countdown Gauge */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 flex flex-col items-center justify-center">
            {/* SVG Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-zinc-900/80"
                strokeWidth="4.5"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke={selectedSubject.color || '#6366f1'}
                strokeWidth="4.5"
                strokeDasharray={276.46}
                strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-linear drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]"
              />
            </svg>

            {/* Monospace Countdown Digits */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <motion.span
                key={timeFormatted}
                initial={{ opacity: 0.9, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-6xl sm:text-7xl md:text-8xl font-black font-mono tracking-tighter text-white drop-shadow-[0_0_35px_rgba(255,255,255,0.2)]"
              >
                {timeFormatted}
              </motion.span>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-zinc-400 mt-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {progressPercent}% Completed • +{estimatedXp} XP
              </span>
            </div>
          </div>

          {/* MAIN TACTILE CONTROLS (Big, easy-to-press buttons) */}
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            {/* Reset Button */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={resetStudyTimer}
              className="p-4 rounded-3xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all shadow-xl"
              title="Reset Timer"
            >
              <RotateCcw className="w-6 h-6" />
            </motion.button>

            {/* Play / Pause Giant Action Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (studyTimer.isActive) {
                  pauseStudyTimer();
                } else {
                  startStudyTimer();
                }
              }}
              className="px-10 py-5 rounded-3xl font-black text-lg tracking-wider uppercase flex items-center gap-3 transition-all shadow-2xl cursor-pointer"
              style={{
                backgroundColor: studyTimer.isActive ? '#e11d48' : selectedSubject.color || '#4f46e5',
                boxShadow: `0 0 35px ${
                  studyTimer.isActive ? 'rgba(225, 29, 72, 0.4)' : `${selectedSubject.color}66`
                }`,
              }}
            >
              {studyTimer.isActive ? (
                <>
                  <Pause className="w-7 h-7 fill-white" />
                  <span>PAUSE</span>
                </>
              ) : (
                <>
                  <Play className="w-7 h-7 fill-white ml-0.5" />
                  <span>START FOCUS</span>
                </>
              )}
            </motion.button>

            {/* Finish Early Button */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={finishStudySessionEarly}
              className="p-4 rounded-3xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-400 transition-all shadow-xl"
              title="Finish Early & Claim XP"
            >
              <CheckCircle2 className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Quick Preset Selector Buttons */}
          <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
            {[15, 25, 45, 60, 90].map((mins) => {
              const isCurrentPreset =
                !studyTimer.isCustomMode && studyTimer.presetMinutes === mins;
              return (
                <button
                  key={mins}
                  onClick={() => {
                    sound.playClick();
                    setStudyTimerDuration(mins);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                    isCurrentPreset
                      ? 'bg-zinc-100 text-zinc-950 shadow-md font-extrabold'
                      : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
                  }`}
                >
                  {mins}m
                </button>
              );
            })}
          </div>
        </div>

        {/* BOTTOM DOCK: Notes Scratchpad & Shortcut Indicators */}
        <div className="relative z-20 max-w-2xl w-full mx-auto space-y-3">
          {/* Focused Notes Input */}
          <div className="relative">
            <input
              type="text"
              value={studyTimer.sessionNotes}
              onChange={(e) => setStudySessionNotes(e.target.value)}
              placeholder="Jot down quick session thoughts or formula notes (e.g. Chapter 4 HL Past Paper #3)..."
              className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-zinc-600 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-hidden transition-all shadow-lg"
            />
          </div>

          {/* Keyboard Helpers Bar */}
          <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono px-2">
            <div className="flex items-center gap-3">
              <span>
                <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-400">
                  SPACE
                </kbd>{' '}
                {studyTimer.isActive ? 'Pause' : 'Start'}
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-400">
                  ESC
                </kbd>{' '}
                Exit Focus
              </span>
            </div>
            <span className="text-zinc-400">IB Diploma G11 Lock-In Session</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
