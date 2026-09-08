import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { sound } from '../lib/sound';
import {
  Sparkles,
  BookOpen,
  Brain,
  HelpCircle,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Flame,
  Award,
  Clock,
  RotateCcw,
  Layers,
  ChevronRight,
  Send,
  FileText,
  Lightbulb,
  Bookmark,
  Share2,
} from 'lucide-react';

type LabSubTab = 'quiz' | 'explain' | 'plan' | 'summarize';

export const AiStudyLabView: React.FC = () => {
  const {
    state,
    awardXp,
    pushNotification,
    addTask,
    addEvent,
    addNote,
  } = useApp();

  const [activeTab, setActiveTab] = useState<LabSubTab>('quiz');

  // QUIZ GENERATOR STATE
  const [quizTopic, setQuizTopic] = useState('');
  const [quizSubjectId, setQuizSubjectId] = useState(state.subjects[0]?.id || '');
  const [quizCount, setQuizCount] = useState(5);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // EXPLAIN MODE STATE
  const [explainTopic, setExplainTopic] = useState('');
  const [explainSubjectId, setExplainSubjectId] = useState(state.subjects[0]?.id || '');
  const [explainLevel, setExplainLevel] = useState<'intuitive' | 'standard_ib' | 'rigorous'>('standard_ib');
  const [isGeneratingExplain, setIsGeneratingExplain] = useState(false);
  const [explainResult, setExplainResult] = useState<any | null>(null);

  // STUDY PLAN GENERATOR STATE
  const [planSubjectId, setPlanSubjectId] = useState(state.subjects[0]?.id || '');
  const [planDays, setPlanDays] = useState(7);
  const [planDailyMins, setPlanDailyMins] = useState(30);
  const [planTopics, setPlanTopics] = useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [studyPlanResult, setStudyPlanResult] = useState<any | null>(null);

  // NOTE SUMMARIZER STATE
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryResult, setSummaryResult] = useState<any | null>(null);

  const selectedQuizSubject = state.subjects.find((s) => s.id === quizSubjectId) || state.subjects[0];
  const selectedExplainSubject = state.subjects.find((s) => s.id === explainSubjectId) || state.subjects[0];
  const selectedPlanSubject = state.subjects.find((s) => s.id === planSubjectId) || state.subjects[0];

  // --- QUIZ HANDLERS ---
  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTopic.trim() || isGeneratingQuiz) return;

    sound.playClick();
    setIsGeneratingQuiz(true);
    setActiveQuiz(null);
    setUserAnswers({});
    setQuizSubmitted(false);

    try {
      const res = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: quizTopic.trim(),
          subjectName: selectedQuizSubject?.name || 'Academics',
          questionCount: quizCount,
        }),
      });

      const data = await res.json();
      setActiveQuiz(data);
      sound.playJarvisAcknowledge();
    } catch (err) {
      console.error(err);
      pushNotification({
        type: 'error',
        title: 'Quiz Generation Failed',
        subtitle: 'Could not connect to AI service. Try again.',
        icon: 'AlertCircle',
        duration: 3500,
      });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSelectAnswer = (qId: string, answer: string) => {
    if (quizSubmitted) return;
    sound.playClick();
    setUserAnswers((prev) => ({ ...prev, [qId]: answer }));
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz?.questions || quizSubmitted) return;

    let correct = 0;
    activeQuiz.questions.forEach((q: any) => {
      const userAns = (userAnswers[q.id] || '').trim().toLowerCase();
      const expected = (q.correctAnswer || '').trim().toLowerCase();
      if (userAns === expected || expected.includes(userAns)) {
        correct++;
      }
    });

    setQuizScore(correct);
    setQuizSubmitted(true);
    sound.playTaskComplete();

    const xpEarned = correct * 15 + 20;
    awardXp(xpEarned, `AI Study Quiz: ${quizTopic}`);

    pushNotification({
      type: 'achievement_unlock',
      title: 'Quiz Completed!',
      subtitle: `Score: ${correct}/${activeQuiz.questions.length} • +${xpEarned} XP Earned!`,
      xpChange: xpEarned,
      icon: 'Award',
      duration: 4500,
    });
  };

  // --- EXPLAIN HANDLER ---
  const handleGenerateExplain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!explainTopic.trim() || isGeneratingExplain) return;

    sound.playClick();
    setIsGeneratingExplain(true);
    setExplainResult(null);

    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: explainTopic.trim(),
          subjectName: selectedExplainSubject?.name || 'Academics',
          level: explainLevel,
        }),
      });

      const data = await res.json();
      setExplainResult(data);
      sound.playJarvisAcknowledge();
      awardXp(10, 'Concept Research');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingExplain(false);
    }
  };

  const handleSaveExplainAsNote = () => {
    if (!explainResult) return;
    addNote({
      title: `AI Note: ${explainResult.topic || explainTopic}`,
      subjectId: explainSubjectId,
      content: `${explainResult.summary}\n\n${explainResult.detailedExplanation || ''}\n\nKey Concepts:\n${(explainResult.keyConcepts || []).map((c: string) => `• ${c}`).join('\n')}\n\nExam Tip: ${explainResult.studyTip || ''}`,
      tags: ['ai_explained', 'jarvis'],
    });
    sound.playTaskComplete();
    pushNotification({
      type: 'info',
      title: 'Saved to Study Notes',
      subtitle: explainResult.topic || explainTopic,
      icon: 'CheckCircle2',
      duration: 3000,
    });
  };

  // --- STUDY PLAN HANDLER ---
  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGeneratingPlan) return;

    sound.playClick();
    setIsGeneratingPlan(true);
    setStudyPlanResult(null);

    try {
      const res = await fetch('/api/ai/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName: selectedPlanSubject?.name || 'IB Exam',
          daysUntilExam: planDays,
          dailyMinutes: planDailyMins,
          specificTopics: planTopics,
        }),
      });

      const data = await res.json();
      setStudyPlanResult(data);
      sound.playJarvisSuccess();
      awardXp(15, 'Exam Roadmap Generated');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleConvertPlanToTasks = () => {
    if (!studyPlanResult?.dailySessions) return;

    studyPlanResult.dailySessions.forEach((sess: any) => {
      addTask({
        title: `${selectedPlanSubject?.name || 'Study'}: ${sess.focusTopic}`,
        description: `Plan session (Day ${sess.dayNumber}). Technique: ${sess.technique}`,
        category: 'Exam Prep',
        subjectId: planSubjectId,
        dueDate: sess.date,
        dueTime: '18:00',
        time: '18:00',
        priority: 'high',
        status: 'not_started',
        estimatedMinutes: sess.minutes || 30,
        tags: ['study_plan', 'exam_prep'],
        repeatType: 'none',
        repeatDays: [],
        completed: false,
        completedDates: [],
        xpReward: 25,
      });
    });

    sound.playTaskComplete();
    pushNotification({
      type: 'task_complete',
      title: 'Study Sessions Scheduled',
      subtitle: `Created ${studyPlanResult.dailySessions.length} roadmap tasks!`,
      icon: 'Calendar',
      duration: 4000,
    });
  };

  // --- SUMMARIZER HANDLER ---
  const handleSummarizeNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || isSummarizing) return;

    sound.playClick();
    setIsSummarizing(true);
    setSummaryResult(null);

    try {
      const res = await fetch('/api/ai/summarize-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: noteTitle || 'Lecture Notes',
          content: noteContent,
        }),
      });

      const data = await res.json();
      setSummaryResult(data);
      sound.playJarvisAcknowledge();
      awardXp(15, 'Notes Synthesized');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-zinc-950 via-indigo-950/30 to-zinc-950 p-6 rounded-3xl border border-indigo-500/20 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
              <Brain className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>AI Study Laboratory</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                JARVIS POWERED
              </span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">
            Generate customized IB quizzes, obtain multi-level concept breakdowns, and build exam roadmaps.
          </p>
        </div>

        {/* Sub-tab switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-900/90 border border-zinc-800 rounded-2xl shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('quiz');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'quiz'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Practice Quiz</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('explain');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'explain'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Explain Topic</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('plan');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'plan'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Study Plan</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('summarize');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'summarize'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Summarizer</span>
          </button>
        </div>
      </div>

      {/* --- TAB 1: PRACTICE QUIZ GENERATOR --- */}
      {activeTab === 'quiz' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-white">
                Generate Instant Quiz
              </h2>
            </div>

            <form onSubmit={handleGenerateQuiz} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Topic / Syllabus Module</label>
                <input
                  type="text"
                  value={quizTopic}
                  onChange={(e) => setQuizTopic(e.target.value)}
                  placeholder="e.g. IB Physics Simple Harmonic Motion"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Target Subject</label>
                <select
                  value={quizSubjectId}
                  onChange={(e) => setQuizSubjectId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                >
                  {state.subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-zinc-300">
                  <span>Questions Count</span>
                  <span className="text-indigo-400 font-mono">{quizCount} Questions</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={quizCount}
                  onChange={(e) => setQuizCount(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={!quizTopic.trim() || isGeneratingQuiz}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                {isGeneratingQuiz ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>JARVIS is Drafting Quiz...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Create Custom Quiz</span>
                  </>
                )}
              </button>
            </form>

            <div className="p-3.5 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl text-[11px] text-zinc-400 space-y-1">
              <p className="font-bold text-indigo-300">Active Recall Engine</p>
              <p>Each correct answer awards +15 XP. Completing the full set delivers streak bonuses.</p>
            </div>
          </div>

          {/* Quiz Display & Interactive Testing Area */}
          <div className="lg:col-span-2 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-5">
            {!activeQuiz && !isGeneratingQuiz && (
              <div className="h-72 flex flex-col items-center justify-center text-center space-y-3 p-6 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                <HelpCircle className="w-10 h-10 text-zinc-600" />
                <p className="text-sm font-semibold text-zinc-400">Ready to test your mastery?</p>
                <p className="text-xs text-zinc-500 max-w-sm">
                  Enter a topic on the left to have JARVIS synthesize a tailored multiple-choice and short-answer challenge.
                </p>
              </div>
            )}

            {isGeneratingQuiz && (
              <div className="h-72 flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                <p className="text-sm font-bold text-white font-mono">Synthesizing Exam Questions...</p>
                <p className="text-xs text-zinc-400">Consulting syllabus standards and mark schemes.</p>
              </div>
            )}

            {activeQuiz && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                  <div>
                    <h3 className="text-base font-extrabold text-white">{activeQuiz.title || 'Practice Quiz'}</h3>
                    <p className="text-xs text-zinc-400">{activeQuiz.questions?.length || 0} Questions • Grade 11 Level</p>
                  </div>

                  {quizSubmitted && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs">
                      <Award className="w-4 h-4" />
                      <span>{quizScore} / {activeQuiz.questions.length} Correct</span>
                    </div>
                  )}
                </div>

                {/* Questions List */}
                <div className="space-y-5">
                  {activeQuiz.questions?.map((q: any, idx: number) => {
                    const selected = userAnswers[q.id];
                    const isCorrect = selected?.toLowerCase() === q.correctAnswer?.toLowerCase();

                    return (
                      <div
                        key={q.id || idx}
                        className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/90 space-y-3"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-mono text-indigo-400 shrink-0 font-bold">
                            {idx + 1}
                          </span>
                          <p className="text-xs sm:text-sm font-semibold text-zinc-100">{q.question}</p>
                        </div>

                        {/* Options */}
                        {q.options && q.options.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8">
                            {q.options.map((opt: string, oIdx: number) => {
                              const isOptionSelected = selected === opt;
                              const isOptionTargetCorrect = opt.toLowerCase() === q.correctAnswer?.toLowerCase();

                              let buttonStyle = 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800';
                              if (quizSubmitted) {
                                if (isOptionTargetCorrect) {
                                  buttonStyle = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 font-bold';
                                } else if (isOptionSelected && !isOptionTargetCorrect) {
                                  buttonStyle = 'bg-rose-500/20 border-rose-500/50 text-rose-300 line-through';
                                }
                              } else if (isOptionSelected) {
                                buttonStyle = 'bg-indigo-600/30 border-indigo-500 text-white font-bold';
                              }

                              return (
                                <button
                                  key={oIdx}
                                  onClick={() => handleSelectAnswer(q.id, opt)}
                                  className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${buttonStyle}`}
                                >
                                  <span>{opt}</span>
                                  {quizSubmitted && isOptionTargetCorrect && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="pl-8">
                            <input
                              type="text"
                              disabled={quizSubmitted}
                              value={selected || ''}
                              onChange={(e) => handleSelectAnswer(q.id, e.target.value)}
                              placeholder="Type your answer..."
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        )}

                        {/* Explanation reveal */}
                        {quizSubmitted && (
                          <div className="pl-8 pt-2">
                            <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs space-y-1">
                              <p className="font-bold text-zinc-300 flex items-center gap-1.5">
                                {isCorrect ? (
                                  <span className="text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Correct Answer
                                  </span>
                                ) : (
                                  <span className="text-rose-400 flex items-center gap-1">
                                    <XCircle className="w-3.5 h-3.5" /> Expected: {q.correctAnswer}
                                  </span>
                                )}
                              </p>
                              <p className="text-zinc-400 text-[11px] leading-relaxed">{q.explanation}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Submit / Retry Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                  {!quizSubmitted ? (
                    <button
                      onClick={handleSubmitQuiz}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                    >
                      Submit Quiz & Collect XP
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setUserAnswers({});
                        setQuizSubmitted(false);
                      }}
                      className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold flex items-center gap-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retake Quiz</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 2: EXPLAIN TOPIC MODE --- */}
      {activeTab === 'explain' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-white">
                Deep Explainer
              </h2>
            </div>

            <form onSubmit={handleGenerateExplain} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Topic or Mechanism</label>
                <input
                  type="text"
                  value={explainTopic}
                  onChange={(e) => setExplainTopic(e.target.value)}
                  placeholder="e.g. Photoelectric Effect or Photosynthesis"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Target Subject</label>
                <select
                  value={explainSubjectId}
                  onChange={(e) => setExplainSubjectId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                >
                  {state.subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Explanation Depth</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'intuitive', label: 'Intuitive' },
                    { id: 'standard_ib', label: 'Standard IB' },
                    { id: 'rigorous', label: 'Rigorous' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setExplainLevel(lvl.id as any)}
                      className={`py-2 rounded-xl border text-[11px] font-bold text-center transition-all ${
                        explainLevel === lvl.id
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!explainTopic.trim() || isGeneratingExplain}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
              >
                {isGeneratingExplain ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>JARVIS is Clarifying...</span>
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-4 h-4" />
                    <span>Explain Concept</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4">
            {!explainResult && !isGeneratingExplain && (
              <div className="h-72 flex flex-col items-center justify-center text-center space-y-3 p-6 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                <Brain className="w-10 h-10 text-zinc-600" />
                <p className="text-sm font-semibold text-zinc-400">Demystify any tough syllabus concept</p>
                <p className="text-xs text-zinc-500 max-w-sm">
                  JARVIS will strip away confusing jargon, provide a step-by-step mental model, and create exam flashcard pairs.
                </p>
              </div>
            )}

            {isGeneratingExplain && (
              <div className="h-72 flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
                <p className="text-sm font-bold text-white font-mono">Building Visual Mental Model...</p>
              </div>
            )}

            {explainResult && (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div>
                    <h3 className="text-lg font-black text-white">{explainResult.topic || explainTopic}</h3>
                    <p className="text-xs text-amber-400 font-mono">Conceptual Overview</p>
                  </div>
                  <button
                    onClick={handleSaveExplainAsNote}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Save to Notes</span>
                  </button>
                </div>

                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase font-mono">Core Summary</h4>
                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans">{explainResult.summary}</p>
                </div>

                {explainResult.detailedExplanation && (
                  <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase font-mono">Mechanisms & Nuance</h4>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">{explainResult.detailedExplanation}</p>
                  </div>
                )}

                {/* Key Takeaways */}
                {explainResult.keyConcepts && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase font-mono">High-Yield Takeaways</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {explainResult.keyConcepts.map((item: string, idx: number) => (
                        <div key={idx} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exam Tip */}
                {explainResult.studyTip && (
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-200 flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold uppercase font-mono text-[10px] text-amber-400">Exam Memory Tip:</span>
                      <p className="mt-0.5">{explainResult.studyTip}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 3: STUDY PLAN GENERATOR --- */}
      {activeTab === 'plan' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-white">
                Exam Roadmap Builder
              </h2>
            </div>

            <form onSubmit={handleGeneratePlan} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Subject</label>
                <select
                  value={planSubjectId}
                  onChange={(e) => setPlanSubjectId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                >
                  {state.subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Days Until Exam / Milestone</label>
                <input
                  type="number"
                  min="3"
                  max="30"
                  value={planDays}
                  onChange={(e) => setPlanDays(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Daily Study Target (Minutes)</label>
                <input
                  type="number"
                  min="15"
                  max="180"
                  step="15"
                  value={planDailyMins}
                  onChange={(e) => setPlanDailyMins(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Specific Weak Topics (Optional)</label>
                <input
                  type="text"
                  value={planTopics}
                  onChange={(e) => setPlanTopics(e.target.value)}
                  placeholder="e.g. Organic Chem, Hess's Law"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isGeneratingPlan}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                {isGeneratingPlan ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Calculating Spaced Schedule...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>Generate Day-by-Day Plan</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4">
            {!studyPlanResult && !isGeneratingPlan && (
              <div className="h-72 flex flex-col items-center justify-center text-center space-y-3 p-6 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                <Calendar className="w-10 h-10 text-zinc-600" />
                <p className="text-sm font-semibold text-zinc-400">Plan out your exam countdown</p>
                <p className="text-xs text-zinc-500 max-w-sm">
                  JARVIS will schedule spaced repetitions and tapering sessions leading directly up to your test date.
                </p>
              </div>
            )}

            {isGeneratingPlan && (
              <div className="h-72 flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                <p className="text-sm font-bold text-white font-mono">Optimizing Retention Curve...</p>
              </div>
            )}

            {studyPlanResult && (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div>
                    <h3 className="text-base font-extrabold text-white">{studyPlanResult.planTitle}</h3>
                    <p className="text-xs text-emerald-400 font-mono">
                      {studyPlanResult.dailySessions?.length} Guided Sessions
                    </p>
                  </div>

                  <button
                    onClick={handleConvertPlanToTasks}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Add All to My Tasks</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {studyPlanResult.dailySessions?.map((sess: any) => (
                    <div
                      key={sess.dayNumber}
                      className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-mono font-bold text-emerald-400 shrink-0">
                          D{sess.dayNumber}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-100">{sess.focusTopic}</p>
                          <p className="text-[11px] text-zinc-400">{sess.technique}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-indigo-400">{sess.minutes}m</span>
                        <p className="text-[10px] text-zinc-500 font-mono">{sess.date}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {studyPlanResult.finalAdvice && (
                  <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs text-zinc-300">
                    <span className="font-bold text-emerald-400 font-mono uppercase text-[10px]">JARVIS Strategy: </span>
                    <span>{studyPlanResult.finalAdvice}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 4: NOTE SUMMARIZER --- */}
      {activeTab === 'summarize' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Paste Raw Class Notes</span>
            </h2>

            <form onSubmit={handleSummarizeNotes} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Title</label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Chapter 4 Thermodynamics"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Notes / Lecture Content</label>
                <textarea
                  rows={8}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Paste your unorganized bullet points, class slides, or textbook excerpts here..."
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-white focus:outline-none font-mono resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!noteContent.trim() || isSummarizing}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
              >
                {isSummarizing ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>JARVIS is Distilling...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Distill into Study Flashcards</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-white">
              Synthesized Summary & Flashcards
            </h2>

            {!summaryResult && (
              <div className="h-72 flex flex-col items-center justify-center text-center p-6 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                <FileText className="w-10 h-10 text-zinc-600 mb-2" />
                <p className="text-xs text-zinc-500">
                  Paste notes on the left to extract flashcards, high-yield takeaways, and quick practice checks.
                </p>
              </div>
            )}

            {summaryResult && (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1.5">
                  <span className="text-[10px] uppercase font-mono font-bold text-cyan-400">Executive Summary</span>
                  <p className="text-xs text-zinc-200 leading-relaxed">{summaryResult.summary}</p>
                </div>

                {summaryResult.keyTakeaways && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-mono font-bold text-zinc-400">Key Takeaways</span>
                    <div className="space-y-1">
                      {summaryResult.keyTakeaways.map((item: string, idx: number) => (
                        <div key={idx} className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300">
                          • {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {summaryResult.flashcards && (
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-mono font-bold text-cyan-400">Extracted Flashcards</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {summaryResult.flashcards.map((fc: any, idx: number) => (
                        <div key={idx} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
                          <p className="text-[11px] font-bold text-indigo-300">{fc.front}</p>
                          <p className="text-xs text-zinc-300">{fc.back}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
