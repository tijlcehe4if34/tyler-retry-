import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  AppState,
  CalendarEvent,
  CustomChecklist,
  GameItem,
  PriorityLevel,
  RedeemedReward,
  ReminderItem,
  RewardItem,
  StudySession,
  GamingSession,
  Subject,
  Task,
  ChecklistItem,
  AppSettings,
  GamifiedNotification,
  GamifiedNotificationType,
  TaskStatus,
  StudyNote,
  Quiz,
  QuizQuestion,
  QuizAttempt,
  StudyPlan,
  StudyGoal,
  JarvisLogItem,
  JarvisConfirmation,
} from '../types';
import {
  calculateLevel,
  loadAppState,
  saveAppState,
  getInitialState,
  DEFAULT_ACHIEVEMENTS,
} from '../lib/storage';
import { getTodayString, addDays } from '../lib/dateUtils';
import { sound } from '../lib/sound';
import { fireConfetti, fireSuperConfetti } from '../lib/confetti';
import { speechEngine, VoiceOption } from '../lib/speechEngine';
import { notificationManager, NotificationPermissionState } from '../lib/notificationManager';
import { cloudSync, SyncStatus } from '../lib/cloudSync';
import { User } from 'firebase/auth';

export interface StudyTimerState {
  isActive: boolean;
  secondsRemaining: number;
  initialDurationSeconds: number;
  selectedSubjectId: string;
  sessionNotes: string;
  presetMinutes: number;
  isCustomMode: boolean;
  customMinutesInput: number;
}

interface AppContextType {
  state: AppState;
  levelInfo: {
    level: number;
    currentLevelXp: number;
    nextLevelXp: number;
    progressPercent: number;
  };
  todayTasks: Task[];
  upcomingEvents: CalendarEvent[];
  todayStudyMinutes: number;
  todayGamingMinutes: number;
  completedTasksCountToday: number;
  discordFreeDaysCount: number;
  isDiscordFreeToday: boolean;
  
  // Gamified Notifications & Level Up Modal
  notifications: GamifiedNotification[];
  dismissNotification: (id: string) => void;
  pushNotification: (notif: Omit<GamifiedNotification, 'id' | 'timestamp'>) => void;
  levelUpModal: { isOpen: boolean; level: number };
  closeLevelUpModal: () => void;

  // Focus Mode
  isFocusMode: boolean;
  toggleFocusMode: (explicitVal?: boolean) => void;
  setFocusMode: (val: boolean) => void;

  // Global Study Timer State & Controls
  studyTimer: StudyTimerState;
  startStudyTimer: () => void;
  pauseStudyTimer: () => void;
  resetStudyTimer: () => void;
  setStudyTimerDuration: (minutes: number, isCustom?: boolean) => void;
  setStudySubjectId: (id: string) => void;
  setStudySessionNotes: (notes: string) => void;
  setCustomMinutesInput: (mins: number) => void;
  finishStudySessionEarly: () => void;
  completeStudySession: () => void;
  
  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  clearCompletedTasks: () => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;

  // Study Notes Actions
  addNote: (note: Omit<StudyNote, 'id' | 'createdAt' | 'updatedAt'>) => StudyNote;
  updateNote: (id: string, updates: Partial<StudyNote>) => void;
  deleteNote: (id: string) => void;

  // Quiz Actions
  addQuiz: (quiz: Omit<Quiz, 'id' | 'createdAt'>) => Quiz;
  deleteQuiz: (id: string) => void;
  recordQuizAttempt: (attempt: Omit<QuizAttempt, 'id' | 'timestamp'>) => void;

  // Study Plan Actions
  addStudyPlan: (plan: Omit<StudyPlan, 'id' | 'createdAt'>) => StudyPlan;
  deleteStudyPlan: (id: string) => void;
  togglePlanSessionComplete: (planId: string, sessionId: string) => void;

  // Study Goal Actions
  addGoal: (goal: Omit<StudyGoal, 'id'>) => StudyGoal;
  updateGoal: (id: string, updates: Partial<StudyGoal>) => void;
  deleteGoal: (id: string) => void;
  incrementGoalProgress: (id: string, minutes: number) => void;

  // Navigation Trigger
  targetNavTab: string | null;
  setTargetNavTab: (tab: string | null) => void;

  // JARVIS AI System
  isJarvisOpen: boolean;
  setIsJarvisOpen: (open: boolean) => void;
  isJarvisListening: boolean;
  isJarvisProcessing: boolean;
  isJarvisSpeaking: boolean;
  jarvisTranscript: string;
  jarvisResponse: string;
  jarvisConfirmation: JarvisConfirmation;
  startJarvisListening: () => void;
  stopJarvisListening: () => void;
  submitJarvisCommand: (command: string, isVoice?: boolean) => Promise<{ reply: string; actionCount: number }>;
  confirmJarvisAction: () => void;
  cancelJarvisAction: () => void;
  speakJarvisText: (text: string) => void;
  stopJarvisSpeaking: () => void;

  // Calendar Event Actions
  addEvent: (event: Omit<CalendarEvent, 'id'>) => CalendarEvent;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;

  // Subject Actions
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  // Game Actions
  addGame: (game: Omit<GameItem, 'id'>) => void;
  updateGame: (id: string, updates: Partial<GameItem>) => void;
  deleteGame: (id: string) => void;

  // Session Trackers
  addStudySession: (session: Omit<StudySession, 'id' | 'timestamp'>) => void;
  deleteStudySession: (id: string) => void;
  addGamingSession: (session: Omit<GamingSession, 'id' | 'timestamp'>) => void;

  // Checklist Actions
  addCustomChecklist: (checklist: Omit<CustomChecklist, 'id'>) => void;
  updateCustomChecklist: (id: string, updates: Partial<CustomChecklist>) => void;
  deleteCustomChecklist: (id: string) => void;
  toggleChecklistItem: (checklistId: string, itemId: string) => void;
  addChecklistItem: (checklistId: string, text: string) => void;
  deleteChecklistItem: (checklistId: string, itemId: string) => void;
  resetChecklist: (checklistId: string) => void;

  // Reward Shop Actions
  addReward: (reward: Omit<RewardItem, 'id'>) => void;
  updateReward: (id: string, updates: Partial<RewardItem>) => void;
  deleteReward: (id: string) => void;
  redeemReward: (rewardId: string) => boolean;

  // Discord Break Actions
  toggleDiscordCheckIn: (dateStr: string) => void;
  addDiscordReflection: (text: string) => void;

  // Reminder Actions
  addReminder: (reminder: Omit<ReminderItem, 'id'>) => void;
  updateReminder: (id: string, updates: Partial<ReminderItem>) => void;
  deleteReminder: (id: string) => void;

  // Cloud Sync & Cross-Device Persistence
  currentUser: User | null;
  syncStatus: SyncStatus;
  lastSyncTime: Date | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  flushCloudSync: () => Promise<void>;

  // Voice Clarity & Notification Management
  notificationPermission: NotificationPermissionState;
  requestNotificationPermission: () => Promise<boolean>;
  testEventNotification: () => void;
  testJarvisVoice: (sampleText?: string) => void;
  getAvailableVoices: () => VoiceOption[];
  setJarvisVoice: (voiceURI: string) => void;
  setJarvisCadence: (rate: number, pitch: number) => void;

  // Settings & XP Actions
  awardXp: (amount: number, reason: string) => void;
  maintainStreak: (reason?: string) => void;
  updateSettings: (newSettings: any) => void;
  resetAllData: () => void;
  importData: (imported: AppState) => boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [notifications, setNotifications] = useState<GamifiedNotification[]>([]);
  const [levelUpModal, setLevelUpModal] = useState<{ isOpen: boolean; level: number }>({
    isOpen: false,
    level: 1,
  });

  // Focus Mode State
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

  // Cloud Sync & Cross-Device Persistence State
  const [currentUser, setCurrentUser] = useState<User | null>(() => cloudSync.getCurrentUser());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // External Navigation Trigger
  const [targetNavTab, setTargetNavTab] = useState<string | null>(null);

  // Notification Permissions State
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermissionState>(
    () => notificationManager.getPermissionStatus()
  );

  // JARVIS State
  const [isJarvisOpen, setIsJarvisOpen] = useState<boolean>(false);
  const [isJarvisListening, setIsJarvisListening] = useState<boolean>(false);
  const [isJarvisProcessing, setIsJarvisProcessing] = useState<boolean>(false);
  const [isJarvisSpeaking, setIsJarvisSpeaking] = useState<boolean>(false);
  const [jarvisTranscript, setJarvisTranscript] = useState<string>('');
  const [jarvisResponse, setJarvisResponse] = useState<string>(
    'Good day, Tyler. How may I assist your productivity or studies today?'
  );
  const [jarvisConfirmation, setJarvisConfirmation] = useState<JarvisConfirmation>({
    isOpen: false,
    title: '',
    message: '',
    actionType: '',
    pendingActions: [],
  });

  // Global Study Timer State
  const [studyTimer, setStudyTimer] = useState<StudyTimerState>(() => ({
    isActive: false,
    secondsRemaining: 25 * 60,
    initialDurationSeconds: 25 * 60,
    selectedSubjectId: state.subjects[0]?.id || 'sub_math',
    sessionNotes: '',
    presetMinutes: 25,
    isCustomMode: false,
    customMinutesInput: 45,
  }));

  // Keep selectedSubjectId aligned if subjects change and subject was removed
  useEffect(() => {
    if (!state.subjects.some((s) => s.id === studyTimer.selectedSubjectId) && state.subjects.length > 0) {
      setStudyTimer((prev) => ({ ...prev, selectedSubjectId: state.subjects[0].id }));
    }
  }, [state.subjects, studyTimer.selectedSubjectId]);

  // Sync state to local storage and Firestore with debouncing for zero typing delay
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    sound.enabled = state.settings.appearance.soundEnabled;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    // 250ms debounce for local storage: prevents blocking UI during fast typing
    saveTimeoutRef.current = setTimeout(() => {
      saveAppState(state);
    }, 250);

