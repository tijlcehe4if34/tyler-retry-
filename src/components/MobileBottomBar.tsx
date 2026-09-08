import React from 'react';
import { ActiveTab } from './Navigation';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Sparkles,
  Menu,
  Mic,
  Bot,
  Timer,
} from 'lucide-react';
import { sound } from '../lib/sound';

interface MobileBottomBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenMenu: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenMenu,
}) => {
  const {
    setIsJarvisOpen,
    startJarvisListening,
    isJarvisListening,
    isJarvisSpeaking,
    studyTimer,
  } = useApp();

  const handleTab = (tab: ActiveTab) => {
    sound.playClick();
    setActiveTab(tab);
  };

  const handleJarvisVoice = () => {
    sound.playClick();
    setIsJarvisOpen(true);
    if (!isJarvisListening) {
      startJarvisListening();
    }
  };

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/80 px-2 py-1.5 flex items-center justify-around pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] transition-all"
      aria-label="Mobile Navigation Bar"
    >
      {/* Dashboard */}
      <button
        onClick={() => handleTab('dashboard')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[44px] ${
          activeTab === 'dashboard'
            ? 'text-indigo-400 font-bold scale-105'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <LayoutDashboard className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Home</span>
      </button>

      {/* Tasks */}
      <button
        onClick={() => handleTab('tasks')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[44px] ${
          activeTab === 'tasks'
            ? 'text-indigo-400 font-bold scale-105'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <CheckSquare className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Tasks</span>
      </button>

      {/* Center: JARVIS Voice Trigger Orb */}
      <div className="relative -top-3">
        <button
          onClick={handleJarvisVoice}
          className={`w-13 h-13 rounded-full flex flex-col items-center justify-center shadow-xl transition-all active:scale-95 border-2 ${
            isJarvisListening
              ? 'bg-cyan-500 text-zinc-950 border-cyan-300 shadow-cyan-500/50 animate-pulse'
              : isJarvisSpeaking
              ? 'bg-indigo-600 text-white border-indigo-400 shadow-indigo-500/50'
              : 'bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white border-cyan-400/80 shadow-cyan-900/50'
          }`}
          title="Talk with Jarvis AI"
        >
          {isJarvisListening ? (
            <Mic className="w-6 h-6 animate-bounce" />
          ) : (
            <Bot className="w-6 h-6" />
          )}
          <span className="text-[8px] font-black uppercase tracking-tighter leading-none mt-0.5">
            JARVIS
          </span>
        </button>
      </div>

      {/* Calendar */}
      <button
        onClick={() => handleTab('calendar')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[44px] ${
          activeTab === 'calendar'
            ? 'text-indigo-400 font-bold scale-105'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <Calendar className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Calendar</span>
      </button>

      {/* Menu / More */}
      <button
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-zinc-400 hover:text-zinc-200 transition-all min-w-[56px] min-h-[44px]"
        title="All Modules"
      >
        <Menu className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">More</span>
      </button>
    </nav>
  );
};
