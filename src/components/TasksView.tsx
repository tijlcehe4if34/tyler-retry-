import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, CustomChecklist, PriorityLevel } from '../types';
import { formatTimeDisplay, formatNiceDate, getTodayString } from '../lib/dateUtils';
import { TaskModal } from './modals/TaskModal';
import {
  CheckSquare,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Repeat,
  Sparkles,
  Calendar,
  Clock,
  RotateCcw,
  BookOpen,
  Filter,
  Layers,
  Sun,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import { DynamicIcon } from './DynamicIcon';

export const TasksView: React.FC = () => {
  const {
    state,
    toggleTaskComplete,
    deleteTask,
    addCustomChecklist,
    deleteCustomChecklist,
    toggleChecklistItem,
    addChecklistItem,
    deleteChecklistItem,
    resetChecklist,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'tasks' | 'custom_checklists'>('tasks');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Task modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // New custom checklist modal/state
  const [isNewListOpen, setIsNewListOpen] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newListIcon, setNewListIcon] = useState('CheckSquare');
  const [newListCategory, setNewListCategory] = useState('Routine');

  // New item text input state mapped per checklist
  const [newItemTexts, setNewItemTexts] = useState<Record<string, string>>({});

  const today = getTodayString();

  // Filter tasks
  const filteredTasks = state.tasks.filter((t) => {
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    return true;
  });

  const handleCreateChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    addCustomChecklist({
      title: newListTitle.trim(),
      icon: newListIcon,
      category: newListCategory,
      items: [],
    });
    setNewListTitle('');
    setIsNewListOpen(false);
  };

  const handleAddItemToChecklist = (listId: string) => {
    const text = newItemTexts[listId];
    if (!text || !text.trim()) return;
    addChecklistItem(listId, text.trim());
    setNewItemTexts((prev) => ({ ...prev, [listId]: '' }));
  };

  const getSubject = (subId?: string) => {
    if (!subId) return null;
    return state.subjects.find((s) => s.id === subId);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Top Header & Tab switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl sm:rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Tasks & Custom Checklists
            </h2>
            <p className="text-xs text-zinc-400">
              Manage daily/weekly school tasks, recurring habits & custom routines
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'tasks' ? 'bg-indigo-600 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Tasks ({state.tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('custom_checklists')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'custom_checklists'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Custom Routines ({state.customChecklists.length})
            </button>
          </div>

          {activeTab === 'tasks' ? (
            <button
              onClick={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          ) : (
            <button
              onClick={() => setIsNewListOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>New Checklist</span>
            </button>
          )}
        </div>
      </div>

      {/* TASKS VIEW TAB */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex items-center justify-between gap-3 p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-zinc-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Category:
              </span>
              {['all', 'School', 'Personal', 'Gaming'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                    filterCategory === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-400">Priority:</span>
              {['all', 'high', 'medium', 'low'].map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                    filterPriority === p
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Tasks List */}
          <div className="grid grid-cols-1 gap-2.5">
            {filteredTasks.length === 0 ? (
              <div className="p-12 text-center bg-zinc-900/50 border border-zinc-800 rounded-3xl">
                <p className="text-sm text-zinc-400">No tasks found matching filter.</p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const subject = getSubject(task.subjectId);
                return (
                  <div
                    key={task.id}
                    className={`group flex items-start justify-between gap-4 p-4 rounded-2xl border transition-all ${
                      task.completed
                        ? 'bg-zinc-950/40 border-zinc-800/40 opacity-70'
                        : 'bg-zinc-900/90 border-zinc-800 hover:border-indigo-500/50'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className={`mt-0.5 w-6 h-6 rounded-xl border flex items-center justify-center transition-all ${
                          task.completed
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs'
                            : 'border-zinc-700 hover:border-indigo-400 bg-zinc-950'
                        }`}
                      >
                        {task.completed && <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={`text-base font-bold truncate ${
                              task.completed ? 'line-through text-zinc-500' : 'text-white'
                            }`}
                          >
                            {task.title}
                          </p>

                          <span
                            className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-md ${
                              task.priority === 'high'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : task.priority === 'medium'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {task.priority}
                          </span>

                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-zinc-800 text-zinc-300 rounded-md border border-zinc-700">
                            {task.category}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-xs text-zinc-400 mt-1">{task.description}</p>
                        )}

                        <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400 font-mono flex-wrap">
                          {subject && (
                            <span
                              className="px-2 py-0.5 text-[10px] font-bold rounded"
                              style={{
                                backgroundColor: `${subject.color}15`,
                                color: subject.color,
                                border: `1px solid ${subject.color}30`,
                              }}
                            >
                              {subject.name}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatNiceDate(task.dueDate)}
                            </span>
                          )}
                          {task.time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formatTimeDisplay(task.time)}
                            </span>
                          )}
                          {task.repeatType !== 'none' && (
                            <span className="flex items-center gap-1 text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                              <Repeat className="w-3 h-3" />
                              {task.repeatType === 'daily' ? 'Repeats Daily' : 'Weekly Routine'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-3 py-1 text-xs font-bold font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        +{task.xpReward} XP
                      </span>

                      <button
                        onClick={() => {
                          setEditingTask(task);
                          setIsTaskModalOpen(true);
                        }}
                        className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
                        title="Edit Task"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm('Delete this task?')) deleteTask(task.id);
                        }}
                        className="p-2 text-zinc-500 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* CUSTOM CHECKLISTS TAB */}
      {activeTab === 'custom_checklists' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.customChecklists.map((list) => {
            const completedCount = list.items.filter((i) => i.completed).length;
            const progress = list.items.length > 0 ? Math.round((completedCount / list.items.length) * 100) : 0;

            return (
              <div
                key={list.id}
                className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-3xl flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-all"
              >
                {/* Header */}
                <div>
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <DynamicIcon name={list.icon} className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{list.title}</h3>
                        <span className="text-[10px] text-zinc-400 uppercase font-mono">{list.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => resetChecklist(list.id)}
                        className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                        title="Reset all items to unchecked"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete checklist "${list.title}"?`)) deleteCustomChecklist(list.id);
                        }}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Delete checklist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-xs font-mono text-zinc-400">
                      <span>Progress</span>
                      <span>{completedCount} / {list.items.length} ({progress}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Checklist Items */}
                  <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-1">
                    {list.items.length === 0 ? (
                      <p className="text-xs text-zinc-500 italic py-2">No items added yet.</p>
                    ) : (
                      list.items.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                            item.completed
                              ? 'bg-zinc-950/50 border-zinc-800/50 text-zinc-500'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                          }`}
                        >
                          <label className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => toggleChecklistItem(list.id, item.id)}
                              className="w-4 h-4 rounded text-indigo-600 bg-zinc-900 border-zinc-700 focus:ring-0 cursor-pointer"
                            />
                            <span className={`text-xs font-medium truncate ${item.completed ? 'line-through text-zinc-500' : ''}`}>
                              {item.text}
                            </span>
                          </label>

                          <button
                            onClick={() => deleteChecklistItem(list.id, item.id)}
                            className="p-1 text-zinc-600 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Add Item form inside card */}
                <div className="pt-2 border-t border-zinc-800/80 flex gap-2">
                  <input
                    type="text"
                    value={newItemTexts[list.id] || ''}
                    onChange={(e) => setNewItemTexts({ ...newItemTexts, [list.id]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddItemToChecklist(list.id);
                    }}
                    placeholder="Add item..."
                    className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => handleAddItemToChecklist(list.id)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        taskToEdit={editingTask}
      />

      {/* New Custom Checklist Modal */}
      {isNewListOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Create Custom Routine / Checklist</h3>
            <form onSubmit={handleCreateChecklist} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Checklist Title *
                </label>
                <input
                  type="text"
                  required
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  placeholder="e.g. Night Routine, IB Physics IA Checklist"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newListCategory}
                    onChange={(e) => setNewListCategory(e.target.value)}
                    placeholder="e.g. Routine, IB Exam"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Icon
                  </label>
                  <select
                    value={newListIcon}
                    onChange={(e) => setNewListIcon(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Sun">☀️ Sun (Morning)</option>
                    <option value="ShieldCheck">🛡️ Shield (Pre-game)</option>
                    <option value="GraduationCap">🎓 Cap (IB Study)</option>
                    <option value="CheckSquare">✅ Checkmark</option>
                    <option value="Sparkles">✨ Sparkles</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsNewListOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/30"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
