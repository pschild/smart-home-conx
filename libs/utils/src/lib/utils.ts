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
  const authToken = request.header('Authorization');
  if (!authToken) {
    return false;
  }
  const authTokenWithoutPrefix = authToken.replace(/^Basic /, '');
  const authTokenFromServerEnvironment = Buffer.from(`${process.env.SERVICE_USER}:${process.env.SERVICE_PASSWORD}`).toString('base64');
  return authTokenWithoutPrefix === authTokenFromServerEnvironment;
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

// TODO: retrieve via http call and make configurable
export interface EspConfig {
  id: number;
  model: string;
  description?: string;
  pioEnv: string;
  chipId: number;
}

export const ESP_CONFIG: EspConfig[] = [
  { id: 1, model: 'ESP-12F', description: 'Bewegungsmelder AM312, Schlafzimmer', pioEnv: 'esp12e', chipId: 3357047 },
  { id: 2, model: 'ESP-12F', description: 'nicht verbaut', pioEnv: 'esp12e', chipId: 7888034 },
  { id: 3, model: 'ESP-12F', description: 'nicht verbaut', pioEnv: 'esp12e', chipId: 3356673 },
  { id: 4, model: 'ESP-12F', description: 'nicht verbaut', pioEnv: 'esp12e', chipId: 3356430 },
  { id: 5, model: 'ESP-01', description: 'nicht verbaut', pioEnv: 'esp01_1m', chipId: 226047 },
  { id: 6, model: 'NodeMCU', description: 'OTA Test', pioEnv: 'nodemcuv2', chipId: 750287 }
];
