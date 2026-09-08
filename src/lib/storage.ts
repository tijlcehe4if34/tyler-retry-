import { AppState, CustomChecklist, GameItem, RewardItem, Subject, Task, CalendarEvent, Achievement, ReminderItem } from '../types';
import { getTodayString, addDays } from './dateUtils';

const STORAGE_KEY = 'tyler_personal_stuff_os_clean_v1';

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'sub_english', name: 'English', code: 'ENG-A', color: '#3b82f6', icon: 'BookOpen' },
  { id: 'sub_german', name: 'German', code: 'GER-B', color: '#f59e0b', icon: 'Languages' },
  { id: 'sub_math', name: 'Mathematics', code: 'MATH-AI', color: '#6366f1', icon: 'Calculator' },
  { id: 'sub_biology', name: 'Biology', code: 'BIO-HL', color: '#10b981', icon: 'Activity' },
  { id: 'sub_design', name: 'Design', code: 'DES-DT', color: '#8b5cf6', icon: 'Palette' },
  { id: 'sub_music', name: 'Music', code: 'MUS', color: '#ec4899', icon: 'Music' },
  { id: 'sub_politics', name: 'Global Politics', code: 'GLO-POL', color: '#06b6d4', icon: 'Globe' },
];

export const DEFAULT_GAMES: GameItem[] = [
  { id: 'game_mc', name: 'Minecraft', icon: 'Box', color: '#10b981', dailyLimitMinutes: 120 },
  { id: 'game_eafc', name: 'EA FC 26', icon: 'Trophy', color: '#3b82f6', dailyLimitMinutes: 60 },
  { id: 'game_gtag', name: 'Gorilla Tag', icon: 'Activity', color: '#f59e0b', dailyLimitMinutes: 45 },
  { id: 'game_other', name: 'Other Gaming', icon: 'Gamepad2', color: '#8b5cf6', dailyLimitMinutes: 60 },
];

export const DEFAULT_CHECKLISTS: CustomChecklist[] = [
  {
    id: 'chk_morning',
    title: 'School Morning Routine',
    icon: 'Sun',
    category: 'Daily Routine',
    items: [
      { id: 'item_1', text: 'Get dressed & hydrate', completed: false, order: 0 },
      { id: 'item_2', text: 'Eat high-protein breakfast', completed: false, order: 1 },
      { id: 'item_3', text: 'Pack laptop & charger', completed: false, order: 2 },
      { id: 'item_4', text: 'Pack IB binders & calculator', completed: false, order: 3 },
      { id: 'item_5', text: 'Check daily timetable & room changes', completed: false, order: 4 },
      { id: 'item_6', text: 'Leave house by 07:45 AM', completed: false, order: 5 },
    ],
  },
  {
    id: 'chk_before_gaming',
    title: 'Before Gaming Lock-in',
    icon: 'ShieldCheck',
    category: 'Self Control',
    items: [
      { id: 'item_g1', text: 'All daily homework finished & turned in', completed: false, order: 0 },
      { id: 'item_g2', text: 'Tomorrow school bag prepared', completed: false, order: 1 },
      { id: 'item_g3', text: 'Study goal timer completed (≥ 2 hrs)', completed: false, order: 2 },
      { id: 'item_g4', text: 'Room tidied & water bottle filled', completed: false, order: 3 },
    ],
  },
  {
    id: 'chk_ib_prep',
    title: 'IB Exam Study Protocol',
    icon: 'GraduationCap',
    category: 'IB Prep',
    items: [
      { id: 'item_ib1', text: 'Review syllabus guide & assessment criteria', completed: false, order: 0 },
      { id: 'item_ib2', text: '1 timed past paper question session', completed: false, order: 1 },
      { id: 'item_ib3', text: 'German B vocabulary Anki flashcards', completed: false, order: 2 },
      { id: 'item_ib4', text: 'Mark scheme analysis & error log update', completed: false, order: 3 },
    ],
  },
];

