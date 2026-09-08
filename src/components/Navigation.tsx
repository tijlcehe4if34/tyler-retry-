import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Timer,
  Gamepad2,
  Gift,
  ShieldBan,
  BarChart3,
  Trophy,
  Settings,
  Sparkles,
  BookOpen,
  Mic,
  Bot,
  X,
} from 'lucide-react';
import { DynamicIcon } from './DynamicIcon';

export type ActiveTab =
  | 'dashboard'
  | 'calendar'
  | 'tasks'
  | 'study'
  | 'ai_study'
  | 'subjects'
  | 'gaming'
  | 'rewards'
  | 'discord'
  | 'stats'
  | 'achievements'
  | 'settings';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  isMobileMenuOpen: externalMobileMenuOpen,
  setIsMobileMenuOpen: externalSetIsMobileMenuOpen,
}) => {
  const {
    state,
    discordFreeDaysCount,
    setIsJarvisOpen,
    startJarvisListening,
    isJarvisListening,
  } = useApp();

  const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);
  const isMobileMenuOpen = externalMobileMenuOpen !== undefined ? externalMobileMenuOpen : internalMobileMenuOpen;
  const setIsMobileMenuOpen = externalSetIsMobileMenuOpen || setInternalMobileMenuOpen;

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'tasks', label: 'Checklist & Tasks', icon: CheckSquare },
    { id: 'ai_study', label: 'AI Study Lab', icon: Sparkles },
    { id: 'subjects', label: 'IB Subjects', icon: BookOpen },
    { id: 'study', label: 'Study Timer', icon: Timer },
    { id: 'gaming', label: 'Gaming Hub', icon: Gamepad2 },
    { id: 'rewards', label: 'Reward Shop', icon: Gift },
    { id: 'discord', label: 'Discord Break', icon: ShieldBan },
    { id: 'stats', label: 'Analytics', icon: BarChart3 },
    { id: 'achievements', label: 'Trophies', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const activeRemindersCount = state.reminders.filter((r) => !r.isDismissed).length;
  const discordPercent = Math.min(100, Math.round((discordFreeDaysCount / 30) * 100));

  const handleTabClick = (id: ActiveTab) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex w-60 bg-zinc-900/50 border-r border-zinc-800 flex-col shrink-0 select-none">
        {/* Brand Header */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="p-6 border-b border-zinc-800 flex items-center justify-between cursor-pointer group"
        >
          <div>
            <h1 className="text-base font-black tracking-wider text-white uppercase group-hover:text-indigo-400 transition-colors">
              Tyler OS
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mt-0.5">
              IB G11 Command Deck
            </p>
          </div>
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs font-black">
            ⚡
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => handleTabClick(id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                  isActive
                    ? 'bg-zinc-800/80 text-white font-bold border border-zinc-700/60 shadow-xs'
                    : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-zinc-400'}`} />
                <span className="text-xs uppercase tracking-wider font-semibold truncate">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* JARVIS Assistant Launcher Card */}
        <div className="p-3 border-t border-zinc-800">
          <button
            onClick={() => {
              setIsJarvisOpen(true);
              startJarvisListening();
            }}
            className={`w-full group flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
              isJarvisListening
                ? 'bg-cyan-950/60 border-cyan-500/80 shadow-lg shadow-cyan-500/20 text-cyan-200 animate-pulse'
                : 'bg-zinc-950/80 hover:bg-zinc-900 border-zinc-800 hover:border-cyan-500/40 text-zinc-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                  isJarvisListening
                    ? 'bg-cyan-500 text-black animate-spin'
                    : 'bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 text-cyan-400 border border-cyan-500/30'
                }`}
              >
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black tracking-wide text-white flex items-center gap-1.5">
                  JARVIS AI
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                </p>
                <p className="text-[10px] text-zinc-400 font-mono">
                  {isJarvisListening ? 'Listening...' : '“Hey Jarvis”'}
                </p>
              </div>
            </div>
            <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-700/60 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-colors">
              <Mic className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>

        {/* Discord Break Progress Footer Widget */}
        <div
          onClick={() => setActiveTab('discord')}
          className="p-4 border-t border-zinc-800 space-y-2.5 cursor-pointer hover:bg-zinc-900/80 transition-colors"
        >
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-zinc-400">
            <span className="flex items-center gap-1">
              <ShieldBan className="w-3 h-3 text-blue-400" /> Discord Break
            </span>
            <span className="text-blue-400 font-mono">{discordFreeDaysCount}/30 Days</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${discordPercent}%` }}
            />
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop & Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs animate-in fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="relative w-64 max-w-[80vw] bg-zinc-900 border-r border-zinc-800 flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h1 className="text-base font-black tracking-wider text-white uppercase">Tyler OS</h1>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">IB G11 Deck</p>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleTabClick(id)}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                      isActive
                        ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                        : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-zinc-400'}`} />
                    <span className="text-xs uppercase tracking-wider font-semibold">{label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Mobile JARVIS Launcher */}
            <div className="p-3 border-t border-zinc-800">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsJarvisOpen(true);
                  startJarvisListening();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-200"
              >
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">Hey Jarvis AI</span>
                </div>
                <Mic className="w-4 h-4 text-cyan-400" />
              </button>
            </div>

            <div className="p-4 border-t border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-zinc-400">
                <span>Discord Break</span>
                <span className="text-blue-400 font-mono">{discordFreeDaysCount}/30 Days</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${discordPercent}%` }}
                />
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

