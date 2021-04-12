import { isDocker } from '@smart-home-conx/utils';

const prefix = isDocker() ? '' : '.';

export const environment = {
  production: false,
  espProjectsDir: `${prefix}/esp-projects`,
  espBinaryDir: `${prefix}/esp-binaries`
};
