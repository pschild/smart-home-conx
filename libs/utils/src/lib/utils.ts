import { format } from 'date-fns';
import { MonoTypeOperatorFunction } from 'rxjs/internal/types';
import { filter } from 'rxjs/operators';
import * as fs from 'fs';
import { Request } from 'express';

export function ofTopicEquals(topicName: string): MonoTypeOperatorFunction<[string, string]> {
  return filter(([topic, message]) => topic === topicName);
}

export function log(logMessage: string): void {
  console.log(`${format(new Date(), 'dd.MM.yyyy HH:mm:ss.SSS')}: ${logMessage}`);
}

export function isAuthorized(request: Request): boolean {
  console.log('checking authorization...');
  return true;
  // const authToken = request.header('Authorization');
  // if (!authToken) {
  //   return false;
  // }
  // const authTokenWithoutPrefix = authToken.replace(/^Basic /, '');
  // const authTokenFromServerEnvironment = Buffer.from(`${process.env.SERVICE_USER}:${process.env.SERVICE_PASSWORD}`).toString('base64');
  // return authTokenWithoutPrefix === authTokenFromServerEnvironment;
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
