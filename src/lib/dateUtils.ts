export function getTodayString(): string {
  const d = new Date();
  return formatDateToISO(d);
}

export function formatDateToISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function formatMinutes(mins: number): string {
  if (!mins || mins <= 0) return '0m';
  const hours = Math.floor(mins / 60);
  const remMins = Math.round(mins % 60);
  if (hours > 0 && remMins > 0) return `${hours}h ${remMins}m`;
  if (hours > 0) return `${hours}h`;
  return `${remMins}m`;
}

export function formatDurationHours(mins: number): string {
  const hours = (mins / 60).toFixed(1);
  return `${hours} hrs`;
}

export function getDayOfWeekName(dateStr: string, short = false): string {
  const d = parseISODate(dateStr);
  return d.toLocaleDateString('en-US', { weekday: short ? 'short' : 'long' });
}

export function formatNiceDate(dateStr: string, includeYear = false): string {
  if (!dateStr) return '';
  const d = parseISODate(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(includeYear ? { year: 'numeric' } : {}),
  });
}

export function formatTimeDisplay(timeStr?: string): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  const minStr = String(m || 0).padStart(2, '0');
  return `${hour12}:${minStr} ${ampm}`;
}

export interface CalendarDay {
  date: Date;
  dateString: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayOfWeek: number; // 0-6
}

export function getMonthCalendarDays(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const todayStr = getTodayString();

  const days: CalendarDay[] = [];
  const startDayOfWeek = firstDay.getDay(); // 0 is Sunday

  // Previous month padding
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(year, month, -i);
    const dateStr = formatDateToISO(prevDate);
    days.push({
      date: prevDate,
      dateString: dateStr,
      dayNumber: prevDate.getDate(),
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      dayOfWeek: prevDate.getDay(),
    });
  }

  // Current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const currDate = new Date(year, month, i);
    const dateStr = formatDateToISO(currDate);
    days.push({
      date: currDate,
      dateString: dateStr,
      dayNumber: i,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      dayOfWeek: currDate.getDay(),
    });
  }

  // Next month padding to fill complete grid of 35 or 42
  const totalSlots = days.length <= 35 ? 35 : 42;
  const remaining = totalSlots - days.length;
  for (let i = 1; i <= remaining; i++) {
    const nextDate = new Date(year, month + 1, i);
    const dateStr = formatDateToISO(nextDate);
    days.push({
      date: nextDate,
      dateString: dateStr,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      dayOfWeek: nextDate.getDay(),
    });
  }

  return days;
}

export function getWeekDays(referenceDate: Date): CalendarDay[] {
  const curr = new Date(referenceDate);
  const day = curr.getDay();
  const diff = curr.getDate() - day; // Adjust when day is Sunday
  const startOfWeek = new Date(curr.setDate(diff));
  const todayStr = getTodayString();

  const days: CalendarDay[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const dateStr = formatDateToISO(d);
    days.push({
      date: d,
      dateString: dateStr,
      dayNumber: d.getDate(),
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      dayOfWeek: d.getDay(),
    });
  }
  return days;
}

export function addDays(dateStr: string, days: number): string {
  const d = parseISODate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDateToISO(d);
}

export function getDaysDiff(dateStr1: string, dateStr2: string): number {
  const d1 = parseISODate(dateStr1).getTime();
  const d2 = parseISODate(dateStr2).getTime();
  return Math.round(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
}
