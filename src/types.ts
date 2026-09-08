export type PriorityLevel = 'urgent' | 'high' | 'medium' | 'low';

export type TaskStatus = 'not_started' | 'in_progress' | 'completed';

export type TaskRepeatType = 'none' | 'daily' | 'weekly' | 'custom';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // YYYY-MM-DD
  time?: string; // HH:mm
  dueTime?: string; // HH:mm alias
  priority: PriorityLevel;
  status?: TaskStatus;
  category: string; // 'School' | 'Personal' | 'Gaming' | custom
  subjectId?: string;
  xpReward: number;
  repeatType: TaskRepeatType;
  repeatDays?: number[]; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  completed: boolean;
  completedDates?: string[]; // tracks historic completions for recurring tasks
  estimatedMinutes?: number;
  tags?: string[];
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  description?: string;
  category: string;
  priority: PriorityLevel;
  reminder?: boolean;
  color?: string;
}

export interface Subject {
  id: string;
  name: string;
  code?: string;
  level?: 'HL' | 'SL';
  color: string;
  icon?: string;
  targetGrade?: string;
  syllabusTopics?: string[];
  totalStudyMinutes?: number;
}

export interface GameItem {
  id: string;
  name: string;
  icon?: string;
  color: string;
  dailyLimitMinutes?: number;
}

export interface StudySession {
  id: string;
  timestamp: number;
  date: string; // YYYY-MM-DD
  subjectId: string;
  durationMinutes: number;
  notes?: string;
  xpEarned: number;
}

export interface GamingSession {
  id: string;
  timestamp: number;
  date: string; // YYYY-MM-DD
  gameId: string;
  durationMinutes: number;
  notes?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  order: number;
}

export interface CustomChecklist {
  id: string;
  title: string;
  icon: string;
  category: string;
  items: ChecklistItem[];
}

export interface RewardItem {
  id: string;
  title: string;
  costXP: number;
  description: string;
  icon: string;
  category?: string;
}

export interface RedeemedReward {
  id: string;
  rewardId: string;
  title: string;
  costXP: number;
  timestamp: number;
  date: string;
}

export type Reward = RewardItem;
export type RewardRedemption = RedeemedReward;

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  requirementType: 'streak' | 'study_hours' | 'discord_days' | 'tasks_count' | 'level';
  requirementValue: number;
  unlockedAt?: string;
  unlocked?: boolean;
  unlockedDate?: string;
  category?: string;
  progress?: number;
  maxProgress?: number;
}

export interface ReminderItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  category: string;
  priority: PriorityLevel;
  isDismissed: boolean;
}

export interface DiscordBreakState {
  startDate: string; // YYYY-MM-DD
  targetDays: number;
  checkIns: Record<string, boolean>; // key is YYYY-MM-DD
  reflections?: { id: string; date: string; text?: string; note?: string; dayNumber?: number; mood?: string }[];
  history?: { date: string; checkedIn?: boolean; checked?: boolean }[];
}

export interface XpTransaction {
  id: string;
  timestamp: number;
  date: string;
  amount: number;
  type: 'gain' | 'spend';
  reason: string;
}

export interface AppProfile {
  name: string;
  title: string;
  avatarIcon: string;
  mainGoal: string;
  grade?: string;
}

export interface AppSettings {
  profile: AppProfile;
  studyGoals: {
    dailyTargetMinutes: number;
    weeklyTargetMinutes: number;
  };
  gamingLimits: {
    defaultDailyLimitMinutes: number;
  };
  xpRules: {
    xpPer25MinStudy: number;
    xpPerTask: number;
    xpPerDiscordDay: number;
    xpPerDailyGoal: number;
    xpPerStreakDay?: number;
    baseLevelXp: number;
    levelMultiplier: number;
  };
  appearance: {
    theme: 'dark' | 'cyber' | 'midnight' | 'emerald';
    accentColor: string;
    soundEnabled: boolean;
    compactView: boolean;
  };
  calendar: {
    defaultView: 'month' | 'week' | 'day';
    showTasksOnCalendar: boolean;
    firstDayOfWeek?: number;
  };
  notifications?: {
    enabled: boolean;
    browserNotifications: boolean;
    notifyBeforeMinutes: number; // e.g. 5, 15, 30, 60
    soundAlert: boolean;
    voiceAnnounce: boolean;
  };
  jarvis: {
    wakeWordEnabled: boolean;
    speechVoice: string;
    autoSpeak: boolean;
    confirmDestructiveActions: boolean;
    voiceFeedbackEnabled?: boolean;
    speechRate?: number;
    speechPitch?: number;
    selectedVoiceURI?: string;
    voicePersona?: string;
  };
}

export interface StudyNote {
  id: string;
  title: string;
  content: string;
  subjectId?: string;
  tags: string[];
  summary?: string;
  keyTakeaways?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  topic: string;
  subjectId?: string;
  questions: QuizQuestion[];
  bestScore?: number;
  totalQuestions: number;
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  timestamp: number;
  date: string;
  xpEarned: number;
}

export interface StudyPlanSession {
  id: string;
  date: string;
  dayNumber: number;
  minutes: number;
  topic: string;
  technique: string;
  completed: boolean;
}

export interface StudyPlan {
  id: string;
  title: string;
  subjectId?: string;
  examDate: string;
  dailyMinutes: number;
  sessions: StudyPlanSession[];
  finalAdvice?: string;
  createdAt: string;
}

export interface StudyGoal {
  id: string;
  title: string;
  targetMinutes: number;
  currentMinutes: number;
  subjectId?: string;
  deadline?: string;
  completed: boolean;
}

export interface JarvisLogItem {
  id: string;
  timestamp: number;
  command: string;
  reply: string;
  actionCount?: number;
  actionsExecuted?: string[];
  executedActions?: string[];
  isVoice: boolean;
}

export interface JarvisConfirmation {
  isOpen: boolean;
  title: string;
  message: string;
  actionType: string;
  pendingActions: any[];
}

export interface AppState {
  user?: { xp: number; level?: number };
  tasks: Task[];
  events: CalendarEvent[];
  subjects: Subject[];
  games: GameItem[];
  studySessions: StudySession[];
  gamingSessions: GamingSession[];
  customChecklists: CustomChecklist[];
  rewards: RewardItem[];
  redeemedRewards: RedeemedReward[];
  achievements: Achievement[];
  reminders: ReminderItem[];
  discordBreak: DiscordBreakState;
  xpTransactions: XpTransaction[];
  notes: StudyNote[];
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  studyPlans: StudyPlan[];
  goals: StudyGoal[];
  jarvisLogs: JarvisLogItem[];
  settings: AppSettings;
  currentXP: number;
  totalXpEarned: number;
  streakCount: number;
  lastActiveDate: string;
}

export type GamifiedNotificationType =
  | 'task_complete'
  | 'streak_maintained'
  | 'level_up'
  | 'achievement_unlock'
  | 'study_complete'
  | 'reward_redeem'
  | 'discord_checkin'
  | 'xp_gain'
  | 'info'
  | 'error'
  | 'warning';

export interface GamifiedNotification {
  id: string;
  type: GamifiedNotificationType;
  title: string;
  subtitle?: string;
  xpChange?: number;
  icon?: string;
  streak?: number;
  level?: number;
  badgeText?: string;
  timestamp: number;
  duration?: number;
}