export const DEFAULT_REWARDS: RewardItem[] = [
  { id: 'rew_1', title: '30 Extra Minutes Gaming', costXP: 50, description: 'Bonus gaming session without guilt', icon: 'Gamepad2', category: 'Gaming' },
  { id: 'rew_2', title: 'Watch a Movie / Episode', costXP: 100, description: 'Evening movie or anime binge night', icon: 'Film', category: 'Entertainment' },
  { id: 'rew_3', title: 'Favorite Food / Takeout', costXP: 250, description: 'Pizza, burger, or favorite takeout reward', icon: 'Pizza', category: 'Food' },
  { id: 'rew_4', title: 'Guilt-Free Lazy Sunday Morning', costXP: 150, description: 'Sleep in late with zero study pressure', icon: 'Coffee', category: 'Relax' },
  { id: 'rew_5', title: 'New Game / DLC Purchase', costXP: 800, description: 'Unlock a new game purchase reward', icon: 'Sparkles', category: 'Gaming' },
];

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'ach_first_study', title: 'First Study Session', description: 'Log your first focused study timer block', icon: 'BookOpen', xpReward: 25, requirementType: 'study_hours', requirementValue: 0.5 },
  { id: 'ach_streak_3', title: '3-Day Lock-In Streak', description: 'Maintain a 3-day continuous activity streak', icon: 'Flame', xpReward: 50, requirementType: 'streak', requirementValue: 3 },
  { id: 'ach_streak_7', title: '7 Day Streak', description: 'Maintain a solid 7-day continuous productivity streak', icon: 'Zap', xpReward: 100, requirementType: 'streak', requirementValue: 7 },
  { id: 'ach_study_10h', title: '10 Hours Studied', description: 'Accumulate 10 total hours in the study timer', icon: 'Brain', xpReward: 150, requirementType: 'study_hours', requirementValue: 10 },
  { id: 'ach_tasks_50', title: '50 Tasks Completed', description: 'Complete 50 total academic and productivity tasks', icon: 'CheckCircle2', xpReward: 200, requirementType: 'tasks_count', requirementValue: 50 },
  { id: 'ach_quiz_master', title: 'Quiz Master', description: 'Score 100% on 3 AI-generated practice quizzes', icon: 'Award', xpReward: 120, requirementType: 'tasks_count', requirementValue: 3 },
  { id: 'ach_discord_7', title: '7 Days Discord-Free', description: 'One full week away from Discord distractions', icon: 'ShieldAlert', xpReward: 100, requirementType: 'discord_days', requirementValue: 7 },
  { id: 'ach_discord_30', title: '30-Day Lock-In Master', description: 'Complete the entire 30-day Discord break challenge!', icon: 'Crown', xpReward: 500, requirementType: 'discord_days', requirementValue: 30 },
  { id: 'ach_lvl_5', title: 'Rising Scholar', description: 'Reach Level 5 in Tyler Personal', icon: 'Award', xpReward: 150, requirementType: 'level', requirementValue: 5 },
];

export const DEFAULT_REMINDERS: ReminderItem[] = [];

