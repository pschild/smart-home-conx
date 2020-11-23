import * as path from 'path';
import { promises as fsPromises } from 'fs';
import { log } from '@smart-home-conx/utils';
import { getEspBinaryPath } from './path.utils';

export const findBinaryForUpdate = async (chipId: string): Promise<string | undefined> => {
  const chipFolderPath = path.resolve(getEspBinaryPath(), chipId);
  try {
    const binFilesInDirectory = (await fsPromises.readdir(chipFolderPath)).filter(fileName => fileName.match(/\.bin$/));
    if (!binFilesInDirectory || !binFilesInDirectory.length) {
      log(`\tNo bin files found in ${chipFolderPath}`);
      return;
    }
    if (binFilesInDirectory.length > 1) {
      log(`\tMore than 1 *.bin file found in ${chipFolderPath}: ${binFilesInDirectory}`);
      return;
    }
    return path.resolve(chipFolderPath, binFilesInDirectory[0]);
  } catch (err) {
    log(`\tError reading directory ${chipFolderPath}: ${err}`);
  }
};

export const originateFromEsp = headers => {
  return headers['user-agent']
  && headers['user-agent'] === 'ESP8266-http-Update'
  && headers['x-esp8266-chip-id'] // ex. 226047
  && headers['x-esp8266-sta-mac'] // ex. 4C:11:AE:03:72:FF
  && headers['x-esp8266-free-space'] // ex. 462848
  && headers['x-esp8266-sketch-size'] // ex. 301408
  && headers['x-esp8266-sketch-md5'] // ex. 18f8dc4ccb5bbb8b909a7ed1a8b5f173
  && headers['x-esp8266-chip-size'] // ex. 1048576
  && headers['x-esp8266-sdk-version'] // ex. 2.2.2-dev(38a443e)
  // && headers['x-esp8266-version'] // ex. esp-mqtt_v0.2.3
  ;
};
