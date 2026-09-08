import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization of GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// Helper for local rule-based parsing in case Gemini API key is missing or offline
function fallbackJarvisCommand(command: string, context: any) {
  const lower = command.toLowerCase().trim();
  const actions: any[] = [];
  let reply = '';
  let requiresConfirmation = false;
  let confirmationDetails: any = null;

  // Check for destructive deletion
  if (lower.includes('delete completed') || lower.includes('clear completed') || lower.includes('remove completed')) {
    requiresConfirmation = true;
    confirmationDetails = {
      title: 'Confirm Bulk Deletion',
      message: 'Are you sure you want to remove all completed tasks?',
      actionType: 'clear_completed_tasks',
    };
    reply = "I've queued the deletion of all completed tasks. Please confirm to proceed.";
    return { reply, actions, requiresConfirmation, confirmationDetails };
  }

  if (lower.includes('clear data') || lower.includes('reset all') || lower.includes('wipe data')) {
    requiresConfirmation = true;
    confirmationDetails = {
      title: 'Warning: Reset All Data',
      message: 'This will reset your study data, tasks, and streaks. Are you certain?',
      actionType: 'reset_all_data',
    };
    reply = "Resetting all data is a major step. Please confirm below if you wish to proceed.";
    return { reply, actions, requiresConfirmation, confirmationDetails };
  }

  // Timer controls
  if (lower.includes('start') && (lower.includes('timer') || lower.includes('session') || lower.includes('study'))) {
    const minsMatch = lower.match(/(\d+)\s*(?:minute|min)/i);
    const duration = minsMatch ? parseInt(minsMatch[1], 10) : 25;
    
    // Find subject if mentioned
    let matchedSubId = '';
    let matchedSubName = '';
    if (context?.subjects?.length) {
      for (const s of context.subjects) {
        if (lower.includes(s.name.toLowerCase()) || (s.code && lower.includes(s.code.toLowerCase()))) {
          matchedSubId = s.id;
          matchedSubName = s.name;
          break;
        }
      }
    }

    actions.push({
      type: 'start_timer',
      payload: {
        durationMinutes: duration,
        subjectId: matchedSubId || undefined,
      },
    });

    reply = `Starting a ${duration}-minute study session${matchedSubName ? ` for ${matchedSubName}` : ''}. Locked in and ready, Tyler!`;
    return { reply, actions, requiresConfirmation: false };
  }

  if (lower.includes('stop timer') || lower.includes('pause timer') || lower.includes('end timer')) {
    actions.push({
      type: 'stop_timer',
      payload: {},
    });
    reply = "I've paused your study timer. Take a breather.";
    return { reply, actions, requiresConfirmation: false };
  }

  // Add task / homework
  if (lower.includes('add task') || lower.includes('homework') || lower.includes('finish') || lower.includes('need to do') || lower.includes('create task')) {
    let title = command
      .replace(/hey jarvis/i, '')
      .replace(/add (?:a )?task/i, '')
      .replace(/add homework/i, '')
      .replace(/create (?:a )?task/i, '')
      .replace(/i need to finish/i, 'Finish')
      .replace(/i need to/i, '')
      .trim();

    // extract subject if present
    let matchedSubId = '';
    let matchedSubName = '';
    if (context?.subjects?.length) {
      for (const s of context.subjects) {
        if (lower.includes(s.name.toLowerCase())) {
          matchedSubId = s.id;
          matchedSubName = s.name;
          break;
        }
      }
    }

    actions.push({
      type: 'create_task',
      payload: {
        title: title || 'New Study Assignment',
        subjectId: matchedSubId || undefined,
        priority: lower.includes('urgent') ? 'urgent' : lower.includes('high') ? 'high' : 'medium',
        dueDate: context?.currentDate || new Date().toISOString().split('T')[0],
      },
    });

    reply = `Right away. Added "${title || 'New Study Assignment'}" to your tasks${matchedSubName ? ` under ${matchedSubName}` : ''}.`;
    return { reply, actions, requiresConfirmation: false };
  }

  // Add calendar event / test
  if (lower.includes('test') || lower.includes('exam') || lower.includes('calendar') || lower.includes('event')) {
    actions.push({
      type: 'create_event',
      payload: {
        title: command.replace(/hey jarvis/i, '').replace(/add (?:an? )?/i, '').trim(),
        date: context?.currentDate || new Date().toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '11:00',
        category: lower.includes('exam') || lower.includes('test') ? 'exam' : 'homework',
      },
    });

    reply = `Scheduled the event on your calendar. I'll make sure you're prepared.`;
    return { reply, actions, requiresConfirmation: false };
  }

  // General assistant response
  reply = `Understood, Tyler. I've noted that: "${command}". I am here to assist with your IB workload, timers, and schedule.`;
  return { reply, actions, requiresConfirmation: false };
}

