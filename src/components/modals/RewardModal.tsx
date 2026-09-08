import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { RewardItem } from '../../types';
import { X, Trash2, Gift, Sparkles, Tag } from 'lucide-react';
import { DynamicIcon } from '../DynamicIcon';

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewardToEdit?: RewardItem | null;
}

const ICON_OPTIONS = ['Gamepad2', 'Film', 'Pizza', 'Coffee', 'Sparkles', 'Trophy', 'Music', 'Tv', 'ShoppingBag', 'Smile'];

export const RewardModal: React.FC<RewardModalProps> = ({ isOpen, onClose, rewardToEdit }) => {
  const { addReward, updateReward, deleteReward } = useApp();

  const [title, setTitle] = useState('');
  const [costXP, setCostXP] = useState(100);
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Gamepad2');
  const [category, setCategory] = useState('Gaming');

  useEffect(() => {
    if (rewardToEdit) {
      setTitle(rewardToEdit.title);
      setCostXP(rewardToEdit.costXP);
      setDescription(rewardToEdit.description);
      setIcon(rewardToEdit.icon);
      setCategory(rewardToEdit.category || 'Custom');
    } else {
      setTitle('');
      setCostXP(100);
      setDescription('');
      setIcon('Gamepad2');
      setCategory('Gaming');
    }
  }, [rewardToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      costXP: Math.max(10, Number(costXP)),
      description: description.trim(),
      icon,
      category,
    };

    if (rewardToEdit) {
      updateReward(rewardToEdit.id, payload);
    } else {
      addReward(payload);
    }
    onClose();
  };

  const handleDelete = () => {
    if (rewardToEdit && window.confirm('Delete this reward?')) {
      deleteReward(rewardToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Gift className="w-4 h-4" />
            </span>
            {rewardToEdit ? 'Edit Reward' : 'Create Custom Reward'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Reward Name *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 30 extra minutes Minecraft, Watch a movie"
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> XP Cost *
            </label>
            <input
              type="number"
              min="10"
              max="5000"
              step="10"
              required
              value={costXP}
              onChange={(e) => setCostXP(parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-amber-400 font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What do you get when unlocking this reward?"
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-zinc-400" /> Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="Gaming">🎮 Gaming</option>
                <option value="Entertainment">🍿 Entertainment</option>
                <option value="Food">🍕 Food / Snacks</option>
                <option value="Relax">☕ Relax & Free Time</option>
                <option value="Custom">✨ Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Icon
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {ICON_OPTIONS.map((ico) => (
                  <button
                    key={ico}
                    type="button"
                    onClick={() => setIcon(ico)}
                    className={`p-2 rounded-lg border transition-all ${
                      icon === ico
                        ? 'bg-amber-500/20 border-amber-400 text-amber-400'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <DynamicIcon name={ico} className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            {rewardToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 rounded-xl hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {rewardToEdit ? 'Save Changes' : 'Create Reward'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
