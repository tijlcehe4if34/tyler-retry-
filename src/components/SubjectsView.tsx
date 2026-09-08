import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { DynamicIcon } from './DynamicIcon';
import { sound } from '../lib/sound';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Award,
  Sparkles,
  BarChart2,
  Layers,
  ChevronRight,
  FolderOpen,
} from 'lucide-react';
import { Subject } from '../types';

export const SubjectsView: React.FC = () => {
  const {
    state,
    addSubject,
    updateSubject,
    deleteSubject,
    startStudyTimer,
    setStudySubjectId,
    setTargetNavTab,
    pushNotification,
  } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [icon, setIcon] = useState('BookOpen');
  const [targetGrade, setTargetGrade] = useState('7');
  const [syllabusTopicsInput, setSyllabusTopicsInput] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const topicsArray = syllabusTopicsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingId) {
      updateSubject(editingId, {
        name: name.trim(),
        color,
        icon,
        targetGrade,
        syllabusTopics: topicsArray.length > 0 ? topicsArray : undefined,
      });
      pushNotification({
        type: 'info',
        title: 'Subject Updated',
        subtitle: name,
        icon: 'BookOpen',
        duration: 3000,
      });
    } else {
      addSubject({
        name: name.trim(),
        color,
        icon,
        targetGrade,
        syllabusTopics: topicsArray,
        totalStudyMinutes: 0,
      });
      pushNotification({
        type: 'task_complete',
        title: 'Subject Added',
        subtitle: `${name} registered to IB Coursework`,
        icon: 'BookOpen',
        duration: 3000,
      });
    }

    sound.playTaskComplete();
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setColor('#6366f1');
    setIcon('BookOpen');
    setTargetGrade('7');
    setSyllabusTopicsInput('');
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (sub: Subject) => {
    setEditingId(sub.id);
    setName(sub.name);
    setColor(sub.color || '#6366f1');
    setIcon(sub.icon || 'BookOpen');
    setTargetGrade(sub.targetGrade || '7');
    setSyllabusTopicsInput((sub.syllabusTopics || []).join(', '));
    setIsAdding(true);
    sound.playClick();
  };

  const handleStartStudyForSubject = (subId: string) => {
    sound.playClick();
    setStudySubjectId(subId);
    startStudyTimer();
    setTargetNavTab('study');
  };

  const colorPalette = [
    '#6366f1', // Indigo
    '#3b82f6', // Blue
    '#06b6d4', // Cyan
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Rose
    '#8b5cf6', // Purple
    '#ec4899', // Pink
  ];

  const iconOptions = ['BookOpen', 'Atom', 'Calculator', 'Languages', 'Globe', 'Compass', 'Code', 'Palette'];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950 p-6 rounded-3xl border border-zinc-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              IB Coursework & Subjects
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">
            Track syllabus coverage, target grades, study time, and related tasks per academic subject.
          </p>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            resetForm();
            setIsAdding(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-600/30 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Modal / Form drawer */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                {editingId ? 'Edit Subject Details' : 'Register New Subject'}
              </h3>
              <button
                onClick={resetForm}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Subject Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mathematics Analysis & Approaches HL"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Target IB Grade (1 - 7)</label>
                <input
                  type="text"
                  value={targetGrade}
                  onChange={(e) => setTargetGrade(e.target.value)}
                  placeholder="7"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Color Tag</label>
                <div className="flex items-center gap-2">
                  {colorPalette.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-zinc-900' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Icon</label>
                <div className="flex items-center gap-2">
                  {iconOptions.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      className={`p-2 rounded-xl border text-xs transition-all ${
                        icon === ic
                          ? 'bg-indigo-600/30 border-indigo-500 text-white'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <DynamicIcon name={ic} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Syllabus Topics (comma-separated)</label>
                <input
                  type="text"
                  value={syllabusTopicsInput}
                  onChange={(e) => setSyllabusTopicsInput(e.target.value)}
                  placeholder="e.g. Calculus, Vectors, Probability, Complex Numbers"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md"
                >
                  {editingId ? 'Update Subject' : 'Save Subject'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {state.subjects.map((sub) => {
          const relatedTasks = state.tasks.filter((t) => t.subjectId === sub.id);
          const completedTasks = relatedTasks.filter((t) => t.completed);
          const pendingTasks = relatedTasks.filter((t) => !t.completed);

          const studyHours = Math.round(((sub.totalStudyMinutes || 0) / 60) * 10) / 10;

          return (
            <div
              key={sub.id}
              className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800/90 hover:border-zinc-700 space-y-4 transition-all shadow-md group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
                    style={{ backgroundColor: sub.color || '#6366f1' }}
                  >
                    <DynamicIcon name={sub.icon || 'BookOpen'} className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white group-hover:text-indigo-300 transition-colors">
                      {sub.name}
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-mono">
                      Target Grade: <span className="font-bold text-amber-400">{sub.targetGrade || '7'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                  <button
                    onClick={() => startEdit(sub)}
                    className="p-1.5 text-zinc-400 hover:text-white rounded-lg bg-zinc-950 border border-zinc-800"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {state.subjects.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete subject "${sub.name}"?`)) {
                          deleteSubject(sub.id);
                        }
                      }}
                      className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg bg-zinc-950 border border-zinc-800"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Stats pills */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 uppercase block">Tasks</span>
                  <span className="font-bold text-white">
                    {completedTasks.length}/{relatedTasks.length} Done
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 uppercase block">Total Study</span>
                  <span className="font-bold text-indigo-400">{studyHours} hrs</span>
                </div>
              </div>

              {/* Syllabus topics pills */}
              {sub.syllabusTopics && sub.syllabusTopics.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold block">
                    Core Syllabus
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {sub.syllabusTopics.slice(0, 4).map((topic, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-950 text-zinc-300 border border-zinc-800 font-mono"
                      >
                        {topic}
                      </span>
                    ))}
                    {sub.syllabusTopics.length > 4 && (
                      <span className="text-[10px] px-1.5 py-0.5 text-zinc-500 font-mono">
                        +{sub.syllabusTopics.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2 border-t border-zinc-800/60">
                <button
                  onClick={() => handleStartStudyForSubject(sub.id)}
                  className="flex-1 py-2 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 hover:border-indigo-500 text-indigo-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Start Focus Session</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