// 1. JARVIS Intelligent Natural Language Command Endpoint
app.post('/api/jarvis/command', async (req, res) => {
  const { command, context } = req.body;

  if (!command || typeof command !== 'string') {
    return res.status(400).json({ error: 'Command string is required.' });
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Fallback if no GEMINI_API_KEY is configured
    const result = fallbackJarvisCommand(command, context);
    return res.json(result);
  }

  try {
    const today = context?.currentDate || new Date().toISOString().split('T')[0];
    const systemInstruction = `You are JARVIS, an ultra-competent, supportive, futuristic AI executive study assistant for Tyler, an ambitious IB Grade 11 student.
Current Date: ${today}.
Current Day: ${context?.currentDayName || 'Today'}.

 Tyler's Active Subjects:
${JSON.stringify(context?.subjects || [], null, 2)}

Tyler's Today Tasks:
${JSON.stringify(context?.tasks?.slice(0, 10) || [], null, 2)}

Active Events / Schedule:
${JSON.stringify(context?.events?.slice(0, 10) || [], null, 2)}

Study Timer Status:
${JSON.stringify(context?.timerStatus || {}, null, 2)}

Streak: ${context?.streakCount || 0} days | Level: ${context?.level || 1} | XP: ${context?.xp || 0}

YOUR CORE BEHAVIORS:
1. Speak with the crisp, polite, refined efficiency of Tony Stark's JARVIS ("Right away, Tyler.", "Splendid progress.", "Certainly, setting that up now."). Keep responses natural, concise (1-3 sentences), ready to be spoken aloud.
2. Translate Tyler's natural language command into ONE or MORE precise website actions. If he mentions multiple items (e.g. "I have a German exam next Thursday. Add it to my calendar, create a study plan for the next seven days, give me 20 minutes of German study every day, and remind me the night before."), you MUST return multiple actions covering every single request!
3. Match subjects intelligently (e.g. "German" -> German B ID; "Math" -> Mathematics / AI ID; "Bio" -> Biology; "Politics" -> Global Politics).
4. CONFIRMATION PROTOCOL:
   - For destructive operations (e.g. "delete all completed tasks", "delete calendar event", "wipe my history", "delete 5 tasks"), you MUST set "requiresConfirmation": true, and provide "confirmationDetails": { "title": string, "message": string, "actionType": string }.
   - For harmless actions (creating tasks, adding events, setting reminders, starting timers, generating study plans, adding notes, creating quizzes), execute immediately ("requiresConfirmation": false).

ACTION TYPES & PAYLOAD SCHEMAS:
- create_task: { title: string, description?: string, subjectId?: string, dueDate?: string (YYYY-MM-DD), dueTime?: string (HH:mm), priority: "low" | "medium" | "high" | "urgent", status: "not_started" | "in_progress" | "completed", estimatedMinutes?: number, tags?: string[] }
- update_task: { taskId?: string, taskTitleQuery?: string, updates: { priority?: "low" | "medium" | "high" | "urgent", status?: "not_started" | "in_progress" | "completed", dueDate?: string, dueTime?: string } }
- complete_task: { taskId?: string, taskTitleQuery?: string }
- delete_task: { taskId?: string, taskTitleQuery?: string, deleteAllCompleted?: boolean }
- create_event: { title: string, date: string (YYYY-MM-DD), startTime: string (HH:mm), endTime: string (HH:mm), category: "exam" | "homework" | "study" | "reminder" | "class", description?: string, priority: "low" | "medium" | "high" | "urgent" }
- update_event: { eventId?: string, eventTitleQuery?: string, updates: { date?: string, startTime?: string, endTime?: string } }
- delete_event: { eventId?: string, eventTitleQuery?: string }
- create_reminder: { title: string, date: string (YYYY-MM-DD), time?: string, category: string, priority: "low" | "medium" | "high" | "urgent" }
- start_timer: { durationMinutes: number, subjectId?: string }
- stop_timer: {}
- create_study_plan: { title: string, subjectId?: string, examDate: string, dailyMinutes: number, sessions: { date: string, minutes: number, topic: string }[] }
- create_note: { title: string, subjectId?: string, content: string, tags?: string[] }
- create_quiz: { topic: string, subjectId?: string, questions: { question: string, type: "multiple_choice" | "true_false" | "short_answer", options?: string[], correctAnswer: string, explanation: string }[] }
- update_goal: { title: string, targetMinutes?: number, subjectId?: string }
- award_xp: { amount: number, reason: string }
- add_subject: { name: string, code?: string, color?: string, icon?: string }
- explain_topic: { topic: string, explanation: string, keyConcepts: string[] }
- navigate: { tab: "dashboard" | "calendar" | "tasks" | "study" | "subjects" | "ai_study" | "rewards" | "achievements" | "stats" | "settings" | "jarvis" }

Always return valid JSON strictly adhering to the response schema.`;

    const prompt = `Tyler's Voice/Text Command: "${command}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: 'Conversational, polite response from JARVIS to be spoken and displayed.',
            },
            actions: {
              type: Type.ARRAY,
              description: 'List of structured actions to apply to the web application state.',
              items: {
                type: Type.OBJECT,
                properties: {
                  type: {
                    type: Type.STRING,
                    description: 'The action type identifier.',
                  },
                  payload: {
                    type: Type.OBJECT,
                    description: 'Payload parameters for the action.',
                  },
                },
                required: ['type', 'payload'],
              },
            },
            requiresConfirmation: {
              type: Type.BOOLEAN,
              description: 'True if this is a destructive bulk action requiring confirmation.',
            },
            confirmationDetails: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                message: { type: Type.STRING },
                actionType: { type: Type.STRING },
              },
            },
          },
          required: ['reply', 'actions', 'requiresConfirmation'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/jarvis/command:', err);
    // Graceful fallback on any API error
    const fallback = fallbackJarvisCommand(command, context);
    return res.json(fallback);
  }
});

// 2. AI Quiz Generator
app.post('/api/ai/quiz', async (req, res) => {
  const { topic, subjectName, noteContent, questionCount = 5 } = req.body;

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      title: `${topic || 'General'} Knowledge Quiz`,
      questions: [
        {
          id: 'q1',
          question: `What is a primary principle in ${topic || 'this subject'}?`,
          type: 'multiple_choice',
          options: ['Fundamental analysis', 'Standard deviation', 'System equilibrium', 'Hypothesis testing'],
          correctAnswer: 'Fundamental analysis',
          explanation: 'Fundamental analysis is a cornerstone principle across academic study.',
        },
        {
          id: 'q2',
          question: `True or False: Regular revision enhances retrieval strength for ${topic || 'study concepts'}.`,
          type: 'true_false',
          options: ['True', 'False'],
          correctAnswer: 'True',
          explanation: 'Active recall and spaced repetition strengthen neural retrieval pathways.',
        },
        {
          id: 'q3',
          question: `Define the core function of ${topic || 'the topic'} in 1-2 sentences.`,
          type: 'short_answer',
          correctAnswer: 'Core functional mechanism',
          explanation: 'It regulates and drives systemic outcomes.',
        },
      ],
    });
  }

  try {
    const prompt = `Create a high-yield academic study quiz with ${questionCount} questions on the topic: "${topic || 'IB Grade 11 Topic'}".
Subject context: ${subjectName || 'General Academics'}.
${noteContent ? `Relevant Student Notes:\n"""\n${noteContent.slice(0, 3000)}\n"""` : ''}

Include a mix of:
- Multiple Choice (4 distinct options)
- True / False
- Short Answer
Provide clear explanations for each answer.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an IB World School certified academic instructor creating practice quizzes for Tyler.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  type: {
                    type: Type.STRING,
                    description: 'multiple_choice, true_false, or short_answer',
                  },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ['id', 'question', 'type', 'correctAnswer', 'explanation'],
              },
            },
          },
          required: ['title', 'questions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error generating quiz:', err);
    return res.status(500).json({ error: 'Failed to generate quiz.' });
  }
});

