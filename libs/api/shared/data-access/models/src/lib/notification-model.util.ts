import { addMinutes } from 'date-fns';
import { Priority } from '..';
import { NotificationModel } from './notification.model';

// values in minutes
const DEFAULT_HIGH_PRIO_EXPIRATION = 7 * 24 * 60;
const DEFAULT_MEDIUM_PRIO_EXPIRATION = 24 * 60;
const DEFAULT_LOW_PRIO_EXPIRATION = 60;
const DEFAULT_SHORT_EXPIRATION = 5;

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace NotificationModelUtil {

  export function create(context: string, title: string, message: string, priority?: Priority, autoRemoveAfter?: Date): Partial<NotificationModel> {
    return { context, title, message, priority: priority || Priority.HIGH, autoRemoveAfter };
  }

  export function createSticky(context: string, title: string, message: string, priority?: Priority): Partial<NotificationModel> {
    return { context, title, message, priority: priority || Priority.HIGH };
  }

  export function createHighPriority(context: string, title: string, message: string, autoRemoveAfter?: Date): Partial<NotificationModel> {
    return {
      context,
      title,
      message,
      priority: Priority.HIGH,
      autoRemoveAfter: autoRemoveAfter || addMinutes(new Date(), DEFAULT_HIGH_PRIO_EXPIRATION)
    };
  }

  export function createMediumPriority(context: string, title: string, message: string, autoRemoveAfter?: Date): Partial<NotificationModel> {
    return {
      context,
      title,
      message,
      priority: Priority.MEDIUM,
      autoRemoveAfter: autoRemoveAfter || addMinutes(new Date(), DEFAULT_MEDIUM_PRIO_EXPIRATION)
    };
  }

  export function createLowPriority(context: string, title: string, message: string, autoRemoveAfter?: Date): Partial<NotificationModel> {
    return {
      context,
      title,
      message,
      priority: Priority.LOW,
      autoRemoveAfter: autoRemoveAfter || addMinutes(new Date(), DEFAULT_LOW_PRIO_EXPIRATION)
    };
  }

  export function createShort(context: string, title: string, message: string, autoRemoveAfter?: Date): Partial<NotificationModel> {
    return {
      context,
      title,
      message,
      priority: Priority.LOW,
      autoRemoveAfter: autoRemoveAfter || addMinutes(new Date(), DEFAULT_SHORT_EXPIRATION)
    };
  }

}
