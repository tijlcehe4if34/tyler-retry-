import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatMinutes, formatNiceDate, getTodayString } from '../lib/dateUtils';
import { sound } from '../lib/sound';
import { SubjectModal } from './modals/SubjectModal';
import { SpotifyPlayer } from './SpotifyPlayer';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  BookOpen,
  Plus,
  BarChart2,
  Clock,
  CheckCircle,
  Flame,
  Award,
  Edit2,
  Zap,
  Minimize2,
  X,
  Calendar,
} from 'lucide-react';
import { DynamicIcon } from './DynamicIcon';
import { Subject } from '../types';

export const StudyTimerView: React.FC = () => {
  const {
    state,
    studyTimer,
    startStudyTimer,
    pauseStudyTimer,
    resetStudyTimer,
    setStudyTimerDuration,
    setStudySubjectId,
    setStudySessionNotes,
    setCustomMinutesInput,
    finishStudySessionEarly,
    toggleFocusMode,
    isFocusMode,
    addStudySession,
  } = useApp();

  const [customInput, setCustomInput] = useState<number>(studyTimer.customMinutesInput || 45);

  // Offline study logging without timer
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualSubjectId, setManualSubjectId] = useState<string>(
    state.subjects[0]?.id || 'sub_design'
  );
  const [manualMinutes, setManualMinutes] = useState<number>(45);
  const [manualDate, setManualDate] = useState<string>(getTodayString());
  const [manualNotes, setManualNotes] = useState<string>('');

  // Subject management modal
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const selectedSubject =
    state.subjects.find((s) => s.id === studyTimer.selectedSubjectId) ||
    state.subjects[0] || {
      id: 'sub_math',
      name: 'Mathematics',
      color: '#6366f1',
      icon: 'BookOpen',
    };

  // Set preset timer
  const handleSelectPreset = (mins: number) => {
    sound.playClick();
    setStudyTimerDuration(mins, false);
  };

  const handleApplyCustom = () => {
    const mins = Math.max(1, Math.min(240, Number(customInput) || 25));
    sound.playClick();
    setCustomMinutesInput(mins);
    setStudyTimerDuration(mins, true);
  };

  // Format MM:SS
  const displayMinutes = Math.floor(studyTimer.secondsRemaining / 60);
  const displaySeconds = studyTimer.secondsRemaining % 60;
  const timeFormatted = `${String(displayMinutes).padStart(2, '0')}:${String(
    displaySeconds
  ).padStart(2, '0')}`;

  // Progress percentage
  const progressPercent =
    studyTimer.initialDurationSeconds > 0
      ? Math.round(
          ((studyTimer.initialDurationSeconds - studyTimer.secondsRemaining) /
            studyTimer.initialDurationSeconds) *
            100
        )
      : 0;

  // Study statistics calculations
  const today = getTodayString();
  const todayMinutes = state.studySessions
    .filter((s) => s.date === today)
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  // Past 7 days (weekly)
  const nowMs = Date.now();
  const weeklyMinutes = state.studySessions
    .filter((s) => nowMs - s.timestamp <= 7 * 86400000)
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  const totalAllTimeMinutes = state.studySessions.reduce(
    (acc, s) => acc + s.durationMinutes,
    0
  );

  // Subject breakdown
  const subjectTimeMap: Record<string, number> = {};
  state.studySessions.forEach((s) => {
    subjectTimeMap[s.subjectId] =
      (subjectTimeMap[s.subjectId] || 0) + s.durationMinutes;
  });

  const xpPer25 = state.settings.xpRules.xpPer25MinStudy || 10;
  const estimatedXp = Math.max(
    5,
    Math.round((studyTimer.initialDurationSeconds / (25 * 60)) * xpPer25)
  );

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Top Banner & Header with Focus Mode Call-to-Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl sm:rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Timer className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>IB Study Timer & Focus Tracker</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Focused study blocks earn XP and build your academic streak
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Action: Log Study Without Timer */}
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-950/40 border border-emerald-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <BookOpen className="w-4 h-4" />
            <span>Log Study (No Timer)</span>
          </button>

          {/* Focus Mode Trigger Pill */}
          <button
            onClick={() => toggleFocusMode(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-zinc-950" />
            <span>Launch Focus Theater</span>
          </button>

          {/* Quick subject add */}
          <button
            onClick={() => {
              setEditingSubject(null);
              setIsSubjectModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        </div>
      </div>

      {/* Main Study Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Timer Display & Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 bg-zinc-900/90 border border-zinc-800 rounded-3xl flex flex-col items-center justify-center space-y-6 text-center shadow-xl relative overflow-hidden">
            {/* Subject Selector Pills */}
            <div className="w-full flex items-center justify-center gap-2 flex-wrap">
              {state.subjects.map((sub) => {
                const isSelected = sub.id === studyTimer.selectedSubjectId;
                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      sound.playClick();
                      setStudySubjectId(sub.id);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'text-white shadow-md scale-105'
                        : 'bg-zinc-950/80 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                    style={{
                      backgroundColor: isSelected ? sub.color : undefined,
                      borderColor: isSelected ? sub.color : undefined,
                    }}
                  >
                    <DynamicIcon
                      name={sub.icon || 'BookOpen'}
                      className="w-3.5 h-3.5"
                    />
                    <span>{sub.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Circular Timer Visual */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
              {/* Outer Glow & Track */}
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="stroke-zinc-800"
                  strokeWidth="5"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  stroke={selectedSubject?.color || '#6366f1'}
                  strokeWidth="5"
                  strokeDasharray={276.46}
                  strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-300 drop-shadow-md"
                />
              </svg>

              {/* Time in Center */}
              <div className="absolute flex flex-col items-center justify-center space-y-1">
                <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                  {timeFormatted}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                  {selectedSubject?.name || 'Studying'}
                </span>
                <span className="text-[11px] font-bold text-amber-400 font-mono">
                  +{estimatedXp} XP upon finish
                </span>
              </div>
            </div>

            {/* Preset Buttons */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {[
                { mins: 15, label: '15m Quick Drill' },
                { mins: 25, label: '25m Pomodoro' },
                { mins: 50, label: '50m Deep Work' },
                { mins: 90, label: '90m Exam Block' },
              ].map(({ mins, label }) => (
                <button
                  key={mins}
                  onClick={() => handleSelectPreset(mins)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                    !studyTimer.isCustomMode && studyTimer.presetMinutes === mins
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}

              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={customInput}
                  onChange={(e) => setCustomInput(parseInt(e.target.value) || 25)}
                  className="w-12 px-2 py-1 bg-zinc-900 rounded-lg text-xs font-mono text-center text-white focus:outline-hidden"
                />
                <button
                  onClick={handleApplyCustom}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    studyTimer.isCustomMode
                      ? 'bg-indigo-600 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            {/* Session Notes Input */}
            <input
              type="text"
              value={studyTimer.sessionNotes}
              onChange={(e) => setStudySessionNotes(e.target.value)}
              placeholder="Session notes: e.g. German Konjunktiv II drills, Calculus p.84..."
              className="w-full max-w-md px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 text-xs focus:outline-hidden focus:border-indigo-500 text-center"
            />

            {/* Timer Control Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={resetStudyTimer}
                className="p-3 text-zinc-400 hover:text-white rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 transition-colors"
                title="Reset Timer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  if (studyTimer.isActive) {
                    pauseStudyTimer();
                  } else {
                    startStudyTimer();
                  }
                }}
                className={`px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                  studyTimer.isActive
                    ? 'bg-amber-500 text-zinc-950 shadow-amber-500/30'
                    : 'bg-indigo-600 text-white shadow-indigo-600/30 hover:bg-indigo-500'
                }`}
              >
                {studyTimer.isActive ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    <span>PAUSE FOCUS</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>START SESSION</span>
                  </>
                )}
              </button>

              {studyTimer.isActive && (
                <button
                  onClick={finishStudySessionEarly}
                  className="px-4 py-3 text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-2xl transition-colors cursor-pointer"
                  title="Finish and log time now"
                >
                  Log Now
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right 5 cols: Study Stats & Subjects */}
        <div className="lg:col-span-5 space-y-6">
          {/* Summary Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
              <span className="text-xs font-bold text-zinc-400 uppercase">
                Today
              </span>
              <p className="text-2xl font-black text-white font-mono mt-1">
                {formatMinutes(todayMinutes)}
              </p>
              <span className="text-[10px] text-indigo-400 font-semibold font-mono">
                Goal: {formatMinutes(state.settings.studyGoals.dailyTargetMinutes)}
              </span>
            </div>

            <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
              <span className="text-xs font-bold text-zinc-400 uppercase">
                This Week
              </span>
              <p className="text-2xl font-black text-white font-mono mt-1">
                {formatMinutes(weeklyMinutes)}
              </p>
              <span className="text-[10px] text-zinc-500 font-mono">
                Total: {formatMinutes(totalAllTimeMinutes)}
              </span>
            </div>
          </div>

          {/* Time Spent by Subject */}
          <div className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
                Study Time by Subject
              </h3>
            </div>

            <div className="space-y-3">
              {state.subjects.map((sub) => {
                const subMins = subjectTimeMap[sub.id] || 0;
                const percent =
                  totalAllTimeMinutes > 0
                    ? Math.round((subMins / totalAllTimeMinutes) * 100)
                    : 0;

                return (
                  <div key={sub.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: sub.color }}
                        />
                        <span className="font-semibold text-white">
                          {sub.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-zinc-300 font-bold">
                          {formatMinutes(subMins)}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          ({percent}%)
                        </span>
                        <button
                          onClick={() => {
                            setEditingSubject(sub);
                            setIsSubjectModalOpen(true);
                          }}
                          className="p-1 text-zinc-600 hover:text-white transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: sub.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tyler's Study Music Playlist */}
          <SpotifyPlayer variant="inline" />

          {/* Recent Study Sessions History Log */}
          <div className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-3xl space-y-3">
            <h3 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Recent Study Sessions
            </h3>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {state.studySessions.slice(0, 5).map((sess) => {
                const sub = state.subjects.find((s) => s.id === sess.subjectId);
                const isManual = sess.method === 'manual' || !!sess.loggedWithoutTimer;
                return (
                  <div
                    key={sess.id}
                    className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: sub?.color || '#6366f1' }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-white truncate">
                            {sub?.name || 'Subject'}
                          </p>
                          {isManual ? (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 shrink-0">
                              Offline
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 shrink-0">
                              Timer
                            </span>
                          )}
                        </div>
                        {sess.notes && (
                          <p className="text-[10px] text-zinc-400 truncate">
                            {sess.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                      <span className="text-zinc-300 font-bold">
                        {formatMinutes(sess.durationMinutes)}
                      </span>
                      <span className="text-amber-400 text-[10px]">
                        +{sess.xpEarned} XP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Manual Study Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 text-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Log Study (Without Timer)</h3>
                  <p className="text-xs text-zinc-400">Record independent offline study or homework</p>
                </div>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (manualMinutes <= 0) return;
                const xpPer25 = state.settings.xpRules.xpPer25MinStudy || 10;
                const xpEarned = Math.max(5, Math.round((manualMinutes / 25) * xpPer25));
                addStudySession({
                  date: manualDate || getTodayString(),
                  subjectId: manualSubjectId,
                  durationMinutes: manualMinutes,
                  notes: manualNotes.trim() || undefined,
                  xpEarned,
                  method: 'manual',
                  loggedWithoutTimer: true,
                });
                setIsManualModalOpen(false);
                setManualNotes('');
                setManualMinutes(45);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  IB Subject
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {state.subjects.map((sub) => (
                    <button
                      type="button"
                      key={sub.id}
                      onClick={() => setManualSubjectId(sub.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        manualSubjectId === sub.id
                          ? 'bg-zinc-800 border-indigo-500 text-white'
                          : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: sub.color }} />
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold truncate leading-tight">{sub.name}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">{sub.code || ''} {sub.level ? `(${sub.level})` : ''}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    Date Studied
                  </label>
                  <input
                    type="date"
                    value={manualDate}
                    max={getTodayString()}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-mono focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="600"
                    step="5"
                    value={manualMinutes}
                    onChange={(e) => setManualMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <span className="text-[11px] text-zinc-500 mb-1.5 block">Quick Duration Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[15, 25, 30, 45, 60, 90, 120].map((mins) => (
                    <button
                      type="button"
                      key={mins}
                      onClick={() => setManualMinutes(mins)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                        manualMinutes === mins
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-750'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Topics Covered / Study Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="e.g., German B oral presentation practice, Math AI calculus problem set..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-600 focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg border border-emerald-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Confirm & Log Study
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Edit/Create Modal */}
      <SubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => {
          setIsSubjectModalOpen(false);
          setEditingSubject(null);
        }}
        subjectToEdit={editingSubject}
      />
    </div>
  );
};
