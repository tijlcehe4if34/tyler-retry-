import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, CalendarEvent } from '../types';
import { formatMinutes, formatTimeDisplay, formatNiceDate, getTodayString } from '../lib/dateUtils';
import { TaskModal } from './modals/TaskModal';
import { EventModal } from './modals/EventModal';
import {
  Flame,
  Sparkles,
  BookOpen,
  Gamepad2,
  CheckCircle2,
  ShieldBan,
  Calendar as CalendarIcon,
  Plus,
  ArrowRight,
  Clock,
  Play,
  Check,
  Edit2,
  AlertCircle,
  Award,
} from 'lucide-react';
import { DynamicIcon } from './DynamicIcon';
import { ActiveTab } from './Navigation';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab }) => {
  const {
    state,
    levelInfo,
    todayTasks,
    upcomingEvents,
    todayStudyMinutes,
    todayGamingMinutes,
    discordFreeDaysCount,
    isDiscordFreeToday,
    toggleTaskComplete,
    toggleDiscordCheckIn,
    addTask,
  } = useApp();

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  
  // Quick inline add task
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskCategory, setQuickTaskCategory] = useState<'School' | 'Personal' | 'Gaming'>('School');

  const today = getTodayString();
  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const niceDate = formatNiceDate(today, true);

  // Group today's tasks
  const schoolTasks = todayTasks.filter((t) => t.category === 'School');
  const personalTasks = todayTasks.filter((t) => t.category === 'Personal');
  const gamingTasks = todayTasks.filter((t) => t.category === 'Gaming');
  const otherTasks = todayTasks.filter((t) => !['School', 'Personal', 'Gaming'].includes(t.category));

  const totalTasks = todayTasks.length;
  const completedTasks = todayTasks.filter((t) => t.completed || (t.completedDates && t.completedDates.includes(today))).length;

  const dailyStudyTarget = state.settings.studyGoals.dailyTargetMinutes || 150;
  const dailyGamingLimit = state.settings.gamingLimits.defaultDailyLimitMinutes || 120;
  const gamingLimitPercent = Math.min(100, Math.round((todayGamingMinutes / dailyGamingLimit) * 100));
  const isOverGamingLimit = todayGamingMinutes > dailyGamingLimit;

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    addTask({
      title: quickTaskTitle.trim(),
      category: quickTaskCategory,
      priority: 'medium',
      dueDate: today,
      time: '17:00',
      xpReward: state.settings.xpRules.xpPerTask || 20,
      repeatType: 'none',
      completed: false,
    });
    setQuickTaskTitle('');
  };

  const getSubject = (subId?: string) => {
    if (!subId) return null;
    return state.subjects.find((s) => s.id === subId);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
      {/* Top Banner & Welcome Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-zinc-900 border border-zinc-800 rounded-3xl relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-lg">
              {dayName} • {niceDate}
            </span>
            <span className="text-xs text-zinc-400 font-medium">IB Grade 11 Command Deck</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Ready to Lock In, {state.settings.profile.name}?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
            {state.settings.profile.mainGoal || 'Track your IB revision, control gaming habits, and conquer the 30-day Discord break.'}
          </p>
        </div>

        {/* Level Card Widget */}
        <div
          onClick={() => setActiveTab('rewards')}
          className="flex items-center gap-4 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl cursor-pointer hover:border-zinc-700 transition-all group shrink-0"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-extrabold text-lg border border-amber-500/20 group-hover:scale-105 transition-transform">
            ⭐
          </div>
          <div className="space-y-1.5 min-w-[140px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Level Rank</span>
              <span className="text-sm font-bold text-amber-400 font-mono">
                LVL {levelInfo.level}
              </span>
            </div>
            <div className="text-xs text-zinc-300 font-mono font-medium flex justify-between">
              <span>{levelInfo.currentLevelXp} XP</span>
              <span className="text-zinc-500">/ {levelInfo.nextLevelXp} XP</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main 6 Metric Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* 1. Streak */}
        <div
          onClick={() => setActiveTab('discord')}
          className="p-5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-3xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-orange-400">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Streak</span>
            <Flame className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-white font-mono">{state.streakCount} <span className="text-xs font-semibold text-orange-400">days</span></p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono mt-0.5">Best: {Math.max(state.streakCount, 18)}d</p>
          </div>
        </div>

        {/* 2. Total XP */}
        <div
          onClick={() => setActiveTab('rewards')}
          className="p-5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-3xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">XP Balance</span>
            <Sparkles className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-white font-mono">{state.currentXP.toLocaleString()}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono mt-0.5">Total: {state.totalXpEarned.toLocaleString()}</p>
          </div>
        </div>

        {/* 3. Study Time Today */}
        <div
          onClick={() => setActiveTab('study')}
          className="p-5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-3xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Study Today</span>
            <BookOpen className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-white font-mono">{formatMinutes(todayStudyMinutes)}</p>
            <p className="text-[10px] text-indigo-400 uppercase tracking-wider font-mono mt-0.5">Goal: {formatMinutes(dailyStudyTarget)}</p>
          </div>
        </div>

        {/* 4. Gaming Time Today */}
        <div
          onClick={() => setActiveTab('gaming')}
          className="p-5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-3xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Gaming Today</span>
            <Gamepad2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-black text-white font-mono">{formatMinutes(todayGamingMinutes)}</p>
              <span className="text-[10px] font-bold font-mono text-zinc-500">/ {formatMinutes(dailyGamingLimit)}</span>
            </div>
            <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isOverGamingLimit ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, gamingLimitPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* 5. Tasks Completed */}
        <div
          onClick={() => setActiveTab('tasks')}
          className="p-5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-3xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Tasks Done</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-white font-mono">{completedTasks} <span className="text-xs font-normal text-zinc-400">/ {totalTasks}</span></p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono mt-0.5">
              {totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}% done` : 'No tasks'}
            </p>
          </div>
        </div>

        {/* 6. Discord Break */}
        <div
          onClick={() => setActiveTab('discord')}
          className="p-5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-3xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Discord Free</span>
            <ShieldBan className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-white font-mono">{discordFreeDaysCount} <span className="text-xs font-normal text-zinc-400">/ 30d</span></p>
            <p className="text-[10px] text-blue-400 uppercase tracking-wider font-mono mt-0.5">
              {30 - discordFreeDaysCount > 0 ? `${30 - discordFreeDaysCount}d left` : 'Mastered!'}
            </p>
          </div>
        </div>
      </div>

      {/* Daily Discord Break Check-In Banner */}
      <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-blue-400">
            <ShieldBan className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">One-Month Discord Break</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-md font-mono">
                Day {discordFreeDaysCount} of 30
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isDiscordFreeToday
                ? 'Checked in for today. Keep the focus streak alive.'
                : 'Did you stay Discord-free today? Check in to earn +25 XP.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => toggleDiscordCheckIn(today)}
          className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
            isDiscordFreeToday
              ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/30'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
        >
          {isDiscordFreeToday ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Checked In Today</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Check In (+25 XP)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Grid: Today's Tasks & Checklists (Left 7 cols) + Timers & Upcoming Events (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Prominent Today Tasks */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  TODAY — {dayName}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Complete tasks to earn XP and level up Tyler OS
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            {/* Quick Inline Add Form */}
            <form onSubmit={handleQuickAdd} className="flex gap-2">
              <input
                type="text"
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                placeholder="Quick add task for today..."
                className="flex-1 px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-zinc-700"
              />
              <select
                value={quickTaskCategory}
                onChange={(e) => setQuickTaskCategory(e.target.value as 'School' | 'Personal' | 'Gaming')}
                className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-300 text-xs uppercase tracking-wider font-semibold focus:outline-none focus:border-zinc-700"
              >
                <option value="School">School</option>
                <option value="Personal">Personal</option>
                <option value="Gaming">Gaming</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs transition-colors"
              >
                Add
              </button>
            </form>

            {/* Task Categories */}
            <div className="space-y-6">
              {/* 1. School Tasks */}
              <div>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    School Tasks
                  </h4>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {schoolTasks.filter((t) => t.completed).length} / {schoolTasks.length}
                  </span>
                </div>

                {schoolTasks.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic py-2">No school tasks scheduled for today.</p>
                ) : (
                  <div className="space-y-2">
                    {schoolTasks.map((task) => {
                      const subject = getSubject(task.subjectId);
                      return (
                        <div
                          key={task.id}
                          className={`group flex items-start justify-between gap-3 p-3.5 rounded-2xl border transition-all ${
                            task.completed
                              ? 'bg-zinc-950/40 border-zinc-800/40 opacity-60'
                              : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <button
                              type="button"
                              onClick={() => toggleTaskComplete(task.id)}
                              className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                                task.completed
                                  ? 'bg-indigo-600 border-indigo-500 text-white'
                                  : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900'
                              }`}
                            >
                              {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </button>

                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-semibold truncate ${
                                  task.completed ? 'line-through text-zinc-500' : 'text-zinc-100'
                                }`}
                              >
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                                  {task.description}
                                </p>
                              )}

                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                {subject && (
                                  <span
                                    className="px-2 py-0.5 text-[10px] font-bold rounded-md"
                                    style={{
                                      backgroundColor: `${subject.color}15`,
                                      color: subject.color,
                                      border: `1px solid ${subject.color}30`,
                                    }}
                                  >
                                    {subject.name}
                                  </span>
                                )}
                                {task.time && (
                                  <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                                    <Clock className="w-3 h-3" />
                                    {formatTimeDisplay(task.time)}
                                  </span>
                                )}
                                {task.repeatType !== 'none' && (
                                  <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded font-mono">
                                    {task.repeatType === 'daily' ? 'Daily' : 'Recurring'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 shrink-0">
                              +{task.xpReward} XP
                            </span>
                            <button
                              onClick={() => {
                                setEditingTask(task);
                                setIsTaskModalOpen(true);
                              }}
                              className="p-1 text-zinc-500 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2. Personal Tasks */}
              <div>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Personal & Habits
                  </h4>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {personalTasks.filter((t) => t.completed).length} / {personalTasks.length}
                  </span>
                </div>

                {personalTasks.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic py-2">No personal tasks scheduled for today.</p>
                ) : (
                  <div className="space-y-2">
                    {personalTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`group flex items-start justify-between gap-3 p-3.5 rounded-2xl border transition-all ${
                          task.completed
                            ? 'bg-zinc-950/40 border-zinc-800/40 opacity-60'
                            : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => toggleTaskComplete(task.id)}
                            className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                              task.completed
                                ? 'bg-emerald-600 border-emerald-500 text-white'
                                : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900'
                            }`}
                          >
                            {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>

                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-semibold truncate ${
                                task.completed ? 'line-through text-zinc-500' : 'text-zinc-100'
                              }`}
                            >
                              {task.title}
                            </p>
                            {task.time && (
                              <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono mt-1">
                                <Clock className="w-3 h-3" />
                                {formatTimeDisplay(task.time)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 shrink-0">
                            +{task.xpReward} XP
                          </span>
                          <button
                            onClick={() => {
                              setEditingTask(task);
                              setIsTaskModalOpen(true);
                            }}
                            className="p-1 text-zinc-500 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Gaming Section Progress */}
              <div>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-rose-400 flex items-center gap-1.5">
                    <Gamepad2 className="w-3.5 h-3.5" />
                    Gaming Limit Tracker
                  </h4>
                  <button
                    onClick={() => setActiveTab('gaming')}
                    className="text-xs text-zinc-400 hover:text-white uppercase tracking-wider font-bold flex items-center gap-1"
                  >
                    Open Hub <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎮</span>
                      <div>
                        <p className="text-xs font-bold text-white uppercase tracking-wide">Daily Gaming Allowance</p>
                        <p className="text-[11px] text-zinc-500">Self-control & focus tracking</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono text-zinc-200">
                      {formatMinutes(todayGamingMinutes)} / {formatMinutes(dailyGamingLimit)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOverGamingLimit ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, gamingLimitPercent)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 4. Other / Custom Tasks */}
              {otherTasks.length > 0 && (
                <div>
                  <div className="border-b border-zinc-800 pb-2 mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                      Other Tasks
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {otherTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleTaskComplete(task.id)}
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                              task.completed ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-zinc-700 bg-zinc-900'
                            }`}
                          >
                            {task.completed && <Check className="w-3.5 h-3.5" />}
                          </button>
                          <span className={`text-sm ${task.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                            {task.title}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-400">+{task.xpReward} XP</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Focus Timers & IB Deadlines */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Timer Launchers */}
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Play className="w-4 h-4 text-indigo-400" />
              Focus & Timers
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setActiveTab('study')}
                className="p-4 bg-zinc-950 border border-zinc-800 hover:border-indigo-500/50 rounded-2xl text-left transition-all group"
              >
                <div className="p-2 w-fit rounded-xl bg-zinc-900 text-indigo-400 group-hover:scale-105 transition-transform mb-2 border border-zinc-800">
                  <BookOpen className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-white uppercase tracking-wide">Study Lab</p>
                <p className="text-xs text-zinc-500 mt-0.5">25m / 50m / 90m</p>
                <span className="inline-block mt-2 text-[10px] font-bold text-indigo-400 font-mono uppercase tracking-wider">
                  Earn XP →
                </span>
              </button>

              <button
                onClick={() => setActiveTab('gaming')}
                className="p-4 bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 rounded-2xl text-left transition-all group"
              >
                <div className="p-2 w-fit rounded-xl bg-zinc-900 text-emerald-400 group-hover:scale-105 transition-transform mb-2 border border-zinc-800">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-white uppercase tracking-wide">Gaming Hub</p>
                <p className="text-xs text-zinc-500 mt-0.5">Track limits</p>
                <span className="inline-block mt-2 text-[10px] font-bold text-emerald-400 font-mono uppercase tracking-wider">
                  Log session →
                </span>
              </button>
            </div>
          </div>

          {/* Upcoming Events & IB Deadlines */}
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-amber-400" />
                Upcoming Events & Tests
              </h3>
              <button
                onClick={() => setActiveTab('calendar')}
                className="text-xs text-zinc-400 hover:text-white uppercase tracking-wider font-bold flex items-center gap-1"
              >
                Calendar <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {upcomingEvents.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-2">No upcoming tests or events logged.</p>
            ) : (
              <div className="space-y-2.5">
                {upcomingEvents.slice(0, 4).map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => {
                      setEditingEvent(evt);
                      setIsEventModalOpen(true);
                    }}
                    className="p-3.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-2xl cursor-pointer transition-all flex items-start gap-3 group"
                  >
                    <div
                      className="w-1.5 h-9 rounded-full shrink-0"
                      style={{ backgroundColor: evt.color || '#6366f1' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                          {evt.title}
                        </p>
                        {evt.priority === 'high' && (
                          <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded">
                            High
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400 font-mono">
                        <span>📅 {formatNiceDate(evt.date)}</span>
                        {evt.startTime && <span>• ⏰ {formatTimeDisplay(evt.startTime)}</span>}
                      </div>
                      {evt.description && (
                        <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                          {evt.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Custom Routine Shortcut */}
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                Custom Routines
              </h3>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs text-zinc-400 hover:text-white uppercase tracking-wider font-bold"
              >
                View all ({state.customChecklists.length})
              </button>
            </div>

            <div className="space-y-2">
              {state.customChecklists.slice(0, 2).map((list) => {
                const completedCount = list.items.filter((i) => i.completed).length;
                const percent = list.items.length > 0 ? Math.round((completedCount / list.items.length) * 100) : 0;
                return (
                  <div
                    key={list.id}
                    onClick={() => setActiveTab('tasks')}
                    className="p-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-xl bg-zinc-900 text-indigo-400 border border-zinc-800">
                        <DynamicIcon name={list.icon} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{list.title}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          {completedCount}/{list.items.length} completed ({percent}%)
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-500" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Task & Event Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        taskToEdit={editingTask}
      />

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEditingEvent(null);
        }}
        eventToEdit={editingEvent}
      />
    </div>
  );
};
