import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { sound } from '../lib/sound';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Bot,
  X,
  Check,
  AlertTriangle,
  ChevronDown,
  Terminal,
  Zap,
  Clock,
  CheckCircle2,
  Calendar as CalendarIcon,
  BookOpen,
  ArrowRight,
  Sliders,
  Play,
  Radio,
} from 'lucide-react';

export const JarvisAssistant: React.FC = () => {
  const {
    state,
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
    stopJarvisSpeaking,
    updateSettings,
    testJarvisVoice,
    getAvailableVoices,
    setJarvisVoice,
    setJarvisCadence,
  } = useApp();

  const [inputCommand, setInputCommand] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [voices, setVoices] = useState<Array<{ name: string; lang: string; voiceURI: string; isNatural: boolean }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on response update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [jarvisResponse, jarvisTranscript, isJarvisProcessing]);

  // Focus input when opened
  useEffect(() => {
    if (isJarvisOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
      setVoices(getAvailableVoices());
    }
  }, [isJarvisOpen, isMinimized, getAvailableVoices]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputCommand.trim() || isJarvisProcessing) return;

    const cmd = inputCommand.trim();
    setInputCommand('');
    await submitJarvisCommand(cmd, false);
  };

  const handleQuickPrompt = async (prompt: string) => {
    sound.playClick();
    setInputCommand('');
    await submitJarvisCommand(prompt, false);
  };

  const isAutoSpeak = state.settings.jarvis?.autoSpeak ?? true;

  const toggleVoiceFeedback = () => {
    sound.playClick();
    updateSettings({
      jarvis: {
        ...state.settings.jarvis,
        autoSpeak: !isAutoSpeak,
        voiceFeedbackEnabled: !isAutoSpeak,
      },
    });
    if (isJarvisSpeaking) {
      stopJarvisSpeaking();
    }
  };

  const samplePrompts = [
    'Add Math HL homework due tomorrow at 5 PM',
    'Schedule IB Physics exam on September 15th at 10 AM',
    'Start a 25-minute study session for Chemistry',
    'Explain the photoelectric effect for IB Physics',
    'What tasks do I have scheduled for today?',
    'Mark all completed tasks as done',
  ];

  return (
    <>
      {/* Floating Pill Launcher (When HUD is closed) */}
      {!isJarvisOpen && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsJarvisOpen(true);
              sound.playJarvisChime();
            }}
            className="group flex items-center gap-3 px-4 py-3 bg-zinc-950/90 hover:bg-zinc-900 border border-cyan-500/40 hover:border-cyan-400 rounded-full shadow-2xl shadow-cyan-500/20 backdrop-blur-md cursor-pointer transition-all"
            title="Ask JARVIS (Say 'Hey Jarvis' or click)"
          >
            <div className="relative flex items-center justify-center">
              <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-zinc-950 font-bold shadow-lg shadow-cyan-500/30">
                <Bot className="w-4 h-4 text-black" />
              </span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping" />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wider text-cyan-400 uppercase font-mono">
                  JARVIS AI
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-cyan-500/10 text-cyan-300 font-mono border border-cyan-500/30">
                  ONLINE
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">
                Click or say &quot;Hey Jarvis&quot;
              </span>
            </div>
          </motion.button>
        </motion.div>
      )}

      {/* Main JARVIS Futuristic HUD Window */}
      <AnimatePresence>
        {isJarvisOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed z-50 transition-all ${
              isMinimized
                ? 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-72 sm:w-80'
                : 'bottom-2 inset-x-2 sm:inset-auto sm:bottom-6 sm:right-6 w-[calc(100vw-1rem)] sm:w-[480px] max-h-[88vh] sm:max-h-[85vh]'
            }`}
          >
            <div className="flex flex-col bg-zinc-950/95 border border-cyan-500/50 rounded-3xl shadow-2xl shadow-cyan-950/60 backdrop-blur-2xl overflow-hidden ring-1 ring-cyan-500/30 text-zinc-100">
              {/* Header: Arc Reactor & Status Indicator */}
              <div className="px-5 py-4 border-b border-cyan-500/20 bg-gradient-to-r from-zinc-900 via-cyan-950/30 to-zinc-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Glowing Arc Reactor Ring */}
                  <div className="relative w-10 h-10 flex items-center justify-center">
                    <div
                      className={`absolute inset-0 rounded-full border border-cyan-400/40 ${
                        isJarvisListening
                          ? 'animate-ping duration-1000 bg-cyan-500/20'
                          : isJarvisProcessing
                          ? 'animate-spin border-t-cyan-400 border-r-transparent'
                          : ''
                      }`}
                    />
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        isJarvisListening
                          ? 'bg-cyan-400 text-zinc-950 ring-4 ring-cyan-400/30 shadow-lg shadow-cyan-400/50'
                          : isJarvisSpeaking
                          ? 'bg-indigo-500 text-white ring-4 ring-indigo-500/30'
                          : 'bg-zinc-900 text-cyan-400 border border-cyan-500/40'
                      }`}
                    >
                      <Bot className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-black tracking-widest uppercase font-mono text-cyan-300">
                        JARVIS PROTOCOL
                      </h2>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-cyan-400/10 text-cyan-300 border border-cyan-400/30 font-mono">
                        v2.5
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-mono flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isJarvisListening
                            ? 'bg-cyan-400 animate-pulse'
                            : isJarvisProcessing
                            ? 'bg-amber-400 animate-bounce'
                            : isJarvisSpeaking
                            ? 'bg-indigo-400 animate-pulse'
                            : 'bg-emerald-400'
                        }`}
                      />
                      {isJarvisListening
                        ? 'Listening to Tyler...'
                        : isJarvisProcessing
                        ? 'Synthesizing action...'
                        : isJarvisSpeaking
                        ? 'Speaking response...'
                        : 'Standby • Ready for commands'}
                    </p>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setShowVoiceSettings(!showVoiceSettings);
                      setVoices(getAvailableVoices());
                    }}
                    className={`p-2 rounded-xl border transition-colors ${
                      showVoiceSettings
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                    title="Voice Clarity & Tone Calibration"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={toggleVoiceFeedback}
                    className={`p-2 rounded-xl border transition-colors ${
                      isAutoSpeak
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                        : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                    }`}
                    title={isAutoSpeak ? 'Voice Feedback Enabled' : 'Voice Muted'}
                  >
                    {isAutoSpeak ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className={`p-2 rounded-xl border transition-colors ${
                      showHistory
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                    title="Toggle Command Log"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                    title={isMinimized ? 'Expand' : 'Minimize'}
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
                  </button>

                  <button
                    onClick={() => {
                      if (isJarvisListening) stopJarvisListening();
                      if (isJarvisSpeaking) stopJarvisSpeaking();
                      setIsJarvisOpen(false);
                    }}
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-950/50 text-zinc-400 hover:text-rose-300 border border-zinc-800 transition-colors"
                    title="Close JARVIS"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {!isMinimized && (
                <>
                  {/* Active Audio Waveform Visualizer (When listening or speaking) */}
                  {(isJarvisListening || isJarvisSpeaking || isJarvisProcessing) && (
                    <div className="px-5 py-2.5 bg-cyan-950/30 border-b border-cyan-500/20 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                          {isJarvisListening
                            ? 'VOICE INPUT DETECTED'
                            : isJarvisSpeaking
                            ? 'AUDIO SYNTHESIS'
                            : 'NEURAL PROCESSING'}
                        </span>
                      </div>

                      {/* Animated Equalizer Bars */}
                      <div className="flex items-center gap-1 h-4">
                        {[40, 90, 60, 100, 70, 85, 50, 95, 65, 45].map((h, idx) => (
                          <span
                            key={idx}
                            className={`w-1 rounded-full ${
                              isJarvisListening
                                ? 'bg-cyan-400 animate-pulse'
                                : isJarvisSpeaking
                                ? 'bg-indigo-400 animate-pulse'
                                : 'bg-amber-400'
                            }`}
                            style={{
                              height: `${h}%`,
                              animationDelay: `${idx * 80}ms`,
                              animationDuration: '600ms',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Main Conversation & Output View */}
                  <div className="p-4 sm:p-5 max-h-96 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
                    {/* Voice Clarity Calibration Drawer */}
                    {showVoiceSettings && (
                      <div className="p-3.5 bg-zinc-900/95 border border-amber-500/30 rounded-2xl space-y-3 mb-3 text-xs">
                        <div className="flex items-center justify-between font-mono text-amber-400 font-bold border-b border-zinc-800 pb-1.5">
                          <span className="flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5" /> Speech Clarity Calibration
                          </span>
                          <span className="text-[10px] text-zinc-500 font-normal">Cadence & Acoustics</span>
                        </div>

                        {/* Preferred Voice Dropdown */}
                        <div>
                          <label className="block text-[11px] text-zinc-400 mb-1">Jarvis Voice Accent:</label>
                          <select
                            value={state.settings.jarvis?.selectedVoiceURI || ''}
                            onChange={(e) => setJarvisVoice(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-xs focus:outline-none focus:border-amber-400"
                          >
                            <option value="">Auto-Optimized Natural Voice (Recommended)</option>
                            {voices.map((v) => (
                              <option key={v.voiceURI} value={v.voiceURI}>
                                {v.name} ({v.lang}) {v.isNatural ? '★ Natural' : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Speech Rate Slider */}
                        <div>
                          <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                            <span>Speech Rate (Cadence):</span>
                            <span className="font-mono text-amber-400">
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
                            className="w-full accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                          />
                          <div className="flex justify-between text-[9px] text-zinc-500 mt-0.5">
                            <span>Slower & Deliberate</span>
                            <span>Standard</span>
                            <span>Brisk</span>
                          </div>
                        </div>

                        {/* Voice Pitch Slider */}
                        <div>
                          <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                            <span>Voice Pitch (Tone):</span>
                            <span className="font-mono text-amber-400">
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
                            className="w-full accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                          />
                        </div>

                        {/* Test Clear Speech Button */}
                        <div className="pt-1 flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              testJarvisVoice(
                                'Good day, Tyler. Jarvis speech synthesis has been calibrated for crystal clear clarity.'
                              )
                            }
                            className="flex-1 py-2 px-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Play className="w-3.5 h-3.5 fill-amber-300" /> Test Voice Clarity
                          </button>
                        </div>
                      </div>
                    )}
                    {/* Command History Drawer */}
                    {showHistory && (
                      <div className="p-3.5 bg-zinc-900/90 border border-cyan-500/20 rounded-2xl space-y-2 mb-3">
                        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                          <span className="text-cyan-400 font-bold">Command Log</span>
                          <span>{state.jarvisLogs?.length || 0} entries</span>
                        </div>
                        <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                          {(!state.jarvisLogs || state.jarvisLogs.length === 0) ? (
                            <p className="text-xs text-zinc-500 italic">No past commands recorded.</p>
                          ) : (
                            state.jarvisLogs.slice(0, 10).map((log) => (
                              <div
                                key={log.id}
                                className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono space-y-0.5"
                              >
                                <p className="text-cyan-300 font-semibold truncate">❯ {log.command}</p>
                                <p className="text-zinc-400 truncate text-[10px]">{log.reply}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* Live Transcript Bubble when User is Speaking */}
                    {jarvisTranscript && (
                      <div className="flex items-start gap-2.5 justify-end">
                        <div className="p-3.5 bg-cyan-500/15 border border-cyan-500/40 rounded-2xl rounded-tr-xs max-w-[85%] text-cyan-200 text-xs font-mono">
                          <p className="text-[10px] text-cyan-400/80 uppercase font-bold mb-1">
                            Tyler (Voice):
                          </p>
                          <p className="leading-relaxed">&quot;{jarvisTranscript}&quot;</p>
                        </div>
                      </div>
                    )}

                    {/* JARVIS Primary Response Card */}
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl rounded-tl-xs space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                            <span className="text-cyan-400 font-bold uppercase">JARVIS AI RESPONSE</span>
                            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>

                          {isJarvisProcessing ? (
                            <div className="flex items-center gap-2 py-2 text-xs text-cyan-300 font-mono">
                              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                              <span>Parsing instruction & coordinating system...</span>
                            </div>
                          ) : (
                            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans">
                              {jarvisResponse ||
                                "Good day, Tyler. I am ready to assist with your IB workload, schedule, study timer, and tasks. You may speak or type any command."}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Destructive Action Confirmation Dialog */}
                    <AnimatePresence>
                      {jarvisConfirmation.isOpen && (
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.95, opacity: 0 }}
                          className="p-4 bg-rose-950/40 border border-rose-500/50 rounded-2xl space-y-3"
                        >
                          <div className="flex items-start gap-2.5 text-rose-300">
                            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                            <div>
                              <h4 className="text-xs font-bold text-rose-200 uppercase font-mono">
                                {jarvisConfirmation.title}
                              </h4>
                              <p className="text-xs text-rose-300/90 mt-0.5 leading-relaxed">
                                {jarvisConfirmation.message}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1 justify-end">
                            <button
                              onClick={cancelJarvisAction}
                              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 font-semibold"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={confirmJarvisAction}
                              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-900/30 flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Proceed</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Quick Command Suggestions */}
                    <div className="pt-2">
                      <p className="text-[10px] uppercase font-bold text-zinc-500 font-mono tracking-wider mb-2">
                        Suggested Voice/Text Commands:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {samplePrompts.slice(0, 4).map((prompt, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuickPrompt(prompt)}
                            className="text-left text-[11px] px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-cyan-950/40 border border-zinc-800 hover:border-cyan-500/40 text-zinc-300 hover:text-cyan-300 transition-colors truncate max-w-full"
                          >
                            &quot;{prompt}&quot;
                          </button>
                        ))}
                      </div>
                    </div>

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Dock: Mic Toggle + Text Input + Send */}
                  <div className="p-4 border-t border-cyan-500/20 bg-zinc-950 space-y-2.5">
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                      {/* Big Mic Button with Pulsing Listening Effect */}
                      <button
                        type="button"
                        onClick={() => {
                          if (isJarvisListening) {
                            stopJarvisListening();
                          } else {
                            startJarvisListening();
                          }
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer shrink-0 ${
                          isJarvisListening
                            ? 'bg-rose-500 text-white border-rose-400 ring-4 ring-rose-500/30 animate-pulse shadow-lg shadow-rose-500/40'
                            : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/40'
                        }`}
                        title={isJarvisListening ? 'Stop Listening' : 'Speak to JARVIS'}
                      >
                        {isJarvisListening ? (
                          <MicOff className="w-5 h-5" />
                        ) : (
                          <Mic className="w-5 h-5" />
                        )}
                      </button>

                      {/* Text Command Input */}
                      <div className="relative flex-1">
                        <input
                          ref={inputRef}
                          type="text"
                          value={inputCommand}
                          onChange={(e) => setInputCommand(e.target.value)}
                          placeholder={
                            isJarvisListening
                              ? 'Listening to speech...'
                              : 'Ask JARVIS (e.g., "Add chemistry exam")...'
                          }
                          disabled={isJarvisProcessing}
                          className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-cyan-500 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
                        />
                      </div>

                      {/* Send Button */}
                      <button
                        type="submit"
                        disabled={!inputCommand.trim() || isJarvisProcessing}
                        className="p-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-zinc-950 rounded-2xl font-bold transition-all shadow-md shadow-cyan-500/20 shrink-0 cursor-pointer"
                        title="Submit Command"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>

                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 px-1">
                      <span>Wake-phrase: &quot;Hey Jarvis&quot;</span>
                      <span>Press Enter to dispatch</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