// 3. AI Explain Mode ("Explain photosynthesis to me")
app.post('/api/ai/explain', async (req, res) => {
  const { topic, subjectName, level = 'high school / IB' } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required.' });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      topic,
      summary: `${topic} is a key academic concept. Reviewing its inputs, transformation mechanisms, and output yields strong exam performance.`,
      keyConcepts: [
        'Core definition and scope',
        'Primary mechanism and steps',
        'Real-world significance and exam applications',
      ],
      flashcards: [
        { front: `What is ${topic}?`, back: 'The core subject principle examined in this module.' },
        { front: 'Why does it matter?', back: 'It forms a foundational building block for higher-level inquiries.' },
      ],
      studyTip: 'Create a quick mind-map connecting this to your recent class notes.',
    });
  }

  try {
    const prompt = `Explain the following topic for an ambitious student (${level} level): "${topic}".
Subject context: ${subjectName || 'General Academics'}.
Provide an engaging, crystal-clear explanation, bullet points of key takeaways, high-yield flashcard pairs, and an exam memory trick or tip.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are JARVIS, Tyler’s academic tutor. Explain complex concepts with vivid clarity, appropriate academic rigor, and structured takeaways.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            summary: { type: Type.STRING },
            detailedExplanation: { type: Type.STRING },
            keyConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.STRING },
                  back: { type: Type.STRING },
                },
                required: ['front', 'back'],
              },
            },
            studyTip: { type: Type.STRING },
          },
          required: ['topic', 'summary', 'detailedExplanation', 'keyConcepts', 'flashcards', 'studyTip'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/ai/explain:', err);
    return res.status(500).json({ error: 'Failed to generate explanation.' });
  }
});

// 4. AI Notes Summarizer & Flashcards
app.post('/api/ai/summarize-notes', async (req, res) => {
  const { title, content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content is required to summarize.' });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      summary: 'Summary of student notes: Key definitions and concepts captured.',
      keyTakeaways: ['Main point identified from notes', 'Essential formula or concept', 'Follow-up action item'],
      flashcards: [
        { front: 'Key Term', back: 'Definition extracted from study note' },
        { front: 'Application', back: 'Core exam relevance' },
      ],
      sampleQuizQuestions: [
        {
          question: `Based on your note "${title || 'Study Note'}", what is the primary takeaway?`,
          options: ['Core thesis', 'Alternative perspective', 'Standard formula', 'Counter-argument'],
          correctAnswer: 'Core thesis',
        },
      ],
    });
  }

  try {
    const prompt = `Analyze these student notes for "${title || 'Study Session'}":
"""
${content.slice(0, 6000)}
"""

Provide:
1. A concise, high-yield summary.
2. 3-5 key bullet takeaways.
3. 3-5 flashcard question/answer pairs.
4. 2 multiple choice practice questions.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are JARVIS, an elite academic summarizer. Turn raw notes into structured study mastery.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.STRING },
                  back: { type: Type.STRING },
                },
                required: ['front', 'back'],
              },
            },
            sampleQuizQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswer: { type: Type.STRING },
                },
                required: ['question', 'options', 'correctAnswer'],
              },
            },
          },
          required: ['summary', 'keyTakeaways', 'flashcards', 'sampleQuizQuestions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/ai/summarize-notes:', err);
    return res.status(500).json({ error: 'Failed to summarize notes.' });
  }
});

