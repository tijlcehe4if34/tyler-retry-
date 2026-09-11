import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppState } from '../types';
import {
  Settings,
  User,
  Sliders,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  Volume2,
  VolumeX,
  ShieldAlert,
  Save,
  Check,
  BookOpen,
  Gamepad2,
  Calendar,
  Bell,
  Mic,
  Bot,
  Play,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Cloud,
  RefreshCw,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { sound } from '../lib/sound';

export const SettingsView: React.FC = () => {
  const {
    state,
    updateSettings,
    resetAllData,
    importData,
    notificationPermission,
    requestNotificationPermission,
    testEventNotification,
    testJarvisVoice,
    getAvailableVoices,
    setJarvisVoice,
    setJarvisCadence,
    currentUser,
    syncStatus,
    lastSyncTime,
    signInWithGoogle,
    signOutUser,
    flushCloudSync,
  } = useApp();

  const [isManualSyncing, setIsManualSyncing] = useState(false);

  const [voices, setVoices] = useState<Array<{ name: string; lang: string; voiceURI: string; isNatural: boolean }>>(() =>
    getAvailableVoices()
  );

  // Local Form state initialized from global settings
  const [userName, setUserName] = useState(state.settings.profile.name);
  const [userGrade, setUserGrade] = useState(state.settings.profile.grade);
  const [mainGoal, setMainGoal] = useState(state.settings.profile.mainGoal);

  const [dailyStudyTarget, setDailyStudyTarget] = useState(state.settings.studyGoals.dailyTargetMinutes);
  const [dailyGamingLimit, setDailyGamingLimit] = useState(state.settings.gamingLimits.defaultDailyLimitMinutes);

  const [xpPerTask, setXpPerTask] = useState(state.settings.xpRules.xpPerTask);
  const [xpPerStudy, setXpPerStudy] = useState(state.settings.xpRules.xpPer25MinStudy);
  const [xpPerDiscord, setXpPerDiscord] = useState(state.settings.xpRules.xpPerDiscordDay);
  const [xpPerStreak, setXpPerStreak] = useState(state.settings.xpRules.xpPerStreakDay);

  const [defaultCalendarView, setDefaultCalendarView] = useState(state.settings.calendar.defaultView);
  const [soundEnabled, setSoundEnabled] = useState(state.settings.appearance.soundEnabled);

  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      profile: {
        name: userName.trim() || 'Tyler',
        grade: userGrade.trim() || 'IB Grade 11',
        mainGoal: mainGoal.trim(),
      },
      studyGoals: {
        dailyTargetMinutes: Number(dailyStudyTarget) || 150,
      },
      gamingLimits: {
        defaultDailyLimitMinutes: Number(dailyGamingLimit) || 120,
      },
      xpRules: {
        xpPerTask: Number(xpPerTask) || 20,
        xpPer25MinStudy: Number(xpPerStudy) || 10,
        xpPerDiscordDay: Number(xpPerDiscord) || 25,
        xpPerStreakDay: Number(xpPerStreak) || 15,
      },
      calendar: {
        defaultView: defaultCalendarView,
        firstDayOfWeek: 0,
      },
      appearance: {
        soundEnabled: Boolean(soundEnabled),
      },
    });

    sound.playRewardRedeem();
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  // Export JSON file
  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tyler_personal_stuff_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON file
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string) as AppState;
          if (parsed && parsed.settings && parsed.tasks) {
            importData(parsed);
            alert('Data restored successfully!');
          } else {
            alert('Invalid backup file format.');
          }
        } catch (err) {
          alert('Error parsing JSON backup file.');
        }
      };
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all Tyler Personal Stuff data to the default IB Grade 11 starter state?')) {
      resetAllData();
      alert('Data reset to default state.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between p-5 bg-zinc-900/90 border border-zinc-800 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Settings & Customization
            </h2>
            <p className="text-xs text-zinc-400">
              Customize XP rules, study goals, gaming limits & manage backups
            </p>
          </div>
        </div>

        {isSavedNotice && (
          <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-4 h-4" /> Settings Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Google Account & Cross-Device Cloud Sync */}
        <div className="p-6 bg-zinc-900/90 border border-zinc-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Cloud className="w-4 h-4 text-indigo-400" />
              Google Account & Cloud Backup
            </h3>
            {currentUser && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Google Connected
              </span>
            )}
          </div>

          {currentUser ? (
            <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Google User'}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full border-2 border-emerald-500/40 object-cover shadow-md"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-base text-white shadow-md">
                      {(currentUser.displayName || currentUser.email || 'G')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      {currentUser.displayName || 'Google User'}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        Active
                      </span>
                    </h4>
                    <p className="text-xs text-zinc-400 font-mono">{currentUser.email}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Sync Status: <span className="text-zinc-300 font-semibold">{syncStatus === 'syncing' ? 'Syncing...' : 'Live Synced'}</span>
                      {lastSyncTime && (
                        <span className="ml-1 text-zinc-500">
                          (Last: {lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={async () => {
                      setIsManualSyncing(true);
                      await flushCloudSync();
                      setTimeout(() => setIsManualSyncing(false), 600);
                    }}
                    disabled={isManualSyncing}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isManualSyncing ? 'animate-spin' : ''}`} />
                    <span>{isManualSyncing ? 'Syncing...' : 'Sync Now'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={signOutUser}
                    className="px-3 py-2 bg-zinc-900 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 border border-zinc-800 hover:border-rose-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Cross-device database: Google Firestore</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Real-time listeners active on this browser</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 bg-indigo-950/20 border border-indigo-500/30 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    Login with your Google Account
                  </h4>
                  <p className="text-xs text-zinc-300 max-w-xl leading-relaxed">
                    Sign in to automatically save your checklists, tasks, study goals, IB subjects, and gaming limits. Everything syncs seamlessly between your mobile phone, laptop, and desktop with zero lag.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="px-4 py-2.5 bg-white hover:bg-zinc-100 text-zinc-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-98 shrink-0 cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Sign In with Google</span>
                </button>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-indigo-500/20 text-[11px] text-zinc-400">
                <span>Tip: If popups are blocked by your browser in this preview frame:</span>
                <button
                  type="button"
                  onClick={() => window.open(window.location.href, '_blank')}
                  className="text-indigo-400 hover:text-indigo-300 underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  Open in New Tab <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 1. Profile Information */}
        <div className="p-6 bg-zinc-900/90 border border-zinc-800 rounded-3xl space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            Profile & School Level
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                User Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Grade / Academic Year
              </label>
              <input
                type="text"
                value={userGrade}
                onChange={(e) => setUserGrade(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Main Focus / Motto
              </label>
              <input
                type="text"
                value={mainGoal}
                onChange={(e) => setMainGoal(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* 2. Daily Targets & Limits */}
        <div className="p-6 bg-zinc-900/90 border border-zinc-800 rounded-3xl space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            Daily Targets & Limits
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Daily Study Target (Minutes)
              </label>
              <input
                type="number"
                min="10"
                max="600"
                value={dailyStudyTarget}
                onChange={(e) => setDailyStudyTarget(parseInt(e.target.value) || 150)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-zinc-500 mt-1">150 mins = 2 hours 30 mins</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" /> Daily Gaming Limit (Minutes)
              </label>
              <input
                type="number"
                min="10"
                max="600"
                value={dailyGamingLimit}
                onChange={(e) => setDailyGamingLimit(parseInt(e.target.value) || 120)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-zinc-500 mt-1">120 mins = 2 hours maximum</p>
            </div>
          </div>
        </div>

        {/* 3. XP Rules Customization */}
        <div className="p-6 bg-zinc-900/90 border border-zinc-800 rounded-3xl space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            XP Economy Rules
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">
                XP Per Task
              </label>
              <input
                type="number"
                value={xpPerTask}
                onChange={(e) => setXpPerTask(parseInt(e.target.value) || 20)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">
                XP / 25m Study
              </label>
              <input
                type="number"
                value={xpPerStudy}
                onChange={(e) => setXpPerStudy(parseInt(e.target.value) || 10)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">
                XP Discord Day
              </label>
              <input
                type="number"
                value={xpPerDiscord}
                onChange={(e) => setXpPerDiscord(parseInt(e.target.value) || 25)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">
                XP Daily Streak
              </label>
              <input
                type="number"
                value={xpPerStreak}
                onChange={(e) => setXpPerStreak(parseInt(e.target.value) || 15)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* 4. Calendar & Sound Preferences */}
        <div className="p-6 bg-zinc-900/90 border border-zinc-800 rounded-3xl space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            Calendar & Gamified Notifications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Default Calendar View
              </label>
              <select
                value={defaultCalendarView}
                onChange={(e) => setDefaultCalendarView(e.target.value as 'month' | 'week' | 'day')}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="month">Month View</option>
                <option value="week">Week View</option>
                <option value="day">Day View</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl">
              <div>
                <p className="text-xs font-bold text-white">Gamification Sound Effects</p>
                <p className="text-[11px] text-zinc-500">Audio feedback for completions, streaks & level ups</p>
              </div>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2.5 rounded-xl border transition-colors ${
                  soundEnabled
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Gamified Notification & Audio Test Suite */}
          <div className="pt-2 border-t border-zinc-800/80">
            <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Test Gamified Notification Animations & Audio
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.playTaskComplete();
                }}
                className="px-3 py-2 bg-zinc-950 hover:bg-emerald-950/30 border border-zinc-800 hover:border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-400 transition-colors text-left"
              >
                🎯 Task Complete
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playStreak();
                }}
                className="px-3 py-2 bg-zinc-950 hover:bg-orange-950/30 border border-zinc-800 hover:border-orange-500/40 rounded-xl text-xs font-bold text-orange-400 transition-colors text-left"
              >
                🔥 Streak Power
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playLevelUp();
                }}
                className="px-3 py-2 bg-zinc-950 hover:bg-amber-950/30 border border-zinc-800 hover:border-amber-500/40 rounded-xl text-xs font-bold text-amber-300 transition-colors text-left"
              >
                👑 Level Up Fanfare
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playAchievement();
                }}
                className="px-3 py-2 bg-zinc-950 hover:bg-yellow-950/30 border border-zinc-800 hover:border-yellow-500/40 rounded-xl text-xs font-bold text-yellow-400 transition-colors text-left"
              >
                🏆 Trophy Chime
              </button>
            </div>
          </div>
        </div>

        {/* 5. Upcoming Event Notifications & Alerts */}
        <div className="p-6 bg-zinc-900/90 border border-zinc-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              Event Notifications & Upcoming Alerts
            </h3>
            {notificationPermission === 'granted' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" /> Notifications Active
              </span>
            ) : notificationPermission === 'denied' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/30">
                <AlertTriangle className="w-3 h-3" /> Blocked in Browser
              </span>
            ) : (
              <button
                type="button"
                onClick={() => requestNotificationPermission()}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 px-3 py-1 rounded-xl border border-amber-500/40 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Enable Push Alerts
              </button>
            )}
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            The website actively checks your calendar events and deadlines in real-time, dispatching browser push notifications, sound chimes, and optional Jarvis speech announcements before each event.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Lead Time (Before Event)
              </label>
              <select
                value={state.settings.notifications?.notifyBeforeMinutes || 15}
                onChange={(e) =>
                  updateSettings({
                    notifications: {
                      ...state.settings.notifications,
                      notifyBeforeMinutes: parseInt(e.target.value) || 15,
                    },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
              >
                <option value={5}>5 Minutes Before</option>
                <option value={10}>10 Minutes Before</option>
                <option value={15}>15 Minutes Before (Standard)</option>
                <option value={30}>30 Minutes Before</option>
                <option value={60}>1 Hour Before</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
              <div>
                <p className="text-xs font-bold text-white">Browser Push Alerts</p>
                <p className="text-[10px] text-zinc-500">Desktop & mobile cards</p>
              </div>
              <input
                type="checkbox"
                checked={state.settings.notifications?.browserNotifications !== false}
                onChange={(e) =>
                  updateSettings({
                    notifications: {
                      ...state.settings.notifications,
                      browserNotifications: e.target.checked,
                    },
                  })
                }
                className="rounded bg-zinc-800 border-zinc-700 text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
              <div>
                <p className="text-xs font-bold text-white">Jarvis Voice Readout</p>
                <p className="text-[10px] text-zinc-500">Spoken announcement</p>
              </div>
              <input
                type="checkbox"
                checked={state.settings.notifications?.voiceAnnounce !== false}
                onChange={(e) =>
                  updateSettings({
                    notifications: {
                      ...state.settings.notifications,
                      voiceAnnounce: e.target.checked,
                    },
                  })
                }
                className="rounded bg-zinc-800 border-zinc-700 text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={testEventNotification}
              className="py-2.5 px-4 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:scale-[1.01]"
            >
              <Play className="w-3.5 h-3.5 fill-amber-300" />
              Send Test Upcoming Event Notification Now
            </button>
          </div>
        </div>

        {/* 6. JARVIS Voice Engine & Speech Clarity */}
        <div className="p-6 bg-zinc-900/90 border border-zinc-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Bot className="w-4 h-4 text-cyan-400" />
              JARVIS Voice Engine & Speech Clarity Calibration
            </h3>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
              Natural Acoustics
            </span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Enhances speech clarity by stripping punctuation, expanding school acronyms (like IB, HL, SL, IA), prioritizing natural neural voices, and tuning articulation cadence.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Voice Accent & Provider
              </label>
              <select
                value={state.settings.jarvis?.selectedVoiceURI || ''}
                onChange={(e) => setJarvisVoice(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400"
              >
                <option value="">Auto-Selected Natural Voice (Recommended)</option>
                {voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang}) {v.isNatural ? '★ Natural' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                <span>Cadence (Speed):</span>
                <span className="font-mono text-cyan-400">
                  {(state.settings.jarvis?.speechRate || 0.98).toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.2"
                step="0.02"
                value={state.settings.jarvis?.speechRate || 0.98}
                onChange={(e) =>
                  setJarvisCadence(
                    parseFloat(e.target.value),
                    state.settings.jarvis?.speechPitch || 1.0
                  )
                }
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-zinc-800 rounded-lg mt-2"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                <span>Clear & Deliberate</span>
                <span>Normal</span>
                <span>Fast</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                <span>Voice Pitch:</span>
                <span className="font-mono text-cyan-400">
                  {(state.settings.jarvis?.speechPitch || 1.0).toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.85"
                max="1.15"
                step="0.05"
                value={state.settings.jarvis?.speechPitch || 1.0}
                onChange={(e) =>
                  setJarvisCadence(
                    state.settings.jarvis?.speechRate || 0.98,
                    parseFloat(e.target.value)
                  )
                }
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-zinc-800 rounded-lg mt-2"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                <span>Deep</span>
                <span>Natural</span>
                <span>High</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() =>
                testJarvisVoice(
                  'Good day, Tyler. Jarvis speech synthesis has been calibrated for crystal clear clarity.'
                )
              }
              className="py-2.5 px-4 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:scale-[1.01]"
            >
              <Play className="w-3.5 h-3.5 fill-cyan-300" />
              Test Voice Clarity Aloud
            </button>
          </div>
        </div>

        {/* Save button */}
        <button
          type="submit"
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-extrabold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
        >
          <Save className="w-4 h-4" />
          <span>SAVE CUSTOM SETTINGS</span>
        </button>
      </form>

      {/* 5. Data Management (Export / Import / Reset) */}
      <div className="p-6 bg-zinc-900/90 border border-zinc-800 rounded-3xl space-y-4">
        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-zinc-400" />
          Data Backup & Clean Reset
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Export */}
          <button
            type="button"
            onClick={handleExportData}
            className="p-4 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-2xl text-left transition-colors flex items-center gap-3"
          >
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Export Backup</p>
              <p className="text-[10px] text-zinc-500">Save JSON file</p>
            </div>
          </button>

          {/* Import */}
          <label className="p-4 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-2xl text-left transition-colors flex items-center gap-3 cursor-pointer">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Import Backup</p>
              <p className="text-[10px] text-zinc-500">Restore from JSON</p>
            </div>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          {/* Reset */}
          <button
            type="button"
            onClick={handleReset}
            className="p-4 bg-zinc-950 hover:bg-rose-950/40 border border-zinc-800 hover:border-rose-500/40 rounded-2xl text-left transition-colors flex items-center gap-3"
          >
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-400">Reset Data</p>
              <p className="text-[10px] text-zinc-500">Return to defaults</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
