import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, PriorityLevel, TaskRepeatType } from '../../types';
import { getTodayString } from '../../lib/dateUtils';
import { X, Trash2, Sparkles, Calendar, Clock, Tag, Flag, BookOpen, Repeat } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  defaultDate?: string;
}

const DAYS_OF_WEEK = [
  { day: 1, label: 'Mon' },
  { day: 2, label: 'Tue' },
  { day: 3, label: 'Wed' },
  { day: 4, label: 'Thu' },
  { day: 5, label: 'Fri' },
  { day: 6, label: 'Sat' },
  { day: 0, label: 'Sun' },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  defaultDate,
}) => {
  const { state, addTask, updateTask, deleteTask } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(defaultDate || getTodayString());
  const [time, setTime] = useState('17:00');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [category, setCategory] = useState('School');
  const [customCategory, setCustomCategory] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [xpReward, setXpReward] = useState(20);
  const [repeatType, setRepeatType] = useState<TaskRepeatType>('none');
  const [repeatDays, setRepeatDays] = useState<number[]>([1, 3, 5]);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setDueDate(taskToEdit.dueDate || getTodayString());
      setTime(taskToEdit.time || '17:00');
      setPriority(taskToEdit.priority);
      if (['School', 'Personal', 'Gaming'].includes(taskToEdit.category)) {
        setCategory(taskToEdit.category);
        setCustomCategory('');
      } else {
        setCategory('Custom');
        setCustomCategory(taskToEdit.category);
      }
      setSubjectId(taskToEdit.subjectId || '');
      setXpReward(taskToEdit.xpReward || state.settings.xpRules.xpPerTask);
      setRepeatType(taskToEdit.repeatType || 'none');
      setRepeatDays(taskToEdit.repeatDays || [1, 3, 5]);
    } else {
      setTitle('');
      setDescription('');
      setDueDate(defaultDate || getTodayString());
      setTime('17:00');
      setPriority('medium');
      setCategory('School');
      setCustomCategory('');
      setSubjectId(state.subjects[0]?.id || '');
      setXpReward(state.settings.xpRules.xpPerTask || 20);
      setRepeatType('none');
      setRepeatDays([1, 3, 5]);
    }
  }, [taskToEdit, defaultDate, isOpen, state.settings.xpRules.xpPerTask, state.subjects]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalCategory = category === 'Custom' && customCategory.trim() ? customCategory.trim() : category;

    const taskPayload = {
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || undefined,
      time: time || undefined,
      priority,
      category: finalCategory,
      subjectId: finalCategory === 'School' ? subjectId : undefined,
      xpReward: Number(xpReward) || 20,
      repeatType,
      repeatDays: repeatType === 'weekly' ? repeatDays : undefined,
      completed: taskToEdit ? taskToEdit.completed : false,
      completedDates: taskToEdit ? taskToEdit.completedDates : [],
    };

    if (taskToEdit) {
      updateTask(taskToEdit.id, taskPayload);
    } else {
      addTask(taskPayload);
    }
    onClose();
  };

  const handleDelete = () => {
    if (taskToEdit && window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskToEdit.id);
      onClose();
    }
  };

  const toggleDay = (day: number) => {
    if (repeatDays.includes(day)) {
      setRepeatDays(repeatDays.filter((d) => d !== day));
    } else {
      setRepeatDays([...repeatDays, day]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/60">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </span>
            {taskToEdit ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Finish German grammar workbook p.42"
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add extra details, page numbers, links, requirements..."
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm resize-none"
            />
          </div>

          {/* Category & Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-zinc-400" /> Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="School">📚 School</option>
                <option value="Personal">🏃 Personal</option>
                <option value="Gaming">🎮 Gaming</option>
                <option value="Custom">✨ Custom Category</option>
              </select>
            </div>

            {category === 'School' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> IB Subject
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="">None / General</option>
                  {state.subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} {sub.code ? `(${sub.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {category === 'Custom' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Custom Category Name
                </label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Fitness, CAS"
                  className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" /> Time (Optional)
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Priority & XP Reward */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-zinc-400" /> Priority
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                {(['low', 'medium', 'high'] as PriorityLevel[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                      priority === p
                        ? p === 'high'
                          ? 'bg-rose-500 text-white'
                          : p === 'medium'
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-500 text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> XP Reward
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  max="500"
                  step="5"
                  value={xpReward}
                  onChange={(e) => setXpReward(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-amber-400 font-mono font-bold text-sm focus:outline-none focus:border-amber-500 pl-8"
                />
                <span className="absolute left-3 top-2.5 text-amber-400 text-xs font-bold">⭐</span>
              </div>
            </div>
          </div>

          {/* Repeat Schedule */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5 text-zinc-400" /> Repeat Schedule
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'none', label: 'One-Time' },
                { type: 'daily', label: 'Daily Task' },
                { type: 'weekly', label: 'Weekly Schedule' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setRepeatType(item.type as TaskRepeatType)}
                  className={`py-2 text-xs font-medium rounded-xl border transition-colors ${
                    repeatType === item.type
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {repeatType === 'weekly' && (
              <div className="mt-2.5 p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1.5">
                <p className="text-xs text-zinc-400">Repeats on selected days:</p>
                <div className="flex gap-1.5 justify-between">
                  {DAYS_OF_WEEK.map(({ day, label }) => {
                    const isSelected = repeatDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-indigo-500 border-indigo-400 text-white shadow-xs'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80">
            {taskToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3.5 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Delete Task
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
                className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {taskToEdit ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
