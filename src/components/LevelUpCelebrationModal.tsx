import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Sparkles, Trophy, ArrowRight, Zap } from 'lucide-react';
import { fireSuperConfetti } from '../lib/confetti';
import { sound } from '../lib/sound';

interface LevelUpCelebrationModalProps {
  isOpen: boolean;
  level: number;
  xpEarned?: number;
  onClose: () => void;
  onViewRewards: () => void;
}

export const LevelUpCelebrationModal: React.FC<LevelUpCelebrationModalProps> = ({
  isOpen,
  level,
  onClose,
  onViewRewards,
}) => {
  if (!isOpen) return null;

  const getRankTitle = (lvl: number) => {
    if (lvl >= 20) return 'Mythic Grandmaster';
    if (lvl >= 15) return 'Apex IB Scholar';
    if (lvl >= 10) return 'Master Lock-In Legend';
    if (lvl >= 8) return 'Veteran Scholar';
    if (lvl >= 5) return 'Rising Scholar';
    if (lvl >= 3) return 'Dedicated Disciple';
    if (lvl >= 2) return 'Focused Initiate';
    return 'Novice Scholar';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative w-full max-w-md bg-zinc-950 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden"
        >
          {/* Animated Background Aura */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Floating Badge */}
          <motion.div
            initial={{ rotate: -10, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest mb-4"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>Rank Progression Unlocked</span>
          </motion.div>

          {/* Crown & Level Graphic */}
          <div className="relative my-4 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-24 h-24 rounded-3xl bg-linear-to-tr from-amber-600 via-amber-400 to-yellow-300 p-0.5 shadow-2xl flex items-center justify-center"
            >
              <div className="w-full h-full bg-zinc-950 rounded-[22px] flex flex-col items-center justify-center border border-amber-400/30">
                <Crown className="w-8 h-8 text-amber-400 mb-0.5 animate-pulse" />
                <span className="text-[10px] uppercase font-mono font-bold text-zinc-400 tracking-wider">
                  LVL
                </span>
                <span className="text-2xl font-black font-mono text-white leading-none">
                  {level}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Title & Rank Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2 mt-4"
          >
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              LEVEL <span className="text-amber-400">{level}</span> REACHED!
            </h2>
            <p className="text-sm font-bold text-amber-300 font-mono flex items-center justify-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              New Rank: {getRankTitle(level)}
            </p>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto mt-2">
              Your dedication is paying off. New rewards, achievements, and bragging rights are unlocked.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 mt-8"
          >
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="flex-1 py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all"
            >
              Keep Locking In
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
                onViewRewards();
              }}
              className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-1.5"
            >
              <span>Reward Shop</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
