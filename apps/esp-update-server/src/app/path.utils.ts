import { isDocker } from '@smart-home-conx/utils';
import { environment } from '../environments/environment';

export function getEspBinaryPath(): string {
  const prefix = isDocker() ? '' : '.';
  return `${prefix}${environment.espBinaryDir}`;
}

export function getPathToEspLib(libName: string): string {
  const prefix = isDocker() ? '' : '.';
  return `${prefix}${environment.espProjectsDir}/${libName}`;
}
