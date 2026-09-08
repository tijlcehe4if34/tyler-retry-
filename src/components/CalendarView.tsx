import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CalendarEvent, Task } from '../types';
import {
  getMonthCalendarDays,
  getWeekDays,
  formatDateToISO,
  formatNiceDate,
  formatTimeDisplay,
  getTodayString,
  addDays,
} from '../lib/dateUtils';
import { EventModal } from './modals/EventModal';
import { TaskModal } from './modals/TaskModal';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flag,
  BookOpen,
  Bell,
} from 'lucide-react';

type CalendarViewMode = 'month' | 'week' | 'day';

export const CalendarView: React.FC = () => {
  const { state, toggleTaskComplete } = useApp();

  const [viewMode, setViewMode] = useState<CalendarViewMode>(
    state.settings.calendar.defaultView || 'month'
  );
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(getTodayString());

  // Modals
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalDate, setModalDate] = useState<string>(getTodayString());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const todayStr = getTodayString();

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
      setSelectedDateStr(formatDateToISO(d));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
      setSelectedDateStr(formatDateToISO(d));
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(formatDateToISO(today));
  };

  // Calendar days generators
  const monthDays = getMonthCalendarDays(year, month);
  const weekDays = getWeekDays(currentDate);

  // Helper to get events & tasks for any date
  const getItemsForDate = (dateStr: string) => {
    const events = state.events.filter((e) => e.date === dateStr);
    const tasks = state.tasks.filter((t) => t.dueDate === dateStr);
    return { events, tasks };
  };

  const openNewEventModal = (dateStr: string) => {
    setModalDate(dateStr);
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  const openNewTaskModal = (dateStr: string) => {
    setModalDate(dateStr);
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Calendar Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl sm:rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {viewMode === 'day' ? formatNiceDate(selectedDateStr, true) : monthName}
              </h2>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                <Bell className="w-3 h-3" /> Event Alerts Active
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Interactive timeline with synchronized events & due tasks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Buttons */}
          <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            {(['month', 'week', 'day'] as CalendarViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                  viewMode === mode
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-2 text-xs font-bold text-zinc-300 hover:text-white rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Add Event Button */}
          <button
            onClick={() => openNewEventModal(selectedDateStr || todayStr)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <div className="min-w-[540px] sm:min-w-0">
              {/* Day of week headers */}
              <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-950/60 text-center py-2.5">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <span key={d} className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
                    {d}
                  </span>
                ))}
              </div>

              {/* Month Days Grid */}
              <div className="grid grid-cols-7 divide-x divide-y divide-zinc-800/80">
            {monthDays.map((day, idx) => {
              const { events, tasks } = getItemsForDate(day.dateString);
              const isSelected = day.dateString === selectedDateStr;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDateStr(day.dateString)}
                  className={`min-h-[110px] sm:min-h-[130px] p-2 sm:p-2.5 transition-colors group flex flex-col justify-between ${
                    !day.isCurrentMonth
                      ? 'bg-zinc-950/30 text-zinc-600'
                      : isSelected
                      ? 'bg-indigo-950/20'
                      : 'bg-zinc-900/40 hover:bg-zinc-800/40'
                  }`}
                >
                  <div>
                    {/* Date header with quick add */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center font-mono ${
                          day.isToday
                            ? 'bg-indigo-600 text-white font-black ring-2 ring-indigo-400/40'
                            : day.isCurrentMonth
                            ? 'text-zinc-200'
                            : 'text-zinc-600'
                        }`}
                      >
                        {day.dayNumber}
                      </span>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openNewEventModal(day.dateString);
                          }}
                          className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800"
                          title="Add Event on this date"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Events list */}
                    <div className="space-y-1">
                      {events.slice(0, 2).map((evt) => (
                        <div
                          key={evt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingEvent(evt);
                            setIsEventModalOpen(true);
                          }}
                          className="px-1.5 py-0.5 text-[10px] font-semibold rounded-md truncate cursor-pointer transition-all hover:brightness-110 flex items-center gap-1"
                          style={{
                            backgroundColor: `${evt.color || '#6366f1'}25`,
                            color: evt.color || '#6366f1',
                            border: `1px solid ${evt.color || '#6366f1'}40`,
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: evt.color || '#6366f1' }} />
                          <span className="truncate">{evt.title}</span>
                        </div>
                      ))}

                      {/* Tasks due */}
                      {tasks.slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTask(task);
                            setIsTaskModalOpen(true);
                          }}
                          className={`px-1.5 py-0.5 text-[10px] font-medium rounded-md truncate cursor-pointer flex items-center gap-1 border ${
                            task.completed
                              ? 'bg-zinc-950/60 border-zinc-800 text-zinc-500 line-through'
                              : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300'
                          }`}
                        >
                          <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{task.title}</span>
                        </div>
                      ))}

                      {events.length + tasks.length > 4 && (
                        <span className="text-[9px] text-zinc-500 font-mono block pl-1">
                          +{events.length + tasks.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <div className="min-w-[680px] sm:min-w-0">
              <div className="grid grid-cols-7 divide-x divide-zinc-800">
            {weekDays.map((day) => {
              const { events, tasks } = getItemsForDate(day.dateString);
              return (
                <div key={day.dateString} className="min-h-[450px] p-3 flex flex-col justify-between bg-zinc-900/40">
                  <div className="space-y-3">
                    {/* Header */}
                    <div
                      className={`text-center p-2 rounded-xl border ${
                        day.isToday
                          ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <p className="text-[11px] font-bold uppercase">{day.date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                      <p className="text-lg font-black text-white font-mono">{day.dayNumber}</p>
                    </div>

                    {/* Quick Add on Day */}
                    <button
                      onClick={() => openNewEventModal(day.dateString)}
                      className="w-full py-1 text-[11px] font-semibold text-zinc-400 hover:text-white bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg flex items-center justify-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Add Event
                    </button>

                    {/* Events Section */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Events ({events.length})</p>
                      {events.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={() => {
                            setEditingEvent(evt);
                            setIsEventModalOpen(true);
                          }}
                          className="p-2.5 rounded-xl border cursor-pointer hover:scale-[1.02] transition-all"
                          style={{
                            backgroundColor: `${evt.color || '#6366f1'}15`,
                            borderColor: `${evt.color || '#6366f1'}40`,
                          }}
                        >
                          <p className="text-xs font-bold text-white truncate">{evt.title}</p>
                          <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                            {formatTimeDisplay(evt.startTime)} - {formatTimeDisplay(evt.endTime)}
                          </p>
                          {evt.description && (
                            <p className="text-[10px] text-zinc-400 line-clamp-1 mt-1">{evt.description}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Tasks Due Section */}
                    <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                      <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Tasks Due ({tasks.length})</p>
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => {
                            setEditingTask(task);
                            setIsTaskModalOpen(true);
                          }}
                          className={`p-2 rounded-xl border cursor-pointer flex items-center justify-between gap-1.5 ${
                            task.completed
                              ? 'bg-zinc-950 border-zinc-800/60 opacity-60'
                              : 'bg-zinc-950 border-zinc-800 hover:border-indigo-500/40'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTaskComplete(task.id);
                              }}
                              className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                                task.completed ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-zinc-700'
                              }`}
                            >
                              {task.completed && <CheckCircle2 className="w-2.5 h-2.5" />}
                            </button>
                            <span className={`text-[11px] truncate ${task.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                              {task.title}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono font-bold text-amber-400">+{task.xpReward}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DAY VIEW */}
      {viewMode === 'day' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Day's Events (Left 8 cols) */}
          <div className="lg:col-span-8 p-6 bg-zinc-900/90 border border-zinc-800 rounded-3xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Events for {formatNiceDate(selectedDateStr, true)}</h3>
                <p className="text-xs text-zinc-400">Schedule & timetable for IB school day</p>
              </div>
              <button
                onClick={() => openNewEventModal(selectedDateStr)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Event
              </button>
            </div>

            {getItemsForDate(selectedDateStr).events.length === 0 ? (
              <div className="p-8 text-center bg-zinc-950 border border-zinc-800 rounded-2xl">
                <p className="text-sm text-zinc-400">No events scheduled for this day.</p>
                <button
                  onClick={() => openNewEventModal(selectedDateStr)}
                  className="mt-3 text-xs text-indigo-400 hover:underline font-semibold"
                >
                  + Click here to schedule a test, IB assignment or event
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {getItemsForDate(selectedDateStr).events.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => {
                      setEditingEvent(evt);
                      setIsEventModalOpen(true);
                    }}
                    className="p-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-2xl cursor-pointer transition-all flex items-start gap-4"
                  >
                    <div className="w-3 h-12 rounded-full shrink-0" style={{ backgroundColor: evt.color || '#6366f1' }} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-bold text-white">{evt.title}</h4>
                        <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
                          {evt.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTimeDisplay(evt.startTime)} - {formatTimeDisplay(evt.endTime)}
                        </span>
                        {evt.priority === 'high' && (
                          <span className="text-rose-400 font-bold flex items-center gap-0.5">
                            <Flag className="w-3 h-3" /> High Priority
                          </span>
                        )}
                      </div>
                      {evt.description && (
                        <p className="text-xs text-zinc-400 mt-2 bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                          {evt.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Day's Tasks Due (Right 4 cols) */}
          <div className="lg:col-span-4 p-6 bg-zinc-900/90 border border-zinc-800 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">Tasks Due</h3>
              <button
                onClick={() => openNewTaskModal(selectedDateStr)}
                className="text-xs text-indigo-400 hover:underline font-bold"
              >
                + Add Task
              </button>
            </div>

            {getItemsForDate(selectedDateStr).tasks.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">No tasks due on this date.</p>
            ) : (
              <div className="space-y-2.5">
                {getItemsForDate(selectedDateStr).tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => {
                      setEditingTask(task);
                      setIsTaskModalOpen(true);
                    }}
                    className="p-3 bg-zinc-950 border border-zinc-800 hover:border-indigo-500/40 rounded-2xl cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTaskComplete(task.id);
                        }}
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          task.completed ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-zinc-700 bg-zinc-900'
                        }`}
                      >
                        {task.completed && <CheckCircle2 className="w-3 h-3" />}
                      </button>
                      <span className={`text-xs font-semibold truncate ${task.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                        {task.title}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400 shrink-0">+{task.xpReward} XP</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Event & Task Modals */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEditingEvent(null);
        }}
        eventToEdit={editingEvent}
        defaultDate={modalDate}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        taskToEdit={editingTask}
        defaultDate={modalDate}
      />
    </div>
  );
};
