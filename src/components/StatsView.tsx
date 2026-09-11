import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatMinutes, formatNiceDate, getTodayString } from '../lib/dateUtils';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  Zap,
  PieChart as PieIcon,
  Plus,
  Clock,
  Calendar,
  Trash2,
  Filter,
  CheckCheck,
  FileText,
  X,
  Layers,
  Sparkles,
  Percent,
} from 'lucide-react';

export const StatsView: React.FC = () => {
  const { state, addStudySession, deleteStudySession } = useApp();

  // Selected time window (30 days as requested, or 14 / 7 days)
  const [timeRange, setTimeRange] = useState<'30days' | '14days' | '7days'>('30days');

  // Manual study logging modal state ("studying with not the timer")
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualSubjectId, setManualSubjectId] = useState<string>(
    state.subjects[0]?.id || 'sub_design'
  );
  const [manualMinutes, setManualMinutes] = useState<number>(45);
  const [manualDate, setManualDate] = useState<string>(getTodayString());
  const [manualNotes, setManualNotes] = useState<string>('');

  // History session filter
  const [sessionFilter, setSessionFilter] = useState<'all' | 'timer' | 'manual'>('all');

  const numDays = timeRange === '30days' ? 30 : timeRange === '14days' ? 14 : 7;
  const targetDailyStudyMins = state.settings.studyGoals?.dailyTargetMinutes || 150;

  // Process day-by-day metrics for recharts over the selected window
  const chartDays = useMemo(() => {
    const days: {
      dateStr: string;
      label: string;
      shortLabel: string;
      timerStudyMins: number;
      manualStudyMins: number;
      totalStudyMins: number;
      gamingMins: number;
      tasksCompleted: number;
      tasksDue: number;
      taskCompletionRate: number;
      xpEarned: number;
      subjectsStudied: string[];
    }[] = [];

    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        weekday: numDays <= 14 ? 'short' : undefined,
      });
      const shortLabel = d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });

      // Study sessions on date
      const dayStudySessions = state.studySessions.filter((s) => s.date === dateStr);

      const timerStudyMins = dayStudySessions
        .filter((s) => s.method !== 'manual' && !s.loggedWithoutTimer)
        .reduce((acc, s) => acc + s.durationMinutes, 0);

      const manualStudyMins = dayStudySessions
        .filter((s) => s.method === 'manual' || !!s.loggedWithoutTimer)
        .reduce((acc, s) => acc + s.durationMinutes, 0);

      const totalStudyMins = timerStudyMins + manualStudyMins;

      // Unique subjects studied
      const subjectNames = Array.from(
        new Set(
          dayStudySessions
            .map((s) => state.subjects.find((sub) => sub.id === s.subjectId)?.name)
            .filter(Boolean) as string[]
        )
      );

      // Gaming sessions on date
      const gamingMins = state.gamingSessions
        .filter((s) => s.date === dateStr)
        .reduce((acc, s) => acc + s.durationMinutes, 0);

      // Tasks completed on date (via completedDates array or completed on dueDate)
      const tasksCompleted = state.tasks.filter((t) => {
        if (t.completedDates && t.completedDates.includes(dateStr)) return true;
        if (t.completed && t.dueDate === dateStr) return true;
        return false;
      }).length;

      // Tasks due or scheduled on this date
      const tasksDue = state.tasks.filter(
        (t) => t.dueDate === dateStr || (t.createdAt === dateStr && t.dueDate <= dateStr)
      ).length;

      // Completion Rate % for the day (if tasks were due or completed)
      let taskCompletionRate = 0;
      if (tasksDue > 0) {
        taskCompletionRate = Math.min(100, Math.round((tasksCompleted / tasksDue) * 100));
      } else if (tasksCompleted > 0) {
        taskCompletionRate = 100;
      }

      // XP earned
      const studyXp = dayStudySessions.reduce((acc, s) => acc + s.xpEarned, 0);
      const taskXp = state.tasks
        .filter((t) => t.completed && t.completedDates && t.completedDates.includes(dateStr))
        .reduce((acc, t) => acc + t.xpReward, 0);

      const discordXp =
        (state.discordBreak.checkIns && state.discordBreak.checkIns[dateStr]) ||
        (state.discordBreak.history &&
          state.discordBreak.history.some(
            (h: any) => h.date === dateStr && (h.checked || h.checkedIn)
          ))
          ? 25
          : 0;

      days.push({
        dateStr,
        label,
        shortLabel,
        timerStudyMins,
        manualStudyMins,
        totalStudyMins,
        gamingMins,
        tasksCompleted,
        tasksDue: Math.max(tasksDue, tasksCompleted),
        taskCompletionRate,
        xpEarned: studyXp + taskXp + discordXp,
        subjectsStudied: subjectNames,
      });
    }

    return days;
  }, [numDays, state.studySessions, state.gamingSessions, state.tasks, state.discordBreak, state.subjects]);

  // Aggregate stats over selected period
  const totalStudyInPeriod = chartDays.reduce((acc, d) => acc + d.totalStudyMins, 0);
  const timerStudyInPeriod = chartDays.reduce((acc, d) => acc + d.timerStudyMins, 0);
  const manualStudyInPeriod = chartDays.reduce((acc, d) => acc + d.manualStudyMins, 0);

  const totalTasksCompletedInPeriod = chartDays.reduce((acc, d) => acc + d.tasksCompleted, 0);
  const totalTasksDueInPeriod = chartDays.reduce((acc, d) => acc + d.tasksDue, 0);

  const overallCompletionRate =
    totalTasksDueInPeriod > 0
      ? Math.min(100, Math.round((totalTasksCompletedInPeriod / totalTasksDueInPeriod) * 100))
      : totalTasksCompletedInPeriod > 0
      ? 100
      : 0;

  const avgDailyStudyMins = Math.round(totalStudyInPeriod / numDays);
  const daysGoalMetCount = chartDays.filter((d) => d.totalStudyMins >= targetDailyStudyMins).length;

  // Subject breakdown for Pie Chart
  const subjectBreakdown = useMemo(() => {
    return state.subjects
      .map((sub) => {
        const totalMinutes = state.studySessions
          .filter((s) => s.subjectId === sub.id)
          .reduce((acc, s) => acc + s.durationMinutes, 0);

        const timerMins = state.studySessions
          .filter(
            (s) => s.subjectId === sub.id && s.method !== 'manual' && !s.loggedWithoutTimer
          )
          .reduce((acc, s) => acc + s.durationMinutes, 0);

        const manualMins = state.studySessions
          .filter(
            (s) => s.subjectId === sub.id && (s.method === 'manual' || !!s.loggedWithoutTimer)
          )
          .reduce((acc, s) => acc + s.durationMinutes, 0);

        return {
          id: sub.id,
          name: sub.name,
          code: sub.code || '',
          level: sub.level || '',
          minutes: totalMinutes,
          timerMinutes: timerMins,
          manualMinutes: manualMins,
          color: sub.color,
        };
      })
      .filter((s) => s.minutes > 0);
  }, [state.subjects, state.studySessions]);

  const totalStudyAllTime = state.studySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  // Filtered study sessions list for the history feed
  const filteredSessions = useMemo(() => {
    return [...state.studySessions]
      .filter((s) => {
        if (sessionFilter === 'timer') return s.method !== 'manual' && !s.loggedWithoutTimer;
        if (sessionFilter === 'manual') return s.method === 'manual' || !!s.loggedWithoutTimer;
        return true;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [state.studySessions, sessionFilter]);

  // Handle manual study form submission
  const handleLogManualStudy = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualMinutes <= 0) return;

    const xpPer25 = state.settings.xpRules.xpPer25MinStudy || 10;
    const xpEarned = Math.max(5, Math.round((manualMinutes / 25) * xpPer25));

    addStudySession({
      date: manualDate || getTodayString(),
      subjectId: manualSubjectId,
      durationMinutes: manualMinutes,
      notes: manualNotes.trim() || undefined,
      xpEarned,
      method: 'manual',
      loggedWithoutTimer: true,
    });

    setIsManualModalOpen(false);
    setManualNotes('');
    setManualMinutes(45);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-zinc-900/90 border border-zinc-800 rounded-3xl backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-inner">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Productivity & Focus Analytics
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-400 border border-indigo-800/60">
                IB Curriculum
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Interactive 30-day study trends, offline non-timer logging & task completion velocity
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Action: Log Study Without Timer */}
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Log Study (Without Timer)</span>
          </button>

          {/* Time range selector */}
          <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setTimeRange('7days')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeRange === '7days'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('14days')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeRange === '14days'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setTimeRange('30days')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeRange === '30days'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Key Metric Performance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Study Time with Timer vs Non-Timer breakdown */}
        <div className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl relative overflow-hidden group hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              {timeRange === '30days' ? '30-Day' : timeRange === '14days' ? '14-Day' : '7-Day'} Study Time
            </span>
            <BookOpen className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-white font-mono mt-2">
            {formatMinutes(totalStudyInPeriod)}
          </p>
          <div className="mt-2.5 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
            <span className="text-indigo-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formatMinutes(timerStudyInPeriod)} timer
            </span>
            <span className="text-emerald-400 flex items-center gap-1">
              <FileText className="w-3 h-3" /> {formatMinutes(manualStudyInPeriod)} offline
            </span>
          </div>
        </div>

        {/* Task Completion Rate % */}
        <div className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl relative overflow-hidden group hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Task Completion Rate
            </span>
            <Percent className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-2xl font-black text-emerald-400 font-mono">
              {overallCompletionRate}%
            </p>
            <span className="text-xs text-zinc-400 font-mono">
              ({totalTasksCompletedInPeriod}/{totalTasksDueInPeriod} tasks)
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              {overallCompletionRate >= 80 ? 'Mastery Pace' : 'Active Progress'}
            </span>
            <span className="text-zinc-500 font-mono">Last {numDays}d</span>
          </div>
        </div>

        {/* Daily Study Average */}
        <div className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl relative overflow-hidden group hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Daily Average
            </span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono mt-2">
            {formatMinutes(avgDailyStudyMins)} <span className="text-xs font-normal text-zinc-500">/ day</span>
          </p>
          <div className="mt-2.5 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Goal: {formatMinutes(targetDailyStudyMins)}/day</span>
            <span className="text-amber-500 font-mono font-bold">
              {daysGoalMetCount}/{numDays} met
            </span>
          </div>
        </div>

        {/* Offline Study Share */}
        <div className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl relative overflow-hidden group hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-teal-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Offline Study Share
            </span>
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-teal-400 font-mono mt-2">
            {totalStudyInPeriod > 0
              ? Math.round((manualStudyInPeriod / totalStudyInPeriod) * 100)
              : 0}
            %
          </p>
          <div className="mt-2.5 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Studied without timer</span>
            <span className="text-teal-400 font-mono">
              {formatMinutes(manualStudyInPeriod)}
            </span>
          </div>
        </div>
      </div>

      {/* CHART 1: 30-Day Study Time Trends (Stacked Area Chart showing Timer vs Non-Timer) */}
      <div className="p-6 bg-zinc-900/90 border border-zinc-800 rounded-3xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Study Time Trends (Past {numDays} Days)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Stacked breakdown of Timer Sessions vs. Independent Offline Study (Minutes)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block shadow-xs" />
              Timer Study
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block shadow-xs" />
              Without Timer (Offline)
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-amber-400 inline-block" />
              Daily Goal ({targetDailyStudyMins}m)
            </span>
          </div>
        </div>

        <div className="h-80 w-full pt-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartDays} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTimer" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorManual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="shortLabel"
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                interval={numDays === 30 ? 2 : 0}
              />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} unit="m" />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0]?.payload;
                  if (!data) return null;
                  return (
                    <div className="p-3.5 bg-zinc-950/95 border border-zinc-800 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[200px]">
                      <p className="font-bold text-white border-b border-zinc-800 pb-1 flex items-center justify-between">
                        <span>{data.label}</span>
                        <span className="font-mono text-zinc-400 font-normal">
                          {formatMinutes(data.totalStudyMins)}
                        </span>
                      </p>
                      <div className="space-y-1 font-mono text-[11px]">
                        <div className="flex items-center justify-between text-indigo-400">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-indigo-500" />
                            Timer Study:
                          </span>
                          <span>{data.timerStudyMins} mins</span>
                        </div>
                        <div className="flex items-center justify-between text-emerald-400">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Offline Study:
                          </span>
                          <span>{data.manualStudyMins} mins</span>
                        </div>
                      </div>
                      {data.subjectsStudied?.length > 0 && (
                        <div className="pt-1.5 border-t border-zinc-800/80 text-[10px] text-zinc-400">
                          <span className="text-zinc-500">Subjects: </span>
                          {data.subjectsStudied.join(', ')}
                        </div>
                      )}
                    </div>
                  );
                }}
              />
              <ReferenceLine
                y={targetDailyStudyMins}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
              <Area
                type="monotone"
                dataKey="timerStudyMins"
                name="Timer Study"
                stackId="1"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTimer)"
              />
              <Area
                type="monotone"
                dataKey="manualStudyMins"
                name="Without Timer"
                stackId="1"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorManual)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 2: Task Completion Rates & Volume (Past 30 Days) */}
      <div className="p-6 bg-zinc-900/90 border border-zinc-800 rounded-3xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCheck className="w-5 h-5 text-emerald-400" />
              Task Completion Rates & Velocity (Past {numDays} Days)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Daily tasks completed vs scheduled, plus completion success rate percentage
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block shadow-xs" />
              Tasks Completed
            </span>
            <span className="flex items-center gap-1.5 text-zinc-500">
              <span className="w-3 h-3 rounded-sm bg-zinc-700 inline-block shadow-xs" />
              Tasks Scheduled
            </span>
            <span className="flex items-center gap-1.5 text-purple-400">
              <span className="w-4 h-0.5 bg-purple-400 inline-block" />
              Completion Rate %
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-3">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartDays} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="shortLabel"
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                interval={numDays === 30 ? 2 : 0}
              />
              {/* Left Y Axis: Task counts */}
              <YAxis yAxisId="left" stroke="#71717a" fontSize={11} tickLine={false} allowDecimals={false} />
              {/* Right Y Axis: Completion percentage */}
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#a855f7"
                fontSize={11}
                tickLine={false}
                unit="%"
                domain={[0, 100]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0]?.payload;
                  if (!data) return null;
                  return (
                    <div className="p-3.5 bg-zinc-950/95 border border-zinc-800 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[190px]">
                      <p className="font-bold text-white border-b border-zinc-800 pb-1">
                        {data.label}
                      </p>
                      <div className="space-y-1 font-mono text-[11px]">
                        <div className="flex items-center justify-between text-blue-400">
                          <span>Completed:</span>
                          <span className="font-bold">{data.tasksCompleted} tasks</span>
                        </div>
                        <div className="flex items-center justify-between text-zinc-400">
                          <span>Scheduled:</span>
                          <span>{data.tasksDue} tasks</span>
                        </div>
                        <div className="flex items-center justify-between text-purple-400 pt-1 border-t border-zinc-800/80">
                          <span>Completion Rate:</span>
                          <span className="font-bold">{data.taskCompletionRate}%</span>
                        </div>
                        {data.xpEarned > 0 && (
                          <div className="flex items-center justify-between text-amber-400 pt-1">
                            <span>XP Earned:</span>
                            <span className="font-bold">+{data.xpEarned} XP</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }}
              />
              <ReferenceLine
                yAxisId="right"
                y={80}
                stroke="#10b981"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
              <Bar
                yAxisId="left"
                dataKey="tasksDue"
                name="Tasks Due"
                fill="#3f3f46"
                radius={[4, 4, 0, 0]}
                barSize={numDays === 30 ? 6 : 14}
              />
              <Bar
                yAxisId="left"
                dataKey="tasksCompleted"
                name="Tasks Completed"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                barSize={numDays === 30 ? 6 : 14}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="taskCompletionRate"
                name="Completion Rate %"
                stroke="#c084fc"
                strokeWidth={2.5}
                dot={{ r: numDays === 30 ? 2 : 3, fill: '#c084fc' }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Breakdown Columns: Subject Distribution & Daily XP Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IB Subjects Focus Distribution */}
        <div className="p-6 bg-zinc-900/90 border border-zinc-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-indigo-400" />
              IB Subjects Focus Breakdown
            </h3>
            <span className="text-xs font-mono text-zinc-400">
              {formatMinutes(totalStudyAllTime)} Total
            </span>
          </div>

          {subjectBreakdown.length === 0 ? (
            <p className="text-xs text-zinc-500 italic py-12 text-center">
              No study sessions logged yet. Log an offline session or start the timer!
            </p>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="w-48 h-48 relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectBreakdown}
                      dataKey="minutes"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={3}
                    >
                      {subjectBreakdown.map((entry) => (
                        <Cell key={`cell-${entry.id}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0]?.payload;
                        if (!data) return null;
                        return (
                          <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-white">
                            <p className="font-bold">{data.name}</p>
                            <p className="text-indigo-400">{data.minutes} mins total</p>
                            <p className="text-emerald-400 text-[10px]">
                              {data.timerMinutes}m timer / {data.manualMinutes}m offline
                            </p>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 space-y-2.5 w-full">
                {subjectBreakdown.map((item) => {
                  const pct = Math.round((item.minutes / (totalStudyAllTime || 1)) * 100);
                  return (
                    <div key={item.id} className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-white leading-tight">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {item.code} • {item.level}
                          </span>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-bold text-zinc-200">
                          {formatMinutes(item.minutes)}
                        </span>
                        <span className="text-[10px] text-zinc-500 ml-1.5">({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Daily XP & Motivation Velocity */}
        <div className="p-6 bg-zinc-900/90 border border-zinc-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Daily XP Velocity (Past {numDays} Days)
            </h3>
            <span className="text-xs font-mono text-amber-400">
              +{chartDays.reduce((acc, d) => acc + d.xpEarned, 0)} XP Period
            </span>
          </div>

          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDays} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="shortLabel"
                  stroke="#71717a"
                  fontSize={10}
                  tickLine={false}
                  interval={numDays === 30 ? 3 : 0}
                />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const data = payload[0]?.payload;
                    return (
                      <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-white">
                        <p className="font-bold">{data?.label}</p>
                        <p className="text-amber-400 font-bold">+{data?.xpEarned} XP Earned</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="xpEarned" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1 text-zinc-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Total XP Accumulated:
            </span>
            <span className="font-mono font-bold text-amber-400 text-sm">
              {state.currentXP} XP
            </span>
          </div>
        </div>
      </div>

      {/* RECENT SESSIONS TABLE WITH FILTER (Timer vs. Without Timer) */}
      <div className="p-6 bg-zinc-900/90 border border-zinc-800 rounded-3xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Study Session Logs & History
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Review and manage your study records, distinguished by timer tracking and offline manual entries
            </p>
          </div>

          {/* Session filter tabs */}
          <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 self-start sm:self-auto">
            <button
              onClick={() => setSessionFilter('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                sessionFilter === 'all'
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All ({state.studySessions.length})
            </button>
            <button
              onClick={() => setSessionFilter('timer')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                sessionFilter === 'timer'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              ⏱️ Timer
            </button>
            <button
              onClick={() => setSessionFilter('manual')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                sessionFilter === 'manual'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              📖 Without Timer
            </button>
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs">
            <p>No study sessions match the selected filter.</p>
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" /> Log an offline session now
            </button>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {filteredSessions.map((session) => {
              const subject = state.subjects.find((s) => s.id === session.subjectId);
              const isManual = session.method === 'manual' || !!session.loggedWithoutTimer;

              return (
                <div
                  key={session.id}
                  className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full mt-1 sm:mt-0 shrink-0"
                      style={{ backgroundColor: subject?.color || '#6366f1' }}
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-xs">
                          {subject?.name || 'General Study'}
                        </span>
                        {subject?.level && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono">
                            {subject.level}
                          </span>
                        )}
                        {/* Method badge */}
                        {isManual ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                            <BookOpen className="w-2.5 h-2.5" />
                            Without Timer
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            Timer
                          </span>
                        )}
                      </div>
                      {session.notes && (
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-1 italic">
                          "{session.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 font-mono text-xs">
                    <div className="text-right">
                      <span className="font-bold text-white text-sm">
                        {formatMinutes(session.durationMinutes)}
                      </span>
                      <p className="text-[10px] text-zinc-500">{formatNiceDate(session.date)}</p>
                    </div>

                    <span className="text-xs font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/60">
                      +{session.xpEarned} XP
                    </span>

                    <button
                      onClick={() => deleteStudySession(session.id)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                      title="Remove session log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: LOG STUDY WITHOUT TIMER */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 text-zinc-100 relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Log Study (Without Timer)</h3>
                  <p className="text-xs text-zinc-400">
                    Record independent study, textbook reading, or offline homework
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogManualStudy} className="space-y-4">
              {/* Subject Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  IB Subject
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {state.subjects.map((sub) => {
                    const isSelected = manualSubjectId === sub.id;
                    return (
                      <button
                        type="button"
                        key={sub.id}
                        onClick={() => setManualSubjectId(sub.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'bg-zinc-800 border-indigo-500 text-white shadow-xs'
                            : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: sub.color }}
                        />
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold truncate leading-tight">{sub.name}</p>
                          <p className="text-[10px] text-zinc-500 font-mono">
                            {sub.code || ''} {sub.level ? `(${sub.level})` : ''}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date & Duration Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    Date Studied
                  </label>
                  <input
                    type="date"
                    value={manualDate}
                    max={getTodayString()}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-mono focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="600"
                    step="5"
                    value={manualMinutes}
                    onChange={(e) => setManualMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Quick Duration Chips */}
              <div>
                <span className="text-[11px] text-zinc-500 mb-1.5 block">Quick Duration Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[15, 25, 30, 45, 60, 90, 120].map((mins) => (
                    <button
                      type="button"
                      key={mins}
                      onClick={() => setManualMinutes(mins)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                        manualMinutes === mins
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-750'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes / Topics Covered */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Topics Covered / Study Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="e.g., German B oral presentation practice, Math AI calculus problem set, or Global Politics case studies..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-600 focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              {/* XP reward summary badge */}
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Estimated XP Reward:
                </span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  +{Math.max(5, Math.round((manualMinutes / 25) * (state.settings.xpRules.xpPer25MinStudy || 10)))} XP
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/50 border border-emerald-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Confirm & Log Study
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
