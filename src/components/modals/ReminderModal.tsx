import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PriorityLevel } from '../../types';
import { getTodayString, formatTimeDisplay } from '../../lib/dateUtils';
import { sound } from '../../lib/sound';
import {
  X,
  Bell,
  Calendar,
  Clock,
  Flag,
  Tag,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Play,
  Send,
  Trash2,
  Check,
  ShieldCheck,
  Smartphone,
  Info,
} from 'lucide-react';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalTab = 'alerts' | 'schedule' | 'new_reminder';

export const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, onClose }) => {
  const {
    state,
    addReminder,
    deleteReminder,
    updateSettings,
    notificationPermission,
    requestNotificationPermission,
    testEventNotification,
    speakJarvisText,
  } = useApp();

  const [activeTab, setActiveTab] = useState<ModalTab>('alerts');

  // Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [time, setTime] = useState('18:00');
  const [category, setCategory] = useState('Homework');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  if (!isOpen) return null;

  const notifSettings = state.settings.notifications || {
    enabled: true,
    browserNotifications: true,
    notifyBeforeMinutes: 15,
    soundAlert: true,
    voiceAnnounce: true,
  };

  const handleUpdateNotif = (partial: Partial<typeof notifSettings>) => {
    sound.playClick();
    updateSettings({
      notifications: {
        ...notifSettings,
        ...partial,
      },
    });
  };

  const handleEnablePermission = async () => {
    setIsRequestingPermission(true);
    await requestNotificationPermission();
    setIsRequestingPermission(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addReminder({
      title: title.trim(),
      date,
      time,
      category,
      priority,
      isDismissed: false,
    });
    setTitle('');
    sound.playTaskComplete();
    setActiveTab('schedule');
  };

  const todayStr = getTodayString();
  const todayEvents = state.events.filter((e) => e.date === todayStr);
  const todayTasks = state.tasks.filter((t) => t.dueDate === todayStr);
  const activeReminders = state.reminders.filter((r) => !r.isDismissed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Event Alerts & Reminders
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  Live
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Timely notifications before exams, classes & due dates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/50 px-4 pt-2 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all border-t border-x ${
              activeTab === 'alerts'
                ? 'bg-zinc-900 text-amber-400 border-zinc-800 border-b-transparent'
                : 'text-zinc-400 hover:text-zinc-200 border-transparent'
            }`}
          >
            Alert Settings
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all border-t border-x ${
              activeTab === 'schedule'
                ? 'bg-zinc-900 text-amber-400 border-zinc-800 border-b-transparent'
                : 'text-zinc-400 hover:text-zinc-200 border-transparent'
            }`}
          >
            Today's Alerts ({todayEvents.length + activeReminders.length})
          </button>
          <button
            onClick={() => setActiveTab('new_reminder')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all border-t border-x ${
              activeTab === 'new_reminder'
                ? 'bg-zinc-900 text-amber-400 border-zinc-800 border-b-transparent'
                : 'text-zinc-400 hover:text-zinc-200 border-transparent'
            }`}
          >
            + Set Reminder
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-4">
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              {/* Browser Permission Status Card */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Browser Notifications
                    </span>
                  </div>
                  {notificationPermission === 'granted' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  ) : notificationPermission === 'denied' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
                      <AlertTriangle className="w-3 h-3" /> Blocked in Browser
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                      Permission Required
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  Enables desktop and mobile pop-up notifications when an exam, study session, or class is coming up.
                </p>

                {notificationPermission !== 'granted' && (
                  <button
                    onClick={handleEnablePermission}
                    disabled={isRequestingPermission}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {isRequestingPermission ? 'Requesting...' : 'Enable Push Notifications'}
                  </button>
                )}
              </div>

              {/* Timing & Lead Time */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/70 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Notify Me Before Event Starts:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 30].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => handleUpdateNotif({ notifyBeforeMinutes: mins })}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        notifSettings.notifyBeforeMinutes === mins
                          ? 'bg-amber-400 text-zinc-950 border-amber-400 shadow-md shadow-amber-400/20'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      {mins} mins
                    </button>
                  ))}
                </div>
              </div>

              {/* Alert Channels & Options */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/70 space-y-3">
                <span className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Notification Channels:
                </span>

                <div className="space-y-2.5">
                  <label className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60 cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <Volume2 className="w-4 h-4 text-amber-400" />
                      <div>
                        <p className="text-xs font-bold text-white">Chime Sound Alert</p>
                        <p className="text-[10px] text-zinc-400">Play crisp double-tone chime</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifSettings.soundAlert !== false}
                      onChange={(e) => handleUpdateNotif({ soundAlert: e.target.checked })}
                      className="rounded bg-zinc-800 border-zinc-700 text-amber-500 focus:ring-0 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60 cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <div>
                        <p className="text-xs font-bold text-white">JARVIS Voice Announcement</p>
                        <p className="text-[10px] text-zinc-400">Read out event details clearly</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifSettings.voiceAnnounce !== false}
                      onChange={(e) => handleUpdateNotif({ voiceAnnounce: e.target.checked })}
                      className="rounded bg-zinc-800 border-zinc-700 text-cyan-500 focus:ring-0 w-4 h-4"
                    />
                  </label>
                </div>
              </div>

              {/* Test Button */}
              <button
                type="button"
                onClick={testEventNotification}
                className="w-full py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] border border-zinc-700 text-zinc-100 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:border-amber-400/50"
              >
                <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
                Send Test Event Notification Now
              </button>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400 pb-1">
                <span>Events & Deadlines for Today ({todayStr})</span>
                <span className="font-mono">{todayEvents.length + activeReminders.length} Scheduled</span>
              </div>

              {todayEvents.length === 0 && activeReminders.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-zinc-800 rounded-xl space-y-2">
                  <Calendar className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="text-xs text-zinc-400">No events or reminders set for today.</p>
                  <p className="text-[11px] text-zinc-500">
                    Add an event in the Calendar or set a reminder using the tab above.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: ev.color || '#6366f1' }}
                        />
                        <div>
                          <p className="text-xs font-bold text-white">{ev.title}</p>
                          <p className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            {formatTimeDisplay(ev.startTime)} - {formatTimeDisplay(ev.endTime)}
                            <span className="text-zinc-600">•</span>
                            <span className="uppercase">{ev.category}</span>
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shrink-0 font-mono">
                        Alert Active
                      </span>
                    </div>
                  ))}

                  {activeReminders.map((rem) => (
                    <div
                      key={rem.id}
                      className="p-3 rounded-xl bg-zinc-950 border border-amber-500/30 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <Bell className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-white">{rem.title}</p>
                          <p className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            {rem.time || '18:00'}
                            <span className="text-zinc-600">•</span>
                            <span>{rem.category}</span>
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteReminder(rem.id)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                        title="Delete reminder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'new_reminder' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Reminder Text *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. IB Physics Formula Revision, submit Chemistry IA"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" /> Time
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-zinc-400" /> Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="Homework">📚 Homework</option>
                    <option value="Test">📝 Test / Exam</option>
                    <option value="Project">📄 Project / IA</option>
                    <option value="Study Session">⏱️ Study Session</option>
                    <option value="Personal">🏃 Personal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Flag className="w-3.5 h-3.5 text-zinc-400" /> Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Create Reminder
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
