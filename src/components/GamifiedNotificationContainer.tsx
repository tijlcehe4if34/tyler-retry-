import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GamifiedNotification } from '../types';
import {
  CheckCircle2,
  Flame,
  Crown,
  Trophy,
  BookOpen,
  Gift,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { DynamicIcon } from './DynamicIcon';

interface GamifiedNotificationContainerProps {
  notifications: GamifiedNotification[];
  onDismiss: (id: string) => void;
  onNotificationClick?: (notification: GamifiedNotification) => void;
}

export const GamifiedNotificationContainer: React.FC<GamifiedNotificationContainerProps> = ({
  notifications,
  onDismiss,
  onNotificationClick,
}) => {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => {
          const isStreak = notif.type === 'streak_maintained';
          const isLevelUp = notif.type === 'level_up';
          const isAchievement = notif.type === 'achievement_unlock';
          const isTask = notif.type === 'task_complete';
          const isStudy = notif.type === 'study_complete';
          const isReward = notif.type === 'reward_redeem';
          const isDiscord = notif.type === 'discord_checkin';

          // Color & theme styling based on notification archetype
          let borderClass = 'border-zinc-800 bg-zinc-950/95';
          let glowClass = 'shadow-xl';
          let iconBg = 'bg-zinc-900 text-indigo-400 border-zinc-700';

          if (isStreak) {
            borderClass = 'border-orange-500/60 bg-linear-to-r from-zinc-950 via-zinc-900 to-orange-950/40';
            glowClass = 'shadow-[0_0_25px_rgba(249,115,22,0.35)]';
            iconBg = 'bg-orange-500/20 text-orange-400 border-orange-500/40 animate-pulse';
          } else if (isLevelUp) {
            borderClass = 'border-amber-400/80 bg-linear-to-r from-zinc-950 via-zinc-900 to-amber-950/40';
            glowClass = 'shadow-[0_0_30px_rgba(245,158,11,0.4)]';
            iconBg = 'bg-amber-500/20 text-amber-300 border-amber-400/50';
          } else if (isAchievement) {
            borderClass = 'border-yellow-500/70 bg-linear-to-r from-zinc-950 via-yellow-950/20 to-zinc-900';
            glowClass = 'shadow-[0_0_25px_rgba(234,179,8,0.35)]';
            iconBg = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
          } else if (isTask) {
            borderClass = 'border-emerald-500/50 bg-zinc-950/95';
            glowClass = 'shadow-[0_0_20px_rgba(16,185,129,0.2)]';
            iconBg = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
          } else if (isStudy) {
            borderClass = 'border-indigo-500/50 bg-zinc-950/95';
            glowClass = 'shadow-[0_0_20px_rgba(99,102,241,0.25)]';
            iconBg = 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
          } else if (isReward) {
            borderClass = 'border-rose-500/50 bg-zinc-950/95';
            glowClass = 'shadow-[0_0_20px_rgba(244,63,94,0.25)]';
            iconBg = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
          } else if (isDiscord) {
            borderClass = 'border-blue-500/50 bg-zinc-950/95';
            glowClass = 'shadow-[0_0_20px_rgba(59,130,246,0.25)]';
            iconBg = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
          }

          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: -20, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.85, x: 40 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => onNotificationClick?.(notif)}
              className={`pointer-events-auto relative overflow-hidden rounded-2xl border p-4 backdrop-blur-xl ${borderClass} ${glowClass} cursor-pointer transition-all hover:scale-[1.02]`}
            >
              {/* Dynamic Animated Background Shimmer for High Tier Notifs */}
              {(isLevelUp || isAchievement || isStreak) && (
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              )}

              <div className="flex items-start gap-3 relative z-10">
                {/* Icon Container */}
                <div className={`p-2.5 rounded-xl border shrink-0 flex items-center justify-center ${iconBg}`}>
                  {notif.icon ? (
                    <DynamicIcon name={notif.icon} className="w-5 h-5" />
                  ) : isStreak ? (
                    <Flame className="w-5 h-5 text-orange-400" />
                  ) : isLevelUp ? (
                    <Crown className="w-5 h-5 text-amber-300" />
                  ) : isAchievement ? (
                    <Trophy className="w-5 h-5 text-yellow-400" />
                  ) : isTask ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : isStudy ? (
                    <BookOpen className="w-5 h-5 text-indigo-400" />
                  ) : isReward ? (
                    <Gift className="w-5 h-5 text-rose-400" />
                  ) : isDiscord ? (
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                  )}
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0 pr-6">
                  {/* Top Badge/Category Tag */}
                  <div className="flex items-center gap-2 mb-0.5">
                    {notif.badgeText && (
                      <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
                        {notif.badgeText}
                      </span>
                    )}
                    {isStreak && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 font-mono flex items-center gap-1">
                        <Flame className="w-3 h-3" /> Streak Active
                      </span>
                    )}
                    {isLevelUp && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1">
                        <Crown className="w-3 h-3" /> Level Up
                      </span>
                    )}
                    {isAchievement && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-yellow-400 font-mono flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> Trophy Unlocked
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h4 className="text-sm font-black text-white truncate tracking-tight">
                    {notif.title}
                  </h4>

                  {/* Subtitle */}
                  {notif.subtitle && (
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">
                      {notif.subtitle}
                    </p>
                  )}

                  {/* XP Reward Badge */}
                  {typeof notif.xpChange === 'number' && notif.xpChange !== 0 && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-black font-mono ${
                          notif.xpChange > 0
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs shadow-amber-500/20'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        <Zap className="w-3 h-3" />
                        {notif.xpChange > 0 ? `+${notif.xpChange} XP` : `${notif.xpChange} XP`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss(notif.id);
                  }}
                  className="absolute top-3 right-3 p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                  title="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Animated Timeout Progress Bar */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: (notif.duration || 4500) / 1000, ease: 'linear' }}
                className={`absolute bottom-0 left-0 h-0.5 ${
                  isStreak
                    ? 'bg-orange-500'
                    : isLevelUp
                    ? 'bg-amber-400'
                    : isAchievement
                    ? 'bg-yellow-400'
                    : isTask
                    ? 'bg-emerald-400'
                    : 'bg-indigo-500'
                }`}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
