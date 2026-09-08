import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatMinutes, formatNiceDate } from '../lib/dateUtils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  BookOpen,
  Gamepad2,
  CheckCircle2,
  Sparkles,
  Award,
  Zap,
  PieChart as PieIcon,
} from 'lucide-react';

export const StatsView: React.FC = () => {
  const { state } = useApp();

  const [timeRange, setTimeRange] = useState<'7days' | '30days'>('7days');

  // Days list for chart
  const numDays = timeRange === '7days' ? 7 : 14;
  const chartDays: { dateStr: string; label: string; studyMins: number; gamingMins: number; xpEarned: number }[] = [];

  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });

    // Calculate study
    const studyMins = state.studySessions
      .filter((s) => s.date === dateStr)
      .reduce((acc, s) => acc + s.durationMinutes, 0);

    // Calculate gaming
    const gamingMins = state.gamingSessions
      .filter((s) => s.date === dateStr)
      .reduce((acc, s) => acc + s.durationMinutes, 0);

    // Calculate XP
    const studyXp = state.studySessions
      .filter((s) => s.date === dateStr)
      .reduce((acc, s) => acc + s.xpEarned, 0);

    const taskXp = state.tasks
      .filter((t) => t.completed && t.completedDates && t.completedDates.includes(dateStr))
      .reduce((acc, t) => acc + t.xpReward, 0);

    const discordXp = (state.discordBreak.checkIns && state.discordBreak.checkIns[dateStr]) ||
      (state.discordBreak.history && state.discordBreak.history.some((h: any) => h.date === dateStr && (h.checked || h.checkedIn)))
      ? 25
      : 0;

    chartDays.push({
      dateStr,
      label,
      studyMins,
      gamingMins,
      xpEarned: studyXp + taskXp + discordXp,
    });
  }

  // Subject breakdown for Pie Chart
  const subjectBreakdown = state.subjects.map((sub) => {
    const totalMinutes = state.studySessions
      .filter((s) => s.subjectId === sub.id)
      .reduce((acc, s) => acc + s.durationMinutes, 0);
    return {
      name: sub.name,
      minutes: totalMinutes,
      color: sub.color,
    };
  }).filter((s) => s.minutes > 0);

  // Game breakdown for Pie Chart
  const gameBreakdown = state.games.map((game) => {
    const totalMinutes = state.gamingSessions
      .filter((s) => s.gameId === game.id)
      .reduce((acc, s) => acc + s.durationMinutes, 0);
    return {
      name: game.name,
      minutes: totalMinutes,
      color: game.color,
    };
  }).filter((g) => g.minutes > 0);

  // Aggregate stats
  const totalStudyAll = state.studySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalGamingAll = state.gamingSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalTasksCompleted = state.tasks.filter((t) => t.completed).length;

  const studyGamingRatio = totalGamingAll > 0 ? (totalStudyAll / totalGamingAll).toFixed(1) : '1.0';

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-zinc-900/90 border border-zinc-800 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Productivity & Focus Analytics
            </h2>
            <p className="text-xs text-zinc-400">
              Deep insights on your IB studying, gaming limits & XP velocity
            </p>
          </div>
        </div>

        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setTimeRange('7days')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              timeRange === '7days' ? 'bg-indigo-600 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Past 7 Days
          </button>
          <button
            onClick={() => setTimeRange('30days')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              timeRange === '30days' ? 'bg-indigo-600 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Past 14 Days
          </button>
        </div>
      </div>

      {/* Top 4 Performance Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Study Time</span>
            <BookOpen className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-white font-mono mt-2">{formatMinutes(totalStudyAll)}</p>
          <p className="text-[11px] text-zinc-500 mt-1">{state.studySessions.length} recorded sessions</p>
        </div>

        <div className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Gaming Time</span>
            <Gamepad2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-white font-mono mt-2">{formatMinutes(totalGamingAll)}</p>
          <p className="text-[11px] text-zinc-500 mt-1">{state.gamingSessions.length} recorded sessions</p>
        </div>

        <div className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Tasks Completed</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-white font-mono mt-2">{totalTasksCompleted}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Across all categories</p>
        </div>

        <div className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Focus / Game Ratio</span>
            <Zap className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono mt-2">{studyGamingRatio}x</p>
          <p className="text-[11px] text-zinc-500 mt-1">Study time to gaming time</p>
        </div>
      </div>

      {/* Main Bar Chart: Study vs Gaming Comparison */}
      <div className="p-6 bg-zinc-900/90 border border-zinc-800 rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Daily Study Time vs. Gaming Time (Minutes)
            </h3>
            <p className="text-xs text-zinc-400">Direct visual comparison of academic focus vs entertainment</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <span className="w-3 h-3 rounded bg-indigo-500 inline-block" /> Study
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Gaming
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartDays} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="label" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  borderColor: '#27272a',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(value: any) => [`${value} mins`, '']}
              />
              <Bar dataKey="studyMins" name="Study (mins)" fill="#6366f1" radius={[6, 6, 0, 0]} />
              <Bar dataKey="gamingMins" name="Gaming (mins)" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Breakdown Pie Charts: Most Studied Subjects vs Most Played Games */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Studied Subjects */}
        <div className="p-6 bg-zinc-900/90 border border-zinc-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-indigo-400" />
              Most Studied Subjects
            </h3>
            <span className="text-xs font-mono text-zinc-400">{formatMinutes(totalStudyAll)} Total</span>
          </div>

          {subjectBreakdown.length === 0 ? (
            <p className="text-xs text-zinc-500 italic py-12 text-center">No study sessions logged yet.</p>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectBreakdown}
                      dataKey="minutes"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {subjectBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val} mins`, '']}
                      contentStyle={{
                        backgroundColor: '#18181b',
                        borderColor: '#27272a',
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 space-y-2 w-full">
                {subjectBreakdown.map((item) => {
                  const pct = Math.round((item.minutes / totalStudyAll) * 100);
                  return (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold text-white">{item.name}</span>
                      </div>
                      <span className="font-mono text-zinc-300">
                        {formatMinutes(item.minutes)} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Most Played Games */}
        <div className="p-6 bg-zinc-900/90 border border-zinc-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-emerald-400" />
              Most Played Games
            </h3>
            <span className="text-xs font-mono text-zinc-400">{formatMinutes(totalGamingAll)} Total</span>
          </div>

          {gameBreakdown.length === 0 ? (
            <p className="text-xs text-zinc-500 italic py-12 text-center">No gaming sessions logged yet.</p>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gameBreakdown}
                      dataKey="minutes"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {gameBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val} mins`, '']}
                      contentStyle={{
                        backgroundColor: '#18181b',
                        borderColor: '#27272a',
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 space-y-2 w-full">
                {gameBreakdown.map((item) => {
                  const pct = Math.round((item.minutes / totalGamingAll) * 100);
                  return (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold text-white">{item.name}</span>
                      </div>
                      <span className="font-mono text-zinc-300">
                        {formatMinutes(item.minutes)} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
