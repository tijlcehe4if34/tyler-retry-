import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Achievement } from '../types';
import { formatNiceDate } from '../lib/dateUtils';
import {
  Trophy,
  Award,
  Sparkles,
  Lock,
  CheckCircle2,
  Flame,
  Star,
  Zap,
} from 'lucide-react';
import { DynamicIcon } from './DynamicIcon';

export const AchievementsView: React.FC = () => {
  const { state } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const unlockedCount = state.achievements.filter((a) => !!a.unlocked || !!a.unlockedAt).length;
  const totalCount = state.achievements.length;
  const totalXpFromBadges = state.achievements
    .filter((a) => !!a.unlocked || !!a.unlockedAt)
    .reduce((acc, a) => acc + a.xpReward, 0);

  const filteredAchievements = state.achievements.filter((a) => {
    const cat = a.category || a.requirementType || 'general';
    if (selectedCategory !== 'all' && cat !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-zinc-900 via-amber-950/30 to-zinc-900 border border-zinc-800 rounded-3xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-2xl">
            🏆
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Tyler's Trophy Room
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg font-mono">
                {unlockedCount} / {totalCount} Badges
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Milestone achievements across IB study sessions, gaming self-control & streaks
            </p>
          </div>
        </div>

        {/* Badge XP bonus total */}
        <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-right flex items-center gap-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-zinc-500">Badge XP Earned</span>
            <p className="text-xl font-black text-amber-400 font-mono">+{totalXpFromBadges.toLocaleString()} XP</p>
          </div>
          <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {['all', 'streak', 'study', 'discord', 'tasks', 'gaming'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl capitalize transition-all ${
              selectedCategory === cat
                ? 'bg-amber-500 text-zinc-950 font-black shadow-xs'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAchievements.map((ach) => {
          const isUnlocked = !!ach.unlocked || !!ach.unlockedAt;
          const currentProgress = ach.progress ?? (isUnlocked ? ach.requirementValue : 0);
          const maxVal = ach.maxProgress ?? ach.requirementValue ?? 1;
          const progressPercent = Math.min(100, Math.round((currentProgress / maxVal) * 100));
          const catName = ach.category || ach.requirementType || 'general';
          const unlockedDateStr = ach.unlockedDate || ach.unlockedAt;

          return (
            <div
              key={ach.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                isUnlocked
                  ? 'bg-zinc-900/90 border-amber-500/40 shadow-lg shadow-amber-500/5'
                  : 'bg-zinc-900/40 border-zinc-800/60 opacity-70'
              }`}
            >
              <div>
                {/* Icon & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`p-3 rounded-2xl border ${
                      isUnlocked
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 ring-4 ring-amber-500/10'
                        : 'bg-zinc-950 text-zinc-600 border-zinc-800'
                    }`}
                  >
                    <DynamicIcon name={ach.icon} className="w-7 h-7" />
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                      +{ach.xpReward} XP
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase font-mono mt-1">
                      {catName}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="mt-3 space-y-1">
                  <h3
                    className={`text-base font-extrabold flex items-center gap-1.5 ${
                      isUnlocked ? 'text-white' : 'text-zinc-400'
                    }`}
                  >
                    {ach.title}
                    {isUnlocked && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{ach.description}</p>
                </div>
              </div>

              {/* Progress or Unlocked Timestamp */}
              <div className="pt-3 border-t border-zinc-800/80">
                {isUnlocked ? (
                  <div className="flex items-center justify-between text-xs font-mono text-emerald-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> UNLOCKED
                    </span>
                    {unlockedDateStr && (
                      <span className="text-[11px] text-zinc-500">{formatNiceDate(unlockedDateStr)}</span>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono text-zinc-400">
                      <span className="flex items-center gap-1 text-zinc-500">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                      <span>{currentProgress} / {maxVal}</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
