import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTodayString, formatNiceDate } from '../lib/dateUtils';
import {
  ShieldBan,
  CheckCircle2,
  Sparkles,
  Award,
  Flame,
  MessageSquare,
  Lock,
  Trophy,
  Calendar,
  Check,
  Send,
  HeartHandshake,
} from 'lucide-react';

export const DiscordBreakView: React.FC = () => {
  const {
    state,
    discordFreeDaysCount,
    isDiscordFreeToday,
    toggleDiscordCheckIn,
    addDiscordReflection,
  } = useApp();

  const [reflectionInput, setReflectionInput] = useState('');
  const today = getTodayString();

  const totalGoalDays = state.discordBreak.targetDays || 30;
  const daysCompleted = discordFreeDaysCount;
  const daysRemaining = Math.max(0, totalGoalDays - daysCompleted);
  const progressPercent = Math.min(100, Math.round((daysCompleted / totalGoalDays) * 100));

  const handleSendReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionInput.trim()) return;
    addDiscordReflection(reflectionInput.trim());
    setReflectionInput('');
  };

  // Milestone definition
  const milestones = [
    { day: 7, label: '1 Week Clear', xp: 50, reward: 'Bronze Focus Badge' },
    { day: 14, label: 'Halfway Mark', xp: 100, reward: 'Silver Discipline Crest' },
    { day: 21, label: '3 Weeks Strong', xp: 150, reward: 'Gold Mental Fortitude' },
    { day: 30, label: '30-Day Master', xp: 250, reward: '👑 Diamond Discord Break Trophy' },
  ];

  // Motivational quote based on progress
  const getMotivation = () => {
    if (daysCompleted >= 30) return "👑 Incredble achievement! You mastered the 30-Day Discord break.";
    if (daysCompleted >= 21) return "🔥 Almost there! The mental clarity and study momentum are at peak levels.";
    if (daysCompleted >= 14) return "⚡ Past the halfway mark! Your focus habits are solidified.";
    if (daysCompleted >= 7) return "🌟 One full week down. Real habit transformation is happening.";
    return "🚀 Every day without distractions is an investment in your IB Grade 11 success.";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-zinc-900 via-violet-950/40 to-zinc-900 border border-violet-800/40 rounded-3xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/20 text-violet-400 border border-violet-500/30 flex items-center justify-center font-extrabold text-2xl shrink-0">
            <ShieldBan className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                One-Month Discord Break
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-bold text-violet-300 bg-violet-500/20 border border-violet-500/30 rounded-lg">
                Focus Lock-In
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-xl">
              {getMotivation()}
            </p>
          </div>
        </div>

        {/* Check in Action Button */}
        <button
          onClick={() => toggleDiscordCheckIn(today)}
          className={`px-6 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2.5 transition-all shadow-xl ${
            isDiscordFreeToday
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
              : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/30 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {isDiscordFreeToday ? (
            <>
              <Check className="w-5 h-5 text-emerald-400 stroke-[3]" />
              <span>Checked in Today! (+25 XP Earned)</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Check In For Today (+25 XP)</span>
            </>
          )}
        </button>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Completed Days</span>
          <p className="text-3xl font-black text-white font-mono mt-1">
            {daysCompleted} <span className="text-sm font-semibold text-violet-400">/ {totalGoalDays} days</span>
          </p>
          <div className="w-full h-2 bg-zinc-950 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-indigo-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Days Remaining</span>
          <p className="text-3xl font-black text-white font-mono mt-1">
            {daysRemaining} <span className="text-sm font-semibold text-zinc-500">days left</span>
          </p>
          <p className="text-xs text-zinc-400 mt-2 font-mono">Completion: {progressPercent}% done</p>
        </div>

        <div className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">XP Earned from Break</span>
          <p className="text-3xl font-black text-amber-400 font-mono mt-1">
            +{(daysCompleted * 25).toLocaleString()} <span className="text-xs text-zinc-400">XP</span>
          </p>
          <p className="text-xs text-zinc-400 mt-2 font-mono">
            +250 XP bonus on Day 30 completion!
          </p>
        </div>
      </div>

      {/* 30-Day Grid Visual Matrix */}
      <div className="p-6 bg-zinc-900/90 border border-zinc-800 rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-violet-400" />
              30-Day Journey Matrix
            </h3>
            <p className="text-xs text-zinc-400">Each block represents one day of focus and discipline</p>
          </div>
          <span className="text-xs font-mono font-bold text-violet-400 bg-violet-500/10 px-3 py-1 rounded-xl border border-violet-500/20">
            {daysCompleted} / 30 Checked
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2.5 pt-2">
          {Array.from({ length: totalGoalDays }).map((_, idx) => {
            const dayNum = idx + 1;
            const isCompleted = dayNum <= daysCompleted;
            const isCurrent = dayNum === daysCompleted + 1 && !isDiscordFreeToday;

            return (
              <div
                key={dayNum}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-between min-h-[75px] transition-all ${
                  isCompleted
                    ? 'bg-violet-950/40 border-violet-600/50 text-white shadow-xs'
                    : isCurrent
                    ? 'bg-zinc-950 border-violet-500/60 ring-2 ring-violet-500/30'
                    : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-600'
                }`}
              >
                <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">
                  Day {dayNum}
                </span>

                <div className="my-1">
                  {isCompleted ? (
                    <div className="w-6 h-6 rounded-full bg-violet-500 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                      <Lock className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <span className="text-[9px] font-mono font-bold text-amber-400/80">
                  {isCompleted ? '+25 XP' : '25 XP'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestones & Reflection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Milestones (5 cols) */}
        <div className="lg:col-span-5 p-6 bg-zinc-900/90 border border-zinc-800 rounded-3xl space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Milestone Rewards
          </h3>

          <div className="space-y-3">
            {milestones.map((m) => {
              const reached = daysCompleted >= m.day;
              return (
                <div
                  key={m.day}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    reached
                      ? 'bg-amber-950/20 border-amber-500/40 text-white'
                      : 'bg-zinc-950 border-zinc-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        reached ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-900 text-zinc-600'
                      }`}
                    >
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-white">{m.label}</p>
                      <p className="text-[11px] text-zinc-400 font-mono">{m.reward}</p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    +{m.xp} XP
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reflection Journal Area (7 cols) */}
        <div className="lg:col-span-7 p-6 bg-zinc-900/90 border border-zinc-800 rounded-3xl space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-violet-400" />
            Focus & Mental Clarity Journal
          </h3>

          {/* New reflection input */}
          <form onSubmit={handleSendReflection} className="flex gap-2">
            <input
              type="text"
              value={reflectionInput}
              onChange={(e) => setReflectionInput(e.target.value)}
              placeholder="How do you feel today without Discord notifications? e.g. Finished German revision with no interruptions..."
              className="flex-1 px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-violet-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Log</span>
            </button>
          </form>

          {/* Journal Entries List */}
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {(!state.discordBreak.reflections || state.discordBreak.reflections.length === 0) ? (
              <p className="text-xs text-zinc-500 italic py-4 text-center">No reflections logged yet. Share your thoughts on focus!</p>
            ) : (
              state.discordBreak.reflections.map((ref) => (
                <div
                  key={ref.id}
                  className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                    <span className="text-violet-400 font-bold">Day {ref.dayNumber || 1} Reflection</span>
                    <span>{formatNiceDate(ref.date)}</span>
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed">{ref.text || ref.note || ''}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
