import { isDocker } from '@smart-home-conx/utils';

const prefix = isDocker() ? '' : '.';

export const environment = {
  production: true,
  espProjectsDir: `${prefix}/esp-projects`,
  espBinaryDir: `${prefix}/esp-binaries`
};
