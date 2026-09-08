import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Reward } from '../types';
import { formatNiceDate } from '../lib/dateUtils';
import { RewardModal } from './modals/RewardModal';
import {
  Gift,
  Plus,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
  History,
  ShoppingBag,
  Coins,
  Flame,
  Award,
} from 'lucide-react';
import { DynamicIcon } from './DynamicIcon';

export const RewardShopView: React.FC = () => {
  const {
    state,
    levelInfo,
    redeemReward,
    deleteReward,
  } = useApp();

  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [activeTab, setActiveTab] = useState<'shop' | 'history'>('shop');

  const handleRedeem = (reward: Reward) => {
    if (state.currentXP < reward.costXP) {
      alert(`You need ${reward.costXP - state.currentXP} more XP to unlock "${reward.title}"!`);
      return;
    }

    if (window.confirm(`Redeem "${reward.title}" for ${reward.costXP} XP?`)) {
      redeemReward(reward.id);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Top Banner & Wallet Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-6 bg-gradient-to-r from-zinc-900 via-amber-950/30 to-zinc-900 border border-zinc-800 rounded-2xl sm:rounded-3xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-extrabold text-2xl">
            🎁
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Tyler's XP Reward Shop
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                Spend Your XP
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Turn your focus and discipline into real-life gaming and personal rewards
            </p>
          </div>
        </div>

        {/* XP Wallet Balance Widget */}
        <div className="flex items-center gap-4 p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl">
          <div className="text-right">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
              Available Balance
            </span>
            <p className="text-2xl font-black text-amber-400 font-mono flex items-center justify-end gap-1">
              <span>⭐</span>
              <span>{state.currentXP.toLocaleString()}</span>
              <span className="text-xs text-zinc-400">XP</span>
            </p>
          </div>

          <div className="border-l border-zinc-800 pl-4 space-y-0.5 text-left">
            <span className="text-[10px] text-zinc-500 uppercase font-mono">Rank</span>
            <p className="text-sm font-bold text-white font-mono">LVL {levelInfo.level}</p>
          </div>
        </div>
      </div>

      {/* Navigation and Add Reward Button */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('shop')}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'shop'
                ? 'bg-amber-500 text-zinc-950 font-black shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Available Rewards ({state.rewards.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'history'
                ? 'bg-amber-500 text-zinc-950 font-black shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Redemption Log ({state.redeemedRewards.length})</span>
          </button>
        </div>

        <button
          onClick={() => {
            setEditingReward(null);
            setIsRewardModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-xl text-xs font-black shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Create Custom Reward</span>
        </button>
      </div>

      {/* SHOP CARDS GRID */}
      {activeTab === 'shop' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {state.rewards.map((reward) => {
            const canAfford = state.currentXP >= reward.costXP;
            const affordPercent = Math.min(100, Math.round((state.currentXP / reward.costXP) * 100));

            return (
              <div
                key={reward.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 group ${
                  canAfford
                    ? 'bg-zinc-900/90 border-zinc-800 hover:border-amber-500/50 hover:shadow-xl'
                    : 'bg-zinc-900/50 border-zinc-800/60'
                }`}
              >
                <div>
                  {/* Top Icon & Controls */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
                      <DynamicIcon name={reward.icon} className="w-6 h-6" />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingReward(reward);
                          setIsRewardModalOpen(true);
                        }}
                        className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                        title="Edit reward"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(`Delete reward "${reward.title}"?`)) deleteReward(reward.id);
                        }}
                        className="p-1.5 text-zinc-600 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Delete reward"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                        {reward.title}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400">
                        {reward.category}
                      </span>
                    </div>
                    {reward.description && (
                      <p className="text-xs text-zinc-400 leading-relaxed">{reward.description}</p>
                    )}
                  </div>
                </div>

                {/* Bottom Cost & Redeem Button */}
                <div className="pt-3 border-t border-zinc-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400">Cost:</span>
                    <span className="text-lg font-black font-mono text-amber-400 flex items-center gap-1">
                      ⭐ {reward.costXP.toLocaleString()} XP
                    </span>
                  </div>

                  {!canAfford && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                        <span>XP Progress</span>
                        <span>{state.currentXP} / {reward.costXP} ({affordPercent}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500/50 rounded-full"
                          style={{ width: `${affordPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={!canAfford}
                    className={`w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
                      canAfford
                        ? 'bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-md shadow-amber-500/20 active:scale-[0.98]'
                        : 'bg-zinc-800/60 text-zinc-500 cursor-not-allowed border border-zinc-800'
                    }`}
                  >
                    {canAfford ? (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>REDEEM REWARD</span>
                      </>
                    ) : (
                      <span>Need {reward.costXP - state.currentXP} more XP</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REDEMPTION LOG TAB */}
      {activeTab === 'history' && (
        <div className="p-6 bg-zinc-900/90 border border-zinc-800 rounded-3xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            Reward Redemption History
          </h3>

          {state.redeemedRewards.length === 0 ? (
            <div className="p-8 text-center bg-zinc-950 border border-zinc-800 rounded-2xl">
              <p className="text-sm text-zinc-400">No rewards redeemed yet. Complete tasks and study sessions to earn XP!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {state.redeemedRewards.map((redemption) => (
                <div
                  key={redemption.id}
                  className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{redemption.title}</p>
                      <p className="text-xs text-zinc-500 font-mono">Redeemed on {formatNiceDate(redemption.date)}</p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    -{redemption.costXP} XP
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reward Modal */}
      <RewardModal
        isOpen={isRewardModalOpen}
        onClose={() => {
          setIsRewardModalOpen(false);
          setEditingReward(null);
        }}
        rewardToEdit={editingReward}
      />
    </div>
  );
};
