import { format } from 'date-fns';
import { MonoTypeOperatorFunction } from 'rxjs/internal/types';
import { filter } from 'rxjs/operators';
import * as fs from 'fs';

export function ofTopicEquals(topicName: string): MonoTypeOperatorFunction<[string, string]> {
  return filter(([topic, message]) => topic === topicName);
}

export function log(logMessage: string): void {
  console.log(`${format(new Date(), 'dd.MM.yyyy HH:mm:ss.SSS')}: ${logMessage}`);
}

export function isDocker(): boolean {
  return hasDockerEnv() || hasDockerCGroup();
}

function hasDockerEnv() {
  try {
    fs.statSync('/.dockerenv');
    return true;
  } catch (err) {
    return false;
  }
}

function hasDockerCGroup() {
  try {
    return fs.readFileSync('/proc/self/cgroup', 'utf8').includes('docker');
  } catch (err) {
    return false;
  }
}