// 5. AI Study Plan Generator ("I have a biology exam in 10 days...")
app.post('/api/ai/study-plan', async (req, res) => {
  const { subjectName, examDate, daysUntilExam = 7, dailyMinutes = 30, specificTopics } = req.body;

  const ai = getGeminiClient();
  const fallbackPlan = {
    planTitle: `${subjectName || 'Exam'} Comprehensive Study Schedule`,
    dailySessions: Array.from({ length: Math.min(daysUntilExam, 14) }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      return {
        dayNumber: i + 1,
        date: dateStr,
        minutes: dailyMinutes,
        focusTopic: `Session ${i + 1}: ${specificTopics ? specificTopics.split(',')[i % 3] || 'Review' : 'Active Recall & Topic Mastery'}`,
        technique: i === daysUntilExam - 1 ? 'Light Flashcard Review & Rest' : 'Pomodoro 25m + Past Paper Questions',
      };
    }),
    finalAdvice: 'Ensure you review the mark scheme and get 8 hours of sleep before exam day.',
  };

  if (!ai) {
    return res.json(fallbackPlan);
  }

  try {
    const prompt = `Create a realistic, day-by-day study schedule for an upcoming ${subjectName || 'Academic'} exam.
Days until exam: ${daysUntilExam}
Daily time commitment: ${dailyMinutes} minutes
Target Exam Date: ${examDate || 'Next week'}
${specificTopics ? `Topics to cover: ${specificTopics}` : ''}

Distribute topics logically with spaced repetition, active recall, and a taper/rest session the evening before the exam.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are JARVIS, an elite academic strategist. Create balanced, high-retention study plans that prevent burnout.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            planTitle: { type: Type.STRING },
            dailySessions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  date: { type: Type.STRING },
                  minutes: { type: Type.INTEGER },
                  focusTopic: { type: Type.STRING },
                  technique: { type: Type.STRING },
                },
                required: ['dayNumber', 'date', 'minutes', 'focusTopic', 'technique'],
              },
            },
            finalAdvice: { type: Type.STRING },
          },
          required: ['planTitle', 'dailySessions', 'finalAdvice'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/ai/study-plan:', err);
    return res.json(fallbackPlan);
  }
});

// Start server with Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
