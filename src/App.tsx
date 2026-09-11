import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation, ActiveTab } from './components/Navigation';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/DashboardView';
import { CalendarView } from './components/CalendarView';
import { TasksView } from './components/TasksView';
import { StudyTimerView } from './components/StudyTimerView';
import { GamingTrackerView } from './components/GamingTrackerView';
import { RewardShopView } from './components/RewardShopView';
import { DiscordBreakView } from './components/DiscordBreakView';
import { StatsView } from './components/StatsView';
import { AchievementsView } from './components/AchievementsView';
import { SettingsView } from './components/SettingsView';
import { AiStudyLabView } from './components/AiStudyLabView';
import { SubjectsView } from './components/SubjectsView';
import { JarvisAssistant } from './components/JarvisAssistant';
import { GamifiedNotificationContainer } from './components/GamifiedNotificationContainer';
import { LevelUpCelebrationModal } from './components/LevelUpCelebrationModal';
import { DomainAuthModal } from './components/modals/DomainAuthModal';
import { FocusModeTheater } from './components/FocusModeTheater';
import { MobileBottomBar } from './components/MobileBottomBar';
import { GamifiedNotification } from './types';

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const {
    notifications,
    dismissNotification,
    levelUpModal,
    closeLevelUpModal,
    targetNavTab,
    setTargetNavTab,
    isDomainAuthModalOpen,
    setIsDomainAuthModalOpen,
    signInWithGoogle,
  } = useApp();

  // Listen to JARVIS voice navigation commands (e.g. "Jarvis, take me to calendar")
  React.useEffect(() => {
    if (targetNavTab) {
      setActiveTab(targetNavTab as ActiveTab);
      setTargetNavTab(null);
    }
  }, [targetNavTab, setTargetNavTab]);

  const handleNotificationClick = (notif: GamifiedNotification) => {
    dismissNotification(notif.id);
    if (notif.badgeText === 'FIREBASE' || notif.title.includes('Domain Authorization')) {
      setIsDomainAuthModalOpen(true);
      return;
    }
    if (notif.type === 'achievement_unlock') {
      setActiveTab('achievements');
    } else if (notif.type === 'level_up' || notif.type === 'reward_redeem') {
      setActiveTab('rewards');
    } else if (notif.type === 'study_complete') {
      setActiveTab('study');
    } else if (notif.type === 'discord_checkin') {
      setActiveTab('discord');
    } else if (notif.type === 'task_complete') {
      setActiveTab('tasks');
    }
  };

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 font-sans overflow-hidden selection:bg-indigo-500 selection:text-white antialiased">
      {/* Sleek Sidebar Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area with Top Header */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Sleek Top Header Bar */}
        <TopHeader
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          setActiveTab={setActiveTab}
        />

        {/* Scrollable View Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 pb-24 lg:pb-12">
          {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'tasks' && <TasksView />}
          {activeTab === 'study' && <StudyTimerView />}
          {activeTab === 'ai_study' && <AiStudyLabView />}
          {activeTab === 'subjects' && <SubjectsView />}
          {activeTab === 'gaming' && <GamingTrackerView />}
          {activeTab === 'rewards' && <RewardShopView />}
          {activeTab === 'discord' && <DiscordBreakView />}
          {activeTab === 'stats' && <StatsView />}
          {activeTab === 'achievements' && <AchievementsView />}
          {activeTab === 'settings' && <SettingsView />}

          {/* Footer */}
          <footer className="mt-8 border-t border-zinc-900 py-4 px-6 text-center text-xs text-zinc-600 font-mono">
            <p>Tyler OS • IB Grade 11 Command Deck • Sleek Interface</p>
          </footer>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar with Quick Voice Trigger */}
      <MobileBottomBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Futuristic JARVIS Voice & Typed AI Assistant HUD */}
      <JarvisAssistant />

      {/* Focus Mode Theater / Dimmed Distraction-Free Overlay */}
      <FocusModeTheater />

      {/* Global Gamified Notification System */}
      <GamifiedNotificationContainer
        notifications={notifications}
        onDismiss={dismissNotification}
        onNotificationClick={handleNotificationClick}
      />

      {/* Level Up Grand Celebration Modal */}
      <LevelUpCelebrationModal
        isOpen={levelUpModal.isOpen}
        level={levelUpModal.level}
        onClose={closeLevelUpModal}
        onViewRewards={() => setActiveTab('rewards')}
      />

      {/* Firebase Domain Authorization Helper Modal */}
      <DomainAuthModal
        isOpen={isDomainAuthModalOpen}
        onClose={() => setIsDomainAuthModalOpen(false)}
        onRetry={() => {
          setIsDomainAuthModalOpen(false);
          signInWithGoogle();
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
