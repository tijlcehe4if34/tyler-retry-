// Browser Notification Manager & Event Alert System
import { CalendarEvent, Task } from '../types';
import { sound } from './sound';

export type NotificationPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

class NotificationManager {
  private notifiedEventWindows: Set<string> = new Set();
  private isChecking: boolean = false;

  public getPermissionStatus(): NotificationPermissionState {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission as NotificationPermissionState;
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        sound.playJarvisAcknowledge();
        this.sendBrowserNotification(
          'Tyler OS Notifications Active',
          'You will now receive timely alerts before your classes, exams, and homework deadlines!'
        );
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Error requesting notification permission:', err);
      return false;
    }
  }

  public sendBrowserNotification(
    title: string,
    body: string,
    tag?: string,
    url?: string
  ): boolean {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    if (Notification.permission !== 'granted') {
      return false;
    }

    try {
      const options: any = {
        body,
        icon: '/icon.png',
        badge: '/icon.png',
        tag: tag || 'tyler-os-notification',
        silent: false,
      };

      const notification = new Notification(title, options);

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return true;
    } catch (err) {
      console.warn('Failed to dispatch browser notification:', err);
      return false;
    }
  }

  /**
   * Evaluates calendar events and due tasks against current time
   * and triggers timely reminders (e.g. 15 mins before, 5 mins before, or starting now)
   */
  public checkUpcomingEvents(
    events: CalendarEvent[],
    tasks: Task[],
    options: {
      leadMinutes?: number;
      browserNotifications?: boolean;
      voiceAnnounce?: boolean;
      onTriggerAlert: (alert: {
        id: string;
        title: string;
        subtitle: string;
        type: 'upcoming_event' | 'event_now' | 'task_due';
        voiceMessage: string;
        item: CalendarEvent | Task;
      }) => void;
    }
  ) {
    if (this.isChecking) return;
    this.isChecking = true;

    try {
      const now = new Date();
      const todayYear = now.getFullYear();
      const todayMonth = String(now.getMonth() + 1).padStart(2, '0');
      const todayDay = String(now.getDate()).padStart(2, '0');
      const todayIso = `${todayYear}-${todayMonth}-${todayDay}`;

      const currentMinutesToday = now.getHours() * 60 + now.getMinutes();
      const leadTime = options.leadMinutes || 15;

      // Check Calendar Events
      events.forEach((event) => {
        if (event.date !== todayIso || !event.startTime) return;

        const [eventHourStr, eventMinStr] = event.startTime.split(':');
        const eventStartMinutes = parseInt(eventHourStr, 10) * 60 + parseInt(eventMinStr, 10);
        const minutesUntil = eventStartMinutes - currentMinutesToday;

        // Window 1: Imminent notice (e.g. 15 mins before or configured lead time)
        if (minutesUntil > 0 && minutesUntil <= leadTime) {
          const windowKey = `${event.id}_lead_${leadTime}`;
          if (!this.notifiedEventWindows.has(windowKey)) {
            this.notifiedEventWindows.add(windowKey);

            const displayTime = event.startTime;
            const subtitle = `Starts in ${minutesUntil} min${minutesUntil === 1 ? '' : 's'} (at ${displayTime})`;
            const voiceMessage = `Tyler, your event "${event.title}" starts in ${minutesUntil} minutes at ${displayTime}.`;

            if (options.browserNotifications) {
              this.sendBrowserNotification(
                `Upcoming: ${event.title}`,
                subtitle,
                `event_${event.id}`
              );
            }

            options.onTriggerAlert({
              id: windowKey,
              title: `Upcoming Event: ${event.title}`,
              subtitle,
              type: 'upcoming_event',
              voiceMessage,
              item: event,
            });
          }
        }

        // Window 2: Starting now (0 to 1 min)
        if (minutesUntil === 0) {
          const nowKey = `${event.id}_starting_now`;
          if (!this.notifiedEventWindows.has(nowKey)) {
            this.notifiedEventWindows.add(nowKey);

            const subtitle = `Starting now at ${event.startTime}`;
            const voiceMessage = `Tyler, your event "${event.title}" is starting now.`;

            if (options.browserNotifications) {
              this.sendBrowserNotification(
                `Starting Now: ${event.title}`,
                subtitle,
                `event_${event.id}_now`
              );
            }

            options.onTriggerAlert({
              id: nowKey,
              title: `Event Starting Now: ${event.title}`,
              subtitle,
              type: 'event_now',
              voiceMessage,
              item: event,
            });
          }
        }
      });

      // Check Tasks due with a specific time
      tasks.forEach((task) => {
        if (task.completed || task.dueDate !== todayIso) return;
        const taskTime = task.dueTime || task.time;
        if (!taskTime) return;

        const [tHour, tMin] = taskTime.split(':');
        const taskDueMinutes = parseInt(tHour, 10) * 60 + parseInt(tMin, 10);
        const minutesUntil = taskDueMinutes - currentMinutesToday;

        if (minutesUntil > 0 && minutesUntil <= leadTime) {
          const taskKey = `${task.id}_task_lead_${leadTime}`;
          if (!this.notifiedEventWindows.has(taskKey)) {
            this.notifiedEventWindows.add(taskKey);

            const subtitle = `Due in ${minutesUntil} minutes (at ${taskTime})`;
            const voiceMessage = `Attention Tyler: your task "${task.title}" is due in ${minutesUntil} minutes.`;

            if (options.browserNotifications) {
              this.sendBrowserNotification(
                `Task Due Soon: ${task.title}`,
                subtitle,
                `task_${task.id}`
              );
            }

            options.onTriggerAlert({
              id: taskKey,
              title: `Task Due Soon: ${task.title}`,
              subtitle,
              type: 'task_due',
              voiceMessage,
              item: task,
            });
          }
        }
      });
    } finally {
      this.isChecking = false;
    }
  }

  // Clear cache if needed (e.g. testing)
  public clearNotificationCache() {
    this.notifiedEventWindows.clear();
  }
}

export const notificationManager = new NotificationManager();