export function getInitialState(): AppState {
  const today = getTodayString();
  const tomorrow = addDays(today, 1);
  const nextWeek = addDays(today, 6);

  const initialTasks: Task[] = [
    {
      id: 'task_ger_vocab',
      title: 'German B: Oral Presentation Script & Vocab',
      description: 'Finish draft for the German B environment & technology oral assessment',
      dueDate: today,
      time: '16:00',
      priority: 'urgent',
      status: 'in_progress',
      category: 'School',
      subjectId: 'sub_german',
      xpReward: 30,
      repeatType: 'none',
      completed: false,
      estimatedMinutes: 45,
      tags: ['Oral', 'Revision', 'IA Prep'],
      createdAt: today,
    },
    {
      id: 'task_bio_lab',
      title: 'Biology HL: Photosynthesis Rate Graph & Analysis',
      description: 'Plot chlorophyll absorbance curves and complete discussion section',
      dueDate: tomorrow,
      time: '18:00',
      priority: 'high',
      status: 'not_started',
      category: 'School',
      subjectId: 'sub_biology',
      xpReward: 25,
      repeatType: 'none',
      completed: false,
      estimatedMinutes: 60,
      tags: ['Lab Report', 'Data'],
      createdAt: today,
    },
    {
      id: 'task_math_ai',
      title: 'Mathematics: Calculus Problem Set #4',
      description: 'Optimisation modeling problems 1 through 8',
      dueDate: tomorrow,
      time: '15:30',
      priority: 'medium',
      status: 'not_started',
      category: 'School',
      subjectId: 'sub_math',
      xpReward: 20,
      repeatType: 'none',
      completed: false,
      estimatedMinutes: 50,
      tags: ['Calculus', 'Homework'],
      createdAt: today,
    },
    {
      id: 'task_eng_essay',
      title: 'English A: Comparative Essay Outline',
      description: 'Compare theme of power dynamics in chosen literary works',
      dueDate: nextWeek,
      time: '20:00',
      priority: 'medium',
      status: 'not_started',
      category: 'School',
      subjectId: 'sub_english',
      xpReward: 35,
      repeatType: 'none',
      completed: false,
      estimatedMinutes: 75,
      tags: ['Essay', 'Literature'],
      createdAt: today,
    },
    {
      id: 'task_pol_case',
      title: 'Global Politics: Case Study Brief on Climate Treaties',
      description: 'Summarize sovereignty vs global governance conflicts',
      dueDate: today,
      time: '12:00',
      priority: 'high',
      status: 'completed',
      category: 'School',
      subjectId: 'sub_politics',
      xpReward: 25,
      repeatType: 'none',
      completed: true,
      completedDates: [today],
      estimatedMinutes: 30,
      tags: ['Case Study'],
      createdAt: today,
    },
  ];

  const initialEvents: CalendarEvent[] = [
    {
      id: 'ev_ger_test',
      title: 'German B Listening & Reading Test',
      date: addDays(today, 3),
      startTime: '09:00',
      endTime: '10:30',
      category: 'exam',
      priority: 'urgent',
      reminder: true,
      description: 'Covers Units 3 and 4 vocabulary & grammatical structures',
      color: '#f59e0b',
    },
    {
      id: 'ev_bio_quiz',
      title: 'Biology HL Photosynthesis & Respiration Assessment',
      date: addDays(today, 5),
      startTime: '11:15',
      endTime: '12:30',
      category: 'exam',
      priority: 'high',
      reminder: true,
      description: 'Paper 1 & Paper 2 style data analysis questions',
      color: '#10b981',
    },
    {
      id: 'ev_math_study',
      title: 'Math Calculus Deep-Dive Study Session',
      date: today,
      startTime: '17:00',
      endTime: '18:15',
      category: 'study',
      priority: 'medium',
      reminder: true,
      description: '45-min focus block on integration and curve sketching',
      color: '#6366f1',
    },
  ];

  return {
    tasks: initialTasks,
    events: initialEvents,
    subjects: DEFAULT_SUBJECTS,
    games: DEFAULT_GAMES,
    studySessions: [],
    gamingSessions: [],
    customChecklists: DEFAULT_CHECKLISTS,
    rewards: DEFAULT_REWARDS,
    redeemedRewards: [],
    achievements: DEFAULT_ACHIEVEMENTS,
    reminders: DEFAULT_REMINDERS,
    discordBreak: {
      startDate: today,
      targetDays: 30,
      checkIns: {},
    },
    xpTransactions: [],
    notes: [
      {
        id: 'note_bio_photo',
        title: 'Photosynthesis: Light-Dependent Reactions',
        subjectId: 'sub_biology',
        content: `# Photosynthesis: Light-Dependent Reactions\n\n## Location\nThylakoid membranes of chloroplasts.\n\n## Key Steps\n1. **Photoactivation:** Light absorbed by chlorophyll pigments in Photosystem II (P680) excites electrons.\n2. **Photolysis of Water:** $2H_2O \\rightarrow 4H^+ + 4e^- + O_2$. Replaces lost electrons in PSII.\n3. **Electron Transport Chain (ETC):** Electrons travel through plastoquinone and cytochrome complex, pumping protons ($H^+$) into the thylakoid lumen.\n4. **Chemiosmosis & ATP Synthesis:** Proton gradient drives ATP synthase to produce ATP from ADP + Pi.\n5. **NADP+ Reduction:** Photosystem I (P700) re-excites electrons, leading to the reduction of $NADP^+$ to $NADPH$ via ferredoxin.\n\n## Summary\nOutputs: ATP, NADPH, and Oxygen gas ($O_2$). Used directly in the Calvin cycle.`,
        tags: ['Biology', 'HL', 'Chloroplast', 'HighYield'],
        summary: 'Photoactivation in PSII and PSI generates ATP and NADPH via chemiosmosis, releasing oxygen from photolysis.',
        keyTakeaways: ['Occurs in thylakoid membrane', 'Photolysis provides replacement electrons', 'ATP and NADPH fuel Calvin cycle'],
        createdAt: today,
        updatedAt: today,
      },
      {
        id: 'note_ger_connectors',
        title: 'German B: High-Yield Connectors & Subordinating Conjunctions',
        subjectId: 'sub_german',
        content: `# German B Connectors for Oral & Written Production\n\n## Subordinating (Verb kicks to the end)\n- **weil** (because): *Ich lerne Deutsch, weil es nützlich ist.*\n- **obwohl** (although): *Obwohl es regnet, gehe ich spazieren.*\n- **dass** (that): *Ich glaube, dass wir gewinnen.*\n- **wenn** (if / when): *Wenn ich Zeit habe, helfe ich dir.*\n\n## Coordinating (Word order unchanged - position 0)\n- **denn** (for / because)\n- **aber** (but)\n- **oder** (or)\n- **und** (and)\n\n## Two-Part Connectors (Grade booster!)\n- **nicht nur ... sondern auch** (not only ... but also)\n- **einerseits ... andererseits** (on the one hand ... on the other hand)`,
        tags: ['German', 'Grammar', 'Connectors'],
        summary: 'Essential subordinating (verb to end) and coordinating German conjunctions for written essays and oral exams.',
        keyTakeaways: ['Weil, obwohl, dass send finite verb to final position', 'Denn, aber, und maintain normal word order', 'Use two-part connectors for top band marks'],
        createdAt: today,
        updatedAt: today,
      },
    ],
    quizzes: [],
    quizAttempts: [],
    studyPlans: [],
    goals: [
      {
        id: 'goal_daily_study',
        title: 'Hit 2.5 Hours Daily Focus Study',
        targetMinutes: 150,
        currentMinutes: 45,
        deadline: today,
        completed: false,
      },
      {
        id: 'goal_german_mastery',
        title: 'Complete 5 German Oral Practice Drills',
        targetMinutes: 100,
        currentMinutes: 60,
        subjectId: 'sub_german',
        deadline: addDays(today, 4),
        completed: false,
      },
    ],
    jarvisLogs: [
      {
        id: 'log_init',
        timestamp: Date.now(),
        command: 'System Initialized',
        reply: 'Good day, Tyler. JARVIS is online and fully synchronized with your schedule, tasks, and study timer.',
        actionCount: 0,
        executedActions: ['System check complete'],
        isVoice: false,
      },
    ],
    settings: {
      profile: {
        name: 'Tyler',
        title: 'IB Grade 11 • Scholar & Gamer',
        avatarIcon: 'Crown',
        mainGoal: 'IB 40+ points & Master the 30-day Lock-In',
      },
      studyGoals: {
        dailyTargetMinutes: 150, // 2h 30m
        weeklyTargetMinutes: 900, // 15 hrs
      },
      gamingLimits: {
        defaultDailyLimitMinutes: 120, // 2h
      },
      xpRules: {
        xpPer25MinStudy: 10,
        xpPerTask: 20,
        xpPerDiscordDay: 25,
        xpPerDailyGoal: 15,
        baseLevelXp: 200,
        levelMultiplier: 1.2,
      },
      appearance: {
        theme: 'cyber',
        accentColor: '#6366f1',
        soundEnabled: true,
        compactView: false,
      },
      calendar: {
        defaultView: 'month',
        showTasksOnCalendar: true,
      },
      notifications: {
        enabled: true,
        browserNotifications: true,
        notifyBeforeMinutes: 15,
        soundAlert: true,
        voiceAnnounce: true,
      },
      jarvis: {
        wakeWordEnabled: true,
        speechVoice: 'JARVIS',
        autoSpeak: true,
        confirmDestructiveActions: true,
        voiceFeedbackEnabled: true,
        speechRate: 0.98,
        speechPitch: 1.0,
      },
    },
    currentXP: 180,
    totalXpEarned: 180,
    streakCount: 4,
    lastActiveDate: today,
  };
}