    // Debounced schedule save to Firebase Firestore
    cloudSync.scheduleSave(state);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state]);

  // Flush on page unload to prevent any data loss
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveAppState(state);
      cloudSync.flushPendingSave();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const pushNotification = useCallback(
    (notif: Omit<GamifiedNotification, 'id' | 'timestamp'>) => {
      const id = 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
      const duration = notif.duration || 4500;
      const newNotif: GamifiedNotification = {
        ...notif,
        id,
        timestamp: Date.now(),
        duration,
      };

      setNotifications((prev) => [newNotif, ...prev.slice(0, 3)]); // Keep max 4 visible

      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, duration);
    },
    []
  );

  const closeLevelUpModal = useCallback(() => {
    setLevelUpModal({ isOpen: false, level: 1 });
  }, []);

  // Register Cloud Sync Real-time callbacks (cross-device sync)
  useEffect(() => {
    cloudSync.registerCallbacks({
      onRemoteStateReceived: (remoteState) => {
        setState((prev) => ({
          ...prev,
          ...remoteState,
          tasks: remoteState.tasks || prev.tasks,
          events: remoteState.events || prev.events,
          customChecklists: remoteState.customChecklists || prev.customChecklists,
          subjects: remoteState.subjects || prev.subjects,
          studySessions: remoteState.studySessions || prev.studySessions,
          notes: remoteState.notes || prev.notes,
          quizzes: remoteState.quizzes || prev.quizzes,
          rewards: remoteState.rewards || prev.rewards,
        }));
        pushNotification({
          type: 'info',
          title: 'Synced Across Devices',
          subtitle: 'Updated to the latest workspace state from cloud.',
          icon: 'Cloud',
          badgeText: 'CROSS-DEVICE',
          duration: 3000,
        });
      },
      onSyncStatusChange: (status, syncTime) => {
        setSyncStatus(status);
        if (syncTime) setLastSyncTime(syncTime);
        setCurrentUser(cloudSync.getCurrentUser());
      },
    });
  }, [pushNotification]);

  const signInWithGoogle = useCallback(async () => {
    try {
      sound.playClick();
      const user = await cloudSync.signInWithGoogle();
      setCurrentUser(user);
      pushNotification({
        type: 'achievement_unlock',
        title: 'Signed in with Google!',
        subtitle: `Cross-device sync active for ${user.email}.`,
        icon: 'Cloud',
        badgeText: 'CLOUD SYNC',
        duration: 4000,
      });
      // Immediately schedule backup
      cloudSync.scheduleSave(state);
    } catch (err: unknown) {
      console.error('Sign in error:', err);
      pushNotification({
        type: 'info',
        title: 'Sign In Failed or Cancelled',
        subtitle: err instanceof Error ? err.message : 'Could not complete Google sign-in.',
        icon: 'AlertCircle',
        badgeText: 'AUTH',
        duration: 4000,
      });
    }
  }, [pushNotification, state]);

  const signOutUser = useCallback(async () => {
    try {
      sound.playClick();
      await cloudSync.signOut();
      setCurrentUser(null);
      pushNotification({
        type: 'info',
        title: 'Signed Out',
        subtitle: 'Local workspace data is preserved safely on this device.',
        icon: 'LogOut',
        badgeText: 'AUTH',
        duration: 3500,
      });
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }, [pushNotification]);

  const flushCloudSync = useCallback(async () => {
    await cloudSync.flushPendingSave();
  }, []);

  // Ensure any checklists are automatically reflected as events on the daily calendar
  useEffect(() => {
    setState((prev) => {
      let eventsUpdated = false;
      const currentEvents = [...prev.events];

      for (const list of prev.customChecklists) {
        if (list.autoSyncCalendar !== false) {
          const hasLinkedEvent = currentEvents.some(
            (e) => e.sourceChecklistId === list.id || (list.calendarEventId && e.id === list.calendarEventId)
          );
          if (!hasLinkedEvent) {
            const completedCount = list.items.filter((i) => i.completed).length;
            const totalCount = list.items.length;
            const allDone = totalCount > 0 && completedCount === totalCount;
            const targetDate = list.scheduledDate || getTodayString();
            const startTime = list.scheduledTime || (list.category === 'Routine' ? '07:30' : '10:00');

            const [h, m] = startTime.split(':').map(Number);
            const totalMins = (h * 60 + (m || 0) + 30) % 1440;
            const endH = String(Math.floor(totalMins / 60)).padStart(2, '0');
            const endM = String(totalMins % 60).padStart(2, '0');
            const endTime = `${endH}:${endM}`;

            currentEvents.push({
              id: 'evt_chk_' + list.id,
              title: `📋 ${list.title} (${completedCount}/${totalCount})`,
              date: targetDate,
              startTime,
              endTime,
              description:
                list.items.length > 0
                  ? list.items.map((it) => `${it.completed ? '☑' : '☐'} ${it.text}`).join('\n')
                  : 'No checklist items yet.',
              category: 'Checklist',
              priority: allDone ? 'low' : 'medium',
              color: allDone ? '#10b981' : '#6366f1',
              sourceType: 'checklist',
              sourceChecklistId: list.id,
            });
            eventsUpdated = true;
          }
        }
      }

      if (eventsUpdated) {
        return { ...prev, events: currentEvents };
      }
      return prev;
    });
  }, []);

  // Compute level dynamically based on current total XP
  const levelInfo = useMemo(() => {
    return calculateLevel(
      state.currentXP,
      state.settings.xpRules.baseLevelXp,
      state.settings.xpRules.levelMultiplier
    );
  }, [state.currentXP, state.settings.xpRules]);

  // STREAK MAINTENANCE & EXTENSION ENGINE
  const maintainStreak = useCallback((activityReason = 'Daily Lock-In') => {
    const today = getTodayString();
    const yesterday = addDays(today, -1);

    setState((prev) => {
      // If already active today, streak is already secured for today
      if (prev.lastActiveDate === today) {
        return prev;
      }

      let newStreak = 1;
      let isContinued = false;

      if (prev.lastActiveDate === yesterday && prev.streakCount > 0) {
        newStreak = prev.streakCount + 1;
        isContinued = true;
      } else {
        newStreak = 1;
        isContinued = false;
      }

      // Play fiery audio sound & celebratory particle burst
      sound.playStreak();
      fireConfetti();

      // Trigger gamified streak notification
      pushNotification({
        type: 'streak_maintained',
        title: isContinued ? `🔥 STREAK EXTENDED: ${newStreak} DAYS!` : `🔥 LOCK-IN STREAK STARTED: DAY 1!`,
        subtitle: isContinued
          ? `Lock-in streak maintained with ${activityReason}! +15 Streak Bonus XP`
          : `First productive lock-in of your streak journey! +15 Bonus XP`,
        xpChange: 15,
        streak: newStreak,
        badgeText: `STREAK #${newStreak}`,
        duration: 5000,
      });

      const tx = {
        id: 'tx_streak_' + Date.now(),
        timestamp: Date.now(),
        date: today,
        amount: 15,
        type: 'gain' as const,
        reason: `Streak Lock-In Day #${newStreak}`,
      };

      return {
        ...prev,
        streakCount: newStreak,
        lastActiveDate: today,
        currentXP: prev.currentXP + 15,
        totalXpEarned: prev.totalXpEarned + 15,
        xpTransactions: [tx, ...prev.xpTransactions],
      };
    });
  }, [pushNotification]);

  // Check achievements automatically whenever state changes
  const checkAchievements = useCallback((currentState: AppState) => {
    const todayStr = getTodayString();
    const totalStudyHours = currentState.studySessions.reduce((acc, s) => acc + s.durationMinutes, 0) / 60;
    const discordDays = Object.values(currentState.discordBreak.checkIns).filter(Boolean).length;
    const totalCompletedTasks = currentState.tasks.filter(t => t.completed || (t.completedDates && t.completedDates.length > 0)).length;
    const currLvl = calculateLevel(currentState.currentXP, currentState.settings.xpRules.baseLevelXp, currentState.settings.xpRules.levelMultiplier).level;

    let modified = false;
    const updatedAchievements = currentState.achievements.map((ach) => {
      if (ach.unlockedAt) return ach;
      let shouldUnlock = false;

      if (ach.requirementType === 'streak' && currentState.streakCount >= ach.requirementValue) {
        shouldUnlock = true;
      } else if (ach.requirementType === 'study_hours' && totalStudyHours >= ach.requirementValue) {
        shouldUnlock = true;
      } else if (ach.requirementType === 'discord_days' && discordDays >= ach.requirementValue) {
        shouldUnlock = true;
      } else if (ach.requirementType === 'tasks_count' && totalCompletedTasks >= ach.requirementValue) {
        shouldUnlock = true;
      } else if (ach.requirementType === 'level' && currLvl >= ach.requirementValue) {
        shouldUnlock = true;
      }

      if (shouldUnlock) {
        modified = true;
        sound.playAchievement();
        fireSuperConfetti();
        pushNotification({
          type: 'achievement_unlock',
          title: `🏆 TROPHY UNLOCKED: ${ach.title}`,
          subtitle: `${ach.description} (+${ach.xpReward} XP)`,
          xpChange: ach.xpReward,
          icon: ach.icon,
          badgeText: 'ACHIEVEMENT',
          duration: 6000,
        });
        return { ...ach, unlockedAt: todayStr };
      }
      return ach;
    });

    if (modified) {
      setState(prev => ({ ...prev, achievements: updatedAchievements }));
    }
  }, [pushNotification]);

  // Award XP with automatic sound, transaction log, level-up celebration, and achievement checks
  const awardXp = useCallback((amount: number, reason: string) => {
    if (amount === 0) return;
    const today = getTodayString();
    
    setState((prev) => {
      const oldLevelInfo = calculateLevel(
        prev.currentXP,
        prev.settings.xpRules.baseLevelXp,
        prev.settings.xpRules.levelMultiplier
      );
      
      const newCurrentXp = Math.max(0, prev.currentXP + amount);
      const newTotalXp = amount > 0 ? prev.totalXpEarned + amount : prev.totalXpEarned;

      const newLevelInfo = calculateLevel(
        newCurrentXp,
        prev.settings.xpRules.baseLevelXp,
        prev.settings.xpRules.levelMultiplier
      );

      // Check level up event
      if (newLevelInfo.level > oldLevelInfo.level) {
        sound.playLevelUp();
        fireSuperConfetti();
        setLevelUpModal({ isOpen: true, level: newLevelInfo.level });
        pushNotification({
          type: 'level_up',
          title: `👑 LEVEL UP: LEVEL ${newLevelInfo.level}!`,
          subtitle: `Congratulations! You climbed from Level ${oldLevelInfo.level} to ${newLevelInfo.level}!`,
          xpChange: amount,
          level: newLevelInfo.level,
          badgeText: `LEVEL ${newLevelInfo.level}`,
          duration: 6500,
        });
      } else if (amount > 0) {
        sound.playXpGain();
        pushNotification({
          type: 'xp_gain',
          title: `+${amount} XP Earned!`,
          subtitle: reason,
          xpChange: amount,
          icon: 'Sparkles',
          badgeText: 'XP GAIN',
          duration: 3500,
        });
      }

      const tx = {
        id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        timestamp: Date.now(),
        date: today,
        amount,
        type: (amount > 0 ? 'gain' : 'spend') as 'gain' | 'spend',
        reason,
      };

      const next = {
        ...prev,
        currentXP: newCurrentXp,
        totalXpEarned: newTotalXp,
        xpTransactions: [tx, ...prev.xpTransactions],
      };

      setTimeout(() => checkAchievements(next), 200);
      return next;
    });
  }, [checkAchievements, pushNotification]);

  // STUDY SESSION TRACKER (Supports live timer sessions and offline/manual sessions)
  const addStudySession = useCallback((sessionData: Omit<StudySession, 'id' | 'timestamp'>) => {
    const isManual = sessionData.method === 'manual' || !!sessionData.loggedWithoutTimer;
    const newSession: StudySession = {
      ...sessionData,
      id: 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
      method: isManual ? 'manual' : (sessionData.method || 'timer'),
      loggedWithoutTimer: isManual,
    };
    setState((prev) => {
      const next = {
        ...prev,
        studySessions: [newSession, ...prev.studySessions],
      };
      setTimeout(() => checkAchievements(next), 200);
      return next;
    });

    sound.playStudyComplete();
    fireConfetti();

    pushNotification({
      type: 'study_complete',
      title: isManual ? '📖 OFFLINE STUDY LOGGED!' : '🧠 STUDY LAB COMPLETED!',
      subtitle: isManual
        ? `Logged ${sessionData.durationMinutes} minutes of self-study without the timer. Great initiative!`
        : `Finished ${sessionData.durationMinutes} minutes of focused study. Keep sharpening your mind!`,
      xpChange: sessionData.xpEarned,
      icon: 'BookOpen',
      badgeText: isManual ? 'OFFLINE STUDY' : 'FOCUS LAB',
      duration: 5000,
    });

    if (sessionData.xpEarned > 0) {
      setTimeout(() => awardXp(sessionData.xpEarned, `${isManual ? 'Offline Study' : 'Study Lab'}: ${sessionData.durationMinutes}m`), 100);
    }

    // Maintain streak on study completion
    setTimeout(() => maintainStreak(`Study: ${sessionData.durationMinutes}m Session`), 150);
  }, [awardXp, checkAchievements, maintainStreak, pushNotification]);

  const deleteStudySession = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      studySessions: prev.studySessions.filter((s) => s.id !== id),
    }));
    sound.playClick();
    pushNotification({
      type: 'info',
      title: 'Session Removed',
      subtitle: 'Study session record was removed from your history.',
      icon: 'Trash2',
      badgeText: 'STATS',
      duration: 3500,
    });
  }, [pushNotification]);

  // COMPLETE STUDY SESSION LOGIC
  const completeStudySession = useCallback(() => {
    sound.playTimerFinish();
    fireConfetti();

    setStudyTimer((currTimer) => {
      const elapsedMinutes = Math.max(1, Math.round(currTimer.initialDurationSeconds / 60));
      const xpPer25 = state.settings.xpRules.xpPer25MinStudy || 10;
      const xpEarned = Math.max(5, Math.round((elapsedMinutes / 25) * xpPer25));

      addStudySession({
        date: getTodayString(),
        subjectId: currTimer.selectedSubjectId,
        durationMinutes: elapsedMinutes,
        notes: currTimer.sessionNotes.trim() || undefined,
        xpEarned,
        method: 'timer',
        loggedWithoutTimer: false,
      });

      return {
        ...currTimer,
        isActive: false,
        secondsRemaining: currTimer.initialDurationSeconds,
        sessionNotes: '',
      };
    });
  }, [addStudySession, state.settings.xpRules.xpPer25MinStudy]);

  // Finish study session early
  const finishStudySessionEarly = useCallback(() => {
    setStudyTimer((currTimer) => {
      const elapsedSeconds = currTimer.initialDurationSeconds - currTimer.secondsRemaining;
      if (elapsedSeconds < 60) {
        sound.playClick();
        return {
          ...currTimer,
          isActive: false,
          secondsRemaining: currTimer.initialDurationSeconds,
        };
      }

      const elapsedMinutes = Math.round(elapsedSeconds / 60);
      const xpPer25 = state.settings.xpRules.xpPer25MinStudy || 10;
      const xpEarned = Math.max(5, Math.round((elapsedMinutes / 25) * xpPer25));

      addStudySession({
        date: getTodayString(),
        subjectId: currTimer.selectedSubjectId,
        durationMinutes: elapsedMinutes,
        notes: currTimer.sessionNotes.trim() || undefined,
        xpEarned,
        method: 'timer',
        loggedWithoutTimer: false,
      });

      return {
        ...currTimer,
        isActive: false,
        secondsRemaining: currTimer.initialDurationSeconds,
        sessionNotes: '',
      };
    });
  }, [addStudySession, state.settings.xpRules.xpPer25MinStudy]);

  // GLOBAL TIMER ENGINE (Ticks accurately)
  useEffect(() => {
    let interval: number | null = null;
    if (studyTimer.isActive && studyTimer.secondsRemaining > 0) {
      interval = window.setInterval(() => {
        setStudyTimer((prev) => {
          if (prev.secondsRemaining <= 1) {
            // Reached zero!
            return {
              ...prev,
              secondsRemaining: 0,
              isActive: false,
            };
          }
          return {
            ...prev,
            secondsRemaining: prev.secondsRemaining - 1,
          };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [studyTimer.isActive, studyTimer.secondsRemaining]);

  // Handle completion when secondsRemaining hits 0
  const isCompletingRef = useRef(false);
  useEffect(() => {
    if (studyTimer.secondsRemaining === 0 && !studyTimer.isActive && !isCompletingRef.current) {
      isCompletingRef.current = true;
      completeStudySession();
      setTimeout(() => {
        isCompletingRef.current = false;
      }, 1000);
    }
  }, [studyTimer.secondsRemaining, studyTimer.isActive, completeStudySession]);

  // Study timer controls
  const startStudyTimer = useCallback(() => {
    sound.playClick();
    setStudyTimer((prev) => ({ ...prev, isActive: true }));
  }, []);

  const pauseStudyTimer = useCallback(() => {
    sound.playClick();
    setStudyTimer((prev) => ({ ...prev, isActive: false }));
  }, []);

  const resetStudyTimer = useCallback(() => {
    sound.playClick();
    setStudyTimer((prev) => ({
      ...prev,
      isActive: false,
      secondsRemaining: prev.initialDurationSeconds,
    }));
  }, []);

  const setStudyTimerDuration = useCallback((minutes: number, isCustom = false) => {
    const mins = Math.max(1, Math.min(240, minutes));
    const seconds = mins * 60;
    setStudyTimer((prev) => ({
      ...prev,
      isActive: false,
      presetMinutes: mins,
      isCustomMode: isCustom,
      secondsRemaining: seconds,
      initialDurationSeconds: seconds,
    }));
  }, []);

  const setStudySubjectId = useCallback((id: string) => {
    setStudyTimer((prev) => ({ ...prev, selectedSubjectId: id }));
  }, []);

  const setStudySessionNotes = useCallback((notes: string) => {
    setStudyTimer((prev) => ({ ...prev, sessionNotes: notes }));
  }, []);

  const setCustomMinutesInput = useCallback((mins: number) => {
    setStudyTimer((prev) => ({ ...prev, customMinutesInput: mins }));
  }, []);

  // FOCUS MODE TOGGLE
  const toggleFocusMode = useCallback(
    (explicitVal?: boolean) => {
      setIsFocusMode((prev) => {
        const nextVal = typeof explicitVal === 'boolean' ? explicitVal : !prev;
        sound.playFocusToggle(nextVal);
        if (nextVal) {
          pushNotification({
            type: 'info',
            title: '🧘 Focus Mode Activated',
            subtitle: 'Distractions muted & screen dimmed. Time to lock in.',
            icon: 'Sparkles',
            badgeText: 'FOCUS MODE',
            duration: 3500,
          });
        } else {
          sound.stopAmbientSound();
        }
        return nextVal;
      });
    },
    [pushNotification]
  );

  const setFocusMode = useCallback(
    (val: boolean) => {
      toggleFocusMode(val);
    },
    [toggleFocusMode]
  );

  // Global Keyboard listener for Focus Mode (Escape to exit, 'f' to toggle when not in input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInput =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute('contenteditable') === 'true';

      if (e.key === 'Escape' && isFocusMode) {
        e.preventDefault();
        toggleFocusMode(false);
      } else if ((e.key === 'f' || e.key === 'F') && !isInput && !e.metaKey && !e.ctrlKey && !e.altKey) {
        // Toggle focus mode
        e.preventDefault();
        toggleFocusMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode, toggleFocusMode]);

  // Today helpers
  const today = getTodayString();

  const todayTasks = useMemo(() => {
    const todayDate = new Date();
    const todayDayOfWeek = todayDate.getDay(); // 0-6

    return state.tasks.filter((t) => {
      if (t.repeatType === 'daily') return true;
      if (t.repeatType === 'weekly' && t.repeatDays?.includes(todayDayOfWeek)) return true;
      if (t.dueDate === today) return true;
      if (!t.dueDate && !t.completed) return true;
      return false;
    });
  }, [state.tasks, today]);

  const upcomingEvents = useMemo(() => {
    return state.events
      .filter((e) => e.date >= today)
      .sort((a, b) => {
        if (a.date === b.date) {
          return (a.startTime || '').localeCompare(b.startTime || '');
        }
        return a.date.localeCompare(b.date);
      });
  }, [state.events, today]);

  const todayStudyMinutes = useMemo(() => {
    return state.studySessions
      .filter((s) => s.date === today)
      .reduce((acc, s) => acc + s.durationMinutes, 0);
  }, [state.studySessions, today]);

  const todayGamingMinutes = useMemo(() => {
    return state.gamingSessions
      .filter((s) => s.date === today)
      .reduce((acc, s) => acc + s.durationMinutes, 0);
  }, [state.gamingSessions, today]);

  const completedTasksCountToday = useMemo(() => {
    return state.tasks.filter((t) => {
      if (t.completedDates && t.completedDates.includes(today)) return true;
      if (t.completed && t.dueDate === today) return true;
      return false;
    }).length;
  }, [state.tasks, today]);

  const discordFreeDaysCount = useMemo(() => {
    return Object.values(state.discordBreak.checkIns).filter(Boolean).length;
  }, [state.discordBreak.checkIns]);

  const isDiscordFreeToday = useMemo(() => {
    return !!state.discordBreak.checkIns[today];
  }, [state.discordBreak.checkIns, today]);

  // TASK ACTIONS
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt'>): Task => {
    const newTask: Task = {
      ...taskData,
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      createdAt: getTodayString(),
    };
    setState((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
    sound.playClick();
    pushNotification({
      type: 'info',
      title: 'Task Created',
      subtitle: newTask.title,
      icon: 'CheckSquare',
      badgeText: newTask.category,
      duration: 3000,
    });
    return newTask;
  }, [pushNotification]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
    sound.playClick();
  }, []);

  const toggleTaskComplete = useCallback((id: string) => {
    const todayStr = getTodayString();
    setState((prev) => {
      const task = prev.tasks.find((t) => t.id === id);
      if (!task) return prev;

      const isNowCompleted = !task.completed;
      let completedDates = task.completedDates || [];

      if (isNowCompleted) {
        sound.playTaskComplete();
        fireConfetti();
        if (!completedDates.includes(todayStr)) {
          completedDates = [...completedDates, todayStr];
        }

        const xpAmount = task.xpReward || prev.settings.xpRules.xpPerTask || 20;

        // Push Task Complete Notification
        pushNotification({
          type: 'task_complete',
          title: `🎯 TASK COMPLETED!`,
          subtitle: task.title,
          xpChange: xpAmount,
          icon: 'CheckCircle2',
          badgeText: task.category,
          duration: 4500,
        });

        // Award XP
        setTimeout(() => awardXp(xpAmount, `Completed: ${task.title}`), 50);

        // Maintain or start streak
        setTimeout(() => maintainStreak(`Task Completion: ${task.title}`), 100);
      } else {
        completedDates = completedDates.filter((d) => d !== todayStr);
      }

      const updatedTasks = prev.tasks.map((t) =>
        t.id === id ? { ...t, completed: isNowCompleted, completedDates } : t
      );

      const nextState = {
        ...prev,
        tasks: updatedTasks,
      };

      setTimeout(() => checkAchievements(nextState), 200);

      return nextState;
    });
  }, [awardXp, checkAchievements, maintainStreak, pushNotification]);

  const clearCompletedTasks = useCallback(() => {
    setState((prev) => {
      const remaining = prev.tasks.filter((t) => !t.completed);
      const countRemoved = prev.tasks.length - remaining.length;
      if (countRemoved > 0) {
        sound.playClick();
        pushNotification({
          type: 'info',
          title: 'Tasks Cleared',
          subtitle: `Removed ${countRemoved} completed tasks.`,
          icon: 'Trash2',
          badgeText: 'CLEANUP',
          duration: 3500,
        });
      }
      return {
        ...prev,
        tasks: remaining,
      };
    });
  }, [pushNotification]);

  const updateTaskStatus = useCallback((id: string, status: TaskStatus) => {
    setState((prev) => {
      const task = prev.tasks.find((t) => t.id === id);
      if (!task) return prev;
      const isCompleted = status === 'completed';
      return {
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === id ? { ...t, status, completed: isCompleted } : t)),
      };
    });
  }, []);

  // STUDY NOTES ACTIONS
  const addNote = useCallback(
    (noteData: Omit<StudyNote, 'id' | 'createdAt' | 'updatedAt'>): StudyNote => {
      const now = getTodayString();
      const newNote: StudyNote = {
        ...noteData,
        id: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        createdAt: now,
        updatedAt: now,
      };
      setState((prev) => ({
        ...prev,
        notes: [newNote, ...prev.notes],
      }));
      sound.playClick();
      pushNotification({
        type: 'info',
        title: 'Study Note Created',
        subtitle: newNote.title,
        icon: 'FileText',
        badgeText: 'NOTES',
        duration: 3000,
      });
      return newNote;
    },
    [pushNotification]
  );

  const updateNote = useCallback((id: string, updates: Partial<StudyNote>) => {
    setState((prev) => ({
      ...prev,
      notes: prev.notes.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: getTodayString() } : n
      ),
    }));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== id),
    }));
    sound.playClick();
  }, []);

  // QUIZ ACTIONS
  const addQuiz = useCallback(
    (quizData: Omit<Quiz, 'id' | 'createdAt'>): Quiz => {
      const newQuiz: Quiz = {
        ...quizData,
        id: 'quiz_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        createdAt: getTodayString(),
      };
      setState((prev) => ({
        ...prev,
        quizzes: [newQuiz, ...prev.quizzes],
      }));
      sound.playClick();
      pushNotification({
        type: 'info',
        title: 'AI Practice Quiz Ready',
        subtitle: `${newQuiz.title} (${newQuiz.totalQuestions} questions)`,
        icon: 'Brain',
        badgeText: 'QUIZ',
        duration: 4000,
      });
      return newQuiz;
    },
    [pushNotification]
  );

  const deleteQuiz = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      quizzes: prev.quizzes.filter((q) => q.id !== id),
    }));
    sound.playClick();
  }, []);

  const recordQuizAttempt = useCallback(
    (attemptData: Omit<QuizAttempt, 'id' | 'timestamp'>) => {
      const newAttempt: QuizAttempt = {
        ...attemptData,
        id: 'attempt_' + Date.now(),
        timestamp: Date.now(),
      };

      setState((prev) => {
        const nextAttempts = [newAttempt, ...prev.quizAttempts];
        // update best score on quiz
        const updatedQuizzes = prev.quizzes.map((q) => {
          if (q.id === newAttempt.quizId) {
            const currentBest = q.bestScore || 0;
            return {
              ...q,
              bestScore: Math.max(currentBest, newAttempt.score),
            };
          }
          return q;
        });

        return {
          ...prev,
          quizzes: updatedQuizzes,
          quizAttempts: nextAttempts,
        };
      });

      if (newAttempt.xpEarned > 0) {
        awardXp(
          newAttempt.xpEarned,
          `Completed Quiz: ${newAttempt.quizTitle} (${newAttempt.score}/${newAttempt.totalQuestions})`
        );
      }

      sound.playAchievement();
      fireConfetti();
      pushNotification({
        type: 'xp_gain',
        title: 'Quiz Completed!',
        subtitle: `Scored ${newAttempt.score}/${newAttempt.totalQuestions} • +${newAttempt.xpEarned} XP`,
        xpChange: newAttempt.xpEarned,
        icon: 'Trophy',
        badgeText: 'QUIZ RESULT',
        duration: 4500,
      });
    },
    [awardXp, pushNotification]
  );

  // STUDY PLAN ACTIONS
  const addStudyPlan = useCallback(
    (planData: Omit<StudyPlan, 'id' | 'createdAt'>): StudyPlan => {
      const newPlan: StudyPlan = {
        ...planData,
        id: 'plan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        createdAt: getTodayString(),
      };
      setState((prev) => ({
        ...prev,
        studyPlans: [newPlan, ...prev.studyPlans],
      }));
      sound.playAchievement();
      pushNotification({
        type: 'info',
        title: 'Study Schedule Generated',
        subtitle: `${newPlan.title} (${newPlan.sessions.length} sessions)`,
        icon: 'Calendar',
        badgeText: 'STUDY PLAN',
        duration: 4500,
      });
      return newPlan;
    },
    [pushNotification]
  );

  const deleteStudyPlan = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      studyPlans: prev.studyPlans.filter((p) => p.id !== id),
    }));
    sound.playClick();
  }, []);

  const togglePlanSessionComplete = useCallback(
    (planId: string, sessionId: string) => {
      setState((prev) => {
        let earnedXp = 0;
        const updatedPlans = prev.studyPlans.map((p) => {
          if (p.id === planId) {
            const updatedSessions = p.sessions.map((s) => {
              if (s.id === sessionId) {
                const nowDone = !s.completed;
                if (nowDone) {
                  earnedXp = Math.max(10, Math.round((s.minutes / 25) * 15));
                }
                return { ...s, completed: nowDone };
              }
              return s;
            });
            return { ...p, sessions: updatedSessions };
          }
          return p;
        });

        if (earnedXp > 0) {
          setTimeout(() => awardXp(earnedXp, 'Study Plan Session Completed'), 100);
          sound.playTaskComplete();
          fireConfetti();
        }

        return {
          ...prev,
          studyPlans: updatedPlans,
        };
      });
    },
    [awardXp]
  );

  // STUDY GOAL ACTIONS
  const addGoal = useCallback(
    (goalData: Omit<StudyGoal, 'id'>): StudyGoal => {
      const newGoal: StudyGoal = {
        ...goalData,
        id: 'goal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      };
      setState((prev) => ({
        ...prev,
        goals: [newGoal, ...prev.goals],
      }));
      sound.playClick();
      pushNotification({
        type: 'info',
        title: 'Study Goal Set',
        subtitle: `${newGoal.title} (${newGoal.targetMinutes}m target)`,
        icon: 'Target',
        badgeText: 'GOAL',
        duration: 3500,
      });
      return newGoal;
    },
    [pushNotification]
  );

  const updateGoal = useCallback((id: string, updates: Partial<StudyGoal>) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }));
    sound.playClick();
  }, []);

  const incrementGoalProgress = useCallback(
    (id: string, minutes: number) => {
      setState((prev) => {
        let reachedGoal = false;
        const updated = prev.goals.map((g) => {
          if (g.id === id) {
            const nextMin = g.currentMinutes + minutes;
            const completed = nextMin >= g.targetMinutes;
            if (completed && !g.completed) {
              reachedGoal = true;
            }
            return {
              ...g,
              currentMinutes: nextMin,
              completed,
            };
          }
          return g;
        });

        if (reachedGoal) {
          sound.playLevelUp();
          fireSuperConfetti();
          setTimeout(() => awardXp(50, 'Study Goal Achieved!'), 100);
          pushNotification({
            type: 'achievement_unlock',
            title: '🎯 STUDY GOAL CRUSHED!',
            subtitle: 'Target study minutes reached. Outstanding discipline, Tyler!',
            xpChange: 50,
            icon: 'Trophy',
            badgeText: 'GOAL COMPLETE',
            duration: 5500,
          });
        }

        return {
          ...prev,
          goals: updated,
        };
      });
    },
    [awardXp, pushNotification]
  );

  // CALENDAR EVENT ACTIONS
  const addEvent = useCallback((eventData: Omit<CalendarEvent, 'id'>): CalendarEvent => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    };
    setState((prev) => ({
      ...prev,
      events: [...prev.events, newEvent],
    }));
    sound.playClick();
    pushNotification({
      type: 'info',
      title: 'Event Scheduled',
      subtitle: `${newEvent.title} on ${newEvent.date}`,
      icon: 'Calendar',
      badgeText: newEvent.category,
      duration: 3500,
    });
    return newEvent;
  }, [pushNotification]);

  const updateEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    setState((prev) => ({
      ...prev,
      events: prev.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      events: prev.events.filter((e) => e.id !== id),
    }));
    sound.playClick();
  }, []);

  // SUBJECT ACTIONS
  const addSubject = useCallback((subjectData: Omit<Subject, 'id'>) => {
    const newSub: Subject = {
      ...subjectData,
      id: 'sub_' + Date.now(),
    };
    setState((prev) => ({ ...prev, subjects: [...prev.subjects, newSub] }));
    sound.playClick();
  }, []);

  const updateSubject = useCallback((id: string, updates: Partial<Subject>) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  }, []);

  const deleteSubject = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== id),
    }));
    sound.playClick();
  }, []);

  // GAME ACTIONS
  const addGame = useCallback((gameData: Omit<GameItem, 'id'>) => {
    const newGame: GameItem = {
      ...gameData,
      id: 'game_' + Date.now(),
    };
    setState((prev) => ({ ...prev, games: [...prev.games, newGame] }));
    sound.playClick();
  }, []);

  const updateGame = useCallback((id: string, updates: Partial<GameItem>) => {
    setState((prev) => ({
      ...prev,
      games: prev.games.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
  }, []);

  const deleteGame = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      games: prev.games.filter((g) => g.id !== id),
    }));
    sound.playClick();
  }, []);

  // GAMING SESSION
  const addGamingSession = useCallback((sessionData: Omit<GamingSession, 'id' | 'timestamp'>) => {
    const newSession: GamingSession = {
      ...sessionData,
      id: 'gsess_' + Date.now(),
      timestamp: Date.now(),
    };
    setState((prev) => ({
      ...prev,
      gamingSessions: [newSession, ...prev.gamingSessions],
    }));
    sound.playClick();
  }, []);

  // CUSTOM CHECKLISTS WITH AUTOMATIC CALENDAR UPDATING
  const addCustomChecklist = useCallback(
    (listData: Omit<CustomChecklist, 'id'>) => {
      const id = 'chk_' + Date.now();
      const newList: CustomChecklist = {
        ...listData,
        id,
        autoSyncCalendar: listData.autoSyncCalendar !== false,
        scheduledDate: listData.scheduledDate || getTodayString(),
        scheduledTime: listData.scheduledTime || (listData.category === 'Routine' ? '07:30' : '10:00'),
      };

      setState((prev) => {
        const completedCount = newList.items.filter((i) => i.completed).length;
        const totalCount = newList.items.length;
        const allDone = totalCount > 0 && completedCount === totalCount;
        const targetDate = newList.scheduledDate || getTodayString();
        const startTime = newList.scheduledTime || '07:30';

        const [h, m] = startTime.split(':').map(Number);
        const totalMins = (h * 60 + (m || 0) + 30) % 1440;
        const endH = String(Math.floor(totalMins / 60)).padStart(2, '0');
        const endM = String(totalMins % 60).padStart(2, '0');
        const endTime = `${endH}:${endM}`;

        const calendarEvt: CalendarEvent = {
          id: 'evt_chk_' + id,
          title: `📋 ${newList.title} (${completedCount}/${totalCount})`,
          date: targetDate,
          startTime,
          endTime,
          description:
            newList.items.length > 0
              ? newList.items.map((it) => `${it.completed ? '☑' : '☐'} ${it.text}`).join('\n')
              : 'No checklist items yet.',
          category: 'Checklist',
          priority: allDone ? 'low' : 'medium',
          color: allDone ? '#10b981' : '#6366f1',
          sourceType: 'checklist',
          sourceChecklistId: id,
        };

        return {
          ...prev,
          customChecklists: [...prev.customChecklists, newList],
          events: [...prev.events, calendarEvt],
        };
      });

      sound.playClick();
      pushNotification({
        type: 'info',
        title: 'Checklist Added & Linked to Calendar',
        subtitle: `"${newList.title}" will now auto-update your daily schedule.`,
        icon: 'Calendar',
        badgeText: 'CALENDAR SYNC',
        duration: 3500,
      });
    },
    [pushNotification]
  );

  const updateCustomChecklist = useCallback((id: string, updates: Partial<CustomChecklist>) => {
    setState((prev) => {
      const updatedLists = prev.customChecklists.map((c) => (c.id === id ? { ...c, ...updates } : c));
      const target = updatedLists.find((c) => c.id === id);

      let updatedEvents = [...prev.events];
      if (target && target.autoSyncCalendar !== false) {
        const completedCount = target.items.filter((i) => i.completed).length;
        const totalCount = target.items.length;
        const allDone = totalCount > 0 && completedCount === totalCount;
        const targetDate = target.scheduledDate || getTodayString();
        const startTime = target.scheduledTime || (target.category === 'Routine' ? '07:30' : '10:00');

        const [h, m] = startTime.split(':').map(Number);
        const totalMins = (h * 60 + (m || 0) + 30) % 1440;
        const endH = String(Math.floor(totalMins / 60)).padStart(2, '0');
        const endM = String(totalMins % 60).padStart(2, '0');
        const endTime = `${endH}:${endM}`;

        const eventPayload: CalendarEvent = {
          id: target.calendarEventId || 'evt_chk_' + id,
          title: `📋 ${target.title} (${completedCount}/${totalCount})`,
          date: targetDate,
          startTime,
          endTime,
          description:
            target.items.length > 0
              ? target.items.map((it) => `${it.completed ? '☑' : '☐'} ${it.text}`).join('\n')
              : 'No checklist items yet.',
          category: 'Checklist',
          priority: allDone ? 'low' : 'medium',
          color: allDone ? '#10b981' : '#6366f1',
          sourceType: 'checklist',
          sourceChecklistId: id,
        };

        const existingIdx = updatedEvents.findIndex((e) => e.sourceChecklistId === id);
        if (existingIdx >= 0) {
          updatedEvents[existingIdx] = { ...updatedEvents[existingIdx], ...eventPayload };
        } else {
          updatedEvents.push(eventPayload);
        }
      }

      return {
        ...prev,
        customChecklists: updatedLists,
        events: updatedEvents,
      };
    });
  }, []);

  const deleteCustomChecklist = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      customChecklists: prev.customChecklists.filter((c) => c.id !== id),
      events: prev.events.filter((e) => e.sourceChecklistId !== id),
    }));
    sound.playClick();
  }, []);

  const toggleChecklistItem = useCallback((checklistId: string, itemId: string) => {
    setState((prev) => {
      const list = prev.customChecklists.find((c) => c.id === checklistId);
      if (!list) return prev;

      const item = list.items.find((i) => i.id === itemId);
      const isNowCompleted = item ? !item.completed : false;

      if (isNowCompleted) {
        sound.playTaskComplete();
      }

      const updatedItems = list.items.map((i) =>
        i.id === itemId ? { ...i, completed: isNowCompleted } : i
      );

      const completedCount = updatedItems.filter((i) => i.completed).length;
      const totalCount = updatedItems.length;
      const allDone = totalCount > 0 && completedCount === totalCount;

      const updatedList = { ...list, items: updatedItems };
      const updatedLists = prev.customChecklists.map((c) =>
        c.id === checklistId ? updatedList : c
      );

      // Automatically sync to calendar event
      let updatedEvents = [...prev.events];
      const targetDate = list.scheduledDate || getTodayString();
      const startTime = list.scheduledTime || (list.category === 'Routine' ? '07:30' : '10:00');

      const [h, m] = startTime.split(':').map(Number);
      const totalMins = (h * 60 + (m || 0) + 30) % 1440;
      const endH = String(Math.floor(totalMins / 60)).padStart(2, '0');
      const endM = String(totalMins % 60).padStart(2, '0');
      const endTime = `${endH}:${endM}`;

      const eventPayload: CalendarEvent = {
        id: list.calendarEventId || 'evt_chk_' + checklistId,
        title: `📋 ${list.title} (${completedCount}/${totalCount})`,
        date: targetDate,
        startTime,
        endTime,
        description:
          updatedItems.length > 0
            ? updatedItems.map((it) => `${it.completed ? '☑' : '☐'} ${it.text}`).join('\n')
            : 'No checklist items yet.',
        category: 'Checklist',
        priority: allDone ? 'low' : 'medium',
        color: allDone ? '#10b981' : '#6366f1',
        sourceType: 'checklist',
        sourceChecklistId: checklistId,
      };

      const existingIdx = updatedEvents.findIndex((e) => e.sourceChecklistId === checklistId);
      if (existingIdx >= 0) {
        updatedEvents[existingIdx] = { ...updatedEvents[existingIdx], ...eventPayload };
      } else {
        updatedEvents.push(eventPayload);
      }

      if (allDone && isNowCompleted) {
        sound.playAchievement();
        fireConfetti();
        pushNotification({
          type: 'task_complete',
          title: `✅ ROUTINE PERFECTED: ${list.title}`,
          subtitle: `All ${updatedItems.length} items checked! Calendar automatically updated. +15 XP`,
          xpChange: 15,
          icon: 'Sparkles',
          badgeText: 'ROUTINE',
          duration: 4500,
        });
        setTimeout(() => awardXp(15, `Completed all items in "${list.title}"`), 100);
        setTimeout(() => maintainStreak(`Routine Completed: ${list.title}`), 150);
      }

      return {
        ...prev,
        customChecklists: updatedLists,
        events: updatedEvents,
      };
    });
  }, [awardXp, maintainStreak, pushNotification]);

  const addChecklistItem = useCallback((checklistId: string, text: string) => {
    if (!text.trim()) return;
    setState((prev) => {
      const list = prev.customChecklists.find((c) => c.id === checklistId);
      if (!list) return prev;
      const newItem: ChecklistItem = {
        id: 'item_' + Date.now(),
        text: text.trim(),
        completed: false,
        order: list.items.length,
      };
      const updatedItems = [...list.items, newItem];
      const updatedList = { ...list, items: updatedItems };
      const updatedLists = prev.customChecklists.map((c) =>
        c.id === checklistId ? updatedList : c
      );

      // Auto update calendar event
      let updatedEvents = [...prev.events];
      const completedCount = updatedItems.filter((i) => i.completed).length;
      const totalCount = updatedItems.length;
      const existingIdx = updatedEvents.findIndex((e) => e.sourceChecklistId === checklistId);
      if (existingIdx >= 0) {
        updatedEvents[existingIdx] = {
          ...updatedEvents[existingIdx],
          title: `📋 ${list.title} (${completedCount}/${totalCount})`,
          description: updatedItems.map((it) => `${it.completed ? '☑' : '☐'} ${it.text}`).join('\n'),
        };
      }

      return {
        ...prev,
        customChecklists: updatedLists,
        events: updatedEvents,
      };
    });
    sound.playClick();
  }, []);

  const deleteChecklistItem = useCallback((checklistId: string, itemId: string) => {
    setState((prev) => {
      const list = prev.customChecklists.find((c) => c.id === checklistId);
      if (!list) return prev;
      const updatedItems = list.items.filter((i) => i.id !== itemId);
      const updatedList = { ...list, items: updatedItems };
      const updatedLists = prev.customChecklists.map((c) =>
        c.id === checklistId ? updatedList : c
      );

      // Auto update calendar event
      let updatedEvents = [...prev.events];
      const completedCount = updatedItems.filter((i) => i.completed).length;
      const totalCount = updatedItems.length;
      const existingIdx = updatedEvents.findIndex((e) => e.sourceChecklistId === checklistId);
      if (existingIdx >= 0) {
        updatedEvents[existingIdx] = {
          ...updatedEvents[existingIdx],
          title: `📋 ${list.title} (${completedCount}/${totalCount})`,
          description: updatedItems.map((it) => `${it.completed ? '☑' : '☐'} ${it.text}`).join('\n'),
        };
      }

      return {
        ...prev,
        customChecklists: updatedLists,
        events: updatedEvents,
      };
    });
    sound.playClick();
  }, []);

  const resetChecklist = useCallback((checklistId: string) => {
    setState((prev) => {
      const list = prev.customChecklists.find((c) => c.id === checklistId);
      if (!list) return prev;
      const updatedItems = list.items.map((i) => ({ ...i, completed: false }));
      const updatedList = { ...list, items: updatedItems };
      const updatedLists = prev.customChecklists.map((c) =>
        c.id === checklistId ? updatedList : c
      );

      // Auto update calendar event
      let updatedEvents = [...prev.events];
      const existingIdx = updatedEvents.findIndex((e) => e.sourceChecklistId === checklistId);
      if (existingIdx >= 0) {
        updatedEvents[existingIdx] = {
          ...updatedEvents[existingIdx],
          title: `📋 ${list.title} (0/${updatedItems.length})`,
          color: '#6366f1',
          description: updatedItems.map((it) => `☐ ${it.text}`).join('\n'),
        };
      }

      return {
        ...prev,
        customChecklists: updatedLists,
        events: updatedEvents,
      };
    });
    sound.playClick();
  }, []);


  // REWARDS
  const addReward = useCallback((rewardData: Omit<RewardItem, 'id'>) => {
    const newRew: RewardItem = {
      ...rewardData,
      id: 'rew_' + Date.now(),
    };
    setState((prev) => ({ ...prev, rewards: [...prev.rewards, newRew] }));
    sound.playClick();
  }, []);

  const updateReward = useCallback((id: string, updates: Partial<RewardItem>) => {
    setState((prev) => ({
      ...prev,
      rewards: prev.rewards.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
  }, []);

  const deleteReward = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      rewards: prev.rewards.filter((r) => r.id !== id),
    }));
    sound.playClick();
  }, []);

  const redeemReward = useCallback((rewardId: string): boolean => {
    let success = false;
    setState((prev) => {
      const rew = prev.rewards.find((r) => r.id === rewardId);
      if (!rew) return prev;
      if (prev.currentXP < rew.costXP) {
        pushNotification({
          type: 'info',
          title: 'Not Enough XP!',
          subtitle: `You need ${rew.costXP} XP (you currently have ${prev.currentXP} XP). Keep studying & completing tasks!`,
          icon: 'AlertCircle',
          badgeText: 'REWARD SHOP',
          duration: 4000,
        });
        return prev;
      }

      success = true;
      sound.playRewardRedeem();
      fireConfetti();

      pushNotification({
        type: 'reward_redeem',
        title: `🎁 REWARD REDEEMED!`,
        subtitle: `Enjoy: "${rew.title}"! You earned it with focused dedication.`,
        xpChange: -rew.costXP,
        icon: 'Gift',
        badgeText: 'PURCHASE',
        duration: 5000,
      });

      const redemption: RedeemedReward = {
        id: 'red_' + Date.now(),
        rewardId: rew.id,
        title: rew.title,
        costXP: rew.costXP,
        timestamp: Date.now(),
        date: getTodayString(),
      };

      const tx = {
        id: 'tx_' + Date.now(),
        timestamp: Date.now(),
        date: getTodayString(),
        amount: -rew.costXP,
        type: 'spend' as const,
        reason: `Redeemed: ${rew.title}`,
      };

      return {
        ...prev,
        currentXP: prev.currentXP - rew.costXP,
        redeemedRewards: [redemption, ...prev.redeemedRewards],
        xpTransactions: [tx, ...prev.xpTransactions],
      };
    });
    return success;
  }, [pushNotification]);

  // DISCORD BREAK
  const toggleDiscordCheckIn = useCallback((dateStr: string) => {
    setState((prev) => {
      const currentVal = !!prev.discordBreak.checkIns[dateStr];
      const newVal = !currentVal;
      const updatedCheckIns = { ...prev.discordBreak.checkIns, [dateStr]: newVal };
      
      const count = Object.values(updatedCheckIns).filter(Boolean).length;
      
      if (newVal) {
        sound.playTaskComplete();
        fireConfetti();

        if (count === 30) {
          fireSuperConfetti();
          sound.playLevelUp();
          pushNotification({
            type: 'achievement_unlock',
            title: '👑 30-DAY LOCK-IN MASTER!',
            subtitle: 'You completed the entire 30-day Discord break challenge! Pure digital sovereignty unlocked.',
            xpChange: 500,
            icon: 'Crown',
            badgeText: 'LEGENDARY',
            duration: 7000,
          });
        } else {
          pushNotification({
            type: 'discord_checkin',
            title: `🛡️ DISCORD-FREE DAY #${count}`,
            subtitle: 'Digital detox check-in logged! Staying locked into real-world goals.',
            xpChange: prev.settings.xpRules.xpPerDiscordDay || 25,
            icon: 'ShieldCheck',
            badgeText: `${count}/30 DAYS`,
            duration: 4500,
          });
        }

        setTimeout(() => awardXp(prev.settings.xpRules.xpPerDiscordDay, `Discord-Free Day #${count}`), 100);
        setTimeout(() => maintainStreak(`Discord Break Day #${count}`), 150);
      }

      const next = {
        ...prev,
        discordBreak: {
          ...prev.discordBreak,
          checkIns: updatedCheckIns,
        },
      };

      setTimeout(() => checkAchievements(next), 250);
      return next;
    });
  }, [awardXp, checkAchievements, maintainStreak, pushNotification]);

  const addDiscordReflection = useCallback((text: string) => {
    if (!text.trim()) return;
    setState((prev) => {
      const existing = prev.discordBreak.reflections || [];
      const dayNum = Object.values(prev.discordBreak.checkIns || {}).filter(Boolean).length || 1;
      const newReflection = {
        id: 'ref_' + Date.now(),
        date: getTodayString(),
        text: text.trim(),
        note: text.trim(),
        dayNumber: dayNum,
      };
      sound.playTaskComplete();
      pushNotification({
        type: 'info',
        title: 'Focus Reflection Saved',
        subtitle: `Day ${dayNum} mindfulness log recorded.`,
        xpChange: 15,
        icon: 'Sparkles',
        duration: 3500,
      });
      setTimeout(() => awardXp(15, 'Focus Reflection Journal'), 100);
      return {
        ...prev,
        discordBreak: {
          ...prev.discordBreak,
          reflections: [newReflection, ...existing],
        },
      };
    });
  }, [awardXp, pushNotification]);

  // REMINDERS
  const addReminder = useCallback((reminderData: Omit<ReminderItem, 'id'>) => {
    const newRem: ReminderItem = {
      ...reminderData,
      id: 'rem_' + Date.now(),
    };
    setState((prev) => ({
      ...prev,
      reminders: [newRem, ...prev.reminders],
    }));
    sound.playClick();
    pushNotification({
      type: 'info',
      title: 'Reminder Saved',
      subtitle: `${newRem.title} (${newRem.date})`,
      icon: 'Bell',
      badgeText: newRem.priority.toUpperCase(),
      duration: 3500,
    });
  }, [pushNotification]);

  const updateReminder = useCallback((id: string, updates: Partial<ReminderItem>) => {
    setState((prev) => ({
      ...prev,
      reminders: prev.reminders.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
  }, []);

  const deleteReminder = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      reminders: prev.reminders.filter((r) => r.id !== id),
    }));
    sound.playClick();
  }, []);

  // SETTINGS & SYSTEM
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...newSettings,
        profile: { ...prev.settings.profile, ...(newSettings.profile || {}) },
        studyGoals: { ...prev.settings.studyGoals, ...(newSettings.studyGoals || {}) },
        gamingLimits: { ...prev.settings.gamingLimits, ...(newSettings.gamingLimits || {}) },
        xpRules: { ...prev.settings.xpRules, ...(newSettings.xpRules || {}) },
        appearance: { ...prev.settings.appearance, ...(newSettings.appearance || {}) },
        calendar: { ...prev.settings.calendar, ...(newSettings.calendar || {}) },
      },
    }));
    sound.playClick();
    pushNotification({
      type: 'info',
      title: 'Settings Saved',
      subtitle: 'Your custom configuration is saved.',
      icon: 'Settings',
      badgeText: 'SYSTEM',
      duration: 3000,
    });
  }, [pushNotification]);

  const resetAllData = useCallback(() => {
    const initial = getInitialState();
    setState(initial);
    saveAppState(initial);
    sound.playClick();
    pushNotification({
      type: 'info',
      title: 'Canvas Reset to Clean State',
      subtitle: 'All items reset to 0 XP, Level 1, and ready for you to customize from scratch!',
      icon: 'RotateCcw',
      badgeText: 'CLEAN RESET',
      duration: 5000,
    });
  }, [pushNotification]);

  const importData = useCallback((imported: AppState): boolean => {
    try {
      if (!imported || !imported.tasks || !imported.settings) {
        pushNotification({
          type: 'info',
          title: 'Import Failed',
          subtitle: 'Invalid JSON backup format.',
          icon: 'AlertTriangle',
          badgeText: 'ERROR',
          duration: 4000,
        });
        return false;
      }
      setState(imported);
      saveAppState(imported);
      fireConfetti();
      sound.playAchievement();
      pushNotification({
        type: 'info',
        title: 'Import Successful',
        subtitle: 'Tyler OS loaded from backup file!',
        icon: 'CheckCircle2',
        badgeText: 'BACKUP',
        duration: 4000,
      });
      return true;
    } catch {
      return false;
    }
  }, [pushNotification]);

  const speakJarvisText = useCallback((text: string) => {
    setIsJarvisSpeaking(true);
    speechEngine.speak(text, () => {
      setIsJarvisSpeaking(false);
    });
  }, []);

  const stopJarvisSpeaking = useCallback(() => {
    speechEngine.stopSpeaking();
    setIsJarvisSpeaking(false);
  }, []);

  const executeJarvisActions = useCallback(
    (actions: any[]) => {
      let executedCount = 0;
      for (const act of actions) {
        if (!act || !act.type) continue;
        const type = act.type;

        if (type === 'create_task') {
          const payload = act.payload || act;
          addTask({
            title: payload.title || 'New Task',
            description: payload.description || '',
            category: payload.category || 'School',
            subjectId: payload.subjectId || state.subjects[0]?.id || 'sub_math',
            dueDate: payload.dueDate || getTodayString(),
            dueTime: payload.dueTime || payload.time || '17:00',
            time: payload.time || payload.dueTime || '17:00',
            priority: payload.priority || 'medium',
            status: payload.status || 'not_started',
            estimatedMinutes: payload.estimatedMinutes || 30,
            tags: payload.tags || ['jarvis'],
            repeatType: payload.repeatType || 'none',
            repeatDays: payload.repeatDays || [],
            completed: false,
            completedDates: [],
            xpReward: payload.xpReward || 20,
          });
          executedCount++;
        } else if (type === 'complete_task') {
          const payload = act.payload || act;
          let targetId = payload.taskId;
          if (!targetId && payload.taskTitleQuery) {
            const match = state.tasks.find((t) =>
              t.title.toLowerCase().includes(payload.taskTitleQuery.toLowerCase())
            );
            if (match) targetId = match.id;
          }
          if (targetId) {
            toggleTaskComplete(targetId);
            executedCount++;
          }
        } else if (type === 'delete_task') {
          const payload = act.payload || act;
          if (payload.deleteAllCompleted) {
            clearCompletedTasks();
            executedCount++;
          } else {
            let targetId = payload.taskId;
            if (!targetId && payload.taskTitleQuery) {
              const match = state.tasks.find((t) =>
                t.title.toLowerCase().includes(payload.taskTitleQuery.toLowerCase())
              );
              if (match) targetId = match.id;
            }
            if (targetId) {
              deleteTask(targetId);
              executedCount++;
            }
          }
        } else if (type === 'update_task') {
          const payload = act.payload || act;
          let targetId = payload.taskId;
          if (!targetId && payload.taskTitleQuery) {
            const match = state.tasks.find((t) =>
              t.title.toLowerCase().includes(payload.taskTitleQuery.toLowerCase())
            );
            if (match) targetId = match.id;
          }
          if (targetId && payload.updates) {
            updateTask(targetId, payload.updates);
            executedCount++;
          }
        } else if (type === 'create_event') {
          const payload = act.payload || act;
          addEvent({
            title: payload.title || 'Event',
            description: payload.description || '',
            date: payload.date || getTodayString(),
            startTime: payload.startTime || '09:00',
            endTime: payload.endTime || '10:00',
            category: payload.category || 'exam',
            priority: payload.priority || 'high',
            color: payload.color || '#6366f1',
          });
          executedCount++;
        } else if (type === 'delete_event') {
          const payload = act.payload || act;
          let targetId = payload.eventId;
          if (!targetId && payload.eventTitleQuery) {
            const match = state.events.find((e) =>
              e.title.toLowerCase().includes(payload.eventTitleQuery.toLowerCase())
            );
            if (match) targetId = match.id;
          }
          if (targetId) {
            deleteEvent(targetId);
            executedCount++;
          }
        } else if (type === 'create_reminder') {
          const payload = act.payload || act;
          addReminder({
            title: payload.title || 'Reminder',
            date: payload.date || getTodayString(),
            time: payload.time || '12:00',
            category: payload.category || 'study',
            priority: payload.priority || 'medium',
            isDismissed: false,
          });
          executedCount++;
        } else if (type === 'start_timer') {
          const payload = act.payload || act;
          const mins = payload.durationMinutes || 25;
          setStudyTimerDuration(mins, true);
          if (payload.subjectId) {
            setStudySubjectId(payload.subjectId);
          }
          startStudyTimer();
          executedCount++;
        } else if (type === 'stop_timer') {
          pauseStudyTimer();
          executedCount++;
        } else if (type === 'reset_timer') {
          resetStudyTimer();
          executedCount++;
        } else if (type === 'toggle_focus_mode') {
          toggleFocusMode();
          executedCount++;
        } else if (type === 'create_note') {
          const payload = act.payload || act;
          addNote({
            title: payload.title || 'Note',
            content: payload.content || '',
            subjectId: payload.subjectId || state.subjects[0]?.id || 'sub_math',
            tags: payload.tags || ['jarvis'],
          });
          executedCount++;
        } else if (type === 'create_study_plan') {
          const payload = act.payload || act;
          addStudyPlan({
            title: payload.title || 'Exam Study Plan',
            subjectId: payload.subjectId || state.subjects[0]?.id || 'sub_math',
            examDate: payload.examDate || addDays(getTodayString(), 7),
            dailyMinutes: payload.dailyMinutes || 30,
            sessions: payload.sessions || [],
          });
          executedCount++;
        } else if (type === 'create_quiz') {
          const payload = act.payload || act;
          addQuiz({
            title: payload.title || 'Practice Quiz',
            topic: payload.topic || payload.title || 'Practice Topic',
            subjectId: payload.subjectId || state.subjects[0]?.id || 'sub_math',
            questions: payload.questions || [],
            totalQuestions: payload.questions?.length || 5,
          });
          executedCount++;
        } else if (type === 'update_goal') {
          const payload = act.payload || act;
          addGoal({
            title: payload.title || 'Study Goal',
            targetMinutes: payload.targetMinutes || 120,
            currentMinutes: 0,
            subjectId: payload.subjectId || state.subjects[0]?.id || 'sub_math',
            completed: false,
          });
          executedCount++;
        } else if (type === 'award_xp') {
          const payload = act.payload || act;
          awardXp(payload.amount || 25, payload.reason || 'JARVIS Command Reward');
          executedCount++;
        } else if (type === 'navigate') {
          const payload = act.payload || act;
          if (payload.tab) {
            setTargetNavTab(payload.tab);
            executedCount++;
          }
        }
      }
      return executedCount;
    },
    [
      addTask,
      state.subjects,
      state.tasks,
      state.events,
      toggleTaskComplete,
      clearCompletedTasks,
      deleteTask,
      updateTask,
      addEvent,
      deleteEvent,
      addReminder,
      setStudyTimerDuration,
      setStudySubjectId,
      startStudyTimer,
      pauseStudyTimer,
      resetStudyTimer,
      toggleFocusMode,
      addNote,
      addStudyPlan,
      addQuiz,
      addGoal,
      awardXp,
    ]
  );

  const confirmJarvisAction = useCallback(() => {
    if (jarvisConfirmation.pendingActions.length > 0) {
      executeJarvisActions(jarvisConfirmation.pendingActions);
      sound.playJarvisSuccess();
      pushNotification({
        type: 'info',
        title: 'Action Confirmed',
        subtitle: 'JARVIS executed the scheduled commands.',
        icon: 'Bot',
        badgeText: 'JARVIS',
        duration: 3500,
      });
    }
    setJarvisConfirmation({
      isOpen: false,
      title: '',
      message: '',
      actionType: '',
      pendingActions: [],
    });
  }, [jarvisConfirmation, executeJarvisActions, pushNotification]);

  const cancelJarvisAction = useCallback(() => {
    setJarvisConfirmation({
      isOpen: false,
      title: '',
      message: '',
      actionType: '',
      pendingActions: [],
    });
    sound.playClick();
  }, []);

  const submitJarvisCommand = useCallback(
    async (command: string, isVoice: boolean = false): Promise<{ reply: string; actionCount: number }> => {
      const cleanCmd = command.trim();
      if (!cleanCmd) return { reply: '', actionCount: 0 };

      setIsJarvisProcessing(true);
      sound.playJarvisAcknowledge();

      const stateSummary = {
        subjects: state.subjects.map((s) => ({ id: s.id, name: s.name })),
        tasks: state.tasks.slice(0, 30).map((t) => ({
          id: t.id,
          title: t.title,
          dueDate: t.dueDate,
          dueTime: t.dueTime || t.time,
          completed: t.completed,
          subjectId: t.subjectId,
          priority: t.priority,
          status: t.status,
        })),
        events: state.events.slice(0, 15).map((e) => ({
          id: e.id,
          title: e.title,
          date: e.date,
          startTime: e.startTime,
          category: e.category,
        })),
        reminders: state.reminders.slice(0, 10),
        todayStudyMinutes,
        userLevel: levelInfo.level,
        userXp: state.currentXP,
        isStudyTimerActive: studyTimer.isActive,
      };

      try {
        const res = await fetch('/api/jarvis/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            command: cleanCmd,
            appState: stateSummary,
          }),
        });

        const data = await res.json();
        const replyText = data.reply || 'Understood, Tyler. System updated.';
        const actions = data.actions || [];
        const requiresConfirmation = data.requiresConfirmation || false;

        setJarvisResponse(replyText);

        let actionCount = 0;
        if (requiresConfirmation && actions.length > 0) {
          setJarvisConfirmation({
            isOpen: true,
            title: 'Confirm Operation',
            message: data.confirmationPrompt || replyText,
            actionType: actions[0]?.type || 'operation',
            pendingActions: actions,
          });
        } else if (actions.length > 0) {
          actionCount = executeJarvisActions(actions);
          sound.playJarvisSuccess();
        }

        // Voice speech feedback
        if (isVoice || state.settings.jarvis?.voiceFeedbackEnabled || state.settings.jarvis?.autoSpeak) {
          speakJarvisText(replyText);
        }

        // Log command in state
        const logItem: JarvisLogItem = {
          id: 'jlog_' + Date.now(),
          timestamp: Date.now(),
          command: cleanCmd,
          reply: replyText,
          actionCount: actions.length,
          executedActions: actions.map((a: any) => a.type || 'action'),
          actionsExecuted: actions.map((a: any) => a.type || 'action'),
          isVoice,
        };

        setState((prev) => ({
          ...prev,
          jarvisLogs: [logItem, ...(prev.jarvisLogs || []).slice(0, 49)],
        }));

        setIsJarvisProcessing(false);
        return { reply: replyText, actionCount };
      } catch (err) {
        console.error('JARVIS command failed:', err);
        const fallback = 'I experienced an issue processing that instruction, Tyler. Please try again.';
        setJarvisResponse(fallback);
        setIsJarvisProcessing(false);
        return { reply: fallback, actionCount: 0 };
      }
    },
    [
      state.subjects,
      state.tasks,
      state.events,
      state.reminders,
      state.currentXP,
      state.settings.jarvis?.voiceFeedbackEnabled,
      state.settings.jarvis?.autoSpeak,
      todayStudyMinutes,
      levelInfo.level,
      studyTimer.isActive,
      executeJarvisActions,
      speakJarvisText,
    ]
  );

  const startJarvisListening = useCallback(() => {
    sound.playJarvisChime();
    setIsJarvisListening(true);
    setJarvisTranscript('');
    setIsJarvisOpen(true);

    speechEngine.startListening({
      onStart: () => {
        setIsJarvisListening(true);
      },
      onInterimResult: (interim) => {
        setJarvisTranscript(interim);
      },
      onFinalResult: (final) => {
        setJarvisTranscript(final);
        setIsJarvisListening(false);
        // Automatically submit the spoken command
        submitJarvisCommand(final, true);
      },
      onError: (err) => {
        setIsJarvisListening(false);
        pushNotification({
          type: 'info',
          title: 'Voice Assistant Notice',
          subtitle: err,
          icon: 'MicOff',
          badgeText: 'VOICE',
          duration: 4000,
        });
      },
      onEnd: () => {
        setIsJarvisListening(false);
      },
    });
  }, [pushNotification, submitJarvisCommand]);

  const stopJarvisListening = useCallback(() => {
    speechEngine.stopListening();
    setIsJarvisListening(false);
  }, []);

  // Sync Voice Engine Settings (Cadence & Preferred Voice)
  useEffect(() => {
    const jarvisSettings = state.settings.jarvis;
    if (jarvisSettings) {
      if (jarvisSettings.speechRate || jarvisSettings.speechPitch) {
        speechEngine.setCadence(jarvisSettings.speechRate || 0.98, jarvisSettings.speechPitch || 1.0);
      }
      if (jarvisSettings.selectedVoiceURI) {
        speechEngine.setVoiceByURI(jarvisSettings.selectedVoiceURI);
      }
    }
  }, [state.settings.jarvis?.speechRate, state.settings.jarvis?.speechPitch, state.settings.jarvis?.selectedVoiceURI]);

  // Periodic Upcoming Events & Tasks Watcher
  useEffect(() => {
    const notifSettings = state.settings.notifications;
    const isEnabled = notifSettings?.enabled !== false;
    if (!isEnabled) return;

    const runEventCheck = () => {
      notificationManager.checkUpcomingEvents(state.events, state.tasks, {
        leadMinutes: notifSettings?.notifyBeforeMinutes || 15,
        browserNotifications: notifSettings?.browserNotifications ?? true,
        voiceAnnounce: notifSettings?.voiceAnnounce ?? true,
        onTriggerAlert: (alert) => {
          if (notifSettings?.soundAlert !== false) {
            sound.playNotification();
          }

          pushNotification({
            type: alert.type === 'task_due' ? 'task_complete' : 'info',
            title: alert.title,
            subtitle: alert.subtitle,
            icon: alert.type === 'task_due' ? 'Clock' : 'Calendar',
            badgeText: alert.type === 'task_due' ? 'DUE SOON' : 'UPCOMING',
            duration: 8000,
          });

          // Optional voice announcement by Jarvis with crystal clarity
          if (notifSettings?.voiceAnnounce !== false && (state.settings.jarvis?.voiceFeedbackEnabled !== false)) {
            setTimeout(() => {
              speakJarvisText(alert.voiceMessage);
            }, 700);
          }
        },
      });
    };

    // Run check immediately on mount and every 20 seconds
    runEventCheck();
    const interval = setInterval(runEventCheck, 20000);
    return () => clearInterval(interval);
  }, [
    state.events,
    state.tasks,
    state.settings.notifications,
    state.settings.jarvis?.voiceFeedbackEnabled,
    pushNotification,
    speakJarvisText,
  ]);

  const requestNotificationPermission = useCallback(async () => {
    const granted = await notificationManager.requestPermission();
    setNotificationPermission(notificationManager.getPermissionStatus());
    if (granted) {
      pushNotification({
        type: 'info',
        title: 'Notifications Enabled',
        subtitle: 'You will receive timely alerts before your classes, exams, and tasks!',
        icon: 'Bell',
        badgeText: 'ALERTS ACTIVE',
        duration: 4500,
      });
    } else {
      pushNotification({
        type: 'warning',
        title: 'Browser Notification Permission',
        subtitle: 'Please allow notification permissions in your browser bar for desktop/mobile alerts.',
        icon: 'BellOff',
        badgeText: 'NOTICE',
        duration: 5000,
      });
    }
    return granted;
  }, [pushNotification]);

  const testEventNotification = useCallback(() => {
    const testTitle = 'IB Math Calculus Exam';
    const testSubtitle = 'Starts in 15 minutes at Room 304';
    const voiceMsg = 'Tyler, your event "IB Math Calculus Exam" starts in 15 minutes.';

    sound.playNotification();
    notificationManager.sendBrowserNotification(
      `Upcoming: ${testTitle}`,
      testSubtitle,
      'test_event_alert'
    );

    pushNotification({
      type: 'info',
      title: `Upcoming Event: ${testTitle}`,
      subtitle: testSubtitle,
      icon: 'Calendar',
      badgeText: 'TEST ALERT',
      duration: 6000,
    });

    if (state.settings.notifications?.voiceAnnounce !== false) {
      setTimeout(() => {
        speakJarvisText(voiceMsg);
      }, 500);
    }
  }, [pushNotification, speakJarvisText, state.settings.notifications?.voiceAnnounce]);

  const testJarvisVoice = useCallback((sampleText?: string) => {
    speechEngine.testVoice(sampleText);
  }, []);

  const getAvailableVoices = useCallback(() => {
    return speechEngine.getAvailableVoices();
  }, []);

  const setJarvisVoice = useCallback(
    (voiceURI: string) => {
      speechEngine.setVoiceByURI(voiceURI);
      updateSettings({
        jarvis: {
          ...state.settings.jarvis,
          selectedVoiceURI: voiceURI,
        },
      });
    },
    [state.settings.jarvis, updateSettings]
  );

  const setJarvisCadence = useCallback(
    (rate: number, pitch: number) => {
      speechEngine.setCadence(rate, pitch);
      updateSettings({
        jarvis: {
          ...state.settings.jarvis,
          speechRate: rate,
          speechPitch: pitch,
        },
      });
    },
    [state.settings.jarvis, updateSettings]
  );

  const value = {
    state,
    levelInfo,
    todayTasks,
    upcomingEvents,
    todayStudyMinutes,
    todayGamingMinutes,
    completedTasksCountToday,
    discordFreeDaysCount,
    isDiscordFreeToday,
    notifications,
    dismissNotification,
    pushNotification,
    levelUpModal,
    closeLevelUpModal,
    isFocusMode,
    toggleFocusMode,
    setFocusMode,
    studyTimer,
    startStudyTimer,
    pauseStudyTimer,
    resetStudyTimer,
    setStudyTimerDuration,
    setStudySubjectId,
    setStudySessionNotes,
    setCustomMinutesInput,
    finishStudySessionEarly,
    completeStudySession,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    clearCompletedTasks,
    updateTaskStatus,
    addNote,
    updateNote,
    deleteNote,
    addQuiz,
    deleteQuiz,
    recordQuizAttempt,
    addStudyPlan,
    deleteStudyPlan,
    togglePlanSessionComplete,
    addGoal,
    updateGoal,
    deleteGoal,
    incrementGoalProgress,
    targetNavTab,
    setTargetNavTab,
    isJarvisOpen,
    setIsJarvisOpen,
    isJarvisListening,
    isJarvisProcessing,
    isJarvisSpeaking,
    jarvisTranscript,
    jarvisResponse,
    jarvisConfirmation,
    startJarvisListening,
    stopJarvisListening,
    submitJarvisCommand,
    confirmJarvisAction,
    cancelJarvisAction,
    speakJarvisText,
    stopJarvisSpeaking,
    notificationPermission,
    requestNotificationPermission,
    testEventNotification,
    testJarvisVoice,
    getAvailableVoices,
    setJarvisVoice,
    setJarvisCadence,
    addEvent,
    updateEvent,
    deleteEvent,
    addSubject,
    updateSubject,
    deleteSubject,
    addGame,
    updateGame,
    deleteGame,
    addStudySession,
    deleteStudySession,
    addGamingSession,
    addCustomChecklist,
    updateCustomChecklist,
    deleteCustomChecklist,
    toggleChecklistItem,
    addChecklistItem,
    deleteChecklistItem,
    resetChecklist,
    currentUser,
    syncStatus,
    lastSyncTime,
    signInWithGoogle,
    signOutUser,
    flushCloudSync,
    addReward,
    updateReward,
    deleteReward,
    redeemReward,
    toggleDiscordCheckIn,
    addDiscordReflection,
    addReminder,
    updateReminder,
    deleteReminder,
    awardXp,
    maintainStreak,
    updateSettings,
    resetAllData,
    importData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
