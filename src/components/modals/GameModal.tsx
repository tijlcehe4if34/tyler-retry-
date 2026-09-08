import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { GameItem } from '../../types';
import { X, Trash2, Gamepad2, Palette, Clock } from 'lucide-react';
import { DynamicIcon } from '../DynamicIcon';

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameToEdit?: GameItem | null;
}

const COLOR_OPTIONS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444', '#06b6d4'];
const ICON_OPTIONS = ['Box', 'Trophy', 'Activity', 'Gamepad2', 'Crosshair', 'Flame', 'Sparkles', 'Zap'];

export const GameModal: React.FC<GameModalProps> = ({ isOpen, onClose, gameToEdit }) => {
  const { addGame, updateGame, deleteGame } = useApp();

  const [name, setName] = useState('');
  const [dailyLimitMinutes, setDailyLimitMinutes] = useState(60);
  const [color, setColor] = useState('#10b981');
  const [icon, setIcon] = useState('Gamepad2');

  useEffect(() => {
    if (gameToEdit) {
      setName(gameToEdit.name);
      setDailyLimitMinutes(gameToEdit.dailyLimitMinutes || 60);
      setColor(gameToEdit.color);
      setIcon(gameToEdit.icon || 'Gamepad2');
    } else {
      setName('');
      setDailyLimitMinutes(60);
      setColor('#10b981');
      setIcon('Gamepad2');
    }
  }, [gameToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      dailyLimitMinutes: Math.max(15, Number(dailyLimitMinutes)),
      color,
      icon,
    };

    if (gameToEdit) {
      updateGame(gameToEdit.id, payload);
    } else {
      addGame(payload);
    }
    onClose();
  };

  const handleDelete = () => {
    if (gameToEdit && window.confirm(`Delete game "${gameToEdit.name}"?`)) {
      deleteGame(gameToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Gamepad2 className="w-4 h-4" />
            </span>
            {gameToEdit ? 'Edit Game' : 'Add Custom Game'}
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
              Game Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Valorant, Rocket League, Roblox, Chess"
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" /> Daily Target Limit (Minutes)
            </label>
            <input
              type="number"
              min="15"
              max="600"
              step="15"
              required
              value={dailyLimitMinutes}
              onChange={(e) => setDailyLimitMinutes(parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-emerald-400 font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-zinc-400 mt-1">For awareness & self-control (does not block play)</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-zinc-400" /> Theme Color
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    color === c ? 'scale-115 border-white shadow-md' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
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
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <DynamicIcon name={ico} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            {gameToEdit ? (
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
                className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {gameToEdit ? 'Save Changes' : 'Add Game'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
