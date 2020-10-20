import { format } from 'date-fns';
import { MonoTypeOperatorFunction } from 'rxjs/internal/types';
import { filter } from 'rxjs/operators';

export function ofTopicEquals(topicName: string): MonoTypeOperatorFunction<[string, string]> {
  return filter(([topic, message]) => topic === topicName);
}

export function log(logMessage: string): void {
  console.log(`${format(new Date(), 'dd.MM.yyyy HH:mm:ss.SSS')}: ${logMessage}`);
}
