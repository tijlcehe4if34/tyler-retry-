import React, { useState } from 'react';
import { TaskModal } from './TaskModal';
import { EventModal } from './EventModal';
import { ReminderModal } from './ReminderModal';
import { CheckSquare, Calendar, Bell, X, Sparkles } from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose }) => {
  const [activeSubModal, setActiveSubModal] = useState<'task' | 'event' | 'reminder' | null>(null);

  if (!isOpen) return null;

  if (activeSubModal === 'task') {
    return (
      <TaskModal
        isOpen={true}
        onClose={() => {
          setActiveSubModal(null);
          onClose();
        }}
      />
    );
  }

  if (activeSubModal === 'event') {
    return (
      <EventModal
        isOpen={true}
        onClose={() => {
          setActiveSubModal(null);
          onClose();
        }}
      />
    );
  }

  if (activeSubModal === 'reminder') {
    return (
      <ReminderModal
        isOpen={true}
        onClose={() => {
          setActiveSubModal(null);
          onClose();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" /> Quick Add
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          <button
            onClick={() => setActiveSubModal('task')}
            className="flex items-center gap-3.5 p-3.5 bg-zinc-950 hover:bg-indigo-950/40 border border-zinc-800 hover:border-indigo-500/50 rounded-xl text-left transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">New Task / Checklist Item</p>
              <p className="text-xs text-zinc-400">School homework, personal habits, XP rewards</p>
            </div>
          </button>

          <button
            onClick={() => setActiveSubModal('event')}
            className="flex items-center gap-3.5 p-3.5 bg-zinc-950 hover:bg-amber-950/40 border border-zinc-800 hover:border-amber-500/50 rounded-xl text-left transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">Calendar Event / Test</p>
              <p className="text-xs text-zinc-400">IB exams, music assignments, gaming events</p>
            </div>
          </button>

          <button
            onClick={() => setActiveSubModal('reminder')}
            className="flex items-center gap-3.5 p-3.5 bg-zinc-950 hover:bg-emerald-950/40 border border-zinc-800 hover:border-emerald-500/50 rounded-xl text-left transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">Reminder / Alert</p>
              <p className="text-xs text-zinc-400">Time-sensitive reminders & notifications</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