export function loadAppState(): AppState {
  if (typeof window === 'undefined') {
    return getInitialState();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialState();
      saveAppState(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as AppState;
    const defaultState = getInitialState();
    return {
      ...defaultState,
      ...parsed,
      tasks: (parsed.tasks && parsed.tasks.length > 0) ? parsed.tasks : defaultState.tasks,
      events: (parsed.events && parsed.events.length > 0) ? parsed.events : defaultState.events,
      subjects: (parsed.subjects && parsed.subjects.length > 0) ? parsed.subjects : defaultState.subjects,
      notes: parsed.notes || defaultState.notes,
      quizzes: parsed.quizzes || defaultState.quizzes,
      quizAttempts: parsed.quizAttempts || defaultState.quizAttempts,
      studyPlans: parsed.studyPlans || defaultState.studyPlans,
      goals: parsed.goals || defaultState.goals,
      jarvisLogs: parsed.jarvisLogs || defaultState.jarvisLogs,
      settings: {
        ...defaultState.settings,
        ...(parsed.settings || {}),
        jarvis: {
          ...defaultState.settings.jarvis,
          ...(parsed.settings?.jarvis || {}),
        },
      },
      discordBreak: {
        ...defaultState.discordBreak,
        ...(parsed.discordBreak || {}),
      },
    };
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return getInitialState();
  }
}

export function saveAppState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
}

export function calculateLevel(xp: number, baseLevelXp = 200, multiplier = 1.2): { level: number; currentLevelXp: number; nextLevelXp: number; progressPercent: number } {
  let level = 1;
  let accumulatedXp = 0;
  let requiredForCurrentLevel = baseLevelXp;

  while (xp >= accumulatedXp + requiredForCurrentLevel) {
    accumulatedXp += requiredForCurrentLevel;
    level++;
    requiredForCurrentLevel = Math.round(baseLevelXp * Math.pow(multiplier, level - 1));
  }

  const currentLevelXp = xp - accumulatedXp;
  const nextLevelXp = requiredForCurrentLevel;
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentLevelXp / nextLevelXp) * 100)));

  return {
    level,
    currentLevelXp,
    nextLevelXp,
    progressPercent,
  };
}

export function exportDataAsJSON(state: AppState): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `tyler_personal_stuff_backup_${getTodayString()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
