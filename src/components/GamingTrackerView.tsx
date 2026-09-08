import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { formatMinutes, formatNiceDate, getTodayString } from '../lib/dateUtils';
import { sound } from '../lib/sound';
import { GameModal } from './modals/GameModal';
import {
  Gamepad2,
  Play,
  Pause,
  RotateCcw,
  Plus,
  BarChart2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Edit2,
  Trophy,
} from 'lucide-react';
import { DynamicIcon } from './DynamicIcon';
import { GameItem } from '../types';

export const GamingTrackerView: React.FC = () => {
  const { state, addGamingSession } = useApp();

  const [selectedGameId, setSelectedGameId] = useState<string>(
    state.games[0]?.id || 'game_mc'
  );

  // Live Timer Stopwatch state (in seconds)
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [sessionNotes, setSessionNotes] = useState<string>('');

  // Game Modal
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<GameItem | null>(null);

  const timerRef = useRef<number | null>(null);

  const selectedGame = state.games.find((g) => g.id === selectedGameId) || state.games[0];

  // Stopwatch Engine
  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const handleStopAndLog = () => {
    setIsActive(false);
    const durationMinutes = Math.max(1, Math.round(secondsElapsed / 60));

    if (durationMinutes >= 1) {
      sound.playClick();
      addGamingSession({
        date: getTodayString(),
        gameId: selectedGameId,
        durationMinutes,
        notes: sessionNotes.trim() || undefined,
      });
    }

    setSecondsElapsed(0);
    setSessionNotes('');
  };

  const handleReset = () => {
    setIsActive(false);
    setSecondsElapsed(0);
  };

  // Format HH:MM:SS
  const hrs = Math.floor(secondsElapsed / 3600);
  const mins = Math.floor((secondsElapsed % 3600) / 60);
  const secs = secondsElapsed % 60;
  const timeFormatted = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Gaming Stats
  const today = getTodayString();
  const todayMinutes = state.gamingSessions
    .filter((s) => s.date === today)
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  const nowMs = Date.now();
  const weeklyMinutes = state.gamingSessions
    .filter((s) => nowMs - s.timestamp <= 7 * 86400000)
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  const monthlyMinutes = state.gamingSessions
    .filter((s) => nowMs - s.timestamp <= 30 * 86400000)
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  const totalAllTimeMinutes = state.gamingSessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  // Daily limit computation
  const dailyLimit = state.settings.gamingLimits.defaultDailyLimitMinutes || 120;
  const combinedTodayMins = todayMinutes + Math.floor(secondsElapsed / 60);
  const limitPercent = Math.min(100, Math.round((combinedTodayMins / dailyLimit) * 100));
  const isOverLimit = combinedTodayMins > dailyLimit;

  // Breakdown per game
  const gameTimeMap: Record<string, number> = {};
  state.gamingSessions.forEach((s) => {
    gameTimeMap[s.gameId] = (gameTimeMap[s.gameId] || 0) + s.durationMinutes;
  });

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl sm:rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Gaming Timer & Self-Control Hub
            </h2>
            <p className="text-xs text-zinc-400">
              Awareness-first tracking to balance gaming with IB school goals
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingGame(null);
            setIsGameModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Game</span>
        </button>
      </div>

      {/* Daily Limit Awareness Alert Banner */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isOverLimit
            ? 'bg-rose-950/30 border-rose-800/40 text-rose-300'
            : limitPercent >= 80
            ? 'bg-amber-950/30 border-amber-800/40 text-amber-300'
            : 'bg-zinc-900/90 border-zinc-800 text-zinc-300'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`p-3 rounded-xl ${
              isOverLimit
                ? 'bg-rose-500/20 text-rose-400'
                : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            {isOverLimit ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Daily Gaming Allowance: {formatMinutes(combinedTodayMins)} / {formatMinutes(dailyLimit)}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isOverLimit
                ? '⚠️ You have exceeded your 2h daily gaming limit. Consider taking a break or locking in on schoolwork.'
                : 'Non-blocking timer for personal discipline and habit awareness.'}
            </p>
          </div>
        </div>

        <div className="w-full sm:w-48 space-y-1">
          <div className="flex justify-between text-xs font-mono">
            <span>{limitPercent}% of limit</span>
          </div>
          <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isOverLimit ? 'bg-rose-500' : limitPercent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${limitPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Live Stopwatch (7 cols) + Game Stats (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Live Stopwatch */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 bg-zinc-900/90 border border-zinc-800 rounded-3xl flex flex-col items-center justify-center space-y-6 text-center shadow-xl">
            {/* Game Selector Pills */}
            <div className="w-full flex items-center justify-center gap-2 flex-wrap">
              {state.games.map((game) => {
                const isSelected = game.id === selectedGameId;
                return (
                  <button
                    key={game.id}
                    onClick={() => setSelectedGameId(game.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'text-white shadow-md scale-105'
                        : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                    style={{
                      backgroundColor: isSelected ? game.color : undefined,
                      borderColor: isSelected ? game.color : undefined,
                    }}
                  >
                    <DynamicIcon name={game.icon || 'Gamepad2'} className="w-3.5 h-3.5" />
                    <span>{game.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Stopwatch Display */}
            <div className="p-8 bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-sm flex flex-col items-center space-y-2 shadow-inner">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 font-mono">
                {selectedGame?.name} Session
              </span>
              <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                {timeFormatted}
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">
                Active gaming session timer
              </span>
            </div>

            {/* Notes input */}
            <input
              type="text"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="Session notes: e.g. SMP server building, EA FC weekend league..."
              className="w-full max-w-md px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-emerald-500 text-center"
            />

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="p-3 text-zinc-400 hover:text-white rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 transition-colors"
                title="Reset"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsActive(!isActive)}
                className={`px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl transition-all hover:scale-105 active:scale-95 ${
                  isActive
                    ? 'bg-amber-500 text-zinc-950 shadow-amber-500/30'
                    : 'bg-emerald-600 text-white shadow-emerald-600/30 hover:bg-emerald-500'
                }`}
              >
                {isActive ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    <span>PAUSE TIMER</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>START GAMING</span>
                  </>
                )}
              </button>

              {secondsElapsed > 0 && (
                <button
                  onClick={handleStopAndLog}
                  className="px-4 py-3 text-xs font-bold text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-2xl transition-colors"
                >
                  Log & Stop
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right 5 cols: Gaming Stats & Games Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
              <span className="text-xs font-bold text-zinc-400 uppercase">Today</span>
              <p className="text-2xl font-black text-white font-mono mt-1">{formatMinutes(todayMinutes)}</p>
              <span className="text-[10px] text-zinc-500 font-mono">Limit: {formatMinutes(dailyLimit)}</span>
            </div>

            <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
              <span className="text-xs font-bold text-zinc-400 uppercase">This Week</span>
              <p className="text-2xl font-black text-white font-mono mt-1">{formatMinutes(weeklyMinutes)}</p>
              <span className="text-[10px] text-zinc-500 font-mono">Month: {formatMinutes(monthlyMinutes)}</span>
            </div>
          </div>

          {/* Time per Game */}
          <div className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-400" />
                Time Spent per Game
              </h3>
            </div>

            <div className="space-y-3">
              {state.games.map((game) => {
                const gameMins = gameTimeMap[game.id] || 0;
                const percent = totalAllTimeMinutes > 0 ? Math.round((gameMins / totalAllTimeMinutes) * 100) : 0;

                return (
                  <div key={game.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: game.color }} />
                        <span className="font-semibold text-white">{game.name}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-zinc-300 font-bold">{formatMinutes(gameMins)}</span>
                        <span className="text-[10px] text-zinc-500">({percent}%)</span>
                        <button
                          onClick={() => {
                            setEditingGame(game);
                            setIsGameModalOpen(true);
                          }}
                          className="p-1 text-zinc-600 hover:text-white transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%`, backgroundColor: game.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Gaming Log */}
          <div className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-3xl space-y-3">
            <h3 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Recent Gaming Sessions
            </h3>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {state.gamingSessions.slice(0, 5).map((sess) => {
                const game = state.games.find((g) => g.id === sess.gameId);
                return (
                  <div
                    key={sess.id}
                    className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: game?.color || '#10b981' }} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{game?.name || 'Game'}</p>
                        {sess.notes && <p className="text-[10px] text-zinc-400 truncate">{sess.notes}</p>}
                      </div>
                    </div>

                    <span className="text-zinc-300 font-mono font-bold text-xs shrink-0">
                      {formatMinutes(sess.durationMinutes)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Game Edit / Add Modal */}
      <GameModal
        isOpen={isGameModalOpen}
        onClose={() => {
          setIsGameModalOpen(false);
          setEditingGame(null);
        }}
        gameToEdit={editingGame}
      />
    </div>
  );
};
